---
name: ApiQosEvent_nonGet
database: crp_allmc
cluster: https://azcrpmc.kusto.chinacloudapi.cn
description: 非 GET 操作的 API QoS 事件表，派生自 ApiQosEvent
status: active
---

# ApiQosEvent_nonGet

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcrpmc.kusto.chinacloudapi.cn |
| 数据库 | crp_allmc |
| 热缓存 | 30 天 |
| 状态 | ✅ 可用 |

## 用途

非 GET 操作的 API QoS 事件表，派生自 ApiQosEvent，过滤掉 GET 和 Callback 操作。用于更快地查询写操作（创建、更新、删除 VM 等）。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| subscriptionId | string | 订阅 ID |
| operationId | string | 操作 ID |
| clientRequestId | string | 客户端请求 ID |
| correlationId | string | 关联 ID |
| operationName | string | 操作名称 |
| resourceGroupName | string | 资源组名称 |
| resourceName | string | 资源名称 |
| durationInMilliseconds | long | 持续时间（毫秒）|
| e2EDurationInMilliseconds | long | 端到端持续时间（毫秒）|
| resultType | long | 结果类型 |
| httpStatusCode | long | HTTP 状态码 |
| resultCode | string | 结果代码 |
| exceptionType | string | 异常类型 |
| errorDetails | string | 错误详情 |
| region | string | 区域 |
| userAgent | string | 用户代理 |
| clientApplicationId | string | 客户端应用 ID |
| apiVersion | string | API 版本 |
| goalSeekingActivityId | string | Goal Seeking 活动 ID |

## 示例查询

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent_nonGet
| where PreciseTimeStamp > ago(7d)
| where subscriptionId == '{subscriptionId}'
| where operationName has_any ('Create', 'Update', 'Delete', 'Start', 'Stop', 'Restart')
| project PreciseTimeStamp, operationName, resourceName, httpStatusCode, resultCode, durationInMilliseconds, errorDetails
| order by PreciseTimeStamp desc
```

## 关联表

- [ApiQosEvent.md](./ApiQosEvent.md) - 包含所有操作的完整表
- [ContextActivity.md](./ContextActivity.md) - 详细执行日志
