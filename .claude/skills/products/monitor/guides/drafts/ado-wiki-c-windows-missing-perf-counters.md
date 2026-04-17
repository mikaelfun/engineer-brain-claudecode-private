---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Common Concepts/Windows Missing Perf Counters"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Common%20Concepts/Windows%20Missing%20Perf%20Counters"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

#Scenario
---
MMA consumes performance counters using Registry Functions. The current best practice is to use the PDH library, published by the Windows team, to read counter data. PDH can detect on the fly whether counters are v1 or v2 and read them from the appropriate place. MMA only supports v1. If v2 counters work, that's great, but it's not 100% reliable. 

#Determine Counter type
---
You can look in the V1 registration information and the V2 registration information to check if a counters is v1 or v2.
- V1 providers are registered under HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\[MyServiceName]\Performance.
- V2 providers are registered under HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Perflib\_V2Providers.

GetAgentInfo.ps1 script collect list of V1 counters in file "v1_counter_providers.txt" and V2 counters in file "v2_counter_providers.txt". Look for counter in these files to find counter is V1 or V2.

#Event id 10104
---
There have also been recent code fixes in MMA codes for reading perf counters. 
Look for Event id 10104 in Operations Manager events logs and check event message details for actual error. If message in one of �More data is available�, �The wait operation timed out� or �The requested resource is in use� please update MMA to latest agent. 
Some of the other errors with event id 10104 could be because if resource limitations on the machine such as �Not enough storage is available to complete this operation�, �The paging file is too small for this operation to complete�. Some of the other errors with event id 10104 may indicate issue with system integrity such as �The stub received bad data�.

#Agent service not running
---
If perf counters are missing in specific duration, also check if heartbeat was flowing during that time. If agent was not running (because system was shutdown/restarted or service was not running/crashed) counters data will also be missing. 

#Verify from Traces
---
If you encounter none of above, please start capturing agent verbose level traces and restart agent service. Look for the line like following. If you do not find matching line for perf counter that you are looking for, agent is not configured to capture that perf counter.

" [ModulesPerformance] [] [Information] :CPerfDataSource::InitializePerfData{perfdatasource_cpp537}DataItem being sent is <Processor,% Processor Time,_Total,49.2072,Tuesday, February 11, 2020 18:48:05>"


If your desire counter is not being collected please 
- Learn Frequency of counter collection.
- Make sure counter is producing data in local windows Perfmon
- Capture getagentinfo.ps1 trace and run it for at least as long as you can capture 3 counter sample collections.
-For example if counter is configured for collection every 60 seconds then collect traces for at least 5 minutes.
- Capture the data and have an agent SME analyze it before approving a possible ICM to engage product group.
- Raise icm via ASC once you Update Case SAP Azure/Log Analytics agent (MMA and OMS)/Windows Agents/Windows agent not reporting data or Heartbeat data missing



