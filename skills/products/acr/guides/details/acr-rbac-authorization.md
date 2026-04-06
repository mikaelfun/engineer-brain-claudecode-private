# ACR RBAC 授权与权限管理 — 综合排查指南

**条目数**: 6 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-acr-authorization-rbac-abac.md]
**Kusto 引用**: 无（草稿内含 KQL 模板）
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确认授权模式（RBAC vs ABAC）
> 来源: ADO Wiki (ado-wiki-acr-authorization-rbac-abac.md)

ACR 有两种授权模式，排查前必须先确认：

1. **检查 ABAC Repository Permissions 是否启用**：
   ```kusto
   RegistryMasterData
   | where env_time > ago(1d)
   | where RegistryName == '<registry>' or LoginServerName == '<registry>.azurecr.io'
   | project-reorder RegistryName, LoginServerName, EnableRepoPermission
   ```
   `[来源: ADO Wiki — ado-wiki-acr-authorization-rbac-abac.md]`

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| `EnableRepoPermission` = False | 传统 RBAC 模式 | → Phase 2a |
| `EnableRepoPermission` = True | ABAC 仓库权限模式 | → Phase 2b |
| 错误是 Token Server 500 | 服务端异常 | → Phase 3 |
| 错误是延迟/超时 | 性能问题 | → Phase 4 |

`[结论: 🟢 9/10 — ADO Wiki TSG 标准流程，含完整 KQL]`

---

### Phase 2a: 传统 RBAC 授权问题
> 来源: OneNote + ADO Wiki 交叉

#### 场景 1: 自定义角色通配符权限无效

ACR **不支持**通配符（`*`）权限，如 `Microsoft.ContainerRegistries/registries/*`。通配符条目被静默忽略，导致 bearer token 权限不足返回 UNAUTHORIZED。

**解决方案**：在自定义角色中逐一列出 ACR 数据平面权限：
- `microsoft.containerregistry/registries/pull/read`
- `microsoft.containerregistry/registries/push/write`
- `microsoft.containerregistry/registries/artifacts/delete`
- `microsoft.containerregistry/registries/sign/write`
- `microsoft.containerregistry/registries/quarantine/read`
- `microsoft.containerregistry/registries/quarantine/write`
- `microsoft.containerregistry/registries/metadata/read`
- `microsoft.containerregistry/registries/metadata/write`
- `microsoft.containerregistry/registries/deleted/read`
- `microsoft.containerregistry/registries/deleted/restore/action`

参考: [ACR 角色参考](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-roles?tabs=azure-cli)

`[结论: 🟢 9/10 — OneNote 实证+ADO Wiki 文档交叉，Mooncake 验证]`

#### 场景 2: 仓库级精细权限（Token + Scope Map）

Registry 级 RBAC（AcrPull/AcrPush）授予所有仓库访问权限。如需仓库级别控制：

```bash
# 创建 scope-map
az acr scope-map create -n <scope-map-name> -r <registry> \
  --repository <repo1> content/read content/write \
  --repository <repo2> content/read

# 创建 token 并绑定 scope-map
az acr token create -n <token-name> -r <registry> --scope-map <scope-map-name>
```

