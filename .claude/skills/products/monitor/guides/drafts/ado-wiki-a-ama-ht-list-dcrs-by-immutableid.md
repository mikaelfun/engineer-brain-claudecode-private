---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: List Data Collection Rules by immutableId"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/How-To/AMA%3A%20HT%3A%20List%20Data%20Collection%20Rules%20by%20immutableId"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Prerequisites
You must already know the **subscriptionId** where the Data Collection Rules (DCR) exist. 

If you are starting with the **immutableId** (for instance, from an agent config), you may need [List Associated DCRs and DCEs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs) to find the subscriptionId. 

# Azure Support Center (ASC)
***Azure Support Center > Resource Explorer > SubscriptionId > ARG Query Editor***

![image.png](/.attachments/image-048a9d99-4e90-4bc4-8352-db4000bfea64.png)

Use the following query to list the Data Collection Rules (DCR) and immutableId values.

```
resources
| where type == "microsoft.insights/datacollectionrules"
| extend immutableId = properties.immutableId
| project immutableId, id
```

![image.png](/.attachments/image-b8514022-5a14-4d27-81fc-2d97c21766f6.png)

# Azure Cloud Shell
Reference at [Get-AzDataCollectionRule](https://learn.microsoft.com/powershell/module/az.monitor/get-azdatacollectionrule?view=azps-12.4.0&viewFallbackFrom=azps-12.2.0)

```
Get-AzDataCollectionRule -SubscriptionId {subscriptionId} | Select ImmutableId, Id
```

![image.png](/.attachments/image-19a7a9e1-5ab9-4149-810f-99d2b338bd08.png)

# Azure PowerShell
Reference at [Get-AzDataCollectionRule](https://learn.microsoft.com/powershell/module/az.monitor/get-azdatacollectionrule?view=azps-12.4.0&viewFallbackFrom=azps-12.2.0)

```
$tenantId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
$subscriptionId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Connect to Azure
# Find-Module -Name Az.Accounts | Install-Module
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process -Force
if (!($AzureContext)) {Connect-AzAccount -TenantId $TenantId}     
$AzureContext = Set-AzContext -SubscriptionId $subscriptionID
$token = (Get-AZAccessToken).Token

# Find-Module -Name Az.Monitor | Install-Module
Get-AzDataCollectionRule -SubscriptionId $subscriptionId | Select ImmutableId, Id
```

![image.png](/.attachments/image-e61841e7-7482-43d4-8df3-90386233e3de.png)

# REST API
Reference at [Data Collection Rules - List By Subscription](https://learn.microsoft.com/rest/api/monitor/data-collection-rules/list-by-subscription?view=rest-monitor-2023-03-11&tabs=HTTP)

![image.png](/.attachments/image-47db7fcc-5e3f-4a77-8d6b-88fa1063df30.png)

![image.png](/.attachments/image-fbe915db-c745-4fb9-8794-5d4cc8f5bd1a.png)

![image.png](/.attachments/image-513bd30a-1bc8-465f-9ff3-8ca89ee79fa4.png)