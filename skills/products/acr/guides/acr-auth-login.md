# ACR 认证与登录 — 排查速查

**来源数**: 9 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR 认证 401/403：禁用 ARM-scoped 认证后 az acr login / docker push/pull / CI/CD 全部失败 | 禁用 ARM audience token 后，默认 az login 签发的 ARM-scoped token 被 ACR 拒绝（by design） | 1) `az login --scope https://containerregistry.azure.net/.default` 2) `az acr login -n <registry>` 3) 或重新启用 ARM auth: `az acr config authentication-as-arm update -r <registry> --status enabled` | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Authentication%20disable%20authentication%20as%20arm) |
| 2 | Docker Desktop push 失败 UNAUTHORIZED — token server 返回 401 basic_credentials_invalid | Windows Credential Manager (wincred) 中残留陈旧/损坏的 ACR 凭据 | 1) 打开 Windows 凭据管理器 2) 删除对应 ACR 条目 3) 重新 `docker login` | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Docker%20push%20from%20Docker%20desktop%20failing%20with%20unauthorized%20error) |
| 3 | Anonymous Pull 启用后 HTTP GET /v2/_catalog 或 /v2/tags/list 返回 UNAUTHORIZED，docker pull 正常 | 已知限制：Anonymous Pull 仅支持 Docker registry 协议，不覆盖 REST API 端点 | 已确认 PG 限制，无 workaround；REST API 调用仍需 token 认证 | 🟢 8 — ADO Wiki 确认 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FHTTP+GET+does+not+work+though+ACR+Anonymous+Pull+is+Enabled) |
| 4 📋 | ACR login 失败 HTTP 400+ on /v2/ — 使用 admin 凭据或 SP 登录 | Admin 密码错误（Portal 中重新生成过）或 SP 凭据无效/过期 | 1) ACIS 查 admin 状态 2) Kusto 查 RegistryActivity 登录失败 3) 验证密码 4) SP 问题检查过期 | 🔵 6.5 — ADO Wiki+Kusto | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FKusto+Query+to+look+up+Login+issues) |
| 5 | Notation sign/verify 失败 401 Unauthorized — `POST oauth2/token` 返回 401 | 身份未认证或缺少 ACR 角色（verify 需 AcrPull，sign 需 AcrPull+AcrPush） | 分配 AcrPull（+AcrPush for signing），先 `az acr login` / `notation login` 再执行命令 | 🟢 8 — ADO Wiki | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FNotary+Image+Signing+and+Verification) |
| 6 | `az acr login` 报错 DOCKER_COMMAND_ERROR: Please verify if Docker client is installed and running | `az acr login` 底层调用 `docker login`，需要 Docker daemon 运行 | 安装 Docker Engine，或使用 `az acr login -n <acr> --expose-token`（无需 Docker daemon） | 🔵 5.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/acr-authentication-errors) |
| 7 | Cloud Shell 中 `az acr login` 报错 "requires running the docker daemon, not supported in Azure Cloud Shell" | Cloud Shell 仅提供 Docker CLI，无 Docker daemon | `az acr login -n <acr> --expose-token`，或在有 Docker daemon 的环境执行 | 🔵 5.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/acr-authentication-errors) |
| 8 | Docker pull/login 报 `unauthorized: authentication required` | 凭据错误/过期：admin 密码被重置、SP secret 过期、token scope map 密码丢失 | 1) Admin: Access keys 验证 2) Token: 重新生成密码 3) SP: `az ad app credential list` 查过期 4) 检查 RBAC 角色 | 🔵 5.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/acr-authentication-errors) |
| 9 | ACR login 失败 `Unable to get admin user credentials` + CONNECTIVITY_REFRESH_TOKEN_ERROR 401 | 身份（用户或 Managed Identity）在 ACR 上缺少 RBAC 权限 | 分配 Azure 内置角色（AcrPull/AcrPush/Contributor/Owner），`az login` 刷新权限，确认订阅上下文 | 🔵 5.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/acr-authentication-errors) |

## 快速排查路径

1. **确认认证方式** → admin user / SP / Managed Identity / az login？ `[来源: ADO Wiki + MS Learn]`
2. **检查 ARM auth 策略** → `az acr config authentication-as-arm show -r <registry>` — 如果 disabled，需用 ACR-scoped token `[来源: ADO Wiki]`
3. **检查凭据有效性** → Admin: Portal Access keys 验证；SP: `az ad app credential list` 查过期；Token: 检查 scope map `[来源: MS Learn]`
4. **Kusto 查认证日志** → RegistryActivity 过滤 `/v2/` + `status >= 400`，看 `err_code` / `auth_user_name` `[来源: ADO Wiki]`
5. **Docker Desktop 环境** → Windows 凭据管理器清除陈旧条目 `[来源: ADO Wiki]`
6. **无 Docker daemon** → 使用 `--expose-token` 替代标准 login `[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-auth-login.md#排查流程)
