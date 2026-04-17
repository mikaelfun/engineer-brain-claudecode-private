---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/MS Graph Powershell/MS Graph PowerShell working with BodyParameter"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FMS%20Graph%20Powershell%2FMS%20Graph%20PowerShell%20working%20with%20BodyParameter"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Dev
- cs.AAD-Dev-Powershell
- cw.comm-devex
Author:
- willfid
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::


# How to work with BodyParameter in Microsoft Graph PowerShell          

[[_TOC_]]

# Overview

Basics of using Microsoft (MS) Graph PowerShell to update objects and using BodyParameter

These are just some examples that could be used. By no means would I consider these the "best" way to handle each scenario, however, this should get you started in the right direction.

In general, a good thing to keep in mind, a Microsoft Graph type could be resembled as a PowerShell Hashtable or Array.

To create a PowerShell Hashtable, it would look like this
```
$Hashtable = @{}
```

To create a PowerShell Array, it would look like this
```
$Array = @()
```

I would recommend then converting these data type objects into JSON to attempt to avoid possible data type casting issues.
```
$json = $Hashtable | ConvertTo-Json -Compress -Depth 99
```

The **compress** parameter removes many of the unnecessary spaces and special characters like new line characters and carriage return characters that might also cause problems.

The **-depth** parameter ensures the nested Hashtables are also converted.

# Scenario: Simple JSON with no complex types
```
$Properties = @{
     "city" =  "Dallas" # String
     "birthday" = "1970-01-01T00:00:00Z" # DateTime
     "accountEnabled" = $true # Boolean
     "businessPhones" = @("+1 555-555-5551", "+1 555-555-5552") # Collection of strings
     
} | ConvertTo-Json -Compress -Depth 99

Update-MgUser -UserId $user -BodyParameter $Properties
```

#Scenario: What if you wanted to update another complex type for a user? For example the password profile

```
$Properties = @{
     "city" =  "Dallas" # String
     "birthday" = "1970-01-01T00:00:00Z" # DateTime
     "accountEnabled" = $true # Boolean
     "businessPhones" = @("+1 555-555-5551", "+1 555-555-5552") # List of strings
     "passwordProfile" = @{
        "forceChangePasswordNextSignIn" = $true
        "password" = "new_temp_password"
     }
     
} | ConvertTo-Json -Compress -Depth 99

Update-MgUser -UserId $user -BodyParameter $Properties
```

# Scenario: What if its a collection of a complex type? for example the assignedLicenses
```
$Properties = @{
    "city" =  "Dallas" # String
    "birthday" = "1970-01-01T00:00:00Z" # DateTime
    "accountEnabled" = $true # Boolean
    "businessPhones" = @("+1 555-555-5551", "+1 555-555-5552") # List of strings
    "passwordProfile" = @{
        "forceChangePasswordNextSignIn" = $true
        "password" = "new_temp_password"
     }
     "assignedLicenses" = @(
       @{
         "skuId" = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"
         "disabledPlans" = "ded3d325-1bdc-453e-8432-5bac26d7a014"
       },
       @{
         "skuId" = "efccb6f7-5641-4e0e-bd10-b4976e1bf68e"
         "disabledPlans" = "6c57d4b6-3b23-47a5-9bc9-69f17b4947b3"
       }
    
     )
} | ConvertTo-Json -Compress -Depth 99

Update-MgUser -UserId $user -BodyParameter $Properties
```

# Scenario: Or you can just convert a raw json string to something usable by MS Graph PowerShell

```
$Json = @'
{
    "city":  "Dallas",
    "birthday": "1970-01-01T00:00:00Z", 
    "accountEnabled": true, 
    "businessPhones": ["+1 555-555-5551", "+1 555-555-5552"],
    "passwordProfile": {
        "forceChangePasswordNextSignIn": true,
        "password": "new_temp_password"
     },
     "assignedLicenses": [
       {
         "skuId": "06ebc4ee-1bb5-47dd-8120-11324bc54e06",
         "disabledPlans": ["ded3d325-1bdc-453e-8432-5bac26d7a014"]
       },
       {
         "skuId": "efccb6f7-5641-4e0e-bd10-b4976e1bf68e",
         "disabledPlans": ["6c57d4b6-3b23-47a5-9bc9-69f17b4947b3"]
       }
     ]
}
'@ | ConvertFrom-Json | ConvertTo-Json -Compress -Depth 99

Update-MgUser -UserId $user -BodyParameter $Json
```

# Scenario: Dynamically add additional properties

Let's say we start with the following
```
$Properties = @{
     "city" =  "Dallas" # String
     "birthday" = "1970-01-01T00:00:00Z" # DateTime
     "accountEnabled" = $true # Boolean
     "businessPhones" = @("+1 555-555-5551", "+1 555-555-5552") # Collection of strings
     
} 
```

Then later in the script you want to add another property like displayName
```
$Properties.displayName = "John Smith"
```

Or you want to add something like the passwordProfile
```
$Properties.passwordProfile = @{}
$Properties.passwordProfile.forceChangePasswordNextSignIn = $true
$Properties.passwordProfile.password = "xxx"
```

Or if you want to add collections like assignedLicenses
```
$Properties.assignedLicenses = @()
$Properties.assignedLicenses += @{
         "skuId" = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"
         "disabledPlans" = @("ded3d325-1bdc-453e-8432-5bac26d7a014")
}
```

Once you're done adding additional properties, convert it to JSON and send it to MS Graph
```
$json = $Properties | ConvertTo-Json -Compress -Depth 99
Update-MgUser -UserId $user -BodyParameter $Json
```

Learn more about working with PowerShell HashTables
https://docs.microsoft.com/en-us/powershell/scripting/learn/deep-dives/everything-about-hashtable?view=powershell-7.2