---
name: DiagnosticTracesIfx
database: ESTS
cluster: https://estscnn2.chinanorth2.kusto.chinacloudapi.cn
description: AAD 诊断跟踪日志，包含登录失败的详细错误信息
status: active
---

# DiagnosticTracesIfx

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://estscnn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | ESTS |
| 状态 | ✅ 可用 |

## 用途

记录 Azure AD (ESTS) 的诊断跟踪日志，包含登录失败的详细错误信息。用于深度分析 AADSTS 错误。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_time | datetime | 事件时间 |
| CorrelationId | string | 关联 ID |
| RequestId | string | 请求 ID |
| Result | string | 结果 |
| BuildNumber | string | 构建号 |
| EventId | long | 事件 ID |
| PipelineTimestamp | long | 管道时间戳 |
| Message | string | 消息（包含错误详情） |
| Exception | string | 异常信息 |
| Stage | long | 阶段 |
| FaultDomain | string | 故障域 |
| Ring | string | 环 |
| NetModel | string | 网络模型 |

## 常用筛选字段

- `CorrelationId` - 按关联 ID 筛选
- `Message` - 搜索 AADSTS 错误码
- `Exception` - 搜索异常信息

## 典型应用场景

1. **AADSTS 错误详情** - 获取登录失败的详细错误信息
2. **异常堆栈分析** - 分析服务端异常
3. **问题时间线** - 追踪请求的处理阶段

## 示例查询

### 按 correlationId 查询诊断日志
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').DiagnosticTracesIfx
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where CorrelationId =~ "{correlationId}"
| project env_time, Message, Exception
| extend haskeyvalue = iff(Message contains "AADSTS" or Exception contains "AADSTS", 1, 0)
| order by env_time asc
```

### 搜索特定 AADSTS 错误
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').DiagnosticTracesIfx
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where Message contains "{AADSTSErrorCode}" or Exception contains "{AADSTSErrorCode}"
| project env_time, CorrelationId, Message, Exception
| order by env_time desc
| take 100
```

## 关联表

- [PerRequestTableIfx.md](./PerRequestTableIfx.md) - AAD 登录请求日志

## 注意事项

- 通常与 PerRequestTableIfx 配合使用
- 先从 PerRequestTableIfx 获取失败的 CorrelationId，再查询 DiagnosticTracesIfx 获取详细错误
- Message 和 Exception 字段可能包含 AADSTS 错误码
