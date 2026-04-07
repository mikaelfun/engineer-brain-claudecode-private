---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Scanning/Scan fails with an error/System error while attempting to launch datascan process"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Scanning/Scan%20fails%20with%20an%20error/System%20error%20while%20attempting%20to%20launch%20datascan%20process"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# System error while attempting to launch datascan process

## Overview

Error coming from the executor/agent during scan. Diagnostic steps differ by scan type (SHIR vs Cloud IR).

## Step 1: Determine Scan Type

**For Self-Host IR scans**: Follow [Get the log for a Self-Host IR Scan](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Azure%20Purview/614492/Get-the-logs-from-Self-Host-IR-scan)

**For Cloud IR scans**: Find the correct cluster:

```kql
cluster("https://catalogtelemetrykusto.eastus.kusto.windows.net")
.database("Scan")
.GetAgentCluster({ScanRunId})
```

Output provides: region, clusterConn (e.g., `https://purviewadxsan.southafricanorth.kusto.windows.net`), originConn

## Step 2: Query Executor/Agent Logs

Replace `{ClusterConnStr}` with the `clusterConn` from Step 1:

### Executor Logs
```kql
let activityid = cluster("https://catalogtelemetrykusto.eastus.kusto.windows.net")
    .database("Scan").GetScanActivities({ScanRunId});
cluster({ClusterConnStr}).database('DataScanLogs').CustomLogEvent
| where ActivityId in (activityid)
```

### Agent Logs
```kql
cluster({ClusterConnStr}).database('DataScanLogs').DataScanAgentEvent
| where ScanResultId == {ScanRunId}
```
