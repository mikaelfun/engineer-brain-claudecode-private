---
name: NMAgentCriticalErrorFifteenMinuteTable
database: aznwmds
cluster: https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn
description: NMAgent 关键错误日志，记录网络管理代理的错误信息
status: active
---

# NMAgentCriticalErrorFifteenMinuteTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 |

## 用途

记录 NMAgent (Network Management Agent) 的关键错误信息，每 15 分钟聚合一次。用于排查 VM 网络配置问题、VNet 编程失败等。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| StartTimeStamp | datetime | 聚合开始时间 |
| EndTimeStamp | datetime | 聚合结束时间 |
| FirstTimeStamp | datetime | 首次出现时间 |
| LastTimeStamp | datetime | 最后出现时间 |
| Cluster | string | 集群名称 |
| NodeId | string | 节点 ID |
| NodeIP | string | 节点 IP 地址 |
| NmAgentBuildInfo | string | NMAgent 构建信息 |
| Message | string | 错误消息（关键字段） |
| Level | long | 日志级别 |
| ErrorId | string | 错误 ID |
| Count | long | 出现次数 |

## 常用筛选字段

- `NodeId` - 按节点 ID 筛选
- `Message` - 按错误消息内容筛选
- `Cluster` - 按集群筛选
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **VNet 编程失败排查** - 查询 GetAdjacencyTableV4 相关错误
2. **VM 网络配置问题** - 检查特定节点的 NMAgent 错误
3. **网络连接问题诊断** - 分析 NMAgent 报告的错误

## 示例查询

### 按 VNet ID 查询错误
```kql
cluster('https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database("aznwmds").NMAgentCriticalErrorFifteenMinuteTable
| where TIMESTAMP > ago(1d)
| where Message startswith "GetAdjacencyTableV4 ret val: "
| where Message has "{vnetId}"
| project TIMESTAMP, NodeId, Message
```

### 按节点 ID 查询错误
```kql
cluster('https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database("aznwmds").NMAgentCriticalErrorFifteenMinuteTable
| where TIMESTAMP > ago(1d)
| where NodeId =~ "{nodeId}"
| project TIMESTAMP, NodeId, NodeIP, Message, Count
| order by TIMESTAMP desc
```

### 按时间范围查询高频错误
```kql
cluster('https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database("aznwmds").NMAgentCriticalErrorFifteenMinuteTable
| where TIMESTAMP > ago(1d)
| summarize TotalCount = sum(Count), NodeCount = dcount(NodeId) by Message
| order by TotalCount desc
| take 20
```

### 查询特定集群的错误
```kql
cluster('https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database("aznwmds").NMAgentCriticalErrorFifteenMinuteTable
| where TIMESTAMP > ago(1d)
| where Cluster == "{clusterName}"
| summarize ErrorCount = sum(Count) by NodeId, Message
| order by ErrorCount desc
```

## 关联表

- [Servers.md](./Servers.md) - 服务器节点信息
- [DeviceInterfaceLinks.md](./DeviceInterfaceLinks.md) - 设备接口链接

## 常见错误消息模式

| 错误模式 | 说明 |
|----------|------|
| `GetAdjacencyTableV4 ret val: ...` | VNet 邻接表获取失败 |
| `Failed to program routes...` | 路由编程失败 |
| `Cannot reach wireserver...` | 无法访问 wireserver |
| `NMAgent health check failed...` | NMAgent 健康检查失败 |

## 注意事项

- 此表是 15 分钟聚合表，Count 字段表示该时间段内错误出现次数
- 结合 NodeId 可以关联到具体的物理节点
- 查询时注意 Message 字段可能包含敏感的 VNet/Subnet ID 信息
