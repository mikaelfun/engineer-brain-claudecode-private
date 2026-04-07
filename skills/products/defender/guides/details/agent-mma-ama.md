# DEFENDER 监控代理 (MMA/AMA/OMS) — Comprehensive Troubleshooting Guide

**Entries**: 12 | **Draft sources**: 12 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-mma-baselines-product-knowledge.md, ado-wiki-a-tsg-migrated-mma-to-ama-not-working.md, ado-wiki-a-tsg-mma-baseline-value-mismatch.md, ado-wiki-b-tsg-auoms.md, ado-wiki-b-tsg-log-analytics-agent-azure-vms.md, ado-wiki-b-tsg-windows-mma.md, ado-wiki-b-what-is-auoms.md, ado-wiki-d-fim-over-mma-tsg.md, onenote-linux-auditd-auoms.md, onenote-monitoring-agent-deployment-options.md
  ... and 2 more
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Mma
> Sources: ado-wiki

**1. Customer enabled auto provisioning for MMA/Log Analytics agent but existing VMs are not being automatically onboarded to the selected workspace**

- **Root Cause**: During auto provisioning setup, customer selected 'New VMs only' option instead of 'Existing and new VMs' — existing VMs are excluded from the current auto provisioning scope
- **Solution**: Reconfigure auto provisioning: 1) Set to 'Connect Azure VMs to the default workspace(s) created by Defender for Cloud' → Apply and Save; 2) Reconfigure to desired workspace — popup appears to select scope; 3) Select 'Existing and new VMs' to include already deployed machines.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. MDC shows an Azure VM as an on-premises machine with no reason in MMA-based recommendations**

- **Root Cause**: The Heartbeat sent to the Log Analytics workspace has IsAzure value of 0, causing MDC to classify and present the resource as on-prem.
- **Solution**: Run Kusto query on cluster("romelogs.kusto.windows.net").database("Prod").HybridOmsMachineRawSecurityDataOE filtering by SubscriptionId and ComputerName to check IsAzure flag and AgentType. Also use MMA-Based Dashboard at portal.microsoftgeneva.com.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. No MMA-based recommendations (System Updates, Endpoint Protection, Baselines) visible for a resource in Defender for Cloud**

- **Root Cause**: MDC only presents MMA-based recommendations from data in LA workspace. If agent is not sending data properly, MDC cannot show recommendations. MDC is not responsible for agent data ingestion.
- **Solution**: Check LA workspace for relevant recommendation data tables. Verify MMA/AMA agent health and data ingestion. For LA/agent issues, create collaboration task to Log Analytics support (cannot create CRI directly to LA PG).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Linux machine has no data in ProtectionStatus table but Heartbeat table shows the machine is connected**

- **Root Cause**: Safeguard for Sudo blocks the Log Analytics agent (omsagent) from running required sudo commands defined in /etc/sudoers.d/omsagent needed to collect ProtectionStatus data.
- **Solution**: Remove Safeguard for Sudo, or configure it to allow commands defined in /etc/sudoers.d/omsagent. Verify ProtectionStatus data appears after the change.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 2: Mdvm
> Sources: ado-wiki

**1. Same machine shown multiple times in MDC portal as duplicate representations: Arc-less + Azure Arc, Arc-less + Multi-cloud, or Arc-less + on-premises MMA**

- **Root Cause**: Multiple onboarding paths create separate resource representations: (1) Arc-less + Azure Arc: machine onboarded to MDE natively then Azure Arc installed later. (2) Arc-less + Multi-cloud: machine onboarded natively while part of active multi-cloud MDC connector. (3) Arc-less + MMA: both MDE and MMA agents installed natively on the machine.
- **Solution**: Known issue for Arc + Arc-less duplicates (resolution WIP). Reassure customer that duplicates are NOT billed twice - they are display-only duplicates in the portal. No immediate customer action needed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 3: Asc
> Sources: onenote

**1. Duplicate VM entries or wrong VM count shown in Azure Security Center — same VM appears twice in the VM list for a subscription**

- **Root Cause**: VM has no Azure Resource ID. OMS workspace identifies the VM by SourceComputerId but cannot match it to an Azure resource, causing same VM to appear twice — once from Compute RP discovery and once from OMS workspace discovery.
- **Solution**: Verify using Kusto queries on RomeLogs: 1) cluster('RomeLogs').database('RomeLogs').OmsHealthMonitoringOE to check VMs identified via Compute RP, 2) cluster('RomeLogs').database('RomeLogs').HybridOmsHealthMonitoringOE to check VMs identified via OMS workspace. Look for entries where IsAzure=true but HasAzureResourceId=false. Notes: VMs created from images may show Direct Agent despite having Azure Resource ID. If Azure Resource ID exists but machine shows as Non-azure, escalate to OMS team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

### Phase 4: Fim
> Sources: ado-wiki

**1. [Deprecated MMA] Customer made file/registry changes but cannot see them in the MDC FIM Change Tracking blade**

