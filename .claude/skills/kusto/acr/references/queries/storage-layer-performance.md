---
name: storage-layer-performance
description: ACR 存储层性能分析
tables:
  - StorageAccountLogs
parameters:
  - name: registry
    required: true
    description: ACR 登录服务器名称（不含 .azurecr.cn）
  - name: starttime
    required: true
    description: 开始时间 (ISO 8601 格式)
  - name: endtime
    required: true
    description: 结束时间 (ISO 8601 格式)
---

# 存储层性能分析

## 用途

分析镜像层下载/上传与 Azure Storage 交互的性能，包括延迟、吞吐量等。

## 查询 1: Pull 层下载性能

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {registry} | 是 | 注册表名称（不含 .azurecr.cn） |
| {starttime} | 是 | 开始时间 (ISO 8601 格式) |
| {endtime} | 是 | 结束时间 (ISO 8601 格式) |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let registryloginurl = "{registry}.azurecr.cn";
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').StorageAccountLogs
| where env_time between((starttime-totimespan(1h)) .. (endtime+totimespan(1h)))
| where todatetime(RequestStartTime) between(starttime .. endtime)
| where OperationType == "GetBlob"
| where ReferrerHeader startswith (strcat("https://", registryloginurl))
| where UserAgentHeader contains "docker"
| extend EndToEndLatencyInSecond = totimespan(EndToEndLatency)/totimespan(1s)
| extend AzureBlobServerLatencyInSecond = totimespan(ServerLatency)/totimespan(1s)
| extend LayerSizeInMB = todouble(ResponsePacketSize)/1000/1000
| where ResponsePacketSize > 1000 and EndToEndLatencyInSecond > 1
| extend MBPerSecond = LayerSizeInMB/EndToEndLatencyInSecond
| project RequestStartTime, MBPerSecond, EndToEndLatencyInSecond, 
         AzureBlobServerLatencyInSecond, LayerSizeInMB, RequestUrl, ReferrerHeader
| sort by MBPerSecond asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| MBPerSecond | 下载速度 (MB/s) |
| EndToEndLatencyInSecond | 端到端延迟 (秒) |
| AzureBlobServerLatencyInSecond | Azure 服务器延迟 (秒) |
| LayerSizeInMB | 层大小 (MB) |

---

## 查询 2: 存储延迟统计

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').StorageAccountLogs
| where env_time > ago(1d)
| where ReferrerHeader contains "{registry}.azurecr.cn"
| extend LatencySeconds = totimespan(EndToEndLatency)/totimespan(1s)
| summarize 
    AvgLatency = avg(LatencySeconds),
    P50Latency = percentile(LatencySeconds, 50),
    P95Latency = percentile(LatencySeconds, 95),
    P99Latency = percentile(LatencySeconds, 99),
    Count = count()
  by OperationType, bin(env_time, 1h)
| order by env_time desc
```

---

## 查询 3: 存储错误分析

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').StorageAccountLogs
| where env_time > ago(1d)
| where ReferrerHeader contains "{registry}.azurecr.cn"
| where toint(HttpStatusCode) >= 400
| project env_time, OperationType, HttpStatusCode, RequestStatus, 
         RequestUrl, RequesterIPAddress, UserAgentHeader
| order by env_time desc
```

---

## 查询 4: 存储吞吐量统计

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').StorageAccountLogs
| where env_time > ago(1d)
| where ReferrerHeader contains "{registry}.azurecr.cn"
| where OperationType in ("GetBlob", "PutBlob")
| extend DataSizeMB = todouble(ResponsePacketSize + RequestContentLength)/1000/1000
| summarize 
    TotalDataMB = sum(DataSizeMB),
    RequestCount = count(),
    AvgLatencyMs = avg(totimespan(EndToEndLatency)/totimespan(1ms))
  by OperationType, bin(env_time, 1h)
| order by env_time desc
```

---

## 查询 5: 慢存储操作

### 查询语句

```kql
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').StorageAccountLogs
| where env_time > ago(1d)
| where ReferrerHeader contains "{registry}.azurecr.cn"
| extend LatencySeconds = totimespan(EndToEndLatency)/totimespan(1s)
| where LatencySeconds > 10
| project env_time, OperationType, LatencySeconds, 
         ResponsePacketSize, RequestContentLength, HttpStatusCode,
         RequestUrl, UserAgentHeader
| order by LatencySeconds desc
| take 100
```

## 关联查询

- [push-performance.md](./push-performance.md) - Push 性能分析
- [pull-performance.md](./pull-performance.md) - Pull 性能分析
