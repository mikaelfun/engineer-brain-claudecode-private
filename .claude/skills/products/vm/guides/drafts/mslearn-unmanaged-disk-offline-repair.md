# Unmanaged Disk Offline Repair

> Source: Microsoft Learn
> URL: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/unmanaged-disk-offline-repair
> Quality: guide-draft | Needs review before promotion

## Determine if Disk is Managed or Unmanaged

### Azure Portal
- Unmanaged: banner "VM is not using managed disks" on Overview blade
- Unmanaged: disk name appended with "(unmanaged)"
- Managed: Overview blade shows "Managed by" field

### PowerShell
```powershell
(Get-AzVM -ResourceGroupName MyResourceGroup -Name MyVM).StorageProfile.OsDisk
# If ManagedDisk field is empty → unmanaged
```

### Azure CLI
```bash
az vm show -n MyVM -g MyResourceGroup --query "storageProfile.osDisk.managedDisk"
# No output → unmanaged
```

## Repair Steps for Unmanaged Disk

### 1. Copy the VHD
1. Stop the source VM
2. Open Azure Storage Explorer
3. Navigate to storage account > vhds container
4. Copy the VHD to a new blob container (e.g., "disk-copies")

### 2. Create Repair VM (Unmanaged)
1. Create new Windows Server 2019 VM
2. Select "No infrastructure redundancy required"
3. On Disks page: expand Advanced > clear "Use managed disks"
4. If checkbox unavailable, use CLI:
```bash
az vm create --resource-group <RG> --name <VM> --image <Image> \
  --location <location> --admin-username <Admin> --subnet $SubnetID \
  --size <size> --use-unmanaged-disk
```

### 3. Attach VHD Copy to Repair VM
1. Disks blade > Add data disk
2. Source type: Existing blob
3. Browse to the copied VHD

### 4. If Encrypted
Use Resolution #3 (Manual BEK unlock) from encrypted disk guide.

### 5. Replace OS Disk on Source VM

**Azure CLI:**
```bash
az vm unmanaged-disk detach -g MyResourceGroup --vm-name MyVm -n disk_name
```

**PowerShell:**
```powershell
$VirtualMachine = Get-AzVM -ResourceGroupName "MyResourceGroup" -Name "MyVm"
Remove-AzVMDataDisk -VM $VirtualMachine -Name "disk_name"
Update-AzVM -ResourceGroupName "MyResourceGroup" -VM $VirtualMachine

# Swap OS disk
$vm = Get-AzVM -ResourceGroupName $rgname -Name $vmname
$vm.StorageProfile.OsDisk.Vhd.Uri = $vhduri
Update-AzVM -ResourceGroupName $rgname -VM $vm
```
