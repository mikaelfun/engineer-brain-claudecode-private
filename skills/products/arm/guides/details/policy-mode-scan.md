# ARM Azure Policy 模式与合规扫描 — 综合排查指南

**条目数**: 15 | **草稿融合数**: 31 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-azure-data-factory-policy-integration.md, ado-wiki-a-azure-load-testing-policy-integration.md, ado-wiki-a-debugging-a-policy.md, ado-wiki-a-policy-aliases.md, ado-wiki-a-policy-aware-portal-experience.md (+26 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Policy compliance scan shows '0 out of 0' resources for a proxy resource …
> 来源: ado-wiki

**根因分析**: mode:Indexed only evaluates tracked resources. Proxy resource types are skipped entirely, resulting in no resources being scanned.

1. Use mode:All for proxy resource types.
2. mode:Indexed should only be used when the policy evaluates location and tags (tracked resources only).
3. When evaluating Microsoft.
4. Resources/subscriptions or Microsoft.
5. Resources/subscriptions/resourceGroups, always use mode:All even if checking tags or location.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Policy compliance results show 0 resources scanned
> 来源: ado-wiki

**根因分析**: Three causes: (1) Indexed mode on proxy resource type. (2) No resources match definition conditions at scope. (3) Resources excluded via notScopes or exempt.

1. Cause 1: Change mode to All.
2. Cause 2: Create matching resources or modify definition/scope.
3. Cause 3: Remove incorrect notScope exclusions or exemptions.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: deployIfNotExists (DINE) policy shows incorrect compliance results when if.fiel…
> 来源: ado-wiki

**根因分析**: Missing then.details.name property; without it Policy treats any resource of matching type as satisfying the existence check

1. name with value [field('fullname')] when if.
2. type equals then.
3. type in DINE policies.
4. For auditIfNotExists with matching types, consider using audit effect instead.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Policy assignment not taking effect immediately after being created or up…
> 来源: ado-wiki

**根因分析**: Policy assignments are cached in the ARM layer. The cache is refreshed every 30 minutes. During this window, greenfield (synchronous) policy evaluation uses the stale cached assignments and may not include newly created/updated assignments.

1. Log out and log back in to Azure portal to force the policy assignment cache to refresh immediately, bypassing the 30-minute wait.
2. Alternatively, wait up to 30 minutes for the cache to refresh automatically.
3. Note: brownfield (compliance scan) results in portal may also take up to 30 minutes due to EventServicesEntries table ingestion delay.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Customer cannot find or access the manual policy attestation UI in Azure portal…
> 来源: ado-wiki

**根因分析**: The attestation UI is only available to Microsoft Defender for Cloud (MDC) premium tier users. Non-premium users do not have access to this UI (Public Preview limitation). Feature is in Public Preview.

1. Non-premium MDC users must use the Azure REST API (`Microsoft.
2. PolicyInsights/attestations` extension resource) to create/update attestations.
3. Use `Invoke-AzRestMethod` (PowerShell) or `az rest` (CLI).
4. REST API reference: https://learn.
5. com/en-us/rest/api/policy/attestations — Attestation structure: https://learn.
6. com/en-us/azure/governance/policy/concepts/attestation-structure.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Kubernetes (AKS/Arc) data plane policy compliance results are delayed or not re…
> 来源: ado-wiki

**根因分析**: Compliance data flows through a multi-step pipeline: Policy pod syncs every 10-15 min → sends to Data Plane service → Geneva ingestion (~5 min) → Rollup worker aggregates in Kusto every 15 min. Total end-to-end delay can be 30-45 minutes.

1. Wait 30-45 minutes after policy assignment changes for compliance data to propagate.
2. To investigate delays: check Policy pod logs (kubectl), Geneva ActivityCompleted/ActivityFailed logs, and Kusto rollup logs.
3. Reference: LEARN Policy pod logs documentation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: VNETs that meet all conditions for an Azure Virtual Network Manager (AVNM) netw…
> 来源: ado-wiki

**根因分析**: By design: AVNM uses Policy's non-compliant result as the signal to add VNETs to network groups. A VNET meeting the membership conditions is intentionally flagged non-compliant by Policy so AVNM knows to add it. Policy does not evaluate whether the VNET is already in the group.

1. This is expected behavior for AVNM-related policy assignments.
2. Non-compliant in this context means 'this VNET should be added to the AVNM network group.
3. ' AVNM handles the actual membership assignment accordingly.
4. No remediation is needed for the policy compliance result itself.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Policy evaluation details for Key Vault data plane policies are not visible in …
> 来源: ado-wiki

**根因分析**: Evaluation details are not yet surfaced in the Policy Compliance UI for Key Vault data plane policies. This is a known architecture gap/limitation. Evaluation happens via Key Vault SLM using a Policy nuget library, and details are not piped back to the Policy UI.

1. Known limitation — evaluation details are not available via the Policy Compliance UI for KV data plane policies.
2. Use Key Vault traces and Kusto logs (Components Greenfield/Brownfield logs, rollup worker data) for investigation.
3. Route Key Vault SLM/nuget issues to Key Vault team via SAPs: Azure/Key Vault/Managing Certificates, Managing Keys, or Managing Secrets.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Customer cannot export Azure Policy compliance data from the Azure Portal
> 来源: ado-wiki

**根因分析**: Exporting policy compliance data through the Azure Portal is not supported as a built-in portal feature.

1. Export compliance data using Azure Resource Graph (ARG) queries or via REST API / CLI commands.
2. Reference: https://learn.
3. com/en-us/azure/governance/policy/how-to/get-compliance-data.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Compliance scan results not updated in Azure portal for up to 30 minutes after …
> 来源: ado-wiki

**根因分析**: Brownfield scan is triggered via EventServicesEntries table entries ingested from Geneva; this ingestion pipeline can take up to 30 minutes; this affects both post-assignment full scans and per-resource scans triggered after greenfield events

1. Wait up to 30 minutes for compliance state to update automatically; for immediate results trigger an on-demand evaluation scan via Azure portal (Policy > Compliance > Re-evaluate) or via API/CLI: `az policy state trigger-scan`.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: 资源合规状态不符合预期（brownfield 扫描结果意外合规/非合规），或扫描范围不正确
> 来源: ado-wiki

**根因分析**: 策略定义的 mode 设置不正确，导致资源类型不在评估范围内

1. 检查策略 mode 设置：Indexed 模式仅评估支持 tags 和 location 的资源类型；All 模式评估所有资源类型。根据目标资源类型选择正确 mode.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: 使用数组别名 ([*]) 的策略合规状态不符合预期
> 来源: ado-wiki

**根因分析**: 数组别名语法使用不正确，Policy 评估数组属性时有特殊语法要求

1. 参考文档 [Author policies for array properties on Azure resources] 检查并修正数组别名语法，特别注意 count 表达式和 where 子句的正确写法.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 13: 资源未被 Policy 扫描评估，或有豁免的资源仍被标记为非合规
> 来源: ado-wiki

**根因分析**: 资源不在赋值 scope 内、位于 notScopes 排除列表中，或存在针对该资源或其父 scope 的豁免 (exemption)

1. 验证资源是否在赋值 scope 覆盖范围内；2.
2. 检查赋值的 notScopes 是否包含该资源路径；3.
3. 检查是否存在适用的 exemption.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 14: ARM 部署报错 RequestDisallowedByPolicy：Resource was disallowed by policy. Policy id…
> 来源: mslearn

**根因分析**: 订阅或资源组上分配了 Azure Policy，部署的资源不符合策略规则（如禁止创建公共 IP、限制允许的资源类型等）

1. 1) 从错误消息中找到 policyAssignment name 和 policyDefinition name；2) 用 az policy definition show --name {name} 查看策略规则；3) 修改部署模板使其符合策略要求（如移除公共 IP、使用允许的 SKU）；4) 如策略需更新，联系组织管理员修改 policy assignment.

