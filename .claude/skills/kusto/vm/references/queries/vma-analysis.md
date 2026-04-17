---
name: vma-analysis
description: VMA 可用性分析 - 查询 VM 可用性事件和 RCA 结果
tables:
  - VMA
  - VMALENS
  - VmImpactingEventsV1
parameters:
  - name: subscription
    required: true
    description: 订阅 ID
  - name: vmname
    required: false
    description: VM 名称
  - name: nodeId
    required: false
    description: 节点 ID
  - name: starttime
    required: true
    description: 开始时间
  - name: endtime
    required: true
    description: 结束时间
---

# VMA 可用性分析

## 用途

查询 VM 可用性事件和 RCA (Root Cause Analysis) 分析结果。用于分析 VM 意外重启、不可用问题的根因。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {subscription} | 是 | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {vmname} | 否 | VM 名称 | myvm |
| {nodeId} | 否 | 节点 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 按订阅查询 VMA

```kql
cluster('vmainsight.kusto.windows.net').database('vmadb').VMA
| where Subscription == '{subscription}'
| where PreciseTimeStamp >= ago(15d)
| where RoleInstanceName has "{vmname}"
| project PreciseTimeStamp, TenantName, NodeId, ContainerId, RoleInstanceName, RCALevel1, 
         RCALevel2, RCALevel3, RCAEngineCategory, Detail, Cluster, ICM_OnCluster
| order by PreciseTimeStamp asc
```

### 按 NodeId 查询

```kql
cluster('vmainsight.kusto.windows.net').database('vmadb').VMA
| where PreciseTimeStamp >= ago(7d)
| where NodeId == "{nodeId}"
| where RoleInstanceName has "{vmname}"
| project PreciseTimeStamp, TenantName, NodeId, ContainerId, RoleInstanceName, RCA, RCALevel1, 
         RCALevel2, RCALevel3, RCAEngineCategory
| order by PreciseTimeStamp asc
```

### 排除客户发起的重启

```kql
cluster('vmainsight.kusto.windows.net').database('vmadb').VMA
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime})
| where Subscription in ("{subscription}")
| where RoleInstanceName contains "{vmname}"
| where RCAEngineCategory != 'CustomerInitiated'
| project PreciseTimeStamp, Cluster, NodeId, ContainerId, RoleInstanceName, RCA, RCALevel1, 
         RCALevel2, RCALevel3, RCAEngineCategory
| sort by PreciseTimeStamp desc
```

### 查询 VMALENS (含 EG 分析)

```kql
cluster('vmainsight.kusto.windows.net').database('vmadb').VMALENS
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime})
| where LastKnownSubscriptionId in ("{subscription}")
| project PreciseTimeStamp, DurationInMin, RoleInstanceName, Subscription, NodeIp, RCALevel1, 
         RCALevel2, EG_FailureSignature, VmSize, Hardware_Model, NodeId, ContainerId, 
         Cluster, RCA, Usage_Region
| order by PreciseTimeStamp desc
```

### 查询 VM 影响事件 (PHU 更新等)

```kql
cluster('vmainsight.kusto.windows.net').database('vmadb').VmImpactingEventsV1
| where PreciseTimeStamp > datetime({starttime}) and PreciseTimeStamp < datetime({endtime})
| where NodeId == '{nodeId}'
| where RCAEngineCategory == 'Unplanned'
| where SubscriptionId == '{subscription}'
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| RCA | RCA 结果摘要 |
| RCALevel1 | RCA 一级分类 |
| RCALevel2 | RCA 二级分类 (可能含 DCM FaultCode) |
| RCALevel3 | RCA 三级分类 |
| RCAEngineCategory | RCA 类别 (CustomerInitiated/Planned/Unplanned) |
| EG_FailureSignature | 故障签名 |
| DurationInMin | 持续时间 (分钟) |

## 变体查询

### 查询特定 DCM 故障代码

```kql
cluster('vmainsight.kusto.windows.net').database('vmadb').VMA
| where PreciseTimeStamp > ago(30d)
| where RCAEngineCategory != 'CustomerInitiated'
| where RCALevel2 == "DCM FaultCode 62253"
| where Cluster startswith "{tenant}"
| distinct Cluster, NodeId
```

### 获取 VM 重启支持文章

```kql
let myTable = cluster('vmainsight.kusto.windows.net').database('vmadb').VMA  
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime})  
| where NodeId == "{nodeId}" and RoleInstanceName has "{vmname}" 
| distinct PreciseTimeStamp, NodeId, RoleInstanceName, RCAEngineCategory, RCALevel1, 
          RCALevel2, RCA_CSS, Cluster, ContainerId; 
myTable 
| extend StartTime = now(), EndTime = now(), RCAEngineCategory = "" 
| invoke cluster('vmainsight.kusto.windows.net').database('Air').AddVmRestartSupportArticle() 
| project-away StartTime, EndTime, RCAEngineCategory, InternalArticleId
```

### 查询 PHU 事件

```kql
cluster('vmainsight.kusto.windows.net').database('Air').GetVMPhuEventsBySubId('{subscription}', datetime({starttime}), datetime({endtime}))
| project Cluster, RoleInstanceName, ContainerId, NodeId=ResourceId, ImpactBeginTimeStamp, 
         ImpactEndTimeStamp, ImpactDurationTimeSpan
```

## 关联查询

- [service-healing.md](./service-healing.md) - Service Healing 查询
- [hardware-failure.md](./hardware-failure.md) - 硬件故障查询
- [node-events.md](./node-events.md) - 节点事件查询
