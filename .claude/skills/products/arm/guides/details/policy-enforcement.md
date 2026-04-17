# ARM Azure Policy 执行与阻断 — 综合排查指南

**条目数**: 15 | **草稿融合数**: 31 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-azure-data-factory-policy-integration.md, ado-wiki-a-azure-load-testing-policy-integration.md, ado-wiki-a-debugging-a-policy.md, ado-wiki-a-policy-aliases.md, ado-wiki-a-policy-aware-portal-experience.md (+26 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Resource type is in the policy allow list but creation is still denied by Azure…
> 来源: ado-wiki

**根因分析**: Creating one resource type triggers creation of another resource with a different type using a different correlationId. The secondary resource type is not in the allow list and gets blocked.

1. Find the actual denied resource type by querying EventServiceEntries with the deployment correlationId, then search by entity name to find the secondary correlationId.
2. Add the actual denied resource type to the policy allow list.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Policy targeting Microsoft.Compute/virtualMachines osType property fails …
> 来源: ado-wiki

**根因分析**: The osType property on VMs is only available on GET calls, not on PUT/PATCH payloads sent during resource creation

1. Policies checking osType will likely omit resources during greenfield scenarios; use brownfield compliance evaluation instead.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Policy deny rule targeting NSG securityRules only blocks child resource c…
> 来源: ado-wiki

**根因分析**: securityRules is both a resource type AND a property of the parent NSG; deny policy targeting only the child resource type misses the property path

1. Policy must target BOTH Microsoft.
2. Network/networkSecurityGroups (property) AND Microsoft.
3. Network/networkSecurityGroups/securityRules (child resource type).

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: AINE/DINE policy fails to detect subscription-level resources (e.g., diagnostic…
> 来源: ado-wiki

**根因分析**: existenceScope defaults to resourceGroup; subscription-level resources are not found at resource group scope

1. existenceScope to 'subscription' for policies that need to verify existence of subscription-level resources.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: AINE/DINE policy evaluation is slow or times out; compliance scan takes excessi…
> 来源: ado-wiki

**根因分析**: name and/or type conditions are defined inside existenceCondition instead of in then.details.type/then.details.name - this forces Policy to do a full collection GET and evaluate conditions over all returned resources

1. Move name and type conditions out of existenceCondition into then.
2. type and then.
3. name to narrow the GET request for evaluation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: DINE policy with deploymentScope=subscription fails - subscription-level deploy…
> 来源: ado-wiki

**根因分析**: Missing location property in then.details.deployment for subscription-level deployments, or template schema/structure is not for subscription deployment

1. Add a location property in then.
2. deployment when deploymentScope is subscription.
3. Verify template schema uses subscription-level deployment format.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 7: Azure Policy greenfield evaluation gives unexpected result - property not prese…
> 来源: ado-wiki

**根因分析**: RPs do not require all properties in PUT/PATCH payload; missing properties get default values. Policy evaluates against these defaults which may not match the intended compliance state.

1. Add an additional exists or notExists condition to handle the case where the property is absent from the payload.
2. Check REST API reference for default values.
3. For brownfield: if properties missing in Collection GET vs Resource GET, open collaboration with the RP team.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Azure Policy with 'Security Center' category does not appear to directly evalua…
> 来源: ado-wiki

**根因分析**: Some Security Center category policies use AuditIfNotExists effect targeting Microsoft.Security/assessments resources instead of directly evaluating the resource. Compliance is entirely determined by what the Microsoft.Security RP reports via its assessments API. Example: 'Azure DDoS Protection Standard should be enabled' scans virtualNetworks but delegates the actual compliance decision to Microsoft.Security/assessments with a specific assessment GUID.

1. For unexpected compliance on 'Security Center' category policies, engage the Microsoft Defender for Cloud team — they own the Microsoft.
2. Security/assessments evaluation that drives the compliance result.
3. Check the policy definition JSON for 'type': 'Microsoft.
4. Security/assessments' in the 'then.
5. details' section to confirm this pattern applies.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 9: Azure 资源操作被 Azure Policy 阻止，报错 RequestDisallowedByPolicy（HTTP 403）
> 来源: ado-wiki

**根因分析**: 资源的属性不满足 deny 策略的条件，策略评估触发 deny effect

1. 从错误响应的 error.
2. additionalInfo[0].
3. info 中获取 policyDefinitionId 和 policyAssignmentId，evaluatedExpressions 中显示具体哪些条件判断为 True 导致触发；若用户无 Policy 读权限则 evaluationDetails 字段被省略但 assignment/definition ID 仍存在；如果操作本不应被阻止，转入 Policy enforcement not as expected TSG.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 10: Newly assigned Azure Policy not enforcing (not blocking/auditing resources) on …
> 来源: ado-wiki

**根因分析**: Policy assignments are cached at the ARM layer; the cache is refreshed approximately every 30 minutes; until the cache is refreshed, the new assignment is not picked up during greenfield evaluation

1. Log out and log back in to Azure portal or re-authenticate the API client to force the ARM policy cache to refresh immediately; alternatively wait up to 30 minutes for the cache to refresh automatically.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 11: AuditIfNotExists (AINE) or DeployIfNotExists (DINE) policy does not trigger exi…
> 来源: ado-wiki

**根因分析**: AINE/DINE existence check is intentionally scheduled 10 minutes after initial greenfield evaluation by design; the platform first evaluates the if-section conditions synchronously, then schedules a deferred existence check 10 minutes later (configurable via `evaluationDelay` property)

1. Wait 10 minutes after resource creation/update for AINE/DINE to trigger; if a different delay is needed, configure the `evaluationDelay` property in the policy definition's details section to a custom ISO 8601 duration; remediation tasks can also be used to trigger DINE deployments manually.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 12: Resources show 'Unknown' or 'NonCompliant' compliance state for manual effect p…
> 来源: ado-wiki

**根因分析**: Manual policies require an explicit attestation resource (Microsoft.PolicyInsights/attestations) to set compliance state; without an attestation, the default state is either 'Unknown' or 'NonCompliant' depending on the definition's defaultComplianceState configuration; compliance is not determined by brownfield scan for manual policies

1. Create an attestation resource for the applicable scope (resource/resource group/subscription): (1) MDC UI — available only to Microsoft Defender for Cloud Premium tier users; (2) REST API — use PowerShell `Invoke-AzRestMethod` or Azure CLI `az rest` to POST to the attestations API; see https://learn.
2. com/en-us/azure/governance/policy/concepts/attestation-structure for attestation payload structure.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 13: Deny/Audit 策略在资源创建/更新时未触发（greenfield），操作正常通过但预期应被阻止或记录
> 来源: ado-wiki

**根因分析**: 策略赋值的 enforcementMode 未设置为 default，导致 Policy 以审计模式运行不阻止操作

1. 检查策略赋值的 enforcementMode 属性，将其设置为 Default（区分大小写）；确认不是 DoNotEnforce 模式.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 14: 策略在 greenfield 评估时未应用到某资源（无活动日志、未阻止、未触发 DINE 部署）
> 来源: ado-wiki

**根因分析**: 资源不在赋值 scope 内、在 notScopes 中被排除、存在适用的豁免，或策略定义的 type/name/kind 条件中有拼写错误

1. 检查 EventServiceEntries（通过 correlationId）确认 Policy 是否参与评估；2.
2. 验证资源在赋值 scope 内且不在 notScopes 中；3.
3. 仔细检查策略定义中 type、name、kind 条件的拼写.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 15: Azure Policy 策略未按预期执行（Enforcement not as expected）：资源应被 Deny/Audit 但未生效，Activit…
> 来源: mslearn

**根因分析**: Policy Assignment 的 enforcementMode 被设置为 Disabled。此模式下策略效果（Deny/Append/Modify 等）不会执行，Activity Log 不会记录任何 Policy 操作，但合规性评估仍然进行（可在合规报告中看到不合规状态）

1. 1) 检查 Policy Assignment → Properties → enforcementMode 是否为 Enabled；2) 确认 assignment 参数和 scope 设置正确；3) 检查 policy definition mode：all（所有资源类型）或 indexed（仅检查 tag/location 的资源）；4) 确认资源未被 excluded scope 或 policy exemption 排除；5) 验证资源 payload 是否真的匹配策略条件（可通过 resources.

