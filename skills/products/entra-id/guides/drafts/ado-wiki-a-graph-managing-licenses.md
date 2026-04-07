---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Microsoft Graph Managing Licenses"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FMicrosoft%20Graph%20Managing%20Licenses"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to manage licenses and service subscriptions using Microsoft Graph PowerShell

## Get user license details

```powershell
Connect-MgGraph -Scopes "User.Read.All AuditLog.Read.All Organization.Read.All"
Select-MgProfile -Name "beta"

$subscriptions = Get-MgSubscribedSku -All

$graphUsers = Get-MgUser -select "userPrincipalName,assignedLicenses" -All | Select userPrincipalName,assignedLicenses

$results = @()
Foreach ($user in $graphUsers) {
    $detail = [pscustomobject]@{
        UserName = $user.userPrincipalName
        SkuPartNumber = ($subscriptions | where {$user.assignedLicenses.SkuId -contains $_.SkuId}).SkuPartNumber
    }
    $results += $detail
}
$results
```

## Assign user a license

```powershell
$Skus = Get-MgSubscribedSku -all | select skuid,skupartnumber
$Sku = $Skus | where SkuPartNumber -eq "AAD_PREMIUM"
$UserId = "john@contoso.com"

Set-MgUserLicense -UserId $UserId -AddLicenses @{SkuId = $Sku.SkuId} -RemoveLicenses @()

# Verify
(Get-MgUser -UserId $UserId -Property assignedLicenses).assignedLicenses | fl
```

## Assign a group a license

```powershell
$Skus = Get-MgSubscribedSku -all | select skuid,skupartnumber
$Sku = $Skus | where SkuPartNumber -eq "AAD_PREMIUM"
$GroupId = "8fc60324-f133-45c4-bc70-3016ceee3259"

Set-MgGroupLicense -GroupId $groupId -AddLicenses @{SkuId = $Sku.SkuId} -RemoveLicenses @()
```

## Assign a license but disable some included ServicePlans

```powershell
$Skus = Get-MgSubscribedSku -all
$AAD_PREMIUM = $Skus | where SkuPartNumber -eq "AAD_PREMIUM"

$PlansToDisable = @("ADALLOM_S_DISCOVERY", "MFA_PREMIUM")
$DisabledPlans = ($AAD_PREMIUM.ServicePlans | where ServicePlanName -in $PlansToDisable).ServicePlanId

$params = @{
    AddLicenses = @(@{
        DisabledPlans = $DisabledPlans
        SkuId = $AAD_PREMIUM.skuId
    })
    RemoveLicenses = @()
}

Set-MgGroupLicense -GroupId $groupId -BodyParameter $params
# Or for user:
Set-MgUserLicense -UserId $User -BodyParameter $params
```

## Filter for users with specific subscription

```powershell
$subscriptions = Get-MgSubscribedSku -All
$TeamsSubscriptions = $subscriptions | where {$_.servicePlans.servicePlanId -eq "57ff2da0-773e-42df-b2af-ffb7a2317929"}

$graphUsers = Get-MgUser -All -Top 999 -Property "id,userPrincipalName,assignedLicenses,accountEnabled" -Filter "accountEnabled eq true"

$TeamsUser = @()
ForEach($subscription in $TeamsSubscriptions) {
  ForEach($user in $graphUsers) {
    if($user.assignedLicenses.skuId -contains $subscription.skuId -and $user.AccountEnabled -eq $true) {
      $TeamsUser += $user
    }
  }
}
$TeamsUser
```

## Filter for users with no licenses assigned

```powershell
Get-MgUser -ConsistencyLevel eventual -CountVariable $count -All -Filter 'assignedLicenses/$count eq 0'
```

## Helper functions

```powershell
function Get-SubscriptionSkuId($SkuPartNumber) {
  return ($Subscriptions | where {$_.SkuPartNumber -eq "$SkuPartNumber"}).SkuId
}

function Get-ServicePlanId($ServicePlanName) {
  return ($Subscriptions.ServicePlans | where {$_.ServicePlanName -eq "$ServicePlanName"})[0].ServicePlanId
}
```

## More Information

* [Subscription SKU Part Number reference](https://learn.microsoft.com/en-us/azure/active-directory/enterprise-users/licensing-service-plan-reference)
