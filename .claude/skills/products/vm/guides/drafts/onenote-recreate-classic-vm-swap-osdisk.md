# Recreate Classic VM / Swap OS Disk (Mooncake)

> Source: MCVKB 2.21 & 2.24 | Applies to: Mooncake (Classic/ASM VMs)

## Overview

Mooncake still has a few customers running Classic (ASM) VMs. Swapping the OS disk for a no-boot scenario is not as straightforward as ARM VMs. Below are the PowerShell steps.

## Prerequisites

```powershell
Install-Module -Name PowerShellGet -Force
Install-Module -Name Azure
Import-Module -Name Azure
```

## Steps

### 1. Export VM Config

```powershell
$SubscriptionID = "<your-subscription-id>"
$StorageAccount = "<your-storage-account>"
$vm = "<vm-name>"
$CloudService = "<cloud-service-name>"

# Login
Add-AzureAccount -Environment AzureChinaCloud
Set-AzureSubscription -SubscriptionId $SubscriptionId -CurrentStorageAccountName $StorageAccount
Select-AzureSubscription -SubscriptionId $SubscriptionId

# Stop the VM
Get-AzureVM -Servicename $CloudService -name $vm | Stop-AzureVM -Force

# Export configuration
Export-AzureVM -ServiceName $CloudService -Name $vm -Path C:\Temp\VM.xml

# Export VNet config (find VNET name in xml)
Get-AzureVnetConfig -ExportToFile C:\Temp\vnet.xml
$vnet = "<vnet-name-from-xml>"
```

### 2. Create Classic Disk
Create a Classic Disk using the good VHD via Azure Portal.

### 3. Edit VM Config
Edit `C:\Temp\VM.xml` and replace the OS disk name with the one created in Step 2.

### 4. Delete Broken VM

```powershell
# Verify config file exists first
Remove-AzureVM -ServiceName $CloudService -Name $vm
```

### 5. Recreate VM

```powershell
# Without static VIP
Import-AzureVM -Path C:\Temp\VM.xml | New-AzureVM -ServiceName $CloudService -VNetName $vnet

# With static VIP
Import-AzureVM -Path C:\Temp\VM.xml | New-AzureVM -ServiceName $CloudService -VNetName $vnet -ReservedIPName "<reserved-ip-name>"
```
