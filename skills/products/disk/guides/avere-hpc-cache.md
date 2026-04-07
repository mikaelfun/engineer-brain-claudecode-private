# Disk Avere vFXT & HPC Cache — 排查速查

**来源数**: 9 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: avere-vfxt, backend, cache-full, cache-policy, core-filer, destroy-recreate, diagnostics, differential-diagnosis, hpc-cache, latency

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | High client-facing latency on Avere vFXT with RPC slot exhaustion; req.hunt and req.asyncappend stats incrementing signi | NFS RPC queue slots (default 256 per TCP connection) fully consumed due to delays between cluster no | Increase TCP connection multiplier (massX.nfsConnMult custom setting) from default 4 to 8 (max 23, typically ≤16); alter | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Avere vFXT high latency with recv.timerExpire counter incrementing (non-zero), often misdiagnosed as RPC slot exhaustion | Core filer not responding to NFS operations within NfsBackEndTimeout (55s+); this is NOT RPC slot ex | Collect packet capture between cluster and core filer for analysis; investigate core filer health and network path; do N | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Azure HPC Cache throughput cannot be changed after creation; customer needs more performance but cannot scale up or add  | HPC Cache throughput/SKU is fixed at creation and cannot be scaled up or out by adding nodes, unlike | Destroy and recreate the HPC Cache with a larger throughput configuration/SKU; plan capacity requirements before initial | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Write-heavy workload with ReadOnly cache policy causes NFS slot exhaustion, cache recycling, and high client-facing late | Cache policy set to ReadOnly while workload is write-heavy (>20% writes); write attempts cause permi | Change cache policy to ReadWrite or WriteBack to match the workload pattern; ReadOnly is designed for ~80% read / 20% wr | 🟢 8.0 | [ADO Wiki] |
| 5 📋 | Avere vFXT cache full with increased latency and 'recycling by space' visible on dashboard | Cache storage capacity exceeded, triggering cache eviction (recycling by space) which competes with  | Monitor cache fullness via dashboard; add vFXT nodes to expand capacity, or adjust caching policy to reduce cache footpr | 🟢 8.0 | [ADO Wiki] |
| 6 📋 | Long-running revocations and stuck NFS operations on Avere vFXT node; conditions remain active on dashboard | NFS operations stuck due to stale locks or revocations not clearing on a specific node | Restart services on the node that first raised the condition to release stuck ops; use 'averecmd support.executeNormalMo | 🟢 8.0 | [ADO Wiki] |
| 7 📋 | Swap pressure and performance degradation on Avere vFXT nodes with very long uptime | Very long node uptime leads to accumulated swap usage and memory fragmentation drift | Plan periodic node reboots as maintenance hygiene; use HA-mode reboot for minimal disruption or simultaneous reboot in m | 🟢 8.0 | [ADO Wiki] |
| 8 📋 | Azure HPC Cache queued requests, stuck operations, and latency spikes with all request slots consumed | Slot exhaustion — all NFS request slots fully consumed, causing operations to queue and back up | Align caching policy to workload, smooth client concurrency, cautiously increase slots only if backend and network can h | 🟢 8.0 | [ADO Wiki] |
| 9 📋 | Azure HPC Cache elevated frontend latency caused by slow backend storage target | Backend storage target (core filer) slowdowns propagate as elevated frontend (client-facing) latency | Compare frontend vs storage target latency on Virtual Dashboard; investigate backend storage health, network path, and c | 🟢 8.0 | [ADO Wiki] |

## 快速排查路径

1. High client-facing latency on Avere vFXT with RPC slot exhaustion; req.hunt and  → Increase TCP connection multiplier (massX `[来源: ado-wiki]`
2. Avere vFXT high latency with recv.timerExpire counter incrementing (non-zero), o → Collect packet capture between cluster and core filer for analysis; investigate core filer health an `[来源: ado-wiki]`
3. Azure HPC Cache throughput cannot be changed after creation; customer needs more → Destroy and recreate the HPC Cache with a larger throughput configuration/SKU; plan capacity require `[来源: ado-wiki]`
4. Write-heavy workload with ReadOnly cache policy causes NFS slot exhaustion, cach → Change cache policy to ReadWrite or WriteBack to match the workload pattern; ReadOnly is designed fo `[来源: ado-wiki]`
5. Avere vFXT cache full with increased latency and 'recycling by space' visible on → Monitor cache fullness via dashboard; add vFXT nodes to expand capacity, or adjust caching policy to `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/avere-hpc-cache.md#排查流程)
