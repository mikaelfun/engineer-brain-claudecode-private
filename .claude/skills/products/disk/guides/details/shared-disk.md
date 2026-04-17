# Disk Azure Shared Disk — 综合排查指南

**条目数**: 4 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: mslearn-shared-disk-limitations-reference.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Shared Disk Limitations Quick Reference
> 来源: MS Learn (mslearn-shared-disk-limitations-reference.md)

1. **Source**: https://learn.microsoft.com/azure/virtual-machines/disks-shared-enable
2. - Ultra Disk, Premium SSD v2, Premium SSD, Standard SSD only
3. - Host caching NOT supported (maxShares > 1)
4. - Write accelerator NOT supported
5. - Cannot expand disk while attached — deallocate all VMs or detach first
6. - Azure Disk Encryption (ADE/BitLocker/DM-Crypt) NOT supported → use SSE
7. - Cannot be defined in VMSS models for auto-deploy
8. - maxShares can only be changed when disk detached from all VMs
9. - Data disks only (not OS disks)
10. - Disk bursting NOT available (maxShares > 1)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer needs to enable simultaneous multi-write access to Azure Premium Shared Disk from multiple VMs | Azure Shared Disks support multi-writer via Windows Server Failover Clustering (WSFC) with Cluster S | 1) Create Premium SSD shared disk (maxShares > 1). 2) Attach disk to all Failover Cluster node VMs. 3) In Failover Clust | 🟢 8.5 | [MCVKB] |
| 2 | Azure Shared Disks: Kusto query for OsXIOXdiskCounterTable on rdosmc cluster to troubleshoot shared disk IO issues in Mo | Shared disk investigation requires querying OsXIOXdiskCounterTable on rdosmc.kusto.chinacloudapi.cn/ | Query: OsXIOXdiskCounterTable \| where PreciseTimeStamp > ago(5d) \| where BlobPath has '<blob-path>' \| take 10 | 🟢 8.5 | [MCVKB] |
| 3 | AKS pod stuck in ContainerCreating: 'Multi-Attach error for volume — Volume is already used by pod(s)'. Azure disk canno | Azure managed disks can only be mounted as ReadWriteOnce (RWO), meaning the disk attaches to a singl | 1) Ensure the disk is not mounted by multiple pods on different nodes — reschedule pods to same node or use pod anti-aff | 🔵 7.5 | [MS Learn] |
| 4 | Shared disk cannot be expanded (resized) while attached to VMs. Resize operation fails or is blocked. | Azure shared disks require all VMs to be deallocated or the disk to be detached from all VMs before  | Deallocate all VMs the shared disk is attached to OR detach the disk from all VMs, then resize, then reattach/restart. | 🔵 7.0 | [MS Learn] |
