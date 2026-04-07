# ACR RBAC 与权限管理 — 综合排查指南

**条目数**: 6 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-rbac-abac-tsg.md, ado-wiki-a-set-up-aks-acr-cross-tenant.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: When registry roleAssignmentMode changes to AbacRepositoryPe
> 来源: ADO Wiki

1. 1) Check EnableRepoPermission via Kusto RegistryMasterData or ARM property roleAssignmentMode. 2) If True/AbacRepositoryPermissions -> use ABAC-compatible roles from MS Learn ACR role directory refere

`[结论: 🟢 9.0/10 — ADO Wiki]`

### Phase 2: Azure Portal uses ARM deployment to create webhooks, requiri
> 来源: ADO Wiki

1. Create a custom RBAC role with Microsoft.Resources/deployments/read, write, validate/action, operations/read, and subscriptions/resourceGroups/read permissions. Assign this role at subscription level 

`[结论: 🟢 9.0/10 — ADO Wiki]`

### Phase 3: The Service Principal used for AKS creation does not have Az
> 来源: ADO Wiki

1. Method 1: Grant Azure AD Graph API read permissions to the Service Principal so it can read directory objects. Method 2: Assign the 'Directory Readers' Azure AD built-in role to the Service Principal.

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: Registry-level RBAC (AcrPull/AcrPush) grants access to all r
> 来源: OneNote

1. 1) Create scope-map with per-repo permissions: az acr scope-map create (specify repos and permissions like content/read, content/write, content/delete, metadata/read, metadata/write). 2) Create or upd

`[结论: 🟢 9.5/10 — OneNote]`

### Phase 5: ACR does not support wildcard (*) permissions like Microsoft
> 来源: OneNote

1. Specify individual ACR data-plane permissions in custom role instead of wildcard: microsoft.containerregistry/registries/pull/read, push/write, artifacts/delete, sign/write, quarantine/read, quarantin

`[结论: 🟢 9.5/10 — OneNote]`

### Phase 6: ACR is an Azure-native service that integrates natively with
> 来源: OneNote

1. 1) Use Azure Lighthouse to delegate resource management: designate a security group from the external tenant as delegated principal on the ACR resource group. 2) Alternatively, manage external users a

`[结论: 🟢 8.5/10 — OneNote]`

---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Customer cannot perform ACR operations despite existing role | When registry roleAssignmentMode changes | → Phase 1 |
| ACR webhook creation fails with 'You do not have access for  | Azure Portal uses ARM deployment | → Phase 2 |
| AKS create or attach-acr fails with 'Could not create a role | The Service Principal used for | → Phase 3 |
| Need to restrict ACR repository access with fine-grained per | Registry-level RBAC (AcrPull/AcrPush) gr | → Phase 4 |
| ACR RBAC custom role with wildcard (*) permissions fails wit | ACR does not support wildcard | → Phase 5 |
| Customer wants to use --aad-tenant-id option for ACR (like A | ACR is an Azure-native service | → Phase 6 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer cannot perform ACR operations despite existing role assignments - autho | When registry roleAssignmentMode changes to AbacRepositoryPermissions, a differe | 1) Check EnableRepoPermission via Kusto RegistryMasterData or ARM property roleA | 🟢 9.0 | ADO Wiki |
| 2 | ACR webhook creation fails with 'You do not have access for this operation, plea | Azure Portal uses ARM deployment to create webhooks, requiring Microsoft.Resourc | Create a custom RBAC role with Microsoft.Resources/deployments/read, write, vali | 🟢 9.0 | ADO Wiki |
| 3 | AKS create or attach-acr fails with 'Could not create a role assignment for ACR. | The Service Principal used for AKS creation does not have Azure AD permissions t | Method 1: Grant Azure AD Graph API read permissions to the Service Principal so  | 🟢 8.0 | ADO Wiki |
| 4 | Need to restrict ACR repository access with fine-grained per-repository permissi | Registry-level RBAC (AcrPull/AcrPush) grants access to all repositories; finer c | 1) Create scope-map with per-repo permissions: az acr scope-map create (specify  | 🟢 9.5 | OneNote |
| 5 | ACR RBAC custom role with wildcard (*) permissions fails with UNAUTHORIZED error | ACR does not support wildcard (*) permissions like Microsoft.ContainerRegistries | Specify individual ACR data-plane permissions in custom role instead of wildcard | 🟢 9.5 | OneNote |
| 6 | Customer wants to use --aad-tenant-id option for ACR (like AKS) to point ACR to  | ACR is an Azure-native service that integrates natively with Azure AD and Azure  | 1) Use Azure Lighthouse to delegate resource management: designate a security gr | 🟢 8.5 | OneNote |
