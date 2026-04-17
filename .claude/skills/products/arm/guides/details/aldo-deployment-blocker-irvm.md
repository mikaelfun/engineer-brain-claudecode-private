# ARM ALDO 平台 deployment blocker irvm — 综合排查指南

**条目数**: 4 | **草稿融合数**: 34 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-aldo-appliance-deployment-investigation.md, ado-wiki-a-aldo-arca-observability-access.md, ado-wiki-a-aldo-asc-azure-support-center.md, ado-wiki-a-aldo-billing-and-usage.md, ado-wiki-a-aldo-certificates-pki.md (+29 more)
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ALCSS23 ALDO environment deployment blocked after redeployment on GA release (v…
> 来源: ado-wiki

**根因分析**: Deployment blocker tracked as Bug 37002200 in msazure DevOps. Specific to GA release version on ALCSS23 B88 environment.

1. Track Bug 37002200 (msazure.
2. visualstudio.
3. com/One) for resolution status.
4. Consider using alternative long-haul environment (ALCSS17) until fix is available.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 2: IRVM (Winfield appliance) VM disconnected or offline, unable to upload diagnost…
> 来源: ado-wiki

**根因分析**: IRVM is a black-box clustered VM in air-gapped environments; when VM fails or loses connectivity, standard diagnostic upload paths are unavailable

1. Use fallback logging process: https://supportability.
2. visualstudio.
3. com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.
4. wiki/1623842/Fallback-Logging.
5. All diagnostics must use external logs, telemetry, and supported interfaces.
6. CSS cannot crack open IRVM internals.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 3: MOC Cloud Agent (wssdcloudagent) or Node Agent (wssdagent) not running on Azure…
> 来源: ado-wiki

**根因分析**: wssdcloudagent is clustered (runs on one node only - expected). If wssdagent stopped on any node, indicates node-level MOC failure. Panic traces in logs indicate agent crashes.

1. 1) Get-Service wssdcloudagent/wssdagent on all nodes.
2. 2) Get-ClusterResource | ? Name -like *moc* to check ownership.
3. 3) Check logs: $(Get-MocConfig).
4. cloudconfiglocation\log\wssdcloudagent.
5. log and C:\ProgramData\wssdagent\log\wssdagent.
6. 4) Look for panic: traces.
7. 5) Collect: Get-MocLogs -Path C:\moclogs -Verbose.
8. 6) Filter events with Get-MocEventLog.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 4: Kerberos authentication fails and falls back to less secure NTLM protocol in Az…
> 来源: ado-wiki

**根因分析**: Service Principal Names (SPNs) are misconfigured, missing, or duplicated, causing Kerberos to fail SPN lookup and fall back to NTLM

1. Use setspn tool to register and verify SPNs for services.
2. Check for duplicate SPNs (setspn -X).
3. Ensure all participating systems trust the same KDC and have synchronized time.
4. Monitor logs for KDC_ERR_S_PRINCIPAL_UNKNOWN.
5. Use Kerberos Configuration Manager for SQL Server to troubleshoot SPN issues.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ALCSS23 ALDO environment deployment blocked after redeploym… | Deployment blocker tracked as Bug 37002200 in msazure DevOp… | Track Bug 37002200 (msazure.visualstudio.com/One) for resol… |
| IRVM (Winfield appliance) VM disconnected or offline, unabl… | IRVM is a black-box clustered VM in air-gapped environments… | Use fallback logging process: https://supportability.visual… |
| MOC Cloud Agent (wssdcloudagent) or Node Agent (wssdagent) … | wssdcloudagent is clustered (runs on one node only - expect… | 1) Get-Service wssdcloudagent/wssdagent on all nodes. 2) Ge… |
| Kerberos authentication fails and falls back to less secure… | Service Principal Names (SPNs) are misconfigured, missing, … | Use setspn tool to register and verify SPNs for services. C… |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ALCSS23 ALDO environment deployment blocked after redeployment on GA release (version 2602.1.25259 … | Deployment blocker tracked as Bug 37002200 in msazure DevOps. Specific to GA release version on ALC… | Track Bug 37002200 (msazure.visualstudio.com/One) for resolution status. Consider using alternative… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | IRVM (Winfield appliance) VM disconnected or offline, unable to upload diagnostic data in ALDO envi… | IRVM is a black-box clustered VM in air-gapped environments; when VM fails or loses connectivity, s… | Use fallback logging process: https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wiki… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | MOC Cloud Agent (wssdcloudagent) or Node Agent (wssdagent) not running on Azure Local cluster nodes… | wssdcloudagent is clustered (runs on one node only - expected). If wssdagent stopped on any node, i… | 1) Get-Service wssdcloudagent/wssdagent on all nodes. 2) Get-ClusterResource \| ? Name -like *moc* … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | Kerberos authentication fails and falls back to less secure NTLM protocol in Azure Local / SDN envi… | Service Principal Names (SPNs) are misconfigured, missing, or duplicated, causing Kerberos to fail … | Use setspn tool to register and verify SPNs for services. Check for duplicate SPNs (setspn -X). Ens… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
