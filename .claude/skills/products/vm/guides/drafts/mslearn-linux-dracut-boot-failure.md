---
title: Linux VM Dracut Emergency Shell Boot Failure Guide
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-no-boot-dracut
product: vm
date: 2026-04-18
21vApplicable: true
---

# Linux VM Dracut Emergency Shell Boot Failure Guide

## Identification
VM lands in dracut or initramfs emergency shell. Serial console shows:
- RHEL/CentOS/SLES: `dracut-initqueue timeout`, `Warning: /dev/mapper/rootvg-rootlv does not exist`
- Ubuntu: `Gave up waiting for root file system device`, `ALERT! UUID does not exist. Dropping to a shell!`

## Online Troubleshooting (Serial Console)
1. Trigger **Restart VM (Hard)** from serial console
2. Interrupt at GRUB with ESC key
3. Select E to edit first kernel entry
4. Fix linux16 line: wrong root path, wrong swap path, duplicates, typos
5. Ctrl+X to boot (non-persistent - fix /etc/default/grub after boot)

## Offline Troubleshooting (Rescue VM)
1. `az vm repair create` → attach OS disk copy to rescue VM
2. Mount + chroot into affected OS filesystem
3. Fix specific issues (see below)
4. `az vm repair restore` to swap disk back

## Common Causes and Fixes

### ADE Encrypted VM - VFAT Disabled
See: vfat-disabled-boot-issues

### Hyper-V Drivers Missing
Re-enable hv_netvsc/hv_vmbus/hv_storvsc/hv_utils in /etc/modprobe.d/ and rebuild initramfs.
See: linux-hyperv-issue

### GRUB Misconfiguration

#### Wrong Root Device Path
- Validate root= parameter in /etc/default/grub GRUB_CMDLINE_LINUX
- No /dev/sdX (not persistent), use UUID or /dev/mapper/ paths
- Ubuntu ADE: /dev/mapper/osencrypt
- LVM: /dev/mapper/rootvg-rootlv

#### Wrong Swap Device Path
- Error: `/dev/VG/SwapVol does not exist`
- Fix: Remove rd.lvm.lv=VG/SwapVol from GRUB config
- Note: Swap via rd.lvm.lv not recommended in Azure, use swap file

#### Duplicated Parameters
- Check for duplicate entries in GRUB_CMDLINE_LINUX
- Remove duplicates and regenerate GRUB config

#### rd.break Parameter
- rd.break forces dracut emergency shell - ensure not hardcoded

### Root File System Corruption
Follow: linux-recovery-cannot-start-file-system-errors filesystem repair

### LVM Activation Issues
From rescue VM:
1. `lsblk` + `pvs` to check PV detection
2. `vgs` for VG status
3. `lvs` for LV status
- Single PV missing: partition incorrectly deleted/resized
- Multiple PV rootvg: data disk may be detached, reattach original

### Root Partition Missing
Recreate partition with original layout (exact start/end sectors) using fdisk (MBR) or gdisk (GPT).
If unrecoverable: restore from backup.

### Initramfs/Initrd Corruption
From rescue VM + chroot:
- RHEL/SLES: `dracut -f -v`
- Ubuntu/Debian: `mkinitramfs -k -o /boot/initrd.img-3.6.6-1cdd4371.x86_64`

## GRUB Config Regeneration
After fixing /etc/default/grub, always regenerate:
See: troubleshoot-vm-boot-error#reinstall-grub-regenerate-grub-configuration-file
