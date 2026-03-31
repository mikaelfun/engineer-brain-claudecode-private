---
name: VMA
database: vmadb
cluster: https://vmainsight.kusto.windows.net
description: VM 可用性事件表，包含 RCA (Root Cause Analysis) 分析结果
status: active
---

# VMA

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://vmainsight.kusto.windows.net |
| 数据库 | vmadb |
| 状态 | ✅ 可用 |
| 环境 | Public Cloud |

## 用途

记录 VM 的可用性事件和 RCA (Root Cause Analysis) 分析结果。是分析 VM 意外重启、不可用问题的核心表。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 事件时间 |
| Subscription | string | 订阅 ID |
| NodeId | string | 节点 ID |
| ContainerId | string | 容器 ID |
| RoleInstanceName | string | VM 名称 |
| TenantName | string | 租户名称 |
| Cluster | string | 集群名称 |
| RCA | string | RCA 结果摘要 |
| RCALevel1 | string | RCA 一级分类 |
| RCALevel2 | string | RCA 二级分类 |
| RCALevel3 | string | RCA 三级分类 |
| RCAEngineCategory | string | RCA 引擎分类 (CustomerInitiated/Planned/Unplanned) |
| RCA_CSS | string | CSS 相关 RCA |
| Detail | string | 详细信息 |
| ICM_OnCluster | string | 集群上的 ICM |

## 常用筛选字段

- `Subscription` - 按订阅筛选
- `RoleInstanceName` - 按 VM 名称筛选
- `NodeId` - 按节点筛选
- `RCAEngineCategory` - 按 RCA 类别筛选
- `RCALevel1/2/3` - 按 RCA 级别筛选

## 典型应用场景

1. **VM 意外重启分析** - 获取 RCA 分析结果
2. **可用性问题排查** - 查看 VM 可用性事件历史
3. **按订阅统计** - 统计订阅下所有 VM 的可用性事件
4. **硬件故障关联** - 通过 RCALevel2 关联 DCM 故障代码

## 示例查询

### 按订阅查询 VMA

```kql
cluster('vmainsight.kusto.windows.net').database('vmadb').VMA
| where Subscription == '{sub}'
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
| where PreciseTimeStamp >= ago(7d)
| where Subscription in ("{sub}")
| where RoleInstanceName contains "{vmname}"
| where RCAEngineCategory != 'CustomerInitiated'
| project PreciseTimeStamp, Cluster, NodeId, ContainerId, RoleInstanceName, RCA, RCALevel1, 
         RCALevel2, RCALevel3, RCAEngineCategory
| sort by PreciseTimeStamp desc
```

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

## 关联表

- [VMALENS.md](./VMALENS.md) - 更详细的可用性分析
- [VmImpactingEventsV1.md](./VmImpactingEventsV1.md) - VM 影响事件
- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 获取容器信息

## 注意事项

- VMAInsight 集群位于 Public Cloud，Mooncake 环境需跨云查询
- `RCAEngineCategory` 值包括：CustomerInitiated（客户发起）、Planned（计划维护）、Unplanned（非计划）
- 排查非客户发起的问题时，通常过滤 `RCAEngineCategory != 'CustomerInitiated'`
