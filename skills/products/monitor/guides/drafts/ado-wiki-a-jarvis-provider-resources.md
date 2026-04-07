---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Jarvis/How to get resources of an Azure provider from Jarvis"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/Jarvis/How%20to%20get%20resources%20of%20an%20Azure%20provider%20from%20Jarvis"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

# Quick Link
---
For convenience, if you are already familiar with these steps, the following link can be used to take you directly to this action: 
* https://jarvis-west.dc.ad.msft.net/50A6640A?genevatraceguid=a1387cba-e337-4783-8a24-0fb0325a7d67

# Instructions
---
To get the resources of an Azure resource provider, follow the steps below:

1. Open a browser and navigate to [Jarvis Actions](https://jarvis-west.dc.ad.msft.net/actions).
1. Set **Environment** to match the Azure environment you want to work against (usually Public).

    ![image.png](/.attachments/image-5617a203-44a0-4fe2-8499-c3651b1c1876.png)

1. In **Filter**, type **Get resources from provider** to filter down the action results then click on **Get resources from provider**.

    ![image.png](/.attachments/image-392b7ce5-cab0-4770-bc93-9579fdfb091a.png)

1. Populate the form values as per the table below:

   | Property | Value |
   |----------|-------|
   | Endpoint | Azure Resource Manager |
   | Provider resources uri | The path to the subscription, resource provider and desired collection:<br />/subscriptions/SUBSCRIPTIONID/providers/microsoft.compute/virtualMachines<br /><br />**Example:**<br />/subscriptions/00000000-0000-0000-0000-000000000000/providers/microsoft.compute/virtualMachines |
   | Query String (optional) | api-version=\<apiversion\> (for example api-version=2019-12-01)<br><br>If you don't know what API version to use, set it to any value and it will cause an error that tells you the available API versions for the resource that you provided.  Update the value to use the newest identified API version (for example api-version=IDONTKNOW). |
1. Click **Run**.

    ![image.png](/.attachments/image-365d651e-7f0b-4473-a46d-48e2d0d9e728.png)

# Results
---
If everything worked as expected, you should see a status of Success and an output of all resources in the collection.  

![image.png](/.attachments/image-52e98283-7891-48d4-a973-55ca33a063b3.png)
