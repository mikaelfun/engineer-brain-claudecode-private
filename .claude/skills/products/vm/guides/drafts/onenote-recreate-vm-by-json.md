---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======2. VM & VMSS=======/2.1 [Powershell]Recreate VM by JSON file.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Recreate VM by JSON file (PowerShell)

When troubleshooting VM connectivity issues (e.g., lost RDP/SSH), a common workflow is:
1. Delete the VM (keep disks)
2. Attach OS disk to a temp VM for repair
3. Recreate the original VM

This script automates the process by exporting VM config to JSON, then recreating from that JSON.

## Export VM Info

```powershell
$subscriptionID = "<sub-id>"
$rgname = "<resource-group>"
$vmname = "<vm-name>"

Add-AzureRmAccount -Environment Azurechinacloud
Select-AzureRmSubscription -SubscriptionID $subscriptionID
Set-AzureRmContext -SubscriptionID $subscriptionID
Get-AzureRmVM -ResourceGroupName $rgname -Name $vmname | ConvertTo-Json -depth 100 | Out-file -FilePath c:\temp\$vmname.json
```

## Delete VM (Keep Disks)

```powershell
Stop-AzureRmVM -ResourceGroupName $rgName -Name $vmName
Remove-AzureRmVM -ResourceGroupName $rgName -Name $vmName
```

## Recreate VM from JSON

```powershell
$json = "c:\temp\$vmname.json"
$import = gc $json -Raw | ConvertFrom-Json

$rgname = $import.ResourceGroupName
$loc = $import.Location
$vmsize = $import.HardwareProfile.VmSize
$vmname = $import.Name

# Create VM config
$vm = New-AzureRmVMConfig -VMName $vmname -VMSize $vmsize

# Network card
$importnicid = $import.NetworkProfile.NetworkInterfaces.Id
$nicname = $importnicid.split("/")[-1]
$nic = Get-AzureRmNetworkInterface -Name $nicname -ResourceGroupName $rgname
$nicId = $nic.Id
$vm = Add-AzureRmVMNetworkInterface -VM $vm -Id $nicId

# OS Disk
$osDiskName = $import.StorageProfile.OsDisk.Name
$osDiskVhdUri = $import.StorageProfile.OsDisk.Vhd.Uri
$vm = Set-AzureRmVMOSDisk -VM $vm -VhdUri $osDiskVhdUri -name $osDiskName -CreateOption attach -Windows

# Create
New-AzureRmVM -ResourceGroupName $rgname -Location $loc -VM $vm -Verbose
```

> Note: This script uses AzureRm module (legacy). For Az module, replace `AzureRm` with `Az` equivalents.
> Note: For managed disks, use `-ManagedDiskId` instead of `-VhdUri`.
