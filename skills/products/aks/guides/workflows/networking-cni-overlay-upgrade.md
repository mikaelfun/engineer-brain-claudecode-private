# AKS CNI 与 Overlay 网络 — upgrade — 排查工作流

**来源草稿**: ado-wiki-a-OverlaymgrReconcileError-noisy-neighbouring.md, ado-wiki-a-OverlaymgrReconcileError-troubleshooting.md
**Kusto 引用**: auto-upgrade.md, scale-upgrade-operations.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: OverlaymgrReconcileError during AKS PUT operations caused by noisy neighbouring
> 来源: ado-wiki-a-OverlaymgrReconcileError-noisy-neighbouring.md | 适用: 适用范围未明确

### 排查步骤

#### OverlaymgrReconcileError during AKS PUT operations caused by noisy neighbouring


#### Issue Summary

This TSG describes how to troubleshoot the OverlaymgrReconcileError when it's caused by "noisy neighboring".

#### Error

When doing an operation (update/upgrade/etc...) against an AKS cluster, user receives an error like below. This one should also be visible in AKS QoS or ContextActivity logs.

`
ReconcileOverlay failed. error: Category: InternalError; Code: OverlaymgrReconcileError; SubCode: OverlayMgrAPIRequestFailed; Message: Internal server error; InnerMessage: ; Dependency: ; AKSTeam: ; OriginalError: context deadline exceeded
`

#### Investigation

The first step consists in checking the AKS ContextActivity logs for the given operations. You can use ASI or Kusto for that. Sample query:

```text
union cluster("Aks").database("AKSprod").FrontEndContextActivity , cluster("Aks").database("AKSprod").AsyncContextActivity //| summarize min(PreciseTimeStamp)
| where PreciseTimeStamp >= datetime(2024-10-23 13:01:00) and PreciseTimeStamp <= datetime(2024-11-30 21:20:59)
| project PreciseTimeStamp, operationID, level, msg,  traceId, SourceNamespace, fileName, lineNumber,correlationID, PanicFileName, PanicFunctionName, PanicLineNumber, PanicStackHash, source, SourceVersion,subscriptionID, resourceName, serviceBuild
| where operationID =="0849370b-d8d5-4f6f-b4a0-15c591f4fa00" or operationID=="dd4bf9ee-713e-40a5-a631-b812a66e53be"
// | where level <> 'info'
```

Then you can have a look at the OverlayMgrEvents table and see if there are "failed to annotateReleaseInfo" errors:

```text
union cluster("Aks").database("AKSprod").OverlaymgrEvents
| where PreciseTimeStamp >= datetime(2024-11-21 13:01:00) and PreciseTimeStamp <= datetime(2024-11-23 21:20:59)
| project PreciseTimeStamp, operationID, level, msg,   SourceNamespace, fileName, lineNumber,correlationID, PanicFileName, PanicFunctionName, PanicLineNumber, PanicStackHash, source, SourceVersion,subscriptionID, resourceName, serviceBuild//
| where operationID =="0849370b-d8d5-4f6f-b4a0-15c591f4fa00" or operationID=="dd4bf9ee-713e-40a5-a631-b812a66e53be" or operationID =="450e27e4-6ebc-4a75-b70b-67f4977f49a1" or operationID =="a39cc950-429b-4e39-9548-325a868027f5"
//| where level <> 'info'
| where msg contains "failed to annotateReleaseInfo"
```

![Failed to annotateReleaseInfo in the OverlaymgrEvents table](/.attachments/OverlaymgrReconcileError_1.jpg)

And we can also verify how many times the given cluster faced that OverlaymgrReconcileError. Note that there are internal retries, so it's expected to see multiple errors for a given operation.

```text
let oids=
database("AKSprod").OverlaymgrApiQos
| where PreciseTimeStamp between (datetime("2024-11-21") .. datetime("2024-11-24"))
| where ccpID contains "636371fcd8a22f000170860e"
| where UnderlayName == "hcp-underlay-centralus-cx-264"
| project PreciseTimeStamp, operationID, requestID, resultType, operationName, ccpID
| distinct operationID;
database("AKSprod").AsyncQoSEvents
| where PreciseTimeStamp between (datetime("2024-11-21") .. datetime("2024-11-24"))
| where operationID in (oids)
| project PreciseTimeStamp, subscriptionID, resourceGroupName, resourceName, operationName, suboperationName, resultType, resultCode, errorDetails
```

