---
name: RdmResourceSnapshot
database: AzureDCMDb
cluster: https://azuredcmmc.kusto.chinacloudapi.cn
description: 节点资源快照，记录节点生命周期状态、故障代码和故障描述
status: active
---

# RdmResourceSnapshot

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azuredcmmc.kusto.chinacloudapi.cn |
| 数据库 | AzureDCMDb |
| 状态 | ✅ 可用 |

## 用途

记录节点生命周期状态、故障代码和故障描述。用于追踪节点状态变化和故障信息，是硬件故障调查的核心表。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| ResourceId | string | 资源 ID (NodeId) |
| PreciseTimeStamp | datetime | 记录时间戳 |
| LifecycleState | string | 节点生命周期状态 |
| LifecycleStateChangeTime | datetime | 生命周期状态变更时间 |
| NeedFlags | long | 节点需求标志 |
| FaultCode | long | 故障代码 |
| FaultDescription | string | 故障描述 |
| PfState | string | PF 状态 |
| PfRepairState | string | PF 修复状态 |
| HealthGrade | long | 健康等级 |
| HealthSummary | string | 健康摘要 |
| OSType | string | 操作系统类型 |
| Region | string | 区域 |
| DataCenterName | string | 数据中心名称 |
| AzureCluster | string | Azure 集群 |
| AvailabilityZone | string | 可用区 |

## 常用筛选字段

- `ResourceId` - 按节点 ID 筛选 (必需)
- `FaultCode` - 按故障代码筛选
- `LifecycleState` - 按生命周期状态筛选
- `PfState` - 按 PF 状态筛选

## 示例查询

### 查询节点生命周期状态

```kql
cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").RdmResourceSnapshot
| where ResourceId == "{nodeId}"
| where PreciseTimeStamp > ago(7d)
| project PreciseTimeStamp, LifecycleState, NeedFlags, FaultCode, FaultDescription, PfState, PfRepairState
| order by PreciseTimeStamp desc
| take 100
```

### 查询节点状态变更历史

```kql
cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").RdmResourceSnapshot
| where PreciseTimeStamp between(datetime({starttime}) .. datetime({endtime}))
| where ResourceId == "{nodeId}"
| project PreciseTimeStamp, ResourceId, OSType, LifecycleState, PfState, PfRepairState, 
         HealthGrade, HealthSummary, FaultCode, FaultDescription
| order by PreciseTimeStamp asc
| where LifecycleState != prev(LifecycleState)
    or PfState != prev(PfState)
    or PfRepairState != prev(PfRepairState)
    or FaultCode != prev(FaultCode)
```

### 查询特定故障代码的节点

```kql
cluster("azuredcmmc.kusto.chinacloudapi.cn").database("AzureDCMDb").RdmResourceSnapshot
| where PreciseTimeStamp > ago(1d)
| where FaultCode == {faultCode}
| summarize arg_max(PreciseTimeStamp, *) by ResourceId
| project PreciseTimeStamp, ResourceId, AzureCluster, LifecycleState, FaultCode, FaultDescription, HealthSummary
```

## 关联表

- [dcmInventoryComponentDiskDirect.md](./dcmInventoryComponentDiskDirect.md) - 磁盘库存

## 注意事项

- 此表位于 DCM 集群，需要相应访问权限
- `FaultCode` 是数字类型，可用于关联故障描述
- 使用 `arg_max(PreciseTimeStamp, *)` 获取节点最新状态
