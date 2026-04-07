# TSG: MDC Alerts Not Triggered or Delayed

> Source: OneNote — Mooncake POD Support Notebook / Microsoft Defender for Cloud / Alerts Validation & Detection
> Quality: draft | Needs: update Jarvis links for current environment, verify with latest pipeline architecture

## Diagnostic Pipeline (5-step)

### Step 1: Configuration Check
- Verify Azure Defender plan is enabled for the targeted resource type (VMs, SQL, Storage, etc.)
- Check subscription pricing tier in MDC portal
- Ensure the correct Defender plan covers the detection type needed

### Step 2: OMS Agent Health
- Verify agent version is up-to-date in ASC portal for target VM
- Verify required ASC solution is enabled

**Windows VM troubleshooting:**
- Collect: `%SystemRoot%\System32\Winevt\Logs\Operations Manager.evtx`
- Check intelligence management pack ran `EnableAscPolicies.ps1` successfully
- Verify registry values for security event collection (Event ID 4688 process creation)
- Confirm 4688 events include command line information

**Linux VM troubleshooting:**
- Collect: `/var/opt/microsoft/omsagent/<workspace-id>/log/omsagent.log`
- Verify data collections: `PROCESS_INVESTIGATOR_BLOB`, `LINUX_AUDITD_BLOB`
- Look for successful data collection entries in omsagent.log

**Docs:**
- [Windows agent troubleshooting](https://docs.azure.cn/zh-cn/azure-monitor/platform/agent-windows-troubleshoot)
- [Linux agent troubleshooting](https://docs.azure.cn/zh-cn/azure-monitor/platform/agent-linux-troubleshoot)

### Step 3: ODS/In-Mem Injection
- Track data flow in Jarvis for ODS injection
- Jarvis link: `https://jarvis-west.dc.ad.msft.net/91C2127B`
- Filter by data type (e.g., `PROCESS_INVESTIGATOR_BLOB` for suspicious file download)
- Check `ActivityFailedEvent` table for injection failures

### Step 4: Scuba Detection
- Verify detection via security event hub
- Jarvis link: `https://jarvis-west.dc.ad.msft.net/B438A933`
- Successful detection shows "publish alert" with alert ID and provider (e.g., MSTIC)
- For failures: filter by `tracelevel < 3`

### Step 5: Rome Alert Generation
- Check Rome logs for alert generation
- Jarvis link: `https://jarvis-west.dc.ad.msft.net/8FB013C8`
- Filter by `SystemAlertID`
- Find alert type name and confirm subscription
- Failed alerts show `tracelevel 3`

## Common Failure Points
1. Defender plan not enabled for the resource type
2. OMS agent outdated or not reporting
3. Security event collection not configured (missing EnableAscPolicies)
4. ODS injection failures
5. Scuba detection engine issues
6. Rome alert suppression
