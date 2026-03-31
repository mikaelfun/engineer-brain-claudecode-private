---
name: VhdDiskEtwEventTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: VHD 磁盘 ETW 事件，记录 IO 超时和错误事件
status: active
---

# VhdDiskEtwEventTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录 VHD 磁盘的 ETW (Event Tracing for Windows) 事件，包括 IO 超时、错误和警告。用于诊断磁盘 IO 失败和超时问题。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| NodeId | string | 主机节点 ID | guid |
| DeviceId | string | 磁盘设备 ID | s:904DE6DC-... |
| Cluster | string | 集群名称 | 集群标识 |
| Level | long | 事件级别 | 1=Critical, 2=Error, 3=Warning, 4=Info |
| ProviderName | string | 提供者名称 | VhdDiskPrt |
| EventId | long | 事件 ID | 1=IO 超时 |
| OpcodeName | string | 操作码名称 | 操作类型 |
| KeywordName | string | 关键字名称 | 关键字 |
| TaskName | string | 任务名称 | 任务类型 |
| ChannelName | string | 通道名称 | 日志通道 |
| EventMessage | string | 事件消息 | 详细事件描述 |
| Message | string | 消息内容 | 包含 Blob 路径、状态码等 |
| ActivityId | string | 活动 ID | guid |

## 常见 EventId

| EventId | 说明 |
|---------|------|
| 1 | IO 超时 |
| 其他 | 各类 IO 错误和警告 |

## 常用筛选字段

- `NodeId` - 按节点 ID 筛选
- `EventId` - 按事件 ID 筛选（1 表示 IO 超时）
- `Level` - 按事件级别筛选

## 典型应用场景

1. **IO 超时诊断**: 查找 IO 超时事件
2. **错误分析**: 分析 IO 错误的原因和模式
3. **Blob 路径定位**: 通过事件消息定位问题磁盘

## 示例查询

```kql
// 检查磁盘 IO 事件 (包括超时)
let nodeId = "{nodeId}";
let startTime = datetime({startTime});
let endTime = datetime({endTime});
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VhdDiskEtwEventTable
| where PreciseTimeStamp between (startTime .. endTime) and NodeId == nodeId
// | where EventId == 1  // 1 表示 IO 超时
| parse EventMessage with * 'RequestOpcode:' RequestOpcode '.' *
| parse EventMessage with * 'TransportType:' TransportType '.' *
| parse EventMessage with * 'NTSTATUS:' NTSTATUS '.' *
| parse EventMessage with * 'blobpath: ' Blobpath '.' *
| parse EventMessage with * 'HttpResponseStatusCode:' HttpResponseStatusCode '.' *
| parse EventMessage with * 'SubStatusErrorCode:' SubStatusErrorCode '.' *
| summarize count() by Cluster, Blobpath, TransportType, RequestOpcode, NTSTATUS, HttpResponseStatusCode, SubStatusErrorCode
```

```kql
// 查看 IO 超时事件详情
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VhdDiskEtwEventTable
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}"
| where EventId == 1  // IO 超时
| project PreciseTimeStamp, Level, ProviderName, EventId, TaskName, EventMessage
| order by PreciseTimeStamp asc
```

## 关联表

- [OsVhddiskEventTable.md](./OsVhddiskEventTable.md) - VHD 磁盘错误详情
- [OsXIOSurfaceCounterTable.md](./OsXIOSurfaceCounterTable.md) - IO 性能计数器
- [OsXIOXdiskCounterTable.md](./OsXIOXdiskCounterTable.md) - xStore 层指标

## 注意事项

- EventId 1 表示 IO 超时，是最常见的问题
- 解析 EventMessage 可获取 Blob 路径、NTSTATUS、HTTP 状态码等
- 结合 OsVhddiskEventTable 获取更详细的错误信息
- 高频 IO 超时可能表示存储后端问题
