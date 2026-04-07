---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Move-AzsSupportVirtualMachine"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Compute.Cluster.ps1/Move-AzsSupportVirtualMachine"
importDate: "2026-04-06"
type: tool-reference
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Move-AzsSupportVirtualMachine

# Synopsis

Moves a clustered Virtual Machine to a new scale unit host.

# Parameters

## NAME

The hyper-v name of a clustered virtual machine, such as Azs-XRP01, or '0fef161b-65d3-4f08-89e9-30bec15df540'

## SUBSCRIPTIONID

Tenant VM subscription Id

## RESOURCEGROUPNAME

Tenant VM resource group name

## VMNAME

Tenant VM display name

## RESOURCEURI

The uri from the properties blade in the portal, such as '/subscriptions/b8026722-bc65-4c28-b2c7-1178bbd9e5cf/resourceGroups/AppService.HPE1/providers/Microsoft.Compute/virtualMachines/CN0-VM'

## DESTINATIONNODE

Destination scale unit node to move the Virtual Machine to

# Examples

## Example 1

```powershell
Move-AzsSupportVirtualMachine -Name "Azs-XRP01"
```

## Example 2

```powershell
Move-AzsSupportVirtualMachine -Name "Azs-XRP01" -DestinationNode "Azs-Node07"
```

## Example 3

```powershell
Move-AzsSupportVirtualMachine -Name "0fef161b-65d3-4f08-89e9-30bec15df540"
```

## Example 4

```powershell
Move-AzsSupportVirtualMachine -ResourceUri "/subscriptions/b8026722-bc65-4c28-b2c7-1178bbd9e5cf/resourceGroups/AppService.HPE1/providers/Microsoft.Compute/virtualMachines/CN0-VM"
```

## Example 5

```powershell
Move-AzsSupportVirtualMachine -SubscriptionId "b8026722-bc65-4c28-b2c7-1178bbd9e5cf" -ResourceGroupName "AppService.HPE1" -VMName "CN0-VM"
```


