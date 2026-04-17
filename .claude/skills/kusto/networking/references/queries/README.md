# 查询模板 (queries/)

本目录存放 Networking 相关 KQL 查询模板文件，每个文件对应一个或一组相关查询。

## 查询索引

### VPN Gateway 查询

| 查询 | 用途 | 文件 |
|------|------|------|
| VPN 隧道查询 | VPN 隧道事件、断开原因分析 | [vpn-tunnel.md](./vpn-tunnel.md) |

### ExpressRoute 查询

| 查询 | 用途 | 文件 |
|------|------|------|
| ER Gateway 查询 | ExpressRoute Gateway 信息和容器 | [er-gateway.md](./er-gateway.md) |
| ER 线路查询 | ExpressRoute 线路和 MSEE 设备 | [er-circuit.md](./er-circuit.md) |

### 网络诊断查询

| 查询 | 用途 | 文件 |
|------|------|------|
| NMAgent 错误查询 | NMAgent 关键错误分析 | [nmagent.md](./nmagent.md) |
| 服务器 TOR 查询 | 服务器节点 TOR 交换机信息 | [server-tor.md](./server-tor.md) |

### Application Gateway 查询

| 查询 | 用途 | 文件 |
|------|------|------|
| App GW 查询 | Application Gateway 信息 | [appgw.md](./appgw.md) |

### ARG 资源查询

| 查询 | 用途 | 文件 |
|------|------|------|
| 公网 IP 查询 | 公网 IP 信息和监控链接 | [arg-publicip.md](./arg-publicip.md) |
| VNet/子网查询 | 虚拟网络和子网配置 | [arg-vnet-subnet.md](./arg-vnet-subnet.md) |

---

## 文件命名规范

```
{场景}-{操作}.md
```

示例：
- `vpn-tunnel.md` - VPN 隧道查询
- `er-gateway.md` - ExpressRoute Gateway 查询
- `nmagent.md` - NMAgent 错误查询

## 文件格式

每个查询模板文件使用以下格式：

```markdown
---
name: query-name
description: 查询描述
tables:
  - TableName1
  - TableName2
parameters:
  - name: gatewayId
    required: true
    description: VPN Gateway ID
  - name: startDate
    required: false
    default: ago(1d)
    description: 开始时间
---

# 查询标题

## 用途

描述此查询的用途和适用场景。

## 必要参数

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| {gatewayId} | 是 | Gateway 资源 ID | /subscriptions/.../vpnGateways/myGW |
| {startDate} | 否 | 开始时间 | ago(1d) |

## 查询语句

\```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP > ago(1d)
| where GatewayId == "{gatewayId}"
| project TIMESTAMP, TunnelName, Message
| sort by TIMESTAMP desc
\```

## 结果字段说明

| 字段 | 说明 |
|------|------|
| TIMESTAMP | 时间戳 |
| TunnelName | 隧道名称 |
| Message | 事件消息 |

## 变体查询

### 变体 1: 筛选断开事件

\```kql
// 筛选有状态变更的记录
| where TunnelStateChangeReason != ""
\```

## 关联查询

- [er-gateway.md](./er-gateway.md) - ExpressRoute Gateway 查询
```

## 参数占位符规范

使用 `{paramName}` 格式定义参数占位符：

| 占位符 | 说明 |
|--------|------|
| `{gatewayId}` | Gateway 资源 ID |
| `{tunnelName}` | 隧道名称 |
| `{subscription}` | 订阅 ID |
| `{serviceKey}` | ExpressRoute Service Key |
| `{nodeId}` | 节点 ID |
| `{vnetId}` | VNet ID / resourceGuid |
| `{starttime}` | 开始时间 |
| `{endtime}` | 结束时间 |
| `{ipAddress}` | IP 地址 |

## 时间参数格式

- **绝对时间**: `datetime(2025-01-01T00:00:00.000Z)`
- **相对时间**: `ago(1d)`, `ago(24h)`, `ago(30m)`
- **时间范围**: `between (datetime(...)..datetime(...))`
