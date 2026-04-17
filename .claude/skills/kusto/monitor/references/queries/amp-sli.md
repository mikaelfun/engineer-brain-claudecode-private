---
name: amp-sli
description: 警报管理平台 (AMP) SLI 指标查询
tables:
  - AmpSliLogs
  - LogSearchRuleSliLogs
  - ActivityLogAlertsSliLogs
parameters:
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
---

# 警报管理平台 SLI 指标查询

## 用途

查询 Azure Alerts Management Platform (AMP) 的 SLI (Service Level Indicator) 指标，用于：
- 监控服务健康状态
- 分析服务延迟
- 追踪服务可用性

---

## 查询 1: AMP SLI 指标概览

### 用途
查看警报管理平台的 SLI 指标概览。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').AmpSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize 
    avg_value = avg(Value),
    min_value = min(Value),
    max_value = max(Value),
    count = count()
    by MetricName
| order by count desc
```

---

## 查询 2: AMP SLI 时间序列

### 用途
生成 SLI 指标的时间序列视图。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').AmpSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize avg(Value) by MetricName, bin(MetricTimestamp, 5m)
| order by MetricTimestamp desc
| render timechart
```

---

## 查询 3: 按区域统计 AMP SLI

### 用途
按区域分析 SLI 指标。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').AmpSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize 
    avg_value = avg(Value),
    count = count()
    by Location, MetricName
| order by count desc
```

---

## 查询 4: Log Search Rule SLI

### 用途
查询日志搜索规则服务的 SLI 指标。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').LogSearchRuleSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize 
    avg_value = avg(Value),
    min_value = min(Value),
    max_value = max(Value),
    count = count()
    by MetricName
| order by count desc
```

---

## 查询 5: Activity Log Alerts SLI

### 用途
查询活动日志警报服务的 SLI 指标。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ActivityLogAlertsSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize 
    avg_value = avg(Value),
    min_value = min(Value),
    max_value = max(Value),
    count = count()
    by MetricName
| order by count desc
```

---

## 查询 6: 跨服务 SLI 对比

### 用途
对比不同 Monitor 服务的 SLI 指标。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
let amp_sli = cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').AmpSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize avg_value = avg(Value) by MetricName
| extend Service = "AMP";
let lsr_sli = cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').LogSearchRuleSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize avg_value = avg(Value) by MetricName
| extend Service = "LogSearchRule";
let ala_sli = cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ActivityLogAlertsSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize avg_value = avg(Value) by MetricName
| extend Service = "ActivityLogAlerts";
union amp_sli, lsr_sli, ala_sli
| order by Service, MetricName
```

## 关联查询

- [metric-alerts.md](./metric-alerts.md) - Metric Alerts 查询
- [scheduled-query-rules.md](./scheduled-query-rules.md) - Scheduled Query Rules 查询
- [diagnostic-settings.md](./diagnostic-settings.md) - 诊断设置查询
