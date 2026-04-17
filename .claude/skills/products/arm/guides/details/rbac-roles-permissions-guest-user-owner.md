# ARM RBAC 角色与权限管理 guest user owner — 综合排查指南

**条目数**: 6 | **草稿融合数**: 4 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-a-azure-local-rbac.md, ado-wiki-a-get-rbac-iam-control-details.md, ado-wiki-a-rbac-tenant-vms-disconnected-azure-local.md, ado-wiki-rbac-evaluation-on-arm.md
**Kusto 引用**: activity-log.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Guest User（外部用户）访问 Azure 资源报错 AuthorizationFailed：does not have authorization t…
> 来源: mslearn

**根因分析**: Guest User 未被分配足够权限的 RBAC 角色到目标资源 scope。与内部用户不同，Guest User 默认权限更受限（目录权限、资源发现能力等），需要显式角色分配

1. 1) 使用 Portal → Access control (IAM) → Check access 确认 Guest User 的角色分配；2) 按最小权限原则分配合适的 Azure built-in role；3) 参考 Assign Azure roles to external users 文档了解 Guest User RBAC 最佳实践.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 2: 无法删除订阅最后一个 Owner 角色分配，报错 Cannot delete the last RBAC admin assignment
> 来源: mslearn

**根因分析**: Azure 默认不允许删除订阅级别的最后一个 Owner 角色分配，防止订阅变成无人管理状态（orphaned subscription）

1. 1) 如需取消订阅：使用 Cancel subscription 功能；2) 全局管理员（Global Admin）可以提升访问权限后删除最后一个 Owner 分配（使用 Access management for Azure resources toggle）；3) 如使用 PIM，可临时激活 Owner/User Access Administrator 角色 → 删除目标角色分配 → 然后停用/等待过期.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 3: PIM（Privileged Identity Management）中 Azure 资源操作被拒绝：Active Owner/User Access Adm…
> 来源: mslearn

**根因分析**: MS-PIM 服务主体的 User Access Administrator 角色被意外移除。PIM 需要 MS-PIM service principal 在订阅上拥有 User Access Administrator 角色才能管理 Azure 资源的角色分配

1. 1) 在订阅或管理组级别重新分配 User Access Administrator 角色给 MS-PIM service principal；2) 根据需要在 management group 或 subscription scope 分配.

`[结论: 🟡 4.5/10 — [mslearn]]`

### Phase 4: Azure Lighthouse 跨国家云委派不支持：无法在国家云（如 21Vianet/Azure Government）与 Azure 公有云之间、或两个…
> 来源: mslearn

**根因分析**: Azure Lighthouse 是非区域性服务，支持跨区域管理委派资源，但不支持跨国家云（national cloud）和公有云的委派，也不支持两个国家云之间的委派。此外 Lighthouse 仅支持 ARM 控制面操作（URI 以 https://management.azure.com 开头），不支持数据面操作（如 Key Vault secrets、Storage blob data）；角色仅支持内置角色（不含 Owner 和 DataActions 权限），不支持自定义角色

1. 1) 国家云与公有云之间无法使用 Lighthouse，需在各自云中独立管理；2) 使用 Guest 账号跨租户管理资源作为替代方案；3) 数据面操作需通过客户租户直接访问；4) 需要 Owner 权限时使用 User Access Administrator + 受限 managed identity 方案；5) 自定义角色需求可通过组合内置角色来满足.

`[结论: 🟡 4.5/10 — [mslearn]]`

### Phase 5: Azure Arc agent onboard fails with 403: does not have authorization to perform …
> 来源: mslearn

**根因分析**: User or service principal lacks Azure Connected Machine Onboarding role at target scope.

1. Assign Azure Connected Machine Onboarding built-in role to the user or service principal at subscription or resource group scope.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 6: Azure Arc K8s connect fails: secrets is forbidden User cannot list resource sec…
> 来源: mslearn

**根因分析**: kubeconfig lacks cluster-admin Kubernetes RBAC permissions required for Arc agent installation.

