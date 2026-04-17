---
name: MutatingComponentQoSTable
database: crp_allmc
cluster: https://azcrpmc.kusto.chinacloudapi.cn
description: CRP 组件 QoS 表，记录各组件操作的延迟和结果
status: active
---

# MutatingComponentQoSTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcrpmc.kusto.chinacloudapi.cn |
| 数据库 | crp_allmc |
| 状态 | ✅ 可用 |

## 用途

记录 CRP 各组件（Fabric、Allocator、Disk 等）操作的延迟和结果。用于分析操作中哪个组件耗时最长或失败。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| subscriptionId | string | 订阅 ID |
| activityId | string | 活动 ID (operationId) |
| componentName | string | 组件名称 |
| operationName | string | 操作名称 |
| operationResult | string | 操作结果 |
| resultDetails | string | 结果详情 |
| durationInMs | long | 持续时间 (毫秒) |

## 示例查询

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').MutatingComponentQoSTable
| where TIMESTAMP > ago(1d)
| where subscriptionId == "{subscription}"
| where activityId contains "{operationId}"
| where operationName notcontains "GET"
| sort by PreciseTimeStamp desc nulls last 
| project PreciseTimeStamp, componentName, operationName, operationResult, resultDetails, durationInMs
```

## 关联表

- [ApiQosEvent.md](./ApiQosEvent.md) - 获取 operationId
- [ContextActivity.md](./ContextActivity.md) - 详细日志
