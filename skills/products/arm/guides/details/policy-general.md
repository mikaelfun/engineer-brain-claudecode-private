# ARM Azure Policy 通用问题 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 31 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-azure-data-factory-policy-integration.md, ado-wiki-a-azure-load-testing-policy-integration.md, ado-wiki-a-debugging-a-policy.md, ado-wiki-a-policy-aliases.md, ado-wiki-a-policy-aware-portal-experience.md (+26 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Policy (Microsoft.PolicyInsights) and Microsoft Defender for Containers (…
> 来源: onenote

**根因分析**: These extensions have not been onboarded to the Mooncake (Azure China) environment. The portal UI for Arc K8s extension installation is not functional in Mooncake.

1. Use Azure CLI to install available extensions (azuremonitor.
2. containers, azurekeyvaultsecretsprovider, microsoft.
3. For Azure Policy and Defender, inform customer these are not yet available in Mooncake and there is no published ETA.

`[结论: 🔵 7.5/10 — [MCVKB/#Extension status.md]]`

### Phase 2: Customer hits Azure Policy definition limit when creating one policy definition…
> 来源: ado-wiki

**根因分析**: Policy limits are per scope and per cloud, cannot be customized. Creating a separate definition per resource group exhausts the definition quota at that scope.

1. Create a single parameterized policy definition (e.
2. required tag) and create separate assignments per resource group with different parameter values.
3. Assignments can exist at management group, subscription, and resource group level, enabling hundreds of assignments.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Policy scans non-taggable resources in Indexed mode
> 来源: ado-wiki

**根因分析**: Two causes: (1) Resource supports tags at API level but no Tags UI. (2) RP manifest has incorrect routingType Default when resource does not support tags.

1. Cause 1: Tag via All Resources blade (Show hidden types) or PowerShell/CLI/REST.
2. Cause 2: RP needs to implement tag support or change routingType to proxyOnly.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Need to determine if an Azure Policy property is data plane or control plane
> 来源: ado-wiki

**根因分析**: Data plane properties are not returned on calls to management.azure.com; they go to RP-specific endpoints and cannot be accessed by standard ARM API calls used by Policy

1. Properties accessible via management.
2. com GET/PUT responses are control plane.
3. Properties not returned by management.
4. com (served by RP-specific endpoints) are data plane and not directly accessible by Policy.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Customer wants to receive alerts or notifications when Azure Policy compliance …
> 来源: ado-wiki

**根因分析**: Azure Policy does not support creating alerts as built-in functionality out of the box.

1. Use Azure Event Grid system topic for Azure Policy.
2. Customers can subscribe to compliance state change events via Event Grid and integrate them with Logic Apps, Azure Functions, or other alerting mechanisms.
3. Reference: https://learn.
4. com/en-us/azure/governance/policy/concepts/event-overview.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: 创建或更新资源时收到 RequestDisallowedByPolicy 错误，操作被 Azure Policy 拒绝
> 来源: ado-wiki

**根因分析**: 资源违反了 Deny 效果的策略定义，错误消息中包含触发的 policyAssignment 和 policyDefinition 信息

1. 读取错误消息中的 policyIdentifiers 字段，定位具体的策略赋值名称和 ID；2.
2. 检查 evaluationDetails.
3. evaluatedExpressions，确认哪些属性值不满足策略条件；3.
4. 修改资源属性以符合策略要求，或联系 Policy 管理员排除豁免.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: RequestDisallowedByPolicy 错误中缺少 evaluationDetails 详情，无法得知具体哪个条件不满足
> 来源: ado-wiki

**根因分析**: 发起操作的用户没有 Policy 相关权限，策略引擎会从错误响应中移除 evaluationDetails，仅返回 policyAssignment 和 policyDefinition 标识

1. 通知用户联系其 Security 团队或 Policy 管理员；工程师不应代替客户修改租户策略配置。如果客户认为操作不应被拒绝，引导其至 [Policy enforcement not as expected] 排查路径.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure Arc server disconnected: heartbeat stops, extensions cannot install/updat…
> 来源: mslearn

**根因分析**: Connected Machine agent lost internet connectivity. Heartbeat stops reaching Azure after 15 minutes.

1. Restore network connectivity.
2. After reconnection extensions auto-execute (queued up to 6h).
3. If disconnected >45-90 days must re-onboard.
4. Set up Resource Health alerts for early detection.

`[结论: 🔵 6.0/10 — [mslearn]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Policy (Microsoft.PolicyInsights) and Microsoft Defen… | These extensions have not been onboarded to the Mooncake (A… | Use Azure CLI to install available extensions (azuremonitor… |
| Customer hits Azure Policy definition limit when creating o… | Policy limits are per scope and per cloud, cannot be custom… | Create a single parameterized policy definition (e.g. requi… |
| Azure Policy scans non-taggable resources in Indexed mode | Two causes: (1) Resource supports tags at API level but no … | Cause 1: Tag via All Resources blade (Show hidden types) or… |
| Need to determine if an Azure Policy property is data plane… | Data plane properties are not returned on calls to manageme… | Properties accessible via management.azure.com GET/PUT resp… |
| Customer wants to receive alerts or notifications when Azur… | Azure Policy does not support creating alerts as built-in f… | Use Azure Event Grid system topic for Azure Policy. Custome… |
| 创建或更新资源时收到 RequestDisallowedByPolicy 错误，操作被 Azure Policy 拒绝 | 资源违反了 Deny 效果的策略定义，错误消息中包含触发的 policyAssignment 和 policyDefi… | 1. 读取错误消息中的 policyIdentifiers 字段，定位具体的策略赋值名称和 ID；2. 检查 eval… |
| RequestDisallowedByPolicy 错误中缺少 evaluationDetails 详情，无法得知具体… | 发起操作的用户没有 Policy 相关权限，策略引擎会从错误响应中移除 evaluationDetails，仅返回 p… | 通知用户联系其 Security 团队或 Policy 管理员；工程师不应代替客户修改租户策略配置。如果客户认为操作不… |
| Azure Arc server disconnected: heartbeat stops, extensions … | Connected Machine agent lost internet connectivity. Heartbe… | Restore network connectivity. After reconnection extensions… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Policy (Microsoft.PolicyInsights) and Microsoft Defender for Containers (microsoft.azuredefen… | These extensions have not been onboarded to the Mooncake (Azure China) environment. The portal UI f… | Use Azure CLI to install available extensions (azuremonitor.containers, azurekeyvaultsecretsprovide… | 🔵 7.5 — onenote+21V适用 | [MCVKB/#Extension status.md] |
| 2 | Customer hits Azure Policy definition limit when creating one policy definition per resource group | Policy limits are per scope and per cloud, cannot be customized. Creating a separate definition per… | Create a single parameterized policy definition (e.g. required tag) and create separate assignments… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Policy scans non-taggable resources in Indexed mode | Two causes: (1) Resource supports tags at API level but no Tags UI. (2) RP manifest has incorrect r… | Cause 1: Tag via All Resources blade (Show hidden types) or PowerShell/CLI/REST. Cause 2: RP needs … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Need to determine if an Azure Policy property is data plane or control plane | Data plane properties are not returned on calls to management.azure.com; they go to RP-specific end… | Properties accessible via management.azure.com GET/PUT responses are control plane. Properties not … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Customer wants to receive alerts or notifications when Azure Policy compliance state changes, but P… | Azure Policy does not support creating alerts as built-in functionality out of the box. | Use Azure Event Grid system topic for Azure Policy. Customers can subscribe to compliance state cha… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | 创建或更新资源时收到 RequestDisallowedByPolicy 错误，操作被 Azure Policy 拒绝 | 资源违反了 Deny 效果的策略定义，错误消息中包含触发的 policyAssignment 和 policyDefinition 信息 | 1. 读取错误消息中的 policyIdentifiers 字段，定位具体的策略赋值名称和 ID；2. 检查 evaluationDetails.evaluatedExpressions，确认哪些属… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | RequestDisallowedByPolicy 错误中缺少 evaluationDetails 详情，无法得知具体哪个条件不满足 | 发起操作的用户没有 Policy 相关权限，策略引擎会从错误响应中移除 evaluationDetails，仅返回 policyAssignment 和 policyDefinition 标识 | 通知用户联系其 Security 团队或 Policy 管理员；工程师不应代替客户修改租户策略配置。如果客户认为操作不应被拒绝，引导其至 [Policy enforcement not as exp… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Azure Arc server disconnected: heartbeat stops, extensions cannot install/update, policy guest assi… | Connected Machine agent lost internet connectivity. Heartbeat stops reaching Azure after 15 minutes. | Restore network connectivity. After reconnection extensions auto-execute (queued up to 6h). If disc… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
