# VM Windows 启动卡在 Group Policy / Session Manager — 排查速查

**来源数**: 8 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure VM unresponsive during boot showing Applying Audit Po... | Conflicting locks when Delete user profiles older... | Attach OS disk to rescue VM. Load SOFTWARE hive as BROKENSO... | 🔵 6.5 — MS Learn+交叉验证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/vm-unresponsive-applying-audit-configuration-policy) |
| 2 | Azure VM (domain controller) unresponsive on restart, boot ... | Recent changes to Default Domain Controllers Poli... | Undo recent Default Domain Controllers Policy changes. If u... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/vm-unresponsive-domain-controllers-policy) |
| 3 | Azure VM unresponsive during boot showing Applying Group Po... | Conflicting locks when Delete user profiles older... | Attach OS disk to rescue VM. Load SOFTWARE hive as BROKENSO... | 🔵 6.5 — MS Learn+交叉验证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/unresponsive-vm-apply-group-policy) |
| 4 | Azure VM unresponsive during boot, stuck at 'Please wait fo... | Multiple potential causes requiring memory dump a... | 1) Wait up to 1 hour as process may self-resolve. 2) If per... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/vm-unresponsive-wait-local-session-manager) |
| 5 | Azure Windows VM stuck during boot on Applying Group Policy... | Group Policy Environment policy processing hangs ... | Collect OS memory dump file from the VM. Create Azure suppo... | 🔵 6.5 — MS Learn+交叉验证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/applying-group-policy-environment-policy) |
| 6 | Windows VM stuck during boot at 'Applying Group Policy Powe... | Group Policy processing stall during boot. Specif... | Collect OS memory dump file via rescue VM, then file Azure ... | 🔵 6.5 — MS Learn+交叉验证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/applying-group-policy-power-options) |
| 7 | Windows VM stuck during boot at 'Please wait for the Group ... | VM is applying many or complex Group Policy setti... | Wait up to 1 hour for GP processing to complete. If still s... | 🔵 6.5 — MS Learn | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/please-wait-for-the-group-policy-client) |
| 8 | Azure Windows VM stuck during boot on 'Applying Group Polic... | Group Policy Shortcuts policy processing hangs du... | Collect OS memory dump file using repair VM, then open supp... | 🔵 6.5 — MS Learn+交叉验证 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/applying-group-policy-shortcuts-policy) |

## 快速排查路径
1. 查看 Boot Diagnostics 截图，确认是否卡在 "Applying Group Policy" 或 "Please wait" `[来源: MS Learn]`
2. 通过 Serial Console / 修复 VM 进入离线注册表编辑 `[来源: MS Learn]`
3. 检查 Group Policy 注册表项 `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon` `[来源: MS Learn]`
4. 尝试 Safe Mode 启动（bcdedit 设置 safeboot）→ 排查具体卡住的策略 `[来源: MS Learn]`
5. 如涉及 audit policy → 清理 `%SystemRoot%\security\database\*.log` `[来源: MS Learn]`
