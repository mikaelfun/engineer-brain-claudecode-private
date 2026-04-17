---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/How-To/How to get diagnostic log and metrics telemetry for an Azure resource from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/How-To/How%20to%20get%20diagnostic%20log%20and%20metrics%20telemetry%20for%20an%20Azure%20resource%20from%20Kusto"
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

# Querying for Diagnostic Logs and Metrics Telemetry
---
1. Identify the resource for which you need to check diagnostic telemetry.

   * For Azure Active Directory data, this would be the TenantId.

      [How to get Azure Active Directory Tenant Id from Azure Subscription Id in Jarvis](/Azure-Monitor/How%2DTo/Jarvis/How-to-get-Azure-Active-Directory-Tenant-Id-from-Azure-Subscription-Id-in-Jarvis)

   * For Azure subscription data, this would be the SubscriptionId in the format: /subscriptions/<subscriptionId> (for example /subscriptions/00000000-0000-0000-0000-000000000000).

   * For Azure resources, this would be the Azure resourceId.

      [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)

1. Check the diagnostic settings configurations to understand what data should be flowing to what target endpoints.

   [How to get diagnostic settings for an Azure resource from Jarvis](/Deprecated-Content/How-to-get-diagnostic-settings-for-an-Azure-resource-from-Jarvis)
   [How to get Activity Log diagnostic settings for an Azure subscription from Jarvis](/Deprecated-Content/How-to-get-Activity-Log-diagnostic-settings-for-an-Azure-subscription-from-Jarvis)
   [How to get Azure Active Directory (AAD) diagnostic settings for an Azure tenant from Jarvis](/Deprecated-Content/How-to-get-Azure-Active-Directory-\(AAD\)-diagnostic-settings-for-an-Azure-tenant-from-Jarvis)

1. Open Kusto Explorer or Azure Data Explorer connecting to the **Insights** database of the **AzureInsights** cluster (or appropriate database and cluster for the cloud you are working with).

   [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer)

1. Follow directions in one of the sections below to select the query you want to work with based on your needs.

## Get Data Written to Target Endpoints
The following queries will summarize the data that has been processed through the diagnostics pipeline and successfully written to the various target endpoints configured in Azure Log Analytics, Azure Storage, Azure Event Hub respectively, and render a time chart to see the trend of data flowing through (or missing from) the diagnostic pipeline.

Copy and paste the following Kusto query into the query window and replace RESOURCEIDGOESHERE with the desired Azure resource Id or Azure AD TenantId as appropriate, then click **Run (F5)**.

Additionally the following variables should be updated to match your needs:

| Variable | Description |
|----------|-------------|
| startTime | The timestamp that represents the starting point in time for the data you want to query.  Default is to start 1 day prior to current timestamp. |
| endTime | The timestamp that represents the ending point in time for the data you want to query.  Default is to end at the current timestamp. |
| timeGrain | The aggregation period for each datapoint.  Default is to aggregate the data points every 15 minutes. |

<details closed>
<summary><b>Target Endpoint = Log Analytics</b></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
let startTime = ago(2d);
let endTime = now();
let timeGrain = 1h;
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where resourceId =~ resource or firstTagValue =~ resource
| distinct firstTagValue;
let serviceIdentities = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where firstTagValue in (firstTagValues)
| distinct serviceIdentity;
ODSPostTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where customerFirstTagId in (firstTagValues) and serviceIdentity in (serviceIdentities)
| where isFailed == 0
| extend target = strcat(workspaceId, "-", category, "-", odsDataTypeId)
| summarize NumberOfRecords = sum(numberOfRecords), NumberOfBatches = count() by bin(PreciseTimeStamp, timeGrain), target
| render timechart 
          
   ```
</div>
</details>



&nbsp;

<details closed>
<summary><b>Target Endpoint = Storage Account</b></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
let startTime = ago(2d);
let endTime = now();
let timeGrain = 1h;
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where resourceId =~ resource or firstTagValue =~ resource
| distinct firstTagValue;
let serviceIdentities = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where firstTagValue in (firstTagValues)
| distinct serviceIdentity;
StorageAccountAppendBlockTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where firstTagValue in (firstTagValues) and serviceIdentity in (serviceIdentities)
| where isFailed == 0
| extend target = strcat(customerStorageAccountName, "-", category, "-", customerContainerName)
| summarize NumberOfRecords = sum(numberOfRecordsInBlock), NumberOfBatches = count() by bin(PreciseTimeStamp, timeGrain), target
| render timechart  
          
   ```
