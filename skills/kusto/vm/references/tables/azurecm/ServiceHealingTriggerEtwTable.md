---
name: ServiceHealingTriggerEtwTable
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: Service Healing 触发事件，记录服务自愈的触发原因
status: active
---

# ServiceHealingTriggerEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录 Service Healing 触发事件及其详细原因。当 VM 发生意外重启时，此表可确认是否为 Service Healing 触发，并提供触发原因。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 触发时间 |
| TriggerId | string | 触发 ID |
| TriggerType | string | 触发类型 |
| TriggerObjectId | string | 触发对象 ID |
| TenantName | string | 租户名称 |
| FaultCode | string | 故障代码 |
| FaultReason | string | 故障原因 |
| FaultInfoFabricOperation | string | Fabric 操作信息 |
| FaultInfoCorrelationGuid | string | 故障关联 GUID |
| AffectedUpdateDomain | string | 受影响的更新域 |
| RoleInstanceName | string | 角色实例名称 (VM 名称) |
| SourceNodeId | string | 源节点 ID |

## 常用筛选字段

- `TenantName` - 按租户筛选 (必需)
- `SourceNodeId` - 按节点筛选（注意：实际列名是 SourceNodeId，不是 NodeId）
- `FaultCode` - 按故障代码筛选
- `RoleInstanceName` - 按 VM 名称筛选

## 典型应用场景

1. **确认 Service Healing** - 确认 VM 是否触发了 Service Healing
2. **获取触发原因** - 获取 FaultCode 和 FaultReason
3. **分析节点问题** - 关联节点查询所有 Service Healing 事件

## 示例查询

### 查询 Service Healing 事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').ServiceHealingTriggerEtwTable
| where TenantName == "{tenantName}"
| where PreciseTimeStamp > datetime({starttime}) and PreciseTimeStamp < datetime({endtime})
| project PreciseTimeStamp, TenantName, TriggerType, FaultReason, RoleInstanceName, NodeId, FaultCode
```

### 按节点查询

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').ServiceHealingTriggerEtwTable 
| where NodeId == "{nodeId}" 
| where TenantName == "{tenantName}" 
| where PreciseTimeStamp >= datetime({starttime}) 
| where PreciseTimeStamp < datetime({endtime})
| project PreciseTimeStamp, TenantName, TriggerType, FaultReason, NodeId, FaultCode
```

### 配合 AzSMTenantStatemachineEvents 查询

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').AzSMTenantStatemachineEvents
| where PreciseTimeStamp > ago(4d)
| where tenantName contains "{tenantName}"
| where message contains "Servicehealing" or message contains "Service healing"
| project PreciseTimeStamp, message, tenantName
```

## 关联表

- [TMMgmtTenantEventsEtwTable.md](./TMMgmtTenantEventsEtwTable.md) - 租户事件
- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 获取 tenantName
- [VMA.md](./VMA.md) - 获取 RCA 分析

## 注意事项

- Service Healing 是 Azure 自动将 VM 从故障节点迁移到健康节点的机制
- `FaultCode` 可用于关联 DCM FaultCodeTeamMapping 表获取更详细的故障说明
- 必须先从 LogContainerSnapshot 获取 tenantName