From here, we can have a look at the CPU usage for the "overlaymanager" pods. Below is a CPU consumption of ~60% which is considered high.

```text
cluster('akshubb.westus3.kusto.windows.net').database('AKSinfra').ProcessInfo
| where PreciseTimeStamp between (datetime("2024-11-20T22:01:35.0575495Z") .. datetime("2024-11-24T13:01:35.0575495Z"))
| where UnderlayName == "hcp-underlay-centralus-cx-264"
| where PodName startswith "overlaymgr-overlaymanager-"
| where PodContainerName == "overlaymanager"
| summarize max(CPUUtil) by bin(PreciseTimeStamp, 1h)
| render timechart
```

![CPU consumption for OverlayManager pods](/.attachments/OverlaymgrReconcileError_2.jpg)

So... what's consuming all that CPU? Then we can have a look at what the OverlayManager is doing. The query below shows similar "ReconcileOverlayError" in the CentralUS region - and the count of operations for each CCP (one CCP = one AKS cluster). Notice that we're also displaying in which Underlay they are.

```text
cluster("Aks").database("AKSprod").OverlaymgrApiQos
| where PreciseTimeStamp between (datetime("2024-11-21") .. datetime("2024-11-24"))
| where RPTenant == "centralus"
| where operationName == "ReconcileOverlayHandler.POST"
| where resultCode contains "ReconcileOverlayError"
| project PreciseTimeStamp,operationID, operationName, resultType, resultCode, resultSubCode, errorDetails, ccpID, cxUnderlayName, UnderlayName, Underlay
| summarize count() by ccpID, UnderlayName
```

![number of errors per CCP and per underlay](/.attachments/OverlaymgrReconcileError_3.jpg)

So in the results above, we can see that our CCP "636371fcd8a22f000170860e" faced 22 errors. It's in Underlay "hcp-underlay-centralus-cx-264".

Note that in the same underlay, there's another AKS cluster (CCP 673efef7f16b930001e9c9f8) which faced ~63764 errors during the same timeframe. This other AKS cluster is certainly hammering the underlay host nodes and their OverlayManager pods...

From Now, the best is to have a look at Azure Service Insights (ASI) and search for this other CCPNamespace. You'll certainly find that it belongs to another Subscription / another customer, and you can search for what this other cluster is doing, with eg. a query like below:

```text
let querySubscriptionId = "25b174eb-e281-4183-8906-89037a996460";
let queryResourceGroupName = "apm1010973-slvr-dlxz-01-rg";
let queryResourceName = "aks-pilot-spoke";
let queryFrom = datetime("2024-11-22 00:00:00");
let queryTo = datetime("2024-11-22 01:59:59");
cluster("Aks").database("AKSprod").FrontEndQoSEvents
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where subscriptionID == querySubscriptionId
| where resourceGroupName == queryResourceGroupName
| where resourceName == queryResourceName
| where operationName !has "GET"
| where httpMethod !has "GET"
| project logPreciseTime, operationName, suboperationName, resultCode, errorDetails, httpStatus, httpMethod, resourceName, agentPoolName, correlationID, operationID, clientApplicationID, userAgent, clientPrincipalName, latency, region, propertiesBag, log, resourceGroupName, targetURI, subscriptionID
| extend p = todynamic(propertiesBag)
| extend K8sGoalVersion = tostring(p.k8sGoalVersion)
| order by logPreciseTime asc
```

![operations from the other CCP Namespace - likely DiagnosticsSettings](/.attachments/OverlaymgrReconcileError_4.jpg)

So we can confirm that this other AKS cluster is triggering A LOT of "LinkedNotificationHandler.POST"  (+2600 in 2 hours) and this is overloading the OverlayManager pods and our underlay "hcp-underlay-centralus-cx-264".

#### Mitigation Steps

In the few CRIs we've seen, it's been confirmed that there was one other customer creating AKS clusters with incorrect Diagnostics Settings causing all these "LinkedNotificationHandler.POST" operations.

Our AKS PG decided to get in touch with this specific customer to better understand what they were doing, and that customer deleted the offending clusters. After an operation on your customer's cluster (eg. Reconcile), this should be immediately mitigated.

Another mitigation could be to migrate your customer's cluster to a different underlay - so that it's not impacted anymore. This require an approval from customer as it will cause a minor downtime given all CCP pods will be restarted. And it will require an IcM to AKS PG.

#### References

