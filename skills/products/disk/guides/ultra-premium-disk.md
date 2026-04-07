# Disk Ultra Disk, Premium SSD v2 & NVMe — 排查速查

**来源数**: 4 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: availability-zone, azure-compute-gallery, completionpercent, cross-region, data-disk-only, disk-controller, gen2, instant-access-snapshot, latency, limitation

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Cannot use Ultra Disk or Premium SSD v2 as OS disk. Deployment fails when attempting to create a VM with Ultra Disk or P | Ultra Disks and Premium SSD v2 can only be used as data disks. They cannot be used as OS disks. This | Use Premium SSD (v1) or Standard SSD as OS disk. Attach Ultra Disk or Premium SSD v2 as data disks only. For high-perfor | 🔵 7.5 | [MS Learn] |
| 2 📋 | ZRS managed disks higher write latency vs LRS. ZRS unavailable for Premium SSD v2 or Ultra Disk. | ZRS replicates synchronously across 3 AZs adding latency. Only Premium SSD/Standard SSD. Force detac | Benchmark ZRS vs LRS. Use ZRS for HA. For Ultra/PSSv2 use LRS + cross-zone DR. | 🔵 7.5 | [MS Learn] |
| 3 📋 | Cannot create NVMe VM: The selected image is not supported for NVMe error, or VM created as SCSI instead of NVMe with lo | NVMe VMs require Generation 2 VM image tagged as NVMe-capable. Gen1 images not supported. Untagged i | 1) Use Gen2 image tagged as NVMe. 2) Check supported images at enable-nvme-interface doc. 3) In portal use Disk controll | 🔵 7.5 | [MS Learn] |
| 4 📋 | Cannot copy Ultra Disk or Premium SSD v2 instant access snapshot cross-region or download underlying data. Snapshot stuc | Ultra Disk and Premium SSD v2 instant access snapshots require background data copy to complete befo | 1) Check CompletionPercent property on snapshot -- wait until 100% for full availability. 2) Check SnapshotAccessState f | 🔵 7.0 | [MS Learn] |

## 快速排查路径

1. Cannot use Ultra Disk or Premium SSD v2 as OS disk. Deployment fails when attemp → Use Premium SSD (v1) or Standard SSD as OS disk `[来源: mslearn]`
2. ZRS managed disks higher write latency vs LRS. ZRS unavailable for Premium SSD v → Benchmark ZRS vs LRS `[来源: mslearn]`
3. Cannot create NVMe VM: The selected image is not supported for NVMe error, or VM → 1) Use Gen2 image tagged as NVMe `[来源: mslearn]`
4. Cannot copy Ultra Disk or Premium SSD v2 instant access snapshot cross-region or → 1) Check CompletionPercent property on snapshot -- wait until 100% for full availability `[来源: mslearn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ultra-premium-disk.md#排查流程)
