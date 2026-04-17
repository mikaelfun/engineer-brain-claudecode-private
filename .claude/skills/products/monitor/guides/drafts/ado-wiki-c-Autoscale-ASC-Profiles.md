---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Autoscale/How-To/How to get the profiles for an Autoscale configuration from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Autoscale/How-To/How%20to%20get%20the%20profiles%20for%20an%20Autoscale%20configuration%20from%20Azure%20Support%20Center"
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

1. Click on the **Profiles** tab.

   ![image.png](/.attachments/image-75db7b5e-3590-4775-9c96-0446ca17e2e5.png)

1. Under the profiles you will find details for each of the defined profiles and the scale in and scale out rules for each of the profiles.

   ![image.png](/.attachments/image-2763bce8-e6d6-4eff-a91a-729124a2f709.png)

1. In each profile you will find the capacity and scheduling (recurrence) applied to the profile along with a table showing the actions to be applied under which circumstances.

   ![image.png](/.attachments/image-d64192e0-7d3b-46c9-a8f1-f254fd9100ca.png)

   ![image.png](/.attachments/image-af640283-e28e-4f79-8d2a-ca08c7678abb.png)

   | Property | Description |
   |----------|-------------|
   | **Rule Metric Configuration** | The metric configuration that if true will trigger the autoscale action. |
   | **Action** | The action to be performed such as increasing or decreasing the number of instances or setting a specific number of instances. |
   | **Time Grain** | The aggregation period of the metric calculation (for example PT1M = 1 minute aggregation). |
   | **Time Window** | The window of time to check the metric (for example PT5M = look at the last 5 minutes). |
   | **Cooldown** | The period after execution of an autoscale action during which no other autoscale actions can be executed (for example PT5M = no autoscale actions can occur after this action has executed for at least 5 minutes). |

### Bonus
This is great information to just copy and paste into your case notes.
