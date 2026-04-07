---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Review the MAEventTable.csv"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Review%20the%20MAEventTable.csv"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The agent logs events to a number of log files, but all events are also logged to a consolidated log - the MAEventTable.csv log.

# Prerequisites
This how-to assumes that you've already [Run the agent troubleshooter](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell#run-the-troubleshooter) and have those logs. Since the MAEventTable is converted into a human readable format by the Troubleshooter.

```Troubleshooter: ...\AgentDataStore\Tables\MAEventTable.csv```

# Understanding the data
Explanation of the properties (columns) found in the MAEventTable.csv:
- **Time Stamp:** The time this event was recorded.
- **Level:** The level of the record. Here are the possible values:
    - 0 = None | 1 = Critical | 2 = Error | 3 = Warning | 4 = Info | 5 = Verbose
- **Pid:** The process ID of the recording process.
- **Tid:** The thread ID of the recording thread.
- **Stream:** The type of operation that recorded this event. Here are some examples: 
    - ConfigurationReader | Counter | ETW | EventHub | EventHubManager | ExtensionManager | InputStreams | MonAgent | MonAgentCore.exe | MonAgentManager.exe | NodeDiagManager | PHashTable | PipeServer | QueryEngine | SelfMonitoring | TableManager | TableReader | TableWriter | Tasks | Telemetry | UploadToLaOdsQuery | XPlatLogs
- **Instance:**
- **ActivityId:** The unique identifier of a particular activity (used to tie related log records together).
- **File:** The C++ source code file that was running when this log record was recorded.
- **Function:** The function from the C++ source code file that was running when this log record was recorded.
- **Line:** The line of code in the C++ source code file that was running when this log record was recorded.
- **MDRESULT:** Return code for a function.
- **ErrorCode:** Error code for a function. 0 is success and non-zero is an error code.
- **ErrorCodeMsg:** Error message output for a function. Example "Access is denied."
- **Message:** The text of the log statement for a function. This is one of the most useful properties.
- **ErrorType:** Error category. Here are some examples:
    - ConfigProcessing | DataRouting | DataTransform | DataUpload | Extensions | Infrastructure | Ingestion | LocalState | NodeDiagnostics | ResourceUsage | Unknown
- **traceparentId:**
- **SchemaID:**

# Understanding task completion
The Azure Monitor Agent (AMA) utilizes a task scheduler to batch records from cache and transmit records to a destination. This section will provide a high-level overview of scheduled tasks as they appear in the MAEventTable.csv.

***Filtering a specific scheduled task***
- Step 1: Note the **local store name** from [How-to review agent instruction set](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590096/AMA-Windows-HT-Review-agent-instruction-set) for the datatype in this batch. 
- Step 2: Note the **Time Stamp** (column A) of the last event in the MAEventTable.csv and minus 10 minutes (pending info from PG to refine this value). 
    - This timestamp should be your upper limit for any "Starting scheduled task". 
    - This will help to prevent looking at a scheduled task that is still running with the Troubleshooter completes. 
- Step 3: Use the **local store name** to filter the **Message** (column N)
- Step 4: Locate a "Starting scheduled task" event that occurred before the timestamp noted in Step 2 and note the **ActivityId** (column G)
- Step 5: Use the ActivityId to filter (column G)

![image.png](/.attachments/image-3f03f660-c1cb-41f5-9fc0-c8209c5fa58a.png)

***Reviewing the life cycle of a scheduled task***
Now you are looking at the life cycle of a specific scheduled task. Do you see an "Starting scheduled task..." event and an "Ending scheduled task..." event within these filtered events? If not, review the [known issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1739213/AMA-Windows-HT-Review-the-MAEventTable.csv?anchor=known-issues-(task-scheduler)). 

- **<span style="color: 000000; background-color: #ff6666;">Local store name</span>** - value from [How-to review agent instruction set](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590096/AMA-Windows-HT-Review-agent-instruction-set) for the datatype in this batch. 
    - In a Heartbeat scheduled task, this will say "LogAnalyticsHeartbeatsLogAnalytics<workspaceId>", rather than the local store name. 
