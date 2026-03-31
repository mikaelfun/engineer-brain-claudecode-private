---
name: VMAutoExtensionUpgradeEvent
database: crp_allmc
cluster: https://azcrpmc.kusto.chinacloudapi.cn
description: VM 扩展自动升级事件表，记录 VM 扩展的自动升级操作及其状态
status: active
---

# VMAutoExtensionUpgradeEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcrpmc.kusto.chinacloudapi.cn |
| 数据库 | crp_allmc |
| 状态 | ✅ 可用 |

## 用途

VM 扩展自动升级事件表，记录 VM 扩展的自动升级操作及其状态。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| activityId | string | 活动 ID |
| region | string | 区域 |
| subscriptionId | string | 订阅 ID |
| vMId | string | VM ID |
| vMSetKey | string | VMSS Key |
| publisher | string | 扩展发布者 |
| type | string | 扩展类型 |
| version | string | 扩展版本 |
| durationInMilliseconds | long | 持续时间（毫秒）|
| operationId | string | 操作 ID |
| status | string | 状态 |
| errorCode | string | 错误代码 |
| errorDetails | string | 错误详情 |

## 示例查询

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').VMAutoExtensionUpgradeEvent
| where PreciseTimeStamp > ago(7d)
| where subscriptionId == '{subscriptionId}'
| project PreciseTimeStamp, vMId, publisher, type, version, status, errorCode, errorDetails
| order by PreciseTimeStamp desc
```

## 关联表

- [GuestAgentExtensionEvents.md](./GuestAgentExtensionEvents.md) - Guest Agent 扩展事件
- [ContextActivity.md](./ContextActivity.md) - 详细执行日志
