# VM Linux fstab / 文件系统 / 磁盘满启动失败 — 排查速查

**来源数**: 7 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Data disk mounted under /mnt fails to mount after unexpecte... | For Linux VMs provisioned with cloud-init, the te... | 1) Avoid mounting data disks under /mnt/ (reserved for temp... | 🔵 7.5 — OneNote+高置信 | MCVKB/MCVKB/VM+SCIM/=======3. Linux=======/3.16 [Linux]For Linux VMs provisioned using cloud-.md |
| 2 | Linux VM boots into emergency mode due to fstab misconfigur... | Incorrect /etc/fstab: device names instead of UUI... | Serial Console single-user mode, fix fstab (UUID+nofail), m... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-virtual-machine-cannot-start-fstab-errors) |
| 3 | Linux VM boot fails or apps break after restart because /de... | Linux device paths not persistent across reboots.... | Use persistent naming: UUID in fstab, /dev/disk/azure/scsiN... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-device-names-problems) |
| 4 | Linux VM shuts down or fails to boot when OS disk /var/log/... | auditd.conf admin_space_left_action=HALT causes s... | Change HALT to SUSPEND in /etc/audit/auditd.conf via rescue... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-fulldisk-boot-error) |
| 5 | Linux VM fails to boot after VFAT disabled. Failed to mount... | VFAT required for /boot/efi (Gen2) and ADE BEK VO... | Remove 'install vfat /bin/true' from /etc/modprobe.d/, rege... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/vfat-disabled-boot-issues) |
| 6 | Linux VM fails to boot due to incorrect HugePages. OOM, ude... | vm.nr_hugepages in /etc/sysctl.conf set too high,... | Boot single user mode or rescue VM. Reduce vm.nr_hugepages ... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-vm-no-boot-incorrect-hugepages-configuration) |
| 7 | Linux VM fails to boot after OS disk resize. cloud-init Err... | Cloud-init requires some free space to expand roo... | Clear unneeded data via rescue VM or single user mode, then... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-fulldisk-boot-error) |

## 快速排查路径
1. 查看 Boot Diagnostics / Serial Console 确认 emergency mode / fstab 错误 `[来源: MS Learn]`
2. 通过 Serial Console 以 root 登录 emergency mode `[来源: MS Learn]`
3. 检查 `/etc/fstab` 中的挂载项 → 注释掉错误条目 `[来源: MS Learn]`
4. 确保使用 UUID 而非设备名（`/dev/sdX` 可能变化） `[来源: MS Learn]`
5. 如磁盘满 → 清理日志 / 临时文件释放空间 `[来源: MS Learn]`
6. 运行 `fsck` 修复文件系统 → 重启验证 `[来源: MS Learn]`