- **<span style="color: 000000; background-color: #ffff33;">Time span of the buffered records in this batch</span>** - The timestamp of the earliest record in this batch and the timestamp of the latest record in this batch. 
- **<span style="color: 000000; background-color: #cb99ff;">Query delay</span>** = **<span style="color: 000000; background-color: #ffb266;">Scheduled task starting timestamp</span>** minus **<span style="color: 000000; background-color: #66ffff;">timestamp of the last record in the batch</span>**
    - How long it took for records to be read from cache and then scheduled for transmission.
- **<span style="color: 000000; background-color: #66ff66;">Duration of the scheduled task</span>** = **<span style="color: 000000; background-color: #ffb266;">Scheduled task starting timestamp</span>** minus **<span style="color: 000000; background-color: #ff66ff;">scheduled task ending timestamp</span>**.
    - How long the scheduled task ran for (from start to end).

## Known Issues (task scheduler)
#148137

# Scenario: Configuration

## Known Issues (Configuration)
#107391

# Scenario: Heartbeat

## Known Issues (Heartbeat)
#97654
#106716

# Scenario: Performance Counters (Microsoft-Perf)
- Filter the Stream (column E) to "Counter"
- Filter the Level (column B) to 4

The below screenshot shows an example of adding counters successfully:
![==image_0==.png](/.attachments/==image_0==-9b357640-1d07-405b-81b0-46b94655cea9.png) 

- Filter the Stream (column E) to "Counter" or "ConfigurationReader"
- Filter the Level (column B) to 1 or 2 or 3

The below screenshot shows an example of multiple different errors. This is for demonstration purposes - not all of these will likely occur in a given customer scenario:
![image.png](/.attachments/image-62086cb8-2bce-4548-95c9-86243d719984.png)

If you observe an error here, verify whether or not the counter exists on the system using typeperf ([how-to test performance counter using typeperf](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1732170/AMA-Windows-HT-Test-performance-counters-with-typeperf)). If the counter does exist, try to query the counter with typeperf and see if you can get a result. 

## PDH Error Reference
For a full list of PDH errors and their explanations - see the [Performance Data Helper Error Codes](https://learn.microsoft.com/en-us/windows/win32/perfctrs/pdh-error-codes)

## Known Issues (Performance Counters)
#84081
#84184
#84185
#105572
#84654

# Scenario: Windows Event Log
- Filter the File (column H) to "systemeventslistener.cpp"

![image.png](/.attachments/image-896b9cf5-0215-4890-8d32-6b636a8f889e.png)

Here are some examples of events we might expect to see in a healthy scenario:
```
Function: MAListener::StartListener
    Message: Starting listener SystemEventsListener.dll

Function: SystemEventsListener::Start
    Message: Starting SystemEventsListener.dll, Instance=0000021E27E85490

Function: SystemEventsListener::GetBookmark
    Message: Did not get bookmark for query System!*[System[(EventID=7040)]] from checkpoint table

Function: SystemEventsListener::SubscribeEvents
    Message: There were no prior bookmarking, and since startDelta is -ve, we start at the oldest value. StartTimeDelta -> -900, query -> c12104102755888414883_546419284751770569
    Message: Successfully subscribed to the following events: eventName=c12104102755888414883_546419284751770569 and flag=2.
    Message: Subscribed to event eventName=c12104102755888414883_546419284751770569 query=System!*[System[(EventID=7040)]]

Function: SystemEventsListener::ResetSubscription
    Message: Successfully resubscribed to Subscription "System!*[System[(EventID=7040)]]".

Function: SystemEventsListener::Start
    Message: Successfully setup Windows system event thread
```

## Known Issues (Windows Event Log)
#107538
#160087

# Scenario: Windows Firewall Log
## Known Issues (Windows Firewall Log)

# Scenario: Send to Event Hub
## Known Issues (Send to Event Hub)


# Scenario: Send to Storage Account
## Known Issues (Send to Storage Account)

#Scenario: IIS Logs (Microsoft-W3CIISLog)

Filter the Stream (column E) to "IIS" and "TextLog"

The below screenshot shows an example of successful collection and tracking of changes.

![image.png](/.attachments/image-912dcd9f-f541-4892-9754-fafea9d596cc.png)
