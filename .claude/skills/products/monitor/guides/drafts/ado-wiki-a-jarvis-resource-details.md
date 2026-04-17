---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Jarvis/How to get details of an Azure resource from Jarvis"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/Jarvis/How%20to%20get%20details%20of%20an%20Azure%20resource%20from%20Jarvis"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

# Quick Link
---
For convenience, if you are already familiar with this process, the following link can be used to take you directly to the Jarvis action:

* https://jarvis-west.dc.ad.msft.net/D94E8EB5?genevatraceguid=bde595a8-347e-4582-a41f-5dce8a9cc451

# Instructions
---
1. Identify the Azure Resource Id for which you want to get the details (for example /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/*******commonresources/providers/microsoft.insights/actionGroups/Common%20Notification).

    [How to get the ResourceId value of an Azure resource from Azure Support Center](/Azure-Monitor/How%2DTo/Azure-Support-Center/How-to-get-the-ResourceId-value-of-an-Azure-resource-from-Azure-Support-Center)

1. Open a browser and navigate to [Jarvis Actions](https://jarvis-west.dc.ad.msft.net/actions).
1. Set **Environment** to match the Azure environment you want to work against (usually Public).

    ![image.png](/.attachments/image-5617a203-44a0-4fe2-8499-c3651b1c1876.png)

1. In **Filter**, type **Get resource from URI** to filter down the action results then click on **Get resource from URI**.

   ![image.png](/.attachments/image-2585c634-d6da-49b4-a813-2cb2dd25ce16.png)

1. Populate the form values as per the table below:

   | Property | Value |
   |----------|-------|
   | Endpoint | Azure Resource Manager |
   | Resource uri| The Azure resource identifier. |
   | Query String (optional) | api-version=\<apiversion\> (for example api-version=2019-06-01)<br><br>If you don't know what API version to use, set it to any value and it will cause an error that tells you the available API versions for the resource that you provided.  Update the value to use the newest identified API version (for example api-version=IDONTKNOW). |

1. Click **Run**.

   ![image.png](/.attachments/image-128310e4-a7d3-4295-bb5d-36bc9343fb65.png)

# Results
---
If everything works as expected, you should see a status of Success and a JSON structured output of the resource.

``` json
{
    "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/*******commonresources/providers/microsoft.insights/actionGroups/Common%20Notification",
    "type": "Microsoft.Insights/ActionGroups",
    "name": "Common Notification",
    "location": "Global",
    "kind": null,
    "tags": {},
    "properties": {
        "groupShortName": "CommonNotify",
        "enabled": true,
        "emailReceivers": [
            {
                "name": "Email-*******_-EmailAction-",
                "emailAddress": "*******@microsoft.com",
                "status": "Enabled",
                "useCommonAlertSchema": true
            }
        ],
        "smsReceivers": [],
        "webhookReceivers": [],
        "itsmReceivers": [],
        "azureAppPushReceivers": [],
        "automationRunbookReceivers": [],
        "voiceReceivers": [],
        "logicAppReceivers": [],
        "azureFunctionReceivers": [],
        "armRoleReceivers": []
    },
    "identity": null
}
```
