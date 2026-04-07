---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/How-To/How to get OnBehalfOf blob processing history for an Azure resource in Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/How-To/How%20to%20get%20OnBehalfOf%20blob%20processing%20history%20for%20an%20Azure%20resource%20in%20Kusto"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

:::template /.templates/Note-TraceLoggingDelay.md
:::

[[_TOC_]]

# Before You Begin
---
In order to query for diagnostic settings telemetry, you will need to ensure you have installed Kusto Explorer and added a connection for the **Azureinsights** Kusto cluster (or appropriate cluster for the cloud you are working with).

For details on adding Kusto clusters, see article [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

# Querying for blob processing history for an Azure resource
---
1. Identify the resource for which you need to check diagnostic telemetry.

   * For Azure Active Directory data, this would be the TenantId.

      [How to get Azure Active Directory Tenant Id from Azure Subscription Id in Jarvis](/Azure-Monitor/How%2DTo/Jarvis/How-to-get-Azure-Active-Directory-Tenant-Id-from-Azure-Subscription-Id-in-Jarvis)

   * For Azure subscription data, this would be the SubscriptionId.

   * For Azure resources, this would be the Azure resource id.

      [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)

1. Identify the blob path for which you need to check diagnostic telemetry.

   This data can come from different sources:

   - Provided by Azure resource provider as proof that they successfully sent data to the OnBehalfOf (OBO) service.
   - Captured while checking for processing errors.
   
      [How to check for errors sending data to target endpoints for an Azure resource in Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-check-for-errors-sending-data-to-target-endpoints-for-an-Azure-resource-in-Kusto)

1. Open Kusto Explorer or Azure Data Explorer connecting to the **Insights** database of the **AzureInsights** cluster (or appropriate database and cluster for the cloud you are working with).

   [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer)

1. Copy and paste the appropriate query depending on whether the target destination is Log Analytics, Storage or Event Hub.  Replace AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE with the appropriate URI. This will be either the Azure Resource ID of the resource writing the data, or the subscription Id or tenant Id. Then replace BLOBPATHGOESHERE with the desired blob path, then click **Run (F5)**.

   **Target Endpoint = Log Analytics**

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

   let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
   let blobPath = "BLOBPATHGOESHERE";
   ODSPostTelemetry
   | where firstPartyBlobPath =~ blobPath
   | where resourceId =~ resource or customerFirstTagId =~ resource or resourceId =~ strcat("/subscriptions/", resource)
   | project PreciseTimeStamp, availableTime, ActivityId, serviceIdentity, dataType, category, attempt = queueMessageDequeueTimes, sendRetryCount = postRetryCount, isFailed, failureReason = iif(isempty(failureReason), "Success", failureReason), correlationId, workspaceId, odsDataTypeId
   | sort by PreciseTimeStamp asc 
    
   ```

   **Target Endpoint = Storage**

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

   let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
   let blobPath = "BLOBPATHGOESHERE";
   StorageAccountAppendBlockTelemetry
   | where firstPartyBlobPath =~ blobPath
   | where resourceId =~ resource or firstTagValue =~ resource or resourceId =~ strcat("/subscriptions/", resource)
   | project PreciseTimeStamp, availableTime, ActivityId, serviceIdentity, dataType, category, attempt = queueMessageDequeueTimes, sendRetryCount = depthOfRecursion, isFailed, failureReason, customerStorageAccountName, customerContainerName
   | sort by PreciseTimeStamp asc 
                   
   ```

   **Target Endpoint = Event Hub**

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

   let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
   let blobPath = "BLOBPATHGOESHERE";
   EventHubSendBatchTelemetry
   | where firstPartyBlobPath =~ blobPath
   | where resourceId =~ resource or firstTagValue =~ resource or resourceId =~ strcat("/subscriptions/", resource)
   | project PreciseTimeStamp, availableTime, ActivityId, serviceIdentity, dataType, category, attempt = queueMessageDequeueTimes, sendRetryCount, isFailed, failureReason, eventHubNamespace, eventHubName
   | sort by PreciseTimeStamp asc 
                       
   ```

   **Target Endpoint = Partner Solution (aka Marketplace)**

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

   let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
   let blobPath = "BLOBPATHGOESHERE";
   MarketplaceFirstTagTelemetry
   | where firstPartyBlobPath =~ blobPath
   | where resourceId =~ resource or customerFirstTagId =~ resource or resourceId =~ strcat("/subscriptions/", resource)
   | join (MarketplaceTelemetry) on correlationId
   | project PreciseTimeStamp, availableTime, ActivityId, serviceIdentity, dataType, category, attempt = queueMessageDequeueTimes, marketplaceStorageAccountId, marketplaceContainerName, marketplaceBlobName, marketplaceQueueName, marketplaceQueueMessageId
   | sort by PreciseTimeStamp asc 
                           
   ```

# Reviewing the results
---
Regardless of which query is executed, the results are structured the same and represent the processing history of a specified blob for data related to a specified Azure resource, subscription or tenant.

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
| isFailed | Whether or not the processing attempt failed (0 = Success, 1 = Failed). |
| failureReason | An identifier of the reason for the failure to send the data to the target destination. |
| correlationId | (Log Analytics Only) A unique identifier provided as part of the write operation to Log Analytics ODS endpoint.  This can be provided to the Log Analytics ODS PG if we believe that a failure is caused by the ODS service. |
| workspaceId | (Log Analytics Only) The Log Analytics workspaceId where the data is attempting to be sent. |
| odsDataTypeId | (Log Analytics Only) The data type (category) as recognized by Log Analytics.  If the data is destined for the AzureDiagnostics table then this value will be "AzureDiagnostics", otherwise it will have a defined data type identifier formatted as "RESOURCEPROVIDERNAME_LOGANALYTICSTABLENAME". |
| customerStorageAccountName | (Storage Only) The storage account where the data is attempting to be sent. |
| customerContainerName | (Storage Only) The blob container in the storage account where the data is attempting to be sent. |
| eventHubNamespace | (Event Hub Only) The event hub namespace where the data is attempting to be sent. |
| eventHubName | (Event Hub Only) The event hub name in the event hub namespace where the data is attempting to be sent. |
| marketplaceStorageAccoundId | (Partner Solution Only) The Azure resourceId of the storage account where the data was written for the Liftr process to pick it up. |
| marketplaceContainerName | (Partner Solution Only) The container within the storage account where the data was written for the Liftr process to pick it up. |
| marketplaceBlobName | (Partner Solution Only) The blob path where the data was written for the Liftr process to pick it up. |
| marketplaceQueueName | (Partner Solution Only) The queue within the storage account where the messageId to let Liftr know there is data is written. |
| marketplaceQueueMessageId | (Partner Solution Only) The messageId to let Liftr know there is data to be processed. |

**Example:**

```kusto

let resource = "/SUBSCRIPTIONS/********-****-****-****-46AAC60C260C/RESOURCEGROUPS/TESTING1/PROVIDERS/MICROSOFT.CONTAINERSERVICE/MANAGEDCLUSTERS/TESTCLUSTER";
let blobPath = "data/d=20210627/h=02/m=58/Tenant=westeurope/Role=AKS/RoleInstance=mdsd-vlbpj/Cloud=AzureCloud/Environment=prod/Underlay=cx-507/UnderlayClass=hcp-underlay/UnderlayName=hcp-underlay-westeurope-cx-507/s=00/p=61/i=1007123545224845849";
ODSPostTelemetry
| where firstPartyBlobPath == blobPath
| where resourceId =~ resource or customerFirstTagId =~ resource or resourceId =~ strcat("/subscriptions/", resource)
| project PreciseTimeStamp, availableTime, ActivityId, serviceIdentity, dataType, category, attempt = queueMessageDequeueTimes, sendRetryCount = postRetryCount, isFailed, failureReason = iif(isempty(failureReason), "Success", failureReason), correlationId, workspaceId, odsDataTypeId
| sort by PreciseTimeStamp asc 

```

![image.png](/.attachments/image-8a919444-32db-4a7b-b665-9caf38ebf31e.png)

**Example:**

```kusto
let resource = "********-****-****-****-4856070026a5";
let blobPath = "data/d=20210626/h=07/m=00/Tenant=8b81439d166f47e293bfa00ce56546d4/Role=Frontdoor.Web.razzle/RoleInstance=Frontdoor.Web.razzle_IN_18/Deployment=8b81439d166f47e293bfa00ce56546d4/RoleLocation=Central US/s=00/p=300/i=4049095690";
StorageAccountAppendBlockTelemetry
| where firstPartyBlobPath == blobPath
| where resourceId =~ resource or firstTagValue =~ resource or resourceId =~ strcat("/subscriptions/", resource)
| project PreciseTimeStamp, availableTime, ActivityId, serviceIdentity, dataType, category, attempt = queueMessageDequeueTimes, sendRetryCount = depthOfRecursion, isFailed, failureReason, customerStorageAccountName, customerContainerName
| sort by PreciseTimeStamp asc 

```

![image.png](/.attachments/image-35e6be83-fa6e-4030-82f0-50116c073e5c.png)

