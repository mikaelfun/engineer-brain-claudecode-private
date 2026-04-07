# ARM 订阅管理与计费 — 排查速查

**来源数**: 8 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 403 Forbidden when creating Azure subscriptions via billing API (Microsoft.Subscription/aliases) us… | The workload parameter in the Create Subscription Aliases request must match the enabledAzurePlans … | Check the enabledAzurePlans of the invoice section via ListInvoiceSectionsWithCreateSubscriptionPer… | 🟢 8.5 — onenote+21V适用 | [MCVKB/24.1 Received 403 forbidden when using billing API.md] |
| 2 | Customer requests a refund for an ARM service outage | ARM is a free management layer with an internal non-financially backed SLO target of 99.95% — no pu… | Refunds for ARM outages are not applicable since no public SLA is offered. If customer claims addit… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | AT&T customer raises a Nexus billing query (direct support case or via ASMS collaboration case) | AT&T has a bespoke contract with specific billing terms; standard Azure billing mechanics and meter… | Reach out to Jason Ryberg (jason.ryberg@microsoft.com) with case details and agree next steps to re… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | 转移 Azure Plan 订阅的 Billing Ownership 时报错 Access Denied：没有权限执行转移操作 | 转移 Microsoft Azure Plan (MCA) 订阅需要在该订阅所属的 Invoice Section 上拥有 Owner 或 Contributor 角色。普通 Account Adm… | 1) 确认在 Invoice Section 上拥有 Owner 或 Contributor 角色；2) Portal -> Cost Management + Billing -> Billing… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 5 | Marketplace 产品转移失败：The operation has failed because we could not find a valid payment method on thi… | 目标 Billing Account 的 Payment Type 不支持付费 Marketplace 产品转移。仅 Paid 和 SponsoredPlus(MultipleSponsorship… | 1) 确认目标 Billing Account 的 Payment Type 为 Paid 或 SponsoredPlus；2) 免费 Marketplace 产品无限制可转移到任何账号；3) 如目… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 6 | 订阅转移时 Key Vault 访问中断且可能导致不可恢复的加密数据丢失：使用 CMK 加密的 Storage/SQL 与被转移的 Key Vault 关联 | Key Vault 在创建时绑定到 Entra 租户 ID。订阅转移到不同目录后 Key Vault 的 tenant ID 不匹配，所有 access policy 失效。如果 Storage/S… | 1) 转移前禁用 CMK 或切换到不会被转移的 Key Vault；2) 转移后立即更新 Key Vault 的 tenant ID：az keyvault update --name xxx --… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 7 | 订阅转移到不同 Entra 目录后所有角色分配丢失、Managed Identity 失效 | 将 Azure 订阅 transfer 到不同的 Microsoft Entra 目录时，所有 RBAC 角色分配会被永久删除且不会迁移到目标目录。同时 Azure 托管标识（Managed Ide… | 1) 转移前记录所有角色分配：Get-AzRoleAssignment -Scope /subscriptions/{subId}；2) 转移后在目标目录中重新创建所有角色分配；3) 重新创建 Ma… | 🟡 4.5 — mslearn | [mslearn] |
| 8 | Azure 订阅处于 Disabled/Warned/Expired 状态导致无法部署任何新资源，PUT/PATCH/POST 操作均返回失败 | 订阅被禁用的原因包括：1) Free Trial credit 用完；2) 触及 Spending Limit；3) 账单逾期未付（Past Due）；4) 信用卡额度超限；5) 管理员手动取消；6… | 1) 检查订阅状态：Portal → Subscriptions → Status 列；2) Spending Limit 导致的：移除 Spending Limit（Portal → Cost M… | 🟡 4.5 — mslearn | [mslearn] |

## 快速排查路径
1. Check the enabledAzurePlans of the invoice section via ListInvoiceSectionsWithC… `[来源: onenote]`
2. Refunds for ARM outages are not applicable since no public SLA is offered. If c… `[来源: ado-wiki]`
3. Reach out to Jason Ryberg (jason.ryberg@microsoft.com) with case details and ag… `[来源: ado-wiki]`
