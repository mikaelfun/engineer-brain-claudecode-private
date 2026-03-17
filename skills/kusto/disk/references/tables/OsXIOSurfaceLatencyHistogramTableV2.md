---
name: OsXIOSurfaceLatencyHistogramTableV2
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: 磁盘 IO 延迟分布直方图，用于分析延迟模式和识别高延迟 IO
status: active
---

# OsXIOSurfaceLatencyHistogramTableV2

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录磁盘 IO 延迟的分布直方图，每个 Bin 代表一个延迟范围。用于分析 IO 延迟模式、识别高延迟请求和诊断性能问题。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| NodeId | string | 主机节点 ID | guid |
| DeviceId | string | 磁盘设备 ID | s:904DE6DC-... |
| ArmId | string | 磁盘 ARM 资源 ID | /subscriptions/.../disks/mydisk |
| BlobPath | string | Blob 路径 | XDISK:0.0.0.0:8080/... |
| StorageTenant | string | 存储租户 | md-xxx |
| HistogramTypeEnum | long | 直方图类型 | 1=读, 3=写 |
| CachePolicy | long | 缓存策略 | 0, 1, 2 |
| Bin_01 ~ Bin_256 | long | 延迟桶计数 | 各延迟范围的 IO 次数 |
| Bin_Count | long | 总 IO 次数 | 10000 |
| Bin_Q50 | long | P50 延迟桶索引 | 50% 分位数 |
| Bin_Q90 | long | P90 延迟桶索引 | 90% 分位数 |
| Bin_Q95 | long | P95 延迟桶索引 | 95% 分位数 |
| Bin_Q99 | long | P99 延迟桶索引 | 99% 分位数 |
| Bin_Q999 | long | P99.9 延迟桶索引 | 99.9% 分位数 |
| Bin_Q9999 | long | P99.99 延迟桶索引 | 99.99% 分位数 |
| Bin_Q100 | long | P100 (最大) 延迟桶索引 | 最大延迟 |

## HistogramTypeEnum 类型说明

| 值 | 说明 |
|----|------|
| 1 | 读 IO 延迟 |
| 3 | 写 IO 延迟 |

## 延迟桶索引说明

延迟桶使用对数刻度，主要关注的桶索引：

| 桶索引范围 | 大致延迟范围 |
|-----------|-------------|
| Bin_206-209 | ~10ms 以上 |
| Bin_210-217 | ~50ms 以上 |
| Bin_218+ | 极高延迟 |

## 常用筛选字段

- `ArmId` - 按磁盘 ARM ID 筛选
- `NodeId` - 按节点 ID 筛选
- `HistogramTypeEnum` - 按读/写类型筛选

## 典型应用场景

1. **延迟分布分析**: 分析 IO 延迟的统计分布
2. **高延迟检测**: 识别超过 10ms 或 50ms 的高延迟 IO
3. **读写延迟对比**: 分别分析读和写的延迟特征
4. **性能基线**: 建立正常延迟基线用于异常检测

## 示例查询

```kql
// 检查磁盘 IO 延迟分布
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
| project BlobName, HistogramTypeEnum, Gt_10ms, Gt_50ms
```

```kql
// 查看延迟分位数
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceLatencyHistogramTableV2
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where ArmId contains "{diskArmId}"
| project PreciseTimeStamp, HistogramTypeEnum, Bin_Count, Bin_Q50, Bin_Q90, Bin_Q95, Bin_Q99, Bin_Q999, Bin_Q100
| order by PreciseTimeStamp asc
```

## 关联表

- [OsXIOSurfaceCounterTable.md](./OsXIOSurfaceCounterTable.md) - IO 性能计数器
- [OsXIOXdiskCounterTable.md](./OsXIOXdiskCounterTable.md) - xStore 层延迟指标
- [VhdDiskEtwEventTable.md](./VhdDiskEtwEventTable.md) - VHD 错误事件

## 注意事项

- 使用 `HistogramTypeEnum` 区分读 (1) 和写 (3) 延迟
- 高延迟桶 (Bin_206+) 中的 IO 数量较多表示性能问题
- 结合 `OsXIOXdiskCounterTable` 分析网络层延迟
- 延迟问题可能由限流、存储后端或网络问题导致
