---
name: VmServiceContainerOperations
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: VM 服务容器操作表，记录容器级别的操作详情
status: active
---

# VmServiceContainerOperations

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录 VM 容器级别的操作详情，包括操作类型、阶段、结果代码等。用于分析容器操作失败原因。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| StartTime | datetime | 开始时间 |
| EndTime | datetime | 结束时间 |
| DurationMillis | long | 持续时间 (毫秒) |
| Cluster | string | 集群名称 |
| NodeId | string | 节点 ID |
| ContainerId | string | 容器 ID |
| Level | string | 日志级别 |
| Operation | string | 操作类型 |
| Stage | string | 操作阶段 |
| ResultCode | string | 结果代码 |

## 示例查询

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
cluster("azcore.chinanorth3.kusto.chinacloudapi.cn").database("Fa").VmServiceContainerOperations
| where PreciseTimeStamp between (queryFrom .. queryTo)  
| where NodeId == "{nodeId}"
| where ContainerId == "{containerId}"
| extend Content = ResultCode
| extend Health = iff(ResultCode !in ("0x0", "0x1"), "Unhealthy", "Healthy")
| project StartTime, EndTime, DurationMillis, Cluster, Level, Operation, Stage, ResultCode, 
         ContainerId, NodeId, Content, Health
```

## 关联表

- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 获取 ContainerId/NodeId
- [VmHealthRawStateEtwTable.md](./VmHealthRawStateEtwTable.md) - VM 健康状态
