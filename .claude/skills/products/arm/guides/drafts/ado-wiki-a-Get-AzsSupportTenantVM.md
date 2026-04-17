---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Crp.ps1/Get-AzsSupportTenantVM"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Crp.ps1/Get-AzsSupportTenantVM"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportTenantVM

# Synopsis

Gets tenant VM information from CRP.

# Parameters

## SUBSCRIPTIONID

The subscription guid that contains the VM

## RESOURCEGROUPNAME

The display name of the resource group that contains the VM

## VMNAME

The display name of the VM

## RESOURCEURI

The Resource ID associated with the VM, such as:
    /subscriptions/add673cf-3be5-46d1-ac24-d48e2de65a26/resourceGroups/AppService.lnv3/providers/Microsoft.Compute/virtualMachines/CN0-VM

## INCLUDEFABRICINFORMATION

Collects information from clustering and hyper-v, such as the owning node and hyper-v status

## INCLUDEOSPROPERTIES

Collects information from CRP regarding deployment image, OS sku, hardware profile, etc

# Examples

## Example 1

```powershell
Get-AzsSupportTenantVM -SubscriptionId "add673cf-3be5-46d1-ac24-d48e2de65a26" -ResourceGroupName "AppService.lnv3" -VMName "CN0-VM" -IncludeFabricInformation
```

## Example 2

```powershell
Get-AzsSupportTenantVM -SubscriptionId "add673cf-3be5-46d1-ac24-d48e2de65a26"
```

## Example 3

```powershell
Get-AzsSupportTenantVM -ResourceUri "/subscriptions/add673cf-3be5-46d1-ac24-d48e2de65a26/resourceGroups/AppService.lnv3/providers/Microsoft.Compute/virtualMachines/CN0-VM" -IncludeFabricInformation
```


