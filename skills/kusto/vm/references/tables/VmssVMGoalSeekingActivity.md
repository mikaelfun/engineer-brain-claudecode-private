---
name: VmssVMGoalSeekingActivity
database: crp_allmc
cluster: https://azcrpmc.kusto.chinacloudapi.cn
description: VMSS VM Goal Seeking 活动表，记录 VMSS 中 VM 实例的目标状态同步操作日志
status: active
---

# VmssVMGoalSeekingActivity

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcrpmc.kusto.chinacloudapi.cn |
| 数据库 | crp_allmc |
| 状态 | ✅ 可用 |

## 用途

VMSS VM Goal Seeking 活动表，记录 VMSS 中 VM 实例的 goal seeking（目标状态同步）操作日志。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| RPTenant | string | RP 租户 |
| subscriptionId | string | 订阅 ID |
| activityId | string | 活动 ID |
| message | string | 日志消息 |
| callerName | string | 调用者名称 |
| traceLevel | long | 跟踪级别 |
| traceCode | long | 跟踪代码 |
| goalStateResourceId | string | 目标状态资源 ID |
| vMName | string | VM 名称 |

## 示例查询

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssVMGoalSeekingActivity
| where PreciseTimeStamp > ago(7d)
| where subscriptionId == '{subscriptionId}'
| where goalStateResourceId has '{vmssName}'
| project PreciseTimeStamp, vMName, activityId, message, traceLevel
| order by PreciseTimeStamp desc
```

### 联合查询 ContextActivity

```kql
union cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity, 
      cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VmssVMGoalSeekingActivity
| where TIMESTAMP > ago(1d)
| where subscriptionId has '{subscriptionId}'
| where activityId contains "{operationId}"
| where traceLevel < 3
| project TIMESTAMP, traceLevel, message, callerName
| order by TIMESTAMP asc
```

## 关联表

- [ContextActivity.md](./ContextActivity.md) - 详细执行日志
- [VmssQoSEvent.md](./VmssQoSEvent.md) - VMSS 级别事件
