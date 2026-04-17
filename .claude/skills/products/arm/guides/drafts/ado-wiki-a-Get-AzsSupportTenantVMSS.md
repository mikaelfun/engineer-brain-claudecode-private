---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Crp.ps1/Get-AzsSupportTenantVMSS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Crp.ps1/Get-AzsSupportTenantVMSS"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Get-AzsSupportTenantVMSS

# Synopsis

Gets tenant VMMS information from CRP.

# Parameters

## SUBSCRIPTIONID

The subscription guid that contains the VMSS

## RESOURCEGROUPNAME

The display name of the resource group that contains the VMSS

## VMSSNAME

The display name of the VMSS

## VIRTUALMACHINE

The display name of the VM

## RESOURCEURI

The Resource ID associated with the VMSS, such as:
    /subscriptions/add673cf-3be5-46d1-ac24-d48e2de65a26/resourceGroups/AppService.lnv3/providers/Microsoft.Compute/virtualMachineScaleSets/FrontEndsScaleSet

## INCLUDEFABRICINFORMATION

Collects information from clustering and hyper-v, such as the owning node and hyper-v status

## INCLUDEOSPROPERTIES

Collects information from CRP regarding deployment image, OS sku, hardware profile, etc

# Examples

## Example 1

```powershell
Get-AzsSupportTenantVMSS -SubscriptionId "add673cf-3be5-46d1-ac24-d48e2de65a26" -ResourceGroupName "AppService.lnv3" -VMSSName "FrontEndsScaleSet" -IncludeFabricInformation
```

## Example 2

```powershell
Get-AzsSupportTenantVMSS -ResourceUri "/subscriptions/add673cf-3be5-46d1-ac24-d48e2de65a26/resourceGroups/AppService.lnv3/providers/Microsoft.Compute/virtualMachineScaleSets/FrontEndsScaleSet" -IncludeFabricInformation
```


