---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: List Associated DCRs and DCEs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/How-To/AMA%3A%20HT%3A%20List%20Associated%20DCRs%20and%20DCEs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Azure Support Center (ASC)
## DCR and Machine in Same Subscription
***Azure Support Center > Resource Explorer > Resource Provider (drop down)***

![image.png](/.attachments/image-6b84e1b7-fe9e-4633-adbc-dd1e923e817a.png)

***Microsoft.Insights > dataCollectionRules > ResourceId***

*Input the ResourceId value of the machine*

![image.png](/.attachments/image-bd50f74e-bb0a-4123-851a-85b97a90d66a.png)

![image.png](/.attachments/image-712f1ff5-2d5f-400a-b7c6-e0981063c1a2.png)

## DCR and Machine in Different Subscriptions
***Azure Support Center > Resource Explorer > SubscriptionId > ARG Query Editor***

![image.png](/.attachments/image-048a9d99-4e90-4bc4-8352-db4000bfea64.png)

Use the following query to list the Data Collection Rules (DCR) and Data Collection Endpoints (DCE) associated with a machine. **On line three, replace the id value with the ResourceId of the machine from your scenario.**

```
insightsresources
| where type == "microsoft.insights/datacollectionruleassociations"
| where id startswith "/subscriptions/{subscriptionId/resourceGroups/{resourcegroup}/providers/{provider}/{type}/{name}"
| extend associationType = iff(isnotnull(properties.dataCollectionRuleId), "dataCollectionRule", "dataCollectionEndpoint")
| extend associationId = iff(isnotnull(properties.dataCollectionRuleId), properties.dataCollectionRuleId, properties.dataCollectionEndpointId)
| project associationType, associationId
```

![image.png](/.attachments/image-8a6926fe-5c5f-4bfe-be8a-1bf5d7c48acf.png)

## We know subscriptionId and DCR ImmutableId
If we know the subscriptionId and the DCR immutableId, but we don't know the resourceId of the DCR, we can use the following Azure Resource Graph Query in ASC (or the customer's portal).

```
resources
| where type =~ "microsoft.insights/datacollectionrules"
| extend immutableId = properties.immutableId
| where immutableId =~ "dcr-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

# Azure Portal
***Azure Portal > Azure Resource Graph Explorer***

Use the following query to list the Data Collection Rules (DCR) and Data Collection Endpoints (DCE) associated with a machine. **On line three, replace the id value with the ResourceId of the machine from your scenario.**

```
insightsresources
| where type == "microsoft.insights/datacollectionruleassociations"
| where id startswith "/subscriptions/{subscriptionId/resourceGroups/{resourcegroup}/providers/{provider}/{type}/{name}"
| extend associationType = iff(isnotnull(properties.dataCollectionRuleId), "dataCollectionRule", "dataCollectionEndpoint")
| extend associationId = iff(isnotnull(properties.dataCollectionRuleId), properties.dataCollectionRuleId, properties.dataCollectionEndpointId)
| project associationType, associationId
```

![image.png](/.attachments/image-871ce86e-abe3-411f-bf9d-2891ff42c6d9.png)

# Azure Cloud Shell
Reference at [Get-AzDataCollectionRuleAssociation](https://learn.microsoft.com/powershell/module/az.monitor/get-azdatacollectionruleassociation)

```
$machineResourceId = "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/xxxxxxxxxxx/providers/Microsoft.Compute/virtualMachines/xxxxxxxxxxx"
$associatedDCRs = Get-AzDataCollectionRuleAssociation -TargetResourceId $machineResourceId
$associatedDCRs | Where DataCollectionRuleId -ne $null | Select DataCollectionRuleId | Format-List
```

![image.png](/.attachments/image-fc3d9217-417e-483a-b875-adb0a05d486f.png)

# Azure PowerShell
Reference at [Get-AzDataCollectionRuleAssociation](https://learn.microsoft.com/powershell/module/az.monitor/get-azdatacollectionruleassociation)

```
$tenantId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
$subscriptionId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
$machineResourceId = "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/xxxxxxxxxxx/providers/Microsoft.Compute/virtualMachines/xxxxxxxxxxx"

# Connect to Azure
# Find-Module -Name Az.Accounts | Install-Module
Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process -Force
if (!($AzureContext)) {Connect-AzAccount -TenantId $TenantId}     
$AzureContext = Set-AzContext -SubscriptionId $subscriptionID
$token = (Get-AZAccessToken).Token

# Find-Module -Name Az.Monitor | Install-Module
$associatedDCRs = Get-AzDataCollectionRuleAssociation -TargetResourceId $machineResourceId
$associatedDCRs | Where DataCollectionRuleId -ne $null | Select DataCollectionRuleId | Format-List
```

![image.png](/.attachments/image-4d75c961-2ca6-4b9d-bf51-53211c31437d.png)

# REST API
Reference at [Data Collection Rule Associations - List By Resource](https://learn.microsoft.com/rest/api/monitor/data-collection-rule-associations/list-by-resource?)

![image.png](/.attachments/image-924f8216-4a35-475b-b4d2-c0396025ed19.png)

![image.png](/.attachments/image-217f7412-ffd7-43e0-b642-729d80c85028.png)

![image.png](/.attachments/image-e915f415-e866-450d-9ee7-6f3cc7cf0dcb.png)

# Known Issues
#89335