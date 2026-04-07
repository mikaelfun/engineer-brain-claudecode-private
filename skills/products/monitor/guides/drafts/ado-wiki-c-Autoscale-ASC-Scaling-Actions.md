---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Autoscale/How-To/How to get details of executed Autoscale scaling actions in Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Autoscale/How-To/How%20to%20get%20details%20of%20executed%20Autoscale%20scaling%20actions%20in%20Azure%20Support%20Center"
importDate: "2026-04-07"
type: troubleshooting-guide
---

::: template /.templates/Common-Header.md
:::

::: template /.templates/Note-ASCGetPermissions.md
:::

:::template /.templates/AzMon-OpenASCFromSupportRequest.md
:::

:::template /.templates/ASC-NavigateToResourceExplorer.md
:::

1. Locate the desired autoscale configuration from the left hand navigation.  This can be done either using the resource group structure or by selecting providers and expanding the **microsoft.insights** provider and then **autoscalesettings** and then clicking on the desired autoscale configuration.

   ![image.png](/.attachments/image-daa513c8-ea7e-4d10-a727-b66604151802.png)

1. Click on the **AutoScale Queries** tab.

   ![image.png](/.attachments/image-8a94b672-136d-41ad-a1cb-c36d55e295e3.png)

1. Click on the **Scaling Actions** section link.

   ![image.png](/.attachments/image-be850d5c-533a-4da5-bcc8-19914379a43f.png)

1. Use the **Date Time Range (UTC)** date and time picker to populate the time range to evaluate, then click **Run**.

   ![image.png](/.attachments/image-26bfcc41-5ae2-4641-8fe7-321bb0f76461.png)

1. The results presented show the autoscale actions that occurred during the time range specified.

   ![image.png](/.attachments/image-d55588fc-2d3b-46ef-aa9a-79898b71fe86.png)

   Meaningful information provided for each of the actions:

   | Property | Description |
   |----------|-------------|
   | **PreciseTimeStamp** | The timestamp of when the action was initiated. |
   | **ActivityId** | The unique identifier of the action execution.  This can be used to retrieve trace logging of the action execution.  See article [How to analyze Autoscale job trace logging in Azure Support Center](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-analyze-Autoscale-job-trace-logging-in-Azure-Support-Center) |
   | **ExecutionStatus** | The status result of the action execution (usually this will be "Succeeded"). |
   | **ExecutionMessage** | Messaging about what occurred during the action execution (usually this will be "Taking scale actions"). |

