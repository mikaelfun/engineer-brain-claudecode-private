# ARM Azure Policy 与 MDfC/安全中心集成 — 综合排查指南

**条目数**: 3 | **草稿融合数**: 31 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-azure-data-factory-policy-integration.md, ado-wiki-a-azure-load-testing-policy-integration.md, ado-wiki-a-debugging-a-policy.md, ado-wiki-a-policy-aliases.md, ado-wiki-a-policy-aware-portal-experience.md (+26 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Policy compliance results shown in Microsoft Defender for Cloud (MDC) / Securit…
> 来源: ado-wiki

**根因分析**: MDC uses its own proprietary calculation logic for security posture and compliance scores, which differs from Azure Policy's compliance calculation. MDC also creates its own initiative assignments in the customer's Policy environment to consume policy data. The discrepancy is by design.

1. This is expected behavior.
2. Azure Policy compliance portal shows Policy RP's view.
3. MDC/ASC UI reflects MDC's own calculation.
4. Direct questions about MDC UI values, scoring differences, or how MDC consumes Policy data to the Microsoft Defender for Cloud team.
5. Azure Policy team scope does not cover MDC UI calculation.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: 'Security Center' 类别的 Policy 策略显示意外的合规结果（例如 DDoS 已启用但策略仍报 non-compliant）
> 来源: ado-wiki

**根因分析**: 这类策略使用 AuditIfNotExists effect，其 details.type 为 Microsoft.Security/assessments，而非直接评估目标资源属性。合规性完全由 Microsoft.Security RP 的 assessment 数据决定，与 DDoS/资源本身配置无关。

1. 将此类合规问题移交 Microsoft Defender for Cloud 团队，由其核查对应 subscription 下 Microsoft.
2. Security/assessments 资源的 status.
3. code。Policy 侧无法影响这类合规结果。SAP: Microsoft Defender for Cloud 相关 SAP。.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 3: MDfC (ASC) 界面显示的合规分数/状态与 Azure Policy Compliance 界面不一致
> 来源: ado-wiki

**根因分析**: MDfC 在 Azure Policy 合规数据之上有自己的计算逻辑，两者结果存在差异属预期行为。

1. 这是 by design。Azure Policy 侧的数据是正确的；MDfC UI 中的展示由 MDfC 团队负责，任何关于 MDfC 界面计算方式的疑问需由 MDfC 团队解答。.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Policy compliance results shown in Microsoft Defender for C… | MDC uses its own proprietary calculation logic for security… | This is expected behavior. Azure Policy compliance portal s… |
| 'Security Center' 类别的 Policy 策略显示意外的合规结果（例如 DDoS 已启用但策略仍报 n… | 这类策略使用 AuditIfNotExists effect，其 details.type 为 Microsoft.S… | 将此类合规问题移交 Microsoft Defender for Cloud 团队，由其核查对应 subscripti… |
| MDfC (ASC) 界面显示的合规分数/状态与 Azure Policy Compliance 界面不一致 | MDfC 在 Azure Policy 合规数据之上有自己的计算逻辑，两者结果存在差异属预期行为。 | 这是 by design。Azure Policy 侧的数据是正确的；MDfC UI 中的展示由 MDfC 团队负责，… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Policy compliance results shown in Microsoft Defender for Cloud (MDC) / Security Center (ASC) UI di… | MDC uses its own proprietary calculation logic for security posture and compliance scores, which di… | This is expected behavior. Azure Policy compliance portal shows Policy RP's view. MDC/ASC UI reflec… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | 'Security Center' 类别的 Policy 策略显示意外的合规结果（例如 DDoS 已启用但策略仍报 non-compliant） | 这类策略使用 AuditIfNotExists effect，其 details.type 为 Microsoft.Security/assessments，而非直接评估目标资源属性。合规性完全由 … | 将此类合规问题移交 Microsoft Defender for Cloud 团队，由其核查对应 subscription 下 Microsoft.Security/assessments 资源的 … | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | MDfC (ASC) 界面显示的合规分数/状态与 Azure Policy Compliance 界面不一致 | MDfC 在 Azure Policy 合规数据之上有自己的计算逻辑，两者结果存在差异属预期行为。 | 这是 by design。Azure Policy 侧的数据是正确的；MDfC UI 中的展示由 MDfC 团队负责，任何关于 MDfC 界面计算方式的疑问需由 MDfC 团队解答。 | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
