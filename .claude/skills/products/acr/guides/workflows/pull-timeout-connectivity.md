# ACR Pull 超时与连接问题 — 排查工作流

**来源草稿**: (无专属草稿)
**Kusto 引用**: pull-performance.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Pull 失败分析 (4xx/5xx)
> 来源: pull-performance.md | 适用: Mooncake ✅

### 排查步骤

1. **查询 Pull 失败详情**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where http_request_host == "{registry}.azurecr.cn"
   | where http_request_method == "GET"
   | where toint(http_response_status) >= 400
   | where http_request_uri matches regex "/v2/.+/(blobs|manifests)/"
   | project PreciseTimeStamp, vars_name, vars_reference, http_response_status, 
            err_code, err_message, err_detail, http_request_uri, http_request_remoteaddr,
            http_request_useragent, correlationid
   | order by PreciseTimeStamp desc
   ```

2. **分类错误**
   - 401/403 → 认证/权限问题，转 authentication-login 工作流
   - 404 → 镜像不存在 / TAG 不存在
   - 429 → 限流，转 throttling-intermittent 工作流
   - 500/502/503 → 服务端问题

3. **查询 Manifest 获取错误**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
   | where activitytimestamp > ago(2d)
   | where http_request_method == "GET" and http_request_uri contains "/manifests/"
   | extend Registry = http_request_host 
   | where Registry == "{registry}.azurecr.cn"
   | extend responseStatus = toint(http_response_status)
   | extend State = iff(responseStatus < 400, "Success", "CustomerError")
   | extend State = iff(State == "CustomerError" and responseStatus >= 500, "ServerError", State)
   | project activitytimestamp, correlationid, http_request_host, http_request_method, 
            http_request_uri, http_request_useragent, level, message, auth_token_access, 
            be_err_code, be_err_detail, be_err_message
   ```

---

## Scenario 2: Pull 超时 / 慢 Pull 诊断
> 来源: pull-performance.md | 适用: Mooncake ✅

### 排查步骤

1. **查询慢 Pull 操作（>10秒）**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where http_request_host == "{registry}.azurecr.cn"
   | where message == "fe_request_stop"
   | where http_request_method == "GET"
   | where http_request_uri matches regex "/v2/.+/(blobs|manifests)/"
   | extend DurationSeconds = todouble(http_response_duration) / 1000
   | where DurationSeconds > 10
   | project PreciseTimeStamp, vars_name, http_request_uri, DurationSeconds, 
            http_response_status, http_response_written, correlationid
   | order by DurationSeconds desc
   | take 100
   ```

2. **Pull 操作成功率统计**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
   | where PreciseTimeStamp > ago(7d)
   | where http_request_host == "{registry}.azurecr.cn"
   | where message == "fe_request_stop"
   | where http_request_method == "GET" 
   | where http_request_uri matches regex "/v2/.+/(blobs|manifests)/"
   | extend ResponseCode = toint(http_response_status)
   | extend Status = iff(ResponseCode < 400, "Success", "Failed")
   | extend RequestType = iff(http_request_uri contains "/manifests/", "Manifest", "Blob")
   | summarize 
       TotalRequests = count(),
       SuccessCount = countif(Status == "Success"),
       FailedCount = countif(Status == "Failed"),
       AvgDurationMs = avg(todouble(http_response_duration))
     by bin(PreciseTimeStamp, 1h), RequestType
   | order by PreciseTimeStamp desc
   ```

3. **决策树**
   - 平均延迟高 + 成功率正常 → 网络/存储层问题，检查 storage-layer-performance
   - 间歇性失败 → 可能是 Azure Storage 重启，参考 throttling-intermittent 工作流
   - 持续超时 → 检查 NSG / 防火墙规则 / DNS

---

## Scenario 3: i/o timeout / context deadline exceeded
> 来源: pull-performance.md | 适用: Mooncake ✅

### 排查步骤

1. **确认错误类型**
   - `dial tcp x.x.x.x:443: i/o timeout` → 网络不通
   - `context deadline exceeded` → 请求超时

2. **检查网络连通性**
   ```bash
   # 从客户端测试
   curl -v https://<registry>.azurecr.cn/v2/
   nslookup <registry>.azurecr.cn
   ```

3. **检查 NSG 规则**
   - 确保出站 443 端口对 ACR 数据端点开放
   - 检查 storage endpoint 是否可达

4. **检查 MCR 连通性**（如果是 MCR 镜像）
   ```bash
   docker pull mcr.microsoft.com/hello-world
   ```

---

## Scenario 4: Pull 操作概览
> 来源: pull-performance.md | 适用: Mooncake ✅

### 排查步骤

1. **Pull 操作概览（最近 2 小时）**
   ```kql
   cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
   | where PreciseTimeStamp > ago(2h)
   | where http_request_host == "{registry}.azurecr.cn"
   | where (http_request_method == "GET" and http_request_uri matches regex "/v2/.+/blobs/")
     or (http_request_method == "GET" and http_request_uri matches regex "/v2/.+/manifests/")
   | where message contains "fe_request_stop"
   | project PreciseTimeStamp, correlationid, http_request_host, http_request_method, 
            http_request_uri, http_response_status, vars_digest, vars_name, be_err_code, 
            be_err_detail, be_err_message, message
   ```

2. **检查后端错误代码 (be_err_code)**
   - 非空 → 后端存储层错误
   - 为空 + 4xx → 客户端问题
