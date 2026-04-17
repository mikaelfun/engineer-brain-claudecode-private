# Azure VM Offline Repair Methods - Comprehensive Guide

> Source: Microsoft Learn (multiple pages)
> Quality: guide-draft | Needs review before promotion

## Overview

When a Windows VM in Azure cannot boot or encounters disk errors, offline repair is required. This guide covers all available methods.

## Method Selection Decision Tree

1. **Is the OS disk managed or unmanaged?**
   - Unmanaged → See "Unmanaged Disk Offline Repair" guide
   - Managed → Continue
2. **Is the disk encrypted with ADE?**
   - Not encrypted → Use `az vm repair` (automated, preferred)
   - ADE v2 (single-pass) → Use `az vm repair create --unlock-encrypted-vm`
   - ADE v1 (dual-pass) → Manual BEK unlock required (see Encrypted Disk guide)
3. **Do you need nested Hyper-V?**
   - Yes → Use `az vm repair create --enable-nested`
   - No → Standard `az vm repair`

## Method 1: az vm repair (Automated - Preferred)

```bash
# Install/update extension
az extension add -n vm-repair
az extension update -n vm-repair

# Create repair VM + attach OS disk copy
az vm repair create -g MyResourceGroup -n myVM \
  --repair-username username --repair-password 'password!234' --verbose

# With nested Hyper-V
az vm repair create -g MyResourceGroup -n myVM \
  --repair-username username --repair-password 'password!234' \
  --enable-nested --verbose

# Run repair script
az vm repair run -g MyResourceGroup -n MyVM \
  --run-on-repair --run-id win-hello-world --verbose

# Restore repaired OS disk
az vm repair restore -g MyResourceGroup -n MyVM --verbose
```

**Requirements:**
- Outbound connectivity (port 443)
- Only one script at a time, max 90 minutes
- Do NOT modify tags on repair VM (needed for restore)
- Role needs: create RG, VM, Tags, VNet, NSG, NIC, Disks

## Method 2: Manual via Azure Portal

1. Take snapshot of OS disk (VM > Disks > OS disk > Create snapshot)
2. Create disk from snapshot
3. Create repair VM (same region + availability zone)
4. Attach disk as data disk to repair VM
5. Perform repairs
6. Detach disk, then Swap OS disk on source VM

## Method 3: Manual via PowerShell

```powershell
# Stop VM
Stop-AzVM -ResourceGroupName "myResourceGroup" -Name "myVM"

# Create snapshot
$vm = Get-AzVM -ResourceGroupName $resourceGroupName -Name $vmName
$snapshot = New-AzSnapshotConfig -SourceUri $vm.StorageProfile.OsDisk.ManagedDisk.Id `
  -Location $location -CreateOption copy
New-AzSnapshot -Snapshot $snapshot -SnapshotName $snapshotName -ResourceGroupName $resourceGroupName

# Create disk from snapshot
$snapshot = Get-AzSnapshot -ResourceGroupName $resourceGroupName -SnapshotName $snapshotName
$diskConfig = New-AzDiskConfig -AccountType Standard_LRS -Location $location `
  -CreateOption Copy -SourceResourceId $snapshot.Id
New-AzDisk -Disk $diskConfig -ResourceGroupName $resourceGroupName -DiskName $diskName

# Attach to recovery VM
$disk = Get-AzDisk -ResourceGroupName $rgName -DiskName $dataDiskName
$vm = Get-AzVM -Name $vmName -ResourceGroupName $rgName
$vm = Add-AzVMDataDisk -CreateOption Attach -Lun 0 -VM $vm -ManagedDiskId $disk.Id
Update-AzVM -VM $vm -ResourceGroupName $rgName

# After repair - swap OS disk
$vm = Get-AzVM -ResourceGroupName myResourceGroup -Name myVM
Stop-AzVM -ResourceGroupName myResourceGroup -Name $vm.Name -Force
$disk = Get-AzDisk -ResourceGroupName myResourceGroup -Name newDisk
Set-AzVMOSDisk -VM $vm -ManagedDiskId $disk.Id -Name $disk.Name
Update-AzVM -ResourceGroupName myResourceGroup -VM $vm
Start-AzVM -Name $vm.Name -ResourceGroupName myResourceGroup
```

## Method 4: Nested Virtualization (Manual)

Use when standard repair is insufficient and full OS-level access is needed.

**Requirements:**
- Rescue VM: Windows Server 2016+ Datacenter
- VM size: Dv3/Dv4 series (supports nested virtualization)
- Security type: **Standard** (NOT Trusted Launch - Hyper-V won't install)

**Key Steps:**
1. Create rescue VM with Standard security type
2. Install Hyper-V role
3. If hypervisor not enabled: `bcdedit /set hypervisorlaunchtype auto`
4. Attach faulty disk (set to Offline in Disk Management)
5. Create nested VM in Hyper-V using the disk
6. Troubleshoot as on-premises VM
7. Shut down, detach, swap OS disk

## Boot Diagnostics

```powershell
# Get boot screenshot
Get-AzVMBootDiagnosticsData -ResourceGroupName myResourceGroup -Name myVM -Windows -LocalPath C:\Users\ops\

# Enable boot diagnostics
az vm boot-diagnostics enable --name myVMDeployed --resource-group myResourceGroup \
  --storage https://mystor.blob.core.windows.net/
```

## References

- [Troubleshoot VM by nested virtualization](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-vm-by-use-nested-virtualization)
- [Attach OS disk via portal](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-recovery-disks-portal-windows)
- [Attach OS disk via PowerShell](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-recovery-disks-windows)
- [az vm repair commands](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/repair-windows-vm-using-azure-virtual-machine-repair-commands)
