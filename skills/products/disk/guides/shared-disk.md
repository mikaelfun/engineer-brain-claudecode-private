# Disk Azure Shared Disk — 排查速查

**来源数**: 4 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: aks, azure-files, csv, deallocate, expand, failover-cluster, kusto, limitation, mooncake, multi-attach

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Customer needs to enable simultaneous multi-write access to Azure Premium Shared Disk from multiple VMs | Azure Shared Disks support multi-writer via Windows Server Failover Clustering (WSFC) with Cluster S | 1) Create Premium SSD shared disk (maxShares > 1). 2) Attach disk to all Failover Cluster node VMs. 3) In Failover Clust | 🟢 8.5 | [MCVKB] |
| 2 📋 | Azure Shared Disks: Kusto query for OsXIOXdiskCounterTable on rdosmc cluster to troubleshoot shared disk IO issues in Mo | Shared disk investigation requires querying OsXIOXdiskCounterTable on rdosmc.kusto.chinacloudapi.cn/ | Query: OsXIOXdiskCounterTable \| where PreciseTimeStamp > ago(5d) \| where BlobPath has '<blob-path>' \| take 10 | 🟢 8.5 | [MCVKB] |
| 3 📋 | AKS pod stuck in ContainerCreating: 'Multi-Attach error for volume — Volume is already used by pod(s)'. Azure disk canno | Azure managed disks can only be mounted as ReadWriteOnce (RWO), meaning the disk attaches to a singl | 1) Ensure the disk is not mounted by multiple pods on different nodes — reschedule pods to same node or use pod anti-aff | 🔵 7.5 | [MS Learn] |
| 4 📋 | Shared disk cannot be expanded (resized) while attached to VMs. Resize operation fails or is blocked. | Azure shared disks require all VMs to be deallocated or the disk to be detached from all VMs before  | Deallocate all VMs the shared disk is attached to OR detach the disk from all VMs, then resize, then reattach/restart. | 🔵 7.0 | [MS Learn] |

## 快速排查路径

1. Customer needs to enable simultaneous multi-write access to Azure Premium Shared → 1) Create Premium SSD shared disk (maxShares > 1) `[来源: onenote]`
2. Azure Shared Disks: Kusto query for OsXIOXdiskCounterTable on rdosmc cluster to  → Query: OsXIOXdiskCounterTable | where PreciseTimeStamp > ago(5d) | where BlobPath has '<blob-path>'  `[来源: onenote]`
3. AKS pod stuck in ContainerCreating: 'Multi-Attach error for volume — Volume is a → 1) Ensure the disk is not mounted by multiple pods on different nodes — reschedule pods to same node `[来源: mslearn]`
4. Shared disk cannot be expanded (resized) while attached to VMs. Resize operation → Deallocate all VMs the shared disk is attached to OR detach the disk from all VMs, then resize, then `[来源: mslearn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/shared-disk.md#排查流程)
