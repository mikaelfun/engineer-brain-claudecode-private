---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/Install BGInfo_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Agents%20%26%20Extensions%20(AGEX)/How%20Tos/Extension/Install%20BGInfo_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Install / Uninstall BGInfo Extension

## Summary

BGINFO is the Sysinternals tool that provides System information by default on the desktop.

## Install

To add the BGinfo extension to your VM, use the following powershell or CLI commands:

### PowerShell
```powershell
$rgName = "myResourceGroup"
$vmName = "myVM"
$location = "myLocation"
Set-AzVMExtension -Publisher Microsoft.Compute -ExtensionType BGInfo -ResourceGroupName $rgName -VMName $vmName -Name BGInfo -TypeHandlerVersion 2.1 -Location $location
```

### Azure CLI
```bash
$rgName = "myResourceGroup"
$vmName = "myVM"
$location = "myLocation"
az vm extension set -n BGInfo --publisher Microsoft.Compute --vm-name $vmName -g $rgName --version 2.1
```

## Uninstall

If there is need to remove the BGInfo extension, you can run the below PowerShell or Azure CLI commands:

### PowerShell
```powershell
$rgName = "myResourceGroup"
$vmName = "myVM"
$location = "myLocation"
Remove-AzVMExtension -ResourceGroupName $rgName -VMName $vmName -Name BGInfo
```

### Azure CLI
```bash
$rgName = "myResourceGroup"
$vmName = "myVM"
$location = "myLocation"
az vm extension delete --resource-group $rgName --vm-name $vmName --name BGInfo
```
