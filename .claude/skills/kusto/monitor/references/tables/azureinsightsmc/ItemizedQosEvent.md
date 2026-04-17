---
name: ItemizedQosEvent
database: azureinsightsmc
cluster: https://azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn
description: 诊断设置 QoS 事件，记录数据处理状态
status: active
---

# ItemizedQosEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | azureinsightsmc |
| 状态 | ✅ 可用 |

## 用途

记录诊断设置 (Diagnostic Settings) 的数据处理 QoS 事件，包括：
- 数据从源到目标的处理状态
- 处理延迟和吞吐量
- 错误和失败记录
- 目标 (Log Analytics/Event Hub/Storage Account) 写入状态

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 记录时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| EventName | string | 事件名称 |
| BlobPath | string | Blob 路径 |
| BlobSize | long | Blob 大小 |
| OutputSize | long | 输出大小 |
| WorkerLatencyInMs | long | Worker 延迟 (毫秒) |
| E2eLatencyInMs | long | 端到端延迟 (毫秒) |
| QueueMessageIdleTimeInMs | long | 队列消息空闲时间 |
| ProccessTimeInMs | long | 处理时间 |
| Result | string | 处理结果 |
| Error | string | 错误信息 |
| NumberOfRecordsInInputBlob | long | 输入 Blob 记录数 |
| DataRegion | string | 数据区域 |

### 目标处理时间字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| ProcessTimeInMsLogAnalyticsDestinations | long | Log Analytics 目标处理时间 |
| ProcessTimeInMsEventHubDestinations | long | Event Hub 目标处理时间 |
| ProcessTimeInMsStorageAccountDestinations | long | Storage Account 目标处理时间 |
| NumberOfUniqueLogAnalyticsDestinations | long | 唯一 LA 目标数 |
| NumberOfUniqueEventHubDestinations | long | 唯一 EH 目标数 |
| NumberOfUniqueStorageAccountDestinations | long | 唯一 SA 目标数 |

## 常用筛选字段

- `PreciseTimeStamp` - 按时间筛选
- `Result` - 按结果筛选 (Success/Failure)
- `Error` - 按错误筛选
- `DataRegion` - 按区域筛选

## 典型应用场景

1. **诊断设置数据未到达** - 检查 Result 和 Error
2. **分析处理延迟** - 查看 E2eLatencyInMs 和各目标处理时间
3. **排查目标写入问题** - 检查特定目标的处理时间和结果
4. **监控数据吞吐量** - 统计 NumberOfRecordsInInputBlob

## 示例查询

### 查询处理失败记录

```kql
let starttime = datetime({startDate});
let endtime = datetime({endDate});
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp between (starttime..endtime)
| where Result != "Success"
| project PreciseTimeStamp, EventName, Result, Error, BlobPath, E2eLatencyInMs
| order by PreciseTimeStamp desc
```

### 分析端到端延迟

```kql
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp > ago(1h)
| summarize 
    avg_e2e = avg(E2eLatencyInMs),
    p95_e2e = percentile(E2eLatencyInMs, 95),
    max_e2e = max(E2eLatencyInMs)
    by bin(PreciseTimeStamp, 5m)
| order by PreciseTimeStamp desc
```

### 按目标类型统计

```kql
cluster('azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn').database('azureinsightsmc').ItemizedQosEvent
| where PreciseTimeStamp > ago(1h)
| summarize 
    total_records = sum(NumberOfRecordsInInputBlob),
    la_destinations = sum(NumberOfUniqueLogAnalyticsDestinations),
    eh_destinations = sum(NumberOfUniqueEventHubDestinations),
    sa_destinations = sum(NumberOfUniqueStorageAccountDestinations)
    by bin(PreciseTimeStamp, 5m)
```

## 关联表

- [Traces-insights.md](./Traces-insights.md) - Azure Insights 跟踪日志
- [ActivityLogAlertsSliLogs.md](./ActivityLogAlertsSliLogs.md) - 活动日志警报 SLI

## 注意事项

- Result 字段为 "Success" 表示处理成功
- Error 字段包含失败原因详情
- E2eLatencyInMs 表示从数据产生到写入目标的端到端延迟
- 不同目标类型的处理时间分别记录
