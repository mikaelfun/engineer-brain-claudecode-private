---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Diagnostic Settings/How-To/How to get diagnostic log and metrics telemetry from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Diagnostic%20Settings/How-To/How%20to%20get%20diagnostic%20log%20and%20metrics%20telemetry%20from%20Azure%20Support%20Center"
importDate: "2026-04-07"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

::: template /.templates/Note-ASCGetPermissions.md
:::

<div style="border:6px solid; margin-bottom:20px; padding:10px; min-width:500px; width:75%; border-radius:10px; color:black; background-color:#7BD689">

Try the new Diagnostic Settings dashboard for troubleshooting Diagnostic Settings cases:
<span style="background-color: #DDFFE2">(https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1666481/-TSG-Diagnostic-Settings-Telemetry)</span>

</div>

[[_TOC_]]

# Instructions
---
:::template /.templates/AzMon-OpenASCFromSupportRequest.md
:::

:::template /.templates/ASC-NavigateToResourceExplorer.md
:::

1. Select the **Resource Provider** view.

   ![image.png](/.attachments/image-ASC-ResourceView-ResourceProvider.png)

1. Click on the **microsoft.insights** blade in the left hand navigation.

   ![image.png](/.attachments/image-0b85d566-9432-4e38-82ad-7e772e0c263c.png)

1. Click on the **Diagnostic Settings (Azure Monitor)** tab.

   ![image.png](/.attachments/image-57fba20e-2bf8-4e21-8c94-a28cd2a4932c.png)

1. In the **Diagnostic Logs** section, populate the desired Azure resource identifier and then click **Run**.

   ![image.png](/.attachments/image-c44fa5de-fedf-4832-915c-e9ea362d2180.png)
    
   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Note**
   
   This feature currently only supports Azure resources and does not work for diagnostic settings for Azure subscriptions or Azure AD tenants.  These features are being worked on.  Until then, see article [How to get diagnostic log and metrics telemetry for an Azure resource from Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-diagnostic-log-and-metrics-telemetry-for-an-Azure-resource-from-Kusto).
   </div>

1. Click on the tab that matches the target destination for which you are looking to review telemetry.

   | Tab Name | Description |
   |:---------|:------------|
   | Log Analytics | Target destination is a Log Analytics workspace. |
   | Customer Event Hub | Target destination is an Event Hub. |
   | Customer Storage | Target destination is a Storage Account. |

1. Select the desired date and time range, desired time grain and data type to query, then click **Run**.

   ![image.png](/.attachments/image-13535216-3f67-4991-8a45-4326c4af22f8.png)

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Note**
   
   The telemetry data returned is for all diagnostic settings that exist for the Azure resource and is grouped by the category of the data or the container where the data is destined.
   </div>

# Reviewing the results
---
The chart that is returned will show you the number of records that were successfully written to the target destination grouped by either the category or target container name.

**Example:**

In the example below we can see data from two categories, AutoscaleEvaluations and AutoscaleScaleActions that are both being written to the same log analytics workspace.

![image.png](/.attachments/image-cb87525c-3b31-4682-a71e-d11e5dc1edeb.png)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">

**Note**

For Event Hub and Storage Account target destinations, the experience currently groups based only on the name of the Event Hub and the Blob container respectively.  If the data is being written to more than one target destination that share the same name, the data will appear to be going to a single target because it groups on the container name.  This is going to be addressed in a future update but in the meantime if you need that grouping, see article [How to get diagnostic log and metrics telemetry for an Azure resource from Kusto](/Monitoring-Essentials/Diagnostic-Settings/How%2DTo/How-to-get-diagnostic-log-and-metrics-telemetry-for-an-Azure-resource-from-Kusto).
</div>

