---
name: NodeCapabilitiesEvent
database: aznwmds
cluster: https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn
description: 节点 VM 能力信息，记录节点支持的 VM 功能和能力
status: active
---

# NodeCapabilitiesEvent

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 |

## 用途

记录节点支持的 VM 能力和功能信息，包括加速网络、SGX 等特性。用于节点能力分析和问题排查。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| StartTimeStamp | datetime | 开始时间 |
| EndTimeStamp | datetime | 结束时间 |
| Cluster | string | 集群名称 |
| NodeId | string | 节点 ID |
| NodeIP | string | 节点 IP |
| NmAgentBuildInfo | string | NMAgent 构建信息 |
| VmCapability | string | VM 能力（关键字段） |
| ContainerId | string | 容器 ID |
| Count | long | 计数 |

## 常用筛选字段

- `NodeId` - 按节点 ID 筛选
- `VmCapability` - 按 VM 能力筛选
- `Cluster` - 按集群筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **节点能力查询** - 查询节点支持的 VM 功能
2. **能力分布分析** - 分析集群中不同能力的节点分布
3. **问题排查** - 确认节点是否支持特定功能

## 示例查询

### 按节点 ID 查询能力
```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').NodeCapabilitiesEvent
| where TIMESTAMP > ago(1d)
| where NodeId =~ "{nodeId}"
| project TIMESTAMP, NodeId, NodeIP, VmCapability, ContainerId
| order by TIMESTAMP desc
```

### 按 VM 能力筛选节点
```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').NodeCapabilitiesEvent
| where TIMESTAMP > ago(1d)
| where VmCapability contains "AcceleratedNetworking"
| distinct NodeId, VmCapability
```

### 统计集群中的能力分布
```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').NodeCapabilitiesEvent
| where TIMESTAMP > ago(1d)
| summarize NodeCount = dcount(NodeId) by VmCapability
| order by NodeCount desc
```

## 关联表

- [Servers.md](./Servers.md) - 服务器节点信息
- [NMAgentCriticalErrorFifteenMinuteTable.md](./NMAgentCriticalErrorFifteenMinuteTable.md) - NMAgent 错误

## 注意事项

- VmCapability 字段包含节点支持的具体能力名称
- 此表是聚合表，Count 字段表示记录计数
- 结合 NodeId 可以关联其他网络表进行分析
