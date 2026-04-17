---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Crp.ps1/Get-AzsSupportSubscriptionVHDDetail"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Crp.ps1/Get-AzsSupportSubscriptionVHDDetail"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportSubscriptionVHDDetail

# Description

Gets VHD information for both Managed and Unmanaged VMs by Subscription

# Synopsis

Checks subscriptions for VMs and retrieves VHD information

# Parameters

## ONLYDEALLOCATED

Switch to only get deallocated VMs from Subscriptions

## SUBSCRIPTIONIDS

Array of SubscriptionIds you want to pull from, default is all Subscriptions

# Examples

## Example 1

```powershell
Get-AzsSupportSubscriptionVHDDetail
```

## Example 2

```powershell
Get-AzsSupportSubscriptionVHDDetail -OnlyDeallocated
```

## Example 3

```powershell
Get-AzsSupportSubscriptionVHDDetail -OnlyDeallocated | Group-Object ObjectStore
```


