# ACR RBAC 与授权 — 排查速查

**来源数**: 6 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 需要细粒度 per-repository 权限控制，registry 级 RBAC（AcrPull/AcrPush）粒度不够 | Registry 级 RBAC 授权所有 repo；需要 repository-scoped tokens | 1) `az acr scope-map create` 指定 repo 和权限 2) `az acr token create` 绑定 scope-map 3) Portal Tokens 验证 | 🔵 7 — OneNote+文档 | [MCVKB/ACR/##repository based token.md](../../onenote-exports/MCVKB/POD/VMSCIM/4.%20Services/ACR/##New%20Feature/##repository%20based%20token.md) |
| 2 | 自定义 RBAC 角色使用通配符 (*) 权限，ACR delete/push 操作报 UNAUTHORIZED | ACR 不支持通配符权限 `Microsoft.ContainerRegistries/registries/*`，静默忽略导致 token scope 不足 | 在自定义角色中逐一列出 ACR data-plane 权限：pull/read, push/write, artifacts/delete, sign/write, metadata/read/write 等 | 🟢 8.5 — OneNote+实证 | [MCVKB/ACR/[ACR][RBAC custom role].md](../../onenote-exports/MCVKB/POD/VMSCIM/4.%20Services/ACR/[ACR][RBAC%20custom%20role].md) |
| 3 📋 | 启用 ABAC Repository Permissions (EnableRepoPermission) 后 ACR 操作失败，已有角色不生效 | `roleAssignmentMode` 变为 `AbacRepositoryPermissions` 后需要不同的内置角色，旧角色不再被识别 | 1) Kusto 查 RegistryMasterData 或 ARM 查 roleAssignmentMode 2) ABAC 模式下使用兼容角色 3) `az acr check-health -n <registry> --repository <repo>` 自检 | 🟢 8 — ADO Wiki+Kusto | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Authorization%20RBAC-ABAC) |
| 4 📋 | ACR 授权失败：RBAC/ABAC/CheckAccess 相关 — token server 500、延迟、权限拒绝，需 Kusto 排查 | （多种可能原因，需 Kusto 诊断） | 见融合排查指南 — Kusto 查 token server 日志、CheckAccess 日志 | 🔵 6 — ADO Wiki guide-draft | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Authorization%20RBAC-ABAC) |
| 5 | ACR Webhook 创建报错 "You do not have access" — 即使用户有 ACR Owner 角色 | Portal 通过 ARM deployment 创建 webhook，需要订阅级 `Microsoft.Resources/deployments/*` 权限，ACR Owner 不含此权限 | 创建自定义角色含 deployments/read, write, validate/action + resourceGroups/read，在订阅级分配；或直接分配 Contributor | 🟢 8 — ADO Wiki | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FACR+webhook+creation+permission+issue) |
| 6 | `az aks create --attach-acr` 或 `az aks update --attach-acr` 报错 "Could not create a role assignment for ACR. Are you an Owner?" — Graph API Authorization_RequestDenied | AKS 所用 SP 缺少 Azure AD 目录读取权限，无法通过 Graph API 查找 SP 以创建角色绑定 | 方法 1: 授予 SP Graph API 读取权限  方法 2: 给 SP 分配 `Directory Readers` Azure AD 内置角色 | 🟢 8 — ADO Wiki | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FRole+Assignment+Error+For+Service+Principal) |

## 快速排查路径

1. **确认授权模式** → `az acr show -n <registry> --query policies.azureADAuthenticationAsArmPolicy` 以及 `roleAssignmentMode`（标准 RBAC 还是 ABAC）`[来源: ADO Wiki]`
2. **ABAC 模式检查** → 如果 `roleAssignmentMode == AbacRepositoryPermissions`，需使用 ABAC 兼容角色 `[来源: ADO Wiki]`
3. **自定义角色审查** → 检查是否使用了通配符权限（ACR 不支持） `[来源: OneNote]`
4. **Webhook/Portal 操作** → 检查订阅级 ARM deployment 权限 `[来源: ADO Wiki]`
5. **AKS attach-acr** → 检查 SP 的 Azure AD 目录权限（Directory Readers） `[来源: ADO Wiki]`
6. **per-repo 权限** → 使用 scope-map + token 实现细粒度控制 `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-rbac-authorization.md#排查流程)