</div>
</details>


&nbsp;

<details closed>
<summary><b>Target Endpoint = Event Hub</b></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
let startTime = ago(2d);
let endTime = now();
let timeGrain = 1h;
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where resourceId =~ resource or firstTagValue =~ resource
| distinct firstTagValue;
let serviceIdentities = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where firstTagValue in (firstTagValues)
| distinct serviceIdentity;
EventHubSendBatchTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where firstTagValue in (firstTagValues) and serviceIdentity in (serviceIdentities)
| where isFailed == 0
| extend target = strcat(eventHubName, "-", category, "-", eventHubNamespace)
| summarize NumberOfRecords = sum(numberOfRecords), NumberOfBatches = count() by bin(PreciseTimeStamp, timeGrain), target
| render timechart   
          
   ```
</div>
</details>

---

&nbsp;

## Get Average Latency of Data Written to Target Endpoints
This query will summarize the latency (delay) in seconds that was experienced while processing data through the diagnostics pipeline and successfully written to the target endpoint chosen of Azure Log Analytics, Azure Storage, Azure Event Hub respectively, and will render a time chart to see the trend of data flowing through (or missing from) the diagnostic pipeline.

Copy and paste the following Kusto query into the query window and replace RESOURCEIDGOESHERE with the desired Azure resource id or Azure AD TenantId as appropriate, then click **Run (F5)**.

Additionally the following variables should be updated to match your needs:

| Variable | Description |
|----------|-------------|
| startTime | The timestamp that represents the starting point in time for the data you want to query.  Default is to start 1 day prior to current timestamp. |
| endTime | The timestamp that represents the ending point in time for the data you want to query.  Default is to end at the current timestamp. |
| timeGrain | The aggregation period for each datapoint.  Default is to aggregate the data points every 15 minutes. |

<details closed>
<summary><b>Target Endpoint = Log Analytics</b></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
let startTime = ago(2d);
let endTime = now();
let timeGrain = 1h;
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where resourceId =~ resource or firstTagValue =~ resource
| distinct firstTagValue;
let serviceIdentities = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where firstTagValue in (firstTagValues)
| distinct serviceIdentity;
ODSPostTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where customerFirstTagId in (firstTagValues) and serviceIdentity in (serviceIdentities)
| where isFailed == 0
| extend delay = (todatetime(PreciseTimeStamp) - todatetime(availableTime))
| extend target = strcat(workspaceId, "-", category, "-", odsDataTypeId)
| summarize AverageDelayInSeconds=avg(delay) by bin(PreciseTimeStamp,timeGrain), target
| render timechart 
          
   ```
</div>
</details>



&nbsp;

<details closed>
<summary><b>Target Endpoint = Storage Account</b></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
let startTime = ago(2d);
let endTime = now();
let timeGrain = 1h;
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where resourceId =~ resource or firstTagValue =~ resource
| distinct firstTagValue;
let serviceIdentities = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where firstTagValue in (firstTagValues)
| distinct serviceIdentity;
StorageAccountAppendBlockTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where firstTagValue  in (firstTagValues) and serviceIdentity in (serviceIdentities)
| where isFailed == 0
| extend delay = (todatetime(PreciseTimeStamp) - todatetime(availableTime))
| extend target = strcat(customerStorageAccountName, "-", category, "-", customerContainerName)
| summarize AverageDelayInSeconds=avg(delay) by bin(PreciseTimeStamp,timeGrain), target
| render timechart 
          
   ```
</div>
</details>



&nbsp;

<details closed>
<summary><b>Target Endpoint = Event Hub</b></summary>
<div style="margin:25px">

:::template /.templates/Launch-Kusto-Single-Indent.md
:::

   ```

