---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Jarvis/How to get Azure Active Directory Tenant Id from Azure Subscription Id in Jarvis"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/Jarvis/How%20to%20get%20Azure%20Active%20Directory%20Tenant%20Id%20from%20Azure%20Subscription%20Id%20in%20Jarvis"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

# Quick Link
---
For convenience, if you are already familiar with this process, the following link can be used to take you directly to the Jarvis action:

* https://jarvis-west.dc.ad.msft.net/9F7714F0?genevatraceguid=6b8a80b3-e528-4bc6-a075-6c4b1125e4d4

# Instructions
---
1. Identify the Azure Subscription Id for which you want to get the associated Azure Active Directory (AAD) Tenant Id.  

1. Open a browser and navigate to [Jarvis Actions](https://jarvis-west.dc.ad.msft.net/actions).

1. Set **Environment** to match the Azure environment you want to work against (usually Public).

    ![image.png](/.attachments/image-5617a203-44a0-4fe2-8499-c3651b1c1876.png)

1. In **Filter**, type **Get Subscription Tenant ID** to filter down the action results then click on **Get Subscription Tenant ID**.

   ![image.png](/.attachments/image-87763880-cb63-4978-873f-6c60cf697945.png)

1. Populate the form values as per the table below:

   | Property | Value |
   |----------|-------|
   | Endpoint | Microsoft |
   | Subscription | The Azure Subscription Id. |

1. Click **Run**.

   ![image.png](/.attachments/image-3c68fd4f-bd3a-40ca-be2d-733e3d331f6b.png)

# Results
---
If everything works as expected, you should see a status of Success and a GUID returned that is the Azure Active Directory (AAD) Tenant Id that is associated to the provided Azure subscription.

```
00000000-0000-0000-0000-000000000000
```
