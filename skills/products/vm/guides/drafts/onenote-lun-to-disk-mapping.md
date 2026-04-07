---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======2. VM & VMSS=======/2.12 [VM] how to find the mapping relationship bet.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Find LUN to Disk Mapping in Azure VM

## Linux

```bash
sudo apt install -y tree
tree /dev/disk/azure/
```

This shows the Azure disk device tree with LUN mappings.

## Windows

### Method 1: Disk Management
Open `diskmgmt.msc` to see disk-to-drive-letter mapping visually.

### Method 2: PowerShell (Physical Disks)
```powershell
get-disk | format-list number, path
```
The LUN number is embedded in the disk path.

### Method 3: Dynamic Disks
```powershell
Get-PhysicalDisk | Select-Object Friendlyname, deviceid, objectId, physicallocation | fl
```
