---
name: io-errors
description: IO 错误详情查询
tables:
  - VhdDiskEtwEventTable
  - OsVhddiskEventTable
parameters:
  - name: nodeId
    required: true
    description: 主机节点 ID
  - name: startTime
    required: true
    description: 开始时间
  - name: endTime
    required: true
    description: 结束时间
  - name: diskBlobPath
    required: false
    description: 磁盘 Blob 路径
---

# IO 错误详情查询

## 用途

查询磁盘 IO 错误和超时事件，分析错误原因和模式。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {nodeId} | 是 | 主机节点 ID | guid |
| {startTime} | 是 | 开始时间 | 2025-01-01T00:00:00Z |
| {endTime} | 是 | 结束时间 | 2025-01-02T00:00:00Z |
| {diskBlobPath} | 否 | 磁盘 Blob 路径 | md-xxx/yyy/abcd |

## 查询语句

### 查询 1: 检查磁盘 IO 事件

```kql
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

### 查询 2: IO 超时事件详情

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VhdDiskEtwEventTable
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}"
| where EventId == 1  // IO 超时
| project PreciseTimeStamp, Level, ProviderName, EventId, TaskName, EventMessage
| order by PreciseTimeStamp asc
```

### 查询 3: 详细错误信息解析

```kql
let nodeId = "{nodeId}";
let startTime = datetime({startTime});
let endTime = datetime({endTime});
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsVhddiskEventTable
| where PreciseTimeStamp between (startTime .. endTime)
| where NodeId == nodeId
| where ParamStr1 contains "{diskBlobPath}"
| extend ErrorCode = strcat(substring(ParamBinary1, 46, 2), substring(ParamBinary1, 44, 2), substring(ParamBinary1, 42, 2), substring(ParamBinary1, 40, 2)),
    ClientRequestId = strcat(substring(ParamBinary1, 94, 2), substring(ParamBinary1, 92, 2), substring(ParamBinary1, 90, 2), substring(ParamBinary1, 88, 2), substring(ParamBinary1, 86, 2), substring(ParamBinary1, 84, 2), substring(ParamBinary1, 82, 2), substring(ParamBinary1, 80, 2)),
    LastStatus = strcat(substring(ParamBinary1, 150, 2), substring(ParamBinary1, 148, 2), substring(ParamBinary1, 146, 2), substring(ParamBinary1, 144, 2)),
    RecvStatus = strcat(substring(ParamBinary1, 190, 2), substring(ParamBinary1, 188, 2), substring(ParamBinary1, 186, 2), substring(ParamBinary1, 184, 2)),
    HttpCode = strcat(substring(ParamBinary1, 198, 2), substring(ParamBinary1, 196, 2), substring(ParamBinary1, 194, 2), substring(ParamBinary1, 192, 2)),
    Retries = substring(ParamBinary1, 200, 2)
| project PreciseTimeStamp, EventId, ParamStr1, LastStatus, ErrorCode, RecvStatus, HttpCode, ClientRequestId, Retries
| order by PreciseTimeStamp asc
```

### 查询 4: 错误类型统计

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').VhdDiskEtwEventTable
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}"
| summarize count() by EventId, Level
| extend LevelName = case(Level == 1, "Critical", Level == 2, "Error", Level == 3, "Warning", Level == 4, "Info", "Unknown")
| order by count_ desc
```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| EventId | 事件 ID (1=IO 超时) |
| NTSTATUS | NT 状态码 |
| HttpResponseStatusCode | HTTP 响应状态码 |
| SubStatusErrorCode | 子状态错误码 |
| ErrorCode | 解析的错误码 |
| ClientRequestId | 客户端请求 ID (可追踪到 XStore) |
| Retries | 重试次数 |

## 常见 EventId

| EventId | 说明 |
|---------|------|
| 1 | IO 超时 |

## 关联查询

- [io-performance.md](./io-performance.md) - IO 性能分析
- [xdisk-counters.md](./xdisk-counters.md) - xStore 层指标
