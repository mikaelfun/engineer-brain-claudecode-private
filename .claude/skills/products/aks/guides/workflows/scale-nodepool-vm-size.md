# AKS 节点池扩缩容 — vm-size — 排查工作流

**来源草稿**: ado-wiki-check-physical-zone-logical-zone-mapping.md
**Kusto 引用**: scale-upgrade-operations.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Check node physical zone and logical zone mapping
> 来源: ado-wiki-check-physical-zone-logical-zone-mapping.md | 适用: 适用范围未明确

### 排查步骤

#### Check node physical zone and logical zone mapping

#### Summary

This TSG is oriented to share a guidance about how to check node physical zone and logical zone mapping.
It would be useful in The following case:

- identify whether customers' nodes are impacted by Infra outages.
- identify the node zone when encounter the OverconstrainedZonalAllocationRequest error.

#### Method

- Get the logic zone from ASC VMSS instance page.

- Use the below query to get the physical zone and logical zone mapping

   ```kql
   // Get physical to logical zone mapping
   cluster('azcrpbifollower.kusto.windows.net').database('bi_allprod').Subscription
   | where PreciseTimeStamp > ago(5h)
   | where SubscriptionId == "<subID>"
   | where Region in~ ("westus2") //Replace Region Name
   | summarize arg_max(PreciseTimeStamp,*) by SubscriptionId,Region
   | project SubscriptionId,Region,RegisteredFeatures,AvailabilityZoneMappings,SubscriptionQuotaOverrides
   ```

- If only need to check the Availability zone, the below query could also be used.

   ```kql
   cluster("AzureCM").database("AzureCM").LogContainerSnapshot
   | where PreciseTimeStamp >= ago(1d)
   | where subscriptionId == '<subID>'
   | where roleInstanceName contains "<VMSS instace_ID>"     //VM name
   | where CloudName == 'Public' and Tenant !has 'TMBox'
   | summarize min(PreciseTimeStamp), max(PreciseTimeStamp) by roleInstanceName, creationTime, virtualMachineUniqueId, Tenant, containerId, nodeId, tenantName, AvailabilityZone
   | project VMName=roleInstanceName, AvailabilityZone, VirtualMachineUniqueId=virtualMachineUniqueId, Cluster=Tenant, NodeId=nodeId, ContainerId=containerId, ContainerCreationTime=todatetime(creationTime), StartTimeStamp=min_PreciseTimeStamp, EndTimeStamp=max_PreciseTimeStamp, tenantName
   ```

---

## 附录: Kusto 诊断查询

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
