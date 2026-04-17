# ARM Azure Local 网络 — 排查工作流

**来源草稿**: ado-wiki-a-install-the-sdn-diagnostics-module.md, ado-wiki-b-configure-nsg-tags.md, ado-wiki-a-sdn-enabled-by-azure-arc.md 等 9 files
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Azure Local SDN 网络排查
> 来源: Azure Local networking 参考 | 适用: Mooncake ⚠️ / Global ✅

### 排查步骤
1. **安装 SDN Diagnostics 模块**:
   ```powershell
   Install-Module -Name SdnDiagnostics
   Import-Module -Name SdnDiagnostics
   ```
2. **诊断 SDN 问题**: 使用 SdnDiagnostics cmdlets
3. **检查 Network Controller 状态**
4. **分析 Arc-enabled SDN 连接性**

---

## Scenario 2: NSG Tags 配置
> 来源: ado-wiki-b-configure-nsg-tags.md | 适用: Mooncake ⚠️ / Global ✅

### 排查步骤
1. **System Tags**: VirtualNetwork, Internet, LoadBalancer
2. **Custom Tags**: 用户定义的 IP 分组标签
3. **验证**: 在测试环境中验证 tag-based rules 后再部署到生产
