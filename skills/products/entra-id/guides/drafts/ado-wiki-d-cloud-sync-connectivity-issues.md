---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cloud Sync/Provisioning agent/Cloud Sync Connectivity Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FCloud%20Sync%2FProvisioning%20agent%2FCloud%20Sync%20Connectivity%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Cloud Sync Connectivity Issues

## Overview
Connectivity issues can cause many different symptoms including inability to setup provisioning or provisioning job going into quarantine.

## Troubleshooting Steps

1. **Firewall and Proxy Requirements**: Ensure customer meets requirements documented at Prerequisites for Microsoft Entra Cloud Sync
2. **Web Proxy Configuration**: If using web proxy, verify configuration per Cloud Sync troubleshooting docs (agent-times-out-or-certificate-isnt-valid)
3. **Check Trace Logs**: Default agent trace logs at `C:\ProgramData\Microsoft\Azure AD Connect Provisioning Agent\Trace`
4. **Collect Verbose Logs**: Run Export-AADCloudSyncToolsLogs for detailed diagnostics

## Kusto Queries for Diagnosis

### Check Recent Job Status
```kql
let qJobId = "<Input JobId here>";
GlobalIfxUsageEvent
| where env_time > ago(1d)
| where internalCorrelationId contains qJobId
| where usageType == "RunProfileStatistics"
| where message !contains "ExecutionStatus: Executing"
| extend duration = (extract("(?:  Duration: )([0-9]*:[0-9]*:[0-9]*.[0-9]*)", 1, message, typeof(timespan)))
| project duration, env_time
| summarize max(duration) by env_time
| render timechart
```

### Get Sync Cycle Details
```kql
let qCorrelationId = "<input correlation id>";
GlobalIfxAllTraces
| where correlationId == qCorrelationId
| project env_time, env_seqNum, message
| order by env_time asc
```

## Reference
- Cloud sync troubleshooting: https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/how-to-troubleshoot
- AADCloudSyncTools PowerShell module: https://learn.microsoft.com/en-us/entra/identity/hybrid/cloud-sync/reference-powershell
