# Custom Metric Deployment on VM/VMSS in Mooncake

> Source: OneNote - Mooncake POD Support Notebook / MONITOR / Case Study / [Monitor]Custom metric on Azure VM_VMSS
> Status: draft (pending SYNTHESIZE review)
> Related JSONL: monitor-onenote-070, monitor-onenote-064

## Overview

Deploy custom metrics via WAD (Windows Azure Diagnostics) / LAD (Linux Azure Diagnostics) extension on VM/VMSS in Mooncake.

**Important**: Custom metrics Sinks feature is NOT available in Mooncake. Metrics are stored in Storage Account and viewable in portal, but cannot be queried via CLI/PowerShell or used for custom metric alert rules.

## Windows VMSS

### Prerequisites
Create 2 configuration files:
- `ProtectedSettings.json` - contains storage account credentials
- `WindowsDiagnosticSettings.json` - diagnostics configuration

### Azure CLI
```bash
ResourceGroupName="vmssRG"
VmssName="vmss-wda"
az vmss extension set \
  --publisher Microsoft.Azure.Diagnostics \
  --name IaaSDiagnostics \
  --resource-group $ResourceGroupName \
  --vmss-name $VmssName \
  --protected-settings ProtectedSettings.json \
  --settings WindowsDiagnosticSettings.json
```

### PowerShell
```powershell
Add-AzVMssDiagnosticsExtension -VirtualMachineScaleSet $vmss `
    -Name $ExtensionName `
    -SettingFilePath $ConfigurationPath `
    -ProtectedSettingFilePath $ProtectedSettingsPath
```

### Post-deployment
Update VMSS instances to latest model:
```powershell
Update-AzVmss -VirtualMachineScaleSet $vmss `
    -ResourceGroupName $ResourceGroupName `
    -VMScaleSetName $VmssName
```

## Linux VMSS

### Azure CLI
```bash
ResourceGroupName="vmssrg"
VmssName="vmss-linux-LDA"
az vmss extension set \
  --publisher Microsoft.Azure.Diagnostics \
  --name LinuxDiagnostic \
  --version 3.0 \
  --resource-group $ResourceGroupName \
  --vmss-name $VmssName \
  --protected-settings ProtectedSettings-linux.json \
  --settings LinuxDiagnosticSettings-linux.json
```

### PowerShell (NOT recommended)
```powershell
# WARNING: protectedSettingFile cannot be parsed due to azVMSS PowerShell module issue
# DO NOT use PowerShell for Linux VMSS LAD deployment
Add-AzVMssExtension -VirtualMachineScaleSet $vmss `
    -Type LinuxDiagnostic `
    -Publisher Microsoft.Azure.Diagnostics `
    -Name LinuxDiagnostic `
    -Setting $PublicSettings `
    -ProtectedSetting $ProtectedSettings `
    -TypeHandlerVersion 3.0
```

## Windows/Linux VM

Configure via Azure Portal:
- Linux VM: Portal > Diagnostic settings > Enable guest-level monitoring
- Windows VM: Portal > Diagnostic settings > Enable guest-level monitoring

Reference: [Linux Diagnostics Extension 4.0](https://learn.microsoft.com/zh-cn/azure/virtual-machines/extensions/diagnostics-linux?tabs=azcli)

## Storage Account Endpoint (Mooncake)

For Mooncake, use China-specific endpoint:
```
storageAccountEndPoint: https://core.chinacloudapi.cn
```

## Limitations in Mooncake

1. **No custom namespace visible** via `az monitor metrics list-namespaces`
2. **Cannot create alert rules** on custom metrics
3. Metrics fetched from storage account with SAS key (portal only)
4. Sinks feature (preview on Global) not deployed in Mooncake
