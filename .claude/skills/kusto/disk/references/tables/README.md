# 表结构定义 (tables/)

本目录存放 Kusto 表结构定义文件，每个文件对应一个表。

## 表索引

### Disks 数据库 (Disk RP 日志)

| 表名 | 用途 | 文件 |
|------|------|------|
| DiskManagerApiQoSEvent | Disk RP API 调用 QoS 事件 | [DiskManagerApiQoSEvent.md](./DiskManagerApiQoSEvent.md) |
| DiskManagerContextActivityEvent | Disk 操作上下文活动 | [DiskManagerContextActivityEvent.md](./DiskManagerContextActivityEvent.md) |
| DiskRPResourceLifecycleEvent | 磁盘生命周期事件 | [DiskRPResourceLifecycleEvent.md](./DiskRPResourceLifecycleEvent.md) |
| Disk | 托管磁盘元数据快照 | [Disk.md](./Disk.md) |

### Fa 数据库 (IO 性能和诊断)

| 表名 | 用途 | 文件 |
|------|------|------|
| OsXIOSurfaceCounterTable | VM 磁盘 IO 性能计数器 | [OsXIOSurfaceCounterTable.md](./OsXIOSurfaceCounterTable.md) |
| OsXIOSurfaceLatencyHistogramTableV2 | 磁盘 IO 延迟分布直方图 | [OsXIOSurfaceLatencyHistogramTableV2.md](./OsXIOSurfaceLatencyHistogramTableV2.md) |
| OsXIOXdiskCounterTable | xStore 层 IO 指标 | [OsXIOXdiskCounterTable.md](./OsXIOXdiskCounterTable.md) |
| OsXIOThrottleCounterTable | IO 限流详细计数器 | [OsXIOThrottleCounterTable.md](./OsXIOThrottleCounterTable.md) |
| VhdDiskEtwEventTable | VHD 磁盘 ETW 事件 | [VhdDiskEtwEventTable.md](./VhdDiskEtwEventTable.md) |
| OsVhddiskEventTable | VHD 磁盘错误详情 | [OsVhddiskEventTable.md](./OsVhddiskEventTable.md) |
| OsConfigTable | RDOS 磁盘配置 | [OsConfigTable.md](./OsConfigTable.md) |

### AzureDcmDb 数据库 (硬件信息)

| 表名 | 用途 | 文件 |
|------|------|------|
| dcmInventoryComponentDiskDirect | 主机磁盘硬件库存 | [dcmInventoryComponentDiskDirect.md](./dcmInventoryComponentDiskDirect.md) |

---

## 文件命名规范

```
{TableName}.md
```

使用表的实际名称，如：
- `DiskManagerApiQoSEvent.md`
- `OsXIOSurfaceCounterTable.md`
- `Disk.md`

## 文件格式

每个表定义文件使用以下格式：

```markdown
---
name: TableName
database: DatabaseName
cluster: cluster_uri
description: 表描述
status: active|deprecated
---

# TableName

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://disksmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | Disks |
| 状态 | ✅ 可用 / ⚠️ 已弃用 |

## 用途

描述此表的主要用途和适用场景。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| subscriptionId | string | 订阅 ID | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx |

## 常用筛选字段

- `subscriptionId` - 按订阅筛选
- `resourceName` - 按资源名称筛选
- `PreciseTimeStamp` - 按时间筛选

## 典型应用场景

1. **场景 1**: 描述
2. **场景 2**: 描述

## 示例查询

\```kql
TableName
| where PreciseTimeStamp > ago(1d)
| where subscriptionId == "{subscription}"
| project PreciseTimeStamp, resourceName
| take 10
\```

## 关联表

- [RelatedTable.md](./RelatedTable.md) - 关联说明

## 注意事项

- 注意事项
```

## 字段类型

| 类型 | KQL 类型 | 说明 |
|------|----------|------|
| datetime | datetime | 日期时间 |
| string | string | 字符串 |
| int | int | 整数 |
| long | long | 长整数 |
| bool | bool | 布尔值 |
| dynamic | dynamic | JSON 对象 |
| guid | guid | GUID |
| real | real | 浮点数 |

## 状态标记

| 状态 | 标记 | 说明 |
|------|------|------|
| 可用 | ✅ | 表正常可用 |
| 已弃用 | ⚠️ | 表已弃用，不建议使用 |
| 实验性 | 🧪 | 实验性表，可能变更 |