参考: [仓库级别权限](https://docs.azure.cn/zh-cn/container-registry/container-registry-repository-scoped-permissions)

`[结论: 🔵 7/10 — OneNote 单源，Mooncake 适用]`

#### 场景 3: Webhook 创建权限不足

ACR Owner 角色无法创建 Webhook — Portal 使用 ARM 部署创建 webhook，需要订阅级别的 `Microsoft.Resources/deployments/*` 权限。

**解决方案**：
- 方案 A：创建自定义角色，包含 `Microsoft.Resources/deployments/read`、`write`、`validate/action`、`operations/read` 和 `subscriptions/resourceGroups/read`，在订阅级别分配
- 方案 B（简单粗暴）：在订阅级别分配 Contributor

`[结论: 🟢 8.5/10 — ADO Wiki 实证]`

#### 场景 4: AKS attach-acr 角色分配失败

`az aks create` 或 `attach-acr` 报错 `Could not create a role assignment for ACR. Are you an Owner on this subscription?`

**根因**：AKS 使用的 Service Principal 无 Azure AD 权限读取目录对象，Graph API 调用失败。

**解决方案**：
- 方案 1：授予 SP Azure AD Graph API 读权限
- 方案 2：给 SP 分配 Azure AD 内置角色 `Directory Readers`

`[结论: 🟢 8.5/10 — ADO Wiki 实证]`

---

### Phase 2b: ABAC 仓库权限授权问题
> 来源: ADO Wiki (ado-wiki-acr-authorization-rbac-abac.md)

当 `roleAssignmentMode` = `AbacRepositoryPermissions` 时，注册表使用不同的内置角色集。旧版角色分配不再生效。

**排查步骤**：

1. **客户自诊断**：
   ```bash
   az acr check-health -n <registry> --repository <repo>
   ```

2. **获取 correlationId**：
   ```kusto
   RegistryActivity
   | where PreciseTimeStamp > ago(3h)
   | where http_request_host == "myregistry.azurecr.io"
   | where message == "fe_request_stop" or message == "ts_request_stop"
   | project-reorder PreciseTimeStamp, correlationid, jwtid, message, http_response_status, auth_token_access, err_detail
   ```
   `[来源: ADO Wiki — ado-wiki-acr-authorization-rbac-abac.md]`

3. **追踪 token server 请求（jwtid）**：
   ```kusto
   RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where correlationid == "<correlationid>"
   | project-reorder PreciseTimeStamp, correlationid, message, auth_token_access_granted, auth_token_access
   ```
   `[来源: ADO Wiki — ado-wiki-acr-authorization-rbac-abac.md]`

4. **对比请求权限 vs 授予权限**：
   - `auth_token_access`：请求的权限范围（如 `repository:hello-world:pull`）
   - `auth_token_access_granted`：实际授予的范围（如 `repository:hello-world:` — 缺少 pull）

**解决方案**：使用 ABAC 兼容的角色，参考 [ACR 角色目录](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-directory-reference)

`[结论: 🟢 9/10 — ADO Wiki TSG 完整流程]`

---

### Phase 3: Token Server 500 错误
> 来源: ADO Wiki (ado-wiki-acr-authorization-rbac-abac.md)

1. **查找 500 错误**：
   ```kusto
   RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where http_request_host == "myregistry.azurecr.io"
   | where message == "ts_request_stop" or message == "fe_request_stop"
   | where http_response_status == 500
   | sort by PreciseTimeStamp asc
   | project PreciseTimeStamp, correlationId
   ```

2. **检查 RBAC/MSAL 异常**：
   ```kusto
   RegistryActivity
   | where PreciseTimeStamp > ago(1d)
   | where correlationId == "<correlationId>"
   | where message == "rbac_request_log" or message == "msal_request_log"
   | project-reorder PreciseTimeStamp, message, http_response_status, err_detail
   ```
   `[来源: ADO Wiki — ado-wiki-acr-authorization-rbac-abac.md]`

**判断逻辑**：
| `err_detail` 内容 | 后续动作 |
|-------------------|---------|
| 依赖服务宕机（AAD/RBAC API） | 创建 ICM |
| Redis 缓存异常 | 检查 `rbac_redis_duration` |
| 瞬态错误 | 等待重试 |

---

### Phase 4: 延迟/超时问题
> 来源: ADO Wiki (ado-wiki-acr-authorization-rbac-abac.md)

检查延迟来源——RBAC 还是 MSAL：

```kusto
RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where correlationId == "<correlationId>"
| where message == "rbac_request_log" or message == "msal_request_log"
| sort by PreciseTimeStamp asc
| project-reorder PreciseTimeStamp, message, http_response_status, http_response_duration, err_detail
```

**RBAC 日志关键字段**：
| 字段 | 说明 |
|------|------|
| `rbac_cachekey` | 缓存键格式: CheckAccessVersion:RegistryId:InputTokenId |
| `rbac_response_source` | 来源: local(内存)/Redis 缓存 或 Azure RBAC API |
| `rbac_redis_duration` | Redis 查询耗时 (ms) |
| `rbac_memorycache_count` | 本地内存缓存当前条目数 |
| `rbac_abac` | 是否使用 ABAC |

**注意请求合并**：大型注册表（如 MAR）每秒数百个 auth 请求。缓存未命中时，首个请求查 AAD，后续相同参数请求合并。只有首个请求记录 `msal_request_log`。

**监控 Dashboard**：
- [CheckAccess Dashboard](https://portal.microsoftgeneva.com/dashboard/AzureContainerRegistry/Public/Dataplane/Features/Compliant-RBAC/CheckAccess)
- [ABAC Repo Permission](https://portal.microsoftgeneva.com/dashboard/AzureContainerRegistry/Public/Dataplane/Features/Compliant-RBAC/ABAC%2520Repo%2520Permission)

`[结论: 🟢 9/10 — ADO Wiki TSG 含完整 KQL 和 Dashboard]`

---

### Phase 5: CheckAccess API 失败
> 来源: ADO Wiki (ado-wiki-acr-authorization-rbac-abac.md)

```kusto
RegistryActivity
| where PreciseTimeStamp > ago(1d)
| where correlationId == "<correlationId>"
| where message == "checkAccess_api_stop"
| project-reorder PreciseTimeStamp, correlationid, message, http_response_status, http_response_duration, err_detail, http_request_uri
```
`[来源: ADO Wiki — ado-wiki-acr-authorization-rbac-abac.md]`

如需更深入调查 → 通过 ICM 升级。

---

## 背景知识

### 何时使用 Compliant RBAC

以下场景触发 Compliant RBAC（CheckAccess V2）：
- 注册表启用了 Private Endpoint 的租户中的 Token Server 请求
- 使用 ACR audience Token（`https://containerregistry.azure.net`）
- 使用 ARM audience Token 且 UseCheckAccessForAuth feature flag 已启用（现已全部启用）

### 参考文档

- [ACR RBAC 概述](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-overview)
- [ACR ABAC 仓库权限](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-abac-repository-permissions)
- [ACR 角色目录参考](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-rbac-built-in-roles-directory-reference)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 仓库级精细权限需求（registry 级 RBAC 太粗） | registry 级 RBAC 授予所有仓库访问 | 创建 scope-map + token 实现仓库级控制 | 🔵 7 — OneNote 单源 Mooncake | [MCVKB/.../ACR/##repository based token.md](../../) |
| 2 | 自定义角色通配符(*)权限导致 UNAUTHORIZED | ACR 静默忽略通配符权限 | 逐一列出 ACR 数据平面权限 | 🟢 9 — OneNote+ADO Wiki 交叉 | [MCVKB/.../ACR/[ACR][RBAC custom role].md](../../) |
| 3 | ABAC 启用后已有角色分配失效 | `roleAssignmentMode` 变更后内置角色集不同 | 使用 ABAC 兼容角色 + `az acr check-health` 自检 | 🟢 9 — ADO Wiki TSG 完整 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Authorization%20RBAC-ABAC) |
| 4 📋 | RBAC/ABAC/CheckAccess 授权失败（Token Server 500/延迟/拒绝） | 多种可能 | 见排查流程 Phase 2-5 | 🟢 9 — ADO Wiki TSG 含 KQL | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Authorization%20RBAC-ABAC) |
| 5 | ACR Webhook 创建失败（Owner 角色不够） | Portal 需订阅级 ARM deployment 权限 | 创建自定义角色含 deployments/* 或分配 Contributor | 🟢 8.5 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FACR+webhook+creation+permission+issue) |
| 6 | AKS attach-acr 角色分配失败（Authorization_RequestDenied） | SP 无 Azure AD Graph 读权限 | 授予 Directory Readers 角色或 Graph API 读权限 | 🟢 8.5 — ADO Wiki 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FRole+Assignment+Error+For+Service+Principal) |
