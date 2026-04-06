# ACR 认证与登录故障 — 综合排查指南

**条目数**: 9 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**来源草稿**: 无
**Kusto 引用**: [authentication-errors.md]
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确认错误类型与环境
> 来源: ADO Wiki + MS Learn 交叉

1. 确认客户遇到的错误码和场景：
   - **401 Unauthorized** — Token 无效/过期/凭据错误
   - **403 Forbidden / DENIED** — 权限不足或 IP 被防火墙拦截
   - **DOCKER_COMMAND_ERROR** — Docker daemon 未安装或未运行
   - **CONNECTIVITY_REFRESH_TOKEN_ERROR** — RBAC 权限不足

2. 查询 Kusto 获取认证错误概况：
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
   `[工具: Kusto skill — authentication-errors.md]`

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| 错误 DOCKER_COMMAND_ERROR | Docker daemon 问题 | → Phase 2a |
| 401 + basic_credentials_invalid | 凭据无效/过期 | → Phase 2b |
| 403 + ARM auth disabled | ARM-scoped Token 被拒 | → Phase 2c |
| 401 + Anonymous Pull 场景 | API 限制 | → Phase 2d |
| 401/403 + 权限不足 | RBAC 问题 | → Phase 2e |

`[结论: 🟢 8.5/10 — ADO Wiki + MS Learn 多源交叉验证，时效性高]`

---

### Phase 2a: Docker Daemon 未安装/未运行
> 来源: MS Learn

`az acr login` 底层调用 `docker login`，需要 Docker client 和 Docker daemon 同时存在。

**常见场景**：
- **本地机器无 Docker**：安装 Docker Engine 或使用 `--expose-token` 模式
- **Azure Cloud Shell**：Cloud Shell 只有 Docker CLI 无 daemon，必须用 `--expose-token`

**解决方案**：
```bash
# 不依赖 Docker daemon 的登录方式
az acr login -n <acr-name> --expose-token
```

`[结论: 🔵 5.5/10 — MS Learn 单源文档，通用适用]`

---

### Phase 2b: 凭据无效或过期
> 来源: ADO Wiki + MS Learn 交叉

1. **Docker Desktop (Windows) — wincred 问题**：
   Docker Desktop 使用 Windows Credential Manager 缓存凭据，过期或损坏的凭据导致 `basic_credentials_invalid`。
   - 打开 Windows Credential Manager → Windows Credentials
   - 找到并删除 ACR 对应条目
   - 重新 `docker login` 和 `docker push`

   `[结论: 🟢 8.5/10 — ADO Wiki 实证+时效高]`

2. **Admin 用户密码错误**：
   - Portal → ACR → Access keys 验证密码
   - Kusto 查询确认登录失败记录：
     ```kusto
     cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
     | where PreciseTimeStamp > ago(2h)
     | where level != "info"
     | where http_request_host == "{registry}.azurecr.cn"
     | project PreciseTimeStamp, activitytimestamp, message, auth_registry, auth_user_name, 
              correlationid, err_code, err_detail, err_message
     | order by PreciseTimeStamp desc
     ```
     `[工具: Kusto skill — authentication-errors.md]`

3. **Service Principal 密钥过期**：
   ```bash
   az ad app credential list --id $SP_ID   # 检查过期时间
   ```
   过期则创建新密钥。

4. **Token/Scope Map 密码丢失**：
   - 重新生成 Token 密码

`[结论: 🟢 8/10 — ADO Wiki + MS Learn 交叉，覆盖多种凭据场景]`

---

### Phase 2c: ARM-scoped Token 被拒（authentication-as-arm disabled）
> 来源: ADO Wiki

当 ACR 禁用 ARM audience token 认证（`azureADAuthenticationAsArmPolicy` = disabled）时，默认 `az login` 签发的 ARM-scoped token 将被拒绝。这是 **设计行为，非网络问题**。

**解决方案**：
```bash
# 使用 ACR-scoped token 登录
az login --scope https://containerregistry.azure.net/.default
az acr login -n <registry>

# 检查当前配置
az acr config authentication-as-arm show -r <registry>

# 如需恢复 ARM auth
az acr config authentication-as-arm update -r <registry> --status enabled
```

**关联影响**：当 authentication-as-arm 被禁用时，Microsoft Defender for Cloud 也无法扫描 ACR 镜像（Defender 依赖 ARM audience token）。如被 Azure Policy 阻止启用，需申请豁免。

`[结论: 🟢 9/10 — ADO Wiki 实证，两个条目(acr-040, acr-085)交叉验证]`

---

### Phase 2d: Anonymous Pull 的 REST API 限制
> 来源: ADO Wiki

**已知限制**：ACR Anonymous Pull 仅支持 Docker registry 协议（`docker pull/push`），不支持原始 HTTP REST API 调用（`/v2/_catalog`、`/v2/<repo>/tags/list`）。

即使 Anonymous Pull 已启用，REST API 调用仍返回 UNAUTHORIZED。目前无 workaround，PG 在跟踪未来可能的支持。