`[结论: 🔵 6.0/10 — [mslearn]]`

### Phase 15: Azure Policy 合规性评估延迟：资源显示 Not Started 状态、合规结果过期、或新策略分配后资源未被评估
> 来源: mslearn

**根因分析**: Policy 评估存在固有延迟：1) 新 Policy/Initiative Assignment 约 5 分钟后开始生效；2) 已有 Assignment 范围内的新建/更新资源约 15 分钟后被评估；3) 标准合规性扫描每 24 小时执行一次。此外 Assignment 显示 0/0 resources 表示没有资源匹配策略定义的适用范围

1. 1) 等待足够时间让评估完成（新 assignment 5min，资源变更 15min，完整扫描 24h）；2) 手动触发按需评估扫描：Start-AzPolicyComplianceScan（PowerShell）或 POST triggerEvaluation（REST）；3) 检查 policy definition mode 是否正确（all vs indexed）；4) 确认资源 scope 和 assignment scope 重叠.

`[结论: 🔵 6.0/10 — [mslearn]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Azure Policy compliance scan shows '0 out of 0' resources f… | mode:Indexed only evaluates tracked resources. Proxy resour… | Use mode:All for proxy resource types. mode:Indexed should … |
| Azure Policy compliance results show 0 resources scanned | Three causes: (1) Indexed mode on proxy resource type. (2) … | Cause 1: Change mode to All. Cause 2: Create matching resou… |
| deployIfNotExists (DINE) policy shows incorrect compliance … | Missing then.details.name property; without it Policy treat… | Add then.details.name with value [field('fullname')] when i… |
| Azure Policy assignment not taking effect immediately after… | Policy assignments are cached in the ARM layer. The cache i… | Log out and log back in to Azure portal to force the policy… |
| Customer cannot find or access the manual policy attestatio… | The attestation UI is only available to Microsoft Defender … | Non-premium MDC users must use the Azure REST API (`Microso… |
| Kubernetes (AKS/Arc) data plane policy compliance results a… | Compliance data flows through a multi-step pipeline: Policy… | Wait 30-45 minutes after policy assignment changes for comp… |
| VNETs that meet all conditions for an Azure Virtual Network… | By design: AVNM uses Policy's non-compliant result as the s… | This is expected behavior for AVNM-related policy assignmen… |
| Policy evaluation details for Key Vault data plane policies… | Evaluation details are not yet surfaced in the Policy Compl… | Known limitation — evaluation details are not available via… |
| Customer cannot export Azure Policy compliance data from th… | Exporting policy compliance data through the Azure Portal i… | Export compliance data using Azure Resource Graph (ARG) que… |
| Compliance scan results not updated in Azure portal for up … | Brownfield scan is triggered via EventServicesEntries table… | Wait up to 30 minutes for compliance state to update automa… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Policy compliance scan shows '0 out of 0' resources for a proxy resource type when using mode… | mode:Indexed only evaluates tracked resources. Proxy resource types are skipped entirely, resulting… | Use mode:All for proxy resource types. mode:Indexed should only be used when the policy evaluates l… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Policy compliance results show 0 resources scanned | Three causes: (1) Indexed mode on proxy resource type. (2) No resources match definition conditions… | Cause 1: Change mode to All. Cause 2: Create matching resources or modify definition/scope. Cause 3… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | deployIfNotExists (DINE) policy shows incorrect compliance results when if.field.type and then.deta… | Missing then.details.name property; without it Policy treats any resource of matching type as satis… | Add then.details.name with value [field('fullname')] when if.field.type equals then.details.type in… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Policy assignment not taking effect immediately after being created or updated — deny/audit e… | Policy assignments are cached in the ARM layer. The cache is refreshed every 30 minutes. During thi… | Log out and log back in to Azure portal to force the policy assignment cache to refresh immediately… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Customer cannot find or access the manual policy attestation UI in Azure portal to set compliance s… | The attestation UI is only available to Microsoft Defender for Cloud (MDC) premium tier users. Non-… | Non-premium MDC users must use the Azure REST API (`Microsoft.PolicyInsights/attestations` extensio… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Kubernetes (AKS/Arc) data plane policy compliance results are delayed or not reflecting changes imm… | Compliance data flows through a multi-step pipeline: Policy pod syncs every 10-15 min → sends to Da… | Wait 30-45 minutes after policy assignment changes for compliance data to propagate. To investigate… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | VNETs that meet all conditions for an Azure Virtual Network Manager (AVNM) network group show as 'n… | By design: AVNM uses Policy's non-compliant result as the signal to add VNETs to network groups. A … | This is expected behavior for AVNM-related policy assignments. Non-compliant in this context means … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Policy evaluation details for Key Vault data plane policies are not visible in the Azure Policy Com… | Evaluation details are not yet surfaced in the Policy Compliance UI for Key Vault data plane polici… | Known limitation — evaluation details are not available via the Policy Compliance UI for KV data pl… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Customer cannot export Azure Policy compliance data from the Azure Portal | Exporting policy compliance data through the Azure Portal is not supported as a built-in portal fea… | Export compliance data using Azure Resource Graph (ARG) queries or via REST API / CLI commands. Ref… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Compliance scan results not updated in Azure portal for up to 30 minutes after policy assignment cr… | Brownfield scan is triggered via EventServicesEntries table entries ingested from Geneva; this inge… | Wait up to 30 minutes for compliance state to update automatically; for immediate results trigger a… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | 资源合规状态不符合预期（brownfield 扫描结果意外合规/非合规），或扫描范围不正确 | 策略定义的 mode 设置不正确，导致资源类型不在评估范围内 | 检查策略 mode 设置：Indexed 模式仅评估支持 tags 和 location 的资源类型；All 模式评估所有资源类型。根据目标资源类型选择正确 mode | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | 使用数组别名 ([*]) 的策略合规状态不符合预期 | 数组别名语法使用不正确，Policy 评估数组属性时有特殊语法要求 | 参考文档 [Author policies for array properties on Azure resources] 检查并修正数组别名语法，特别注意 count 表达式和 where 子句… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 | 资源未被 Policy 扫描评估，或有豁免的资源仍被标记为非合规 | 资源不在赋值 scope 内、位于 notScopes 排除列表中，或存在针对该资源或其父 scope 的豁免 (exemption) | 1. 验证资源是否在赋值 scope 覆盖范围内；2. 检查赋值的 notScopes 是否包含该资源路径；3. 检查是否存在适用的 exemption | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 | ARM 部署报错 RequestDisallowedByPolicy：Resource was disallowed by policy. Policy identifiers: [policyAs… | 订阅或资源组上分配了 Azure Policy，部署的资源不符合策略规则（如禁止创建公共 IP、限制允许的资源类型等） | 1) 从错误消息中找到 policyAssignment name 和 policyDefinition name；2) 用 az policy definition show --name {na… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
| 15 | Azure Policy 合规性评估延迟：资源显示 Not Started 状态、合规结果过期、或新策略分配后资源未被评估 | Policy 评估存在固有延迟：1) 新 Policy/Initiative Assignment 约 5 分钟后开始生效；2) 已有 Assignment 范围内的新建/更新资源约 15 分钟后被… | 1) 等待足够时间让评估完成（新 assignment 5min，资源变更 15min，完整扫描 24h）；2) 手动触发按需评估扫描：Start-AzPolicyComplianceScan（Po… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
