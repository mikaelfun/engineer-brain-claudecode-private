# VM Windows 启动修复参考（BCD/系统文件/离线修复）— 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Windows VM 因 BCD store 损坏或缺失无法启动 | BCD 文件损坏/丢失 | 完整修复指南见 guides/drafts/mslearn-repair-boot-configuration-data.md | 🔵 5.5 — MS Learn+含融合指南+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/virtual-machines-windows-repair-boot-configuration-data) |
| 2 📋 | Windows VM 因系统二进制文件(.sys)损坏或缺失无法启动 | 系统文件损坏/丢失 | 完整修复指南见 guides/drafts/mslearn-repair-replace-system-binary.md | 🔵 5.5 — MS Learn+含融合指南+21V | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/virtual-machines-windows-repair-replace-system-binary-file) |

## 快速排查路径
1. **BCD 修复** → 挂载 OS disk → bcdedit 重建 BCD store → bcdboot 恢复引导文件 `[来源: MS Learn]`
2. **系统文件修复** → 挂载 OS disk → chkdsk → 从 WinSxS 复制替换损坏的 .sys 文件 `[来源: MS Learn]`
3. **通用离线修复** → 创建 repair VM → 挂载 → 修复 → swap disk → 重建 VM `[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-boot-win-repair.md#排查流程)
