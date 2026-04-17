---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/How-To/How to check if resource provider sent data to OnBehalfOf service in Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/How-To/How%20to%20check%20if%20resource%20provider%20sent%20data%20to%20OnBehalfOf%20service%20in%20Kusto"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
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

# Querying for Azure resource data in OnBehalfOf service
---
1. Identify the resource for which you need to check diagnostic telemetry.

   * For Azure Active Directory data, this would be the TenantId.

      [How to get Azure Active Directory Tenant Id from Azure Subscription Id in Jarvis](/Azure-Monitor/How%2DTo/Jarvis/How-to-get-Azure-Active-Directory-Tenant-Id-from-Azure-Subscription-Id-in-Jarvis)

   * For Azure subscription data, this would be the SubscriptionId.

   * For Azure resources, this would be the Azure resource id.

      [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)

1. Open Kusto Explorer or Azure Data Explorer connecting to the **Insights** database of the **AzureInsights** cluster (or appropriate database and cluster for the cloud you are working with).

   [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer)

1. Copy and paste the appropriate query depending on whether the resource is an Azure resource, Azure subscription or Azure Active Directory (AAD) tenant.  Replace AZURERESOURCEIDGOESHERE, AZURESUBSCRIPTIONIDGOESHERE and AZURE TENANTIDGOESHERE with the desired Azure resource, subscription or tenant id and set the **startTime** and **endTime** values to match your desired time window, then click **Run (F5)**.




<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Notes**
1. Trace logging is not updated in real time so if you are actively working with a customer you may need to wait 15 minutes or more for data to be available or complete.

2. Some Azure resources do not use the Azure ResourceId as their identifier for OBO data due to legacy configurations. Examples of this include Event Hub, Service Bus and Microsoft&period;Web/sites including Function Apps.

    Because of this, always use the "firstTagValue" retrieved from the RegistrationTelemetry table, and do not assume the Azure Resource Id will always be the firstTagValue


3. "RegistrationTelemetry" table is a snapshot table, that records the Diagnostic Setting configuration only approximately 1-3 times per day. If the customer has created a support ticket just after creating the diagnostic setting (within ~1 day) then you might NOT be able to see diagnostic settings in the table yet. In order to see the newly created diagnostic settings, please use this TSG https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480507/How-to-get-diagnostic-settings-for-Azure-resources-from-Azure-Support-Center

4. "InputBlobFirstTagMetadata" houses a large amount of data-- take care to query this table with small time windows if the query is timing out or taking too long to run. 

</div>

# Queries
---

Select the resource sending the logs (Azure Resource, Azure Subscription, or Entra Tenant):

<details closed>
<summary><b>Azure resource</b> (click to expand)</summary>

_Check for the Diagnostic Setting_
:::template /.templates/Launch-Kusto-Single-Indent.md
:::
```
let resource = "AZURERESOURCEIDGOESHERE";
RegistrationTelemetry
| where PreciseTimeStamp > ago(3d)
| where resourceId =~ resource 
| summarize max(PreciseTimeStamp) by name,firstTagValue,resourceId,usingInternalId,workspaceId,omsWorkspaceResourceId,usingOms,usingServiceBus,usingStorage,serviceIdentity,categories,marketplacePartnerId
```

&nbsp; 
_Check for the RP's logs_
:::template /.templates/Launch-Kusto-Single-Indent.md
:::
```     
let resource = "FIRSTTAGVALUEGOESHERE"; //"firstTagValue" from the previous query to the RegistrationTelemetry table.
let startTime = ago(1d);
let endTime = now();
InputBlobFirstTagMetadata
| where PreciseTimeStamp between (startTime .. endTime) //use a smaller time range if the query is slow or timing out 
| where firstTagValue contains resource 
| where serviceIdentity != "AzureResourceManager" and serviceIdentity != "LOGANALYTICSPIPELINEBASEDEXPORT" 
| project PreciseTimeStamp, ActivityId, serviceIdentity, numberOfRecords, recordCountByCategories, firstTagValue, blobPath
| sort by PreciseTimeStamp asc 
//| limit 1000 //if your query is slow or timing out, consider adding this to view a small sample of the data

Important : You can also plot a time chart to see the number of records sent by the RP. See the "Advanced" section below.
This can help identify if data stopped flowing temporarily and began again at a later date. 
We can use the gaps in this time chart to directly engage the RP for when they were not sending logs to the diagnostics pipeline (OBO).
 ```
</details> 

&nbsp; 
<details closed>
<summary><b>Azure Subscription</b> (click to expand)</summary>

:::template /.templates/Launch-Kusto-Single-Indent.md
:::
```
let subId = "AZURESUBSCRIPTIONIDGOESHERE";
let startTime = ago(1d);
let endTime = now();
InputBlobFirstTagMetadata
| where PreciseTimeStamp between (startTime .. endTime) //use a smaller time range if the query is slow or timing out 
| where firstTagValue contains subId
| where serviceIdentity =~ "AzureResourceManager" and serviceIdentity != "LOGANALYTICSPIPELINEBASEDEXPORT" 
| project PreciseTimeStamp, ActivityId, serviceIdentity, numberOfRecords, recordCountByCategories, firstTagValue, blobPath
| sort by PreciseTimeStamp asc 
//| limit 1000 //if your query is slow or timing out, consider adding this to view a small sample of the data
           
```
</details>

