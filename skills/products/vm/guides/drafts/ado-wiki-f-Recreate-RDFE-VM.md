---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Recreate RDFE VM_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FRecreate%20RDFE%20VM_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Recreate RDFE (Classic) VM

How to recreate an RDFE Virtual Machine using Azure PowerShell.

Recreating a VM through its configuration file will re-attach all disks plus endpoint, load balancer, and IP configuration. For VMs with striping disks, this is the correct method.

## Instructions

### Get the VM configuration data

1. Check if the machine uses any static Public IP (VIP) - this info is not saved in the config file (cloud service level).
2. Install Azure PowerShell if needed.
3. Export the configuration:

```PowerShell
$SubscriptionID = "<Subscription ID>"
$StorageAccount = "<Storage Account>"
$vm = "<VM Name>"
$CloudService = "<Cloud Service>"
$VNET = "<Virtual Network>"

Add-AzureAccount
Set-AzureSubscription -SubscriptionId $SubscriptionId -CurrentStorageAccountName $StorageAccount
Select-AzureSubscription -SubscriptionId $SubscriptionId

# Stop the VM
Get-AzureVM -Servicename $CloudService -name $vm | stop-azureVM -force

# Export config
Export-AzureVM -ServiceName $CloudService -Name $vm -Path C:\Temp\VM.xml
```

4. Validate `c:\temp\VM.xml` exists and has content, then delete the VM (keeping disks):

```PowerShell
Remove-AzureVM -ServiceName $CloudService -Name $vm
```

5. Wait ~5 minutes for Azure to release the disks.

### Recreate the Virtual Machine

Without static VIP:
```PowerShell
Import-AzureVM -Path C:\Temp\VM.xml | New-AzureVM -ServiceName $CloudService -VNetName $vnet
```

With static VIP:
```PowerShell
Import-AzureVM -Path C:\Temp\VM.xml | New-AzureVM -ServiceName $CloudService -VNetName $vnet -ReservedIPName '<STATIC IP>'
```
