# Monitor Log Analytics 综合问题 — 排查工作流

**来源草稿**: [ado-wiki-a-Check-LA-Agent-Report-Heartbeat-ASC.md], [ado-wiki-a-check-portal-page-la-ownership.md], [ado-wiki-a-TLS-Retirement-Log-Analytics-guidance.md], [ado-wiki-a-tsg-no-data-in-la-and-missing-logs.md], [ado-wiki-b-SLA-Report-workbook.md], [ado-wiki-d-DS-Latency-OBO-Shoebox-LA-EventHub.md], [ado-wiki-d-la-draft-team-escalation.md], [ado-wiki-d-la-portal-escalation.md], ... (13 total)
**Kusto 引用**: [amp-sli.md], [amp-sli.md], [amp-sli.md], [amp-sli.md], [amp-sli.md]
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: ---
> 来源: ado-wiki-a-tsg-no-data-in-la-and-missing-logs.md | 适用: Mooncake ✅

---

## Scenario 2: Questions about the Downtime & Outages workbook output in Application Insights Availability Tests.
> 来源: ado-wiki-b-SLA-Report-workbook.md | 适用: Mooncake ✅

---

## Scenario 3: ---
> 来源: ado-wiki-d-DS-Latency-OBO-Shoebox-LA-EventHub.md | 适用: Mooncake ✅

---

## Kusto 诊断查询

### 查询来源: amp-sli.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').AmpSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize 
    avg_value = avg(Value),
    min_value = min(Value),
    
```
[工具: Kusto skill — amp-sli.md]

### 查询来源: amp-sli.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').AmpSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize avg(Value) by MetricName, bin(MetricTimestamp, 5m)
| order by
```
[工具: Kusto skill — amp-sli.md]

### 查询来源: amp-sli.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('AzureAlertsManagement').AmpSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize 
    avg_value = avg(Value),
    count = count()
    by Locat
```
[工具: Kusto skill — amp-sli.md]

### 查询来源: amp-sli.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn').database('LogSearchRule').LogSearchRuleSliLogs
| where TIMESTAMP between (starttime..endtime)
| summarize 
    avg_value = avg(Value),
    min_value = min(Value),
  
```
[工具: Kusto skill — amp-sli.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见上述场景 | 按步骤排查 | → details/la-general.md |
