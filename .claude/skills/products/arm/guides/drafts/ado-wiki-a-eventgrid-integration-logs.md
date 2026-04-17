---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Get Logs/EventGrid integration"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FTroubleshoting%20Guides%2FGet%20Logs%2FEventGrid%20integration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## SystemTopics Dispatcher logs

This query logs the process that pushes the events to EventGrid. This process runs in batches (it processes multiple requests at once) and does not provide any SLA into how long after the operation has been completed it will be pushed to EventGrid.

``` csharp
let activity = ""; //activityId of the operation to generate the event from
let timeStart = datetime(2021-04-07 13:00); //Start of time window
let timeEnd = datetime(2021-04-07 17:10); // End of time window
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("General","DispatcherTraces")
| where PreciseTimeStamp between (timeStart..timeEnd)
| where operationName startswith "EventPublishingDispatcher.PublishEvents.SystemEventPublisher" // System-Topic Pipeline
| where message has activity
| project PreciseTimeStamp, dispatcherName, SourceNamespace, ActivityId, operationName, message, queueMessage
| sort by PreciseTimeStamp asc
```
