# VM Performance — 排查工作流

**来源草稿**: ado-wiki-b-Defender-Performance-Issues-Process.md, ado-wiki-b-afs-recall-performance.md, ado-wiki-c-sync-performance-investigation.md, mslearn-performance-bottlenecks-linux.md, onenote-sar-linux-performance-monitoring.md, onenote-vm-performance-metrics-dashboard.md, onenote-vm-storage-performance-throttling.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 3
**覆盖子主题**: vm-performance
**生成日期**: 2026-04-07

---

## Scenario 1: Temp disk NOT required
> 来源: onenote-vm-storage-performance-throttling.md | 适用: Mooncake \u2705

### 排查步骤
1. Disable temp local disk
2. Ensure: VM total cached disk throughput < VM cached max limit
3. Ensure: Total disk throughput < VM uncached max limit

---

## Scenario 2: Temp disk IS required
> 来源: onenote-vm-storage-performance-throttling.md | 适用: Mooncake \u2705

### 排查步骤
1. Do NOT enable disk cache on mission critical disks (temp disk triggers cached throttling)
2. Total disk throughput (excluding temp) < VM uncached max limit
3. Consider disabling OS disk cache too (P10 OS without cache may be slow, upgrade to P20/P30)

---

## Scenario 3: Large VM still throttled
> 来源: onenote-vm-storage-performance-throttling.md | 适用: Mooncake \u2705

### 排查步骤
- Move workload to different server if even largest VM size throttles

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
