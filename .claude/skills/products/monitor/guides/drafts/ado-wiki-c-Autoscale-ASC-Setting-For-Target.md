---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Autoscale/How-To/How to get Autoscale setting for target resource from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Autoscale/How-To/How%20to%20get%20Autoscale%20setting%20for%20target%20resource%20from%20Azure%20Support%20Center"
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
:::template /.templates/AzMon-OpenASCFromSupportRequest.md
:::

:::template /.templates/ASC-NavigateToResourceExplorer.md
:::

1. Select the **Resource Provider** view.

   ![image.png](/.attachments/image-ASC-ResourceView-ResourceProvider.png)

1. Click on the chevron next to **microsoft.insights** blade in the left hand navigation to expand the collections under it, then click **autoscalesettings**.

   ![image.png](/.attachments/image-7727bfdd-3ae7-43c3-9a55-24c03097c328.png)

1. Type the Azure resourceId or even just the name of the Azure resource for which you want to identify the Autoscale setting into property **TargetResourceUri** to filter the results.

# Reviewing the results
---
The table returned is a list of all Autoscale settings in the subscription.

| Property | Description |
|:---------|:------------|
| Name | The name of the Autoscale setting.  Click the link to navigate to that Autoscale setting. |
| TargetResourceUri | The resource that is the target of the Autoscale setting.  Click the link to navigate to that resource. |
| Enabled | Whether or not the Autoscale setting is enabled. |
| Location | The Azure region where the Autoscale setting is located. |

**Example:**

![image.png](/.attachments/image-ee75fc70-7e2f-4c15-bd0d-d6998ef8cfa6.png)
