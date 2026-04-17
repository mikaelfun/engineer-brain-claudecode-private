# ACR Pull 超时与连接问题 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**Kusto 引用**: pull-performance.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Client firewall or network security rules are blocking the r
> 来源: ADO Wiki

1. Add the following firewall rules: 1) HTTPS to mcr.microsoft.com (REST endpoint). 2) HTTPS to *.data.mcr.microsoft.com (data endpoint, replaced *.cdn.mscr.io since March 2020). 3) Remove legacy *.cdn.m

`[结论: 🟢 9.0/10 — ADO Wiki]`

### Phase 2: AKS cluster is behind a proxy server or firewall that blocks
> 来源: ADO Wiki

1. Allow ACR endpoints on proxy/firewall: 1) https://<acr>.azurecr.io (REST endpoint), 2) https://<acr>.<region>.data.azurecr.io (data endpoint), 3) https://*.blob.core.windows.net (blob storage). See ht

`[结论: 🟢 9.0/10 — ADO Wiki]`

### Phase 3: Cloudflare CDN sometimes categorizes Docker image pull redir
> 来源: ADO Wiki

1. Modify internal firewall rules to allow WebRepositoryAndStorage traffic category, which includes Docker Hub redirect traffic through Cloudflare CDN. Restarting deployments provides temporary relief bu

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: Security appliances block outbound traffic to MCR proxy serv
> 来源: OneNote

1. 1) Ask customer to provide their outbound IP ranges. 2) Contact AKS PG (Andy Zhang) to whitelist the customer's outbound IPs on the MCR proxy. Process is simple — just email with the IP ranges.

`[结论: 🟢 9.5/10 — OneNote]`

### Phase 5: The device cannot resolve the ACR login server FQDN (<acr>.a
> 来源: MS Learn

1. 1) Run nslookup <acr>.azurecr.io to test DNS resolution. 2) Test with Azure DNS directly: nslookup <acr>.azurecr.io 168.63.129.16. 3) If Azure DNS resolves but device DNS does not, check custom DNS se

`[结论: 🔵 6.0/10 — MS Learn]`

### Phase 6: Port 443 connectivity to the ACR storage/data endpoint is bl
> 来源: MS Learn

1. 1) Test connectivity: telnet/nc to the data endpoint on port 443. 2) Allow the storage domain in firewall (prefer *.blob.core.windows.net or dedicated data endpoint FQDN over IP). 3) If using dedicate

2. 1) Test connectivity: telnet/nc <acr>.azurecr.io 443. 2) Check firewall/proxy/ACL/ISP restrictions. 3) For Azure VMs: use Network Watcher NSG Diagnostics to check outbound 443 to ACR login server IP. 

`[结论: 🟢 8.0/10 — MS Learn]`

### Phase 7: Network Security Group (NSG) associated with the VM NIC or s
> 来源: MS Learn

1. 1) Use Network Watcher NSG Diagnostics to check if traffic to Storage.<region> IPs is denied. 2) Add outbound allow rule for port 443 to Storage service tag or specific storage IPs. 3) Verify route ta

`[结论: 🔵 6.0/10 — MS Learn]`

### Kusto 查询模板

#### pull-performance.md
`[工具: Kusto skill — pull-performance.md]`

```kusto
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

```kusto
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

```kusto
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

```kusto
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

```kusto
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


---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Cannot pull images from Microsoft Container Registry (MCR) - | Client firewall or network security | → Phase 1 |
| AKS integrated with ACR via 'az aks update --attach-acr' fai | AKS cluster is behind a | → Phase 2 |
| Intermittent Docker pull failures from Docker Hub with EOF e | Cloudflare CDN sometimes categorizes Doc | → Phase 3 |
| AKS nodes lose access to MCR proxy after adding security app | Security appliances block outbound traff | → Phase 4 |
| Docker pull from ACR fails with context deadline exceeded er | The device cannot resolve the | → Phase 5 |
| Docker pull fails with I/O timeout: dial tcp <storage-ip>:44 | Port 443 connectivity to the | → Phase 6 |
| Docker pull from ACR on Azure VM fails with I/O timeout - NS | Network Security Group (NSG) associated | → Phase 7 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot pull images from Microsoft Container Registry (MCR) - connection timeouts | Client firewall or network security rules are blocking the required MCR endpoint | Add the following firewall rules: 1) HTTPS to mcr.microsoft.com (REST endpoint). | 🟢 9.0 | ADO Wiki |
| 2 | AKS integrated with ACR via 'az aks update --attach-acr' fails to pull images wi | AKS cluster is behind a proxy server or firewall that blocks outbound connection | Allow ACR endpoints on proxy/firewall: 1) https://<acr>.azurecr.io (REST endpoin | 🟢 9.0 | ADO Wiki |
| 3 | Intermittent Docker pull failures from Docker Hub with EOF error on Cloudflare C | Cloudflare CDN sometimes categorizes Docker image pull redirect requests as WebR | Modify internal firewall rules to allow WebRepositoryAndStorage traffic category | 🟢 8.0 | ADO Wiki |
| 4 | AKS nodes lose access to MCR proxy after adding security appliance (e.g., Zscale | Security appliances block outbound traffic to MCR proxy servers; the proxy IPs a | 1) Ask customer to provide their outbound IP ranges. 2) Contact AKS PG (Andy Zha | 🟢 9.5 | OneNote |
| 5 | Docker pull from ACR fails with context deadline exceeded error | The device cannot resolve the ACR login server FQDN (<acr>.azurecr.io) via DNS - | 1) Run nslookup <acr>.azurecr.io to test DNS resolution. 2) Test with Azure DNS  | 🔵 6.0 | MS Learn |
| 6 | Docker pull fails with I/O timeout: dial tcp <storage-ip>:443: i/o timeout - err | Port 443 connectivity to the ACR storage/data endpoint is blocked. ACR allocates | 1) Test connectivity: telnet/nc to the data endpoint on port 443. 2) Allow the s | 🟢 8.0 | MS Learn |
| 7 | Docker pull from ACR on Azure VM fails with I/O timeout - NSG blocking outbound  | Network Security Group (NSG) associated with the VM NIC or subnet is blocking ou | 1) Use Network Watcher NSG Diagnostics to check if traffic to Storage.<region> I | 🔵 6.0 | MS Learn |
| 8 | ACR pull/push fails with request canceled while waiting for connection (Client.T | Port 443 connectivity to the ACR login server (<acr>.azurecr.io) is blocked - po | 1) Test connectivity: telnet/nc <acr>.azurecr.io 443. 2) Check firewall/proxy/AC | 🔵 6.0 | MS Learn |
