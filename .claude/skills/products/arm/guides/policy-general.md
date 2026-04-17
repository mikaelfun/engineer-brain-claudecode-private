# ARM Azure Policy 通用问题 — 排查速查

**来源数**: 8 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Policy (Microsoft.PolicyInsights) and Microsoft Defender for Containers (microsoft.azuredefen… | These extensions have not been onboarded to the Mooncake (Azure China) environment. The portal UI f… | Use Azure CLI to install available extensions (azuremonitor.containers, azurekeyvaultsecretsprovide… | 🔵 7.5 — onenote+21V适用 | [MCVKB/#Extension status.md] |
| 2 📋 | Customer hits Azure Policy definition limit when creating one policy definition per resource group | Policy limits are per scope and per cloud, cannot be customized. Creating a separate definition per… | Create a single parameterized policy definition (e.g. required tag) and create separate assignments… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Azure Policy scans non-taggable resources in Indexed mode | Two causes: (1) Resource supports tags at API level but no Tags UI. (2) RP manifest has incorrect r… | Cause 1: Tag via All Resources blade (Show hidden types) or PowerShell/CLI/REST. Cause 2: RP needs … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Need to determine if an Azure Policy property is data plane or control plane | Data plane properties are not returned on calls to management.azure.com; they go to RP-specific end… | Properties accessible via management.azure.com GET/PUT responses are control plane. Properties not … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Customer wants to receive alerts or notifications when Azure Policy compliance state changes, but P… | Azure Policy does not support creating alerts as built-in functionality out of the box. | Use Azure Event Grid system topic for Azure Policy. Customers can subscribe to compliance state cha… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | 创建或更新资源时收到 RequestDisallowedByPolicy 错误，操作被 Azure Policy 拒绝 | 资源违反了 Deny 效果的策略定义，错误消息中包含触发的 policyAssignment 和 policyDefinition 信息 | 1. 读取错误消息中的 policyIdentifiers 字段，定位具体的策略赋值名称和 ID；2. 检查 evaluationDetails.evaluatedExpressions，确认哪些属… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | RequestDisallowedByPolicy 错误中缺少 evaluationDetails 详情，无法得知具体哪个条件不满足 | 发起操作的用户没有 Policy 相关权限，策略引擎会从错误响应中移除 evaluationDetails，仅返回 policyAssignment 和 policyDefinition 标识 | 通知用户联系其 Security 团队或 Policy 管理员；工程师不应代替客户修改租户策略配置。如果客户认为操作不应被拒绝，引导其至 [Policy enforcement not as exp… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Azure Arc server disconnected: heartbeat stops, extensions cannot install/update, policy guest assi… | Connected Machine agent lost internet connectivity. Heartbeat stops reaching Azure after 15 minutes. | Restore network connectivity. After reconnection extensions auto-execute (queued up to 6h). If disc… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |

## 快速排查路径
1. Use Azure CLI to install available extensions (azuremonitor.containers, azureke… `[来源: onenote]`
2. Create a single parameterized policy definition (e.g. required tag) and create … `[来源: ado-wiki]`
3. Cause 1: Tag via All Resources blade (Show hidden types) or PowerShell/CLI/REST… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/policy-general.md#排查流程)
