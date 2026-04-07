# ACR Push 失败与存储限制 — 综合排查指南

**条目数**: 6 | **草稿融合数**: 0 | **Kusto 查询融合**: 2
**Kusto 引用**: push-performance.md, storage-layer-performance.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure quarantine feature blocks content from being pushed. Q
> 来源: ADO Wiki

1. 1) Get ACR resource ID: id=$(az acr show --name <registry> --query id -o tsv). 2) Disable quarantine: az resource update --ids $id --set properties.policies.quarantinePolicy.status=disabled. 3) Retry 

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: Backend permission issue: a required role assignment for the
> 来源: ADO Wiki

1. 1) Check ARM incoming requests (armprodgbl) to find the delete/create correlationId. 2) Cross-reference with ACR RP logs: cluster('ACR').database('acrprod').RPActivity | where CorrelationId == '<clien

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: The container registry has reached its 40 TiB per-registry s
> 来源: ADO Wiki

1. 1) Verify storage usage: az acr show-usage -r {registryName}. 2) Advise customer to set up retention policy, auto-purge, and delete unused images. 3) If increase needed: open ICM to ACR PG with subscr

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: Geo-replication sync delay: when one region's replica reache
> 来源: ADO Wiki

1. 1) Check storage usage per region. 2) Implement purge/retention to free space below 40TiB. 3) If storage increase is needed, note that registries above 60TB cannot create new geo-replications. 4) Exis

`[结论: 🟢 9.0/10 — ADO Wiki]`

### Phase 5: ACR registry has reached the 20TB storage limit. All service
> 来源: ADO Wiki

1. Contact ACR PG team to increase the storage limit beyond 20TB (customer pays per-GB rate for additional storage). Check current limit via Kusto: 'cluster("ACR").database("acrprod").RegistryMasterData 

`[结论: 🟢 9.0/10 — ADO Wiki]`

### Phase 6: Either the repository/image/manifest has writeEnabled set to
> 来源: MS Learn

1. 1) Check lock: az acr repository show --name <reg> --repository <repo> - if writeEnabled is false, unlock with az acr repository update --write-enabled true. 2) Check storage usage against the 40 TiB 

`[结论: 🟢 8.0/10 — MS Learn]`

### Kusto 查询模板

#### push-performance.md
`[工具: Kusto skill — push-performance.md]`

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| extend ACRResponseDurationInSeconds = todouble(http_response_duration) / 1000
| where (http_request_method == "PATCH" and http_request_uri matches regex "/v2/.+/blobs/" and
        todouble(http_request_bodylength) > 512 and ACRResponseDurationInSeconds > 1)
        or (http_request_method == "PUT" and http_request_uri matches regex "/v2/.+/manifests/")
| where message == "fe_request_stop"
| extend ContentLengthInMB = todouble(http_request_bodylength)/1000/1000
| extend MBPerSecond = ContentLengthInMB / ACRResponseDurationInSeconds
| project PreciseTimeStamp, vars_name, MBPerSecond, ContentLengthInMB, 
         ACRResponseDurationInSeconds, http_request_method, http_request_uri
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(30d)
| where http_request_method == "PUT" and http_request_uri matches regex "/v2/(.+?)/manifests/(.*)"
| extend Registry = http_request_host 
| where Registry == "{registry}.azurecr.cn"
| extend responseStatus = toint(http_response_status)
| extend State = iff(responseStatus < 400, "Success", "CustomerError")
| extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
| extend Message = iff(State == "ServerError", strcat("SERVER ERROR: ", message), "SUCCESS")
| extend Message = iff(State == "CustomerError", "CUSTOMER ERROR", Message)
| summarize Total = count() by Day = bin(PreciseTimeStamp, 1d), Message
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop"
| where (http_request_method == "PATCH" and http_request_uri matches regex "/v2/.+/blobs/")
        or (http_request_method == "PUT" and http_request_uri matches regex "/v2/.+/manifests/")
| extend ResponseCode = toint(http_response_status)
| extend Status = iff(ResponseCode < 400, "Success", "Failed")
| summarize 
    TotalRequests = count(),
    SuccessCount = countif(Status == "Success"),
    FailedCount = countif(Status == "Failed"),
    AvgDurationMs = avg(todouble(http_response_duration)),
    AvgSizeMB = avg(todouble(http_request_bodylength)/1000/1000)
  by bin(PreciseTimeStamp, 1h)
| order by PreciseTimeStamp desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where message == "fe_request_stop"
| where http_request_method == "PATCH" or http_request_method == "PUT"
| extend DurationSeconds = todouble(http_response_duration) / 1000
| where DurationSeconds > 30
| project PreciseTimeStamp, vars_name, http_request_method, http_request_uri,
         DurationSeconds, http_request_bodylength, http_response_status, correlationid
| order by DurationSeconds desc
| take 100
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
| Docker/Helm push to ACR succeeds without error but pushed im | Azure quarantine feature blocks content | → Phase 1 |
| ACR replication stuck in creating or deleting state — delete | Backend permission issue: a required | → Phase 2 |
| ACR push or pull fails with 'unknown: The operation is disal | The container registry has reached | → Phase 3 |
| Intermittent push failures on geo-replicated ACR when storag | Geo-replication sync delay: when one | → Phase 4 |
| Customer cannot push new images to ACR registry. Push operat | ACR registry has reached the | → Phase 5 |
| ACR push fails with operation is disallowed - writeEnabled f | Either the repository/image/manifest has | → Phase 6 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Docker/Helm push to ACR succeeds without error but pushed image has no content - | Azure quarantine feature blocks content from being pushed. Quarantine is auto-en | 1) Get ACR resource ID: id=$(az acr show --name <registry> --query id -o tsv). 2 | 🟢 8.0 | ADO Wiki |
| 2 | ACR replication stuck in creating or deleting state — delete/create operations n | Backend permission issue: a required role assignment for the ACR first-party app | 1) Check ARM incoming requests (armprodgbl) to find the delete/create correlatio | 🟢 8.0 | ADO Wiki |
| 3 | ACR push or pull fails with 'unknown: The operation is disallowed on this regist | The container registry has reached its 40 TiB per-registry storage limit; operat | 1) Verify storage usage: az acr show-usage -r {registryName}. 2) Advise customer | 🟢 8.0 | ADO Wiki |
| 4 | Intermittent push failures on geo-replicated ACR when storage is near the limit  | Geo-replication sync delay: when one region's replica reaches the storage limit  | 1) Check storage usage per region. 2) Implement purge/retention to free space be | 🟢 9.0 | ADO Wiki |
| 5 | Customer cannot push new images to ACR registry. Push operations fail. | ACR registry has reached the 20TB storage limit. All service tiers (Basic/Standa | Contact ACR PG team to increase the storage limit beyond 20TB (customer pays per | 🟢 9.0 | ADO Wiki |
| 6 | ACR push fails with operation is disallowed - writeEnabled false or storage limi | Either the repository/image/manifest has writeEnabled set to false (locked), or  | 1) Check lock: az acr repository show --name <reg> --repository <repo> - if writ | 🟢 8.0 | MS Learn |
