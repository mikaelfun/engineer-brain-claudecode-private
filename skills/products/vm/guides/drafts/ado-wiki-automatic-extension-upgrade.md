---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/Automatic Extension Upgrade_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Agents%20%26%20Extensions%20(AGEX)/How%20Tos/Extension/Automatic%20Extension%20Upgrade_AGEX"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Automatic Extension Upgrade

## Overview

Automatic Extension Upgrade is available for Azure VMs and Azure Virtual Machine Scale Sets. When enabled, the extension is upgraded automatically whenever the extension publisher releases a new version.

Key features:
- Supported for Azure VMs and Azure VMSS (Service Fabric VMSS not supported)
- Upgrades are applied in an availability-first deployment model
- For VMSS, no more than 20% of VMs upgraded in a single batch (min 1 per batch)
- Works for all VM sizes, Windows and Linux
- Can opt out at any time
- Each extension enrolled individually

## Enabling the Feature

### Virtual Machines

**REST API:**
```
PUT on /subscriptions/<subscriptionId>/resourceGroups/<resourceGroupName>/providers/Microsoft.Compute/virtualMachines/<vmName>/extensions/<extensionName>?api-version=2019-12-01
```

**PowerShell:**
```powershell
Set-AzVMExtension -ExtensionName "Microsoft.Azure.Monitoring.DependencyAgent" `
    -ResourceGroupName "myResourceGroup" `
    -VMName "myVM" `
    -Publisher "Microsoft.Azure.Monitoring.DependencyAgent" `
    -ExtensionType "DependencyAgentWindows" `
    -TypeHandlerVersion 9.5 `
    -Location WestUS `
    -EnableAutomaticUpgrade $true
```

**Azure CLI:**
```bash
az vm extension set \
    --resource-group myResourceGroup \
    --vm-name myVM \
    --name DependencyAgentLinux \
    --publisher Microsoft.Azure.Monitoring.DependencyAgent \
    --version 9.5 \
    --enable-auto-upgrade true
```

### Virtual Machine Scale Sets

**PowerShell:**
```powershell
Add-AzVmssExtension -VirtualMachineScaleSet $vmss
    -Name "Microsoft.Azure.Monitoring.DependencyAgent" `
    -Publisher "Microsoft.Azure.Monitoring.DependencyAgent" `
    -Type "DependencyAgentWindows" `
    -TypeHandlerVersion 9.5 `
    -EnableAutomaticUpgrade $true
```

**Azure CLI:**
```bash
az vmss extension set \
    --resource-group myResourceGroup \
    --vmss-name myVMSS \
    --name DependencyAgentLinux \
    --publisher Microsoft.Azure.Monitoring.DependencyAgent \
    --version 9.5 \
    --enable-auto-upgrade true
```

## Kusto Troubleshooting

### Virtual Machines

Extension upgrade operations are tracked in `VMAutoExtensionUpgradeEvent` table:

```kql
cluster("azmc2.centralus.kusto.windows.net").database("rsm_Prod").VMAutoExtensionUpgradeEvent
| where TIMESTAMP >= ago(2d)
| where subscriptionId =~ "{SubscriptionId}"
```

Check status: Submitted, InProgress, Succeeded, Failed. If failed, look at error details.

### Virtual Machine Scale Sets

Same table, same query. If resource not found, check other resources in same subscription - RSM batches single VM calls per subscription, so one failing resource may block others.

### CRP Error Details

```kql
cluster("Azcsupfollower2.centralus.kusto.windows.net").database("crp_allprod").ContextActivity
| where TIMESTAMP >= ago(2d)
| where activityId == <activityId>
```

Use the operation ID from VMAutoExtensionUpgradeEvent as the activityId.

## ASC Verification

In ASC: Select VM > Extensions > Select extension name > Look for "Enable automatic Upgrade" property (true = enabled).

## References

- [Public Documentation](https://learn.microsoft.com/en-us/azure/virtual-machines/automatic-extension-upgrade)
