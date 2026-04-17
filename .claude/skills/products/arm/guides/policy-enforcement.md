# ARM Azure Policy 执行与阻断 — 排查速查

**来源数**: 15 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Resource type is in the policy allow list but creation is still denied by Azure Policy | Creating one resource type triggers creation of another resource with a different type using a diff… | Find the actual denied resource type by querying EventServiceEntries with the deployment correlatio… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Policy targeting Microsoft.Compute/virtualMachines osType property fails to evaluate correctl… | The osType property on VMs is only available on GET calls, not on PUT/PATCH payloads sent during re… | Policies checking osType will likely omit resources during greenfield scenarios; use brownfield com… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Azure Policy deny rule targeting NSG securityRules only blocks child resource creation but not secu… | securityRules is both a resource type AND a property of the parent NSG; deny policy targeting only … | Policy must target BOTH Microsoft.Network/networkSecurityGroups (property) AND Microsoft.Network/ne… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | AINE/DINE policy fails to detect subscription-level resources (e.g., diagnosticSettings, roleAssign… | existenceScope defaults to resourceGroup; subscription-level resources are not found at resource gr… | Set then.details.existenceScope to 'subscription' for policies that need to verify existence of sub… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | AINE/DINE policy evaluation is slow or times out; compliance scan takes excessively long | name and/or type conditions are defined inside existenceCondition instead of in then.details.type/t… | Move name and type conditions out of existenceCondition into then.details.type and then.details.nam… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | DINE policy with deploymentScope=subscription fails - subscription-level deployment template errors… | Missing location property in then.details.deployment for subscription-level deployments, or templat… | Add a location property in then.details.deployment when deploymentScope is subscription. Verify tem… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 7 📋 | Azure Policy greenfield evaluation gives unexpected result - property not present in PUT/PATCH payl… | RPs do not require all properties in PUT/PATCH payload; missing properties get default values. Poli… | Add an additional exists or notExists condition to handle the case where the property is absent fro… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Azure Policy with 'Security Center' category does not appear to directly evaluate the targeted reso… | Some Security Center category policies use AuditIfNotExists effect targeting Microsoft.Security/ass… | For unexpected compliance on 'Security Center' category policies, engage the Microsoft Defender for… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Azure 资源操作被 Azure Policy 阻止，报错 RequestDisallowedByPolicy（HTTP 403） | 资源的属性不满足 deny 策略的条件，策略评估触发 deny effect | 从错误响应的 error.additionalInfo[0].info 中获取 policyDefinitionId 和 policyAssignmentId，evaluatedExpression… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 10 📋 | Newly assigned Azure Policy not enforcing (not blocking/auditing resources) on PUT or PATCH request… | Policy assignments are cached at the ARM layer; the cache is refreshed approximately every 30 minut… | Log out and log back in to Azure portal or re-authenticate the API client to force the ARM policy c… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 11 📋 | AuditIfNotExists (AINE) or DeployIfNotExists (DINE) policy does not trigger existence check or auto… | AINE/DINE existence check is intentionally scheduled 10 minutes after initial greenfield evaluation… | Wait 10 minutes after resource creation/update for AINE/DINE to trigger; if a different delay is ne… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 12 📋 | Resources show 'Unknown' or 'NonCompliant' compliance state for manual effect policies even though … | Manual policies require an explicit attestation resource (Microsoft.PolicyInsights/attestations) to… | Create an attestation resource for the applicable scope (resource/resource group/subscription): (1)… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 13 📋 | Deny/Audit 策略在资源创建/更新时未触发（greenfield），操作正常通过但预期应被阻止或记录 | 策略赋值的 enforcementMode 未设置为 default，导致 Policy 以审计模式运行不阻止操作 | 检查策略赋值的 enforcementMode 属性，将其设置为 Default（区分大小写）；确认不是 DoNotEnforce 模式 | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 14 📋 | 策略在 greenfield 评估时未应用到某资源（无活动日志、未阻止、未触发 DINE 部署） | 资源不在赋值 scope 内、在 notScopes 中被排除、存在适用的豁免，或策略定义的 type/name/kind 条件中有拼写错误 | 1. 检查 EventServiceEntries（通过 correlationId）确认 Policy 是否参与评估；2. 验证资源在赋值 scope 内且不在 notScopes 中；3. 确认… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 15 📋 | Azure Policy 策略未按预期执行（Enforcement not as expected）：资源应被 Deny/Audit 但未生效，Activity Log 中无任何 Policy 相关… | Policy Assignment 的 enforcementMode 被设置为 Disabled。此模式下策略效果（Deny/Append/Modify 等）不会执行，Activity Log 不… | 1) 检查 Policy Assignment → Properties → enforcementMode 是否为 Enabled；2) 确认 assignment 参数和 scope 设置正确；… | 🔵 6.0 — mslearn+21V适用 | [mslearn] |

## 快速排查路径
1. Find the actual denied resource type by querying EventServiceEntries with the d… `[来源: ado-wiki]`
2. Policies checking osType will likely omit resources during greenfield scenarios… `[来源: ado-wiki]`
3. Policy must target BOTH Microsoft.Network/networkSecurityGroups (property) AND … `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/policy-enforcement.md#排查流程)