Sample CRIs: [570099514](https://portal.microsofticm.com/imp/v5/incidents/details/570099514/summary) / [572815754](https://portal.microsofticm.com/imp/v5/incidents/details/572815754/summary) / [561899777](https://portal.microsofticm.com/imp/v5/incidents/details/561899777/summary) / [566423883](https://portal.microsofticm.com/imp/v5/incidents/details/566423883/summary)

Also the [Emerging Issue 85749: #emergingissue #aks OverlaymgrReconcileError / ReconcileOverlayError in EastUS](https://supportability.visualstudio.com/AzureContainers/_workitems/edit/85749)

Generic guidance on troubleshooting the OverlaymgrReconcileError error - [AKS CRUD operation failing with OverlaymgrReconcileError](/Azure-Kubernetes-Service-Wiki/AKS/TSG/CRUD/AKS-CRUD-operation-failing-with-OverlaymgrReconcileError.md)

#### Owner and Contributors

**Owner:** Rory Lenertz <rorylen@microsoft.com>

**Contributors:**

- Joao Tavares <Joao.Tavares@microsoft.com>
- Axel Guerrier <Axel.Guerrier@microsoft.com>

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-a-OverlaymgrReconcileError-troubleshooting.md | 适用: 适用范围未明确

### 排查步骤

##### 1. Identify which Overlay component is not reaching succeeded state

Using the AKS operation ID run the following Kusto query to view all Overlay Manager events:

```kql
cluster("Aks").database("AKSprod").OverlaymgrEvents
| where PreciseTimeStamp > ago(1d)
| where operationID == "<AKS_OPERATION_ID>"
| project PreciseTimeStamp, level, msg
```

Look for the final message indicating timeout and repeated references to the failing component.

##### 2. Troubleshoot failures in CCP pods

If the failed pod is running in the CCP:

#### 2.1 Check CCP pod status
Use Jarvis action: [CustomerControlPlane - Get status](https://portal.microsoftgeneva.com/17DC7749)
Or check ASC: `Managed Cluster -> Control Plane -> Status -> Pod Status`

#### 2.2 Describe failed CCP pods
Use Jarvis action: [CustomerControlPlane - Describe pods](https://portal.microsoftgeneva.com/ACD915BD)
Check pod last state (e.g., OOMKilled).

#### 2.3 Check CCP pod logs
Use Jarvis action: [CustomerControlPlane - Get pod log](https://portal.microsoftgeneva.com/52DE24BC)

Or query Kusto directly:
```kql
union cluster("akshuba.centralus").database("AKSccplogs").ControlPlaneEvents, cluster("akshuba.centralus").database("AKSccplogs").ControlPlaneEventsNonShoebox
| where PreciseTimeStamp > ago(1d)
| where ccpNamespace == "<CCP_NAMESPACE>"
| extend pod = parse_json(properties).pod
| extend log = parse_json(properties).log
| extend container = category
| where pod == "<POD_NAME>"
| where container == "<CONTAINER_NAME>"
| project PreciseTimeStamp, pod, container, log
```

##### 3. Troubleshoot failures in customer facing pods (kube-system)

#### 3.1 Check pod status
Use Jarvis action: [CustomerCluster - Run kubectl command](https://portal.microsoftgeneva.com/280757F5)

#### 3.2 Describe pods
Use Jarvis action: [CustomerCluster - Run kubectl describe](https://portal.microsoftgeneva.com/ED21B5C9)

#### 3.3 Check pod logs
Use Jarvis action: [CustomerCluster - Get pods log](https://portal.microsoftgeneva.com/CD802902)

If logs are missing, use Inspect IaaS Disk report on the VMSS instance in ASC, or request logs from customer.

##### 4. Troubleshoot failures in components managed by ENO

Check ENO events:
```kql
cluster('akshubb.westus3').database('AKSprod').EnoEvents
| where PreciseTimeStamp between (datetime(2025-09-11T00:00:00Z) .. datetime(2025-09-12T00:00:00))
| where compositionNamespace =~ '<NAMESPACE_ID>'
| where msg =~ 'failed to reconcile resource'
| project PreciseTimeStamp, controller, compositionName, compositionGeneration, resourceKind, resourceNamespace, resourceName, msg, error, stacktrace
```

##### 5. Known Scenarios

| Symptom | Reference ICM | TSG |
| --------| ------------- | --- |
| API server OOMKills | 639463200 | CCP-APIServerOOMKilled-Investigation |
| Outage in underlay node | 624098805 | N/A |
| CSI Azure File Controller missing permissions | 644118792 | N/A |
| Kyverno webhook failures | 629053223 | OverlaymgrReconcileError caused by Kyverno webhook failures |
| Missing KMS keyvault permissions | 624141051 | N/A |
| Bad KMS configuration | 595832066 | N/A |
| Noisy neighbouring / annotateReleaseInfo errors | 566423883 | OverlaymgrReconcileError caused by noisy neighbouring |
| Multiple CCP component OOMKills | 606966997 | N/A |
| Transient AKS infra issue | 626790307 | N/A |

---

## 附录: Kusto 诊断查询

### 来源: auto-upgrade.md

# 自动升级事件查询

## 用途

查询 AKS 自动升级器的事件，包括升级入队、执行情况、维护窗口匹配等。

---

## 查询 1: 查询自动升级事件

### 用途
查看自动升级的执行情况。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AutoUpgraderEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionID == "{subscription}"
| where msg !contains "Is upgrader running: true" and msg !contains "Is operation count cache running: true"
    and msg !contains "upgrader healthz returns: true" and msg !contains "auto-upgrade-operation-count-cache-sync-interval"
| project PreciseTimeStamp, level, msg, resourceName, resourceGroupName
| sort by PreciseTimeStamp desc
```

---

## 查询 2: 查询特定集群的升级事件

### 用途
查看特定集群的自动升级历史。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AutoUpgraderEvents
| where PreciseTimeStamp > ago(1d)
| where subscriptionID =~ '{subscription}'
| where resourceName has "{cluster}"
| project PreciseTimeStamp, level, msg
```

---

## 查询 3: 查询升级入队

### 用途
查看升级操作的入队情况。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').RegionalLooperEvents
| where PreciseTimeStamp > ago(1d)
| where msg contains "Enqueuing message" and msg has "{resourceURI}"
| project PreciseTimeStamp, msg, error, Environment
```

---

## 查询 4: 查询维护窗口配置操作

### 用途
查找维护窗口配置的创建和更新操作。

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').FrontEndQoSEvents
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where resourceGroupName == "{resourceGroup}"
| where resourceName == "{cluster}"
| where subscriptionID == "{subscription}"
| where operationName == "PutMaintenanceConfigurationHandler.PUT"
| project operationID, operationName, resultType, resultCode, resultSubCode
```

---

## 查询 5: 关联升级操作和 QoS 事件

### 用途
将自动升级事件与操作 QoS 事件关联，获取完整升级视图。

### 查询语句

```kql
let autoUpgradeTime =
    cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').AutoUpgraderEvents
    | where PreciseTimeStamp > ago(7d)
    | where subscriptionID == "{subscription}" and resourceName has "{cluster}"
    | where msg contains "upgrade"
    | summarize min(PreciseTimeStamp) by resourceName;
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').FrontEndQoSEvents
| where PreciseTimeStamp > ago(7d)
| where subscriptionID == "{subscription}" and resourceName == "{cluster}"
| where suboperationName == "Upgrading"
| project PreciseTimeStamp, correlationID, operationID, k8sCurrentVersion, k8sGoalVersion, result, resultCode
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| msg | 自动升级消息 |
| level | 日志级别 |
| Environment | 环境信息 |

## 注意事项

- 过滤健康检查消息可减少噪音
- 自动升级通常在维护窗口内执行
- 与 QoS 事件结合可获取升级结果

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

---

### 来源: scale-upgrade-operations.md

# Scale/Upgrade 操作查询

## 查询语句

### 查询 Scale/Upgrade 操作事件

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndContextActivity,
      cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AsyncContextActivity
| where subscriptionID == "{subscription}"
| where resourceName contains "{cluster}"
| where msg contains "intent" or msg contains "Upgrading" or msg contains "Successfully upgraded cluster" or msg contains "Operation succeeded" or msg contains "validateAndUpdateOrchestratorProfile"
| where PreciseTimeStamp > ago(1d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| project PreciseTimeStamp, operationID, correlationID, level, suboperationName, msg
| sort by PreciseTimeStamp desc
```

### 查询特定操作的错误消息

使用上一个查询获取的 operationID 深入追踪错误。

```kql
union cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndContextActivity,
      cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").AsyncContextActivity
| where operationID == "{operationId}"
| where level != "info"
| project PreciseTimeStamp, level, msg
| sort by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| operationID | 操作 ID，用于追踪单个操作 |
| correlationID | 关联 ID |
| level | 日志级别 (info/warning/error) |
| suboperationName | 子操作名称 |
| msg | 详细消息 |

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 通用操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照信息

---
