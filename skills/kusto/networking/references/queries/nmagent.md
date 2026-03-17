---
name: nmagent
description: NMAgent 关键错误查询
tables:
  - NMAgentCriticalErrorFifteenMinuteTable
parameters:
  - name: nodeId
    required: false
    description: 节点 ID
  - name: vnetId
    required: false
    description: VNet ID
---

# NMAgent 错误查询

## 用途

查询 NMAgent (Network Management Agent) 的关键错误信息，用于排查 VM 网络配置问题、VNet 编程失败等。

---

## 查询 1: 按 VNet ID 查询错误

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {vnetId} | 是 | VNet ID 或 resourceGuid |

### 查询语句

```kql
cluster('https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database("aznwmds").NMAgentCriticalErrorFifteenMinuteTable
| where TIMESTAMP > ago(1d)
| where Message startswith "GetAdjacencyTableV4 ret val: "
| where Message has "{vnetId}"
| project TIMESTAMP, NodeId, NodeIP, Message, Count
| order by TIMESTAMP desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| TIMESTAMP | 时间戳 |
| NodeId | 节点 ID |
| NodeIP | 节点 IP |
| Message | 错误消息 |
| Count | 出现次数 |

---

## 查询 2: 按节点 ID 查询错误

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {nodeId} | 是 | 物理节点 ID |

### 查询语句

```kql
cluster('https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database("aznwmds").NMAgentCriticalErrorFifteenMinuteTable
| where TIMESTAMP > ago(1d)
| where NodeId =~ "{nodeId}"
| project TIMESTAMP, NodeId, NodeIP, Message, Count, NmAgentBuildInfo
| order by TIMESTAMP desc
```

---

## 查询 3: 按时间范围查询高频错误

### 查询语句

```kql
cluster('https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database("aznwmds").NMAgentCriticalErrorFifteenMinuteTable
| where TIMESTAMP > ago(1d)
| summarize TotalCount = sum(Count), NodeCount = dcount(NodeId) by Message
| order by TotalCount desc
| take 20
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| Message | 错误消息 |
| TotalCount | 总出现次数 |
| NodeCount | 受影响节点数 |

---

## 查询 4: 查询特定集群的错误

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {clusterName} | 是 | 集群名称 |

### 查询语句

```kql
cluster('https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database("aznwmds").NMAgentCriticalErrorFifteenMinuteTable
| where TIMESTAMP > ago(1d)
| where Cluster == "{clusterName}"
| summarize ErrorCount = sum(Count) by NodeId, Message
| order by ErrorCount desc
```

---

## 查询 5: 按时间趋势分析错误

### 查询语句

```kql
cluster('https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database("aznwmds").NMAgentCriticalErrorFifteenMinuteTable
| where TIMESTAMP > ago(7d)
| where NodeId =~ "{nodeId}"
| summarize ErrorCount = sum(Count) by bin(TIMESTAMP, 1h)
| order by TIMESTAMP asc
| render timechart
```

---

## 常见错误消息模式

| 错误模式 | 说明 | 建议操作 |
|----------|------|----------|
| `GetAdjacencyTableV4 ret val: ...` | VNet 邻接表获取失败 | 检查 VNet 配置和网络策略 |
| `Failed to program routes...` | 路由编程失败 | 检查路由表配置 |
| `Cannot reach wireserver...` | 无法访问 wireserver | 检查 DHCP 和网络连通性 |
| `NMAgent health check failed...` | NMAgent 健康检查失败 | 检查 NMAgent 服务状态 |

## 关联查询

- [server-tor.md](./server-tor.md) - 服务器 TOR 查询
- [vpn-tunnel.md](./vpn-tunnel.md) - VPN 隧道查询