`[结论: 🔵 6.0/10 — [mslearn]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Resource type is in the policy allow list but creation is s… | Creating one resource type triggers creation of another res… | Find the actual denied resource type by querying EventServi… |
| Azure Policy targeting Microsoft.Compute/virtualMachines os… | The osType property on VMs is only available on GET calls, … | Policies checking osType will likely omit resources during … |
| Azure Policy deny rule targeting NSG securityRules only blo… | securityRules is both a resource type AND a property of the… | Policy must target BOTH Microsoft.Network/networkSecurityGr… |
| AINE/DINE policy fails to detect subscription-level resourc… | existenceScope defaults to resourceGroup; subscription-leve… | Set then.details.existenceScope to 'subscription' for polic… |
| AINE/DINE policy evaluation is slow or times out; complianc… | name and/or type conditions are defined inside existenceCon… | Move name and type conditions out of existenceCondition int… |
| DINE policy with deploymentScope=subscription fails - subsc… | Missing location property in then.details.deployment for su… | Add a location property in then.details.deployment when dep… |
| Azure Policy greenfield evaluation gives unexpected result … | RPs do not require all properties in PUT/PATCH payload; mis… | Add an additional exists or notExists condition to handle t… |
| Azure Policy with 'Security Center' category does not appea… | Some Security Center category policies use AuditIfNotExists… | For unexpected compliance on 'Security Center' category pol… |
| Azure 资源操作被 Azure Policy 阻止，报错 RequestDisallowedByPolicy（HT… | 资源的属性不满足 deny 策略的条件，策略评估触发 deny effect | 从错误响应的 error.additionalInfo[0].info 中获取 policyDefinitionId … |
| Newly assigned Azure Policy not enforcing (not blocking/aud… | Policy assignments are cached at the ARM layer; the cache i… | Log out and log back in to Azure portal or re-authenticate … |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Resource type is in the policy allow list but creation is still denied by Azure Policy | Creating one resource type triggers creation of another resource with a different type using a diff… | Find the actual denied resource type by querying EventServiceEntries with the deployment correlatio… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Policy targeting Microsoft.Compute/virtualMachines osType property fails to evaluate correctl… | The osType property on VMs is only available on GET calls, not on PUT/PATCH payloads sent during re… | Policies checking osType will likely omit resources during greenfield scenarios; use brownfield com… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Policy deny rule targeting NSG securityRules only blocks child resource creation but not secu… | securityRules is both a resource type AND a property of the parent NSG; deny policy targeting only … | Policy must target BOTH Microsoft.Network/networkSecurityGroups (property) AND Microsoft.Network/ne… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | AINE/DINE policy fails to detect subscription-level resources (e.g., diagnosticSettings, roleAssign… | existenceScope defaults to resourceGroup; subscription-level resources are not found at resource gr… | Set then.details.existenceScope to 'subscription' for policies that need to verify existence of sub… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | AINE/DINE policy evaluation is slow or times out; compliance scan takes excessively long | name and/or type conditions are defined inside existenceCondition instead of in then.details.type/t… | Move name and type conditions out of existenceCondition into then.details.type and then.details.nam… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | DINE policy with deploymentScope=subscription fails - subscription-level deployment template errors… | Missing location property in then.details.deployment for subscription-level deployments, or templat… | Add a location property in then.details.deployment when deploymentScope is subscription. Verify tem… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 | Azure Policy greenfield evaluation gives unexpected result - property not present in PUT/PATCH payl… | RPs do not require all properties in PUT/PATCH payload; missing properties get default values. Poli… | Add an additional exists or notExists condition to handle the case where the property is absent fro… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Azure Policy with 'Security Center' category does not appear to directly evaluate the targeted reso… | Some Security Center category policies use AuditIfNotExists effect targeting Microsoft.Security/ass… | For unexpected compliance on 'Security Center' category policies, engage the Microsoft Defender for… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Azure 资源操作被 Azure Policy 阻止，报错 RequestDisallowedByPolicy（HTTP 403） | 资源的属性不满足 deny 策略的条件，策略评估触发 deny effect | 从错误响应的 error.additionalInfo[0].info 中获取 policyDefinitionId 和 policyAssignmentId，evaluatedExpression… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 | Newly assigned Azure Policy not enforcing (not blocking/auditing resources) on PUT or PATCH request… | Policy assignments are cached at the ARM layer; the cache is refreshed approximately every 30 minut… | Log out and log back in to Azure portal or re-authenticate the API client to force the ARM policy c… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 | AuditIfNotExists (AINE) or DeployIfNotExists (DINE) policy does not trigger existence check or auto… | AINE/DINE existence check is intentionally scheduled 10 minutes after initial greenfield evaluation… | Wait 10 minutes after resource creation/update for AINE/DINE to trigger; if a different delay is ne… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 | Resources show 'Unknown' or 'NonCompliant' compliance state for manual effect policies even though … | Manual policies require an explicit attestation resource (Microsoft.PolicyInsights/attestations) to… | Create an attestation resource for the applicable scope (resource/resource group/subscription): (1)… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 | Deny/Audit 策略在资源创建/更新时未触发（greenfield），操作正常通过但预期应被阻止或记录 | 策略赋值的 enforcementMode 未设置为 default，导致 Policy 以审计模式运行不阻止操作 | 检查策略赋值的 enforcementMode 属性，将其设置为 Default（区分大小写）；确认不是 DoNotEnforce 模式 | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 | 策略在 greenfield 评估时未应用到某资源（无活动日志、未阻止、未触发 DINE 部署） | 资源不在赋值 scope 内、在 notScopes 中被排除、存在适用的豁免，或策略定义的 type/name/kind 条件中有拼写错误 | 1. 检查 EventServiceEntries（通过 correlationId）确认 Policy 是否参与评估；2. 验证资源在赋值 scope 内且不在 notScopes 中；3. 确认… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 15 | Azure Policy 策略未按预期执行（Enforcement not as expected）：资源应被 Deny/Audit 但未生效，Activity Log 中无任何 Policy 相关… | Policy Assignment 的 enforcementMode 被设置为 Disabled。此模式下策略效果（Deny/Append/Modify 等）不会执行，Activity Log 不… | 1) 检查 Policy Assignment → Properties → enforcementMode 是否为 Enabled；2) 确认 assignment 参数和 scope 设置正确；… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |
