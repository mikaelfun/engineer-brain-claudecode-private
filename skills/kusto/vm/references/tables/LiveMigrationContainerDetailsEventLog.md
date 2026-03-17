---
name: LiveMigrationContainerDetailsEventLog
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: Live Migration 容器详情事件日志
status: active
---

# LiveMigrationContainerDetailsEventLog

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

记录 VM 实时迁移 (Live Migration) 的详细信息，包括源节点、目标节点、迁移原因和结果。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| Tenant | string | 集群名称 |
| sessionId | string | 迁移会话 ID |
| sourceContainerId | string | 源容器 ID |
| destinationContainerId | string | 目标容器 ID |
| triggerType | string | 迁移触发类型 |
| migrationConstraint | string | 迁移约束 |
| sourceNodeId | string | 源节点 ID |
| destinationNodeId | string | 目标节点 ID |
| sourcePhysicalBladeId | string | 源物理刀片 ID |
| destinationPhysicalBladeId | string | 目标物理刀片 ID |
| sourceDip | string | 源 DIP 地址 |
| destinationDip | string | 目标 DIP 地址 |
| sourceVlan | string | 源 VLAN |
| destinationVlan | string | 目标 VLAN |

## 常见迁移触发类型

| triggerType | 说明 |
|-------------|------|
| ServiceHealing | 服务自愈触发的迁移 |
| Maintenance | 计划维护触发的迁移 |
| LoadBalance | 负载均衡触发的迁移 |
| UserInitiated | 用户发起的迁移 (Redeploy) |

## 示例查询

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LiveMigrationContainerDetailsEventLog
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where sourceContainerId == "{containerId}" or destinationContainerId == "{containerId}"
| project PreciseTimeStamp, sessionId, sourceContainerId, destinationContainerId, 
         triggerType, migrationConstraint, sourceNodeId, destinationNodeId
| order by PreciseTimeStamp desc
```

## 注意事项

- 此表不包含 TenantName 字段，需通过 containerId 或 nodeId 筛选
- 使用 sessionId 可关联 LiveMigrationSessionStatusEventLog 获取迁移状态详情

## 关联表

- [TMMgmtTenantEventsEtwTable.md](./TMMgmtTenantEventsEtwTable.md) - 租户事件
- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 容器快照
