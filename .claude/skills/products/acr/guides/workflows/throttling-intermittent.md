# ACR 限流与间歇性错误 — 排查工作流

**来源草稿**: ado-wiki-a-acr-kusto-queries.md
**Kusto 引用**: throttling-analysis.md, storage-layer-performance.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: 429 限流诊断
> 来源: throttling-analysis.md | 适用: Mooncake ✅

### 排查步骤

1. **确定限流位置（FE/TS vs nginx）**
   ```kql
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
   - FE/TS 限流 → 应用层限流，检查并发量
   - nginx 限流 → 入口层限流，请求量过大

2. **429 错误趋势分析**
   ```kql
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

3. **按来源 IP 统计限流**
   ```kql
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

4. **ACR SKU 限制参考**
   | SKU | 读取/分钟 | 写入/分钟 |
   |-----|----------|----------|
   | Basic | 1,000 | 100 |
   | Standard | 3,000 | 500 |
   | Premium | 10,000 | 2,000 |

---

## Scenario 2: 限流率分析与请求频率
> 来源: throttling-analysis.md | 适用: Mooncake ✅

### 排查步骤

1. **计算限流率**
   ```kql
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

2. **请求频率分析（每分钟每 IP）**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
   | where PreciseTimeStamp > ago(1h)
   | where http_request_host == "{registry}.azurecr.cn"
   | where message == "fe_request_stop"
   | summarize RequestCount = count() by bin(PreciseTimeStamp, 1m), http_request_remoteaddr
   | order by RequestCount desc
   | take 100
   ```

3. **决策**
   - ThrottleRate > 10% → 建议升级 SKU 或减少并发
   - 单 IP 请求过高 → 可能是自动化脚本/CI 并发过高

---

## Scenario 3: 间歇性 502 错误
> 来源: ado-wiki-a-acr-kusto-queries.md | 适用: Mooncake ✅

### 排查步骤

1. **检查 502 错误是否与 Storage 重启相关**
   - 502 通常由 Azure Storage tenant 重启导致
   - 重试 Pull 请求通常可以成功

2. **查询 Push/Pull 错误趋势**
   ```kql
   RegistryActivity
   | where PreciseTimeStamp > ago(7d)
   | where http_request_method == "GET" and http_request_uri contains "/manifests/"
   | extend responseStatus = toint(http_response_status)
   | extend State = iff(responseStatus < 400, "Success", "CustomerError")
   | extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
   | summarize Total = count() by Day = bin(PreciseTimeStamp, 1d), State
   ```

3. **如果 502 持续** → 检查存储层性能

---

## Scenario 4: 存储层性能问题
> 来源: storage-layer-performance.md | 适用: Mooncake ✅

### 排查步骤

1. **Pull 层下载性能分析**
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
   | extend LayerSizeInMB = todouble(ResponsePacketSize)/1000/1000
   | where ResponsePacketSize > 1000 and EndToEndLatencyInSecond > 1
   | extend MBPerSecond = LayerSizeInMB/EndToEndLatencyInSecond
   | project RequestStartTime, MBPerSecond, EndToEndLatencyInSecond, LayerSizeInMB
   | sort by MBPerSecond asc
   ```

2. **慢存储操作（>10秒）**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').StorageAccountLogs
   | where env_time > ago(1d)
   | where ReferrerHeader contains "{registry}.azurecr.cn"
   | extend LatencySeconds = totimespan(EndToEndLatency)/totimespan(1s)
   | where LatencySeconds > 10
   | project env_time, OperationType, LatencySeconds, ResponsePacketSize, HttpStatusCode
   | order by LatencySeconds desc
   | take 100
   ```

3. **存储延迟百分位统计**
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
