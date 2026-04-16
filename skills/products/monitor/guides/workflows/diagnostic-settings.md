# Monitor 诊断设置与资源日志 — 排查工作流

**来源草稿**: [ado-wiki-a-Self-Diagnostics-How-it-works.md], [ado-wiki-a-Self-Diagnostics-What-Is-It.md], [ado-wiki-a-Self-Diagnostics-When-To-Use.md], [ado-wiki-b-Diagnostic-Log-Metrics-Telemetry-ASC.md], [ado-wiki-b-Diagnostic-Log-Metrics-Telemetry-Kusto.md], [ado-wiki-b-Diagnostic-Settings-Azure-Resources-ASC.md], [ado-wiki-b-Diagnostic-Settings-Azure-Resources-Kusto.md], [ado-wiki-b-grafana-kusto-diagnostics.md], ... (19 total)
**Kusto 引用**: [diagnostic-settings.md], [diagnostic-settings.md], [diagnostic-settings.md], [diagnostic-settings.md], [diagnostic-settings.md]
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: User has instrumented an application with Application Insights either via Auto Instrumentation or Ma
> 来源: ado-wiki-b-nodejs-diagnostic-logs.md | 适用: Mooncake ✅

---

## Scenario 2: ---
> 来源: ado-wiki-c-check-invalid-data-format-azurediagnostics.md | 适用: Mooncake ✅

---

## Scenario 3: ---
> 来源: ado-wiki-d-DS-ADF-Synapse-Diagnostic-Settings.md | 适用: Mooncake ✅

---

## Kusto 诊断查询

### 查询来源: diagnostic-settings.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp between (starttime..endtime)
| where Result != "Success"
| project 
    PreciseTimeStamp, 
    
```
[工具: Kusto skill — diagnostic-settings.md]

### 查询来源: diagnostic-settings.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp between (starttime..endtime)
| summarize 
    avg_e2e = avg(E2eLatencyInMs),
    p50_e2e = perc
```
[工具: Kusto skill — diagnostic-settings.md]

### 查询来源: diagnostic-settings.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp between (starttime..endtime)
| summarize 
    total_records = sum(NumberOfRecordsInInputBlob),

```
[工具: Kusto skill — diagnostic-settings.md]

### 查询来源: diagnostic-settings.md
> 适用: Mooncake ✅

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp between (starttime..endtime)
| summarize 
    success_count = countif(Result == "Success"),
   
```
[工具: Kusto skill — diagnostic-settings.md]

---

## 关联已知问题
| 症状 | 方案 | 指向 |
|------|------|------|
| 参见上述场景 | 按步骤排查 | → details/diagnostic-settings.md |
