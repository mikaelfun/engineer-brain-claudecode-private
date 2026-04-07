# ARM Azure Policy 特定资源提供程序 — 综合排查指南

**条目数**: 6 | **草稿融合数**: 31 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-azure-data-factory-policy-integration.md, ado-wiki-a-azure-load-testing-policy-integration.md, ado-wiki-a-debugging-a-policy.md, ado-wiki-a-policy-aliases.md, ado-wiki-a-policy-aware-portal-experience.md (+26 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: SQL master database (Microsoft.Sql/servers/databases with name 'master') is not…
> 来源: ado-wiki

**根因分析**: By design: SQL team does not allow master DB to be modified by Azure users, so Policy PG excluded it from evaluation for all subscriptions. Note: Master DB IS scanned for AINE and DINE policies.

1. No solution available - this is by design.
2. If customer has a valid scenario requiring master DB scanning, escalate via the ARM_Policy SME Teams channel.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: Azure Policy cannot evaluate instanceView properties on Microsoft.Compute/virtu…
> 来源: ado-wiki

**根因分析**: instanceView is a runtime property that does not conform to the standard ARM resource property path pattern that Azure Policy requires

1. Properties under instanceView are not accessible by Policy; advise customer to use alternative properties or a different governance mechanism.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: Azure Policy scan jobs for Microsoft.Logic/workflows are disabled in certain Mi…
> 来源: ado-wiki

**根因分析**: Policy scan jobs were disabled due to too many workflow resource scans causing performance issues

1. Customer must use a non-Microsoft tenant to test policy definitions for this resource type.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Azure Policy evaluates null values for Microsoft.Web/sites properties during pa…
> 来源: ado-wiki

**根因分析**: Microsoft.Web RP uses PUT instead of PATCH for some partial changes; Policy expects full payload on PUT but receives partial payload with missing properties evaluating to null

1. Use Append+Deny pattern: Append adds expected property if missing, Deny catches wrong values.
2. For siteConfig brownfield, use AINE policy targeting Microsoft.
3. Web/sites/config.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 5: Customer requests help authoring or troubleshooting Rego policies for AKS or Ar…
> 来源: ado-wiki

**根因分析**: Rego language is not owned by Microsoft. Azure Policy for Kubernetes leverages Gatekeeper/Rego for enforcement, but Rego policy authoring is out of CSS support scope.

1. Rego policy authoring is out of CSS scope.
2. Troubleshooting Rego language syntax issues falls under AKS team scope — keep case ownership and open ICM collaboration with AKS team.
3. AKS team may need to escalate to their PG as training has not been fully delivered.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 6: Cannot find Azure Policy RP logs for Machine Learning data plane policy evaluat…
> 来源: ado-wiki

**根因分析**: ML handles data plane policy evaluation entirely internally via its own policy microservice embedded inside the ML RP. The Azure Policy RP is NOT involved in the evaluation process for ML data plane policies. The policy microservice inside ML RP polls ARM for policy resources every 10 minutes and evaluates payloads locally.

1. Look for evaluation logs in ML RP traces (ML dataplane endpoint), not Azure Policy RP.
2. Route ML data plane policy issues to ML team via SAP: Azure/Machine Learning/Workspace Management, Configuration and Security/Issues with Azure ML built-in policies.
3. Azure Policy team owns only the policy APIs, definitions, assignments, and UI — not ML's internal evaluation engine.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| SQL master database (Microsoft.Sql/servers/databases with n… | By design: SQL team does not allow master DB to be modified… | No solution available - this is by design. If customer has … |
| Azure Policy cannot evaluate instanceView properties on Mic… | instanceView is a runtime property that does not conform to… | Properties under instanceView are not accessible by Policy;… |
| Azure Policy scan jobs for Microsoft.Logic/workflows are di… | Policy scan jobs were disabled due to too many workflow res… | Customer must use a non-Microsoft tenant to test policy def… |
| Azure Policy evaluates null values for Microsoft.Web/sites … | Microsoft.Web RP uses PUT instead of PATCH for some partial… | Use Append+Deny pattern: Append adds expected property if m… |
| Customer requests help authoring or troubleshooting Rego po… | Rego language is not owned by Microsoft. Azure Policy for K… | Rego policy authoring is out of CSS scope. Troubleshooting … |
| Cannot find Azure Policy RP logs for Machine Learning data … | ML handles data plane policy evaluation entirely internally… | Look for evaluation logs in ML RP traces (ML dataplane endp… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | SQL master database (Microsoft.Sql/servers/databases with name 'master') is not scanned by Azure Po… | By design: SQL team does not allow master DB to be modified by Azure users, so Policy PG excluded i… | No solution available - this is by design. If customer has a valid scenario requiring master DB sca… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Azure Policy cannot evaluate instanceView properties on Microsoft.Compute/virtualMachines because i… | instanceView is a runtime property that does not conform to the standard ARM resource property path… | Properties under instanceView are not accessible by Policy; advise customer to use alternative prop… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Azure Policy scan jobs for Microsoft.Logic/workflows are disabled in certain Microsoft tenants | Policy scan jobs were disabled due to too many workflow resource scans causing performance issues | Customer must use a non-Microsoft tenant to test policy definitions for this resource type | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Azure Policy evaluates null values for Microsoft.Web/sites properties during partial updates causin… | Microsoft.Web RP uses PUT instead of PATCH for some partial changes; Policy expects full payload on… | Use Append+Deny pattern: Append adds expected property if missing, Deny catches wrong values. For s… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Customer requests help authoring or troubleshooting Rego policies for AKS or Arc-enabled Kubernetes… | Rego language is not owned by Microsoft. Azure Policy for Kubernetes leverages Gatekeeper/Rego for … | Rego policy authoring is out of CSS scope. Troubleshooting Rego language syntax issues falls under … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | Cannot find Azure Policy RP logs for Machine Learning data plane policy evaluation; standard Policy… | ML handles data plane policy evaluation entirely internally via its own policy microservice embedde… | Look for evaluation logs in ML RP traces (ML dataplane endpoint), not Azure Policy RP. Route ML dat… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
