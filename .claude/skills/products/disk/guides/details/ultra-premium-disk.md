# Disk Ultra Disk, Premium SSD v2 & NVMe — 综合排查指南

**条目数**: 4 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: onenote-azure-storage-feature-gap-21v.md, onenote-ultra-disk-feature-readiness.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Storage Feature Gap: Global vs China (21v)
> 来源: OneNote (onenote-azure-storage-feature-gap-21v.md)

1. - Azure Disks PM: azuredisksPM@microsoft.com
2. - Azure File Share PM: AzureFilesPM@microsoft.com / xsmb@microsoft.com
3. - XStore features (non-disk): Angshuman Nayak / Eric Spooner
4. | Feature | Global | China (21v) |
5. |---------|--------|-------------|
6. | Advanced Threat Protection | GA (May 2019) | Not available |
7. | Minimum TLS version | GA (Oct 2020) | GA (Oct 2020) |
8. | AllowSharedKeyAccess | Private Preview (Aug 2020) | GA |
9. | AllowBlobPublicAccess | GA (Jul 2020) | GA (Oct 2020) |
10. | Private Endpoints | GA (Mar 2020) | GA |

### Phase 2: Ultra Disk Storage Feature Readiness
> 来源: OneNote (onenote-ultra-disk-feature-readiness.md)

1. | Global Docs | [Ultra disks for VMs](https://docs.microsoft.com/en-us/azure/virtual-machines/disks-enable-ultra-ssd?tabs=azure-portal#ga-scope-and-limitations) |
2. | Mooncake Docs | [Ultra disks for VMs (China)](https://docs.azure.cn/en-us/virtual-machines/disks-enable-ultra-ssd?tabs=azure-portal#ga-scope-and-limitations) |
3. | CSS Wiki | [UltraSSD_Disk-Mgmt](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495778/UltraSSD_Disk-Mgmt) |
4. 1. Which regions support Ultra Disk? Any limitations (avset, zone, size, sub)?
5. 2. How to find which zone/VM size supports Ultra Disk? (az CLI, PowerShell, Portal)
6. 3. Does VMs with no redundancy support Ultra Disk in Mooncake?
7. 4. How much is the quota limit of Ultra Disk per subscription?
8. 5. How to enable Ultra disk support for existing VMs vs new VMs?
9. 6. Which driver is used for Ultra Disk?
10. 7. Can Ultra Disk support features that normal SSD/HDD disks support?

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot use Ultra Disk or Premium SSD v2 as OS disk. Deployment fails when attempting to create a VM with Ultra Disk or P | Ultra Disks and Premium SSD v2 can only be used as data disks. They cannot be used as OS disks. This | Use Premium SSD (v1) or Standard SSD as OS disk. Attach Ultra Disk or Premium SSD v2 as data disks only. For high-perfor | 🔵 7.5 | [MS Learn] |
| 2 | ZRS managed disks higher write latency vs LRS. ZRS unavailable for Premium SSD v2 or Ultra Disk. | ZRS replicates synchronously across 3 AZs adding latency. Only Premium SSD/Standard SSD. Force detac | Benchmark ZRS vs LRS. Use ZRS for HA. For Ultra/PSSv2 use LRS + cross-zone DR. | 🔵 7.5 | [MS Learn] |
| 3 | Cannot create NVMe VM: The selected image is not supported for NVMe error, or VM created as SCSI instead of NVMe with lo | NVMe VMs require Generation 2 VM image tagged as NVMe-capable. Gen1 images not supported. Untagged i | 1) Use Gen2 image tagged as NVMe. 2) Check supported images at enable-nvme-interface doc. 3) In portal use Disk controll | 🔵 7.5 | [MS Learn] |
| 4 | Cannot copy Ultra Disk or Premium SSD v2 instant access snapshot cross-region or download underlying data. Snapshot stuc | Ultra Disk and Premium SSD v2 instant access snapshots require background data copy to complete befo | 1) Check CompletionPercent property on snapshot -- wait until 100% for full availability. 2) Check SnapshotAccessState f | 🔵 7.0 | [MS Learn] |
