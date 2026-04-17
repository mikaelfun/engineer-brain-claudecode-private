---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Autoscale/How-To/How to analyze Autoscale job trace logging in Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Autoscale/How-To/How%20to%20analyze%20Autoscale%20job%20trace%20logging%20in%20Azure%20Support%20Center"
importDate: "2026-04-07"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

::: template /.templates/Note-ASCGetPermissions.md
:::

1. You will need an autoscale event job ActivityId.  This can be retrieved by reviewing either autoscale actions or evaluating autoscale polling events.

   * [How to get details of executed Autoscale scaling actions in Azure Support Center](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-get-details-of-executed-Autoscale-scaling-actions-in-Azure-Support-Center)
   * [How to analyze Autoscale job evaluation history in Azure Support Center](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-analyze-Autoscale-job-evaluation-history-in-Azure-Support-Center)

:::template /.templates/AzMon-OpenASCFromSupportRequest.md
:::

:::template /.templates/ASC-NavigateToResourceExplorer.md
:::

1. Locate the desired autoscale configuration from the left hand navigation.  This can be done either using the resource group structure or by selecting providers and expanding the **microsoft.insights** provider and then **autoscalesettings** and then clicking on the desired autoscale configuration.

   ![image.png](/.attachments/image-daa513c8-ea7e-4d10-a727-b66604151802.png)

1. Click on the **AutoScale Queries** tab.

   ![image.png](/.attachments/image-8a94b672-136d-41ad-a1cb-c36d55e295e3.png)

1. Click on the **Job Traces by ActivityId** section link.

   ![image.png](/.attachments/image-4f4a0976-662c-4bf8-97d1-a2450abd8588.png)

1. Populate the **ActivityId** dialog with the desired autoscale event ActivityId, then click **Run**.

   ![image.png](/.attachments/image-1a84422d-6898-454d-ab3a-45e9230307eb.png)

1. The results presented show the trace logs for the specific autoscale polling execution.

   ![image.png](/.attachments/image-791f12c1-a5ac-4238-9dab-782b8045f507.png)

