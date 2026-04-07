# ARM Azure Policy 与 MDfC/安全中心集成 — 排查速查

**来源数**: 3 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Policy compliance results shown in Microsoft Defender for Cloud (MDC) / Security Center (ASC) UI di… | MDC uses its own proprietary calculation logic for security posture and compliance scores, which di… | This is expected behavior. Azure Policy compliance portal shows Policy RP's view. MDC/ASC UI reflec… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | 'Security Center' 类别的 Policy 策略显示意外的合规结果（例如 DDoS 已启用但策略仍报 non-compliant） | 这类策略使用 AuditIfNotExists effect，其 details.type 为 Microsoft.Security/assessments，而非直接评估目标资源属性。合规性完全由 … | 将此类合规问题移交 Microsoft Defender for Cloud 团队，由其核查对应 subscription 下 Microsoft.Security/assessments 资源的 … | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | MDfC (ASC) 界面显示的合规分数/状态与 Azure Policy Compliance 界面不一致 | MDfC 在 Azure Policy 合规数据之上有自己的计算逻辑，两者结果存在差异属预期行为。 | 这是 by design。Azure Policy 侧的数据是正确的；MDfC UI 中的展示由 MDfC 团队负责，任何关于 MDfC 界面计算方式的疑问需由 MDfC 团队解答。 | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. This is expected behavior. Azure Policy compliance portal shows Policy RP's vie… `[来源: ado-wiki]`
2. 将此类合规问题移交 Microsoft Defender for Cloud 团队，由其核查对应 subscription 下 Microsoft.Secur… `[来源: ado-wiki]`
3. 这是 by design。Azure Policy 侧的数据是正确的；MDfC UI 中的展示由 MDfC 团队负责，任何关于 MDfC 界面计算方式的疑问需… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/policy-mdc-integration.md#排查流程)
