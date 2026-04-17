---
name: Traces
database: azureinsightsmc
cluster: https://azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn
description: Azure Insights 跟踪日志
status: active
---

# Traces (azureinsightsmc)

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | azureinsightsmc |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Monitor Insights 服务的跟踪日志，包括：
- 诊断设置操作日志
- Azure Insights 服务请求日志
- 数据处理跟踪

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 记录时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Tenant | string | 租户 |
| Role | string | 角色 |
| RoleInstance | string | 角色实例 |
| Level | long | 日志级别 |
| message | string | 日志消息 |
| requestId | string | 请求 ID |
| subscriptionId | string | 订阅 ID |
| clientRequestId | string | 客户端请求 ID |
| correlationId | string | 关联 ID |
| operationName | string | 操作名称 |
| tenantId | string | 租户 ID |
| principalId | string | 主体 ID |
| principalOid | string | 主体 OID |
| exception | string | 异常信息 |

## 常用筛选字段

- `PreciseTimeStamp` / `TIMESTAMP` - 按时间筛选
- `subscriptionId` - 按订阅筛选
- `operationName` - 按操作名称筛选
- `correlationId` - 按关联 ID 追踪

## 典型应用场景

1. **诊断设置问题排查** - 查询数据处理状态
2. **追踪请求链路** - 使用 correlationId 关联
3. **查看错误详情** - 检查 exception 字段

## 示例查询

### 按订阅查询日志

```kql
let subscriptionId = "{subscriptionId}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').Traces
| where PreciseTimeStamp between (starttime..endtime)
| where subscriptionId == subscriptionId
| project PreciseTimeStamp, operationName, message, exception
| order by PreciseTimeStamp desc
```

### 查询异常

```kql
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').Traces
| where PreciseTimeStamp > ago(1h)
| where isnotempty(exception)
| project PreciseTimeStamp, operationName, message, exception
| order by PreciseTimeStamp desc
| take 100
```

## 关联表

- [ItemizedQosEvent.md](./ItemizedQosEvent.md) - 诊断设置 QoS 事件
- [ActivityLogAlertsSliLogs.md](./ActivityLogAlertsSliLogs.md) - 活动日志警报 SLI
