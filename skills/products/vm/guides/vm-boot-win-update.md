# VM Windows 启动卡在 Update / Sysprep / 重启循环 — 排查速查

**来源数**: 11 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Windows VM shows 'Windows could not finish configurin... | The OS is unable to complete the Sysprep process.... | The image cannot be recovered. Recreate the generalized ima... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-could-not-configure-system) |
| 2 | Azure Windows VM stuck during Windows Update with error C01... | OS disk is full — the operating system cannot wri... | Attach OS disk to repair VM. 1) Resize disk up to 1TB if no... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-update-installation-capacity) |
| 3 | Azure Windows VM stuck on 'Checking file system on C:' or '... | NTFS file system error found after unexpected VM ... | If VM is stuck and not progressing: 1. Snapshot OS disk as ... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-check-disk-boot-error) |
| 4 | Windows VM stuck on Getting ready or Getting Windows ready.... | Server performing final restart after configurati... | 1. Restore VM from backup if available. 2. Otherwise attach... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-vm-boot-configure-update) |
| 5 | Windows VM caught in reboot loop: boot diagnostics shows VM... | Three possible causes: (1) Third-party service fl... | Attach OS disk to rescue VM. Cause 1: Check ErrorControl re... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-reboot-loop) |
| 6 | Azure VM startup stuck at Windows Update screen: messages l... | Windows Update installation or rollback process s... | Wait 8 hours first. If still stuck: attach OS disk to rescu... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-stuck-updating-boot-error) |
| 7 | Windows installation error during VM boot: The computer res... | Custom Unattend.xml answer file used with sysprep... | Re-run sysprep without /unattend flag: sysprep /oobe /gener... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-unexpected-restart-error-during-vm-boot) |
| 8 | VM stuck at Windows Boot Manager menu: Choose an operating ... | BCD flag displaybootmenu is enabled, causing Boot... | Via Serial Console: bcdedit /set {bootmgr} timeout 5 or bcd... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-guide-windows-boot-manager-menu) |
| 9 | Windows Server 2016 VM unresponsive after applying Windows ... | Insufficient disk space or permission issue with ... | Before applying KB5003638: ensure 1GB free space, apply KB5... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/unresponsive-vm-apply-windows-update) |
| 10 | Azure Windows VM fails to boot with winload.exe error 0xc00... | VM was built from a non-RTM preview/trial image t... | No fix available for expired image. Must redeploy VM using ... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/error-code-0xc0000605) |
| 11 | Azure Windows VM shutdown is stuck on Restarting, Shutting ... | Windows shutdown process is performing system mai... | 1. Use Serial Console to identify stuck service with Get-Se... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-troubleshoot-windows) |

## 快速排查路径
1. 查看 Boot Diagnostics 截图，确认是否卡在 Windows Update / Sysprep / 重启循环 `[来源: MS Learn]`
2. 通过修复 VM 挂载 OS 磁盘 `[来源: MS Learn]`
3. 检查 pending.xml → 卸载失败的更新包 `dism /image:X:\ /remove-package /packagename:xxx` `[来源: MS Learn]`
4. Sysprep 失败 → 检查 `setupact.log` 和 `setuperr.log` `[来源: MS Learn]`
5. 如有重启循环 → 尝试 Safe Mode 启动并回滚更新 `[来源: MS Learn]`
