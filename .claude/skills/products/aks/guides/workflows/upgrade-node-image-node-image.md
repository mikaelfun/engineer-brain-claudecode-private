# AKS 节点镜像升级 — node-image — 排查工作流

**来源草稿**: ado-wiki-b-Who-triggered-auto-node-upgrade.md, ado-wiki-c-Upgrade-Undrainable-Node-Behavior-Cordon.md
**Kusto 引用**: auto-upgrade.md, image-integrity.md, node-fabric-info.md, scale-upgrade-operations.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-b-Who-triggered-auto-node-upgrade.md | 适用: 适用范围未明确

### 排查步骤

Please ask the customer the precise date and time when the issue happened. Then, check the CRUD operation around the time.

```sql
cluster('aks.kusto.windows.net').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where subscriptionID == "{subscriptionid}" and resourceName contains "{resourcename}"
| extend Count = parse_json(tostring(parse_json(propertiesBag).LinuxAgentsCount))
| project PreciseTimeStamp, insertionTime, logPreciseTime, correlationID, operationID, Count , operationName, suboperationName, agentPoolName ,result, errorDetails, resultCode,
  resultSubCode, k8sCurrentVersion, k8sGoalVersion, subscriptionID, resourceGroupName, resourceName, type=(parse_json(propertiesBag).agentpool_storage_profile_0),
  UnderlayName, hostMachine, Host, namespace, pod, container, region, fqdn
```

If there is a cluster upgrade operation around the time, that is the reason. Please identify who triggered it. You can use this TSG in IaaS Pod: [Identify Who Performed Operation](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496451/Identify-Who-Performed-Operation_Tool)

If there is a node image update (operationName = `UpgradeNodeImageAgentPoolHandler.POST`) and correlationId is not `"00000000-0000-0000-0000-000000000000"`, someone triggered the operation. You can use this TSG in IaaS Pod: [Identify Who Performed Operation](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496451/Identify-Who-Performed-Operation_Tool)

If the `UpgradeNodeImageAgentPoolHandler.POST` was triggered by correlationId `"00000000-0000-0000-0000-000000000000"`, that node upgrade must have been triggered by AKS platform. In almost all cases, auto upgrade configuration is set to the customer AKS cluster and that system triggers the node upgrade. You can confirm whether the auto upgrade option is set to the customer cluster following the below steps:

1. Show the AKS cluster details in ASI -> AKS -> Managed Cluster.
2. Select "Nodes" tab under timeline, where you can find "Auto Upgrade Profile".
3. In the tab, you will see the current auto upgrade settings. (Example: "node-image" is set.)

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-c-Upgrade-Undrainable-Node-Behavior-Cordon.md | 适用: 适用范围未明确

### 排查步骤

- Check if there's a `undrainableNodeBehavior` set on any of the agent pools, either via

```sh
$ az aks show --name clusterName --resource-group resourceGroupName
...
      "upgradeSettings": {
        "drainTimeoutInMinutes": null,
        "maxSurge": null,
        "undrainableNodeBehavior": "Cordon"
      },
...
```

or by checking the `AgentPoolSnapshot` table (this will also provide insight into whether the setting was recently changed):

```sql
// undrainableNodeBehavior 0: Unspecified, 1: Schedule, 2: Cordon
AgentPoolSnapshot
| where id == "/subscriptions/<subscriptionId>/resourcegroups/<rgName>/providers/Microsoft.ContainerService/managedClusters/<clusterName>/agentPools/<apName>"
| sort by TIMESTAMP desc
| take 10
| extend apProperties = parse_json(log)
| extend undrainableNodeBehavior = apProperties.upgradeSettings.undrainableNodeBehavior
| project TIMESTAMP, RPTenant, upgradeSettings, undrainableNodeBehavior
```

Even though customers choose undrainableNodeBehavior 'Cordon', if there are other errors(e.g. reimage error) expect PDB error happens during upgrade or upgrade is succeeded,
this 'Cordon' behavior will not be triggered. So we should still see the exact same behavior as current upgrade behavior 'Schedule', that means we should not see more that original nodes if upgrade successfully.

