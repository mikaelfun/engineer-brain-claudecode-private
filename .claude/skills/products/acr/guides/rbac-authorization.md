# ACR RBAC 与权限管理 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer cannot perform ACR operations despite existing role assignments - autho | When registry roleAssignmentMode changes to AbacRepositoryPermissions, a differe | 1) Check EnableRepoPermission via Kusto RegistryMasterData or ARM property roleA | 🟢 9.0 — ADO Wiki交叉验证 | [acr-ado-wiki-033] |
| 2 | ACR webhook creation fails with 'You do not have access for this operation, plea | Azure Portal uses ARM deployment to create webhooks, requiring Microsoft.Resourc | Create a custom RBAC role with Microsoft.Resources/deployments/read, write, vali | 🟢 9.0 — ADO Wiki交叉验证 | [acr-ado-wiki-057] |
| 3 | AKS create or attach-acr fails with 'Could not create a role assignment for ACR. | The Service Principal used for AKS creation does not have Azure AD permissions t | Method 1: Grant Azure AD Graph API read permissions to the Service Principal so  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-077] |
| 4 | Need to restrict ACR repository access with fine-grained per-repository permissi | Registry-level RBAC (AcrPull/AcrPush) grants access to all repositories; finer c | 1) Create scope-map with per-repo permissions: az acr scope-map create (specify  | 🟢 9.5 — OneNote交叉验证 | [acr-onenote-005] |
| 5 | ACR RBAC custom role with wildcard (*) permissions fails with UNAUTHORIZED error | ACR does not support wildcard (*) permissions like Microsoft.ContainerRegistries | Specify individual ACR data-plane permissions in custom role instead of wildcard | 🟢 9.5 — OneNote交叉验证 | [acr-onenote-012] |
| 6 | Customer wants to use --aad-tenant-id option for ACR (like AKS) to point ACR to  | ACR is an Azure-native service that integrates natively with Azure AD and Azure  | 1) Use Azure Lighthouse to delegate resource management: designate a security gr | 🟢 8.5 — OneNote单源+实证 | [acr-onenote-014] |

## 快速排查路径
1. 检查 → When registry roleAssignmentMode changes to AbacRepositoryPe `[来源: ADO Wiki]`
   - 方案: 1) Check EnableRepoPermission via Kusto RegistryMasterData or ARM property roleAssignmentMode. 2) If
2. 检查 → Azure Portal uses ARM deployment to create webhooks, requiri `[来源: ADO Wiki]`
   - 方案: Create a custom RBAC role with Microsoft.Resources/deployments/read, write, validate/action, operati
3. 检查 → The Service Principal used for AKS creation does not have Az `[来源: ADO Wiki]`
   - 方案: Method 1: Grant Azure AD Graph API read permissions to the Service Principal so it can read director
4. 检查 → Registry-level RBAC (AcrPull/AcrPush) grants access to all r `[来源: OneNote]`
   - 方案: 1) Create scope-map with per-repo permissions: az acr scope-map create (specify repos and permission
5. 检查 → ACR does not support wildcard (*) permissions like Microsoft `[来源: OneNote]`
   - 方案: Specify individual ACR data-plane permissions in custom role instead of wildcard: microsoft.containe

> 本 topic 有融合排查指南 → [完整排查流程](details/rbac-authorization.md#排查流程)
