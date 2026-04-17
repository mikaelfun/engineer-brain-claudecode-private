# DEFENDER FIM 文件完整性监控 — Troubleshooting Quick Reference

**Entries**: 6 | **21V**: 5/6 applicable
**Sources**: ado-wiki | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/fim-change-tracking.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer disabled LAW (Log Analytics Workspace) setting under MDC and lost certain security features | Disabling LAW auto-provisioning removes File Integrity Monitoring (FIM) via LAW, OS security base... | Use replacement features: FIM has new non-LAW replacement, OS security baselines have new recomme... | 🟢 8.5 | ADO Wiki |
| 2 | FIM (File Integrity Monitoring) over AMA not tracking all file changes or showing incomplete resu... | Exceeding Azure Automation Change Tracking per-machine limits: 500 files, 250 registry keys, 250 ... | Review and reduce the number of tracked items to stay within Change Tracking limits. Avoid config... | 🟢 8.5 | ADO Wiki |
| 3 | Missing FIM events for Windows machines despite FIM being enabled and configured correctly (known... | Windows machine missing Read access permission for SID S-1-15-3-1024-1065365936-1281604716-351173... | Known bug (ETA mid-June fix). Workaround: grant Read access for the specified SID on HKLM\SYSTEM\... | 🟢 8.5 | ADO Wiki |
| 4 | [Deprecated MMA] FIM fails with PrivateLinkValidationFailedError when workspace has Private Link ... | FIM Change Tracking uses ARM API queries which cannot use Azure Monitor Private Links. When works... | [DEPRECATED - advise FIM over MDE] Set 'Accept queries from public networks not connected through... | 🟢 8.5 | ADO Wiki |
| 5 | FIM change records delayed or not appearing for up to 6 hours after changes are made on the monit... | High network traffic between the monitored machine and the Log Analytics workspace causes Change ... | Allow up to 6 hours for change records to appear during high network traffic. If still missing, v... | 🔵 7.5 | ADO Wiki |
| 6 | Customer cannot enable FIM (File Integrity Monitoring) Agentless feature in Defender for Cloud | Missing required permissions: Subscription Owner and Workspace Owner roles are needed to enable F... | Grant Subscription Owner and Workspace Owner permissions. Ensure Defender for Servers P2 is enabl... | 🔵 7.0 | ADO Wiki |

## Quick Troubleshooting Path

1. Use replacement features: FIM has new non-LAW replacement, OS security baselines have new recommendations, MDE recommendations updated. Reference: Microsoft Community Hub article on MMA deprecation... `[Source: ADO Wiki]`
2. Review and reduce the number of tracked items to stay within Change Tracking limits. Avoid configuring recursive broad paths. Full limits at docs.microsoft.com/en-us/azure/automation/automation-cha... `[Source: ADO Wiki]`
3. Known bug (ETA mid-June fix). Workaround: grant Read access for the specified SID on HKLM\SYSTEM\CurrentControlSet\Control and Services registry keys. `[Source: ADO Wiki]`
4. [DEPRECATED - advise FIM over MDE] Set 'Accept queries from public networks not connected through a Private Link Scope' to Yes on the Log Analytics workspace Network Isolation settings. `[Source: ADO Wiki]`
5. Allow up to 6 hours for change records to appear during high network traffic. If still missing, verify OMS/AMA agent health and open a collaboration task to Azure/Change Tracking and Inventory. FIM... `[Source: ADO Wiki]`
