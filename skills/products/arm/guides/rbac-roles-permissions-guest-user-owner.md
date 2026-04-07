# ARM RBAC 角色与权限管理 guest user owner — 排查速查

**来源数**: 6 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Guest User（外部用户）访问 Azure 资源报错 AuthorizationFailed：does not have authorization to perform action ove… | Guest User 未被分配足够权限的 RBAC 角色到目标资源 scope。与内部用户不同，Guest User 默认权限更受限（目录权限、资源发现能力等），需要显式角色分配 | 1) 使用 Portal → Access control (IAM) → Check access 确认 Guest User 的角色分配；2) 按最小权限原则分配合适的 Azure built-… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 2 📋 | 无法删除订阅最后一个 Owner 角色分配，报错 Cannot delete the last RBAC admin assignment | Azure 默认不允许删除订阅级别的最后一个 Owner 角色分配，防止订阅变成无人管理状态（orphaned subscription） | 1) 如需取消订阅：使用 Cancel subscription 功能；2) 全局管理员（Global Admin）可以提升访问权限后删除最后一个 Owner 分配（使用 Access manage… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 3 📋 | Azure Arc agent onboard fails with 403: does not have authorization to perform action Microsoft.Hyb… | User or service principal lacks Azure Connected Machine Onboarding role at target scope. | Assign Azure Connected Machine Onboarding built-in role to the user or service principal at subscri… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 4 📋 | Azure Arc K8s connect fails: secrets is forbidden User cannot list resource secrets at cluster scope | kubeconfig lacks cluster-admin Kubernetes RBAC permissions required for Arc agent installation. | Assign cluster-admin role: kubectl create clusterrolebinding arc-admin --clusterrole=cluster-admin … | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 5 📋 | PIM（Privileged Identity Management）中 Azure 资源操作被拒绝：Active Owner/User Access Administrator 能看到资源但无法执… | MS-PIM 服务主体的 User Access Administrator 角色被意外移除。PIM 需要 MS-PIM service principal 在订阅上拥有 User Access A… | 1) 在订阅或管理组级别重新分配 User Access Administrator 角色给 MS-PIM service principal；2) 根据需要在 management group 或… | 🟡 4.5 — mslearn | [mslearn] |
| 6 📋 | Azure Lighthouse 跨国家云委派不支持：无法在国家云（如 21Vianet/Azure Government）与 Azure 公有云之间、或两个国家云之间建立 Lighthouse d… | Azure Lighthouse 是非区域性服务，支持跨区域管理委派资源，但不支持跨国家云（national cloud）和公有云的委派，也不支持两个国家云之间的委派。此外 Lighthouse 仅… | 1) 国家云与公有云之间无法使用 Lighthouse，需在各自云中独立管理；2) 使用 Guest 账号跨租户管理资源作为替代方案；3) 数据面操作需通过客户租户直接访问；4) 需要 Owner … | 🟡 4.5 — mslearn | [mslearn] |

## 快速排查路径
1. 1) 使用 Portal → Access control (IAM) → Check access 确认 Guest User 的角色分配；2) 按最小权限… `[来源: mslearn]`
2. 1) 如需取消订阅：使用 Cancel subscription 功能；2) 全局管理员（Global Admin）可以提升访问权限后删除最后一个 Owner… `[来源: mslearn]`
3. Assign Azure Connected Machine Onboarding built-in role to the user or service … `[来源: mslearn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/rbac-roles-permissions-guest-user-owner.md#排查流程)
