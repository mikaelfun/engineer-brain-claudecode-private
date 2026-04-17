# ARM RBAC 角色与权限管理 custom role keyvault — 综合排查指南

**条目数**: 15 | **草稿融合数**: 4 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-a-azure-local-rbac.md, ado-wiki-a-get-rbac-iam-control-details.md, ado-wiki-a-rbac-tenant-vms-disconnected-azure-local.md, ado-wiki-rbac-evaluation-on-arm.md
**Kusto 引用**: activity-log.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Customer needs to grant full database access (DB owner level) across multiple d…
> 来源: onenote

**根因分析**: Built-in RBAC roles only cover specific database types individually (e.g. SQL DB Contributor). There is no built-in role that covers multiple DB types like SQL + DBForMySQL together.

1. Create a custom RBAC role combining multiple DB type permissions: use Microsoft.
2. Sql/* and Microsoft.
3. DBforMySQL/* in actions array.
4. Also include supporting permissions from built-in roles: Microsoft.
5. Authorization/*/read, Microsoft.
6. Insights/alertRules/*, Microsoft.
7. ResourceHealth/availabilityStatuses/read, Microsoft.
8. Resources/deployments/*, Microsoft.

`[结论: 🟢 8.5/10 — [MCVKB/Custom RBAC role for multiple DB access in resourc.md]]`

### Phase 2: Customer assigns a role to a user but the user still receives 403 Access Denied…
> 来源: ado-wiki

**根因分析**: ARM caches user permissions for up to 30 minutes (from when the cache was initially created on a specific ARM instance). New role assignments are not immediately reflected in the existing cache. The 30-minute window starts from cache creation, not from the role assignment creation time.

1. Customer can either: (1) wait up to 30 minutes for the cache to expire naturally, or (2) log out and log back in to force a token renewal, which triggers a fresh permissions cache on the next request.
2. Note: hitting a different ARM instance will also result in a fresh cache.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: User has Owner or Contributor role on a VM (or primary resource) but receives 4…
> 来源: ado-wiki

**根因分析**: ARM performs Linked Access Checks on certain operations as declared in the RP manifest's linkedAccessChecks configuration. Even with full permissions on the primary resource, the user must also have the specific linked action permission on the referenced secondary resource (e.g., Microsoft.Network/networkInterfaces/join/action on the NIC).

1. Identify the required linked action by checking the RP manifest or the error details.
2. Assign the appropriate role granting the linked action to the user on the linked resource.
3. Example: to attach a NIC to a VM, the user needs Microsoft.
4. Network/networkInterfaces/join/action on the NIC resource.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Local (ALDO) deployment validation fails after creating KeyVault in the A…
> 来源: ado-wiki

**根因分析**: RBAC permissions for KeyVault require 30+ minutes to fully propagate after creation. Starting validation before this period triggers a permission-related validation failure.

1. Wait at least 30 minutes after creating and configuring the KeyVault before starting the deployment validation step.
2. This is a known upstream bug on the backlog.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: ALDO deployment validation fails after creating KeyVault in the disconnected op…
> 来源: ado-wiki

**根因分析**: RBAC permissions for KeyVault require 30+ minutes to fully propagate after creation. Starting validation before this period triggers a permission-related validation failure.

1. Wait at least 30 minutes after creating and configuring the KeyVault before starting the deployment validation step.
2. This is a known upstream bug on the backlog.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: ARM operation returns HTTP 403 Forbidden for Nexus/AON resource operations. Use…
> 来源: ado-wiki

**根因分析**: RBAC authorization failure - user or service principal lacks required permissions for the target Nexus resource operation.

1. Query ARM Traces table (armprodgbl.
2. net, database Traces) using correlationId, filter for messages containing Denied or failed access.
3. See guide: guides/drafts/ado-wiki-a-arm-kusto-repo.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: ARM 部署报错 AuthorizationFailed：The client with object id does not have authorizat…
> 来源: mslearn

**根因分析**: 部署账号或 Service Principal 没有足够的 RBAC 权限完成部署操作；或所需的 Resource Provider 未注册导致间接授权错误（如 VM auto-shutdown 需要 Microsoft.DevTestLab）

1. 1) 检查账号的 RBAC 角色和作用域（subscription/RG/resource level）；2) 授予必要的角色（如 Contributor/Owner）：Portal → Resource group → Access control (IAM) → Add role assignment；3) 检查并注册所需 Resource Provider；4) 确认 Service Principal 的 client secret/certificate 未过期.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 8: 跨订阅移动资源失败：目标订阅未注册 Resource Provider 或源/目标订阅不在同一 Entra 租户
> 来源: mslearn

**根因分析**: 跨订阅移动的前置条件：1) 源和目标订阅必须在同一 Microsoft Entra 租户；2) 目标订阅必须注册移动资源所需的 Resource Provider；3) 移动账号需要源 RG 的 moveResources/action + 目标 RG 的 write 权限；4) 单次移动最多 800 个资源

1. 1) 用 az account show --query tenantId 确认两个订阅在同一租户；2) az provider register --namespace Microsoft.
2. Xxx 在目标订阅注册 RP；3) 确保账号有源 RG 和目标 RG 的正确 RBAC 权限；4) 大量资源分批移动（每批 < 800）；5) 移动后需手动重新创建 Role Assignment 和 Tag.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 9: RBAC 角色分配后变更不生效、返回 401 Unauthorized、或新角色分配需很久才能访问资源
> 来源: mslearn

**根因分析**: Azure Resource Manager 会缓存配置和数据以提升性能：1) 角色分配增删后最长需要 10 分钟生效；2) 在 Management Group scope 的 built-in role（含 DataActions）生效可能需数小时；3) Managed Identity 加入 Group 后，后端服务维护的 per-resource-URI 缓存约 24 小时更新一次；4) 新建 SP/User/Group 后立即分配角色可能因跨区域复制延迟失败（PrincipalNotFound）

1. 1) 等待 10 分钟后重试，通过 sign out/sign in 强制刷新 token；2) REST API 调用方通过刷新 access token 强制生效；3) Managed Identity 组成员变更需等待数小时；4) 新建 principal 后分配角色时设置 principalType 属性（User/ServicePrincipal）避免复制延迟失败；5) PowerShell 中 Remove-AzRoleAssignment 后用 -Scope 参数验证（绕过缓存）.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 10: RBAC Identity not found / Unknown type：角色分配列表中出现 Identity not found 和 Unknown 类…
> 来源: mslearn

**根因分析**: 1) 角色分配关联的安全主体（用户/组/SP/Managed Identity）已被删除但角色分配未清理（孤立角色分配）；2) 新邀请的 Guest User 正在跨区域复制过程中（临时状态）

1. 1) 清理孤立角色分配：使用 Remove-AzRoleAssignment -ObjectId xxx -Scope xxx 删除（必须同时指定 -Scope 或 -ResourceGroupName 参数）；2) 对新邀请用户等待几分钟后刷新列表；3) 建议在删除 SP/User 前先移除其角色分配，避免孤立角色分配累积.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 11: RBAC role assignment fails: RoleAssignmentLimitExceeded - No more role assignme…
> 来源: mslearn

**根因分析**: Azure hard limit: 4000 role assignments per subscription (sub+RG+resource scopes). 500 per management group. Cannot be increased.

1. 1) Use group-based assignments instead of per-principal.
2. 2) Remove redundant lower-scope assignments.
3. 3) Combine built-in roles into custom role.
4. 4) Use PIM eligible assignments (not counted).
5. Use Resource Graph queries to find consolidation opportunities.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 12: RBAC custom role creation fails: RoleDefinitionLimitExceeded - No more role def…
> 来源: mslearn

**根因分析**: Limit of 5000 custom roles per directory (2000 for 21Vianet). Too many unused custom role definitions.

1. Use Resource Graph to find custom roles with zero assignments.
2. Delete unused ones.
3. Consolidate similar roles.
4. 21Vianet limit is 2000 vs 5000 global.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 13: RBAC Custom Role 创建/更新报错：Unable to add more than one management group as assign…
> 来源: mslearn

**根因分析**: Azure 限制 Custom Role 的 AssignableScopes 中最多只能包含一个 Management Group

1. 在 Custom Role 的 AssignableScopes 中只定义一个 Management Group。如需在多个 MG 使用该角色，选择它们的共同父 MG 或根 MG 作为 scope.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 14: RBAC Custom Role 创建报错：You cannot add data action permissions when you have a ma…
> 来源: mslearn

**根因分析**: 当 Custom Role 的 AssignableScopes 包含 Management Group 时，不允许包含 DataActions。Custom roles with DataActions 不能在 Management Group scope 分配

1. 1) 如角色需要 DataActions，将 AssignableScopes 改为 Subscription；2) 如必须使用 MG scope，移除所有 DataActions 只保留 Actions（控制面操作）.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 15: 删除 RBAC Custom Role 失败报错 RoleDefinitionHasAssignments：There are existing role a…
> 来源: mslearn

**根因分析**: 仍有角色分配（Role Assignment）引用该 Custom Role，Azure 不允许删除仍在使用中的角色定义

1. 1) 查找引用该自定义角色的所有角色分配：az role assignment list --role CustomRoleName；2) 逐个删除分配：az role assignment delete --ids xxx；3) 全部分配删除后再删除自定义角色定义.

`[结论: 🔵 6.0/10 — [mslearn]]`

## Kusto 查询参考

### activity-log.md
`[工具: Kusto skill — activity-log.md]`

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where operationName notcontains "Microsoft.Authorization/policies/auditIfNotExists/action"
| where operationName notcontains "Microsoft.Authorization/policies/audit/action"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, 
         properties, resourceUri, eventName, operationId, armServiceRequestId
| sort by PreciseTimeStamp asc
```

```kusto
// cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd') // Public Cloud - 需要权限
// .Unionizer("Requests","EventServiceEntries") 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where operationName notcontains "Microsoft.Authorization/policies"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, properties, resourceUri
| sort by PreciseTimeStamp asc
```

```kusto
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries 
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where resourceUri contains "{resourceUri}"
| where operationName notcontains "Microsoft.Authorization/policies"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId, status, subStatus, 
         properties, resourceUri, eventName
| sort by PreciseTimeStamp asc
```

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Customer needs to grant full database access (DB owner leve… | Built-in RBAC roles only cover specific database types indi… | Create a custom RBAC role combining multiple DB type permis… |
| Customer assigns a role to a user but the user still receiv… | ARM caches user permissions for up to 30 minutes (from when… | Customer can either: (1) wait up to 30 minutes for the cach… |
| User has Owner or Contributor role on a VM (or primary reso… | ARM performs Linked Access Checks on certain operations as … | Identify the required linked action by checking the RP mani… |
| Azure Local (ALDO) deployment validation fails after creati… | RBAC permissions for KeyVault require 30+ minutes to fully … | Wait at least 30 minutes after creating and configuring the… |
| ALDO deployment validation fails after creating KeyVault in… | RBAC permissions for KeyVault require 30+ minutes to fully … | Wait at least 30 minutes after creating and configuring the… |
| ARM operation returns HTTP 403 Forbidden for Nexus/AON reso… | RBAC authorization failure - user or service principal lack… | Query ARM Traces table (armprodgbl.eastus.kusto.windows.net… |
| ARM 部署报错 AuthorizationFailed：The client with object id does… | 部署账号或 Service Principal 没有足够的 RBAC 权限完成部署操作；或所需的 Resource P… | 1) 检查账号的 RBAC 角色和作用域（subscription/RG/resource level）；2) 授予必… |
| 跨订阅移动资源失败：目标订阅未注册 Resource Provider 或源/目标订阅不在同一 Entra 租户 | 跨订阅移动的前置条件：1) 源和目标订阅必须在同一 Microsoft Entra 租户；2) 目标订阅必须注册移动资… | 1) 用 az account show --query tenantId 确认两个订阅在同一租户；2) az pro… |
| RBAC 角色分配后变更不生效、返回 401 Unauthorized、或新角色分配需很久才能访问资源 | Azure Resource Manager 会缓存配置和数据以提升性能：1) 角色分配增删后最长需要 10 分钟生效… | 1) 等待 10 分钟后重试，通过 sign out/sign in 强制刷新 token；2) REST API 调… |
| RBAC Identity not found / Unknown type：角色分配列表中出现 Identity n… | 1) 角色分配关联的安全主体（用户/组/SP/Managed Identity）已被删除但角色分配未清理（孤立角色分配… | 1) 清理孤立角色分配：使用 Remove-AzRoleAssignment -ObjectId xxx -Scope… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer needs to grant full database access (DB owner level) across multiple database types (SQL, … | Built-in RBAC roles only cover specific database types individually (e.g. SQL DB Contributor). Ther… | Create a custom RBAC role combining multiple DB type permissions: use Microsoft.Sql/* and Microsoft… | 🟢 8.5 — onenote+21V适用 | [MCVKB/Custom RBAC role for multiple DB access in resourc.md] |
| 2 | Azure Local (ALDO) deployment validation fails after creating KeyVault in the ALDO portal. Error oc… | RBAC permissions for KeyVault require 30+ minutes to fully propagate after creation. Starting valid… | Wait at least 30 minutes after creating and configuring the KeyVault before starting the deployment… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | ALDO deployment validation fails after creating KeyVault in the disconnected operations portal. Err… | RBAC permissions for KeyVault require 30+ minutes to fully propagate after creation. Starting valid… | Wait at least 30 minutes after creating and configuring the KeyVault before starting the deployment… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Customer assigns a role to a user but the user still receives 403 Access Denied errors for several … | ARM caches user permissions for up to 30 minutes (from when the cache was initially created on a sp… | Customer can either: (1) wait up to 30 minutes for the cache to expire naturally, or (2) log out an… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | User has Owner or Contributor role on a VM (or primary resource) but receives 403 when performing a… | ARM performs Linked Access Checks on certain operations as declared in the RP manifest's linkedAcce… | Identify the required linked action by checking the RP manifest or the error details. Assign the ap… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | ARM operation returns HTTP 403 Forbidden for Nexus/AON resource operations. User or service princip… | RBAC authorization failure - user or service principal lacks required permissions for the target Ne… | Query ARM Traces table (armprodgbl.eastus.kusto.windows.net, database Traces) using correlationId, … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | RBAC custom role creation fails: RoleDefinitionLimitExceeded - No more role definitions can be crea… | Limit of 5000 custom roles per directory (2000 for 21Vianet). Too many unused custom role definitio… | Use Resource Graph to find custom roles with zero assignments. Delete unused ones. Consolidate simi… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 8 | RBAC Custom Role 创建/更新报错：Unable to add more than one management group as assignable scope | Azure 限制 Custom Role 的 AssignableScopes 中最多只能包含一个 Management Group | 在 Custom Role 的 AssignableScopes 中只定义一个 Management Group。如需在多个 MG 使用该角色，选择它们的共同父 MG 或根 MG 作为 scope | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 9 | RBAC Custom Role 创建报错：You cannot add data action permissions when you have a management group as an… | 当 Custom Role 的 AssignableScopes 包含 Management Group 时，不允许包含 DataActions。Custom roles with DataActi… | 1) 如角色需要 DataActions，将 AssignableScopes 改为 Subscription；2) 如必须使用 MG scope，移除所有 DataActions 只保留 Acti… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 10 | 删除 RBAC Custom Role 失败报错 RoleDefinitionHasAssignments：There are existing role assignments referenci… | 仍有角色分配（Role Assignment）引用该 Custom Role，Azure 不允许删除仍在使用中的角色定义 | 1) 查找引用该自定义角色的所有角色分配：az role assignment list --role CustomRoleName；2) 逐个删除分配：az role assignment del… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 11 | RBAC 角色分配后变更不生效、返回 401 Unauthorized、或新角色分配需很久才能访问资源 | Azure Resource Manager 会缓存配置和数据以提升性能：1) 角色分配增删后最长需要 10 分钟生效；2) 在 Management Group scope 的 built-in … | 1) 等待 10 分钟后重试，通过 sign out/sign in 强制刷新 token；2) REST API 调用方通过刷新 access token 强制生效；3) Managed Iden… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 12 | RBAC role assignment fails: RoleAssignmentLimitExceeded - No more role assignments can be created | Azure hard limit: 4000 role assignments per subscription (sub+RG+resource scopes). 500 per manageme… | 1) Use group-based assignments instead of per-principal. 2) Remove redundant lower-scope assignment… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 13 | ARM 部署报错 AuthorizationFailed：The client with object id does not have authorization to perform actio… | 部署账号或 Service Principal 没有足够的 RBAC 权限完成部署操作；或所需的 Resource Provider 未注册导致间接授权错误（如 VM auto-shutdown 需… | 1) 检查账号的 RBAC 角色和作用域（subscription/RG/resource level）；2) 授予必要的角色（如 Contributor/Owner）：Portal → Resou… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 14 | 跨订阅移动资源失败：目标订阅未注册 Resource Provider 或源/目标订阅不在同一 Entra 租户 | 跨订阅移动的前置条件：1) 源和目标订阅必须在同一 Microsoft Entra 租户；2) 目标订阅必须注册移动资源所需的 Resource Provider；3) 移动账号需要源 RG 的 m… | 1) 用 az account show --query tenantId 确认两个订阅在同一租户；2) az provider register --namespace Microsoft.Xxx… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 15 | RBAC Identity not found / Unknown type：角色分配列表中出现 Identity not found 和 Unknown 类型的安全主体，PowerShell 显示… | 1) 角色分配关联的安全主体（用户/组/SP/Managed Identity）已被删除但角色分配未清理（孤立角色分配）；2) 新邀请的 Guest User 正在跨区域复制过程中（临时状态） | 1) 清理孤立角色分配：使用 Remove-AzRoleAssignment -ObjectId xxx -Scope xxx 删除（必须同时指定 -Scope 或 -ResourceGroupNa… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
