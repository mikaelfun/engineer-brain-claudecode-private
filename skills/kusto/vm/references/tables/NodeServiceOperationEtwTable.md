---
name: NodeServiceOperationEtwTable
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: 节点服务操作事件表，记录主机节点上的服务操作详情
status: active
---

# NodeServiceOperationEtwTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

节点服务操作事件表，记录主机节点上的服务操作（如 VM 启动、停止等）详情。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Region | string | 区域 |
| DataCenter | string | 数据中心 |
| Cluster | string | 集群 |
| NodeId | string | 节点 ID |
| DeviceId | string | 设备 ID |
| ActivityId | string | 活动 ID |
| OperationName | string | 操作名称 |
| Result | long | 结果 |
| ResultCode | long | 结果代码 |
| StatusText | string | 状态文本 |
| RequestTime | datetime | 请求时间 |
| SubmitTime | datetime | 提交时间 |
| CompleteTime | datetime | 完成时间 |
| ServiceVersion | string | 服务版本 |
| ProviderVersion | string | 提供程序版本 |
| DetailsJson | string | 详情 JSON |
| EventMessage | string | 事件消息 |

## 示例查询

```kql
cluster('azcore.chinanorth3.kusto.chinacloudapi.cn').database('Fa').NodeServiceOperationEtwTable
| where PreciseTimeStamp > ago(1d)
| where NodeId == '{nodeId}'
| project PreciseTimeStamp, OperationName, Result, ResultCode, StatusText, RequestTime, CompleteTime
| order by PreciseTimeStamp desc
```

## 关联表

- [WindowsEventTable.md](./WindowsEventTable.md) - Windows 事件日志
- [VmServiceContainerOperations.md](./VmServiceContainerOperations.md) - 容器操作
