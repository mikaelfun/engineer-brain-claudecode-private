# VM Windows 驱动/系统文件损坏启动失败 — 排查速查

**来源数**: 6 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Windows VM fails to boot with error 0xC0000011: Windo... | File version mismatch between the binary file ind... | Attach OS disk to troubleshooting VM. Run chkdsk /F. Replac... | 🟢 8.0 — MS Learn+交叉验证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-0xc0000011) |
| 2 | Azure Windows VM fails to boot with error 0xC0000098: criti... | Binary file is from a different version of Window... | Attach OS disk to troubleshooting VM. chkdsk /F. Replace co... | 🟢 8.0 — MS Learn+交叉验证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-0xc0000098) |
| 3 | Azure Windows VM fails to boot with error 0xC0000359: criti... | The binary file is the 32-bit version and needs t... | Attach OS disk to troubleshooting VM. chkdsk /F. Replace wi... | 🟢 8.0 — MS Learn+交叉验证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-0xc0000359) |
| 4 | Azure Windows VM fails to boot with error 0xC00000BA: a cri... | Windows system files corruption from unfinished i... | 1) Disable recently installed service via registry (set Sta... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-0xc00000ba) |
| 5 | Azure Windows VM fails to boot with stop error 0xC0000102 S... | Corrupt file or disk structure has become corrupt... | VM repair commands to create repair VM. chkdsk /F. Replace ... | 🔵 7.0 — MS Learn+高置信 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/error-code-0xC0000102-status-file-corrupt) |
| 6 | Azure Windows VM fails to boot with ntoskrnl.exe error 0xc0... | File system corruption on the OS disk causing the... | Attach OS disk to rescue VM. Run DISM /restorehealth using ... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/boot-error-0xc0000221) |

## 快速排查路径
1. 查看 Boot Diagnostics 截图，确认蓝屏错误代码（0xC00000BA / 0xC0000011 / 0xC000000F 等） `[来源: MS Learn]`
2. 将 OS 磁盘挂载到修复 VM（或使用 Serial Console） `[来源: MS Learn]`
3. 运行 `chkdsk /F` 检查文件系统完整性 `[来源: MS Learn]`
4. 根据错误代码定位损坏的驱动/系统文件 → 从 WinSxS 或安装介质恢复 `[来源: MS Learn]`
5. 如有大面积损坏 → 运行 DISM /RestoreHealth + SFC /scannow 离线修复 `[来源: MS Learn]`