- For one upgrade operation, if a node pool is configured with undrainableNodeBehavior 'Cordon', and one of the nodes is blocked by PDB, we can use the following
Kusto query to check whether it is replaced by one surge node.

```sql
AsyncContextActivity
| where TIMESTAMP > ago(10d)
| where msg contains "in VMSS is cordoned, and one surged VM will be used to replace it"
```

It is expected that customers will have more nodes in the agentpool than the original node count if there is PDB error during upgrade with 'Cordon' behavior. For example, the agentpool has 2 nodes, and maxSurge is 2, during
upgrade, one node is upgraded successfully and the other node is blocked. In this case, after the upgrade is failed, customer's agentpool will have 3 nodes, one is blocked,
and the other 2 are upgraded nodes.

Accordingly, if cx use `Cordon` behavior for their upgrade, we can check whether they use `maxBlockedNodes` for their agentpool as following.

```sql
AgentPoolSnapshot
| where TIMESTAMP > ago(7d)
| extend apProperties = parse_json(log)
| extend maxBlockedNodes = apProperties.upgradeSettings.maxBlockedNodes
| where maxBlockedNodes != "" and maxBlockedNodes != "0"
| project TIMESTAMP, RPTenant, upgradeSettings, maxBlockedNodes
```

As mentioned in the above, if maxBlockedNodes > maxSurge, multiple batches of surge nodes are expected.

If cx would like to opt out from maxBlockedNodes

- If they still specifies Cordon, they need to set maxBlockedNodes as maxSurge
- If they want to specifies Schedule upgrade behavior, they need to set maxBlockedNodes as 0.

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

### 来源: image-integrity.md

# Image Integrity 功能查询

## 查询语句

### 查询 Image Integrity 启用操作

```kql
cluster("mcakshuba.chinaeast2.kusto.chinacloudapi.cn").database("AKSprod").FrontEndQoSEvents
//| where PreciseTimeStamp > ago(7d)
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where resourceGroupName contains "{resourceGroup}"
| where resourceName contains "{cluster}"
| where userAgent has "azure-resource-manager"
| where operationName == "PutManagedClusterHandler.PUT"
| where propertiesBag has "\"enableImageIntegrity\":\"true\""
| project PreciseTimeStamp, apiVersion, operationID, correlationID, resultCode, errorDetails, propertiesBag
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 操作追踪
- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照

---

### 来源: node-fabric-info.md

# 节点 Fabric 层信息查询

## 查询语句

### 通过 LogContainerSnapshot 获取节点底层信息

获取 AKS 节点的 NodeID、ContainerID、Fabric Host（Tenant）等信息，用于进一步 Fabric 层排查。

> ⚠️ Mooncake 集群: `azurecm.chinanorth2.kusto.chinacloudapi.cn`

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerSnapshot
| where PreciseTimeStamp >= ago(2d)
//| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| where roleInstanceName contains "{vmssInstanceName}"
| project PreciseTimeStamp, Fabric_Host=Tenant, Node_ID=nodeId, Container_ID=containerId
| top 1 by PreciseTimeStamp desc
```

### 通过 GuestAgentExtensionEvents 获取节点扩展日志

可获取已删除节点或 Spot 实例的日志。

> ⚠️ Mooncake 集群: `azcore.chinanorth3.kusto.chinacloudapi.cn`

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').GuestAgentExtensionEvents
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
//| where PreciseTimeStamp > ago(1d)
| where ContainerId == "{containerId}"
| project PreciseTimeStamp, Level, RoleInstanceName, ContainerId, Name, TaskName, Operation, OperationSuccess, Message
```

## 典型应用场景

1. **获取节点 Fabric 信息** - 从 VMSS 实例名获取 ContainerID/NodeID 用于 Fabric 层查询
2. **已删除节点日志** - Spot 实例被回收后仍可通过 ContainerID 查询扩展日志
3. **跨层关联** - 将 AKS 层问题与 Fabric/CRP 层日志关联

## 关联查询

- [cluster-snapshot.md](./cluster-snapshot.md) - 集群快照
- [operation-tracking.md](./operation-tracking.md) - 操作追踪

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
