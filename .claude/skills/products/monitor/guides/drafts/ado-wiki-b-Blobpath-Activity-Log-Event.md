---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/How-To/How to get blobpath for Activity Log Event"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/How-To/How%20to%20get%20blobpath%20for%20Activity%20Log%20Event"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Before You Begin
---
Note this guide is for locating the blobpath of Activity Log Events which have been sent for export via a Diagnostic Setting, and is specific to Activity Log Events whereby Azure Monitor is functionally acting as the originating Resource Provider for the data. The majority of Activity Logs can have their blobpaths located this way, but this process **does not** apply for finding the blobpath of resource-specific Diagnostic Logs. 

# Instructions

Locate first the correlationId and the timestamp of the Activity Log Event that we will be finding the blobpath for-- this will be in that Activity Log Event as the "correlationId" field and the "submissionTimestamp" in the raw JSON.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**

If there are multiple events (such as Started, Accepted, Succeeded) and you need to check for one of them specifically, the events can be differentiated by the "eventDataId" which is captured as "eventInstanceId" in the ARM Kusto logs.
</div>

Once you have the correlationId of the Activity Log Event we are looking for and the timestamp, we must use it to identify the "SourceNamespace" and the "ActivityId" in ARM's EventServiceEntries Kusto logs. 

Utilize the correlationId and the timestamp in the following example query, and retrieve the SourceNamespace and the ActivityId related to this event.

This query will need to be run from cluster('armprodgbl.eastus.kusto.windows.net'), database('ARMProd')

:::template /.templates/Launch-Kusto.md
:::

```

let corrId = " <correlation ID goes here> ";
let timestamp = datetime(2023-01-04T19:05:42Z); //copy the timestamp from the Activity Log and paste here, such that it autoformats like this example
Unionizer("Requests","EventServiceEntries")
| where PreciseTimeStamp between (startofday(timestamp) ..endofday(timestamp))
| where correlationId =~ corrId
| project PreciseTimeStamp, operationName, status, ActivityId, SourceNamespace

```
Once we have the SourceNamespace and the ActivityId, we want to utilize the SourceNamespace, ActivityId, and the timestamp in the following DGrep link: https://portal.microsoftgeneva.com/s/6129EA1E

1. Replace the "Namespace" option with the value of the "SourceNamespace" field returned by the above query. 
2. Replace the timestamp in the "Time range" menu with the value of the "PreciseTimeStamp" field returned by the above query.
3. Replace the "ActivityId" in the filtering conditions with the value of the "ActivityId" field returned by the above query. 

![image.png](/.attachments/image-0f003382-8891-49d9-be12-742616948a25.png)

# Reviewing the results

  After the data has been inserted, run the query and retrieve the value(s) from the field named "bn" for the record from ShoeboxEvent-- this is the blobpath.  

  There may be two blobpaths from 4 records like depicted in the example. 
   * If investigating data missing from a Diagnostic Settings export (Log Analytics, Storage, Event Hub), only use the record where the "TaskName" field is "ShoeboxEvent". 
   * If investigating data missing from the Activity Logs API itself (not the above options) use the record where the "TaskName" field is "EventServiceEntry".

If neither event is present, consult a SME. 

Once you have this data, you are able to proceed through [How to get OnBehalfOf Blob Processing History](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-OnBehalfOf-blob-processing-history-for-an-Azure-resource-in-Kusto)

