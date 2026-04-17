# Linux VM GRUB Rescue Troubleshooting Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-vm-boot-error

## Overview

During boot, if the boot loader cannot locate the Linux kernel, VM enters GRUB rescue console. Visible via Boot diagnostics screenshot (not serial console log).

## Automated Fix: ALAR

```bash
az extension add -n vm-repair
az extension update -n vm-repair
# Gen1 (BIOS):
az vm repair repair-button --button-command 'grubfix' --verbose --resource-group $RG --name $VM
# Gen2 (UEFI):
az vm repair repair-button --button-command 'efifix' --verbose --resource-group $RG --name $VM
```

## Manual Fix: Reinstall GRUB

1. Create rescue VM: `az vm repair create`
2. Mount + chroot to affected OS disk
3. Reinstall GRUB per distro:

**RHEL/CentOS/Oracle Gen1:**
```bash
grub2-install /dev/sdX
grub2-mkconfig -o /boot/grub2/grub.cfg
sed -i 's/hd2/hd0/g' /boot/grub2/grub.cfg
```

**RHEL/CentOS/Oracle Gen2:**
```bash
yum reinstall grub2-efi-x64 shim-x64
grub2-mkconfig -o /boot/efi/EFI/redhat/grub.cfg
sed -i 's/hd2/hd0/g' /boot/efi/EFI/redhat/grub.cfg
```

**SLES 12/15:**
```bash
grub2-install /dev/sdX
grub2-mkconfig -o /boot/grub2/grub.cfg
sed -i 's/hd2/hd0/g' /boot/grub2/grub.cfg
```

**Ubuntu:**
```bash
grub-install /dev/sdX
update-grub
```

4. `az vm repair restore` to swap disk back

## Error-Specific Scenarios

### Error: unknown filesystem
- /boot filesystem corruption -> fsck/xfs_repair the /boot partition
- GRUB points to invalid disk -> reinstall GRUB
- Partition table issues -> recreate /boot partition

### Error 15: File not found
- Inspect /boot contents, reinstall GRUB if config missing
- Verify file permissions
- Restore from backup if /boot empty

### Error: normal.mod not found
- Copy from /usr/lib/grub/i386-pc to /boot/grub2/i386-pc
- If /boot empty: reinstall GRUB + kernel, regenerate config

### Error: no such partition
- /boot partition deleted or recreated with wrong sectors
- Recreate using fdisk (dos) or gdisk (GPT)
- Mark bootable (dos only), verify with blkid

### Error: grub_efi_get_secure_boot not found
- SLES 12 SP5 kernel 4.12.14 doesn't support Secure Boot on Gen2
- Fix: chroot -> yast2 bootloader -> disable Secure Boot Support

## Key Points
- Always use `az vm repair` for rescue VM creation
- After fix, `az vm repair restore` to swap disk
- If /boot unrecoverable, restore VM from backup
