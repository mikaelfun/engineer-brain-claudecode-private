---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Jarvis/How to get details of an Azure Event Hub Namespace from Jarvis"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/Jarvis/How%20to%20get%20details%20of%20an%20Azure%20Event%20Hub%20Namespace%20from%20Jarvis"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

# Quick Link
---
For convenience, if you are already familiar with this process, the following link can be used to take you directly to the Jarvis action:

* https://portal.microsoftgeneva.com/10780582?genevatraceguid=936f7ccf-9a1a-4d36-9dc4-8e273d2d88e0

# Instructions
---
1. Identify the Azure Resource Id of the Event Hub Namespace for which you want to get the details (for example /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/Testing1/providers/Microsoft.EventHub/namespaces/azmoncsstesting1).

    [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)

1. Open a browser and navigate to [Jarvis Actions](https://jarvis-west.dc.ad.msft.net/actions).
1. Set **Environment** to match the Azure environment you want to work against (usually Public).

    ![image.png](/.attachments/image-5617a203-44a0-4fe2-8499-c3651b1c1876.png)

1. In **Filter**, type **Get ARM Namespace properties** to filter down the action results then click on **Get ARM Namespace properties**.

   ![image.png](/.attachments/image-e2fd3248-5585-4412-8feb-78d11ba8ce88.png)

1. Populate the form values as per the table below:

   | Property | Value |
   |----------|-------|
   | Endpoint | ServiceBus |
   | Resource uri| The Azure resource identifier of the Event Hub Namespace. |


1. Click **Run**.

   ![image.png](/.attachments/image-fdc8b71c-1210-47f1-bb80-90599bad22d7.png)

# Results
---
If everything works as expected, you should see a status of Success and a JSON structured output of the resource.

``` json
{
	"sku": {
		"name": "Standard",
		"tier": "Standard",
		"capacity": 1
	},
	"id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/Testing1/providers/Microsoft.EventHub/namespaces/azmoncsstesting1",
	"name": "azmoncsstesting1",
	"type": "Microsoft.EventHub/Namespaces",
	"location": "East US",
	"tags": {},
	"properties": {
		"disableLocalAuth": false,
		"zoneRedundant": true,
		"isAutoInflateEnabled": false,
		"maximumThroughputUnits": 0,
		"kafkaEnabled": true,
		"provisioningState": "Succeeded",
		"metricId": "00000000-0000-0000-0000-000000000000:azmoncsstesting1",
		"createdAt": "2021-06-13T22:08:22.547Z",
		"updatedAt": "2021-06-13T22:09:25.377Z",
		"serviceBusEndpoint": "https://azmoncsstesting1.servicebus.windows.net:443/",
		"status": "Active"
	}
}
```
