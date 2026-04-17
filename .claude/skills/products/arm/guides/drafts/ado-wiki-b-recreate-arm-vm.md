---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Components/Compute/How Tos/Recreate an ARM Virtual Machine"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FComponents%2FCompute%2FHow%20Tos%2FRecreate%20an%20ARM%20Virtual%20Machine"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Recreate an ARM Virtual Machine

This article describes how to recreate an ARM Virtual Machine on Azure Stack Hub using Azure PowerShell.

## Get the VM configuration data

1. Ensure Azure Stack PowerShell is installed ([Install guide](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-powershell-install))
2. Connect to tenant ARM endpoint ([Configure guide](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-powershell-configure-admin))
3. Create a copy of the current configuration:

```powershell
$subscriptionID = "<SUBSCRIPTION ID>"
$rgname = "<RESOURCE GROUP NAME>"
$vmname = "<VM NAME>"

Connect-AzureRMAccount
Select-AzureRmSubscription -SubscriptionID $subscriptionID
Set-AzureRmContext -SubscriptionID $subscriptionID

# Stop deallocate the VM
Stop-AzureRmVM -ResourceGroupName $rgname -Name $vmname

# Export the JSON file
Get-AzureRmVM -ResourceGroupName $rgname -Name $vmname | ConvertTo-Json -depth 100 | Out-file -FilePath c:\temp\$vmname.json
```

## Remove the VM

Delete the VM keeping the attached disks:

```powershell
# AzureRM module
Remove-AzureRMVM -ResourceGroupName $rgname -Name $vmname

# If PowerShell 6.13.1+
Remove-AzVM -ResourceGroupName $rgname -Name $vmname
```

Or manually from the Portal:
1. Select the VM → Delete → Confirm
2. Deleting the VM will not delete the disks
3. Wait ~3 min for Azure Stack to update disk leases

## Recreate Unmanaged VM from JSON

```powershell
$json = "c:\temp\$vmname.json"
$import = gc $json -Raw | ConvertFrom-Json

$rgname = $import.ResourceGroupName
$loc = $import.Location
$vmsize = $import.HardwareProfile.VmSize
$vmname = $import.Name

$vm = New-AzureRmVMConfig -VMName $vmname -VMSize $vmsize

# Network card
$importnicid = $import.NetworkProfile.NetworkInterfaces.Id
$nicname = $importnicid.split("/")[-1]
$nic = Get-AzureRmNetworkInterface -Name $nicname -ResourceGroupName $rgname
$vm = Add-AzureRmVMNetworkInterface -VM $vm -Id $nic.Id

# OS Disk (unmanaged)
$osDiskName = $import.StorageProfile.OsDisk.Name
$osDiskVhdUri = $import.StorageProfile.OsDisk.Vhd.Uri
$vm = Set-AzureRmVMOSDisk -VM $vm -VhdUri $osDiskVhdUri -name $osDiskName -CreateOption attach -Windows

New-AzureRmVM -ResourceGroupName $rgname -Location $loc -VM $vm -Verbose
```

## Recreate Managed VM from JSON

```powershell
$json = "c:\temp\$vmname.json"
$import = gc $json -Raw | ConvertFrom-Json

$rgname = $import.ResourceGroupName
$loc = $import.Location
$vmsize = $import.HardwareProfile.VmSize
$vmname = $import.Name

$vm = New-AzureRmVMConfig -VMName $vmname -VMSize $vmsize

# Network card
$importnicid = $import.NetworkProfile.NetworkInterfaces.Id
$nicname = $importnicid.split("/")[-1]
$nic = Get-AzureRmNetworkInterface -Name $nicname -ResourceGroupName $rgname
$vm = Add-AzureRmVMNetworkInterface -VM $vm -Id $nic.Id

# OS Disk (managed)
$osDiskName = $import.StorageProfile.OsDisk.Name
$osManagedDiskId = $import.StorageProfile.OsDisk.ManagedDisk.Id
$vm = Set-AzureRmVMOSDisk -VM $vm -ManagedDiskId $osManagedDiskId -Name $osDiskName -CreateOption attach -Windows

New-AzureRmVM -ResourceGroupName $rgname -Location $loc -VM $vm -Verbose
```

## Recreate Managed VM from Scratch (with variables)

```powershell
$subid = "SubscriptionID"
$rgName = "ResourceGroupName"
$loc = "Location"
$vmSize = "VmSize"
$vmName = "VmName"
$nic1Name = "FirstNetworkInterfaceName"
$osDiskName = "OsDiskName"

$osDiskResouceId = "/subscriptions/$subid/resourceGroups/$rgname/providers/Microsoft.Compute/disks/$osDiskName"

$vm = New-AzureRmVMConfig -VMName $vmName -VMSize $vmSize
$nic1 = Get-AzureRmNetworkInterface -Name $nic1Name -ResourceGroupName $rgName
$vm = Add-AzureRmVMNetworkInterface -VM $vm -Id $nic1.Id -Primary

# Windows VM
$vm = Set-AzureRmVMOSDisk -VM $vm -ManagedDiskId $osDiskResouceId -name $osDiskName -CreateOption Attach -Windows

# For Linux: use -Linux instead of -Windows

New-AzureRmVM -ResourceGroupName $rgName -Location $loc -VM $vm
```
