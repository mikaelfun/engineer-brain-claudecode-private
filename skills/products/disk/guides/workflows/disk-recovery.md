# Disk Managed Disk Recovery — 排查工作流

**来源草稿**: 无
**Kusto 引用**: disk-lifecycle.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 磁盘删除事件追踪
> 来源: disk-lifecycle.md | 适用: Mooncake ✅

### 排查步骤

1. **确认磁盘删除事件**
   ```kql
   cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent
   | where subscriptionId == "{subscription}"
   | where resourceName has "{diskName}"
   | where diskEvent == "Delete"
   | project PreciseTimeStamp, resourceGroupName, resourceName, diskEvent, stage, blobUrl, diskOwner
   ```

2. **检查删除前的磁盘状态**
   ```kql
   | where diskEvent in ("Create", "Attach", "Detach", "Delete")
   | order by PreciseTimeStamp asc
   ```

3. **通过 Blob URL 追踪**
   ```kql
   | where blobUrl contains "{blobPath}"
   ```

---

## Scenario 2: 磁盘恢复可行性判断
> 来源: disk-lifecycle.md | 适用: Mooncake ✅

### 决策树
```
磁盘已删除 → 能否恢复?
├── 有 Azure Backup → 从 Backup 恢复
├── 有快照 → 从快照创建新磁盘
├── 有 ASR → 从副本恢复
├── 无以上任何备份
│   ├── 托管磁盘（标准） → PG 可能做 blob-recovery（有时间窗口）
│   ├── Ultra Disk → 不支持恢复
│   └── 已超过恢复时间窗口 → 数据丢失
└── 确认删除操作者 → 通过 lifecycle event 的 diskOwner 和操作时间追踪
```

### 关键注意
- Ultra Disk 不支持软删除恢复
- 恢复需要 PG 团队介入（通过 Geneva Action / ICM）
- 恢复有时间窗口限制，尽早提交请求