---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/chroot-logical-volume-manager"
importDate: "2026-04-23"
type: guide-draft
---

# Troubleshoot Azure Linux VM with LVM When Serial Console Unavailable

Guide for troubleshooting non-booting Azure Linux VMs that use Logical Volume Manager (LVM) in the OS disk when SSH and Serial Console are both unavailable.

## Prerequisites

- Azure Cloud Shell access
- New or existing custom storage account
- Permissions to create temporary VM at subscription level

## Procedure

1. **Create rescue VM** using `az vm repair create` (or manually via portal)
   - Important: If creating manually, select an image **without LVM** in OS disk to avoid duplicated LVM structures
   - Red Hat: use "Red Hat RAW" images
   - Ubuntu and SUSE images don't use LVM in OS disk
   - Install LVM utilities if missing in Red Hat RAW image

2. **Connect to rescue VM** and mount OS file systems using chroot
   - Commands executed in chroot target the attached OS disk, not the rescue VM

3. **Common troubleshooting scenarios**:
   - **Kernel boot issues**: Force VM to boot from previous kernel if current kernel is corrupt or upgrade incomplete
   - **Failed kernel upgrade**: Kernel update process left VM non-bootable
   - **LVM swap volume misconfiguration in GRUB**: VM enters dracut emergency shell due to invalid swap device path in GRUB configuration

4. **Cleanup**: Exit chroot, unmount file systems, run `az vm repair restore` to swap repaired OS disk

5. **Validate**: Check Serial Console or try SSH connection
   - If Serial Console still inaccessible, verify GRUB configuration parameters
