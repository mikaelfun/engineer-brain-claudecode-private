---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Ingestion/HT: Check legacy Azure Activity Logs configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FIngestion%2FHT%3A%20Check%20legacy%20Azure%20Activity%20Logs%20configuration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Legacy Azure Activity Logs collection
---
Legacy Azure Activity Logs are pulled from the Azure cache directly into InMem, hence there's no easy way to check the configuration:

| ![image.png](/.attachments/image-4503af34-f3cc-48f9-b7eb-550b3d9f8524.png) |
|--|

# Scenario
---
In a few very specific scenarios, it may be needed to know to which workspaces are pulling data from a specific subscription.

# Pre-requisites
---
To be able to run the Kusto queries mentioned bellow, you'll need access to the relevant Kusto database/cluster, so please follow the procedure described in [How-To: Connect to Log Analytics Kusto clusters](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/480522/How-to-add-Kusto-clusters-needed-by-Azure-Monitor-to-Kusto-Explorer).

#  Check legacy Azure Activity Logs configuration
---
You can use the following query to list which workspaces (and its subscription and AAD tenant) are pulling data from a specific subscription

Execute: [Web](https://dataexplorer.azure.com/clusters/omsgenevainmemprod.eastus/databases/OperationInsights_InMem_PROD?query=H4sIAAAAAAAAA4WQ0UrDMBSG7/cUh1zpmE6vpUJoxwxsbmz1akiJ6WENdklITi0bPrydrNpC0XORm8P3f/9JiQTyFKq3oLx2pK2BCNjdZW4GnnbYA0ynqgpkD+ihlyCSEY9n8Al1gR4hFcvZNuXLNTyC3Nur++IaRu1SKtIfmo7P8oAQNe4NBuJOC+MqepImL9HfzpFWptQGY2sIDbFf3nnr0JPGAKpZSm0CsESSTI8ORR7t+Esi0myxmmebpkXG14JBEzsI9n+icTjpQ89RaypgDIyfKo/x5fptBzorGZD0e6TsOw/YK4PxX2Hnugur5Jnv0JwnwOAftu3Q89bWvwcnFYrkx57rQNoo6qRPej0nA/QXczgFzh8CAAA=)[Desktop](https://omsgenevainmemprod.eastus.kustomfa.windows.net/OperationInsights_InMem_PROD?query=H4sIAAAAAAAAA4WQ0UrDMBSG7/cUh1zpmE6vpUJoxwxsbmz1akiJ6WENdklITi0bPrydrNpC0XORm8P3f/9JiQTyFKq3oLx2pK2BCNjdZW4GnnbYA0ynqgpkD+ihlyCSEY9n8Al1gR4hFcvZNuXLNTyC3Nur++IaRu1SKtIfmo7P8oAQNe4NBuJOC+MqepImL9HfzpFWptQGY2sIDbFf3nnr0JPGAKpZSm0CsESSTI8ORR7t+Esi0myxmmebpkXG14JBEzsI9n+icTjpQ89RaypgDIyfKo/x5fptBzorGZD0e6TsOw/YK4PxX2Hnugur5Jnv0JwnwOAftu3Q89bWvwcnFYrkx57rQNoo6qRPej0nA/QXczgFzh8CAAA=&web=0) [cluster('omsgenevainmemprod.eastus.kusto.windows.net').database('OperationInsights_InMem_PROD')](https://dataexplorer.azure.com/clusters/omsgenevainmemprod.eastus/databases/OperationInsights_InMem_PROD)

```
let azsubscription = "00000000-0000-0000-0000-000000000000"; //customer subscription ID
ACE | where TIMESTAMP > ago(1h) 
| where activityName == "RestApiInputHandler.GetOnlineContent" 
| where properties contains "DataTypeId=[AUDIT_LOG_REST_API" and properties contains azsubscription
| parse properties with * "AzureCustomerSubscriptionId=[" target_azsub "]" *
| parse properties with * "DataLocation=[" target_AAD " " *
| parse properties with * "CustomerId=[" target_workspaceID "]" *
| distinct target_AAD, target_azsub, target_workspaceID
```

##Interpreting the query output results
If in fact there are workspaces pulling data from the subscription, you'll get an output similar to this:

| ![image.png](/.attachments/image-f45771db-80c7-4f69-9c1c-51fa014a60d4.png) |
|-|

- target_AAD: the Azure Active Directory tenant ID, where the workspace is located
- target_azsub: the Azure Subscription ID, where the workspace is located
- target_workspaceID: the workspace ID

##Sharing the results
---
This information is considered sensitive and should only be provided to administrators\owners of the subscriptions pulling the data.
In doubt, please reach out to your TA\SME\TM 


# Guidance
---

# Useful links
---
