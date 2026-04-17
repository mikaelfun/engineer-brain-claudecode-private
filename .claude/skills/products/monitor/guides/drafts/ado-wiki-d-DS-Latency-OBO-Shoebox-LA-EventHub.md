---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/Troubleshooting Guides/Troubleshooting Diagnostic Settings Latency (from OBO, Shoebox, to LA workspace, Event Hub)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/Troubleshooting%20Guides/Troubleshooting%20Diagnostic%20Settings%20Latency%20%28from%20OBO%2C%20Shoebox%2C%20to%20LA%20workspace%2C%20Event%20Hub%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#7BD689">

Try the new Diagnostic Settings dashboard for troubleshooting Diagnostic Settings cases:
<span style="background-color: #DDFFE2">(https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1666481/-TSG-Diagnostic-Settings-Telemetry)</span>

</div>

[[_TOC_]]


# Scenario
---
This TSG should help in investigating the latency in exporting the logs to Log analytics workspace


<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:yellow">

**Important** 

If you are investigating an issue where a customer reports latency in exporting Databricks-related logs via Diagnostic Settings, first use the ICM below to review the required next steps: https://portal.microsofticm.com/imp/v5/incidents/details/21000000967836/summary.
- Run this TSG as part of your investigation. If the results show **no latency**, do **not** engage the Diagnostic Settings ICM queue.
- In such cases, work directly with the Databricks Resource Provider (RP) through CSS collaboration.
- Any escalation to the PG via ICM without concrete investigative findings will be mitigated without further review

Any escalation via ICM to PG without concrete investigation will be mitigated without further investigation. 
</div>

# Latencies documented in public docs
---
Rule:
**Please ensure that the latencies reported by the customer are consistently higher than those documented in the public materials.**

https://learn.microsoft.com/en-us/azure/azure-monitor/logs/data-ingestion-time#azure-metrics-resource-logs-activity-log

# Background
---
Our primary worker role export logs promptly upon receiving them. However, if log export encounters failure for a customer record, the primary worker role ceases exporting the records. Subsequent retry attempts are then managed by the secondary role, introducing latency. The export process allows for a total of four attempts with specific frequency intervals.

1. Primary Role - No latency from the time we receive the logs from RP.
2. Secondary Role - Frequencies given below
   Retry Attempt one - Every 10 mins 
   Retry Attempt two- Every 1 Hour
   Retry Attempt three - Every 12 Hour

Note: The term "Role" signifies the worker process which exports the log. 

# Potential latency causes
---
1. The destination being unreachable for any reason, causing the retry workers to reupload the logs from 10 minutes to 12 hours after the initial/primary attempt.
2. Upstream: Latency induced by RP.
3. Downstream: Latency in ingestion via LA.
4. Latency induced by OBO itself for any cause (high volume, outage, etc).


# How to determine Log Analytics latency.
---
Requirements :
1. Log Analytics Workspace ID - not the URI
2. Timeframe where latency is seen.
3. Resource Id on which the diagnostic setting is created. 
4. Kusto permissions to access: AzureInsights Kusto cluster. request here https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azmonessenti-b503

Use this Kusto query to determine latency

https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAIWQX2vCMBTF3wW%2fw6UvtlA1rVbswLe9DAaT6ftI0iuGNYmkV12H7LPvdn9Q2cZCkoec5PzOycPtaukbWmONFim0%2fd4JjlsMCMuA2jS4NhZXJO0OFNIR0UFMvpKExEIciWzMMxf5FIS4ESJKRqNLPRtPrtTkDDj68NzspMa7ChZvUa5FOZ8IPcwnRTGcqqoczrOCt5ma5xv2UDiLutf4Qugq8MrfM8bpFhbwDXyqzGYTD6xxe8JB%2bqNEChfhjGswkPGukz%2bTfXk7H6yszSuG%2fxF%2fGl5J8iBNLVWN3yzgcYJmb60MDIIdBo2OTI1NfK6WQlnwKhNQLSjj4l8KdfYZx0mYyPyD6X60s6I2ffQ1dqwTBO6F4eO23spAfNrvvQPiZqPx%2fgEAAA%3d%3d&web=0
```
ODSPostTelemetry
| where PreciseTimeStamp between (datetime(2024-01-01 00:00:00) .. datetime(2024-01-03 00:00:00)) //adjust datetime
| where workspaceId =~"" //Input Workspace id
| where resourceId =~"" //Input resource id
//| where dataType contains "Metrics" or dataType contains "logs" // IMP : Use this condition depending on which datatype you are investigating
| extend oboLatency = datetime_diff('minute', PreciseTimeStamp, todatetime(insertionTime))
| extend normalizerLatency = datetime_diff('minute', todatetime(insertionTime), todatetime(availableTime))
| summarize percentiles(oboLatency, 95, 99), percentiles(normalizerLatency, 95, 99)  by bin(PreciseTimeStamp, time(1min)), strcat(serviceIdentity, "-", Role)
| render timechart
```
![image.png](/.attachments/image-97be00d3-6b11-4b31-a919-be7a53a62052.png)

