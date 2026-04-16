# Disk IaaS Disk Failure (Event 17) — 排查工作流

**来源草稿**: 无
**Kusto 引用**: io-errors.md, xdisk-counters.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: IO 错误事件分析
> 来源: io-errors.md | 适用: Mooncake ✅

### 排查步骤

1. **获取节点信息** — 从 VM 的 NodeId 和问题时间段开始

2. **查询磁盘 IO 事件**
   ```kql
   cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VhdDiskEtwEventTable
   | where PreciseTimeStamp between (startTime .. endTime) and NodeId == nodeId
   | parse EventMessage with * 'RequestOpcode:' RequestOpcode '.' *
   | parse EventMessage with * 'NTSTATUS:' NTSTATUS '.' *
   | parse EventMessage with * 'HttpResponseStatusCode:' HttpResponseStatusCode '.' *
   | summarize count() by Cluster, Blobpath, TransportType, RequestOpcode, NTSTATUS, HttpResponseStatusCode
   ```

3. **检查 IO 超时事件 (EventId == 1)**
   ```kql
   cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VhdDiskEtwEventTable
   | where NodeId == "{nodeId}" and EventId == 1
   | project PreciseTimeStamp, Level, EventId, EventMessage
   ```

4. **解析详细错误信息** — 使用 `OsVhddiskEventTable` 解析 ErrorCode, ClientRequestId, HttpCode, Retries

5. **统计错误类型分布**
   - Level 1 = Critical, Level 2 = Error, Level 3 = Warning, Level 4 = Info

### 关键字段
- EventId 1 = IO 超时
- ClientRequestId 可追踪到 XStore 层
- Retries 反映重试次数

---

## Scenario 2: xStore 层 IO 指标分析
> 来源: xdisk-counters.md | 适用: Mooncake ✅

### 排查步骤

1. **查询完整 xStore IO 指标**
   ```kql
   cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOXdiskCounterTable
   | where ArmId contains "{diskArmId}"
   | where PreciseTimeStamp between (startTime .. endTime)
   | project PreciseTimeStamp, ArmId, XIOPS, XReadIOPS, XWriteIOPS,
       RdmaIOPS, StcpIOPS, AvgRxLatInms, AvgTxLatInms
   ```

2. **对比 RDMA vs STCP 性能**
   - RDMA: Remote Direct Memory Access，低延迟高性能
   - STCP: Storage TCP，基于 TCP 的存储协议
   - 正常情况 RDMA 延迟应低于 STCP

3. **检查错误和重试统计**
   ```kql
   | summarize TotalFailReqCnt = max(TotXFailReqCnt),
       Total500Cnt = max(Tot500Cnt), Total503Cnt = max(Tot503Cnt),
       TotalRecvTimeout = max(TotRecvTimeoutCnt)
   ```

---

## Scenario 3: Event 17 Triage 决策树
> 来源: io-errors.md, xdisk-counters.md | 适用: Mooncake ✅

### 决策树
```
Event 17 / Disk Failure
├── 查询 VhdDiskEtwEventTable → 有 EventId=1 (IO 超时)?
│   ├── Yes → 检查 NTSTATUS 和 HttpResponseStatusCode
│   │   ├── 500/503 → xStore 后端问题 → 检查 xdisk-counters 确认
│   │   ├── 超时无 HTTP 错误 → 网络层问题 → 检查 RDMA/STCP 延迟
│   │   └── 特定 BlobPath 错误 → 单磁盘问题 → 检查磁盘健康
│   └── No → 检查其他 EventId 和 Level
├── 查询 OsXIOXdiskCounterTable → 延迟异常?
│   ├── AvgRxLatInms > 50ms → 后端延迟问题
│   └── TotalFailReqCnt 增长 → 持续性错误 → 需 PG 调查
└── 确认影响范围 → 单 VM 还是多 VM → ICM 升级
```