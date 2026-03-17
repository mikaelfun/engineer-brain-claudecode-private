---
name: OsVhddiskEventTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: VHD 磁盘错误详情表，包含解析的错误码和客户端请求 ID
status: active
---

# OsVhddiskEventTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录 VHD 磁盘错误的详细信息，包括编码的错误码、HTTP 状态码、客户端请求 ID 等。用于深入分析 IO 错误的根因。

## 关键字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 | 2025-01-01T00:00:00Z |
| NodeId | string | 主机节点 ID | guid |
| DeviceId | string | 磁盘设备 ID | s:904DE6DC-... |
| Cluster | string | 集群名称 | 集群标识 |
| ProviderName | string | 提供者名称 | VhdDiskPrt |
| EventId | long | 事件 ID | 事件类型 |
| ParamStr1 | string | 参数字符串 1（包含 Blob 路径） | md-xxx/yyy/abcd |
| ParamBinary1 | string | 二进制参数（编码的错误信息） | 十六进制编码数据 |

## ParamBinary1 解析

`ParamBinary1` 字段包含编码的错误信息，需要解析：

| 解析字段 | 位置 | 说明 |
|----------|------|------|
| ErrorCode | 40-47 | 错误码（4 字节） |
| ClientRequestId | 80-95 | 客户端请求 ID（8 字节） |
| LastStatus | 144-151 | 最后状态码（4 字节） |
| RecvStatus | 184-191 | 接收状态码（4 字节） |
| HttpCode | 192-199 | HTTP 状态码（4 字节） |
| Retries | 200-201 | 重试次数（1 字节） |

## 常用筛选字段

- `NodeId` - 按节点 ID 筛选
- `ParamStr1` - 按 Blob 路径筛选

## 典型应用场景

1. **IO 错误根因分析**: 解析详细的错误码
2. **请求追踪**: 获取 ClientRequestId 用于存储层追踪
3. **HTTP 错误分析**: 检查 HTTP 状态码
4. **重试分析**: 分析重试次数和模式

## 示例查询

```kql
// 检查磁盘 IO 错误详情
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

```kql
// 统计错误类型
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').OsVhddiskEventTable
| where PreciseTimeStamp >= datetime({startTime}) and PreciseTimeStamp <= datetime({endTime})
| where NodeId == "{nodeId}"
| extend HttpCode = strcat(substring(ParamBinary1, 198, 2), substring(ParamBinary1, 196, 2), substring(ParamBinary1, 194, 2), substring(ParamBinary1, 192, 2))
| summarize count() by EventId, HttpCode
| order by count_ desc
```

## 关联表

- [VhdDiskEtwEventTable.md](./VhdDiskEtwEventTable.md) - VHD ETW 事件
- [OsXIOSurfaceCounterTable.md](./OsXIOSurfaceCounterTable.md) - IO 性能计数器

## 注意事项

- `ParamBinary1` 需要手动解析以提取错误信息
- 解析时使用小端字节序（低位在前）
- `ClientRequestId` 可用于追踪到 XStore 层
- 高频错误可能表示存储后端或网络问题
