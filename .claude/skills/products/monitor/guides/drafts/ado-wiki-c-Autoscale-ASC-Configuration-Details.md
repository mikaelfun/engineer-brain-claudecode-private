---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Autoscale/How-To/How to get Autoscale configuration details from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Autoscale/How-To/How%20to%20get%20Autoscale%20configuration%20details%20from%20Azure%20Support%20Center"
importDate: "2026-04-07"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

::: template /.templates/Note-ASCGetPermissions.md
:::

[[_TOC_]]

# Instructions
---
1. Follow article [How to navigate to a resource in Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-navigate-to-a-resource-in-Azure-Support-Center) to locate the desired resource under the **microsoft.insights** provider, **autoscalesettings** collection.

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">
   
   **Note**
   
   If you don't know the name of the Autoscale setting but you do know the Azure resource that the Autoscale setting is managing, see article: [How to get Autoscale setting for target resource from Azure Support Center](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-get-Autoscale-setting-for-target-resource-from-Azure-Support-Center).
   </div>

1. Locate the desired Autoscale configuration from the left hand navigation.  This can be done either using the resource group structure or by selecting providers and expanding the **microsoft.insights** provider and then **autoscalesettings** and then clicking on the desired autoscale configuration.

   ![image.png](/.attachments/image-daa513c8-ea7e-4d10-a727-b66604151802.png)

1. Click on the **Properties** tab.

   ![image.png](/.attachments/image-5a937994-70e3-4264-b285-998a26407a80.png)

# Reviewing the results
---
Under the properties you will find details of the autoscale configuration such as whether or not it is enabled, the location, the target resource and the notification configuration for when autoscale actions occur.

**Example:**

![image.png](/.attachments/image-2128711c-0c92-4dd7-af43-24e94d22e1f3.png)
