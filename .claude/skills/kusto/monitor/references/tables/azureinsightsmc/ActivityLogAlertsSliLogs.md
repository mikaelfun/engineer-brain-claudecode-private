---
name: ActivityLogAlertsSliLogs
database: azureinsightsmc
cluster: https://azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn
description: 活动日志警报 SLI 日志
status: active
---

# ActivityLogAlertsSliLogs

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | azureinsightsmc |
| 状态 | ✅ 可用 |

## 用途

记录 Activity Log Alerts (活动日志警报) 的 SLI 指标日志，用于：
- 监控活动日志警报服务健康状态
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
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ActivityLogAlertsSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize avg(Value) by MetricName, bin(MetricTimestamp, 5m)
| order by MetricTimestamp desc
```

### 按区域统计

```kql
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ActivityLogAlertsSliLogs
| where TIMESTAMP > ago(1h)
| summarize count(), avg(Value) by Location, MetricName
| order by count_ desc
```

## 关联表

- [Traces-insights.md](./Traces-insights.md) - Azure Insights 跟踪日志
- [ItemizedQosEvent.md](./ItemizedQosEvent.md) - 诊断设置 QoS 事件
