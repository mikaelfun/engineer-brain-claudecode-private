# VM Linux 启动问题 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 14 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Linux VM kernel panic on boot when deploying RHEL 7.x, CentOS 7.x, or Oracle Linux 6.x on Dv4/Ev4 VM | Azure host software issue causes Linux kernel version 4.6 or earlier to fail to  | Use RHEL 8.x, CentOS 8.x, or Oracle Linux 7.x (or newer) images. Other Linux dis | 🔵 7.5 | AW |
| 2 | Azure Linux VM unable to boot after OS disk resize. Boot diagnostics show GRUB rescue prompt ('Minim | During Linux OS disk resize, customer used fdisk in DOS compatibility mode (cyli | 1) Attach problem VHD to rescue VM. 2) Run fdisk with correct flags: fdisk -u=se | 🔵 7.5 | AW |
| 3 | RHEL 7/8 Gen 2 Azure VM fails to boot with 'Failed to open \EFI\redhat\grubx64.efi Not Found' - rebo | Missing grubx64.efi file from the EFI system partition. Can be caused by misconf | Create RHEL Gen2 rescue VM with same distro, attach broken OS disk copy, mount a | 🔵 6.5 | AW |
| 4 | Linux VM fails to boot with Kernel panic - VFS: Unable to mount root fs on unknown-block(0,0) or mis | Missing initramfs image after kernel update/patching. Initramfs file not generat | Boot previous kernel via Serial Console GRUB menu. Regenerate initramfs: depmod  | 🔵 6.5 | ML |
| 5 | Linux VM fails to boot with Kernel panic - Attempted to kill init! after dracut warning | Missing important files/directories, missing system core libraries (libc.so.6),  | Attach OS disk to repair VM + chroot. For missing libs: rpm --verify + reinstall | 🔵 6.5 | ML |
| 6 | Linux VM boot fails or apps break after restart because /dev/sdX device names changed. | Linux device paths not persistent across reboots. SCSI async scan reorders devic | Use persistent naming: UUID in fstab, /dev/disk/azure/scsiN/lunN, or LVM names.  | 🔵 6.5 | ML |
| 7 | Cannot connect to specialized Debian 9.1 VM after migrating from VMware to Azure | NIC name is 'ens33p0' instead of 'eth0' which is required by Azure Linux network | Modify GRUB: add 'net.ifnames=0 biosdevname=0' to GRUB_CMDLINE_LINUX. Update /et | 🔵 5.5 | ML |
| 8 | dpkg error processing linux-image during kernel install: grub-mkconfig Syntax error EOF in backquote | Syntax error in /etc/default/grub (e.g., missing closing quotation mark in GRUB_ | Fix syntax error in /etc/default/grub, then retry kernel package installation. | 🔵 5.5 | ML |
| 9 | Linux VM fails to boot after entire /boot partition contents deleted | All /boot contents (kernel, initramfs, grub) deleted and unrecoverable. | Restore VM from backup using Azure Backup - only recovery option. | 🔵 5.5 | ML |
| 10 | Linux VM fails to boot after migration to Azure or after disabling Hyper-V drivers. VM stuck at drac | Hyper-V/LIS drivers not installed, disabled in /etc/modprobe.d, or missing from  | Fix1(disabled): chroot repair VM, grep -nr hv_ /etc/modprobe.d/, remove blacklis | 🔵 5.5 | ML |
| 11 | Linux VM boots into emergency mode due to fstab misconfiguration. Timed out waiting for device, Depe | Incorrect /etc/fstab: device names instead of UUID, wrong UUID, missing nofail,  | Serial Console single-user mode, fix fstab (UUID+nofail), mount -a, reboot. ALAR | 🔵 5.5 | ML |
| 12 | Linux VM drops to dracut shell. dracut-initqueue timeout, rootvg-rootlv does not exist. | hv_vmbus/hv_storvsc disabled in /etc/modprobe.d/. initramfs cannot access root f | Offline: rescue VM, chroot, remove hv driver disable entries, dracut -f -v, swap | 🔵 5.5 | ML |
| 13 | Linux VM 3.10 kernel (RHEL/CentOS 7.0-7.1) panics after host memory-preserving update. SCSI sysfs tr | SCSI locking bug in kernel < 3.10.0-327.10.1 triggered by Hyper-V host disk hot- | Restart VM. Update kernel to 3.10.0-327.10.1+ (RHEL/CentOS/Oracle 7.2). | 🔵 5.5 | ML |
| 14 | Linux VM cannot boot: Kernel panic - VFS: Unable to mount root fs on unknown-block(0,0). Serial log  | Missing initramfs file for the current boot kernel version. The initramfs (initi | 1) Create snapshot of OS disk, attach to rescue Linux VM; 2) Use chroot to acces | 🔵 5.5 | ON |

## 快速排查路径

1. **Linux VM kernel panic on boot when deploying RHEL 7.x, CentOS 7.x, or Oracle Lin**
   - 根因: Azure host software issue causes Linux kernel version 4.6 or earlier to fail to boot on Dv4/Ev4 hardware; affects RHEL 7
   - 方案: Use RHEL 8.x, CentOS 8.x, or Oracle Linux 7.x (or newer) images. Other Linux distros (Ubuntu, SLES, Debian) are NOT impacted. A Hyper-V host fix was p
   - `[🔵 7.5 | AW]`

2. **Azure Linux VM unable to boot after OS disk resize. Boot diagnostics show GRUB r**
   - 根因: During Linux OS disk resize, customer used fdisk in DOS compatibility mode (cylinders as units instead of sectors). When
   - 方案: 1) Attach problem VHD to rescue VM. 2) Run fdisk with correct flags: fdisk -u=sectors -c=nondos /dev/<device>. 3) Delete the misaligned partition and 
   - `[🔵 7.5 | AW]`

3. **RHEL 7/8 Gen 2 Azure VM fails to boot with 'Failed to open \EFI\redhat\grubx64.e**
   - 根因: Missing grubx64.efi file from the EFI system partition. Can be caused by misconfiguration during OS/grub2 installation, 
   - 方案: Create RHEL Gen2 rescue VM with same distro, attach broken OS disk copy, mount and enter chroot, run 'yum reinstall grub2-common grub2-pc grub2-efi-x6
   - `[🔵 6.5 | AW]`

4. **Linux VM fails to boot with Kernel panic - VFS: Unable to mount root fs on unkno**
   - 根因: Missing initramfs image after kernel update/patching. Initramfs file not generated or GRUB config has missing initrd ent
   - 方案: Boot previous kernel via Serial Console GRUB menu. Regenerate initramfs: depmod + dracut. Regenerate GRUB config. Or use ALAR scripts: az vm repair re
   - `[🔵 6.5 | ML]`

5. **Linux VM fails to boot with Kernel panic - Attempted to kill init! after dracut **
   - 根因: Missing important files/directories, missing system core libraries (libc.so.6), wrong file permissions (chmod 777 on /),
   - 方案: Attach OS disk to repair VM + chroot. For missing libs: rpm --verify + reinstall packages. For wrong permissions: rpm -a --setperms. For SELinux: add 
   - `[🔵 6.5 | ML]`

