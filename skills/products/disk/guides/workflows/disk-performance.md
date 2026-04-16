# Disk Performance & Throttling — 排查工作流

**来源草稿**: mslearn-disk-benchmarking-guide.md, mslearn-disk-performance-metrics-reference.md, onenote-storage-latency-troubleshooting.md
**Kusto 引用**: io-errors.md, io-latency.md, io-performance.md, io-throttling.md, xdisk-counters.md
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: 磁盘性能瓶颈定位
> 来源: mslearn-disk-performance-metrics-reference.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **检查 VM 级别限制** — `VM Uncached IOPS Consumed %`
   - 100% → VM 是瓶颈 → 升级 VM 大小

2. **检查单磁盘限制** — `Data Disk IOPS Consumed %` (按 LUN 拆分)
   - 识别哪个磁盘被限流

3. **检查 OS 磁盘** — `OS Disk IOPS Consumed %` (常被忽视的瓶颈)

4. **检查突发信用** — burst credit 持续耗尽意味着负载超过基线
   - 升级磁盘 Tier
   - 启用 on-demand bursting (Premium SSD > 512 GiB)
   - 添加更多磁盘 + 条带化

### 关键指标

| 指标 | 含义 | 100% 表示 |
|------|------|-----------|
| Data Disk IOPS Consumed % | 磁盘级 IOPS | 磁盘 IOPS 瓶颈 |
| Data Disk Bandwidth Consumed % | 磁盘级吞吐量 | 磁盘吞吐量瓶颈 |
| VM Cached IOPS Consumed % | VM 缓存 IOPS | VM 缓存限制瓶颈 |
| VM Uncached IOPS Consumed % | VM 非缓存 IOPS | VM 非缓存限制瓶颈 |

---

## Scenario 2: Kusto IO 性能分析
> 来源: io-performance.md, io-throttling.md | 适用: Mooncake ✅

### 排查步骤

1. **查询基本 IO 性能指标**
   ```kql
   cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable
   | where ArmId contains "{diskArmId}"
   | project PreciseTimeStamp, IOPS, ReadIOPS, WriteIOPS, MBPS, QD, CacheUsagePct
   ```

2. **获取 NodeId 和 DeviceId**（供限流查询使用）
   ```kql
   OsXIOSurfaceCounterTable | where ArmId contains "{diskArmId}"
   | summarize arg_max(PreciseTimeStamp, *) by ArmId
   | project ArmId, NodeId, DeviceId, Cluster
   ```

3. **检查限流**
   ```kql
   cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOThrottleCounterTable
   | where NodeId == "{nodeId}" and DeviceId contains "{deviceId}"
   | where DeltaThrottledByByteBucketEmpty != 0 or DeltaThrottledByIopsBucketEmpty != 0
   ```

4. **限流类型判断**

   | 限流类型 | 说明 | 建议 |
   |---------|------|------|
   | IOPS 限流 | 达到 IOPS 上限 | 升级磁盘或减少 IO 频率 |
   | 带宽限流 | 达到吞吐量上限 | 升级磁盘或减少大 IO |
   | QD 限流 | 队列深度达上限 | 通常与延迟增加相关 |

5. **检查突发令牌使用**
   ```kql
   | where BurstTokensUsedIO > 0 or BurstTokensUsedByte > 0
   ```

---

## Scenario 3: IO 延迟分析
> 来源: io-latency.md, xdisk-counters.md | 适用: Mooncake ✅

### 排查步骤

1. **查询高延迟 IO 统计**
   ```kql
   cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceLatencyHistogramTableV2
   | where ArmId contains "{diskArmId}" and HistogramTypeEnum in (1, 3)
   | summarize Gt_50ms = sum(Bin_210)+..., Gt_10ms = sum(Bin_206)+...
   ```
   - HistogramTypeEnum 1 = 读, 3 = 写

2. **查看 xStore 网络层延迟**
   ```kql
   OsXIOXdiskCounterTable | where ArmId contains "{diskArmId}"
   | project PreciseTimeStamp, AvgRxLatInms, AvgTxLatInms,
     AvgRdmaRxLatInms, AvgStcpRxLatInms
   ```

3. **RDMA vs STCP 对比** — RDMA 延迟应显著低于 STCP

---

## Scenario 4: 磁盘基准测试
> 来源: mslearn-disk-benchmarking-guide.md | 适用: Mooncake ✅ / Global ✅

### DiskSpd (Windows)

**Max Write IOPS:**
```
diskspd -c200G -w100 -b8K -F4 -r -o128 -W30 -d30 -Sh testfile.dat
```

**Max Read IOPS:**
```
diskspd -c200G -b4K -F4 -r -o128 -W7200 -d30 -Sh testfile.dat
```
⚠️ ReadOnly 缓存需先预热（2小时）

### FIO (Linux)

**Max Write IOPS:**
```ini
[global]
size=30g
direct=1
iodepth=256
ioengine=libaio
bs=4k
numjobs=4

[writer1]
rw=randwrite
directory=/mnt/nocache
```

### 关键原则
- 始终使用 `direct=1` (FIO) 或 `-Sh` (DiskSpd) 绕过 OS 缓存
- 结果受 VM 大小限制（缓存/非缓存 IOPS 上限）

---

## Scenario 5: 存储账户延迟排查
> 来源: onenote-storage-latency-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **理解应用行为** — 超时机制、SDK 版本、读写模式
2. **区分 E2E 延迟 vs Server 延迟**
   - 高 E2E + 低 Server → 网络问题
   - 高 Server → 后端调查
3. **检查存储账户指标** — Shoebox API Dashboard, Account SLA Metrics
4. **调查单个高延迟请求** — 需要 server request ID
5. **分析后端日志** — xPortal auto-analysis
   - 常见根因: Partition merge (TotalPartitionWaitTimeInMs 高), Stamp 限流, Disk IO 争用
6. **建议**: 应用端指数退避重试, 启用诊断日志, 瞬态问题观察 2-3 天