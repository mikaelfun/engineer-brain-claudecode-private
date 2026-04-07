---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/How-To/How to get the blob paths of the emitted logs by resource provider"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/How-To/How%20to%20get%20the%20blob%20paths%20of%20the%20emitted%20logs%20by%20resource%20provider"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

<div style="border:6px solid; margin-bottom:20px; padding:10px; min-width:500px; width:75%; border-radius:10px; color:black; background-color:#7BD689">

Try the new Diagnostic Settings dashboard for troubleshooting Diagnostic Settings cases:
<span style="background-color: #DDFFE2">(https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1666481/-TSG-Diagnostic-Settings-Telemetry)</span>

</div>

**Section 1 :**
**Scenario:**
Customer raises a support ticket indicating that platform logs for their resource are missing. When CSS creates a collab case with respective resource provider CSS team or PG to check  if RP as emitted the missing log or not.
It is often asked - how to get the blob paths which are consumed/exported by OBO/Shoebox/diagnostic settings.

For more understanding . please refer to the training video : https://microsoft-my.sharepoint.com/personal/vikamala_microsoft_com/_layouts/15/stream.aspx?id=%2Fpersonal%2Fvikamala_microsoft_com%2FDocuments%2FRecordings%2FHow%20to%20get%20the%20blob%20paths%2Emp4&ga=1

**How to:**
1. Please run the below query , if the diagnostic setting exists for the resource id.

**For subscription level resources :**

Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://azureinsights.kusto.windows.net/Insights
```
RegistrationTelemetry
| where resourceId =~"<replace with resource id>"
| summarize max(PreciseTimeStamp) by subscriptionId, resourceId,firstTagValue,usingStorage,usingOms,usingServiceBus,dataType,name,categories,omsWorkspaceResourceId,customerStorageAccountId,storageAccount,serviceIdentity,workspaceId,metricExtractionJobInfo
```

**For Tenant level resources :**

Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://azureinsights.kusto.windows.net/Insights
```
RegistrationTelemetry
| where isTenantLevel==true
| where tenantId =~"replace with tenant id"
| summarize max(PreciseTimeStamp) by subscriptionId, resourceId,firstTagValue,usingStorage,usingOms,usingServiceBus,dataType,name,categories,omsWorkspaceResourceId,customerStorageAccountId,storageAccount,serviceIdentity,workspaceId,metricExtractionJobInfo
```
2. From the resultant dataset, please copy the following values from the columns 1. FirstTagValue 2. ResourceId 3. ServiceIdentity.

3. Now, lets find from which tables the OBO/Shoebox/diagnostic settings feature is receiving data.

Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://azureinsights.kusto.windows.net/Insights
```
InputBlobFirstTagMetadata
| where PreciseTimeStamp > ago(1d)
| where firstTagValue =~"<replace with first tag value>" or firstTagValue =~"<replace with resource id>"
| where serviceIdentity =~"<replace with ServiceIdentity"
| where recordCountByCategories contains "<replace with category of the missing data>"
| project PreciseTimeStamp,firstTagValue,eventEnvironment,eventNamespace,eventTableName,SourceNamespace, recordCountByCategories
```
**Please Note:** 

**For some of the tables , we might have access. So, you can go-ahead and query to the blob paths. but, most likely we might NOT. You will need help from RP PG team**

4. From the resultant dataset, please head to Jarvis. From example shown below, 
![image.png](/.attachments/image-83ca9c6d-1863-4578-a34c-8e7bf622dc72.png)

In Jarvis. https://portal.microsoftgeneva.com/s/8C224CEC
1. For **Endpoint** field : Set the value from "EventEnvironment" column
2. For **NameSpace** Field : Set the value from "EventNamespace" column.
3. For **Event to search**  field : Set the value from "eventTableName" column. you can set one or more tables depending on the results obtained above.
4. **Time Range** : to be determined when the log was generated. customer might tell you estimated timeline.
5. **Scoping conditions** : you can leave unselected. but, can be used to further refining the query later.
6. **Filtering conditions** : Select "KQL: Add the below lines(this will get us the blob paths) + more filtering conditions.
source
| extend blob = blob_name()
****************************************************************************************************************************************
**Section 2**
**Get the blob paths using the co-rrelation id.**
If you have obtained the co-rrelation id from the log analytics side. please use the below query to get the blob paths.

Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://azureinsights.kusto.windows.net/Insights
```
let odsCorrelationId = "<replace with co-rrelation id>";
let odsTimestamp = toscalar(ODSPostTelemetry | where correlationId == odsCorrelationId | project PreciseTimeStamp | take 1);
ODSPostTelemetry
| where correlationId == odsCorrelationId
| join (InputBlobFirstTagMetadata) on $left.firstPartyBlobPath == $right.blobPath
| distinct odsTimestamp, eventEnvironment, eventNamespace, eventTableName, SourceNamespace,blobPath
```
********************************************************************************************************************************

**When did the RP upload the blob to Geneva**
```
NormalizerMessageTelemetry
 | where PreciseTimeStamp  between (todatetime("01/10/2024 00:00") ..todatetime("01/11/2024 00:00")) /Change this
 | where blobPath == "" /Change this
 | where Role =~"OnBehalfWorker"
 | extend mc = parse_json(tostring(substring(messageContent, 3)))
 | project PreciseTimeStamp, maxRecordTimeInBatchUploadedByGenevaAgent = blobGenerationEndTime, timeAtWhichAgentSentTheBlobToGeneva = mc["OriginalEventHubEnqueueTimeUtc"]
```
********************************************************************************************************************************
FAQ:
**1. What to do in the case of the export log is malformed(invalid json).**
Ans : Diagnostic setting team feature doesn't modify any records obtained from RP. So, it is upto the RP PG team to identify the records which are malformed and applying of the fix. You can also ask the customer to provide the malformed json and you can extract some pieces of information which can used by PG to identify the records on their side to speed up the investigation.

Questions:
1. Reach out to vikamala@microsoft.com or jfanjoy@microsoft.com or nicholas.convery@microsoft.com


