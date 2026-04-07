---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Resource Health/How-To/How to get resource health transition events sent by resource providers to GHS from Kusto"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitoring%20Essentials%2FResource%20Health%2FHow-To%2FHow%20to%20get%20resource%20health%20transition%20events%20sent%20by%20resource%20providers%20to%20GHS%20from%20Kusto"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Introduction
---
When resource health events are raised by the different resource providers, they report them to Geneva Health System (GHS) and resource health UI.

# Before You Begin
---
In order to query for resource health events reported to GHS, you will need to ensure you have installed Kusto Explorer and added a connection for the **icmbrain** Kusto cluster.

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
   let getHealthStatusNameById=(idstr:long){
   case( idstr == "0", "Available",
        idstr == "1", "Unavailable",
        idstr == "2", "Degraded",
        idstr == "3", "Offline","")};
   cluster('https://icmbrain.kusto.windows.net').database('AzureResourceHealth').ResourceHealthStatusTransitionEvent 
   | where env_reportTime between (StartTime .. EndTime)
   | where env_metadata has ResourceId
   | extend Transition = strcat(getHealthStatusNameById(previousHealthStatus), "->", getHealthStatusNameById(newHealthStatus))
   | extend propertiesJson = parse_json(env_metadata)
   | project processingTimestamp = env_time,Transition,healthEventReasonCode = propertiesJson.["Monitor.Dimension.ReasonCode"],Details = env_metadata

   ```

# Reviewing the results
---
If the query found any matching resource health events processed, then details about each event processed into an activity log event will be returned.

See the table below for details about each property returned:

| Property | Description |
|:---------|:------------|
| processingTimestamp | The timestamp in UTC when Geneva Health processed the resource health event. |
| Transition | The resource health status change that occurred (for example Unavailable -> Available). |
| healthEventReasonCode | Internal resource health event reason, as configured in resource health configuration file by the resource provider. |
| Details | A longer statement with additional details about the resource health event. |

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:90%;border-radius:10px;background-color:#efd9fd">

**Note**

Sometimes you may see what appears to be the same event being processed twice.  This can happen because Geneva Health uses two clusters per stamp in active-active state (referred to as red and black) that in certain circumstances can end up processing the same resource health event in each cluster. 
</div>

**Example:**

   ![image.png](/.attachments/image-90590918-e8e6-410f-acc7-6964b55a7368.png)