&nbsp; 
<details closed>
<summary><b>Azure Active Directory (Entra/AAD) Tenant</b> (click to expand)</summary>


:::template /.templates/Launch-Kusto-Single-Indent.md
:::
```
let tenantId = "AZURETENANTIDGOESHERE";
let startTime = ago(1d);
let endTime = now();
InputBlobFirstTagMetadata
| where PreciseTimeStamp between (startTime .. endTime) //use a smaller time range if the query is slow or timing out 
| where firstTagValue =~ tenantId
| where serviceIdentity =~"TENANT_MICROSOFT.AADIAM"
| project PreciseTimeStamp, ActivityId, serviceIdentity, numberOfRecords, recordCountByCategories, firstTagValue, blobPath
| sort by PreciseTimeStamp asc 
//| limit 1000 //if your query is slow or timing out, consider adding this to view a small sample of the data
            
```
</details>

&nbsp; 

# Reviewing the results
---
Regardless of which query is executed, the results are structured the same and represent batches of data received by the OnBehalfOf (OBO, aka Shoebox) service.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

The number of records shown in these results is not meant to be an accurate assessment of the number of records processed for any given destination.  These results showcase data received by OBO but that data can potentially get identified multiple times if the same data has multiple destinations or is processed several times due to retry operations.  These results should be used primarily for the purpose of recognizing data that OBO has received, the categories of data received and the corresponding resources and blob paths.
</div>

See the table below for descriptions of the data returned.

| Property | Description |
|:---------|:------------|
| PreciseTimestamp | The timestamp at which the OBO service began processing the data in the blob. |
| ActivityId | The ActivityId assigned to the processing of the data in OBO. |
| serviceIdentity | The Azure service from where the data originated. |
| numberOfRecords | The number of records in the blob that match the provided Azure resource. |
| recordCountByCategories | The data categories of the records received and the number of records in each category.  This can help to determine if data is flowing for some categories but not for others. |
| firstTagValue | The firstTagValue that was resolved from the resource provided.  This is most often the same as the resource Id, but in some cases there is an internal mapping used instead, and this will display that internal mapping Id. |
| blobPath | The location of the data blob that is sent to Shoebox by the Azure resource provider. |

**Example:**

```

let resource = "/subscriptions/********-****-****-****-4856070026a5/resourceGroups/VirtualMachines-EastUS/providers/microsoft.insights/autoscalesettings/win2019ss-1-Autoscale-138";
let startTime = ago(1d);
let endTime = now();
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(1d)
| where resourceId =~ resource or firstTagValue =~ resource
| summarize count() by firstTagValue
| project firstTagValue;
InputBlobFirstTagMetadata
| where PreciseTimeStamp between (startTime .. endTime)
| where firstTagValue in (firstTagValues) or firstTagValue =~ resource
| where serviceIdentity != "AzureResourceManager"
| project PreciseTimeStamp, ActivityId, serviceIdentity, numberOfRecords, recordCountByCategories, firstTagValue, blobPath
| sort by PreciseTimeStamp asc 

```

![image.png](/.attachments/image-1980d2d9-dd29-4dde-b508-2f413b73cc92.png)
&nbsp;



# Advanced
---
The following is a query that requires both the FirstTagValue of the resource and the ServiceIdentity of the resource, both of which can be retrieved from the RegistrationTelemetry table for the resource's diagnostic setting.

This will create a timechart of the data sent from the resource provider to OBO individually tallying the count of records per category. 
**As such, this querying is more intensive and should be run for smaller time periods.**

This is useful for visually matching the ODS/Storage/EventHub telemetry tables (such as OdsPostTelemetry) when comparing if all categories of data arrived as expected, and during the times expected. 

```

let tagId = "FIRSTTAGVALUE_FROM_REGISTRATIONTELEMETRY";
let serviceId = "SERVICEIDENTITY_FROM_REGISTRATIONTELEMETRY";
let startDate = datetime("2023-01-24 00:00:00");
let endDate = datetime("2023-01-25 00:00:00");
InputBlobFirstTagMetadata
| where PreciseTimeStamp between (startDate .. endDate)
| where firstTagValue =~ tagId
| where serviceIdentity =~ serviceId
| where Role == "OnBehalfWorker"
| extend removespace = substring(recordCountByCategories, 0, strlen(recordCountByCategories)-1)
| extend categoriesArray = split(removespace, " ")
| mv-expand categoriesArray
| extend categoryNameOnly = substring(categoriesArray, 0, indexof(categoriesArray, "("))
| extend categoryRecordCount = toint(substring(categoriesArray, indexof(categoriesArray, "(") + 1, indexof(categoriesArray, ")") - indexof(categoriesArray, "(") - 1))
| summarize sum(categoryRecordCount) by bin(PreciseTimeStamp, 1h), categoryNameOnly
| render timechart 
```

Another version of the above query, but for when you know the precise name of which Category of data you're querying for


```
let startDate = datetime("2023-01-24 00:00:00");
let endDate = datetime("2023-01-25 00:00:00");
InputBlobFirstTagMetadata
| where PreciseTimeStamp between (startDate .. endDate)
| where firstTagValue =~ "" // refer to registration telemetry table
| where serviceIdentity =~ "" // refer to registration telemetry table
| where recordCountByCategories contains "" //optional. you can use this when customer a specific category of the log is missing.
| where Role =~"OnBehalfWorker"
| summarize sum(numberOfRecords) by bin(PreciseTimeStamp,1min)
| render timechart 


```