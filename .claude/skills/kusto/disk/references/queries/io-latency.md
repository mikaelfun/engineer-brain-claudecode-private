---
name: io-latency
description: IO 延迟分析查询
tables:
  - OsXIOSurfaceLatencyHistogramTableV2
parameters:
  - name: diskArmId
    required: true
    description: 磁盘 ARM 资源 ID
  - name: nodeId
    required: true
    description: 主机节点 ID
  - name: startTime
    required: true
    description: 开始时间
  - name: endTime
    required: true
    description: 结束时间
---

# IO 延迟分析查询

## 用途

分析磁盘 IO 延迟分布，识别高延迟 IO，区分读写延迟特征。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {diskArmId} | 是 | 磁盘 ARM 资源 ID | /subscriptions/.../disks/mydisk |
| {nodeId} | 是 | 主机节点 ID | guid |
| {startTime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endTime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |

## 查询语句

### 查询 1: 高延迟 IO 统计

```kql
let nodeId = "{nodeId}";
let startTime = datetime({startTime});
let endTime = datetime({endTime});
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceLatencyHistogramTableV2
| where PreciseTimeStamp between (startTime .. endTime)
| where NodeId == nodeId 
| where ArmId contains "{diskArmId}"
| parse BlobPath with 'XDISK:0.0.0.0:8080/' BlobName '?' *
| where HistogramTypeEnum in (1, 3)
| summarize hint.strategy=shuffle
    Bin_Count = sum(Bin_Count),
    Bin_210 = sum(Bin_210), Bin_211 = sum(Bin_211), Bin_212 = sum(Bin_212), Bin_213 = sum(Bin_213),
    Bin_214 = sum(Bin_214), Bin_215 = sum(Bin_215), Bin_216 = sum(Bin_216), Bin_217 = sum(Bin_217),
    Bin_206 = sum(Bin_206), Bin_207 = sum(Bin_207), Bin_208 = sum(Bin_208), Bin_209 = sum(Bin_209)
    by HistogramTypeEnum, BlobName
| summarize hint.strategy=shuffle
    Gt_50ms = sum(Bin_210) + sum(Bin_211) + sum(Bin_212) + sum(Bin_213) + sum(Bin_214) + sum(Bin_215) + sum(Bin_216) + sum(Bin_217),
    Gt_10ms = sum(Bin_206) + sum(Bin_207) + sum(Bin_208) + sum(Bin_209) + sum(Bin_210) + sum(Bin_211) + sum(Bin_212) + sum(Bin_213) + sum(Bin_214) + sum(Bin_215) + sum(Bin_216) + sum(Bin_217)
    by HistogramTypeEnum, BlobName
| extend HistogramType = case(HistogramTypeEnum == 1, "Read", HistogramTypeEnum == 3, "Write", "Other")
| project BlobName, HistogramType, Gt_10ms, Gt_50ms
```

### 查询 2: 延迟分位数趋势

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceLatencyHistogramTableV2
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| where HistogramTypeEnum in (1, 3)
| project PreciseTimeStamp, HistogramTypeEnum, Bin_Count, Bin_Q50, Bin_Q90, Bin_Q95, Bin_Q99, Bin_Q999, Bin_Q100
| extend HistogramType = case(HistogramTypeEnum == 1, "Read", HistogramTypeEnum == 3, "Write", "Other")
| order by PreciseTimeStamp asc
```

### 查询 3: 读写延迟对比

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceLatencyHistogramTableV2
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| where HistogramTypeEnum in (1, 3)
| summarize 
    AvgQ50 = avg(Bin_Q50),
    AvgQ90 = avg(Bin_Q90),
    AvgQ99 = avg(Bin_Q99),
    MaxQ99 = max(Bin_Q99),
    TotalIOCount = sum(Bin_Count)
    by HistogramTypeEnum
| extend HistogramType = case(HistogramTypeEnum == 1, "Read", HistogramTypeEnum == 3, "Write", "Other")
| project HistogramType, AvgQ50, AvgQ90, AvgQ99, MaxQ99, TotalIOCount
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| HistogramTypeEnum | 直方图类型 (1=读, 3=写) |
| Gt_10ms | 超过 10ms 的 IO 次数 |
| Gt_50ms | 超过 50ms 的 IO 次数 |
| Bin_Count | 总 IO 次数 |
| Bin_Q50 | P50 延迟桶索引 |
| Bin_Q90 | P90 延迟桶索引 |
| Bin_Q99 | P99 延迟桶索引 |

## HistogramTypeEnum 说明

| 值 | 说明 |
|----|------|
| 1 | 读 IO 延迟 |
| 3 | 写 IO 延迟 |

## 延迟桶索引说明

延迟桶使用对数刻度：
- Bin_206-209: 约 10ms 以上
- Bin_210-217: 约 50ms 以上
- Bin_218+: 极高延迟

## 关联查询

- [io-performance.md](./io-performance.md) - IO 性能分析
- [io-throttling.md](./io-throttling.md) - IO 限流检查
- [xdisk-counters.md](./xdisk-counters.md) - 网络层延迟分析
