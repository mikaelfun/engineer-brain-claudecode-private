---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Data Collection Rules (DCR)/How-To/How to get Data Collection Rules associated to an Azure resource"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Data%20Collection%20Rules%20%28DCR%29/How-To/How%20to%20get%20Data%20Collection%20Rules%20associated%20to%20an%20Azure%20resource"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Instructions
---
:::template /.templates/AzMon-OpenASCFromSupportRequest.md
:::

1. Get the Azure resourceId of the virtual machine, virtual machine scale set or arc enabled server.

   [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)

:::template /.templates/ASC-NavigateToResourceExplorer.md
:::

1. Select the **Resource Provider** view.

   ![image.png](/.attachments/image-ASC-ResourceView-ResourceProvider.png)

1. Click on the chevron to the left of **microsoft.insights**.

   ![image.png](/.attachments/image-4d904317-512f-4b22-aab6-d387a52fc5c2.png)

1. Click on the **dataCollectionRules** resource type.

   ![image.png](/.attachments/image-2f8e426c-9b05-4a17-a9c4-6259b05b7772.png)

1. In the **Dcras by Target ResourceId** section, populate the **ResourceId** for your Azure resource, then click **Run**.

   ![image.png](/.attachments/image-dc561596-030f-4e96-9842-5ed88eee10d6.png)

1. The result will be a JSON blob of the Data Collection Rules associated to the Azure resource.  Review each record for the **dataCollectionRuleId** property that contains the Data Collection Rule.

   ![image.png](/.attachments/image-ad027dd0-d285-4afa-84b0-3870ec8a72e7.png)
