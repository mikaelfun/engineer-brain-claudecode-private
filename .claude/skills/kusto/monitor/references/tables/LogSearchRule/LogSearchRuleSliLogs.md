---
name: LogSearchRuleSliLogs
database: LogSearchRule
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: 日志搜索规则 SLI 日志
status: active
---

# LogSearchRuleSliLogs

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | LogSearchRule |
| 状态 | ✅ 可用 |

## 用途

记录 Scheduled Query Rules (日志搜索规则) 的 SLI 指标日志，用于：
- 监控日志搜索规则服务健康状态
- 分析规则执行延迟
- 追踪服务可用性

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 记录时间戳 |
| MetricTimestamp | datetime | 指标时间戳 |
| MetricName | string | 指标名称 |
| Value | real | 指标值 |
| MonitoringSource | string | 监控来源 |
| Location | string | 区域位置 |
| SliCorrelationId | string | SLI 关联 ID |
| MetricInfo | dynamic | 指标详细信息 |

## 常用筛选字段

- `TIMESTAMP` / `MetricTimestamp` - 按时间筛选
- `MetricName` - 按指标名称筛选
- `Location` - 按区域筛选

## 示例查询

### 查询 SLI 指标

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').LogSearchRuleSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize avg(Value) by MetricName, bin(MetricTimestamp, 5m)
| order by MetricTimestamp desc
```

## 关联表

- [traces-logsearchrule.md](./traces-logsearchrule.md) - 日志搜索规则执行日志
