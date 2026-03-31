---
name: AzSMTenantStatemachineEvents
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: 租户状态机事件，记录 Service Healing、Live Migration 等 Fabric 层状态机操作
status: active
---

# AzSMTenantStatemachineEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Service Manager 租户级别的状态机事件，包括 Service Healing、Live Migration、Human Investigate 等 Fabric 层操作的详细状态转换。用于诊断平台发起的 VM 可用性影响事件。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | |
| Cluster | string | 集群名称 | ZQZ21PrdApp03 |
| tenantName | string | 租户名称（ContainerId） | |
| applicationName | string | 应用名称 | |
| serviceName | string | 服务名称 | |
| nodeId | string | 节点 ID | |
| stateMachineId | string | 状态机 ID | |
| stateMachineState | string | 状态机当前状态 | HumanInvestigate |
| message | string | 详细消息 | |
| EventMessage | string | 事件消息 | |

## 常用筛选字段

- `tenantName` - 按租户/容器 ID 筛选
- `nodeId` - 按节点筛选
- `stateMachineState` - 按状态筛选
- `Cluster` - 按集群筛选

## 典型应用场景

1. **Service Healing 诊断** - 追踪平台自愈操作的状态转换
2. **Live Migration 追踪** - 查看 VM 迁移的状态机进度
3. **平台事件时间线重建** - 结合 TMMgmtTenantEventsEtwTable 分析

## 示例查询

```kql
AzSMTenantStatemachineEvents
| where PreciseTimeStamp between (datetime({starttime}) .. datetime({endtime}))
| where tenantName has "{containerId}"
| project PreciseTimeStamp, tenantName, stateMachineId, stateMachineState, message
| order by PreciseTimeStamp asc
```

## 关联表

- [TMMgmtTenantEventsEtwTable.md](./TMMgmtTenantEventsEtwTable.md) - 租户事件
- [ServiceHealingTriggerEtwTable.md](./ServiceHealingTriggerEtwTable.md) - Service Healing 触发
- [TMMgmtNodeFaultEtwTable.md](./TMMgmtNodeFaultEtwTable.md) - 节点故障事件
