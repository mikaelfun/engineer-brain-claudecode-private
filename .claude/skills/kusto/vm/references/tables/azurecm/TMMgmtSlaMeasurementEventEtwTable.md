---
name: TMMgmtSlaMeasurementEventEtwTable
database: azurecm
cluster: https://azurecm.chinanorth2.kusto.chinacloudapi.cn
description: TM 管理 SLA 测量事件表，记录 Tenant Manager 的 SLA 测量相关事件
status: active
---

# TMMgmtSlaMeasurementEventEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azurecm.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | azurecm |
| 状态 | ✅ 可用 |

## 用途

TM 管理 SLA 测量事件表，记录 Tenant Manager 的 SLA 测量相关事件。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Region | string | 区域 |
| DataCenterName | string | 数据中心名称 |
| Tenant | string | 租户 |
| ActivityId | string | 活动 ID |
| Context | string | 上下文 |
| EntityState | string | 实体状态 |
| TenantName | string | 租户名称 |
| TenantID | string | 租户 ID |
| RoleInstanceID | string | 角色实例 ID |
| RoleInstanceName | string | 角色实例名称 |
| ContainerID | string | 容器 ID |
| OccurredTime | datetime | 发生时间 |
| NodeID | string | 节点 ID |
| Detail0 | string | 详情 |
| ResultCode | long | 结果代码 |
| CorrelationID1 | string | 关联 ID 1 |
| CorrelationContext1 | string | 关联上下文 1 |

## 示例查询

```kql
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').TMMgmtSlaMeasurementEventEtwTable
| where PreciseTimeStamp > ago(1d)
| where ContainerID == '{containerId}'
| project PreciseTimeStamp, EntityState, TenantName, RoleInstanceName, ContainerID, ResultCode, Detail0
| order by PreciseTimeStamp desc
```

## 关联表

- [TMMgmtTenantEventsEtwTable.md](./TMMgmtTenantEventsEtwTable.md) - 租户事件
- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 容器快照
