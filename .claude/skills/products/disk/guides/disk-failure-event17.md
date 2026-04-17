# Disk IaaS Disk Failure (Event 17) — 排查速查

**来源数**: 2 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: disk-failure, e17, event17, iaasxstorageoutage, rca, triage, vhddiskprt, vm-reboot, vma, xdiskblobnotfound

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | VM experiences IaaS Disk Failure (Event 17) causing unexpected restart | Storage service availability drop - VM host disk driver cannot write data to storage for 2 minutes,  | 1) Query VMA in vmainsight Kusto for TriageCategory. 2) Query XHealth_DiskFailureXStoreTriage in xlivesite Kusto. 3) Run | 🟢 9 | [MCVKB] |
| 2 📋 | VM reboots repeatedly with E17 IaaSxStorageOutage; VhdDiskPrt errors XDiskBlobNotFound/XDiskContainerNotFound | Managed disk backend blob deleted or container not found at xstore layer. FASTPATH_RESPONSE_TYPE_BUS | Run GetRDOSE17Triage on rdosmc.kusto.chinacloudapi.cn/rdos. Check XPortal AutoTriage. If 8170012F/8170012E dominant, esc | 🟢 9 | [MCVKB] |

## 快速排查路径

1. VM experiences IaaS Disk Failure (Event 17) causing unexpected restart → 1) Query VMA in vmainsight Kusto for TriageCategory `[来源: onenote]`
2. VM reboots repeatedly with E17 IaaSxStorageOutage; VhdDiskPrt errors XDiskBlobNo → Run GetRDOSE17Triage on rdosmc `[来源: onenote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/disk-failure-event17.md#排查流程)
