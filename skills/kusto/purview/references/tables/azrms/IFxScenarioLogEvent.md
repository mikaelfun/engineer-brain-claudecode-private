---
name: IFxScenarioLogEvent
database: azrms
cluster: https://azrmsmc.kusto.chinacloudapi.cn
description: RMS 场景日志，记录端到端场景执行情况
status: active
---

# IFxScenarioLogEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azrmsmc.kusto.chinacloudapi.cn |
| 数据库 | azrms |
| 状态 | ✅ 可用 |

## 用途

记录 Azure RMS 的场景日志，用于监控和分析端到端的操作场景。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间 |
| operationName | string | 操作名称 |
| operationType | string | 操作类型 |
| resultType | string | 结果类型 |
| durationMs | long | 持续时间 (毫秒) |
| resultSignature | string | 结果签名 |
| resultDescription | string | 结果描述 |
| callerIpAddress | string | 调用者 IP |
| targetEndpointAddress | string | 目标端点地址 |
| correlationId | string | 关联 ID |
| internalCorrelationId | string | 内部关联 ID |
| transactionE2ETime | long | 端到端事务时间 |
| targetEnv | string | 目标环境 |
| targetRegion | string | 目标区域 |
| targetDataCenter | string | 目标数据中心 |
| url | string | URL |
| testId | string | 测试 ID |

## 常用筛选字段

- `correlationId` - 按请求关联 ID 筛选
- `resultType` - 按结果类型筛选
- `operationName` - 按操作名称筛选

## 示例查询

### 按 correlationId 查询场景日志
```kql
cluster('azrmsmc.kusto.chinacloudapi.cn').database('azrms').IFxScenarioLogEvent
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, operationName, resultType, durationMs, resultDescription, targetRegion
| order by env_time asc
```

## 关联表

- [IFxRequestLogEvent.md](./IFxRequestLogEvent.md) - MIP 请求日志
- [IFxTrace.md](./IFxTrace.md) - RMS 跟踪日志
