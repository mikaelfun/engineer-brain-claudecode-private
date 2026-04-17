---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Autoscale/How-To/How to get Autoscale Settings configurations from Kusto (Recover Deleted Autoscale Settings)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Autoscale/How-To/How%20to%20get%20Autoscale%20Settings%20configurations%20from%20Kusto%20%28Recover%20Deleted%20Autoscale%20Settings%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important** 

Kusto data for Autoscale Settings is only updated approximately twice per day so if an Autoscale Setting was recently created it may not show up via this method.  For live data it may be recommended to retrieve the raw JSON from JARVIS via a SAW/SAVM directly instead.
</div>

[[_TOC_]]

# Before You Begin
---
In order to query for Autoscale Settings telemetry, you will need to ensure you have installed Kusto Explorer and added a connection for the **Azureinsights** Kusto cluster.

For details on adding Kusto clusters, see article [How to add Kusto clusters needed by Azure Monitor to Kusto Explorer](/Azure-Monitor/How%2DTo/Kusto/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

# Querying for Autoscale Settings
---
1. Open Kusto Explorer, select **Home** ribbon and click **New tab**.

   ![image.png](/.attachments/image-5f66b528-26ee-4ec5-95b5-46c8a6f721dd.png)

1. Expand the connection you created to the **Azureinsights** cluster and select the **Insights** database.

   ![image.png](/.attachments/image-ec3f3f84-2400-4fed-9914-3831f15c454f.png)


# Scenarios
---
1. This process is useful for retrieving the raw JSON of Autoscale Settings when needed to reference against what is shown in ASC, or attempted via customer deployments, or <b> when a customer deletes an Autoscale setting and wants to undo that deletion</b>. Because deleted Autoscale Settings cannot be recovered, retrieving the raw JSON allows us to give the customer a view of what their Autoscale Setting configurations were before they were deleted, and help them recreate them. 

&nbsp;

# Get the Raw JSON by Autoscale Setting URI

This will retrieve the Autoscale Setting by using the Resource Id of the Autoscale Setting itself, and will also name the target Resource Id.

```
let autoscaleSettingResourceId = "AUTOSCALERESOURCEIDGOESHERE";
TelemetryV2
| where PreciseTimeStamp < ago(3d) //modify the timestamp to meet your requirements 
| where resourceIdentifier =~ autoscaleSettingResourceId
| summarize max(PreciseTimeStamp) by resourceIdentifier, targetResourceIdentifier, resourcePayload
```

# Get the Raw JSON by Target Resource URI

This will retrieve the Autoscale Setting by using the Resource Id of the target resource being scaled, and will also name the Autoscale Setting's URI. 

```
let targetResourceId = "TARGETRESOURCEIDGOESHERE";
TelemetryV2
| where PreciseTimeStamp < ago(3d) //modify the timestamp to meet your requirements 
| where targetResourceIdentifier =~ targetResourceId
| summarize max(PreciseTimeStamp) by resourceIdentifier, targetResourceIdentifier, resourcePayload
```