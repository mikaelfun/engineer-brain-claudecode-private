# Disk Managed Disk Recovery — 综合排查指南

**条目数**: 4 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**Kusto 引用**: disk-lifecycle.md
**生成日期**: 2026-04-07

---

## 排查流程

### Kusto 查询模板

#### disk-lifecycle.md
> `[工具: Kusto skill — disk-lifecycle.md]`

- **用途**
- **必要参数**
- **查询语句**
- **结果字段说明**
- **事件类型说明**

```kusto
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where resourceName has "{diskName}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| project PreciseTimeStamp, resourceGroupName, resourceName, diskEvent, stage, state, 
         blobUrl, diskOwner, storageAccountType, tier, diskSizeBytes
| order by PreciseTimeStamp asc
```

```kusto
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where blobUrl contains "{blobPath}"
| where PreciseTimeStamp >= ago(3d)
| project PreciseTimeStamp, resourceGroupName, resourceName, diskOwner, blobUrl, diskEvent, stage
| order by PreciseTimeStamp asc
```

```kusto
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where diskOwner contains "{vmName}"
| where diskEvent in ("Attach", "Detach")
| where PreciseTimeStamp >= ago(7d)
| project PreciseTimeStamp, resourceName, diskEvent, stage, state, diskOwner
| order by PreciseTimeStamp asc
```

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer accidentally deleted a managed disk and needs recovery (disk in soft-deleted state) | Managed disk enters soft-deleted state when: created >10 days ago (internal), deleted <96 hours ago, | 1) Check DiskRPResourceLifecycleEvent in Kusto (disksmc cluster) for SoftDelete event. 2) Submit ICM to AzureRT/Disk Ser | 🟢 9 | [MCVKB] |
| 2 | Customer needs to recover a hard-deleted managed disk | Disk is past 96-hour soft-delete window and in HardDelete state. Recovery is best-effort, not guaran | 1) Check DiskRPResourceLifecycleEvent in Kusto. 2) Run Geneva Action Get Blob Recovery Info (Xstore > Resource Recovery) | 🟢 9 | [MCVKB] |
| 3 | Customer needs to recover deleted blob or unmanaged disk data | Data deleted at blob level. Recovery window: <6 days for Standard Storage, <3 days for Premium. Best | 1) Use ASC Blob/Container Deletion Lookup or Jarvis logs for details. 2) Run XPortal VirtualEEEIncidentData to check rec | 🟢 8.5 | [MCVKB] |
| 4 | VM backup fails: 'ExtensionFailedSnapshotLimitReachedError - Snapshot operation failed as snapshot limit exceeded for so | Blob snapshot count for attached disks exceeded max limit. Azure Site Recovery or soft-delete retent | 1) Delete unnecessary disk blob-snapshots. 2) If soft-delete enabled, adjust retention. 3) If ASR enabled, set isanysnap | 🔵 7.0 | [MS Learn] |
