# ACR 防火墙与网络规则 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**Kusto 引用**: activity-errors.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: When ACR vNET firewall is enabled, docker pull traffic route
> 来源: ADO Wiki

1. 1) Allow ACR REST endpoint (myregistry.azurecr.io). 2) Allow data endpoint: registry_name.region.data.azurecr.io (dedicated data endpoint) or region-acr-dp.azurecr.io (data proxy). 3) For geo-replicat

`[结论: 🟢 9.0/10 — ADO Wiki]`

### Phase 2: Default behavior change in ACR: the new networkRuleBypassAll
> 来源: ADO Wiki

1. 1) Explicitly enable the new flag: az acr update --name <registry-name> --set networkRuleBypassAllowedForTasks=true. 2) Alternatively, use ACR Agent Pool (NOT available in 21V/Mooncake): az acr agentp

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: The Microsoft.ContainerRegistry resource provider is not reg
> 来源: ADO Wiki

1. Register Microsoft.ContainerRegistry RP in the second subscription: az login → az account set -s <sub_id> → az provider register --namespace Microsoft.ContainerRegistry. Then re-add the VNET/Subnet vi

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: Service Endpoint for Microsoft.ContainerRegistry created on 
> 来源: ADO Wiki

1. Remove the conflicting Service Endpoint for Microsoft.ContainerRegistry from the AKS subnet. Service Endpoints enable private IP communication which conflicts with ACR selected-networks public IP allo

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 5: ACR 'Selected Networks' firewall is enabled and the client's
> 来源: ADO Wiki

1. 1. Use Jarvis 'Get Registry Master Entity' action (same JIT as Private Endpoints) to view IP Rules on the ACR. 2. Check if client's public IP is listed in the 'IP rules' field of the output. 3. If not

`[结论: 🟢 9.0/10 — ADO Wiki]`

### Phase 6: az acr build uses ACR Tasks infrastructure which runs on Azu
> 来源: ADO Wiki

1. Option A (recommended, strict private-only): Create an ACR Dedicated Agent Pool injected into the VNet: az acr agentpool create --registry <acrName> --name <poolName> --tier S2 --subnet-id $subnetId. 

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 7: ACR built-in firewall is restricting public access - the cli
> 来源: MS Learn

1. Add the client IP to ACR firewall rules (Configure public IP network rules), or use Azure Private Link for private connectivity. Check Networking blade > Public access tab for current firewall config.

`[结论: 🟢 8.0/10 — MS Learn]`

### Phase 8: ACR Firewall is enabled but the IP ranges for the ACR build 
> 来源: OneNote

1. 1) Retrieve AzureContainerRegistry service tag IPs for your region: $serviceTags = Get-AzNetworkServiceTag -Location $region; ($serviceTags.Values | Where-Object {$_.Name -eq 'AzureContainerRegistry.$

`[结论: 🟢 9.5/10 — OneNote]`

### Kusto 查询模板

#### activity-errors.md
`[工具: Kusto skill — activity-errors.md]`

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where activitytimestamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where level == "error"
| where http_request_method != "HEAD"
| project PreciseTimeStamp, vars_name, message, err_message, err_detail, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, http_request_useragent, 
         correlationid, level
| order by PreciseTimeStamp asc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where correlationid == "{correlationId}"
| project activitytimestamp, message, auth_token_access, correlationid, err_code, err_detail, 
         err_message, http_request_host, http_request_id, http_request_method, http_request_uri, 
         http_response_status, level, service
| order by activitytimestamp asc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp between (datetime({starttime})..datetime({endtime}))
| where http_request_host == "{registry}.azurecr.cn"
| where level != "info"
| project PreciseTimeStamp, vars_name, message, err_message, err_detail, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, correlationid, level
| order by PreciseTimeStamp asc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where level == "error"
| summarize ErrorCount = count() by err_code, err_message, http_response_status
| order by ErrorCount desc
```


---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Docker pull from ACR fails (timeout/connection refused) when | When ACR vNET firewall is | → Phase 1 |
| ACR Tasks fail with 403 Forbidden errors after June 2025 — t | Default behavior change in ACR: | → Phase 2 |
| Unable to add VNET/Subnet from a different subscription to A | The Microsoft.ContainerRegistry resource | → Phase 3 |
| ACR image pull fails with 403 Forbidden when AKS uses select | Service Endpoint for Microsoft.Container | → Phase 4 |
| ACR pull/push fails with error 'client with IP is not allowe | ACR 'Selected Networks' firewall is | → Phase 5 |
| az acr build fails with "denied: client with IP X.X.X.X is n | az acr build uses ACR | → Phase 6 |
| ACR login/pull fails with client with IP <ip-address> is not | ACR built-in firewall is restricting | → Phase 7 |
| az acr build fails with error: 'client with IP x.x.x.x is no | ACR Firewall is enabled but | → Phase 8 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Docker pull from ACR fails (timeout/connection refused) when client runtime is b | When ACR vNET firewall is enabled, docker pull traffic routes through a regional | 1) Allow ACR REST endpoint (myregistry.azurecr.io). 2) Allow data endpoint: regi | 🟢 9.0 | ADO Wiki |
| 2 | ACR Tasks fail with 403 Forbidden errors after June 2025 — tasks that previously | Default behavior change in ACR: the new networkRuleBypassAllowedForTasks flag de | 1) Explicitly enable the new flag: az acr update --name <registry-name> --set ne | 🟢 8.0 | ADO Wiki |
| 3 | Unable to add VNET/Subnet from a different subscription to ACR firewall configur | The Microsoft.ContainerRegistry resource provider is not registered in the secon | Register Microsoft.ContainerRegistry RP in the second subscription: az login → a | 🟢 8.0 | ADO Wiki |
| 4 | ACR image pull fails with 403 Forbidden when AKS uses selected networks - despit | Service Endpoint for Microsoft.ContainerRegistry created on AKS subnet forces tr | Remove the conflicting Service Endpoint for Microsoft.ContainerRegistry from the | 🟢 8.0 | ADO Wiki |
| 5 | ACR pull/push fails with error 'client with IP is not allowed access. Refer http | ACR 'Selected Networks' firewall is enabled and the client's public IP address i | 1. Use Jarvis 'Get Registry Master Entity' action (same JIT as Private Endpoints | 🟢 9.0 | ADO Wiki |
| 6 | az acr build fails with "denied: client with IP X.X.X.X is not allowed access" w | az acr build uses ACR Tasks infrastructure which runs on Azure-managed compute,  | Option A (recommended, strict private-only): Create an ACR Dedicated Agent Pool  | 🟢 8.0 | ADO Wiki |
| 7 | ACR login/pull fails with client with IP <ip-address> is not allowed access (403 | ACR built-in firewall is restricting public access - the client IP is not in the | Add the client IP to ACR firewall rules (Configure public IP network rules), or  | 🟢 8.0 | MS Learn |
| 8 | az acr build fails with error: 'client with IP x.x.x.x is not allowed access' ev | ACR Firewall is enabled but the IP ranges for the ACR build service (AzureContai | 1) Retrieve AzureContainerRegistry service tag IPs for your region: $serviceTags | 🟢 9.5 | OneNote |
