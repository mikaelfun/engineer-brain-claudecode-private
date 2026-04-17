---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Review MAQosEvent.csv"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Review%20MAQosEvent.csv"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The agent collects data and records the number of events it attempted to send to a destination, how long it took to send, and whether or not the sending was successful. This is recorded in the MAQosEvent log. 

# Prerequisites
This how-to assumes that you've already [Run the agent troubleshooter](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-windows?tabs=WindowsPowerShell#run-the-troubleshooter) and have those logs.

# Understanding the data
Explanation of the columns found in the MAQosEvent.csv file:
- **Time stamp (column A):** The exit time of the scheduled task
- **StartTime (column P):** The scheduled task is processing a block of data. This is the start time of the cached event window.
- **EndTime (column Q):** The scheduled task is processing a block of data. This is the end time of the cached event window.
- **DataDelayInMilliseconds (column K):** The time span between "StartTime" and "Time stamp"
- **Success (column H):** The Boolean result of the operation (TRUE = successful, FALSE = failed)
- **Object (column G):** Data types and local store names related to this operation
- **DataItemReadCount (column N):** How many records were cached to send
- **DataItemWriteCount (column O):** How many records were sent in this operation

# Scenario: Heartbeat
```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Tables\MaQosEvent.csv```

Filter the Object column to include the string "Heartbeat"

![image.png](/.attachments/image-46bfffe4-a919-4192-b018-c37b9695736c.png)

This is what successful looks like:
- Success = True
- DataItemReadCount = 1 (cached 1 record)
- DataItemWriteCount = 1 (sent 1 record)

![image.png](/.attachments/image-4c716a26-971f-44a1-ae40-82313dddcd18.png)

# Scenario: Performance Counters
```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Tables\MaQosEvent.csv```

Filter the Object column (column G) to include the local store name of the Performance Counter objects.
To identify the local store name for the Performance Counters, see [Check Performance Counters in mcsconfig](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1732153/AMA-HT-Check-performance-counters-in-mcsconfig)

![image.png](/.attachments/image-a5743e67-dfe8-434c-8b1e-70ac8a9b23c5.png)

This is what successful looks like:
- Success = True
- DataItemReadCount = X (cached X record(s))
- DataItemWriteCount = X (sent X record(s))

![image.png](/.attachments/image-f32647b4-b905-4fa5-aba3-91bfad7fb850.png)

# Scenario: Windows Event Log
```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Tables\MaQosEvent.csv```

Filter the Object column (column G) to include the local store name of the Windows events.
To identify the local store name for the Windows events, see [How-to�review�agent�instruction�set�-�Scenario:�Windows Event Log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590096/AMA-Windows-HT-Review-agent-instruction-set?anchor=scenario%3A-windows-event-log)

![image.png](/.attachments/image-1004e632-8878-4a68-9f6f-7e1358612341.png)

This is what successful looks like:
*   Success = True
*   DataItemReadCount = X (cached X record(s))
*   DataItemWriteCount = X (sent X record(s))

![image.png](/.attachments/image-da7e13a6-41b6-4d40-bd03-c1fd23357475.png)

# Scenario: IIS Logs

`...\AgentTroubleshooterOutput-{date}\AgentDataStore\Tables\MaQosEvent.csv`

Filter the Object column (column G) to include the local store name of the IIS Logs objects.  
To identify the local store name for the IIS Logs, see�[How-to�review�agent�instruction�set�-�Scenario:�IIS Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590096/AMA-Windows-HT-Review-agent-instruction-set?anchor=scenario%3A-iis-logs)

![image.png](/.attachments/image-46d7fa12-b9ae-466d-911c-7035c7e7d8e1.png)

This is what successful looks like:
*   Success = True
*   DataItemReadCount = X (cached X record(s))
*   DataItemWriteCount = X (sent X record(s))

![image.png](/.attachments/image-cb311399-ec98-4ee1-bfa2-24b9547547f0.png)
