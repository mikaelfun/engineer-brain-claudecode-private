---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Data Collection Rules (DCR)/How-To/How to get Azure resources associated with a Data Collection Rule"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Data%20Collection%20Rules%20%28DCR%29/How-To/How%20to%20get%20Azure%20resources%20associated%20with%20a%20Data%20Collection%20Rule"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Instructions
---
1. Navigate to the desired data collection rule in Azure Support Center.

   [How to navigate to a resource in Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-navigate-to-a-resource-in-Azure-Support-Center)

1. Click on the **Associations** tab.

   ![image.png](/.attachments/image-f9c4c24d-2121-4947-843b-c13fda6470e6.png)

1. Select the desired **Api Version** (usually the latest), then click **Run**.

   ![image.png](/.attachments/image-1fc5f37f-9b2b-41d8-9fd1-336e752ae3f6.png)

1. The result will be a JSON blob of resources associated to the data collection rule.  Review each record for the **Id** property that contains the associated resource.

   ![image.png](/.attachments/image-4236a5c6-51fc-44ee-ba90-8078ff0038d2.png)
