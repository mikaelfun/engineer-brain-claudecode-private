# ARM RBAC 拒绝分配 — 排查速查

**来源数**: 7 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Access denied with DenyAssignmentAuthorizationFailed error mentioning System deny assignment create… | Managed Applications create deny assignments on managed resource groups to prevent users from makin… | Two options: 1) Delete the Managed Application itself (deletes all resources including deny assignm… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Access denied with DenyAssignmentAuthorizationFailed error caused by Blueprint assignment locking | Azure Blueprints use Deny Assignments behind the scenes when locking functionality is enabled | Two options: 1) Remove the blueprint assignment (does not delete resources). 2) Update the blueprin… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Access denied with DenyAssignmentAuthorizationFailed on managed resource groups created by 1st part… | Some Microsoft 1st party RPs use managed resource groups without using managed applications. Known … | Two options: 1) Remove the parent resource (deletes managed RG and deny assignment). 2) Transfer ca… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Deny assignment does not block operations from first-party resource providers | By design, first-party RPs are not blocked by deny assignments. Deny assignments only block user an… | This is expected behavior by design. Deny assignments cannot be used to block first-party RP operat… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Customer wants to create their own deny assignments to block access but cannot | Users cannot directly create their own deny assignments. Deny assignments are only created and mana… | Explain that deny assignments cannot be created directly by users. If the customer needs to lock re… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Access denied with DenyAssignmentAuthorizationFailed with Deny registrations from Azure Portal in i… | Microsoft internal deny assignments protect resources in production/AME internal subscriptions. Por… | Use PowerShell or CLI instead of Portal for resource deletion and resource provider registration. F… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 7 📋 | 无法删除 Managed Application（如 Azure Databricks）自动创建的基础设施资源组，报错 lock can't be deleted because a system … | Azure Managed Application（如 Databricks、Confluent 等）会自动创建一个锁定的基础设施资源组，该 lock 由系统应用（system applicatio… | 1) 不要直接删除基础设施资源组或其上的 lock；2) 通过删除 Managed Application 服务本身（如删除 Databricks workspace）来间接删除基础设施资源组；3)… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |

## 快速排查路径
1. Two options: 1) Delete the Managed Application itself (deletes all resources in… `[来源: ado-wiki]`
2. Two options: 1) Remove the blueprint assignment (does not delete resources). 2)… `[来源: ado-wiki]`
3. Two options: 1) Remove the parent resource (deletes managed RG and deny assignm… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/rbac-deny-assignments.md#排查流程)
