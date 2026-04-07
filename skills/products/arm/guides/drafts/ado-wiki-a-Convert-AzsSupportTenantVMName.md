---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Crp.ps1/Convert-AzsSupportTenantVMName"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Crp.ps1/Convert-AzsSupportTenantVMName"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Convert-AzsSupportTenantVMName

# Synopsis

Converts a InternalVmId to a tenant internal VM name and vice versa. Also retrieves the owning node of the VM being queried

# Parameters

## INTERNALVMID

Provide the InternalVmId of the VM you wish to query

## RESOURCEURI

Provide the tenant VM name that you wish to query

## CLUSTER

Specify the cluster to query to locate the virtual machine. Used in conjuction with InternalVmId

# Examples

## Example 1

```powershell
Convert-AzsSupportTenantVMName b0c81fa5-0917-4c74-af2e-439fd0f17407

The default parameter used is InternalVmId, you can simply pass an InternalVmId to the function and retrieve the internal VM Name
```

## Example 2

```powershell
Convert-AzsSupportTenantVMName InternalVmId b0c81fa5-0917-4c74-af2e-439fd0f17407

Pass a tenant VM InternalVmId to the function to retrieve the internal VM Name
```

## Example 3

```powershell
Convert-AzsSupportTenantVMName -ResourceUri /subscriptions/add673cf-3be5-46d1-ac24-d48e2de65a26/resourceGroups/AppService.lnv3/providers/Microsoft.Compute/virtualMachines/CN0-VM

Pass the tenant VM internal name to the function to retrieve the InternalVmId that can be used in other commands
```

## Example 4

```powershell
$tenantVM = Convert-AzsSupportTenantVMName -ResourceUri /subscriptions/add673cf-3be5-46d1-ac24-d48e2de65a26/resourceGroups/AppService.lnv3/providers/Microsoft.Compute/virtualMachines/CN0-VM

A resource URI can be passed to the function and the output can be stored in a variable and used in other commands.
```


