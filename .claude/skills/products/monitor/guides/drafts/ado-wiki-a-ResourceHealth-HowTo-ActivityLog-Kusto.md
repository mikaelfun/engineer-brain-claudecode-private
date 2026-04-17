---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Resource Health/How-To/How to get resource health events submitted to activity log from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FResource%20Health%2FHow-To%2FHow%20to%20get%20resource%20health%20events%20submitted%20to%20activity%20log%20from%20Kusto"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Introduction
---
When resource health events are raised by the different resource providers, the Geneva Health System (GHS) is responsible for generating an activity log event based on the resource health event.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

This article refers to events that are sent by Geneva Health to Activity Log and is not related to querying activity log events directly.
</div>

# Before You Begin
---
In order to query for resource health events written to activity log of a given Azure subscription, you will need to ensure you have installed Kusto Explorer and added a connection for the **icmbrain** Kusto cluster.

For details on adding Kusto clusters, see article [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

# Instructions
---
1. Get the Azure ResourceId that you want to check for resource health events being written to the activity log.

   [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)

1. Open Kusto Explorer, select **Home** ribbon and click **New tab**.

   ![image.png](/.attachments/image-5f66b528-26ee-4ec5-95b5-46c8a6f721dd.png)

1. Expand the connection you created to the **icmbrain** cluster and select the **AzureResourceHealth** database.

   ![image.png](/.attachments/image-8f64970c-d8fa-4630-af87-d2a78b20a67b.png)

1. Copy and paste the following Kusto query into the query window and replace **AZURERESOURCEIDGOESHERE** with the affected resource Id. Update the StartTime and EndTime variables according to the relevant timestamp, then click **Run (F5)**.

   [[Launch Kusto Explorer](https://aka.ms/ke)] [[Launch Azure Data Explorer](https://aka.ms/kwe?cluster=icmbrain&database=azureresourcehealth)]

   ```

   let ResourceId = "AZURERESOURCEIDGOESHERE";
   let StartTime = ago(1d);
   let EndTime =  now();
   cluster('https://icmbrain.kusto.windows.net').database('AzureResourceHealth').ActivityLogForProdDiagnosticPipeline
   | where ['time'] between (StartTime .. EndTime)
   | where resourceId has ResourceId 
   | extend propertiesJson = parse_json(properties)
   | extend Transition = strcat(propertiesJson["previousHealthStatus"], "->", propertiesJson["currentHealthStatus"])
   | project processingTimestamp = env_time, eventTimestamp = ['time'], activityLogEventCorrelationId = correlationId, healthStatusChange = Transition, healthEventType = propertiesJson["type"], healthEventCause = propertiesJson["cause"], ["Title"] = propertiesJson["title"], Details = propertiesJson["details"]
   | sort by processingTimestamp desc, eventTimestamp desc

   ```

# Reviewing the results
---
If the query found any matching resource health events processed, then details about each event processed into an activity log event will be returned.

See the table below for details about each property returned:

| Property | Description |
|:---------|:------------|
| processingTimestamp | The timestamp in UTC when Geneva Health processed the resource health event and generated an activity log event. |
| eventTimestamp | The timestamp in UTC when the resource health event was generated. |
| activityLogEventCorrelationId | The correlationId created by the resource health event for the corresponding activity log event. |
| healthStatusChange | The resource health status change that occurred in the resource health event (for example Unavailable -> Available). |
| healthEventType | Resource-specific event type for the resource health event. |
| healthEventCause | Resource-specific event cause for the resource health event. |
| title | A short summary of the resource health event intended to provide a high level indicator of the reason for the event. |
| details | A longer statement with additional details about the resource health event. |

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:90%;border-radius:10px;background-color:#efd9fd">

**Note**

Sometimes you may see what appears to be the same event being processed twice.  This can happen because Geneva Health uses two clusters per stamp in active-active state (referred to as red and black) that in certain circumstances can end up processing the same resource health event in each cluster.  This would also result in a duplicated activity log event where details are all the same but eventDataId is different.
</div>

**Example:**

   ![image.png](/.attachments/image-8dc08a33-47f8-43c3-b903-12b3ff595dfc.png)

