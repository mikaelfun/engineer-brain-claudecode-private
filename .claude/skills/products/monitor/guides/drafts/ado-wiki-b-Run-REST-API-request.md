---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/General/How-to: Run a REST API request"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Log%20Analytics/How-To%20Guides/General/How-to%3A%20Run%20a%20REST%20API%20request"
importDate: "2026-04-07"
type: troubleshooting-guide
---

### This article shows how you can run a simple API Request from PowerShell, without using additional tools (ex: Postman, ARMClient).



In the below example, the code is making a GET request towards the Automation Account <font color="blue">TR24AA</font>, which lives in Resource Group <font color="green">DefaultResourceGroup-WEU</font> on subscription with ID <font color="red">00000000-0000-0000-0000-000000000000</font>. 

The example is illustrated on the REST API [documentation](https://learn.microsoft.com//rest/api/automation/automationaccount/get). 

Open PowerShell and copy this code - make sure to adjust it using your details in the $Uri variable. 

```
############################################################################################
## 
 
$AutomationAccountName            = "TR24AA"
$ResourceGroupName                = "TR24"
$SubscriptionId                   = "00000000-0000-0000-0000-000000000000"      
$TenantID                         = "00000000-0000-0000-0000-000000000000"
 
## updates the variables above as needed or build your resource Uri manually
##
############################################################################################

$AzureContext = Connect-AzureRmAccount      
$token = ($AzureContext.Context.TokenCache.ReadItems() | where-object {$_.TenantId -like $TenantID }).AccessToken
$header = @{Authorization = "Bearer $token"}

$Uri =  "https://management.azure.com/subscriptions/$subscriptionId/resourceGroups/$ResourceGroupName/providers/Microsoft.Automation/automationAccounts/$AutomationAccountName`?api-version=2015-10-31"

$Response = (Invoke-WebRequest -Method Get -Uri $uri  -Headers $authheader).content | ConvertFrom-Json
$Response
```

This is what the response looks like:

![image.png](/.attachments/image-d1b57d73-a600-4558-9a5e-6eb64e834143.png)

If you want to drill in further into the properties field, simply run `$Response.properties`.

![image.png](/.attachments/image-24106fc1-0a15-4a44-b7c2-d0ac5b292481.png)

