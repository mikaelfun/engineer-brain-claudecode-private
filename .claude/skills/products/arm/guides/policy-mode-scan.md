# ARM Azure Policy 模式与合规扫描 — 排查速查

**来源数**: 15 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Policy compliance scan shows '0 out of 0' resources for a proxy resource type when using mode… | mode:Indexed only evaluates tracked resources. Proxy resource types are skipped entirely, resulting… | Use mode:All for proxy resource types. mode:Indexed should only be used when the policy evaluates l… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Policy compliance results show 0 resources scanned | Three causes: (1) Indexed mode on proxy resource type. (2) No resources match definition conditions… | Cause 1: Change mode to All. Cause 2: Create matching resources or modify definition/scope. Cause 3… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | deployIfNotExists (DINE) policy shows incorrect compliance results when if.field.type and then.deta… | Missing then.details.name property; without it Policy treats any resource of matching type as satis… | Add then.details.name with value [field('fullname')] when if.field.type equals then.details.type in… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Policy assignment not taking effect immediately after being created or updated — deny/audit e… | Policy assignments are cached in the ARM layer. The cache is refreshed every 30 minutes. During thi… | Log out and log back in to Azure portal to force the policy assignment cache to refresh immediately… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Customer cannot find or access the manual policy attestation UI in Azure portal to set compliance s… | The attestation UI is only available to Microsoft Defender for Cloud (MDC) premium tier users. Non-… | Non-premium MDC users must use the Azure REST API (`Microsoft.PolicyInsights/attestations` extensio… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Kubernetes (AKS/Arc) data plane policy compliance results are delayed or not reflecting changes imm… | Compliance data flows through a multi-step pipeline: Policy pod syncs every 10-15 min → sends to Da… | Wait 30-45 minutes after policy assignment changes for compliance data to propagate. To investigate… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | VNETs that meet all conditions for an Azure Virtual Network Manager (AVNM) network group show as 'n… | By design: AVNM uses Policy's non-compliant result as the signal to add VNETs to network groups. A … | This is expected behavior for AVNM-related policy assignments. Non-compliant in this context means … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Policy evaluation details for Key Vault data plane policies are not visible in the Azure Policy Com… | Evaluation details are not yet surfaced in the Policy Compliance UI for Key Vault data plane polici… | Known limitation — evaluation details are not available via the Policy Compliance UI for KV data pl… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Customer cannot export Azure Policy compliance data from the Azure Portal | Exporting policy compliance data through the Azure Portal is not supported as a built-in portal fea… | Export compliance data using Azure Resource Graph (ARG) queries or via REST API / CLI commands. Ref… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Compliance scan results not updated in Azure portal for up to 30 minutes after policy assignment cr… | Brownfield scan is triggered via EventServicesEntries table entries ingested from Geneva; this inge… | Wait up to 30 minutes for compliance state to update automatically; for immediate results trigger a… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | 资源合规状态不符合预期（brownfield 扫描结果意外合规/非合规），或扫描范围不正确 | 策略定义的 mode 设置不正确，导致资源类型不在评估范围内 | 检查策略 mode 设置：Indexed 模式仅评估支持 tags 和 location 的资源类型；All 模式评估所有资源类型。根据目标资源类型选择正确 mode | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 📋 | 使用数组别名 ([*]) 的策略合规状态不符合预期 | 数组别名语法使用不正确，Policy 评估数组属性时有特殊语法要求 | 参考文档 [Author policies for array properties on Azure resources] 检查并修正数组别名语法，特别注意 count 表达式和 where 子句… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 📋 | 资源未被 Policy 扫描评估，或有豁免的资源仍被标记为非合规 | 资源不在赋值 scope 内、位于 notScopes 排除列表中，或存在针对该资源或其父 scope 的豁免 (exemption) | 1. 验证资源是否在赋值 scope 覆盖范围内；2. 检查赋值的 notScopes 是否包含该资源路径；3. 检查是否存在适用的 exemption | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 📋 | ARM 部署报错 RequestDisallowedByPolicy：Resource was disallowed by policy. Policy identifiers: [policyAs… | 订阅或资源组上分配了 Azure Policy，部署的资源不符合策略规则（如禁止创建公共 IP、限制允许的资源类型等） | 1) 从错误消息中找到 policyAssignment name 和 policyDefinition name；2) 用 az policy definition show --name {na… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 15 📋 | Azure Policy 合规性评估延迟：资源显示 Not Started 状态、合规结果过期、或新策略分配后资源未被评估 | Policy 评估存在固有延迟：1) 新 Policy/Initiative Assignment 约 5 分钟后开始生效；2) 已有 Assignment 范围内的新建/更新资源约 15 分钟后被… | 1) 等待足够时间让评估完成（新 assignment 5min，资源变更 15min，完整扫描 24h）；2) 手动触发按需评估扫描：Start-AzPolicyComplianceScan（Po… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |

## 快速排查路径
1. Use mode:All for proxy resource types. mode:Indexed should only be used when th… `[来源: ado-wiki]`
2. Cause 1: Change mode to All. Cause 2: Create matching resources or modify defin… `[来源: ado-wiki]`
3. Add then.details.name with value [field('fullname')] when if.field.type equals … `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/policy-mode-scan.md#排查流程)
