---
name: disk
description: Azure Managed Disk Kusto 查询专家 - 诊断磁盘操作、IO 性能、限流和 XStore 存储问题。当用户需要排查磁盘创建/附加/删除失败、IO 性能下降、IOPS/带宽限流时触发此 skill。
author: fangkun
last_modified: 2026-01-14
---

# Azure Managed Disk Kusto 查询 Skill

## 概述

本 Skill 用于查询 Azure Managed Disk 相关的 Kusto 日志，诊断磁盘生命周期操作、IO 性能、限流和 XStore 存储后端问题。

## 触发关键词

- 磁盘、Disk、托管磁盘、Managed Disk
- 磁盘创建、磁盘附加、磁盘删除
- IO 性能、IOPS、MBPS、带宽
- IO 限流、Throttling
- IO 延迟、Latency
- XStore、存储账户、Storage Account
- Blob URL、VHD
- 磁盘超时、IO Timeout

## 集群信息

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| Disks MC | https://disksmc.chinaeast2.kusto.chinacloudapi.cn | Disks | Disk RP 日志、托管磁盘元数据和生命周期事件 |
| AzCore | https://azcore.chinanorth3.kusto.chinacloudapi.cn | Fa | VM IO 性能、磁盘延迟、限流分析 |
| DCM MC | https://azuredcmmc.kusto.chinacloudapi.cn | AzureDcmDb | 主机硬件磁盘库存和故障信息 |
| XStore | https://xstore.kusto.windows.net | xstore / xdataanalytics | 存储集群容量、账户属性、计费数据 (仅 Public) |
| XLivesite | https://xlivesite.kusto.windows.net | XHealthDiskTriage | 磁盘故障分析 (仅 Public) |

详细集群信息见: [kusto_clusters.csv](./references/kusto_clusters.csv)

## 主要表

### Disks 数据库 (Disk RP 日志)

| 表名 | 用途 | 文档 |
|------|------|------|
| DiskManagerApiQoSEvent | Disk RP API 调用 QoS 事件 | [📄](./references/tables/DiskManagerApiQoSEvent.md) |
| DiskManagerContextActivityEvent | Disk 操作上下文活动 | [📄](./references/tables/DiskManagerContextActivityEvent.md) |
| DiskRPResourceLifecycleEvent | 磁盘生命周期事件（创建/删除/附加） | [📄](./references/tables/DiskRPResourceLifecycleEvent.md) |
| Disk | 托管磁盘元数据快照 | [📄](./references/tables/Disk.md) |

### Fa 数据库 (IO 性能和诊断)

| 表名 | 用途 | 文档 |
|------|------|------|
| OsXIOSurfaceCounterTable | VM 磁盘 IO 性能计数器（IOPS/MBPS/QD） | [📄](./references/tables/OsXIOSurfaceCounterTable.md) |
| OsXIOSurfaceLatencyHistogramTableV2 | 磁盘 IO 延迟分布直方图 | [📄](./references/tables/OsXIOSurfaceLatencyHistogramTableV2.md) |
| OsXIOXdiskCounterTable | xStore 层 IO 指标（RDMA/STCP） | [📄](./references/tables/OsXIOXdiskCounterTable.md) |
| OsXIOThrottleCounterTable | IO 限流详细计数器 | [📄](./references/tables/OsXIOThrottleCounterTable.md) |
| VhdDiskEtwEventTable | VHD 磁盘 ETW 事件（IO 超时/错误） | [📄](./references/tables/VhdDiskEtwEventTable.md) |
| OsVhddiskEventTable | VHD 磁盘错误详情 | [📄](./references/tables/OsVhddiskEventTable.md) |
| OsConfigTable | RDOS 磁盘配置（Blob URL, IOPS Limit） | [📄](./references/tables/OsConfigTable.md) |

### AzureDcmDb 数据库 (硬件信息)

| 表名 | 用途 | 文档 |
|------|------|------|
| dcmInventoryComponentDiskDirect | 主机磁盘硬件库存（序列号/固件） | [📄](./references/tables/dcmInventoryComponentDiskDirect.md) |

详细表定义见: [tables/](./references/tables/)

