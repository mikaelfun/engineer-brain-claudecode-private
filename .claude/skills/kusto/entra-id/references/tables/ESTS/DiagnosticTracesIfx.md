---
name: DiagnosticTracesIfx
database: ESTS
cluster: https://estscnn2.chinanorth2.kusto.chinacloudapi.cn
description: ESTS 诊断跟踪日志表，记录认证过程中的详细诊断信息和异常
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

ESTS 诊断跟踪日志表，用于：
- 深度诊断认证错误
- 查看详细的异常堆栈
- 追踪认证流程的内部步骤
- 与 PerRequestTableIfx 联合查询获取完整信息

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| env_time | datetime | 事件时间戳 | 2026-01-01T00:00:00Z |
| env_name | string | 环境名称（标识服务角色） | ESTS-FrontEnd |
| CorrelationId | string | 请求关联 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| RequestId | string | 请求 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |
| Result | string | 结果状态 | Success, Failure |
| Message | string | 日志消息 | 详细的诊断信息 |
| Exception | string | 异常信息 | 异常堆栈 |
| BuildNumber | string | 构建版本号 | - |
| EventId | long | 事件 ID | - |
| Stage | long | 处理阶段 | - |

### 环境字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| env_cloud_role | string | 云角色 |
| env_cloud_environment | string | 云环境 |
| env_cloud_location | string | 云位置 |
| FaultDomain | string | 故障域 |
| Ring | string | 部署环 |

## 常用筛选字段

- `env_time` - 按时间筛选
- `CorrelationId` - 按关联 ID 精确查询
- `RequestId` - 按请求 ID 查询
- `Message` - 按消息内容搜索

## 典型应用场景

1. **认证错误诊断**: 查看详细的错误消息和异常堆栈
2. **流程追踪**: 按时间顺序追踪认证流程
3. **联合查询**: 与 UserErrorsIfx 联合查询获取完整诊断信息

## 示例查询

### 基础查询

```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').DiagnosticTracesIfx
| where env_time > ago(1d)
| where CorrelationId == "{correlationId}"
| project env_time, CorrelationId, Result, Message, Exception
| order by env_time asc
```

### 联合 DiagnosticTracesIfx 和 UserErrorsIfx

```kql
union DiagnosticTracesIfx, UserErrorsIfx
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * contains "{correlationId}"
| extend Messages = strcat(Message, Exception, ',RequestId:', RequestId)
| extend env_name = substring(env_name, 25)
| project env_time, env_name, CorrelationId, Result, Messages
| order by env_time asc
```

### 联合 PerRequestTableIfx 和 DiagnosticTracesIfx

```kql
union cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx,
      cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').DiagnosticTracesIfx
| where env_time > ago(15d)
| where CorrelationId == "{correlationId}"
| project env_time, Message, CorrelationId, RequestId, Result, ErrorCode,
    ApplicationDisplayName, DeviceId, MfaStatus, ClientIp
| limit 1000
```

## 关联表

- [PerRequestTableIfx.md](./PerRequestTableIfx.md) - 认证请求详情
- [UserErrorsIfx.md](./UserErrorsIfx.md) - 用户错误日志

## 注意事项

- 📊 **日志保留期**: 约 30 天
- 🔍 **推荐用法**: 与 UserErrorsIfx 联合查询获取完整诊断信息
- ⏱️ **时间排序**: 使用 `order by env_time asc` 按时间顺序追踪流程

---

> 文档版本: 1.0  
> 最后更新: 2026-01-14  
> 数据来源: .show table DiagnosticTracesIfx schema as json
