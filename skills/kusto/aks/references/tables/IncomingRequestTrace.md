---
name: IncomingRequestTrace
database: AKSprod
cluster: https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn
description: ARM 入站请求追踪，记录从 ARM 进入 AKS RP 的请求
status: active
related_tables:
  - OutgoingRequestTrace
---

# IncomingRequestTrace

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | AKSprod |
| 状态 | ✅ 可用 |

## 用途

记录从 ARM 进入 AKS Resource Provider 的请求，用于追踪请求来源和入口信息。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 时间戳 |
| subscriptionID | string | 订阅 ID |
| correlationID | string | 关联 ID |
| operationID | string | 操作 ID |
| operationName | string | 操作名称 |
| suboperationName | string | 子操作名称 |
| targetURI | string | 目标 URI |
| httpMethod | string | HTTP 方法 |
| region | string | 区域 |
| msg | string | 消息 |
| durationInMilliseconds | long | 持续时间（毫秒） |
| userAgent | string | 用户代理 |

## 示例查询

### 查询入站请求
```kql
IncomingRequestTrace 
| where PreciseTimeStamp > ago(2d)
| where subscriptionID has '{subscription}'
| where correlationID has "{correlationId}"
| where httpMethod notcontains "GET"
| where operationName notcontains "unknown"
| project PreciseTimeStamp, operationName, suboperationName, targetURI, correlationID, 
         operationID, region, msg, durationInMilliseconds, userAgent
```

## 关联表

- [OutgoingRequestTrace.md](./OutgoingRequestTrace.md) - CRP 出站请求