1. Assign cluster-admin role: kubectl create clusterrolebinding arc-admin --clusterrole=cluster-admin --user=USER.
2. Retry az connectedk8s connect.

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
| Guest User（外部用户）访问 Azure 资源报错 AuthorizationFailed：does not … | Guest User 未被分配足够权限的 RBAC 角色到目标资源 scope。与内部用户不同，Guest User … | 1) 使用 Portal → Access control (IAM) → Check access 确认 Guest… |
| 无法删除订阅最后一个 Owner 角色分配，报错 Cannot delete the last RBAC admin … | Azure 默认不允许删除订阅级别的最后一个 Owner 角色分配，防止订阅变成无人管理状态（orphaned sub… | 1) 如需取消订阅：使用 Cancel subscription 功能；2) 全局管理员（Global Admin）可… |
| PIM（Privileged Identity Management）中 Azure 资源操作被拒绝：Active O… | MS-PIM 服务主体的 User Access Administrator 角色被意外移除。PIM 需要 MS-PI… | 1) 在订阅或管理组级别重新分配 User Access Administrator 角色给 MS-PIM servi… |
| Azure Lighthouse 跨国家云委派不支持：无法在国家云（如 21Vianet/Azure Governme… | Azure Lighthouse 是非区域性服务，支持跨区域管理委派资源，但不支持跨国家云（national clou… | 1) 国家云与公有云之间无法使用 Lighthouse，需在各自云中独立管理；2) 使用 Guest 账号跨租户管理资… |
| Azure Arc agent onboard fails with 403: does not have autho… | User or service principal lacks Azure Connected Machine Onb… | Assign Azure Connected Machine Onboarding built-in role to … |
| Azure Arc K8s connect fails: secrets is forbidden User cann… | kubeconfig lacks cluster-admin Kubernetes RBAC permissions … | Assign cluster-admin role: kubectl create clusterrolebindin… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Guest User（外部用户）访问 Azure 资源报错 AuthorizationFailed：does not have authorization to perform action ove… | Guest User 未被分配足够权限的 RBAC 角色到目标资源 scope。与内部用户不同，Guest User 默认权限更受限（目录权限、资源发现能力等），需要显式角色分配 | 1) 使用 Portal → Access control (IAM) → Check access 确认 Guest User 的角色分配；2) 按最小权限原则分配合适的 Azure built-… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 2 | 无法删除订阅最后一个 Owner 角色分配，报错 Cannot delete the last RBAC admin assignment | Azure 默认不允许删除订阅级别的最后一个 Owner 角色分配，防止订阅变成无人管理状态（orphaned subscription） | 1) 如需取消订阅：使用 Cancel subscription 功能；2) 全局管理员（Global Admin）可以提升访问权限后删除最后一个 Owner 分配（使用 Access manage… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 3 | Azure Arc agent onboard fails with 403: does not have authorization to perform action Microsoft.Hyb… | User or service principal lacks Azure Connected Machine Onboarding role at target scope. | Assign Azure Connected Machine Onboarding built-in role to the user or service principal at subscri… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 4 | Azure Arc K8s connect fails: secrets is forbidden User cannot list resource secrets at cluster scope | kubeconfig lacks cluster-admin Kubernetes RBAC permissions required for Arc agent installation. | Assign cluster-admin role: kubectl create clusterrolebinding arc-admin --clusterrole=cluster-admin … | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 5 | PIM（Privileged Identity Management）中 Azure 资源操作被拒绝：Active Owner/User Access Administrator 能看到资源但无法执… | MS-PIM 服务主体的 User Access Administrator 角色被意外移除。PIM 需要 MS-PIM service principal 在订阅上拥有 User Access A… | 1) 在订阅或管理组级别重新分配 User Access Administrator 角色给 MS-PIM service principal；2) 根据需要在 management group 或… | 🟡 4.5 — mslearn | [mslearn] |
| 6 | Azure Lighthouse 跨国家云委派不支持：无法在国家云（如 21Vianet/Azure Government）与 Azure 公有云之间、或两个国家云之间建立 Lighthouse d… | Azure Lighthouse 是非区域性服务，支持跨区域管理委派资源，但不支持跨国家云（national cloud）和公有云的委派，也不支持两个国家云之间的委派。此外 Lighthouse 仅… | 1) 国家云与公有云之间无法使用 Lighthouse，需在各自云中独立管理；2) 使用 Guest 账号跨租户管理资源作为替代方案；3) 数据面操作需通过客户租户直接访问；4) 需要 Owner … | 🟡 4.5 — mslearn | [mslearn] |
