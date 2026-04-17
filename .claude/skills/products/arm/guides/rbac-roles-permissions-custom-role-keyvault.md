# ARM RBAC 角色与权限管理 custom role keyvault — 排查速查

**来源数**: 15 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Customer needs to grant full database access (DB owner level) across multiple database types (SQL, … | Built-in RBAC roles only cover specific database types individually (e.g. SQL DB Contributor). Ther… | Create a custom RBAC role combining multiple DB type permissions: use Microsoft.Sql/* and Microsoft… | 🟢 8.5 — onenote+21V适用 | [MCVKB/Custom RBAC role for multiple DB access in resourc.md] |
| 2 📋 | Azure Local (ALDO) deployment validation fails after creating KeyVault in the ALDO portal. Error oc… | RBAC permissions for KeyVault require 30+ minutes to fully propagate after creation. Starting valid… | Wait at least 30 minutes after creating and configuring the KeyVault before starting the deployment… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | ALDO deployment validation fails after creating KeyVault in the disconnected operations portal. Err… | RBAC permissions for KeyVault require 30+ minutes to fully propagate after creation. Starting valid… | Wait at least 30 minutes after creating and configuring the KeyVault before starting the deployment… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Customer assigns a role to a user but the user still receives 403 Access Denied errors for several … | ARM caches user permissions for up to 30 minutes (from when the cache was initially created on a sp… | Customer can either: (1) wait up to 30 minutes for the cache to expire naturally, or (2) log out an… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | User has Owner or Contributor role on a VM (or primary resource) but receives 403 when performing a… | ARM performs Linked Access Checks on certain operations as declared in the RP manifest's linkedAcce… | Identify the required linked action by checking the RP manifest or the error details. Assign the ap… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | ARM operation returns HTTP 403 Forbidden for Nexus/AON resource operations. User or service princip… | RBAC authorization failure - user or service principal lacks required permissions for the target Ne… | Query ARM Traces table (armprodgbl.eastus.kusto.windows.net, database Traces) using correlationId, … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | RBAC custom role creation fails: RoleDefinitionLimitExceeded - No more role definitions can be crea… | Limit of 5000 custom roles per directory (2000 for 21Vianet). Too many unused custom role definitio… | Use Resource Graph to find custom roles with zero assignments. Delete unused ones. Consolidate simi… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 8 📋 | RBAC Custom Role 创建/更新报错：Unable to add more than one management group as assignable scope | Azure 限制 Custom Role 的 AssignableScopes 中最多只能包含一个 Management Group | 在 Custom Role 的 AssignableScopes 中只定义一个 Management Group。如需在多个 MG 使用该角色，选择它们的共同父 MG 或根 MG 作为 scope | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 9 📋 | RBAC Custom Role 创建报错：You cannot add data action permissions when you have a management group as an… | 当 Custom Role 的 AssignableScopes 包含 Management Group 时，不允许包含 DataActions。Custom roles with DataActi… | 1) 如角色需要 DataActions，将 AssignableScopes 改为 Subscription；2) 如必须使用 MG scope，移除所有 DataActions 只保留 Acti… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 10 📋 | 删除 RBAC Custom Role 失败报错 RoleDefinitionHasAssignments：There are existing role assignments referenci… | 仍有角色分配（Role Assignment）引用该 Custom Role，Azure 不允许删除仍在使用中的角色定义 | 1) 查找引用该自定义角色的所有角色分配：az role assignment list --role CustomRoleName；2) 逐个删除分配：az role assignment del… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 11 📋 | RBAC 角色分配后变更不生效、返回 401 Unauthorized、或新角色分配需很久才能访问资源 | Azure Resource Manager 会缓存配置和数据以提升性能：1) 角色分配增删后最长需要 10 分钟生效；2) 在 Management Group scope 的 built-in … | 1) 等待 10 分钟后重试，通过 sign out/sign in 强制刷新 token；2) REST API 调用方通过刷新 access token 强制生效；3) Managed Iden… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 12 📋 | RBAC role assignment fails: RoleAssignmentLimitExceeded - No more role assignments can be created | Azure hard limit: 4000 role assignments per subscription (sub+RG+resource scopes). 500 per manageme… | 1) Use group-based assignments instead of per-principal. 2) Remove redundant lower-scope assignment… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 13 📋 | ARM 部署报错 AuthorizationFailed：The client with object id does not have authorization to perform actio… | 部署账号或 Service Principal 没有足够的 RBAC 权限完成部署操作；或所需的 Resource Provider 未注册导致间接授权错误（如 VM auto-shutdown 需… | 1) 检查账号的 RBAC 角色和作用域（subscription/RG/resource level）；2) 授予必要的角色（如 Contributor/Owner）：Portal → Resou… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 14 📋 | 跨订阅移动资源失败：目标订阅未注册 Resource Provider 或源/目标订阅不在同一 Entra 租户 | 跨订阅移动的前置条件：1) 源和目标订阅必须在同一 Microsoft Entra 租户；2) 目标订阅必须注册移动资源所需的 Resource Provider；3) 移动账号需要源 RG 的 m… | 1) 用 az account show --query tenantId 确认两个订阅在同一租户；2) az provider register --namespace Microsoft.Xxx… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 15 📋 | RBAC Identity not found / Unknown type：角色分配列表中出现 Identity not found 和 Unknown 类型的安全主体，PowerShell 显示… | 1) 角色分配关联的安全主体（用户/组/SP/Managed Identity）已被删除但角色分配未清理（孤立角色分配）；2) 新邀请的 Guest User 正在跨区域复制过程中（临时状态） | 1) 清理孤立角色分配：使用 Remove-AzRoleAssignment -ObjectId xxx -Scope xxx 删除（必须同时指定 -Scope 或 -ResourceGroupNa… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |

## 快速排查路径
1. Create a custom RBAC role combining multiple DB type permissions: use Microsoft… `[来源: onenote]`
2. Wait at least 30 minutes after creating and configuring the KeyVault before sta… `[来源: ado-wiki]`
3. Wait at least 30 minutes after creating and configuring the KeyVault before sta… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/rbac-roles-permissions-custom-role-keyvault.md#排查流程)
