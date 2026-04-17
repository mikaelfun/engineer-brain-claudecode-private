---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/Manually Reinstall CSE_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FExtension%2FManually%20Reinstall%20CSE_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Manually Reinstall Custom Script Extension (CSE)

## Summary

When CSE is not working, unresponsive, or requires multiple manual troubleshooting attempts (multiple archive folders under `C:\WindowsAzure\Logs\Plugins\Microsoft.Compute.CustomScriptExtension`), a clean reinstall is recommended.

## Prerequisites

- Admin access to the VM

## Instructions

1. Remove the registry key (run CMD as Administrator):

```cmd
reg delete "HKLM\SOFTWARE\Microsoft\Windows Azure\HandlerState\Microsoft.Compute.CustomScriptExtension" /f
```

2. Remove the extension folder:

```cmd
rd /s /q c:\packages\plugins\Microsoft.Compute.CustomScriptExtension
```

3. Remove the extension from Azure:

### Azure PowerShell

```powershell
Connect-AzAccount
Set-AzContext -Subscription "<Subscription ID>"
Get-AzVMExtension -ResourceGroupName "myResourceGroup" -VMName "myVM"
Remove-AzVMCustomScriptExtension -ResourceGroupName "myResourceGroup" -VMName "myVM" -Name "CustomScript" -Force
```

### Azure CLI

```bash
az login
az account set --subscription "<Subscription ID or name>"
az vm extension list -g "MyResourceGroup" --vm-name "MyVm"
az vm extension delete -g "MyResourceGroup" --vm-name "MyVm" -n "CustomScript"
```

4. Restart the VM

5. Reinstall the Custom Script Extension as needed
