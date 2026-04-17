# ACR 限流与间歇性错误 — 综合排查指南

**条目数**: 4 | **草稿融合数**: 1 | **Kusto 查询融合**: 2
**来源草稿**: ado-wiki-a-acr-kusto-queries.md
**Kusto 引用**: throttling-analysis.md, storage-layer-performance.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Customer exceeds the concurrent request limit for their ACR 
> 来源: ADO Wiki

1. 1) Verify throttling with Kusto: cluster('ACR').database('acrprod').RegistryActivity | where PreciseTimeStamp > ago(1d) | where err_code == 'toomanyrequests' | where http_request_host contains '<regis

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: Internal Azure Storage account used by ACR is experiencing b
> 来源: ADO Wiki

1. 1) Verify origin with Kusto: RegistryActivity | where http_response_status == '307' | where http_request_host == '<registry>.azurecr.io' | summarize count() by bin(PreciseTimeStamp, 1d), azure_blobacc

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: During image pull, ACR sends 307 redirect to Azure Blob Stor
> 来源: ADO Wiki

1. Retry the pull/push operation — since load balancer distributes across many front-end nodes, retries will likely hit healthy nodes. Azure Storage PG has optimized reboot logic to reduce incidents. For

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: Azure Storage tenant reboots cause temporary redirect issues
> 来源: ADO Wiki

1. Retry the pull/push request. Azure Storage tenants reboot and redirect queries to valid up-time tenants. For throttling due to high concurrency, reduce concurrent pull rate. Confirm 502s with Kusto on

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Kusto 查询模板

#### throttling-analysis.md
`[工具: Kusto skill — throttling-analysis.md]`

```kusto
let throttledRequests = (
    cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
    | where PreciseTimeStamp > ago(7d)
    | where http_request_host == "{registry}.azurecr.cn"
    | where http_response_status == "429"
    | project correlationid
);
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where correlationid in (throttledRequests)
| where message == "fe_request_stop" or message == "ts_request_stop" or message startswith "nginx"
| summarize count() by correlationid
| extend throttledby = iff(count_ > 1, "FE/TS", "nginx")
| summarize count() by throttledby
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status == "429"
| summarize 
    ThrottledCount = count(),
    UniqueIPs = dcount(http_request_remoteaddr),
    UniqueUserAgents = dcount(http_request_useragent)
  by bin(PreciseTimeStamp, 1h)
| order by PreciseTimeStamp desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status == "429"
| project PreciseTimeStamp, http_request_method, http_request_uri, 
         http_request_remoteaddr, http_request_useragent, 
         acr_ratelimiter_remainingrequestvalue, acr_ratelimiter_retryafter,
         correlationid
| order by PreciseTimeStamp desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status == "429"
| summarize 
    ThrottledCount = count(),
    LastThrottled = max(PreciseTimeStamp),
    UserAgents = make_set(http_request_useragent, 5)
  by http_request_remoteaddr
| order by ThrottledCount desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1h)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop"
| summarize RequestCount = count() by bin(PreciseTimeStamp, 1m), http_request_remoteaddr
| order by RequestCount desc
| take 100
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop" or message == "ts_request_stop"
| extend IsThrottled = http_response_status == "429"
| summarize 
    TotalRequests = count(),
    ThrottledRequests = countif(IsThrottled),
    ThrottleRate = round(100.0 * countif(IsThrottled) / count(), 2)
  by bin(PreciseTimeStamp, 1h)
| order by PreciseTimeStamp desc
```


#### storage-layer-performance.md
`[工具: Kusto skill — storage-layer-performance.md]`

```kusto
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

```kusto
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

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').StorageAccountLogs
| where env_time > ago(1d)
| where ReferrerHeader contains "{registry}.azurecr.cn"
| where toint(HttpStatusCode) >= 400
| project env_time, OperationType, HttpStatusCode, RequestStatus, 
         RequestUrl, RequesterIPAddress, UserAgentHeader
| order by env_time desc
```

```kusto
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

```kusto
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


---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ACR returns 'too many requests' throttling error during imag | Customer exceeds the concurrent request | → Phase 1 |
| Intermittent 503 'Egress is over the account limit' errors d | Internal Azure Storage account used | → Phase 2 |
| Intermittent 502 Bad Gateway errors during ACR image pull/pu | During image pull, ACR sends | → Phase 3 |
| Intermittent HTTP 502 responses from ACR during image pull/p | Azure Storage tenant reboots cause | → Phase 4 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR returns 'too many requests' throttling error during image pull or push opera | Customer exceeds the concurrent request limit for their ACR tier (e.g., 10 concu | 1) Verify throttling with Kusto: cluster('ACR').database('acrprod').RegistryActi | 🟢 8.0 | ADO Wiki |
| 2 | Intermittent 503 'Egress is over the account limit' errors during ACR image pull | Internal Azure Storage account used by ACR is experiencing bandwidth throttling. | 1) Verify origin with Kusto: RegistryActivity | where http_response_status == '3 | 🟢 8.0 | ADO Wiki |
| 3 | Intermittent 502 Bad Gateway errors during ACR image pull/push operations; 'conn | During image pull, ACR sends 307 redirect to Azure Blob Storage for layer downlo | Retry the pull/push operation — since load balancer distributes across many fron | 🟢 8.0 | ADO Wiki |
| 4 | Intermittent HTTP 502 responses from ACR during image pull/push operations. Erro | Azure Storage tenant reboots cause temporary redirect issues in the ACR backend. | Retry the pull/push request. Azure Storage tenants reboot and redirect queries t | 🟢 8.0 | ADO Wiki |
