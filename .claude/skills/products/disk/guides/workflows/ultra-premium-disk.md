# Disk Ultra Disk, Premium SSD v2 & NVMe — 排查工作流

**来源草稿**: onenote-azure-storage-feature-gap-21v.md, onenote-ultra-disk-feature-readiness.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Ultra Disk 功能与限制速查
> 来源: onenote-ultra-disk-feature-readiness.md | 适用: Mooncake ✅ / Global ✅

### Readiness QA 清单

| # | 问题 | 关键点 |
|---|------|--------|
| 1 | 哪些区域支持？ | 查 Global/Mooncake 文档 |
| 2 | 如何查找支持 Ultra Disk 的 zone/VM size？ | az CLI, PowerShell, Portal |
| 3 | 无冗余 VM 是否支持？ | 因地区而异 |
| 4 | 每订阅配额限制？ | 需查询当前限额 |
| 5 | 新 VM vs 现有 VM 启用流程？ | 不同步骤 |
| 6 | 使用什么驱动？ | 与标准磁盘不同的驱动 |
| 7 | 支持标准磁盘的所有功能吗？ | 否，见限制列表 |

### 关键限制
- ❌ Ultra Disk **不支持软删除恢复**（删除后无法恢复）
- ⚠️ Zone 特定：必须匹配 VM 的 availability zone
- ⚠️ VM 大小兼容性有限
- ⚠️ 使用独立于标准磁盘的驱动
- ⚠️ 仅支持数据磁盘

### 参考链接
- Global: https://docs.microsoft.com/en-us/azure/virtual-machines/disks-enable-ultra-ssd
- Mooncake: https://docs.azure.cn/en-us/virtual-machines/disks-enable-ultra-ssd
- CSS Wiki: [UltraSSD_Disk-Mgmt](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495778/UltraSSD_Disk-Mgmt)

---

## Scenario 2: Global vs China (21v) 存储功能差异
> 来源: onenote-azure-storage-feature-gap-21v.md | 适用: Mooncake ✅

### 关键功能差异

| Feature | Global | China (21v) |
|---------|--------|-------------|
| Advanced Threat Protection | GA | Not available |
| Minimum TLS version | GA | GA |
| AllowBlobPublicAccess | GA | GA |
| Private Endpoints | GA | GA |
| Customer-initiated failover | GA | GA |
| Storage account recovery (Portal) | GA | GA |
| Resource instance rules | GA | In Preview |
| Prevent Shared Key authorization | GA | Partial |

### PM 联系人
- Azure Disks PM: azuredisksPM@microsoft.com
- Azure File Share PM: AzureFilesPM@microsoft.com

### 排查流程
1. 客户询问功能可用性 → 先查此表
2. 不在列表中 → 查 Azure China 文档
3. 仍不确定 → 联系 PM 确认