Use this kusto query specific for Microsoft AAD or to search for any other tenant level diagnostic setting, such as Sign In, Audit, MicrosoftGraphActivity logs
- Find AAD tenant Id in [Jarvis](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480517/How-to-get-Azure-Active-Directory-Tenant-Id-from-Azure-Subscription-Id-in-Jarvis)
- Find AAD tenant Id in [ASC](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1082153/How-to-get-Tenant-level-diagnostic-settings-for-an-Azure-tenant-from-Azure-Support-center)

```
let resource="########-####-####-####-############"; //AAD TenantID
let workspaceId="########-####-####-####-############"; //LA workspace Id
ODSPostTelemetry
| where PreciseTimeStamp between (datetime(2024-01-01 00:00:00) .. datetime(2024-01-03 00:00:00)) //adjust datetime
| where resourceId contains resource
| where workspaceId =~ workspaceId
| where isFailed == false
| where serviceIdentity contains "TENANT_MICROSOFT.AADIAM"
| where dataType contains "Logs"
| extend oboLatency = datetime_diff('minute', PreciseTimeStamp, todatetime(insertionTime))
| extend normalizerLatency = datetime_diff('minute', todatetime(insertionTime), todatetime(availableTime))
| summarize percentiles(oboLatency, 95, 99), percentiles(normalizerLatency, 95, 99) by category, bin(PreciseTimeStamp, time(1h))
| render timechart

```


Read below to understand the chart

1. On the chart, you will notice for most of the times the latency to export is below is ~3mins.
However, there are some spikes where we can see latency is close to ~12mins.
**Note: If you use the "ResourceId" filter in the above query (below given step 2 and step3 are NOT required)**

**If you don't see any latency (meaning no spikes in the chart), then you should check with Log Analytics Ingestion to investigate the latency or if you observe "normalizerLatency" column as high, this determines the latency is induced upstream, then you should work with RP.**

2. On the right side of the chart, you will also notice a number of the resource types (service Identity) exporting logs to this workspace.
3. If you start unchecking them, eventually, you will see which resource type is causing the major latency. 
this should match with customer issue. For example, here we see "AzureFirewall" records are delayed. 

![image.png](/.attachments/image-150d7993-9058-4b65-9686-536931117c1a.png)

4. Next step is to find out which role is causing the latency.  Run the query
https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAIVRTWvCMBi%2bF%2fofXnqxhWrTasUOvO0iDCbT%2b0jbV8zWJiVJdR2y376E6axzbiHJIQ%2fv85XH%2b9VSKL3GCmvUsnOdA%2by3KBGWEgumcM1qXGlaN5Cj3iNy8LUoqUZtAN8jcWR2QpIJEHJHiBeMRn08jsYXaHAW2Av5qhpa4KKE%2bYeXFCSbjUkxTMZpOpzkZTacxam5pvks2RiOHKee60TRaV6iEq08jXsQRQvetPr7HVhpxfBNIy9B5OLBuOJFB3M4%2bXsu2WbjD2rGW42D8CpzCL0sjCuUmglu4a8gR24uZE0r9o7yf4mbhBcQ3VFW0bzCs1YjxQsW%2btrjOVkIT6LC0LDumO0FuWa6%2b4M4vOnGKgpZooS863dXoirsJ4BdB1BtXVNpkkODpnKjV6Hy%2b46y1JwssDQ54%2f4vDVvx2PQTmAp%2bWrd5jnIH87HcGrIDxZZK7TrgOp9mrXfHwQIAAA%3d%3d&web=0
```
ODSPostTelemetry
| where PreciseTimeStamp between (todatetime("01/01/2024 00:00")..todatetime("1/3/2024 00:00"))
| where workspaceId =~""
//   | where resourceId =~"" //Input resource id
| extend oboLatency = datetime_diff('minute', PreciseTimeStamp, todatetime(insertionTime))
| extend normalizerLatency = datetime_diff('minute', todatetime(insertionTime), todatetime(availableTime))
| project PreciseTimeStamp,oboLatency, Role,serviceIdentity, todatetime(availableTime),todatetime(insertionTime)
| order by oboLatency desc
//   | summarize percentiles(oboLatency, 95, 99) by bin(PreciseTimeStamp, time(1min)), strcat(serviceIdentity, "-", Role)
//   | render timechart
```


