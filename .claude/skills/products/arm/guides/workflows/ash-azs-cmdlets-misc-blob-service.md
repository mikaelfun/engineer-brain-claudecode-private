# ARM Azure Stack Hub AzS Support 诊断命令 (Misc / Blob Service) — 排查工作流

**来源草稿**: ado-wiki-a-AzsSupportComputeInfra.md 等 67 cmdlet 参考文件
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Blob Service 与杂项诊断
> 来源: ASH AzS.Support Module cmdlet 参考 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **导入模块**: 通过 PEP 或直接在节点上导入 Azs.Support 模块
2. **文件操作**: `Copy-AzsSupportFiles` / `Compress-AzsSupportArchive` / `Clear-AzsSupportWorkingDirectory`
3. **Tenant VM 名称转换**: `Convert-AzsSupportTenantVMName`
4. **Blob Service 诊断**: 检查 ACS 相关 Service Fabric Apps（BlobServiceApp, TableMasterApp 等）
5. **收集诊断数据并打包归档**
