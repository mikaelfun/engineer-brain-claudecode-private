# ACR Push 失败与存储限制 — 排查工作流

**来源草稿**: (无专属草稿)
**Kusto 引用**: push-performance.md, storage-layer-performance.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Push 失败分析
> 来源: push-performance.md | 适用: Mooncake ✅

### 排查步骤

1. **查询 Push Manifest 错误趋势**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RegistryActivity
   | where PreciseTimeStamp > ago(30d)
   | where http_request_method == "PUT" and http_request_uri matches regex "/v2/(.+?)/manifests/(.*)"
   | extend Registry = http_request_host 
   | where Registry == "{registry}.azurecr.cn"
   | extend responseStatus = toint(http_response_status)
   | extend State = iff(responseStatus < 400, "Success", "CustomerError")
   | extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
   | summarize Total = count() by Day = bin(PreciseTimeStamp, 1d), State
   ```

2. **Push 操作统计**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RegistryActivity
   | where PreciseTimeStamp > ago(7d)
   | where http_request_host == "{registry}.azurecr.cn"
   | where message == "fe_request_stop"
   | where (http_request_method == "PATCH" and http_request_uri matches regex "/v2/.+/blobs/")
          or (http_request_method == "PUT" and http_request_uri matches regex "/v2/.+/manifests/")
   | extend ResponseCode = toint(http_response_status)
   | extend Status = iff(ResponseCode < 400, "Success", "Failed")
   | summarize TotalRequests = count(), SuccessCount = countif(Status == "Success"),
       FailedCount = countif(Status == "Failed")
     by bin(PreciseTimeStamp, 1h)
   | order by PreciseTimeStamp desc
   ```

3. **决策树**
   - ServerError (5xx) → 检查存储层 / Geo-Replication 同步
   - CustomerError (4xx) → 权限 / 配额 / Quarantine

---

## Scenario 2: 慢 Push 诊断
> 来源: push-performance.md, storage-layer-performance.md | 适用: Mooncake ✅

### 排查步骤

1. **Push 性能分析（上传速度）**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RegistryActivity
   | where PreciseTimeStamp > ago(7d)
   | where http_request_host == "{registry}.azurecr.cn"
   | extend ACRResponseDurationInSeconds = todouble(http_response_duration) / 1000
   | where (http_request_method == "PATCH" and http_request_uri matches regex "/v2/.+/blobs/" and
          todouble(http_request_bodylength) > 512 and ACRResponseDurationInSeconds > 1)
          or (http_request_method == "PUT" and http_request_uri matches regex "/v2/.+/manifests/")
   | where message == "fe_request_stop"
   | extend ContentLengthInMB = todouble(http_request_bodylength)/1000/1000
   | extend MBPerSecond = ContentLengthInMB / ACRResponseDurationInSeconds
   | project PreciseTimeStamp, vars_name, MBPerSecond, ContentLengthInMB, ACRResponseDurationInSeconds
   ```

2. **慢 Push 操作（>30秒）**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where http_request_host == "{registry}.azurecr.cn"
   | where message == "fe_request_stop"
   | where http_request_method == "PATCH" or http_request_method == "PUT"
   | extend DurationSeconds = todouble(http_response_duration) / 1000
   | where DurationSeconds > 30
   | project PreciseTimeStamp, vars_name, DurationSeconds, http_response_status, correlationid
   | order by DurationSeconds desc
   | take 100
   ```

---

## Scenario 3: 存储限制检查
> 来源: ado-wiki-a-technical-advisors-actions.md | 适用: Mooncake ✅

### 排查步骤

1. **客户端检查存储使用量**
   ```bash
   az acr show-usage -n <registry-name>
   ```

2. **Kusto 查看存储限制**
   ```kql
   cluster("ACR").database("acrprod").RegistryMasterData
   | where env_time > ago(1d)
   | where LoginServerName == "{registry}.azurecr.io"
   | project env_time, SizeThresholdInTiB = (tolong(SizeThresholdInGiB)/1024)
   ```

3. **存储限制参考**
   | SKU | 包含存储 | 存储上限 |
   |-----|---------|--------|
   | Basic | 10 GB | 20 TB |
   | Standard | 100 GB | 20 TB |
   | Premium | 500 GB | 20 TB |

4. **超过 20 TB** → 联系 ACR PG 增加限制，按 per-GB 费率计费
