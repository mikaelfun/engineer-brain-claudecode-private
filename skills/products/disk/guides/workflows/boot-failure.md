# Disk VM Boot Failures — 排查工作流

**来源草稿**: mslearn-kernel-boot-issues-linux.md, ado-wiki-a-support-operations-reboot-cache.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: Linux Kernel Panic — VFS: Unable to mount root fs
> 来源: mslearn-kernel-boot-issues-linux.md | 适用: Mooncake ✅ / Global ✅

### 症状
Serial console 显示: `Kernel panic - VFS: Unable to mount root fs on unknown-block(0,0)`

### 原因
内核更新后缺少 initramfs。

### 排查步骤

1. **ALAR 自动修复（推荐）**
   ```bash
   az vm repair repair-button --button-command initrd -g $RG --name $VM
   ```

2. **手动修复 (chroot)**
   - RHEL/CentOS:
     ```bash
     depmod -a <kernel-version>
     dracut -f /boot/initramfs-<kernel-version>.img <kernel-version>
     ```
   - SLES:
     ```bash
     dracut -f /boot/initrd-<kernel-version> <kernel-version>
     ```
   - Ubuntu:
     ```bash
     mkinitramfs -k -o /boot/initrd.img-<kernel-version>
     ```

---

## Scenario 2: Attempted to kill init!
> 来源: mslearn-kernel-boot-issues-linux.md | 适用: Mooncake ✅ / Global ✅

### 可能原因与修复

| 原因 | 诊断方法 | 修复 |
|------|----------|------|
| 缺少文件/目录 | `ls -l /boot/` | 从备份恢复 |
| 核心库缺失 | `rpm --verify --all --root=/rescue` | 重新安装缺失包 |
| 文件权限错误 | `rpm -a --setperms; rpm --setugids --all` | 重置权限 |
| 分区缺失 | 检查 fstab | 修复分区表 |
| SELinux 问题 | 引导参数 `selinux=0` | `touch /.autorelabel` 后重启 |

---

## Scenario 3: 引导到旧内核
> 来源: mslearn-kernel-boot-issues-linux.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Serial Console 方式**
   - 重启 VM → 在 GRUB 界面按 ESC
   - 用方向键选择旧内核

2. **ALAR 自动修复**
   ```bash
   az vm repair run -g $RG -n $VM --run-id linux-alar2 --parameters kernel --run-on-repair
   ```

3. **修改默认内核**
   - RHEL 7: `grub2-set-default '<menu entry title>'`
   - RHEL 8/9: `grubby --set-default /boot/vmlinuz-<version>`
   - SLES/Ubuntu: 编辑 `/etc/default/grub` 中的 `GRUB_DEFAULT`

---

## Scenario 4: 引导验证关键命令
> 来源: mslearn-kernel-boot-issues-linux.md | 适用: Mooncake ✅ / Global ✅

### 关键验证命令

```bash
ls -l /boot/                                    # 检查 initramfs/vmlinuz 文件是否存在
cat /boot/grub2/grub.cfg | grep menuentry       # Gen1 GRUB 菜单项
cat /boot/efi/EFI/*/grub.cfg | grep menuentry   # Gen2 GRUB 菜单项
lsinitrd /boot/initramfs-*.img                   # 检查 initrd 内容
lsmod                                            # 已加载模块
cat /etc/modprobe.d/*.conf                       # 禁用的模块
```