`[结论: 🟢 8.5/10 — ADO Wiki PG 确认的限制]`

---

### Phase 2e: RBAC 权限不足
> 来源: MS Learn + ADO Wiki 交叉

1. 检查身份的 RBAC 角色分配：
   - `AcrPull` — 拉取权限
   - `AcrPush` — 推送权限
   - `Contributor` / `Owner` — 完整权限

2. Kusto 查询 RBAC 权限检查：
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
   `[工具: Kusto skill — authentication-errors.md]`

3. **Notation 签名/验证场景**：Notation 操作需要 `AcrPull`（验证/列表）和 `AcrPull + AcrPush`（签名）。先用 `az acr login` / `docker login` / `notation login` 认证。

4. **按用户统计认证失败**：
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
   `[工具: Kusto skill — authentication-errors.md]`

`[结论: 🟢 8/10 — MS Learn + ADO Wiki 交叉验证]`

---

### Phase 3: 深入追踪（CorrelationId）
> 来源: ADO Wiki (authentication-errors.md Kusto 模板)

获取到 correlationId 后，追踪完整认证请求链路：

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryActivity
| where correlationid == "{correlationId}"
| project activitytimestamp, message, service, level, 
         auth_registry, auth_user_name, auth_token_access, auth_token_issued, auth_token_expiresin,
         err_code, err_message, err_detail,
         http_request_method, http_request_uri, http_response_status
| order by activitytimestamp asc
```
`[工具: Kusto skill — authentication-errors.md]`

**关键字段解读**：
| 字段 | 说明 |
|------|------|
| `auth_user_name` | 认证用户名 |
| `auth_token_access` | 请求的权限范围 |
| `auth_token_expiresin` | Token 有效期 |
| `err_code` | 错误代码（UNAUTHORIZED / DENIED / TOKEN_EXPIRED / INVALID_CREDENTIALS） |
| `err_message` | 错误消息 |

**常见错误代码速查**：
| 错误代码 | 说明 | 可能原因 |
|----------|------|----------|
| UNAUTHORIZED | 未授权 | Token 无效或过期 |
| DENIED | 拒绝访问 | 权限不足 |
| TOKEN_EXPIRED | Token 过期 | 需要刷新 Token |
| INVALID_CREDENTIALS | 无效凭据 | 用户名/密码错误 |

`[结论: 🟢 8/10 — Kusto skill 工具验证，ADO Wiki 实证]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR 认证失败 401/403（禁用 ARM-scoped auth 后） | ARM audience token 被拒，需 ACR-scoped token | `az login --scope https://containerregistry.azure.net/.default` → `az acr login` | 🟢 9 — ADO Wiki+交叉验证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Authentication%20disable%20authentication%20as%20arm) |
| 2 | Docker push UNAUTHORIZED（Docker Desktop） | Windows Credential Manager 缓存凭据损坏 | 删除 Windows Credential Manager 中 ACR 条目 | 🟢 8.5 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Docker%20push%20from%20Docker%20desktop%20failing%20with%20unauthorized%20error) |
| 3 | HTTP GET /v2/_catalog 返回 UNAUTHORIZED（Anonymous Pull 开启） | Anonymous Pull 仅支持 Docker 协议，不支持 REST API | 已知限制，需用认证调用 | 🟢 8.5 — ADO Wiki PG 确认 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FHTTP+GET+does+not+work+though+ACR+Anonymous+Pull+is+Enabled) |
| 4 | ACR login 失败 HTTP 400+（admin/SP 凭据） | 密码错误或 SP 过期 | Kusto 查 RegistryActivity /v2/ 失败记录，验证凭据 | 🔵 7 — ADO Wiki 单源+Kusto | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FKusto+Query+to+look+up+Login+issues) |
| 5 | Notation sign/verify 401 Unauthorized | 身份缺少 AcrPull/AcrPush 角色或未登录 | 分配角色 + `az acr login` 认证 | 🟢 8.5 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FNotary+Image+Signing+and+Verification) |
| 6 | `az acr login` DOCKER_COMMAND_ERROR | Docker daemon 未安装或未运行 | 安装 Docker 或用 `--expose-token` | 🔵 5.5 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/acr-authentication-errors) |
| 7 | `az acr login` 在 Cloud Shell 失败 | Cloud Shell 无 Docker daemon | 用 `--expose-token` | 🔵 5.5 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/acr-authentication-errors) |
| 8 | Docker pull/login unauthorized: authentication required | 凭据错误/过期（admin/SP/token） | 验证凭据 + 检查 RBAC 角色 | 🔵 7 — MS Learn + ADO Wiki 交叉 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/acr-authentication-errors) |
| 9 | ACR login 失败 CONNECTIVITY_REFRESH_TOKEN_ERROR 401 | RBAC 权限不足 | 分配 AcrPull/AcrPush/Contributor/Owner | 🔵 7 — MS Learn + ADO Wiki 交叉 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/acr-authentication-errors) |
