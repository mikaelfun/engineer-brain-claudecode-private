# VM Linux Gen2 UEFI / GRUB 启动失败 — 排查速查

**来源数**: 5 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Gen2 Linux VM 启动失败: boot loader did not load an OS / boot image not found — EFI 分区丢失 | UEFI (EFI System) 引导分区被删除或丢失 | az vm repair 创建修复 VM，用 gdisk 按发行版参数重建 EFI 分区，az vm repair restore 还原 | 🟢 8 — MS Learn+详细步骤 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/azure-linux-vm-uefi-boot-failures) |
| 2 | Gen2 Linux VM 启动失败 — EFI 分区损坏 (dirty bit) | UEFI vfat 分区损坏，引导加载器无法读取 | 创建修复 VM，对 EFI 分区运行 fsck.vfat 清除 dirty bit，还原 OS disk | 🟢 8 — MS Learn+详细步骤 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/azure-linux-vm-uefi-boot-failures) |
| 3 | Linux VM /boot 分区内容全部被删除后无法启动 | /boot 目录下 kernel、initramfs、grub 全部被删且不可恢复 | 唯一恢复方案：Azure Backup 还原 | 🔵 7 — MS Learn 单源 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/azure-linux-vm-uefi-boot-failures) |
| 4 📋 | Chroot 环境指南：Ubuntu/RHEL/CentOS/Oracle/SUSE 含 raw 分区和 LVM | 参考指南（无特定根因） | 创建修复 VM，挂载 OS disk 分区，按发行版进入 chroot 修复。LVM 需 vgimportclone | 🔵 6.5 — MS Learn 指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/chroot-environment-linux) |
| 5 📋 | Linux VM GRUB rescue 排查指南 | 参考指南（无特定根因） | 见融合指南 guides/drafts/mslearn-linux-grub-rescue-troubleshooting.md | 🔵 6 — MS Learn 指南 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-vm-boot-error) |

## 快速排查路径
1. Boot Diagnostics 截图确认错误类型 `[来源: MS Learn]`
   - "boot loader did not load an operating system" → EFI 分区丢失 → #1
   - "grub rescue>" 或 GRUB 相关错误 → #5 GRUB rescue 指南
2. az vm repair create 创建修复 VM，挂载 OS disk `[来源: MS Learn]`
3. 检查 EFI 分区：`lsblk` + `gdisk -l /dev/sdX` `[来源: MS Learn]`
   - EFI 分区不存在 → 用 gdisk 重建 (#1)
   - EFI 分区存在但损坏 → fsck.vfat 修复 (#2)
4. /boot 内容全部丢失 → Azure Backup 还原 (#3)
5. 需要 chroot 进行深层修复 → 参考 chroot 指南 (#4)

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-boot-linux-uefi.md#排查流程)
