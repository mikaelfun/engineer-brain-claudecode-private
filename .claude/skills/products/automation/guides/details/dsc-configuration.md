# Automation DSC (Desired State Configuration) — 综合排查指南

**条目数**: 1 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-dsc-for-vm.md](../drafts/onenote-dsc-for-vm.md)
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: DSC for VM 配置流程
> 来源: [onenote-dsc-for-vm.md](../drafts/onenote-dsc-for-vm.md)

完整步骤按顺序执行：

1. **启用 VM 节点**
   - Automation Account > State Configuration (DSC) > Nodes
   - 添加目标 VM

2. **导入 `nx` 模块 (Linux)**
   - `nx` 包含 Linux DSC 资源
   - Automation Account > Modules > 从 PowerShell Gallery 导入
   - ⚠️ 如果 Mooncake 无 Modules Gallery → 手动下载 nx 模块上传

3. **导入 Configuration 文件**
   - **Windows**: 从 Gallery 导入 → `xUser_CreateUserConfig`
   - **Linux**: 查阅 nx PowerShell 文档获取可用资源
     - 参考: https://learn.microsoft.com/en-us/powershell/dsc/reference/resources/linux/lnxuserresource?view=dsc-1.1

4. **编译 Configuration**
   - Automation Account > State Configuration (DSC) > Configurations
   - 编译已导入的 Configuration

5. **分配 Configuration 到 DSC Node**
   - 将已编译的 Configuration 分配给目标 VM 节点

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Windows VM | 使用内置或 Gallery Configuration | 直接导入 + 编译 |
| Linux VM | 需要 nx 模块 | 先导入 nx → 再导入 Configuration |
| Mooncake 无 Modules Gallery | 手动上传模块 | 下载 nx nupkg → 手动上传 |

`[结论: 🔵 7/10 — OneNote 来源，单源文档，步骤明确]`

---

## 参考文档

| 文档 | URL |
|------|-----|
| Azure DSC 快速入门 (中文) | https://docs.azure.cn/zh-cn/automation/quickstarts/dsc-configuration |
| Linux DSC nx 资源参考 | https://learn.microsoft.com/en-us/powershell/dsc/reference/resources/linux/lnxuserresource?view=dsc-1.1 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | 需要配置 DSC for VM | — | 5 步流程: 启用节点 → 导入模块 → 导入 Config → 编译 → 分配，见 Phase 1 | 🔵 7 — OneNote 单源 | [Mooncake POD/DSC for VM](../drafts/onenote-dsc-for-vm.md) |
