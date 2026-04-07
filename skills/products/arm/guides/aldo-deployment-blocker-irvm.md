# ARM ALDO 平台 deployment blocker irvm — 排查速查

**来源数**: 4 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | ALCSS23 ALDO environment deployment blocked after redeployment on GA release (version 2602.1.25259 … | Deployment blocker tracked as Bug 37002200 in msazure DevOps. Specific to GA release version on ALC… | Track Bug 37002200 (msazure.visualstudio.com/One) for resolution status. Consider using alternative… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 📋 | IRVM (Winfield appliance) VM disconnected or offline, unable to upload diagnostic data in ALDO envi… | IRVM is a black-box clustered VM in air-gapped environments; when VM fails or loses connectivity, s… | Use fallback logging process: https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wiki… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 📋 | MOC Cloud Agent (wssdcloudagent) or Node Agent (wssdagent) not running on Azure Local cluster nodes… | wssdcloudagent is clustered (runs on one node only - expected). If wssdagent stopped on any node, i… | 1) Get-Service wssdcloudagent/wssdagent on all nodes. 2) Get-ClusterResource \| ? Name -like *moc* … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 📋 | Kerberos authentication fails and falls back to less secure NTLM protocol in Azure Local / SDN envi… | Service Principal Names (SPNs) are misconfigured, missing, or duplicated, causing Kerberos to fail … | Use setspn tool to register and verify SPNs for services. Check for duplicate SPNs (setspn -X). Ens… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Track Bug 37002200 (msazure.visualstudio.com/One) for resolution status. Consid… `[来源: ado-wiki]`
2. Use fallback logging process: https://supportability.visualstudio.com/AzureAdap… `[来源: ado-wiki]`
3. 1) Get-Service wssdcloudagent/wssdagent on all nodes. 2) Get-ClusterResource \|… `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/aldo-deployment-blocker-irvm.md#排查流程)
