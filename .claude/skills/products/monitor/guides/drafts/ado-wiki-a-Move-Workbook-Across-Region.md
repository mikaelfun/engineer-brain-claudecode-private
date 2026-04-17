---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Workbooks/How-To/Move an Azure Workbook Across Region, Subscription or Resource Group"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Workbooks/How-To/Move%20an%20Azure%20Workbook%20Across%20Region%2C%20Subscription%20or%20Resource%20Group"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]
# Instructions
---
This article will cover how to move an Azure Workbook across region, subscription or resource group in the Azure Portal.

# Process
1. Within the 'Resource groups' view in the portal click on the resource group where the Azure Workbook resides.

2. Click the checkbox next to the Workbook in the view, then click on the 'Move' tab at the top right of the page which will give some options for moving the resource **(Note:** Moving across regions is not able to be done through this process, check the resources section for details on how to move regions):
![image.png](/.attachments/image-50d84214-1929-4058-904d-0c2087c6751a.png)

3. For this article, I'll be moving the Workbook across resource group so click 'Move to another resource group' which will load up a new page in which you'll select the new resource group to move to (**Note:** When you first load the page it'll populate the current resource group, a new one will need to be chosen):
![image.png](/.attachments/image-5fd171c9-ee61-46ee-b56c-65dd2ff91ab3.png)

4. The next page will validate if the resource is able to be moved and then the last screen you will review your options and save it. Once the operation is completed navigate to the new location and verify that the Workbook is there.

# Resources
[Move Workbooks Across Region](https://learn.microsoft.com/azure/azure-monitor/visualize/workbooks-move-region)
