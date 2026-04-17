---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/How to install the Run Command Extension_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Agents%20%26%20Extensions%20(AGEX)/How%20Tos/Extension/How%20to%20install%20the%20Run%20Command%20Extension_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Install the Run Command Extension

## Important

There are 2 versions:
- **Action Run Command (v1)** — legacy, uses `az vm run-command invoke`
- **Managed Run Command (v2)** — new, uses `az vm run-command set`

Reference: [Run Command Extension Workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494969)

## Action Run Command (v1)

### Install
- **Portal**: VM Blade → Run command → select script → Run
- **CLI**: `az vm run-command invoke --command-id RunPowerShellScript` (Windows) / `RunShellScript` (Linux)
- **PowerShell**: `Invoke-AzVMRunCommand -CommandId 'RunPowerShellScript'`

### Uninstall
- **CLI**: `az vm run-command invoke --command-id RemoveRunCommandWindowsExtension`
- **PowerShell**: `Invoke-AzVMRunCommand -CommandId 'RemoveRunCommandWindowsExtension'`

## Managed Run Command (v2)

### PowerShell
- **VM**: `Set-AzVMRunCommand` / `Remove-AzVMRunCommand` / `Get-AzVMRunCommand`
- **VMSS**: `Set-AzVmssVMRunCommand` / `Add-AzVmssRunCommand` / `Remove-AzVmssVMRunCommand` / `Get-AzVmssVMRunCommand`

### CLI
- **VM**: `az vm run-command set/delete/show/list`
- **VMSS**: `az vmss run-command set/delete/show/list`

### REST API
```
PUT /subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/{vm}/runcommands/{name}?api-version=2019-12-01
```