let resource = "AZURERESOURCEIDSUBSCRIPTIONIDORTENANTIDGOESHERE";
let startTime = ago(2d);
let endTime = now();
let timeGrain = 1h;
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where resourceId =~ resource or firstTagValue =~ resource
| distinct firstTagValue;
let serviceIdentities = RegistrationTelemetry
| where PreciseTimeStamp > ago(5d) //change startTime and endTime, not this value
| where firstTagValue in (firstTagValues)
| distinct serviceIdentity;
EventHubSendBatchTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where firstTagValue in (firstTagValues) and serviceIdentity in (serviceIdentities)
| where isFailed == 0
| extend delay = (todatetime(PreciseTimeStamp) - todatetime(availableTime))
| extend target = strcat(eventHubName, "-", category, "-", eventHubNamespace)
| summarize AverageDelayInSeconds=avg(delay) by bin(PreciseTimeStamp,timeGrain), target
| render timechart
          
   ```
</div>
</details>

---


&nbsp;



##############

<details closed>
<summary><b>Legacy Telemetry tables</b></summary>
<div style="margin:25px">

The below section is from the legacy form of this article, for the older Telemetry tables, which each have a new parallel table in the Azureinsights.Insights cluster/database

These tables do not include the blobpath information, or include records for logging failed sends (as well as other changes). 
<b>Do not use the legacy tables if you can use the current options.</b>
If you believe you must use the legacy tables and cannot find a way to perform the same step in the newer tables, please feel free to reach out to a SME. 

| Legacy Table | Current Parallel |
|-------------|---------------|
| OdsTelemetry | OdsPostTelemetry |
| CustomerStorageTelemetry| StorageAccountAppendBlockTelemetry | 
| CustomerEventhubTelemetry | EventHubSendBatchTelemetry |

## Get Data Written to Target Endpoints
This query will summarize the data that has been processed through the diagnostics pipeline and successfully written to the various target endpoints configured in Azure Storage, Azure Event Hub and Azure Monitor Log (Log Analytics) and render a time chart to see the trend of data flowing through (or missing from) the diagnostic pipeline.

Copy and paste the following Kusto query into the query window and replace RESOURCEIDGOESHERE with the desired Azure resource id or Azure AD TenantId as appropriate, then click **Run (F5)**.

Additionally the following variables should be updated to match your needs:

| Variable | Description |
|----------|-------------|
| startTime | The timestamp that represents the starting point in time for the data you want to query.  Default is to start 1 day prior to current timestamp. |
| endTime | The timestamp that represents the ending point in time for the data you want to query.  Default is to end at the current timestamp. |
| timeGrain | The aggregation period for each datapoint.  Default is to aggregate the data points every 15 minutes. |

:::template /.templates/Launch-Kusto.md
:::

```

let resource = "RESOURCEIDGOESHERE";
let startTime = todatetime(ago(1d));
let endTime = todatetime(now());
let timeGrain = 15m;
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(1d)
| where resourceId =~ resource or firstTagValue =~ resource
| summarize count() by firstTagValue
| project firstTagValue;
union kind=outer OdsTelemetry, CustomerEventhubTelemetry, CustomerStorageTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where customerFirstTagId in~ (firstTagValues)
| extend delay = (todatetime(PreciseTimeStamp) - todatetime(availableTime))
| extend dest = case(destination == "EventHub", "EventHub", destination == "ODS", "LogAnalytics", "Storage")
| extend target = strcat(dataType, "-", dest, "-", case(dest == "EventHub", strcat(substring(eventHubNamespace, 0, indexof(eventHubNamespace, ".")), "-", eventHubName, "-", category), dest == "LogAnalytics", strcat(workspaceId, "-", category), strcat(storageAccountName, "-", containerName, "-", category)))
| summarize NumberOfBatches = count(), NumberOfRecords = sum(numberOfRecordsWritten) by bin(todatetime(availableTime),timeGrain), target
| render timechart

```

**Results:**

The data returned captures two aggregate values across whatever diagnostic settings have been configured for the provided resource using the format **DataType-TargetType-TargetIdentifier-Value**.

| Value | Description |
|-------|-------------|
| NumberOfBatches | The number of batches of data that were processed during the aggregation period (timeGrain). |
| NumberOfRecords | The number of records written from the batches of data that were processed during the aggregation period (timeGrain). |

**Example:**

```

