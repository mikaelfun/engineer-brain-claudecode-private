# ARM Azure Stack Hub 存储 — 排查工作流

**来源草稿**: ado-wiki-b-azure-consistent-storage-acs.md 等 7 files
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Azure Consistent Storage (ACS) 排查
> 来源: ado-wiki-b-azure-consistent-storage-acs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **了解 ACS 组件** — Service Fabric Apps:
   - BlobServiceApp
   - TableMasterApp / TableServerApp
   - AccountAndContainerApp
   - FrontEndApp
   - SettingsApp
   - SrpServiceApp
   - StorageConfigSetupApp
2. **检查 Service Fabric App 健康状态**
3. **分析 CSV (Cluster Shared Volumes) 磁盘空间**
4. **查看 ACS 相关日志**
