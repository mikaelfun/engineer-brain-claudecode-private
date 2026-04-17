---
name: vpn-tunnel
description: VPN Gateway 隧道事件查询
tables:
  - TunnelEventsTable
parameters:
  - name: gatewayId
    required: true
    description: VPN Gateway 资源 ID
  - name: tunnelName
    required: false
    description: 隧道名称
---

# VPN 隧道查询

## 用途

查询 VPN Gateway 隧道的连接状态变化、断开原因、IKE 协商结果等事件。用于 VPN 连接故障排查。

---

## 查询 1: 按 Gateway ID 查询隧道事件

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {gatewayId} | 是 | VPN Gateway 资源 ID，从 Azure Portal 获取 |

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP > ago(1d)
| where GatewayId == "{gatewayId}"
| project TIMESTAMP, RoleInstance, TunnelName, Message, TunnelStateChangeReason, 
         IsPlannedFailover, NegotiatedSAs, GatewayBuildVersion, 
         ConnectionVirtuallyConnected, IsActiveActive, TunnelTypeDescription
| sort by TIMESTAMP desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| TIMESTAMP | 事件时间 |
| RoleInstance | 角色实例 |
| TunnelName | 隧道名称 |
| Message | 事件消息 |
| TunnelStateChangeReason | 状态变更原因（关键） |
| IsPlannedFailover | 是否计划内故障转移 |
| NegotiatedSAs | 协商的安全关联 |
| ConnectionVirtuallyConnected | 连接是否虚拟连接 |
| IsActiveActive | 是否主主模式 |

---

## 查询 2: 查询隧道断开事件

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP > ago(7d)
| where GatewayId == "{gatewayId}"
| where TunnelStateChangeReason != ""
| project TIMESTAMP, TunnelName, TunnelStateChangeReason, IsPlannedFailover, 
         Message, RoleInstance
| order by TIMESTAMP desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| TunnelStateChangeReason | 断开原因 |
| IsPlannedFailover | 如果为 true，则是计划内切换，无需担心 |

---

## 查询 3: 按隧道名称查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {tunnelName} | 是 | VPN 隧道名称 |

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP > ago(3d)
| where TunnelName contains "{tunnelName}"
| project TIMESTAMP, GatewayId, RoleInstance, TunnelName, Message, TunnelStateChangeReason,
         ConnectionVirtuallyConnected
| order by TIMESTAMP desc
```

---

## 查询 4: 统计隧道断开频率

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP > ago(7d)
| where GatewayId == "{gatewayId}"
| where TunnelStateChangeReason != ""
| summarize DisconnectCount = count() by TunnelName, TunnelStateChangeReason, bin(TIMESTAMP, 1h)
| order by TIMESTAMP desc
```

---

## 查询 5: 检查特定时间段的隧道状态

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |

### 查询语句

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP between (datetime({starttime}) .. datetime({endtime}))
| where GatewayId == "{gatewayId}"
| project TIMESTAMP, TunnelName, Message, TunnelStateChangeReason, 
         IsPlannedFailover, ConnectionVirtuallyConnected
| order by TIMESTAMP asc
```

---

## TunnelStateChangeReason 常见值

| 值 | 说明 | 建议操作 |
|-----|------|----------|
| `IKE_NEGOTIATION_FAILURE` | IKE 协商失败 | 检查 IKE 策略配置 |
| `PEER_NOT_RESPONDING` | 对端无响应 | 检查对端设备和网络连通性 |
| `DPD_TIMEOUT` | DPD (Dead Peer Detection) 超时 | 检查网络稳定性 |
| `POLICY_MISMATCH` | 策略不匹配 | 检查加密/认证参数 |
| `PLANNED_FAILOVER` | 计划内故障转移 | 正常行为，无需处理 |
| `GATEWAY_RESET` | 网关重置 | 检查是否有维护或重置操作 |

## 关联查询

- [er-gateway.md](./er-gateway.md) - ExpressRoute Gateway 查询
- [nmagent.md](./nmagent.md) - NMAgent 错误查询
