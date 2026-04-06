# VM Linux Kernel Panic 与 initramfs 启动失败 — 排查速查

**来源数**: 11 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Linux VM cannot boot: Kernel panic - VFS: Unable to mount r... | Missing initramfs file for the current boot kerne... | 1) Create snapshot of OS disk, attach to rescue Linux VM; 2... | 🔵 7.0 — OneNote+高置信 | MCVKB/Mooncake POD Support Notebook/POD/VMSCIM/4. Services/VM/SME Topics/4. Linux on Azure/4.10-Change boot sequence by using chroot for fail.md |
| 2 | Linux VM fails to boot after migration to Azure or after di... | Hyper-V LIS drivers (hv_vmbus, hv_storvsc, hv_net... | Solution 1: Create repair VM, mount OS disk via chroot, fin... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-lis-driver-issues-on-linux-vms) |
| 3 | Linux VM fails to boot after migration to Azure or after di... | Hyper-V/LIS drivers not installed, disabled in /e... | Fix1(disabled): chroot repair VM, grep -nr hv_ /etc/modprob... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-lis-driver-issues-on-linux-vms) |
| 4 | Linux VM drops to dracut shell. dracut-initqueue timeout, r... | hv_vmbus/hv_storvsc disabled in /etc/modprobe.d/.... | Offline: rescue VM, chroot, remove hv driver disable entrie... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-hyperv-issue) |
| 5 | Linux VM 3.10 kernel (RHEL/CentOS 7.0-7.1) panics after hos... | SCSI locking bug in kernel < 3.10.0-327.10.1 trig... | Restart VM. Update kernel to 3.10.0-327.10.1+ (RHEL/CentOS/... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-kernel-panics-upgrade) |
| 6 | Oracle Linux 8 SP2 VM: Failed to start Switch Root after GR... | GRUB update corrupts boot entries. kernelopts mis... | Boot rescue kernel, copy kernelopts from grubenv, add to bo... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/resolve-failed-start-switch-root-azure-linux-vm) |
| 7 | Linux VM does not start correctly after LIS 4.1.3 upgrade o... | Kernel ABI changes in kernel 3.10.0-514.16.1 caus... | Do not upgrade LIS 4.1.3 on kernel 3.10.0-514.16.1. Install... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-vm-not-start-kernel-lis) |
| 8 | Linux VM enters dracut emergency shell. /dev/mapper/rootvg-... | Wrong root/swap device path in GRUB, duplicated p... | Fix GRUB config, remove wrong rd.lvm.lv swap entries, fsck,... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-no-boot-dracut) |
| 9 | Linux VM fails to boot with Kernel panic - VFS: Unable to m... | Missing initramfs image after kernel update/patch... | Boot previous kernel via Serial Console GRUB menu. Regenera... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/kernel-related-boot-issues) |
| 10 | Linux VM fails to boot with Kernel panic - Attempted to kil... | Missing important files/directories, missing syst... | Attach OS disk to repair VM + chroot. For missing libs: rpm... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/kernel-related-boot-issues) |
| 11 | Linux VM kernel panic after kernel upgrade/downgrade - kern... | Kernel upgrade incompatibility or bug; kernel dow... | Boot previous kernel via Serial Console or ALAR scripts (az... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/kernel-related-boot-issues) |

## 快速排查路径
1. 查看 Boot Diagnostics / Serial Console 确认 Kernel Panic 或 dracut 错误消息 `[来源: MS Learn]`
2. 尝试从 GRUB 选择旧内核启动（编辑 GRUB 菜单） `[来源: MS Learn]`
3. 如无法进 GRUB → 使用修复 VM 挂载 OS 磁盘 `[来源: MS Learn]`
4. 检查 /boot 空间是否充足 → 清理旧内核 `[来源: MS Learn]`
5. 重建 initramfs：`dracut -f /boot/initramfs-$(uname -r).img $(uname -r)` `[来源: MS Learn]`
6. 如内核文件缺失 → 重新安装内核包 `[来源: MS Learn]`
