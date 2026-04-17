---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Recreate ARM VM_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FRecreate%20ARM%20VM_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Recreate ARM VM

How to recreate an Azure Virtual Machine using an Azure ARM Template or Az PowerShell.

## Limitations

The methods below may not work for Cloud Service Providers (CSP).

## Instructions

### Get the VM configuration data

#### Template Method

1. Click on the VM's `Export template` blade.
2. Click `Download` to download a ZIP with the primary JSON file included and extract it.

#### PowerShell Method

```PowerShell
$workingDir = "c:\temp\"
$subscriptionID = "Subscription ID"
$rgname = "Resource group name"
$vmname = "Virtual machine name"
$vmJSONFile = "$($workingDir)$($vmname).json"

Connect-AzAccount
Select-AzSubscription -SubscriptionID $subscriptionID
Set-AzContext -SubscriptionID $subscriptionID

Stop-AzVM -ResourceGroupName $rgname -Name $vmname

Get-AzVM -ResourceGroupName $rgname -Name $vmname | ConvertTo-Json -depth 100 | Out-file -FilePath $vmJSONFile
```

### Remove the VM

#### Portal Method

1. Select the target VM and click *Delete*.
2. Confirm deletion. **Do not delete associated resources. Do not apply Force Delete.**
3. For Unmanaged VMs, wait ~3mins for Azure to update the disk lease.

#### PowerShell Method

```PowerShell
$vmConfig = Get-AzVM -ResourceGroupName $rgname -Name $vmname
$vmConfig.StorageProfile.OsDisk.DeleteOption = 'detach'
$vmConfig.StorageProfile.DataDisks | ForEach-Object { $_.DeleteOption = 'detach' }
$vmConfig.NetworkProfile.NetworkInterfaces | ForEach-Object { $_.DeleteOption = 'detach' }
$vmConfig | Update-AzVM

Remove-AzVM -ResourceGroupName $rgname -Name $vmname
```

### Recreate the VM

#### Azure ARM Template

1. Navigate to Deploy a Custom Template in the Portal.
2. Click `Build your own template in the editor`.
3. Load the template.json file.
4. Required changes for specialized VM:
   - Remove `imageReference` from `properties.StorageProfile`
   - Remove `osProfile` from `properties`
   - Change `properties.storageProfile.osDisk.createOption` to `"attach"`
   - Remove any extensions (reinstall later)
5. Deploy to the same Resource Group.

#### PowerShell

```PowerShell
$managed = $true
$json = $vmJSONFile
$import = gc $json -Raw | ConvertFrom-Json

$vm = New-AzVMConfig -VMName $vmname -VMSize $vmsize
$rgname = $import.ResourceGroupName
$loc = $import.Location
$vmsize = $import.HardwareProfile.VmSize
$vmname = $import.Name

# Network
$importnicid = $import.NetworkProfile.NetworkInterfaces.Id
$nicname = $importnicid.split("/")[-1]
$nic = Get-AzNetworkInterface -Name $nicname -ResourceGroupName $rgname
$vm = Add-AzVMNetworkInterface -VM $vm -Id $nic.Id

# OS Disk
$osDiskName = $import.StorageProfile.OsDisk.Name
if ($managed) {
    $osManagedDiskId = $import.StorageProfile.OsDisk.ManagedDisk.Id
    $vm = Set-AzVMOSDisk -VM $vm -ManagedDiskId $osManagedDiskId -Name $osDiskName -CreateOption attach -Windows
    $vm = Set-AzVMBootDiagnostic -VM $vm -Enable
}

New-AzVM -ResourceGroupName $rgname -Location $loc -VM $vm -Verbose
```
