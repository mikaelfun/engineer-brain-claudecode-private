---
title: Azure Linux VM Kernel-Related Boot Issues - Comprehensive Troubleshooting Guide
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/kernel-related-boot-issues
product: vm
tags: [kernel-panic, boot-failure, GRUB, initramfs, chroot, ALAR, Serial-Console]
21vApplicable: true
---

# Kernel-Related Boot Issues Troubleshooting

## Identifying Kernel Panic
Check serial console log for kernel panic string at the end of output.

## Online vs Offline Troubleshooting
- Online: Use Serial Console to interrupt GRUB, boot older kernel
- Offline: Use repair VM with chroot (az vm repair create)

## Boot Older Kernel Version
1. Serial Console: Restart VM > press ESC at GRUB > select older kernel
2. ALAR scripts: az vm repair create then az vm repair run --run-id linux-alar2 --parameters kernel
3. Change default kernel: modify GRUB_DEFAULT in /etc/default/grub

## Common Scenarios

### VFS: Unable to mount root fs on unknown-block(0,0)
- Cause: Missing initramfs after kernel update
- Fix: Regenerate initramfs per distro:
  - RHEL/CentOS: dracut -f /boot/initramfs-{ver}.img {ver}
  - SLES: dracut -f /boot/initrd-{ver} {ver}
  - Ubuntu: mkinitramfs -k -o /boot/initrd.img-{ver}
- ALAR: az vm repair repair-button --button-command initrd

### Attempted to kill init
- Missing files/dirs: Compare with healthy VM, restore from backup
- Missing packages: rpm -ivh --root=/rescue pkg.rpm --replacepkgs
- Wrong permissions: rpm -a --setperms && rpm --setugids --all
- SELinux: Boot with selinux=0, then touch /.autorelabel
- Missing partitions: Recreate with original layout using fdisk/gdisk

### Kernel Module Issues
- Check: lsinitrd /boot/initramfs-{ver}.img and cat /etc/modprobe.d/*.conf
- Remove problematic module: rmmod module_name, regenerate initramfs

### Kernel BUG
- Search vendor KB with BUG string
- Red Hat Kernel Oops Analyzer, vendor knowledge bases
- Keep systems updated, configure kdump for core dumps

## Kernel Update Commands
- RHEL: yum update kernel / yum reinstall kernel-{ver}
- SLES: zypper update kernel*
- Ubuntu: apt install linux-azure
