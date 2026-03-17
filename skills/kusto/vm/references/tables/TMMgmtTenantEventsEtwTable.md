---
name: TMMgmtTenantEventsEtwTable
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: 租户事件表，记录 Service Healing、Live Migration 等 Fabric 层事件
status: active
---

# TMMgmtTenantEventsEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录 Fabric 在租户级别触发的操作事件，包括 Service Healing、Live Migration、OOM 等重要事件。是排查 VM 意外重启的关键表。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 事件时间 |
| TIMESTAMP | datetime | 时间戳 |
| TenantName | string | 租户名称 |
| Tenant | string | 集群名称 |
| Role | string | 角色名称 |
| RoleInstance | string | 角色实例 |
| SourceNodeId | string | 源节点 ID |
| ActivityId | string | 活动 ID |
| Message | string | 事件消息（包含操作详情） |
| Region | string | 区域 |
| CloudName | string | 云名称 |
| AvailabilityZone | string | 可用区 |

## 常用筛选字段

- `TenantName` - 按租户筛选 (必需)
- `Message` - 按消息内容筛选
- `Tenant` - 按集群筛选

## 典型应用场景

1. **Service Healing 排查** - 确认是否发生 Service Healing
2. **Live Migration 追踪** - 查看迁移事件
3. **OOM 诊断** - 检查内存不足问题
4. **容器操作追踪** - 查看容器级别操作

## 示例查询

### 查询租户事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtTenantEventsEtwTable
| where TIMESTAMP >= datetime({starttime}) and TIMESTAMP <= datetime({endtime})
| where Message !contains "[AuditEvent]"
| where Message contains "{vmname}"
| where TenantName == "{tenantName}"
| project PreciseTimeStamp, Message
```

### 查询特定 VM 的事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtTenantEventsEtwTable
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where TenantName == "{tenantName}"
| where Message contains "{vmname}" or Message contains "{containerId}"
| project PreciseTimeStamp, RoleInstance, Message
| order by PreciseTimeStamp asc
```

### 查询 Service Healing 相关事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtTenantEventsEtwTable
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where TenantName == "{tenantName}"
| where Message contains "ServiceHealing" or Message contains "healing"
| project PreciseTimeStamp, Message
| order by PreciseTimeStamp asc
```

## 关联表

- [ServiceHealingTriggerEtwTable.md](./ServiceHealingTriggerEtwTable.md) - Service Healing 触发详情
- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 获取 tenantName
- [TMMgmtNodeEventsEtwTable.md](./TMMgmtNodeEventsEtwTable.md) - 节点事件

## 注意事项

- 必须先从 LogContainerSnapshot 获取 `tenantName`
- `[AuditEvent]` 通常是噪音消息，建议过滤
- Message 字段包含丰富的操作详情，需要仔细分析