## 工作流程

### 步骤 1: 确定问题类型

根据用户描述判断问题类型：
- **磁盘操作问题**: 创建、删除、附加、分离失败 → 查询 Disk RP 日志
- **IO 性能问题**: IOPS/MBPS 低、延迟高 → 查询 IO 性能表
- **IO 限流问题**: 达到磁盘限制 → 查询限流计数器
- **磁盘配置问题**: 查看磁盘属性和配置 → 查询磁盘元数据

### 步骤 2: 获取磁盘基础信息

首先获取磁盘的 Blob URL、存储账户、关联 VM：

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').Disk
| where SubscriptionId has '{subscription}'
| where TIMESTAMP > ago(1d)
| where DiskArmId has '{diskName}' or DisksName has '{diskName}'
| parse BlobUrl with * 'https://' storageaccount '/' *
| parse kind=regex OwnerReferenceKey with * 'VIRTUALMACHINES%2F' VMName '$'
| extend DiskSizeGB = DiskSizeBytes / 1024 / 1024 / 1024
| project DiskArmId, BlobUrl, storageaccount, AccountType, GeoLocation, OwnershipState, VMName, TimeCreated, DiskSizeGB, TotalOperationsPerSecond, TotalBytesPerSecond
| take 1
```

### 步骤 3: 根据问题类型查询

#### 3.1 磁盘操作失败

```kql
// 按 CorrelationId 查询 Disk API 调用
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskManagerApiQoSEvent 
| where subscriptionId == "{subscription}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where correlationId == "{correlationId}"
| project PreciseTimeStamp, operationName, resourceGroupName, resourceName, httpStatusCode, resultCode, errorDetails, durationInMilliseconds
| order by PreciseTimeStamp asc
```

#### 3.2 磁盘生命周期事件

```kql
cluster('https://disksmc.chinaeast2.kusto.chinacloudapi.cn').database('Disks').DiskRPResourceLifecycleEvent 
| where subscriptionId == "{subscription}"
| where resourceName has "{diskName}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| project PreciseTimeStamp, resourceGroupName, resourceName, diskEvent, stage, state, blobUrl, diskOwner, storageAccountType
| order by PreciseTimeStamp asc
```

#### 3.3 IO 性能分析

```kql
// 检查磁盘 IO 性能
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOSurfaceCounterTable  
| where ArmId contains "{diskArmId}"
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| project PreciseTimeStamp, CachePolicy, IOPS, MBPS, QD, TotalGBRead, TotalIOInGB, CacheSizeinGB, CacheUsagePct, ArmId, DeviceId, NodeId
| order by PreciseTimeStamp asc
```

#### 3.4 IO 限流检查

```kql
// 检查 IO 限流
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsXIOThrottleCounterTable   
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}" 
| where DeviceId contains "{deviceId}"
| project PreciseTimeStamp, ThrottleIndex, DeltaThrottledByByteBucketEmpty, DeltaThrottledByIopsBucketEmpty, DeltaThrottledByQDLimit, DeltaThrottledByQBLimit
| where DeltaThrottledByByteBucketEmpty != 0 or DeltaThrottledByIopsBucketEmpty != 0 or DeltaThrottledByQDLimit != 0 or DeltaThrottledByQBLimit != 0
```

## 常见诊断场景

### 场景 1: 磁盘创建/附加失败

1. 通过 CorrelationId 查询 `DiskManagerApiQoSEvent` 获取错误码
2. 查询 `DiskManagerContextActivityEvent` 获取详细日志
3. 查询 `DiskRPResourceLifecycleEvent` 检查生命周期状态

### 场景 2: IO 性能下降

1. 查询 `OsXIOSurfaceCounterTable` 检查 IOPS/MBPS 指标
2. 查询 `OsXIOThrottleCounterTable` 检查是否存在限流
3. 查询 `OsXIOSurfaceLatencyHistogramTableV2` 分析延迟分布
4. 如有高延迟，查询 `OsXIOXdiskCounterTable` 检查网络层指标

### 场景 3: IO 限流问题

1. 查询 `OsXIOThrottleCounterTable` 确认限流类型：
   - `DeltaThrottledByIopsBucketEmpty`: 达到 IOPS 限制
   - `DeltaThrottledByByteBucketEmpty`: 达到带宽限制
   - `DeltaThrottledByQDLimit`: 队列深度限制
2. 查询 `Disk` 表获取磁盘性能层级配置
3. 建议升级磁盘性能层级或调整工作负载

### 场景 4: 磁盘 IO 超时

1. 查询 `VhdDiskEtwEventTable` 获取 IO 超时事件 (EventId == 1)
2. 查询 `OsVhddiskEventTable` 获取错误详情
3. 分析 HttpCode、NTSTATUS 等错误码
4. 如涉及硬件问题，查询 DCM 库存信息

### 场景 5: 查找磁盘关联信息

1. 通过订阅和磁盘名称查询 `Disk` 表
2. 获取 BlobUrl、存储账户、关联 VM
3. 获取 NodeId、DeviceId 用于进一步诊断

### 场景 6: 主机硬件磁盘故障

1. 查询 `dcmInventoryComponentDiskDirect` 获取磁盘硬件信息
2. 关联 WindowsStorageEvents 分析磁盘错误事件
3. 检查磁盘序列号、固件版本等

## 限流类型说明

| 限流类型 | 说明 |
|---------|------|
| `DeltaThrottledByIopsBucketEmpty` | 达到 IOPS 限制，磁盘 IOPS 配额用尽 |
| `DeltaThrottledByByteBucketEmpty` | 达到带宽限制，磁盘吞吐量配额用尽 |
| `DeltaThrottledByQDLimit` | 队列深度限制，通常与延迟增加相关 |
| `DeltaThrottledByQBLimit` | 队列字节限制 |

## 常用参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `{subscription}` | Azure 订阅 ID | `e1ad39d8-7bca-4084-ba1c-ef0425755818` |
| `{diskName}` | 磁盘名称 | `mydisk` |
| `{diskArmId}` | 磁盘 ARM 资源 ID | `/subscriptions/.../disks/mydisk` |
| `{nodeId}` | 计算节点 ID | `b37b844d-1732-429b-84a1-8f467c92817e` |
| `{deviceId}` | 磁盘设备 ID | `s:904DE6DC-0278-4991-A6B9-6AECD0FEE886` |
| `{correlationId}` | 操作关联 ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `{startTime}` | 开始时间 | `2025-01-01T00:00:00Z` |
| `{endTime}` | 结束时间 | `2025-01-02T00:00:00Z` |

## 预定义查询

详细查询模板见: [queries/](./references/queries/)

| 查询 | 用途 |
|------|------|
| [disk-metadata.md](./references/queries/disk-metadata.md) | 磁盘元数据和配置查询 |
| [disk-lifecycle.md](./references/queries/disk-lifecycle.md) | 磁盘生命周期事件 |
| [disk-api-qos.md](./references/queries/disk-api-qos.md) | Disk RP API 调用追踪 |
| [io-performance.md](./references/queries/io-performance.md) | IO 性能分析 |
| [io-throttling.md](./references/queries/io-throttling.md) | IO 限流检查 |
| [io-latency.md](./references/queries/io-latency.md) | IO 延迟分析 |
| [io-errors.md](./references/queries/io-errors.md) | IO 错误详情 |
| [xdisk-counters.md](./references/queries/xdisk-counters.md) | xStore 层 IO 指标 |
| [rdos-disk-config.md](./references/queries/rdos-disk-config.md) | RDOS 磁盘配置 |
| [dcm-disk-inventory.md](./references/queries/dcm-disk-inventory.md) | 主机硬件磁盘库存 |

## 参考链接

- [HostAnalyzer Counters](https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/158391/HostAnalyzer-Counters)
- [Azure Managed Disk 性能层级](https://docs.azure.cn/zh-cn/virtual-machines/disks-performance-tiers)
- [Azure 存储可伸缩性目标](https://docs.azure.cn/zh-cn/storage/common/scalability-targets-standard-account)
- [父 Skill](../SKILL.md)

---

**文档版本**: 1.0  
**最后更新**: 2026-01-14
