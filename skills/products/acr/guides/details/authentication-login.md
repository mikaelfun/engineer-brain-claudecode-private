# ACR ACR 认证与登录 — 综合排查指南

**条目数**: 9 | **草稿融合数**: 1 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-a-acr-health-check-command.md
**Kusto 引用**: authentication-errors.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: When ARM audience token authentication is disabled on ACR, t
> 来源: ADO Wiki

1. 1) Update auth flow to request ACR-scoped token: az login --scope https://containerregistry.azure.net/.default. 2) Then: az acr login -n <registry>. 3) Verify config: az acr config authentication-as-a

`[结论: 🟢 9.0/10 — ADO Wiki]`

### Phase 2: Docker Desktop on Windows uses Windows Credential Manager (w
> 来源: ADO Wiki

1. 1) Open Windows Credential Manager. 2) Navigate to Windows Credentials. 3) Find and delete stale ACR entry. 4) Retry docker login and push.

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: Known limitation — ACR Anonymous Pull only supports the Dock
> 来源: ADO Wiki

1. This is a confirmed limitation by ACR PG. No workaround available currently. Customers needing unauthenticated REST API access must use authenticated calls with a token. PG tracking for potential futu

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: Admin credentials may be incorrect (wrong password from port
> 来源: ADO Wiki

1. 1) Check admin enabled via ACIS GetBasicRegistryDetails endpoint. 2) Query RegistryActivity for login failures: filter /v2/ with status >= 400. 3) Have customer verify password in portal. 4) If admin 

`[结论: 🟢 9.0/10 — ADO Wiki]`

### Phase 5: Users with large numbers of Azure AD security group membersh
> 来源: ADO Wiki

1. This is a known limitation with ACR's header size limit. Workarounds: 1) Reduce the number of Azure AD group memberships for affected users. 2) Use CLI instead of Portal for ACR operations. 3) Request

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 6: az acr login calls docker login under the hood, requiring bo
> 来源: MS Learn

1. Install Docker Engine, or use az acr login -n <acr-name> --expose-token which does not require Docker daemon

`[结论: 🔵 6.0/10 — MS Learn]`

### Phase 7: Azure Cloud Shell only provides Docker CLI, not the Docker d
> 来源: MS Learn

1. Use az acr login -n <acr-name> --expose-token which works without Docker daemon, or run the command in an environment where Docker daemon is installed

`[结论: 🔵 6.0/10 — MS Learn]`

### Phase 8: Authentication failed due to incorrect/expired credentials (
> 来源: MS Learn

1. 1) Admin user: verify credentials in Access keys blade. 2) Token/scope map: regenerate password if unsure. 3) Service principal: check az ad app credential list --id $SP_ID for expiry, create new secr

`[结论: 🟢 8.0/10 — MS Learn]`

### Phase 9: The identity (user or managed identity) used to authenticate
> 来源: MS Learn

1. Assign the appropriate Azure built-in role (AcrPull, AcrPush, Contributor, Owner) to the identity. Run az login to refresh permissions. Verify subscription context is correct.

`[结论: 🟢 8.0/10 — MS Learn]`

### Kusto 查询模板

#### authentication-errors.md
`[工具: Kusto skill — authentication-errors.md]`

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(2h)
| where level != "info"
| where http_request_host == "{registry}.azurecr.cn"
| project PreciseTimeStamp, activitytimestamp, message, servicedeploymentname, 
         servicedeploymentinstance, format, auth_registry, auth_user_name, correlationid, 
         err_code, err_detail, err_message
