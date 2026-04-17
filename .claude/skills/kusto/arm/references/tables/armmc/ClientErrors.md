---
name: ClientErrors
database: armmc
cluster: https://armmcadx.chinaeast2.kusto.chinacloudapi.cn
description: ARM 客户端错误日志
status: active
related_tables:
  - ClientRequests
  - Errors
schema_verified: 2026-01-14
---

# ClientErrors

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 (Mooncake) | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn |
| 集群 (Public) | https://armprodgbl.eastus.kusto.windows.net (使用 Unionizer) |
| 数据库 | armmc / ARMProd |
| 状态 | ✅ 可用 |
| Schema 验证时间 | 2026-01-14 |

## 用途

记录 ARM 客户端错误信息。用于诊断客户端请求失败、分析错误模式。

## 完整字段列表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Deployment | string | 部署实例 |
| Role | string | 角色 |
| RoleInstance | string | 角色实例 |
| Level | long | ETW 日志级别 |
| ProviderGuid | string | 提供程序 GUID |
| ProviderName | string | 提供程序名称 |
| EventId | long | 事件 ID |
| Pid | long | 进程 ID |
| Tid | long | 线程 ID |
| TaskName | string | 任务名称 |
| ActivityId | string | 活动 ID |
| correlationId | string | 关联 ID |
| tenantId | string | 租户 ID |
| subscriptionId | string | 订阅 ID |
| principalOid | string | 主体对象 ID |
| principalPuid | string | 主体 PUID |
| clientAgent | string | 客户端代理 |
| clientSessionId | string | 客户端会话 ID |
| clientIpAddress | string | 客户端 IP 地址 |
| clientApplicationId | string | 客户端应用 ID |
| id | string | ID |
| eventCorrelationId | string | 事件关联 ID |
| eventTimestamp | string | 事件时间戳 |
| eventName | string | 事件名称 |
| eventData | string | 事件数据 |
| durationInMilliseconds | long | 耗时(毫秒) |
| message | string | 错误消息 |
| code | string | 错误代码 |
| exception | string | 异常信息 |
| SourceNamespace | string | 源命名空间 |
| SourceMoniker | string | 源标识 |
| SourceVersion | string | 源版本 |
| RoleLocation | string | 角色位置 |
| ReleaseVersion | string | 发布版本 |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `correlationId` - 按关联 ID 筛选
- `code` - 按错误代码筛选
- `message` - 按错误消息筛选
- `clientApplicationId` - 按客户端应用筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **诊断客户端错误** - 分析 code、message、exception
2. **统计错误分布** - 按错误代码统计
3. **追踪特定客户端问题** - 结合 clientApplicationId
4. **关联完整请求链** - 使用 correlationId

## 示例查询

### 按 correlationId 查询客户端错误
```kql
cluster('armmcadx.chinaeast2').database('armmc').ClientErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where correlationId == "{correlationId}"
| project TIMESTAMP, code, message, exception, clientAgent, clientIpAddress
| order by TIMESTAMP asc
```

### 按订阅统计错误类型
```kql
cluster('armmcadx.chinaeast2').database('armmc').ClientErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where subscriptionId == "{subscription}"
| summarize count() by code, message
| order by count_ desc
```

### 查询特定错误代码
```kql
cluster('armmcadx.chinaeast2').database('armmc').ClientErrors
| where TIMESTAMP between (datetime({startDate})..datetime({endDate}))
| where code == "{errorCode}"
| project TIMESTAMP, subscriptionId, correlationId, message, exception
| order by TIMESTAMP desc
| take 100
```

## 关联表

- [ClientRequests.md](./ClientRequests.md) - 客户端请求
- [Errors.md](./Errors.md) - ARM 系统错误

## 注意事项

- `code` 字段包含标准化错误代码
- `message` 包含人类可读的错误描述
- `exception` 包含详细的异常堆栈信息
- 与 Errors 表不同，此表专注于客户端引起的错误
