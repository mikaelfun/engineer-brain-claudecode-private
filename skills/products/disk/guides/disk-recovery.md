# Disk Managed Disk Recovery — 排查速查

**来源数**: 4 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: asr, backup, blob-recovery, disk-recovery, diskrp, eee, extensionfailedsnapshotlimitreachederror, geneva-action, hard-delete, icm

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Customer accidentally deleted a managed disk and needs recovery (disk in soft-deleted state) | Managed disk enters soft-deleted state when: created >10 days ago (internal), deleted <96 hours ago, | 1) Check DiskRPResourceLifecycleEvent in Kusto (disksmc cluster) for SoftDelete event. 2) Submit ICM to AzureRT/Disk Ser | 🟢 9 | [MCVKB] |
| 2 📋 | Customer needs to recover a hard-deleted managed disk | Disk is past 96-hour soft-delete window and in HardDelete state. Recovery is best-effort, not guaran | 1) Check DiskRPResourceLifecycleEvent in Kusto. 2) Run Geneva Action Get Blob Recovery Info (Xstore > Resource Recovery) | 🟢 9 | [MCVKB] |
| 3 📋 | Customer needs to recover deleted blob or unmanaged disk data | Data deleted at blob level. Recovery window: <6 days for Standard Storage, <3 days for Premium. Best | 1) Use ASC Blob/Container Deletion Lookup or Jarvis logs for details. 2) Run XPortal VirtualEEEIncidentData to check rec | 🟢 8.5 | [MCVKB] |
| 4 📋 | VM backup fails: 'ExtensionFailedSnapshotLimitReachedError - Snapshot operation failed as snapshot limit exceeded for so | Blob snapshot count for attached disks exceeded max limit. Azure Site Recovery or soft-delete retent | 1) Delete unnecessary disk blob-snapshots. 2) If soft-delete enabled, adjust retention. 3) If ASR enabled, set isanysnap | 🔵 7.0 | [MS Learn] |

## 快速排查路径

1. Customer accidentally deleted a managed disk and needs recovery (disk in soft-de → 1) Check DiskRPResourceLifecycleEvent in Kusto (disksmc cluster) for SoftDelete event `[来源: onenote]`
2. Customer needs to recover a hard-deleted managed disk → 1) Check DiskRPResourceLifecycleEvent in Kusto `[来源: onenote]`
3. Customer needs to recover deleted blob or unmanaged disk data → 1) Use ASC Blob/Container Deletion Lookup or Jarvis logs for details `[来源: onenote]`
4. VM backup fails: 'ExtensionFailedSnapshotLimitReachedError - Snapshot operation  → 1) Delete unnecessary disk blob-snapshots `[来源: mslearn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/disk-recovery.md#排查流程)
