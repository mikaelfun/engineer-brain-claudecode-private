---
name: live-migration
description: Live Migration 查询 - 排查 VM 实时迁移事件
tables:
  - LiveMigrationContainerDetailsEventLog
  - TMMgmtTenantEventsEtwTable
  - LogAllocatableVmCountMetric
parameters:
  - name: tenantName
    required: true
    description: 租户名称
  - name: containerId
    required: false
    description: 容器 ID
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

# Live Migration 查询

## 用途

排查 VM 实时迁移 (Live Migration) 事件，包括迁移原因、迁移结果和迁移时间线。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {tenantName} | 是 | 租户名称 | myvm-tenant |
| {containerId} | 否 | 容器 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {nodeId} | 否 | 节点 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| {starttime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询 Live Migration 详情

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LiveMigrationContainerDetailsEventLog
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where sourceContainerId == "{containerId}" or destinationContainerId == "{containerId}"
| project PreciseTimeStamp, sessionId, sourceContainerId, destinationContainerId, 
         triggerType, migrationConstraint, sourceNodeId, destinationNodeId
| order by PreciseTimeStamp desc
```

### 从租户事件查询 Live Migration

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtTenantEventsEtwTable
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where TenantName == "{tenantName}"
| where Message contains "LiveMigration" or Message contains "migration"
| project PreciseTimeStamp, Message
| order by PreciseTimeStamp asc
```

### 检查目标节点容量

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogAllocatableVmCountMetric
| where TIMESTAMP between (datetime({starttime})..datetime({endtime}))
| where vmType has "{vmSize}"
| project TIMESTAMP, vmType, vmCount, limitType, sellableAvailableCores
| order by TIMESTAMP desc
```

### 查询特定节点的迁移事件

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LiveMigrationContainerDetailsEventLog
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where sourceNodeId == "{nodeId}" or destinationNodeId == "{nodeId}"
| project PreciseTimeStamp, sessionId, sourceContainerId, destinationContainerId, 
         triggerType, migrationConstraint, sourceNodeId, destinationNodeId
| order by PreciseTimeStamp desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| sessionId | 迁移会话 ID（可关联 LiveMigrationSessionStatusEventLog） |
| triggerType | 迁移触发类型 |
| migrationConstraint | 迁移约束条件 |
| sourceContainerId | 源容器 ID |
| destinationContainerId | 目标容器 ID |
| sourceNodeId | 源节点 ID |
| destinationNodeId | 目标节点 ID |

## 常见迁移触发类型

| triggerType | 说明 |
|-----------------|------|
| ServiceHealing | 服务自愈触发的迁移 |
| Maintenance | 计划维护触发的迁移 |
| LoadBalance | 负载均衡触发的迁移 |
| UserInitiated | 用户发起的迁移 (Redeploy) |

## 变体查询

### 查询按容器的迁移历史

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LiveMigrationContainerDetailsEventLog
| where PreciseTimeStamp > ago(30d)
| where sourceContainerId == "{containerId}" or destinationContainerId == "{containerId}"
| project PreciseTimeStamp, sessionId, sourceContainerId, destinationContainerId, 
         triggerType, sourceNodeId, destinationNodeId
| order by PreciseTimeStamp desc
```

### 查询节点间的迁移统计

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LiveMigrationContainerDetailsEventLog
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where sourceNodeId == "{nodeId}" or destinationNodeId == "{nodeId}"
| summarize MigrationCount = count()
    by sourceNodeId, destinationNodeId, triggerType
```

## 关联查询

- [container-snapshot.md](./container-snapshot.md) - 获取 tenantName
- [service-healing.md](./service-healing.md) - Service Healing 查询
- [node-events.md](./node-events.md) - 节点事件查询
