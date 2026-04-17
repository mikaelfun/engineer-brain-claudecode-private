# DEFENDER 监控代理 (MMA/AMA/OMS) — Troubleshooting Quick Reference

**Entries**: 12 | **21V**: 9/12 applicable
**Sources**: ado-wiki, mslearn, onenote | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/agent-mma-ama.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer enabled auto provisioning for MMA/Log Analytics agent but existing VMs are not being aut... | During auto provisioning setup, customer selected 'New VMs only' option instead of 'Existing and ... | Reconfigure auto provisioning: 1) Set to 'Connect Azure VMs to the default workspace(s) created b... | 🟢 8.5 | ADO Wiki |
| 2 | MDC shows an Azure VM as an on-premises machine with no reason in MMA-based recommendations | The Heartbeat sent to the Log Analytics workspace has IsAzure value of 0, causing MDC to classify... | Run Kusto query on cluster("romelogs.kusto.windows.net").database("Prod").HybridOmsMachineRawSecu... | 🟢 8.5 | ADO Wiki |
| 3 | No MMA-based recommendations (System Updates, Endpoint Protection, Baselines) visible for a resou... | MDC only presents MMA-based recommendations from data in LA workspace. If agent is not sending da... | Check LA workspace for relevant recommendation data tables. Verify MMA/AMA agent health and data ... | 🟢 8.5 | ADO Wiki |
| 4 | Linux machine has no data in ProtectionStatus table but Heartbeat table shows the machine is conn... | Safeguard for Sudo blocks the Log Analytics agent (omsagent) from running required sudo commands ... | Remove Safeguard for Sudo, or configure it to allow commands defined in /etc/sudoers.d/omsagent. ... | 🟢 8.5 | ADO Wiki |
| 5 | Same machine shown multiple times in MDC portal as duplicate representations: Arc-less + Azure Ar... | Multiple onboarding paths create separate resource representations: (1) Arc-less + Azure Arc: mac... | Known issue for Arc + Arc-less duplicates (resolution WIP). Reassure customer that duplicates are... | 🟢 8.5 | ADO Wiki |
| 6 | Duplicate VM entries or wrong VM count shown in Azure Security Center — same VM appears twice in ... | VM has no Azure Resource ID. OMS workspace identifies the VM by SourceComputerId but cannot match... | Verify using Kusto queries on RomeLogs: 1) cluster('RomeLogs').database('RomeLogs').OmsHealthMoni... | 🟢 8.0 | OneNote |
| 7 | [Deprecated MMA] Customer made file/registry changes but cannot see them in the MDC FIM Change Tr... | Changes beyond the UI display limit (last 100 changes only shown), or MMA monitoring agent unheal... | [DEPRECATED - advise FIM over MDE] 1) Check monitoring agent health. 2) Run ConfigurationChange L... | 🔵 7.5 | ADO Wiki |
| 8 | Adaptive Application Control (AAC) machines not appearing in group list - VMs not discovered for ... | Multiple causes: (1) Not Standard tier (2) AppLocker not configured (3) OMS agent not reporting A... | Check: 1) Verify Standard tier pricing 2) Check AppLocker config (Microsoft-Windows-AppLocker/EXE... | 🔵 7.0 | OneNote |
| 9 | Duplicated VM entries or wrong VM count in Azure Security Center - same VM appears twice in inven... | VM has no Azure Resource ID, causing OMS to show it once as Azure VM and once as non-Azure. Verif... | Query RomeLogs.OmsHealthMonitoringOE (by SubscriptionId, summarize by VmId) and RomeLogs.HybridOm... | 🔵 7.0 | OneNote |
| 10 | VMSS instance shows 'missing scan data' in Microsoft Defender for Cloud portal, but SecurityBasel... | VMUUID field is not properly populated in the SecurityBaseline table data. The VMSS assessor uses... | Step-by-step diagnostic using Kusto queries on romelogs.kusto.windows.net/Prod: (1) Query Dynamic... | 🔵 7.0 | ADO Wiki |
| 11 | Defender for Cloud: duplicate OS baseline recommendations appear for the same machine | Both the legacy Log Analytics agent (MMA) and the new Azure Policy machine configuration extensio... | Disable the Log Analytics agent (MMA) on the machine to eliminate duplicate recommendations; use ... | 🔵 6.0 | MS Learn |
| 12 | MDE Linux health shows false with no active supplementary event provider after upgrading to 101.9... | Misconfigured or conflicting auditd rules on existing machines prevent supplementary event provid... | Backup /etc/audit/rules.d/audit.rules; run echo -c >> /etc/audit/rules.d/audit.rules && augenrule... | 🔵 6.0 | MS Learn |

## Quick Troubleshooting Path

1. Reconfigure auto provisioning: 1) Set to 'Connect Azure VMs to the default workspace(s) created by Defender for Cloud' → Apply and Save; 2) Reconfigure to desired workspace — popup appears to selec... `[Source: ADO Wiki]`
2. Run Kusto query on cluster("romelogs.kusto.windows.net").database("Prod").HybridOmsMachineRawSecurityDataOE filtering by SubscriptionId and ComputerName to check IsAzure flag and AgentType. Also us... `[Source: ADO Wiki]`
3. Check LA workspace for relevant recommendation data tables. Verify MMA/AMA agent health and data ingestion. For LA/agent issues, create collaboration task to Log Analytics support (cannot create CR... `[Source: ADO Wiki]`
4. Remove Safeguard for Sudo, or configure it to allow commands defined in /etc/sudoers.d/omsagent. Verify ProtectionStatus data appears after the change. `[Source: ADO Wiki]`
5. Known issue for Arc + Arc-less duplicates (resolution WIP). Reassure customer that duplicates are NOT billed twice - they are display-only duplicates in the portal. No immediate customer action nee... `[Source: ADO Wiki]`
