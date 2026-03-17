---
name: LogContainerHealthSnapshot
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: 容器健康状态快照表，记录 VM 容器的健康状态、生命周期状态、操作状态等信息
status: active
---

# LogContainerHealthSnapshot

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

容器健康状态快照表，记录 VM 容器的健康状态、生命周期状态、操作状态等信息。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Region | string | 区域 |
| DataCenterName | string | 数据中心名称 |
| Tenant | string | 租户 |
| containerId | string | 容器 ID |
| containerState | string | 容器状态 |
| actualOperationalState | string | 实际操作状态 |
| containerLifecycleState | string | 容器生命周期状态 |
| containerOsState | string | 容器 OS 状态 |
| vmExpectedHealthState | string | VM 预期健康状态 |
| faultInfo | string | 故障信息 |
| virtualMachineUniqueId | string | VM 唯一 ID |
| containerIsolationState | string | 容器隔离状态 |
| nodeId | string | 节点 ID |
| tenantName | string | 租户名称 |
| roleInstanceName | string | 角色实例名称 |
| isReusedContainer | string | 是否重用容器 |
| lifecycleStateChangeTime | string | 生命周期状态变更时间 |
| hibernateStatus | string | 休眠状态 |
| lmContext | string | Live Migration 上下文 |
| isContainerConnected | bool | 容器是否已连接 |

## 示例查询

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerHealthSnapshot
| where PreciseTimeStamp > ago(1d)
| where containerId == '{containerId}' or virtualMachineUniqueId == '{vmId}'
| project PreciseTimeStamp, containerId, containerState, actualOperationalState, containerLifecycleState, vmExpectedHealthState, faultInfo
| order by PreciseTimeStamp desc
```

## 关联表

- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 容器快照
