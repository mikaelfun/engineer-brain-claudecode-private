---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/How-To/How to check for errors sending data to target endpoints for an Azure resource in Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/How-To/How%20to%20check%20for%20errors%20sending%20data%20to%20target%20endpoints%20for%20an%20Azure%20resource%20in%20Kusto"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

:::template /.templates/Note-TraceLoggingDelay.md
:::

<div style="border:6px solid; margin-bottom:20px; padding:10px; min-width:500px; width:75%; border-radius:10px; color:black; background-color:#7BD689">

Try the new Diagnostic Settings dashboard for troubleshooting Diagnostic Settings cases:
<span style="background-color: #DDFFE2">(https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1666481/-TSG-Diagnostic-Settings-Telemetry)</span>

</div>

[[_TOC_]]

# Before You Begin
---
In order to query for diagnostic settings telemetry, you will need to ensure you have installed Kusto Explorer and added a connection for the **Azureinsights** Kusto cluster (or appropriate cluster for the cloud you are working with).

For details on adding Kusto clusters, see article [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

# Querying for errors sending data to target endpoints
---
1. Identify the resource for which you need to check diagnostic telemetry.

   * For Azure Active Directory data, this would be the Tenant Id alone, supplied as simply the tenant Id.

      [How to get Azure Active Directory Tenant Id from Azure Subscription Id in Jarvis](/Azure-Monitor/How%2DTo/Jarvis/How-to-get-Azure-Active-Directory-Tenant-Id-from-Azure-Subscription-Id-in-Jarvis)

   * For Azure subscription data, this would be the resource Id of the Azure Subscription, supplied such as "/subscriptions/*********-****-****-****-************".

   * For Azure resources, this would be the Azure resource Id.

      [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)

1. Open Kusto Explorer or Azure Data Explorer connecting to the **Insights** database of the **AzureInsights** cluster (or appropriate database and cluster for the cloud you are working with).

   [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer)

1. Copy and paste the appropriate query depending on whether the target destination is Log Analytics, Storage or Event Hub.  Replace AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE with the desired Azure resource, subscription or tenant id and set the **startTime** and **endTime** values to match your desired time window, then click **Run (F5)**.

1. In the returned data for any such query, review the failureReason that is embedded into the resultMatrix. It is entirely possible that no failures will be detected.
   * Where this value is "Success", there are not relevant errors after all retries.
   * Where this value is anything other than success, it denotes the error code returned by the service attempting and failing to write to the destination.

![image.png](/.attachments/image-e9ed52a7-0792-44f3-8268-cbceb8dba1d7.png)
&nbsp;




# Target Endpoint = Log Analytics

<details closed>
<summary><del>Any Errors (includes transient failures, retries)</del></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

   let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
   let startTime = todatetime(ago(1d));
   let endTime = todatetime(now());
   ODSPostTelemetry
   | where PreciseTimeStamp between (startTime .. endTime)
   | where resourceId =~ resource or customerFirstTagId =~ resource or resourceId =~ strcat("/subscriptions/", resource)
   | where isFailed == 1
   | project PreciseTimeStamp, availableTime, ActivityId, serviceIdentity, dataType, category, attempt = queueMessageDequeueTimes, sendRetryCount = postRetryCount, failureReason = iif(isempty(failureReason), "Success", failureReason), correlationId, workspaceId, odsDataTypeId, firstPartyBlobPath
   | sort by PreciseTimeStamp asc 
          
   ```
</div>
</details>

<details open>
<summary><b>Relevant Errors (failures even after retries)</b></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
let startTime = ago(2d);
let endTime = now();
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where resourceId =~ resource or firstTagValue =~ resource
| summarize make_set(firstTagValue);
ODSPostTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where customerFirstTagId in (firstTagValues)
| summarize arg_min(PreciseTimeStamp, *), min(isFailed) by firstPartyBlobPath, category, numberOfRecords, odsDataTypeId, workspaceId
| extend resultMatrix = strcat(workspaceId, "-", category, "-", case(min_isFailed == 0, "SUCCESS", strcat("FAILED-",failureReason)), "-", odsDataTypeId)
| summarize sum(numberOfRecords) by bin(PreciseTimeStamp, 1h), resultMatrix
| render timechart 
          
   ```
</div>
</details>

---

&nbsp;







# Target Endpoint = Storage

<details closed>
<summary><del>Any Errors (includes transient failures, retries)</del></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

   let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
   let startTime = todatetime(ago(1d));
   let endTime = todatetime(now());
   StorageAccountAppendBlockTelemetry
   | where PreciseTimeStamp between (startTime .. endTime)
   | where resourceId =~ resource or firstTagValue =~ resource or resourceId =~ strcat("/subscriptions/", resource)
   | where isFailed == 1
   | project PreciseTimeStamp, availableTime, ActivityId, serviceIdentity, dataType, category, attempt = queueMessageDequeueTimes, sendRetryCount = depthOfRecursion, failureReason, customerStorageAccountName, customerContainerName, firstPartyBlobPath
   | sort by PreciseTimeStamp asc 
               
   ```
</div>
</details>

<details open>
<summary><b>Relevant Errors (failures even after retries)</b></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
let startTime = ago(2d);
let endTime = now();
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where resourceId =~ resource or firstTagValue =~ resource
| summarize make_set(firstTagValue);
StorageAccountAppendBlockTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where firstTagValue in (firstTagValues)
| summarize arg_min(PreciseTimeStamp, *), min(isFailed) by firstPartyBlobPath, category, numberOfRecordsInBlock, customerContainerName, customerStorageAccountName
| extend resultMatrix = strcat(customerStorageAccountName, "-", category, "-", case(min_isFailed == 0, "SUCCESS", strcat("FAILED-",failureReason)), "-", customerContainerName)
| summarize sum(numberOfRecordsInBlock) by bin(PreciseTimeStamp, 1h), resultMatrix
| render timechart
          
   ```
</div>
</details>

---

&nbsp;




# Target Endpoint = Event Hub

<details closed>
<summary><del>Any Errors (includes transient failures, retries)</del></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

   let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
   let startTime = todatetime(ago(1d));
   let endTime = todatetime(now());
   EventHubSendBatchTelemetry
   | where PreciseTimeStamp between (startTime .. endTime)
   | where resourceId =~ resource or firstTagValue =~ resource or resourceId =~ strcat("/subscriptions/", resource)
   | where isFailed == 1
   | project PreciseTimeStamp, availableTime, ActivityId, serviceIdentity, category, attempt = queueMessageDequeueTimes, sendRetryCount, failureReason, eventHubNamespace, eventHubName, firstPartyBlobPath
   | sort by PreciseTimeStamp asc 
                   
   ```
</div>
</details>

<details open>
<summary><b>Relevant Errors (failures even after retries)</b></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
let startTime = ago(2d);
let endTime = now();
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where resourceId =~ resource or firstTagValue =~ resource
| summarize make_set(firstTagValue);
EventHubSendBatchTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where firstTagValue in (firstTagValues)
| summarize arg_min(PreciseTimeStamp, *), min(isFailed) by firstPartyBlobPath, category, numberOfRecords, eventHubName, eventHubNamespace
| extend resultMatrix = strcat(eventHubName, "-", category, "-", case(min_isFailed == 0, "SUCCESS", strcat("FAILED-",failureReason)), "-", eventHubNamespace)
| summarize sum(numberOfRecords) by bin(PreciseTimeStamp, 1h), resultMatrix
| render timechart
          
   ```
</div>
</details>

---

&nbsp;

# Target Endpoint = Partner Solution (aka Marketplace)**
You may want to reffer to this document. 

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/633358/Troubleshooting-Export-to-Liftr-destination-via-diagnostic-settings

---
&nbsp;

# Reviewing the results
---
Regardless of which query is executed, the results are structured the same and represent any relevant errors that have been encountered while attempting to send data from OBO to the target endpoint. "Relevant" meaning errors that persist after retries, and prevent data from being written to the endpoint.

See the table below for descriptions of the data returned.

| Property | Description |
|:---------|:------------|
| PreciseTimeStamp | The timestamp at which the OBO service attempted to send the data to the target destination. |
| availableTime | The timestamp at which the data became available in OBO to process. |
| ActivityId | The activity identifier assigned by OBO when attempting to send the data to the target destination. |
| serviceIdentity | The Azure service from where the data originated. |
| dataType | The type of data being processed: Logs or Metrics. |
| category | The data category of the records being processed. |
| attempt | The attempt number of the processing.  The system will attempt to send the data to the target destination up to 4 times based on a scheduled wait interval. |
| sendRetryCount | The number of retry efforts during the processing attempt.  This is different from attempt as it is a retry built into the write operation seeking to handle rapidly resolving transient failures rather than a scheduled retry attempt. |
| failureReason | An identifier of the reason for the failure to send the data to the target destination. |
| correlationId | (Log Analytics Only) A unique identifier provided as part of the write operation to Log Analytics ODS endpoint.  This can be provided to the Log Analytics ODS PG if we believe that a failure is caused by the ODS service. |
| workspaceId | (Log Analytics Only) The Log Analytics workspaceId where the data is attempting to be sent. |
| odsDataTypeId | (Log Analytics Only) The data type (category) as recognized by Log Analytics. |
| customerStorageAccountName | (Storage Only) The storage account where the data is attempting to be sent. |
| customerContainerName | (Storage Only) The blob container in the storage account where the data is attempting to be sent. |
| eventHubNamespace | (Event Hub Only) The event hub namespace where the data is attempting to be sent. |
| eventHubName | (Event Hub Only) The event hub name in the event hub namespace where the data is attempting to be sent. |
| firstPartyBlobPath | The blob that was being processed with data attempting to be sent to the target destination. |

**Example:**

```kusto

let resource = "*********-****-****-****-************";
let startTime = ago(5d);
let endTime = now();
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where resourceId =~ resource or firstTagValue =~ resource
| summarize make_set(firstTagValue);
ODSPostTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where customerFirstTagId in (firstTagValues)
| summarize arg_min(PreciseTimeStamp, *), min(isFailed) by firstPartyBlobPath, category, numberOfRecords, odsDataTypeId, workspaceId
| extend resultMatrix = strcat(workspaceId, "-", category, "-", case(min_isFailed == 0, "SUCCESS", strcat("FAILED-",failureReason)), "-", odsDataTypeId)
| summarize sum(numberOfRecords) by bin(PreciseTimeStamp, 1h), resultMatrix
| render timechart 

```

![Screenshot 2024-02-28 112045.png](/.attachments/Screenshot%202024-02-28%20112045-1aa51e45-d221-475e-9b6a-aafd1e252123.png)


