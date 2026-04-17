---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/How to install or uninstall Custom Script Extension_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Agents%20%26%20Extensions%20(AGEX)/How%20Tos/Extension/How%20to%20install%20or%20uninstall%20Custom%20Script%20Extension_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Install or Uninstall Custom Script Extension (CSE)

## Summary

The Custom Script Extension downloads and executes scripts on Azure VMs. Useful for post-deployment configuration, software installation, or management tasks.

## Install Methods

### Azure Bicep
- **Windows VM**: Publisher `Microsoft.Compute`, Type `CustomScriptExtension`, Version `1.10`
- **Windows VMSS**: Same publisher/type, in extensionProfile
- **Linux VM**: Publisher `Microsoft.Azure.Extensions`, Type `CustomScript`, Version `2.1`
- **Linux VMSS**: Same as Linux VM, in extensionProfile

### ARM JSON Template
- Windows: `Microsoft.Compute` / `CustomScriptExtension`
- Linux: `Microsoft.Azure.Extensions` / `CustomScript`

### Azure CLI (`az vm extension set`)
- Windows: `--name CustomScriptExtension --publisher Microsoft.Compute`
- Linux: `--name CustomScript --publisher Microsoft.Azure.Extensions`
- Supports: Public URI, Storage Account + Key, Managed Identity

### Azure PowerShell
- `Set-AzVMCustomScriptExtension` (Windows only, no Managed Identity)
- `Set-AzVMExtension` (Windows & Linux, supports Managed Identity)
- VMSS: `Add-AzVmssExtension` + `Update-AzVmss`

## Uninstall Methods

### Azure CLI
```
az vm extension delete -g "myResourceGroup" --vm-name "myVM" -n "CustomScript"
```

### Azure PowerShell
- `Remove-AzVMCustomScriptExtension` (Windows only)
- `Remove-AzVMExtension` (Windows & Linux)
