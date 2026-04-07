---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Alerts/[Troubleshooting Guide] - Testing Alerts/[TSG] - MDE Alert"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Security%20Alerts/%5BTroubleshooting%20Guide%5D%20-%20Testing%20Alerts/%5BTSG%5D%20-%20MDE%20Alert"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Generate a Benign MDE Test Alert

From: [Use the integrated Microsoft Defender for Endpoint license](https://docs.microsoft.com/en-us/azure/security-center/security-center-wdatp#send-a-test-alert)

### Steps

1. Use Remote Desktop to access either a Windows Server 2012 R2 VM or a Windows Server 2016 VM.
2. Create a folder `C:\test-MDATP-test`.
3. Open a command-line window.
4. At the prompt, copy and run the following command (the Command Prompt window will close automatically):

```powershell
powershell.exe -NoExit -ExecutionPolicy Bypass -WindowStyle Hidden (New-Object System.Net.WebClient).DownloadFile('http://127.0.0.1/1.exe', 'C:\\test-MDATP-test\\invoice.exe'); Start-Process 'C:\\test-MDATP-test\\invoice.exe'
```

5. If the command is successful, you'll see a new alert on the Azure Security Center dashboard and the Microsoft Defender for Endpoint portal. This alert might take a few minutes to appear.
6. To review the alert in Security Center, **you must work with the new Alerts portal (introduced in Jan 2021) and make sure to filter in Informational alerts as well**.

## TSG for MDE Native Alerts (ARC-less)

Since these alerts don't have an Azure resource ID, they are enriched with an ID of type "mdeServers" with the format:
`/sub/<subid>/providers/microsoft.security/mdeServers/<machine_name>_<machine_id>`

If the alert isn't shown in the Alerts portal, there could be a failure in MDC enrichment system on top of other usual alerts flow components.

### Diagnostic Kusto Queries

**Step 1: Check if alert was received:**
```kusto
cluster('romelogs.kusto.windows.net').database("Rome3Prod").FabricTraceEvent
| where env_time > ago(10d)
| where message has "Received alert"
| where message has "{machine_name or machine_id}"
```

If the relevant alert is not shown there, it could be an issue on MDE side.

**Step 2: If alert was received, trace the flow:**
```kusto
cluster('romelogs.kusto.windows.net').database("Rome3Prod").FabricTraceEvent
| where env_time > ago(10d)
| where env_cv has "<operationId>"
| project env_time, traceLevel, message
```

If the traces show that the alert was published, there may be an issue in the next component (same as non-MDE Native alerts).
