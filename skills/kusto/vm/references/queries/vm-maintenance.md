---
name: vm-maintenance
description: 计划内维护查询 - 查询 VM 计划内维护 (Scheduled Maintenance) 状态和事件
tables:
  - ScheduledMaintenanceInformational  # ⚠️ Mooncake 不可用
  - ScheduledMaintenanceStatus  # ⚠️ Mooncake 不可用
  - ScheduledMaintenanceContextStateChange  # ⚠️ Mooncake 不可用
parameters:
  - name: vmname
    required: true
    description: VM 名称
  - name: starttime
    required: true
    description: 开始时间
  - name: endtime
    required: true
    description: 结束时间
---

# 计划内维护查询

## 用途

查询 VM 的计划内维护 (Scheduled Maintenance) 信息，包括维护类型、状态、调度元数据等。用于排查 VM 因平台维护导致的重启或不可用问题。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {vmname} | 是 | VM 名称 | myvm |
| {starttime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endtime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

> ⚠️ **Mooncake 不可用**: ScheduledMaintenanceInformational、ScheduledMaintenanceStatus、ScheduledMaintenanceContextStateChange 表在 Mooncake azurecm 数据库中不存在，仅 Global 可用。Mooncake 环境下可通过 TMMgmtTenantEventsEtwTable 查询维护相关事件。

### 查询 VM 维护信息

```kql
cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database('azurecm').ScheduledMaintenanceInformational 
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where scheduledMaintenanceId !has "00000000-0000-0000-0000-000000000000"
| where message !has "Found vm heartbeat for the vm "
| where message has "{vmname}"
| project TIMESTAMP, scheduledMaintenanceId, message
| take 50000
```

### 查询维护状态和类型

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let vmname = "{vmname}";
let ids =
    cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database('azurecm').ScheduledMaintenanceInformational
    | where TIMESTAMP between (starttime .. endtime)
    | where scheduledMaintenanceId !has "00000000-0000-0000-0000-000000000000"
    | where message !has "Found vm heartbeat for the vm "
    | where message has vmname
    | distinct scheduledMaintenanceId;
cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database('azurecm').ScheduledMaintenanceStatus
| where scheduledMaintenanceId in (ids)
| distinct scheduledMaintenanceId, resourceMaintenanceType, state
| project scheduledMaintenanceId, state, resourceMaintenanceType
| join kind=leftouter (
    cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database('azurecm').ScheduledMaintenanceContextStateChange
    | where scheduledMaintenanceId in (ids)
    | project scheduledMaintenanceId, maintenanceType, fromState, toState, scheduleMetadata
) on scheduledMaintenanceId
| project scheduledMaintenanceId, maintenanceType, resourceMaintenanceType, state, fromState, toState, scheduleMetadata
```

### 按 scheduledMaintenanceId 查询完整历史

```kql
let maintenanceId = "{scheduledMaintenanceId}";
cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database('azurecm').ScheduledMaintenanceInformational
| where scheduledMaintenanceId == maintenanceId
| project TIMESTAMP, scheduledMaintenanceId, message
| order by TIMESTAMP asc
```

### 查询特定时间段内所有维护事件

```kql
cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database('azurecm').ScheduledMaintenanceStatus
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where scheduledMaintenanceId !has "00000000-0000-0000-0000-000000000000"
| summarize arg_max(TIMESTAMP, *) by scheduledMaintenanceId
| project TIMESTAMP, scheduledMaintenanceId, resourceMaintenanceType, state
| order by TIMESTAMP desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| scheduledMaintenanceId | 计划维护 ID |
| maintenanceType | 维护类型 |
| resourceMaintenanceType | 资源维护类型 |
| state | 当前状态 |
| fromState | 原状态 |
| toState | 目标状态 |
| scheduleMetadata | 调度元数据 (JSON) |

## 常见维护类型

| 类型 | 说明 |
|------|------|
| HostMaintenanceReboot | 主机维护重启 |
| HostMaintenanceLiveMigration | 主机维护 - 实时迁移 |
| HostMaintenanceRedeploy | 主机维护 - 重新部署 |
| HostSecurityUpdate | 主机安全更新 |
| GuestOSUpdate | 来宾 OS 更新 |

## 常见状态

| 状态 | 说明 |
|------|------|
| Pending | 待处理 |
| InProgress | 进行中 |
| Completed | 已完成 |
| Cancelled | 已取消 |

## 变体查询

### 按订阅查询所有维护事件

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let subscription = "{subscription}";
cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database('azurecm').LogContainerSnapshot
| where TIMESTAMP between (starttime .. endtime)
| where subscriptionId == subscription
| distinct roleInstanceName
| join kind=inner (
    cluster("azurecm.chinanorth2.kusto.chinacloudapi.cn").database('azurecm').ScheduledMaintenanceInformational
    | where TIMESTAMP between (starttime .. endtime)
    | where scheduledMaintenanceId !has "00000000-0000-0000-0000-000000000000"
) on $left.roleInstanceName == $right.roleInstanceName
| project TIMESTAMP, roleInstanceName, scheduledMaintenanceId, message
| order by TIMESTAMP desc
```

## 集群信息

| 集群 | URI | 数据库 |
|------|-----|--------|
| Azure CM | https://azurecm.chinanorth2.kusto.chinacloudapi.cn | azurecm |

## 关联查询

- [service-healing.md](./service-healing.md) - Service Healing 查询 (非计划内维护)
- [vma-analysis.md](./vma-analysis.md) - VMA 可用性分析
- [live-migration.md](./live-migration.md) - Live Migration 查询
