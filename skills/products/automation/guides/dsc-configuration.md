# Automation DSC 状态配置 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | 需要在 Automation Account 中配置 Desired State Configuration (DSC) 管理 VM | — | DSC 配置指南：含 Linux nx 模块配置、VM 状态配置步骤 | 🟢 8 — OneNote 文档 | [POD/AUTOMATION/DSC for VM](Mooncake%20POD%20Support%20Notebook/POD/VMSCIM/4.%20Services/AUTOMATION/##%20Troubleshooting/Hybrid%20worker/DSC%20for%20VM.md) |

## 快速排查路径

1. **配置 DSC**：在 Automation Account 中导入 DSC 配置 → 编译 → 分配给目标 VM `[来源: OneNote]`
2. **Linux VM**：确认 nx 模块已安装 → 配置 LCM (Local Configuration Manager) `[来源: OneNote]`
3. **状态检查**：从 Automation Account → State Configuration 面板查看合规状态 `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/dsc-configuration.md#排查流程)
