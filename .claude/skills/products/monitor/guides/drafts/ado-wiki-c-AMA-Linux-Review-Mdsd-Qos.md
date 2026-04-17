---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Review mdsd.qos"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Review%20mdsd.qos"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The agent collects data and records the number of events it attempted to send to a destination, how long it took to send, and whether or not the sending was successful. This is recorded in the MAQosEvent log. 

# Prerequisites
This how-to assumes that you've already [Run the agent troubleshooter](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-linux?tabs=redhat%2CGenerateLogs#run-the-troubleshooter) and have those logs.

# Understanding the data
Explanation of the columns found in the mdsd.qos file:
- **Time:** The time this operation (and the success/fail result) was recorded (15 minute increments)
- **Operation:** The name of the operation being run
- **Object:** The local store name (for example c18085935537435050465_15090178735994951366)
- **TotalCount:** The count of all attempted runs for this operation
- **SuccessCount:** The count of all *successful* runs for this operation
- **Retries:** The count of all *retried* runs for this operation
- **AverageDuration:** The average duration (in milliseconds) of all runs for this operation
- **AverageSize:** The average size (in bytes) of all runs for this operation
- **AverageDelay:** The average duration (in milliseconds) of all runs for this operation
- **TotalSize:** The total (sum) size (in bytes) of all records in all runs for this operation
- **TotalRowsRead:** The total (sum) number of read (inbound to agent) records in all runs for this operation
- **TotalRowsSent:** The total (sum) number of successfully sent (outbound to destination) records in all runs for this operation
    - The TotalRowsSent may not always match the exact TotalRowsRead and this is not necessarily an issue. It would be considered an issue if it was consistently different.

# Scenario: Heartbeat
```...\mdsd\logs\mdsd.qos```

This is what successful looks like:
- The TotalCount and SuccessCount are equivalent

![image.png](/.attachments/image-b07f6af1-17d4-45fc-899a-37a1fbe4f681.png)


# Scenario: Microsoft-Syslog
```...\mdsd\logs\mdsd.qos```

This is what successful looks like:
- The TotalRowsRead and TotalRowsSent are equivalent

![image.png](/.attachments/image-f9ea1176-0c15-4656-bb19-2d2be29e2e7c.png)

# Scenario: Microsoft-CommonSecurityLog

This is the same as the above scenario for Microsoft-Syslog, except that the **LINUX_SYSLOG_BLOB** will be **SECURITY_CEF_BLOB** instead.

#Scenario: Text Logs
```...\mdsd\logs\mdsd.qos```

This is what successful looks like:
- The TotalRowsRead and TotalRowsSent are equivalent (in some scenarios, we may see a few records "catch up" in the next batch of uploaded records - this is fine and expected). 

![image.png](/.attachments/image-97f5ba9c-d2ea-4b18-8515-c730992998f9.png)
