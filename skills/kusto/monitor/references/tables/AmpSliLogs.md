---
name: AmpSliLogs
database: AzureAlertsManagement
cluster: https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn
description: 警报管理平台 SLI 日志
status: active
---

# AmpSliLogs

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | AzureAlertsManagement |
| 状态 | ✅ 可用 |

## 用途

记录 Azure Alerts Management Platform (AMP) 的 SLI (Service Level Indicator) 指标日志，用于：
- 监控警报服务健康状态
- 分析警报处理延迟
- 追踪服务可用性

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 记录时间戳 |
| MetricTimestamp | datetime | 指标时间戳 |
| MetricName | string | 指标名称 |
| Value | long | 指标值 |
| MonitoringSource | string | 监控来源 |
| MonitoringSystem | string | 监控系统 |
| Location | string | 区域位置 |
| SliCorrelationId | string | SLI 关联 ID |
| SubscriptionId | string | 订阅 ID |
| MetricInfo | dynamic | 指标详细信息 |

## 常用筛选字段

- `TIMESTAMP` / `MetricTimestamp` - 按时间筛选
- `MetricName` - 按指标名称筛选
- `Location` - 按区域筛选
- `SubscriptionId` - 按订阅筛选

## 典型应用场景

1. **监控警报服务 SLI** - 查看服务健康指标
2. **分析处理延迟** - 追踪指标值变化
3. **区域级问题排查** - 按 Location 分析

## 示例查询

### 查询 SLI 指标

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').AmpSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize avg(Value) by MetricName, bin(MetricTimestamp, 5m)
| order by MetricTimestamp desc
```

### 按区域统计

```kql
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').AmpSliLogs
| where TIMESTAMP > ago(1h)
| summarize count(), avg(Value) by Location, MetricName
| order by count_ desc
```

## 关联表

- [traces-alerts.md](./traces-alerts.md) - 警报处理跟踪日志

## 注意事项

- SLI 日志主要用于服务健康监控
- 与业务警报触发记录区分，业务记录请查询 traces 表