- **Root Cause**: Changes beyond the UI display limit (last 100 changes only shown), or MMA monitoring agent unhealthy/not reporting.
- **Solution**: [DEPRECATED - advise FIM over MDE] 1) Check monitoring agent health. 2) Run ConfigurationChange LA query filtering Computer and ConfigChangeType in Files,Registry. 3) UI only shows last 100 changes.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 5: Aac
> Sources: onenote

**1. Adaptive Application Control (AAC) machines not appearing in group list - VMs not discovered for application whitelisting recommendations**

- **Root Cause**: Multiple causes: (1) Not Standard tier (2) AppLocker not configured (3) OMS agent not reporting AppLocker events (4) VM group not stable - inconsistent apps/processes
- **Solution**: Check: 1) Verify Standard tier pricing 2) Check AppLocker config (Microsoft-Windows-AppLocker/EXE and DLL) 3) Verify OMS agent status 4) Query AppWhitelistingVmsIngestion in Rome3Prod Kusto
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

### Phase 6: Oms Agent
> Sources: onenote

**1. Duplicated VM entries or wrong VM count in Azure Security Center - same VM appears twice in inventory**

- **Root Cause**: VM has no Azure Resource ID, causing OMS to show it once as Azure VM and once as non-Azure. Verified when HybridOmsHealthMonitoringOE shows IsAzure=1 but HasAzureResourceId=0. Can also occur when VM created from image has Direct Agent with Azure Resource ID.
- **Solution**: Query RomeLogs.OmsHealthMonitoringOE (by SubscriptionId, summarize by VmId) and RomeLogs.HybridOmsHealthMonitoringOE (by SourceComputerId) to compare. If Azure Resource ID present but machine shows as Non-azure, escalate to OMS team.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

### Phase 7: Vmss
> Sources: ado-wiki

**1. VMSS instance shows 'missing scan data' in Microsoft Defender for Cloud portal, but SecurityBaseline table on the connected Log Analytics workspace contains data for that VMSS**

- **Root Cause**: VMUUID field is not properly populated in the SecurityBaseline table data. The VMSS assessor uses VMUUID as the unique identifier to match scan data to VMSS instances. When VMUUID is missing or incorrect, the assessor cannot correlate the existing data, resulting in a 'missing scan data' status despite data being present.
- **Solution**: Step-by-step diagnostic using Kusto queries on romelogs.kusto.windows.net/Prod: (1) Query DynamicWithSubscriptionOE where operationName=='GetAssessment' with assessmentKey '8941d121-f740-35f6-952c-6561d2b38d36' to check actual assessment result vs portal display; (2) Query operationName=='BuildSecurityDataForVmssAsync' to verify workspace was properly mapped to the VMSS; (3) Query operationName=='BuildSecurityDataForInstance' to check if raw data exists for the VMSS instance; (4) Query operationName=='GetInstanceInGuestData' to check VMUUID population — if inGuestDataFound/linuxOriginalVmuuidFound/linuxSwappedVmuuidFound are all False, VMUUID is not populated. Root cause is either OMS agent issue or ASM issue.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 8: Os Baseline
> Sources: mslearn

**1. Defender for Cloud: duplicate OS baseline recommendations appear for the same machine**

- **Root Cause**: Both the legacy Log Analytics agent (MMA) and the new Azure Policy machine configuration extension (guest configuration) are installed on the same machine, each generating its own assessment
- **Solution**: Disable the Log Analytics agent (MMA) on the machine to eliminate duplicate recommendations; use only the Azure Policy machine configuration extension for OS baseline assessments going forward
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 9: Mde Linux
> Sources: mslearn

**1. MDE Linux health shows false with no active supplementary event provider after upgrading to 101.94.13+**

- **Root Cause**: Misconfigured or conflicting auditd rules on existing machines prevent supplementary event provider from activating
- **Solution**: Backup /etc/audit/rules.d/audit.rules; run echo -c >> /etc/audit/rules.d/audit.rules && augenrules --load to identify and fix conflicting rules
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

---

## Known Issues Reference

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
| 10 ⚠️ | VMSS instance shows 'missing scan data' in Microsoft Defender for Cloud portal, but SecurityBasel... | VMUUID field is not properly populated in the SecurityBaseline table data. The VMSS assessor uses... | Step-by-step diagnostic using Kusto queries on romelogs.kusto.windows.net/Prod: (1) Query Dynamic... | 🔵 7.0 | ADO Wiki |
| 11 ⚠️ | Defender for Cloud: duplicate OS baseline recommendations appear for the same machine | Both the legacy Log Analytics agent (MMA) and the new Azure Policy machine configuration extensio... | Disable the Log Analytics agent (MMA) on the machine to eliminate duplicate recommendations; use ... | 🔵 6.0 | MS Learn |
| 12 ⚠️ | MDE Linux health shows false with no active supplementary event provider after upgrading to 101.9... | Misconfigured or conflicting auditd rules on existing machines prevent supplementary event provid... | Backup /etc/audit/rules.d/audit.rules; run echo -c >> /etc/audit/rules.d/audit.rules && augenrule... | 🔵 6.0 | MS Learn |
