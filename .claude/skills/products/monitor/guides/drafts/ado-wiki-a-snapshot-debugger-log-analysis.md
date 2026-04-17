---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Profiler & Snapshot Debugger/Snapshot debugger log analysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Profiler%20%26%20Snapshot%20Debugger/Snapshot%20debugger%20log%20analysis"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

Guide to analyze logs outputted by snapshot debugger to better understand what it is doing, if it is encountering any issues, and or why logs might not be sent.

> **Note**: This is not a TSG. This is information that will be referenced accordingly by TSGs.

# Steps

1. Leverage ASC's "Customer Query Data" tab to run the following query. The following query shows the number of snapshots for the given time range it has uploaded for use within the portal:

   ```kusto
   customEvents
   | where timestamp > ago(5h)
   | where sdkVersion startswith "_sc:" 
   | where name == "UploadSnapshotFinish"
   | order by timestamp asc
   ```

2. The above shows snapshots that were successfully uploaded.

3. The following query should have matching set of counts. If there is a SnapshotStart and no Stop or no UploadSnapshotFinish, the exception was picked up by snapshot debugger and it attempted to collect and uploaded it but something went wrong.

   ```kusto
   customEvents
   | where timestamp > ago(5d)
   | where sdkVersion startswith "a_sc:" 
   | extend EventName = tostring(customDimensions.["EventName"])
   | where EventName in ("SnapshotStop", "SnapshotStart") or name == "UploadSnapshotFinish"
   | summarize count() by EventName, name
   ```

4. Looking at the Properties field you can find the SnapshotId — this is used throughout the entire process. Note a SnapshotId is not in the SnapshotStart event.
   - For a given SnapshotId there should be two entries in the Events table for every successfully uploaded snapshot.
   - The SnapshotId found in the query results above will map to these uploader logs.

5. If an exception is located in the logs, use the operation_Id value to construct all entries emitted by Snapshot Debugger related to the found exception:

   ```kusto
   customEvents
   | where timestamp > ago(5d)
   | where sdkVersion startswith "a_sc:" 
   | where operation_Id == "<id>"
   | extend EventName = tostring(customDimensions.["EventName"])
   | order by timestamp asc
   ```

# Public Documentation

- [Debug exceptions in .NET applications using Snapshot Debugger](https://learn.microsoft.com/azure/azure-monitor/snapshot-debugger/snapshot-debugger)
- [Snapshot Debugger process](https://learn.microsoft.com/azure/azure-monitor/snapshot-debugger/snapshot-debugger#snapshot-debugger-process)
- [Troubleshoot Azure Application Insights Snapshot Debugger](https://learn.microsoft.com/en-us/azure/azure-monitor/snapshot-debugger/snapshot-debugger-troubleshoot)

# Internal References

- [Determine if Snapshot Debugger is enabled](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/812813/Determine-if-Snapshot-Debugger-is-enabled)
- [Snapshot Debugger - Configuration or performance impact](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605423/Snapshot-Debugger-Configuration-or-performance-impact)
- [Snapshot Debugger - Snapshots not collected](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605421/Snapshot-Debugger-Snapshots-not-collected)
