# ARM Azure Policy 特定资源提供程序 — 排查速查

**来源数**: 6 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | SQL master database (Microsoft.Sql/servers/databases with name 'master') is not scanned by Azure Po… | By design: SQL team does not allow master DB to be modified by Azure users, so Policy PG excluded i… | No solution available - this is by design. If customer has a valid scenario requiring master DB sca… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | Azure Policy cannot evaluate instanceView properties on Microsoft.Compute/virtualMachines because i… | instanceView is a runtime property that does not conform to the standard ARM resource property path… | Properties under instanceView are not accessible by Policy; advise customer to use alternative prop… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | Azure Policy scan jobs for Microsoft.Logic/workflows are disabled in certain Microsoft tenants | Policy scan jobs were disabled due to too many workflow resource scans causing performance issues | Customer must use a non-Microsoft tenant to test policy definitions for this resource type | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Azure Policy evaluates null values for Microsoft.Web/sites properties during partial updates causin… | Microsoft.Web RP uses PUT instead of PATCH for some partial changes; Policy expects full payload on… | Use Append+Deny pattern: Append adds expected property if missing, Deny catches wrong values. For s… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 📋 | Customer requests help authoring or troubleshooting Rego policies for AKS or Arc-enabled Kubernetes… | Rego language is not owned by Microsoft. Azure Policy for Kubernetes leverages Gatekeeper/Rego for … | Rego policy authoring is out of CSS scope. Troubleshooting Rego language syntax issues falls under … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 📋 | Cannot find Azure Policy RP logs for Machine Learning data plane policy evaluation; standard Policy… | ML handles data plane policy evaluation entirely internally via its own policy microservice embedde… | Look for evaluation logs in ML RP traces (ML dataplane endpoint), not Azure Policy RP. Route ML dat… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. No solution available - this is by design. If customer has a valid scenario req… `[来源: ado-wiki]`
2. Properties under instanceView are not accessible by Policy; advise customer to … `[来源: ado-wiki]`
3. Customer must use a non-Microsoft tenant to test policy definitions for this re… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/policy-special-rp.md#排查流程)
