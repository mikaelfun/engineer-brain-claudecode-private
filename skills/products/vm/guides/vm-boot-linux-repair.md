# VM Linux 启动修复参考（LVM/chroot/ALAR） — 排查速查

**来源数**: 5 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Linux VM fails to boot due to ext4 filesystem corruption. S... | Disk corruption on ext4 filesystem caused by kern... | Identify corrupted disk via serial log. Use fsck /dev/sdX t... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-recovery-cannot-start-file-system-errors) |
| 2 | Linux VM fails to boot due to XFS filesystem corruption. Se... | XFS disk corruption. Uncommitted journal entries ... | xfs_repair -n to check, xfs_repair to fix. Journal error: t... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-recovery-cannot-start-file-system-errors) |
| 3 | Guide: Linux VM boot error troubleshooting - consolidated r... |  | Consolidated guide linking to specific articles per boot er... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/boot-error-troubleshoot-linux) |
| 4 | Guide: Linux VM with LVM disk, no Serial Console - kernel b... |  | Use az vm repair + chroot. Fixes: boot previous kernel, fix... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/chroot-logical-volume-manager) |
| 5 | Guide: Linux VM kernel panic comprehensive troubleshooting |  | See guides/drafts/mslearn-linux-kernel-panic-troubleshootin... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-kernel-panic-troubleshooting) |

## 快速排查路径
1. 创建修复 VM 并挂载故障 OS 磁盘 `[来源: MS Learn]`
2. 如使用 LVM → 激活 VG：`vgchange -ay` 后 mount 逻辑卷 `[来源: MS Learn]`
3. 执行 chroot 进入故障系统：`chroot /mnt/rescue` `[来源: MS Learn]`
4. 在 chroot 内修复（重装内核/修改 fstab/重建 grub） `[来源: MS Learn]`
5. 或使用 ALAR (Azure Linux Auto Recovery) 自动修复脚本 `[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-boot-linux-repair.md#排查流程)
