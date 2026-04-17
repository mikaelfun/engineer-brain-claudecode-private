# Linux Kernel Boot Issues Troubleshooting

> Source: https://learn.microsoft.com/troubleshoot/azure/virtual-machines/linux/kernel-related-boot-issues
> Status: guide-draft (from mslearn scan)

## Identifying Kernel Panic

Serial console shows:
```
[300.206297] Kernel panic - xxxxxxxx
```

## Common Scenarios

### 1. VFS: Unable to mount root fs on unknown-block(0,0)

**Cause**: Missing initramfs after kernel update.

**Fix - ALAR automated**:
```bash
az vm repair repair-button --button-command initrd -g $RG --name $VM
```

**Fix - Manual (chroot)**:
```bash
# RHEL/CentOS
depmod -a <kernel-version>
dracut -f /boot/initramfs-<kernel-version>.img <kernel-version>

# SLES
dracut -f /boot/initrd-<kernel-version> <kernel-version>

# Ubuntu
mkinitramfs -k -o /boot/initrd.img-<kernel-version>
```

### 2. Attempted to kill init!

**Causes**:
- Missing files/directories (human error, fs corruption)
- Missing system core libraries → `rpm --verify --all --root=/rescue`
- Wrong file permissions → `rpm -a --setperms; rpm --setugids --all`
- Missing partitions
- SELinux issues → boot with `selinux=0`, then `touch /.autorelabel`

### 3. Boot on Older Kernel

**Serial Console**:
1. Restart VM → press ESC at GRUB
2. Select previous kernel with arrow keys

**ALAR**:
```bash
az vm repair run -g $RG -n $VM --run-id linux-alar2 --parameters kernel --run-on-repair
```

### 4. Change Default Kernel

- RHEL 7: `grub2-set-default '<menu entry title>'`
- RHEL 8/9: `grubby --set-default /boot/vmlinuz-<version>`
- SLES/Ubuntu: Edit `GRUB_DEFAULT` in `/etc/default/grub`

## Key Validation Commands

```bash
ls -l /boot/           # Check initramfs/vmlinuz files exist
cat /boot/grub2/grub.cfg | grep menuentry  # Gen1
cat /boot/efi/EFI/*/grub.cfg | grep menuentry  # Gen2
lsinitrd /boot/initramfs-*.img  # Check initrd contents
lsmod                  # Loaded modules
cat /etc/modprobe.d/*.conf  # Disabled modules
```
