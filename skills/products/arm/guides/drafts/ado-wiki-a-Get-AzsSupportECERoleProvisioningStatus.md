---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Common.ps1/Get-AzsSupportECERoleProvisioningStatus"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Common.ps1%2FGet-AzsSupportECERoleProvisioningStatus"
importDate: "2026-04-06"
type: tool-reference
---

# CSSTools Get-AzsSupportECERoleProvisioningStatus

## Synopsis

Get the provisioning status for virtual machines and physical nodes.

## Parameters

### ROLE

The ECE Role to check status of. Supported roles: BareMetal

## Examples

```powershell
Get-AzsSupportECERoleProvisioningStatus -Role:VirtualMachines | Format-Table Role,Name,ProvisioningStatus,RefNodeId,@{N="StartUpMemoryGB";E={"{0:N2} GB" -f ($_.StartUpMemoryBytes/ 1GB)}},ProcessorCount,DynamicMemory,HighlyAvailable,Id,Type -AutoSize
```

```powershell
Get-AzsSupportECERoleProvisioningStatus -Role:BareMetal | Format-Table Role,Type,ProvisioningStatus,Id,Name,NodeType,Deployed,BmcIPAddress,MacAddress,RefClusterId,NodeInstance,OOBProtocol,OperationStatus,StorageConfigurationStatus -AutoSize
```