![image.png](/.attachments/image-0f1d1555-8143-4d62-ba25-304786f5f24a.png)
 
5. In example above, "Role" column indicates the export was handled by the "OnBehalfWorkerSecondary" which means at the first attempt by the primary role "OnBehalfWorker" the service failed to export, which may or may not be related to workspace of this customer or any other destination.  Hence, the re-try was handed over to retry role which "OnBehalfWorkerSecondary"

6. Note : The behavior in this example is by design, as the Secondary worker(re-try jobs) will always add some amount of latency, due to being the retry role. 

Reason : Resource Logs are based on a store and forward architecture designed to move petabytes of data per day affordably at scale. It has built-in redundancy and retries across the platform. The side effects of having the re-try logic is where the latency is introduced and which is expected in the large scale export.

**7. However, if you notice latency being induced by the primary role "OnBehalfWorker" , then its need to investigated by the PG with some exceptions.**
If there is intermittent latency, then its by design. due to volume , our service might take some extra to export.
Only in the cases , where you see consistent(in last 5days) latency are to escalated via ICM otherwise you should set the expectation with customer.

**Example of intermittent latency. if you see this behavior then, its by design**
![image.png](/.attachments/image-e79a0cc6-dee3-447c-9b4e-0774336901c6.png)

# How to determine Event Hub latency
---

One of main causes of latency is event hub is being throttled. So, if the customers destination is configured as event hub and they state - they are seeing latency. Use the below query to see , list of errors while exporting to event hub via OBO.

Most important thing to see in the below chart is "Throttled Error message" . 
So, in order for the customer to move away from error. they will need scale out their event hub by increasing their TU's.
You should work with Event HUB CSS team via collab and ask for recommendation. 
**Note: At this stage, you should NOT create an ICM to diagnostic settings queue**

https://azureinsights.kusto.windows.net/Insights?query=H4sIAAAAAAAEAHWRT0vEQAzF74LfIfS0Czvs%2f61ePAiCgixiq%2fd0Jm0H2pmSyexS8cPbFaFF9Jq893vh5eFETh5jkZEz9yi6zqmhloT766tPONfEBC9M2gbKbUuZYNvBHWDlZ6mZj5rScpAcq3dsIoH2TtC6AEm53ePhNt2pwyot1S41O3WzMakqy%2b3apEbvt7hPYLkEXaOrCKS2YaTSz3VHbCl0qKdkOkkdCxeUK4Lq2KgzBaHIviO12vzPNCiY990U1fgqJKNCo1DluZ8ojt49OSFGLfZEb4E4s9Uwer44%2f4gKsW2R7cclJTqZzaHooUTbRKZXwuDdAgrrZr%2brXcC6%2fm6Vh38QgwyLAc3yBeb2cxWoAQAA&web=0

EventHubSendBatchTelemetry
| where PreciseTimeStamp > ago(7d) // change this
| where firstTagValue contains "" // change this
| where eventHubNamespace contains "" // change this
| where dataType contains "logs"
| where category contains "" // change this
| summarize count() by failureReason, bin(PreciseTimeStamp, 1h)
| render timechart

![image.png](/.attachments/image-5a7f4370-844c-4735-b131-550c9462c47a.png)