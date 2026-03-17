---
name: TunnelEventsTable
database: aznwmds
cluster: https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn
description: VPN Gateway 隧道事件，记录 VPN 隧道连接状态变化和事件
status: active
---

# TunnelEventsTable

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn |
| 数据库 | aznwmds |
| 状态 | ✅ 可用 |

## 用途

记录 VPN Gateway 隧道的连接状态变化、断开原因、IKE 协商结果等关键事件。是 VPN 连接故障排查的核心表。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 事件时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| GatewayId | string | VPN Gateway 资源 ID |
| TunnelName | string | 隧道名称 |
| TunnelId | string | 隧道 ID |
| Message | string | 事件消息 |
| TunnelStateChangeReason | string | 隧道状态变更原因（关键字段） |
| IsPlannedFailover | bool | 是否为计划内故障转移 |
| ConnectionVirtuallyConnected | bool | 连接是否虚拟连接 |
| IsActiveActive | bool | 是否为主主模式 |
| RoleInstance | string | 角色实例 |
| GatewayVip | string | Gateway VIP 地址 |
| CustomerSubscriptionId | string | 客户订阅 ID |
| VirtualNetworkId | string | 虚拟网络 ID |
| NegotiatedSAs | string | 协商的安全关联 |
| LastConnectErrorReason | string | 最后连接错误原因 |
| GatewayBuildVersion | string | Gateway 构建版本 |
| TunnelTypeDescription | string | 隧道类型描述 |
| TunnelProtocol | string | 隧道协议 |
| IkeImplementationType | string | IKE 实现类型 |
| IsPrimary | bool | 是否为主实例 |
| CorrelationRequestId | string | 关联请求 ID |

## 常用筛选字段

- `GatewayId` - 按 Gateway ID 筛选
- `TunnelName` - 按隧道名称筛选
- `CustomerSubscriptionId` - 按订阅筛选
- `TunnelStateChangeReason` - 筛选有状态变更的记录
- `TIMESTAMP` - 按时间筛选

## 典型应用场景

1. **VPN 隧道断开排查** - 查询 TunnelStateChangeReason 了解断开原因
2. **连接状态监控** - 检查 ConnectionVirtuallyConnected 状态
3. **故障转移分析** - 通过 IsPlannedFailover 判断是否计划内切换
4. **IKE 协商问题** - 查看 NegotiatedSAs 和 IkeImplementationType

## 示例查询

### 按 Gateway ID 查询隧道事件
```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP > ago(1d)
| where GatewayId == "{gatewayId}"
| project TIMESTAMP, RoleInstance, TunnelName, Message, TunnelStateChangeReason, 
         IsPlannedFailover, NegotiatedSAs, GatewayBuildVersion, 
         ConnectionVirtuallyConnected, IsActiveActive, TunnelTypeDescription
| sort by TIMESTAMP desc
```

### 查询隧道断开事件
```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP > ago(7d)
| where GatewayId == "{gatewayId}"
| where TunnelStateChangeReason != ""
| project TIMESTAMP, TunnelName, TunnelStateChangeReason, IsPlannedFailover, 
         Message, RoleInstance
| order by TIMESTAMP desc
```

### 查询特定隧道
```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP > ago(3d)
| where TunnelName contains "{tunnelName}"
| project TIMESTAMP, RoleInstance, TunnelName, Message, TunnelStateChangeReason,
         ConnectionVirtuallyConnected
| order by TIMESTAMP desc
```

## 关联表

- [GatewayTenantHealth.md](./GatewayTenantHealth.md) - 网关健康状态
- [CircuitTable.md](./CircuitTable.md) - ExpressRoute 线路信息

## TunnelStateChangeReason 常见值

| 值 | 说明 |
|-----|------|
| `IKE_NEGOTIATION_FAILURE` | IKE 协商失败 |
| `PEER_NOT_RESPONDING` | 对端无响应 |
| `DPD_TIMEOUT` | DPD 超时 |
| `POLICY_MISMATCH` | 策略不匹配 |
| `PLANNED_FAILOVER` | 计划内故障转移 |
| `GATEWAY_RESET` | 网关重置 |

## 注意事项

- `TunnelStateChangeReason` 为空时表示隧道状态正常，无变更
- 结合 `IsPlannedFailover` 判断断开是否为预期行为
- 查询时建议限制时间范围以提高性能
