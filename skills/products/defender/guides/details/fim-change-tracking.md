# DEFENDER FIM 文件完整性监控 — Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-fim-v2-support-boundaries.md, onenote-fim-change-tracking.md, onenote-fim-troubleshooting.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Fim
> Sources: ado-wiki

**1. FIM (File Integrity Monitoring) over AMA not tracking all file changes or showing incomplete results; some file/registry changes are detected while others are missing**

- **Root Cause**: Exceeding Azure Automation Change Tracking per-machine limits: 500 files, 250 registry keys, 250 Windows software, 1250 Linux packages, 250 services, 250 daemons. Configuring overly broad recursive paths quickly exhausts these limits, causing remaining changes to be silently dropped.
- **Solution**: Review and reduce the number of tracked items to stay within Change Tracking limits. Avoid configuring recursive broad paths. Full limits at docs.microsoft.com/en-us/azure/automation/automation-change-tracking. Note: FIM over AMA is deprecated; advise customers to migrate to FIM over MDE.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Missing FIM events for Windows machines despite FIM being enabled and configured correctly (known bug)**

- **Root Cause**: Windows machine missing Read access permission for SID S-1-15-3-1024-1065365936-1281604716-3511738428-1654721687-432734479-3232135806-4053264122-3456934681 on HKLM\SYSTEM\CurrentControlSet\Control or Services. Bug 57239192: Missing permissions for SenseImdsCollector.
- **Solution**: Known bug (ETA mid-June fix). Workaround: grant Read access for the specified SID on HKLM\SYSTEM\CurrentControlSet\Control and Services registry keys.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. [Deprecated MMA] FIM fails with PrivateLinkValidationFailedError when workspace has Private Link Scope enabled**

- **Root Cause**: FIM Change Tracking uses ARM API queries which cannot use Azure Monitor Private Links. When workspace blocks public network queries, ARM API calls fail.
- **Solution**: [DEPRECATED - advise FIM over MDE] Set 'Accept queries from public networks not connected through a Private Link Scope' to Yes on the Log Analytics workspace Network Isolation settings.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. FIM change records delayed or not appearing for up to 6 hours after changes are made on the monitored machine**

- **Root Cause**: High network traffic between the monitored machine and the Log Analytics workspace causes Change Tracking change records to be delayed up to six hours before appearing.
- **Solution**: Allow up to 6 hours for change records to appear during high network traffic. If still missing, verify OMS/AMA agent health and open a collaboration task to Azure/Change Tracking and Inventory. FIM over AMA is deprecated; migrate to FIM over MDE.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

**5. Customer cannot enable FIM (File Integrity Monitoring) Agentless feature in Defender for Cloud**

- **Root Cause**: Missing required permissions: Subscription Owner and Workspace Owner roles are needed to enable FIM. Additionally, Defender for Servers P2, Agentless scanning for machines, and FIM must all be enabled.
- **Solution**: Grant Subscription Owner and Workspace Owner permissions. Ensure Defender for Servers P2 is enabled, Agentless scanning for machines is turned on in Defender for Servers Settings & monitoring, and FIM is enabled.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 2: Mma Deprecation
> Sources: ado-wiki

**1. Customer disabled LAW (Log Analytics Workspace) setting under MDC and lost certain security features**

- **Root Cause**: Disabling LAW auto-provisioning removes File Integrity Monitoring (FIM) via LAW, OS security baselines recommendations, and legacy MDE recommendations. These features relied on MMA agent pipeline.
- **Solution**: Use replacement features: FIM has new non-LAW replacement, OS security baselines have new recommendations, MDE recommendations updated. Reference: Microsoft Community Hub article on MMA deprecation strategy. Post-MMA deprecation (Aug 2024), Defender for Servers relies on MDE + agentless capabilities. Note: Defender for SQL on VMs still requires AMA — enable 'Azure Monitoring Agent for SQL server on machines' setting.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer disabled LAW (Log Analytics Workspace) setting under MDC and lost certain security features | Disabling LAW auto-provisioning removes File Integrity Monitoring (FIM) via LAW, OS security base... | Use replacement features: FIM has new non-LAW replacement, OS security baselines have new recomme... | 🟢 8.5 | ADO Wiki |
| 2 | FIM (File Integrity Monitoring) over AMA not tracking all file changes or showing incomplete resu... | Exceeding Azure Automation Change Tracking per-machine limits: 500 files, 250 registry keys, 250 ... | Review and reduce the number of tracked items to stay within Change Tracking limits. Avoid config... | 🟢 8.5 | ADO Wiki |
| 3 | Missing FIM events for Windows machines despite FIM being enabled and configured correctly (known... | Windows machine missing Read access permission for SID S-1-15-3-1024-1065365936-1281604716-351173... | Known bug (ETA mid-June fix). Workaround: grant Read access for the specified SID on HKLM\SYSTEM\... | 🟢 8.5 | ADO Wiki |
| 4 | [Deprecated MMA] FIM fails with PrivateLinkValidationFailedError when workspace has Private Link ... | FIM Change Tracking uses ARM API queries which cannot use Azure Monitor Private Links. When works... | [DEPRECATED - advise FIM over MDE] Set 'Accept queries from public networks not connected through... | 🟢 8.5 | ADO Wiki |
| 5 | FIM change records delayed or not appearing for up to 6 hours after changes are made on the monit... | High network traffic between the monitored machine and the Log Analytics workspace causes Change ... | Allow up to 6 hours for change records to appear during high network traffic. If still missing, v... | 🔵 7.5 | ADO Wiki |
| 6 ⚠️ | Customer cannot enable FIM (File Integrity Monitoring) Agentless feature in Defender for Cloud | Missing required permissions: Subscription Owner and Workspace Owner roles are needed to enable F... | Grant Subscription Owner and Workspace Owner permissions. Ensure Defender for Servers P2 is enabl... | 🔵 7.0 | ADO Wiki |