let resource = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/TestingVMs/providers/microsoft.insights/autoscalesettings/*******winss1-Autoscale-708";
let startTime = todatetime(ago(1d));
let endTime = todatetime(now());
let timeGrain = 15m;
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(1d)
| where resourceId =~ resource or firstTagValue =~ resource
| summarize count() by firstTagValue
| project firstTagValue;
union kind=outer OdsTelemetry, CustomerEventhubTelemetry, CustomerStorageTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where customerFirstTagId in~ (firstTagValues)
| extend delay = (todatetime(PreciseTimeStamp) - todatetime(availableTime))
| extend dest = case(destination == "EventHub", "EventHub", destination == "ODS", "LogAnalytics", "Storage")
| extend target = strcat(dataType, "-", dest, "-", case(dest == "EventHub", strcat(substring(eventHubNamespace, 0, indexof(eventHubNamespace, ".")), "-", eventHubName, "-", category), dest == "LogAnalytics", strcat(workspaceId, "-", category), strcat(storageAccountName, "-", containerName, "-", category)))
| summarize NumberOfBatches = count(), NumberOfRecords = sum(numberOfRecordsWritten) by bin(todatetime(availableTime),timeGrain), target
| render timechart

```

![image.png](/.attachments/image-999c3f0b-2b59-43d4-81f2-9f7c33ea7577.png)

## Get Average Latency of Data Written to Target Endpoints
This query will summarize the latency (delay) in seconds that was experienced while processing data through the diagnostics pipeline and successfully written to the various target endpoints configured in Azure Storage, Azure Event Hub and Azure Monitor Log (Log Analytics) and render a time chart to see the trend of data flowing through (or missing from) the diagnostic pipeline.

Copy and paste the following Kusto query into the query window and replace RESOURCEIDGOESHERE with the desired Azure resource id or Azure AD TenantId as appropriate, then click **Run (F5)**.

Additionally the following variables should be updated to match your needs:

| Variable | Description |
|----------|-------------|
| startTime | The timestamp that represents the starting point in time for the data you want to query.  Default is to start 1 day prior to current timestamp. |
| endTime | The timestamp that represents the ending point in time for the data you want to query.  Default is to end at the current timestamp. |
| timeGrain | The aggregation period for each datapoint.  Default is to aggregate the data points every 15 minutes. |

:::template /.templates/Launch-Kusto.md
:::

```

let resource = "RESOURCEIDGOESHERE";
let startTime = todatetime(ago(1d));
let endTime = todatetime(now());
let timeGrain = 15m;
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(1d)
| where resourceId =~ resource or firstTagValue =~ resource
| summarize count() by firstTagValue
| project firstTagValue;
union kind=outer OdsTelemetry, CustomerEventhubTelemetry, CustomerStorageTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where customerFirstTagId in~ (firstTagValues)
| extend delay = (todatetime(PreciseTimeStamp) - todatetime(availableTime))
| extend dest = case(destination == "EventHub", "EventHub", destination == "ODS", "LogAnalytics", "Storage")
| extend target = strcat(dataType, "-", dest, "-", case(dest == "EventHub", strcat(substring(eventHubNamespace, 0, indexof(eventHubNamespace, ".")), "-", eventHubName, "-", category), dest == "LogAnalytics", strcat(workspaceId, "-", category), strcat(storageAccountName, "-", containerName, "-", category)))
| summarize AverageDelayInSeconds=avg(delay) by bin(PreciseTimeStamp,timeGrain), target
| render timechart

```

**Results:**

The data returned captures one aggregate value across whatever diagnostic settings have been configured for the provided resource using the format **DataType-TargetType-TargetIdentifier-Value**.

| Value | Description |
|-------|-------------|
| AverageDelayInSeconds | The number of seconds on average to process the batches of data that were processed during the aggregation period (timeGrain). |


**Example:**

```

let resource = "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/TestingVMs/providers/microsoft.insights/autoscalesettings/*******winss1-Autoscale-708";
let startTime = todatetime(ago(1d));
let endTime = todatetime(now());
let timeGrain = 15m;
let firstTagValues = RegistrationTelemetry
| where PreciseTimeStamp > ago(1d)
| where resourceId =~ resource or firstTagValue =~ resource
| summarize count() by firstTagValue
| project firstTagValue;
union kind=outer OdsTelemetry, CustomerEventhubTelemetry, CustomerStorageTelemetry
| where PreciseTimeStamp between (startTime .. endTime)
| where customerFirstTagId in~ (firstTagValues)
| extend delay = (todatetime(PreciseTimeStamp) - todatetime(availableTime))
| extend dest = case(destination == "EventHub", "EventHub", destination == "ODS", "LogAnalytics", "Storage")
| extend target = strcat(dataType, "-", dest, "-", case(dest == "EventHub", strcat(substring(eventHubNamespace, 0, indexof(eventHubNamespace, ".")), "-", eventHubName, "-", category), dest == "LogAnalytics", strcat(workspaceId, "-", category), strcat(storageAccountName, "-", containerName, "-", category)))
| summarize AverageDelayInSeconds=avg(delay) by bin(PreciseTimeStamp,timeGrain), target
| render timechart

```

![image.png](/.attachments/image-e849e755-654b-4338-9772-10374e910f0a.png)

</div>
</details>
