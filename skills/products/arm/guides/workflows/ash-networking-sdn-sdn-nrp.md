# ARM Azure Stack Hub 网络与 SDN (SDN / NRP) — 排查工作流

**来源草稿**: ado-wiki-a-install-the-sdn-diagnostics-module.md, ado-wiki-a-Invoke-AzsSupportSdnResourceRequest.md 等 8 files
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: SDN 诊断模块安装与使用
> 来源: ado-wiki-a-install-the-sdn-diagnostics-module.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Host 节点安装**:
   ```powershell
   Install-Module -Name SdnDiagnostics
   Import-Module -Name SdnDiagnostics
   Get-Command -Module SdnDiagnostics
   ```
2. **Domain Controller 安装**: 需先导入 Network Controller 证书
3. **验证**: 确认 Start-SdnNetshTrace 等命令可用

---

## Scenario 2: SDN 资源与 NRP 排查
> 来源: ASH SDN 参考文件 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 使用 `Invoke-AzsSupportSdnResourceRequest` 查询 SDN 资源状态
2. 检查重复 SDN 资源问题
3. 分析 NRP (Network Resource Provider) 日志
4. 验证 Network Controller 健康状态
