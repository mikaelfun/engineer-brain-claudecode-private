---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/Uninstall Extension_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FExtension%2FUninstall%20Extension_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Uninstall Linux & Windows VM Extension

**NOTE:** Always attempt to uninstall VM Extensions through the Azure Portal first. Use Azure CLI or PowerShell only if the Azure Portal gives errors.

## Uninstall via Azure Portal

1. Locate the VM in Azure Portal and select it.
2. Click "Extensions" option → new pane opens.
3. Select the extension to uninstall from the list.
4. Click uninstall in the new pane.
5. Wait until the portal confirms the extension has been uninstalled.

## Uninstall Extension via CLI

Reference: [Azure CLI VM Extension](https://learn.microsoft.com/en-us/cli/azure/vm/extension?view=azure-cli-latest#az-vm-extension-delete)

1. List installed extensions:
   ```sh
   az vm extension list -g MyResourceGroup --vm-name MyVm
   ```
2. Delete the extension:
   ```sh
   az vm extension delete -g MyResourceGroup --vm-name MyVm -n MyExtensionName
   ```

## Uninstall Windows Extension via PowerShell

1. Get all VM info including extensions:
   ```powershell
   Get-AzVM -ResourceGroupName "<rgname>" -Name "<vmname>" -Status
   ```
2. Remove the extension:
   ```powershell
   Remove-AzVMExtension -ResourceGroupName <rgname> -VMName <vmname> -Name "<extensionname>"
   ```

## Manual Procedure (Fallback)

If the above methods fail, follow the [Manual Procedure](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494967) for manually removing extensions from the VM.

## Root Cause Classification

/Root Cause - Windows Azure/Virtual Machines/Extensions and Agent/Windows Guest Agent/Configuration Issues
