---
name: diagnostic-settings
description: 诊断设置问题排查查询
tables:
  - ItemizedQosEvent
  - Traces
parameters:
  - name: startDate
    required: true
    description: 开始时间
  - name: endDate
    required: true
    description: 结束时间
  - name: subscriptionId
    required: false
    description: 订阅 ID
---

# 诊断设置问题排查查询

## 用途

查询诊断设置 (Diagnostic Settings) 的数据处理状态，包括：
- 数据处理成功/失败
- 处理延迟分析
- 目标写入状态

---

## 查询 1: 查询处理失败记录

### 用途
查找诊断设置数据处理失败的记录。

### 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {startDate} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endDate} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp between (starttime..endtime)
| where Result != "Success"
| project 
    PreciseTimeStamp, 
    EventName, 
    Result, 
    Error, 
    BlobPath, 
    E2eLatencyInMs,
    DataRegion
| order by PreciseTimeStamp desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| PreciseTimeStamp | 精确时间戳 |
| EventName | 事件名称 |
| Result | 处理结果 |
| Error | 错误信息 |
| BlobPath | 数据 Blob 路径 |
| E2eLatencyInMs | 端到端延迟 |
| DataRegion | 数据区域 |

---

## 查询 2: 分析端到端延迟

### 用途
分析诊断设置数据处理的端到端延迟分布。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp between (starttime..endtime)
| summarize 
    avg_e2e = avg(E2eLatencyInMs),
    p50_e2e = percentile(E2eLatencyInMs, 50),
    p95_e2e = percentile(E2eLatencyInMs, 95),
    p99_e2e = percentile(E2eLatencyInMs, 99),
    max_e2e = max(E2eLatencyInMs),
    total_records = sum(NumberOfRecordsInInputBlob)
    by bin(PreciseTimeStamp, 5m)
| order by PreciseTimeStamp desc
```

---

## 查询 3: 按目标类型统计

### 用途
统计不同目标类型（Log Analytics/Event Hub/Storage Account）的数据处理情况。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp between (starttime..endtime)
| summarize 
    total_records = sum(NumberOfRecordsInInputBlob),
    la_destinations = sum(NumberOfUniqueLogAnalyticsDestinations),
    eh_destinations = sum(NumberOfUniqueEventHubDestinations),
    sa_destinations = sum(NumberOfUniqueStorageAccountDestinations),
    avg_la_time = avg(ProcessTimeInMsLogAnalyticsDestinations),
    avg_eh_time = avg(ProcessTimeInMsEventHubDestinations),
    avg_sa_time = avg(ProcessTimeInMsStorageAccountDestinations)
    by bin(PreciseTimeStamp, 5m)
| order by PreciseTimeStamp desc
```

---

## 查询 4: 按区域统计失败

### 用途
按数据区域统计处理失败情况。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp between (starttime..endtime)
| summarize 
    success_count = countif(Result == "Success"),
    failure_count = countif(Result != "Success"),
    success_rate = round(100.0 * countif(Result == "Success") / count(), 2)
    by DataRegion
| order by failure_count desc
```

---

## 查询 5: 错误类型分析

### 用途
分析失败的错误类型分布。

### 查询语句

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp between (starttime..endtime)
| where Result != "Success"
| summarize count() by Error
| order by count_ desc
| take 20
```

---

## 查询 6: Azure Insights Traces 日志

### 用途
查询 Azure Insights 服务的跟踪日志。

### 查询语句

```kql
let subscriptionId = "{subscriptionId}";
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').Traces
| where PreciseTimeStamp between (starttime..endtime)
| where subscriptionId == subscriptionId
| project 
    PreciseTimeStamp, 
    operationName, 
    message, 
    exception,
    correlationId
| order by PreciseTimeStamp desc
```

## 诊断步骤

1. **检查处理状态** - 使用查询 1 查找失败记录
2. **分析延迟** - 使用查询 2 检查是否有延迟问题
3. **检查目标** - 使用查询 3 确认各目标的处理情况
4. **分析错误** - 使用查询 5 了解错误类型

## 关联查询

- [amp-sli.md](./amp-sli.md) - AMP SLI 查询
