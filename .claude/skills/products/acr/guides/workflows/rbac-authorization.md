# ACR RBAC 与权限管理 — 排查工作流

**来源草稿**: ado-wiki-a-rbac-abac-tsg.md, ado-wiki-a-set-up-aks-acr-cross-tenant.md
**Kusto 引用**: (无独立文件，查询内嵌在草稿中)
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: Token Server 请求 500 错误
> 来源: ado-wiki-a-rbac-abac-tsg.md | 适用: Mooncake ✅ (Kusto 部分)

### 排查步骤

1. **获取失败请求的 correlationId**
   ```kql
   RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where http_request_host == "myregistry.azurecr.io"
   | where message == "ts_request_stop" or message == "fe_request_stop"
   | where http_response_status == 500
   | sort by PreciseTimeStamp asc
   | project PreciseTimeStamp, correlationId
   ```

2. **查看请求详细日志**
   ```kql
   RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where correlationId == "<correlationId>"
   | project-reorder PreciseTimeStamp, correlationid, message, http_request_host,
            http_response_status, http_response_duration, err_detail, http_request_uri
   ```

3. **检查 RBAC/MSAL 异常**
   ```kql
   RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where correlationId == "<correlationId>"
   | where message == "rbac_request_log" or message == "msal_request_log"
   | project-reorder PreciseTimeStamp, message, http_response_status, err_detail
   ```

4. **如果 err_detail 指示 CheckAccess API 失败** → 转 Scenario 3
5. **如果 err_detail 指示服务宕机** → 创建 ICM

---

## Scenario 2: Token Server 请求高延迟/超时
> 来源: ado-wiki-a-rbac-abac-tsg.md | 适用: Mooncake ✅

### 排查步骤

1. **获取高延迟请求的 correlationId**（同 Scenario 1 步骤 1）

2. **检查 RBAC/MSAL 延迟贡献**
   ```kql
   RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where correlationId == "<correlationId>"
   | where message == "rbac_request_log" or message == "msal_request_log"
   | sort by PreciseTimeStamp asc
   | project-reorder PreciseTimeStamp, message, http_response_status, http_response_duration, err_detail
   ```

3. **关键字段分析**
   - `rbac_response_source`: local/Redis/API（API 最慢）
   - `rbac_redis_duration`: Redis 查找耗时
   - `msal_duration_total_ms`: MSAL 总耗时
   - `msal_duration_http_ms`: AAD HTTP 调用耗时

---

## Scenario 3: CheckAccess API 失败
> 来源: ado-wiki-a-rbac-abac-tsg.md | 适用: Mooncake ✅

### 排查步骤

1. **查询 CheckAccess 日志**
   ```kql
   RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where correlationId == "<correlationId>"
   | where message == "checkAccess_api_stop"
   | project-reorder PreciseTimeStamp, correlationid, message, http_response_status,
            http_response_duration, err_detail, http_request_uri
   ```

2. **监控 Dashboard**
   - [CheckAccess Dashboard](https://portal.microsoftgeneva.com/dashboard/AzureContainerRegistry/Public/Dataplane/Features/Compliant-RBAC/CheckAccess)
   - [ABAC Repo Permission Dashboard](https://portal.microsoftgeneva.com/dashboard/AzureContainerRegistry/Public/Dataplane/Features/Compliant-RBAC/ABAC%2520Repo%2520Permission)

3. **如果需要更深入调查** → 通过 ICM 升级

---

## Scenario 4: ABAC Repository Permission 权限不足
> 来源: ado-wiki-a-rbac-abac-tsg.md | 适用: Mooncake ✅

### 排查步骤

1. **检查注册表是否启用 ABAC (Repository Permission)**
   ```kql
   RegistryMasterData
   | where env_time > ago(1d)
   | where RegistryName == '<registry-arm-resource-name>' or LoginServerName == '<registry>.azurecr.io'
   | project-reorder RegistryName, LoginServerName, EnableRepoPermission
   ```
   - `EnableRepoPermission = True` → RBAC + ABAC 模式
   - `EnableRepoPermission = False` → 传统 RBAC 模式

2. **客户自助检查权限**
   ```bash
   az acr check-health -n myregistry --repository myrepo
   ```

3. **Kusto 排查权限不足**
   ```kql
   RegistryActivity
   | where PreciseTimeStamp > ago(3h)
   | where http_request_host == "myregistry.azurecr.io"
   | where message == "fe_request_stop" or message == "ts_request_stop"
   | project-reorder PreciseTimeStamp, correlationid, jwtid, message, http_response_status,
            auth_token_access, err_detail, http_request_uri, err_code, err_message
   ```

4. **对比 requested vs granted permissions**
   ```kql
   RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where correlationid == "<correlationid>"
   | project-reorder PreciseTimeStamp, correlationid, message, auth_token_access_granted,
            auth_token_access, http_request_host
   ```
   - `auth_token_access`: 请求的权限（例: `repository:hello-world:pull`）
   - `auth_token_access_granted`: 授予的权限（如果为空 → 权限不足）

5. **角色参考**
   - [ACR role directory reference](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-directory-reference)
   - [ACR ABAC documentation](https://aka.ms/acr/auth/abac)

---

## Scenario 5: AKS 跨租户拉取 ACR 镜像
> 来源: ado-wiki-a-set-up-aks-acr-cross-tenant.md | 适用: Mooncake ✅

### 前置条件
- AKS 在 Tenant A，ACR 在 Tenant B
- SP 的 Home Tenant 是 Tenant A

### 步骤

1. **启用 Multi-Tenant AAD Application**
   - Portal → Tenant A → AAD → App registrations → 找到 SP
   - 修改 Supported account types 为 Multi-tenant
   - 创建 Client Secret

2. **在 ACR Tenant 注册 SP**
   ```
   https://login.microsoftonline.com/<TenantB-ID>/oauth2/authorize?client_id=<AppID>&response_type=code&redirect_uri=<url>
   ```
   - 用 Tenant B 管理员账号打开并接受权限请求

3. **授予 AcrPull 权限**
   - 在 ACR 上给 SP 分配 `AcrPull` 角色

4. **更新 AKS SP 凭据**
   ```bash
   # 使用步骤 1 的 App ID 和 Client Secret 更新 AKS
   ```