| order by PreciseTimeStamp desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(30m)
| where http_request_host == "{registry}.azurecr.cn"
| where message in ("fe_request_stop", "ts_request_stop")
| project PreciseTimeStamp, Host, message, http_request_host, http_request_method, 
         http_response_status, http_request_uri, http_request_remoteaddr, http_request_useragent, 
         Tenant, correlationid, service, level
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(7d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status in ("401", "403")
| summarize 
    Count = count(),
    UniqueIPs = dcount(http_request_remoteaddr),
    UniqueUsers = dcount(auth_user_name)
  by http_response_status, err_code, err_message
| order by Count desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where correlationid == "{correlationId}"
| project activitytimestamp, message, service, level, 
         auth_registry, auth_user_name, auth_token_access, auth_token_issued, auth_token_expiresin,
         err_code, err_message, err_detail,
         http_request_method, http_request_uri, http_response_status
| order by activitytimestamp asc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where http_request_host == "{registry}.azurecr.cn"
| where http_response_status in ("401", "403")
| summarize 
    FailureCount = count(),
    LastFailure = max(PreciseTimeStamp),
    ErrorCodes = make_set(err_code),
    SourceIPs = make_set(http_request_remoteaddr)
  by auth_user_name
| order by FailureCount desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where PreciseTimeStamp > ago(1h)
| where http_request_host == "{registry}.azurecr.cn"
| where isnotempty(auth_token_access) or isnotempty(checkaccess_requested_scopes)
| project PreciseTimeStamp, auth_user_name, auth_token_access, 
         checkaccess_requested_scopes, checkaccess_disallowed_scopes,
         http_request_method, http_request_uri, http_response_status, correlationid
| order by PreciseTimeStamp desc
```


---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ACR authentication fails with 401/403 after disabling ARM-sc | When ARM audience token authentication | → Phase 1 |
| Docker push from Docker Desktop fails with UNAUTHORIZED erro | Docker Desktop on Windows uses | → Phase 2 |
| HTTP GET requests to ACR endpoints (/v2/_catalog, /v2/<repo> | Known limitation — ACR Anonymous | → Phase 3 |
| ACR login fails with HTTP 400+ response on /v2/ endpoint whe | Admin credentials may be incorrect | → Phase 4 |
| Subset of users cannot list ACR images in Azure Portal with  | Users with large numbers of | → Phase 5 |
| az acr login fails with DOCKER_COMMAND_ERROR: Please verify  | az acr login calls docker | → Phase 6 |
| az acr login fails in Azure Cloud Shell: This command requir | Azure Cloud Shell only provides | → Phase 7 |
| Docker pull/login fails with unauthorized: authentication re | Authentication failed due to incorrect/e | → Phase 8 |
| ACR login fails with Unable to get admin user credentials an | The identity (user or managed | → Phase 9 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR authentication fails with 401/403 after disabling ARM-scoped authentication  | When ARM audience token authentication is disabled on ACR, the registry rejects  | 1) Update auth flow to request ACR-scoped token: az login --scope https://contai | 🟢 9.0 | ADO Wiki |
| 2 | Docker push from Docker Desktop fails with UNAUTHORIZED error - all token server | Docker Desktop on Windows uses Windows Credential Manager (wincred). Stale or co | 1) Open Windows Credential Manager. 2) Navigate to Windows Credentials. 3) Find  | 🟢 8.0 | ADO Wiki |
| 3 | HTTP GET requests to ACR endpoints (/v2/_catalog, /v2/<repo>/tags/list) return U | Known limitation — ACR Anonymous Pull only supports the Docker registry protocol | This is a confirmed limitation by ACR PG. No workaround available currently. Cus | 🟢 8.0 | ADO Wiki |
| 4 | ACR login fails with HTTP 400+ response on /v2/ endpoint when using admin creden | Admin credentials may be incorrect (wrong password from portal), or service prin | 1) Check admin enabled via ACIS GetBasicRegistryDetails endpoint. 2) Query Regis | 🟢 9.0 | ADO Wiki |
| 5 | Subset of users cannot list ACR images in Azure Portal with 'Error retrieving Im | Users with large numbers of Azure AD security group memberships generate OAuth2  | This is a known limitation with ACR's header size limit. Workarounds: 1) Reduce  | 🟢 8.0 | ADO Wiki |
| 6 | az acr login fails with DOCKER_COMMAND_ERROR: Please verify if Docker client is  | az acr login calls docker login under the hood, requiring both Docker client and | Install Docker Engine, or use az acr login -n <acr-name> --expose-token which do | 🔵 6.0 | MS Learn |
| 7 | az acr login fails in Azure Cloud Shell: This command requires running the docke | Azure Cloud Shell only provides Docker CLI, not the Docker daemon required by az | Use az acr login -n <acr-name> --expose-token which works without Docker daemon, | 🔵 6.0 | MS Learn |
| 8 | Docker pull/login fails with unauthorized: authentication required when accessin | Authentication failed due to incorrect/expired credentials (admin user password  | 1) Admin user: verify credentials in Access keys blade. 2) Token/scope map: rege | 🟢 8.0 | MS Learn |
| 9 | ACR login fails with Unable to get admin user credentials and CONNECTIVITY_REFRE | The identity (user or managed identity) used to authenticate does not have suffi | Assign the appropriate Azure built-in role (AcrPull, AcrPush, Contributor, Owner | 🟢 8.0 | MS Learn |
