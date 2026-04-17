# ARM RBAC 拒绝分配 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 4 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-azure-local-rbac.md, ado-wiki-a-get-rbac-iam-control-details.md, ado-wiki-a-rbac-tenant-vms-disconnected-azure-local.md, ado-wiki-rbac-evaluation-on-arm.md
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Deny assignment does not block operations from first-party resource providers
> 来源: ado-wiki

**根因分析**: By design, first-party RPs are not blocked by deny assignments. Deny assignments only block user and third-party operations.

1. This is expected behavior by design.
2. Deny assignments cannot be used to block first-party RP operations on resources.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 2: Customer wants to create their own deny assignments to block access but cannot
> 来源: ado-wiki

**根因分析**: Users cannot directly create their own deny assignments. Deny assignments are only created and managed by Azure Blueprints and Azure managed apps to protect system-managed resources.

1. Explain that deny assignments cannot be created directly by users.
2. If the customer needs to lock resources, they should use Azure Blueprints which can create deny assignments for blueprint-deployed resources.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 3: Access denied with DenyAssignmentAuthorizationFailed error mentioning System de…
> 来源: ado-wiki

**根因分析**: Managed Applications create deny assignments on managed resource groups to prevent users from making changes that can break the managed application functionality

1. Two options: 1) Delete the Managed Application itself (deletes all resources including deny assignment).
2. 2) Contact the vendor of the managed application for support.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Access denied with DenyAssignmentAuthorizationFailed error caused by Blueprint …
> 来源: ado-wiki

**根因分析**: Azure Blueprints use Deny Assignments behind the scenes when locking functionality is enabled

1. Two options: 1) Remove the blueprint assignment (does not delete resources).
2. 2) Update the blueprint assignment to locking mode Do Not Lock.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Access denied with DenyAssignmentAuthorizationFailed on managed resource groups…
> 来源: ado-wiki

**根因分析**: Some Microsoft 1st party RPs use managed resource groups without using managed applications. Known types: Microsoft.Databricks/workspaces, Microsoft.Insights/components, Microsoft.MachineLearningServices/registries, Microsoft.Monitor/accounts, Microsoft.Purview/accounts, Microsoft.RedHatOpenShift/OpenShiftClusters, Microsoft.Synapse/workspaces

1. Two options: 1) Remove the parent resource (deletes managed RG and deny assignment).
2. 2) Transfer case to the owning team.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Access denied with DenyAssignmentAuthorizationFailed with Deny registrations fr…
> 来源: ado-wiki

**根因分析**: Microsoft internal deny assignments protect resources in production/AME internal subscriptions. Portal-only restriction.

1. Use PowerShell or CLI instead of Portal for resource deletion and resource provider registration.
2. For further concerns contact the security team per internal documentation.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 7: 无法删除 Managed Application（如 Azure Databricks）自动创建的基础设施资源组，报错 lock can't be delet…
> 来源: mslearn

**根因分析**: Azure Managed Application（如 Databricks、Confluent 等）会自动创建一个锁定的基础设施资源组，该 lock 由系统应用（system application）拥有，用户无权直接删除该 lock。这是 Managed Application 框架的设计行为，防止用户误删底层基础设施

1. 1) 不要直接删除基础设施资源组或其上的 lock；2) 通过删除 Managed Application 服务本身（如删除 Databricks workspace）来间接删除基础设施资源组；3) Portal → 找到 Managed Application → 查看 Managed Resource Group 链接 → 删除 Application 而非 RG；4) 注意 Lighthouse 场景下管理租户用户也受 system-assigned deny assignment 限制.

`[结论: 🔵 6.0/10 — [mslearn]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Deny assignment does not block operations from first-party … | By design, first-party RPs are not blocked by deny assignme… | This is expected behavior by design. Deny assignments canno… |
| Customer wants to create their own deny assignments to bloc… | Users cannot directly create their own deny assignments. De… | Explain that deny assignments cannot be created directly by… |
| Access denied with DenyAssignmentAuthorizationFailed error … | Managed Applications create deny assignments on managed res… | Two options: 1) Delete the Managed Application itself (dele… |
| Access denied with DenyAssignmentAuthorizationFailed error … | Azure Blueprints use Deny Assignments behind the scenes whe… | Two options: 1) Remove the blueprint assignment (does not d… |
| Access denied with DenyAssignmentAuthorizationFailed on man… | Some Microsoft 1st party RPs use managed resource groups wi… | Two options: 1) Remove the parent resource (deletes managed… |
| Access denied with DenyAssignmentAuthorizationFailed with D… | Microsoft internal deny assignments protect resources in pr… | Use PowerShell or CLI instead of Portal for resource deleti… |
| 无法删除 Managed Application（如 Azure Databricks）自动创建的基础设施资源组，报错… | Azure Managed Application（如 Databricks、Confluent 等）会自动创建一个锁… | 1) 不要直接删除基础设施资源组或其上的 lock；2) 通过删除 Managed Application 服务本身（… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Access denied with DenyAssignmentAuthorizationFailed error mentioning System deny assignment create… | Managed Applications create deny assignments on managed resource groups to prevent users from makin… | Two options: 1) Delete the Managed Application itself (deletes all resources including deny assignm… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Access denied with DenyAssignmentAuthorizationFailed error caused by Blueprint assignment locking | Azure Blueprints use Deny Assignments behind the scenes when locking functionality is enabled | Two options: 1) Remove the blueprint assignment (does not delete resources). 2) Update the blueprin… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Access denied with DenyAssignmentAuthorizationFailed on managed resource groups created by 1st part… | Some Microsoft 1st party RPs use managed resource groups without using managed applications. Known … | Two options: 1) Remove the parent resource (deletes managed RG and deny assignment). 2) Transfer ca… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Deny assignment does not block operations from first-party resource providers | By design, first-party RPs are not blocked by deny assignments. Deny assignments only block user an… | This is expected behavior by design. Deny assignments cannot be used to block first-party RP operat… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Customer wants to create their own deny assignments to block access but cannot | Users cannot directly create their own deny assignments. Deny assignments are only created and mana… | Explain that deny assignments cannot be created directly by users. If the customer needs to lock re… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Access denied with DenyAssignmentAuthorizationFailed with Deny registrations from Azure Portal in i… | Microsoft internal deny assignments protect resources in production/AME internal subscriptions. Por… | Use PowerShell or CLI instead of Portal for resource deletion and resource provider registration. F… | 🔵 6.0 — ado-wiki | [ADO Wiki] |
| 7 | 无法删除 Managed Application（如 Azure Databricks）自动创建的基础设施资源组，报错 lock can't be deleted because a system … | Azure Managed Application（如 Databricks、Confluent 等）会自动创建一个锁定的基础设施资源组，该 lock 由系统应用（system applicatio… | 1) 不要直接删除基础设施资源组或其上的 lock；2) 通过删除 Managed Application 服务本身（如删除 Databricks workspace）来间接删除基础设施资源组；3)… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
