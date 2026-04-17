---
name: networking
description: Networking Kusto 查询专家 - 诊断 VPN Gateway、ExpressRoute、Application Gateway、网络连接问题。当用户需要排查网络问题时触发此 skill。
author: fangkun
last_modified: 2026-01-14
---

# Networking Kusto 查询 Skill

## 概述

本 Skill 用于查询 Azure Networking 相关的 Kusto 日志，诊断 VPN Gateway、ExpressRoute、Application Gateway、网络连接等问题。

## 触发关键词

- VPN、VPN Gateway、隧道、Tunnel
- ExpressRoute、ER Gateway、ER 线路
- Application Gateway、App GW
- 网络、Networking、NMAgent
- 公网 IP、Public IP、VNet、子网

## 集群信息

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| Azure NW China MC | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn | aznwmds | 网络 MDS 日志 |
| Azure NW China MC | https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn | NetDefaultDB | 网络默认数据库 |
| ARG MC NRP | https://argmcn2nrpone.chinanorth2.kusto.chinacloudapi.cn | AzureResourceGraph | 资源图查询 |

详细集群信息见: [kusto_clusters.csv](./references/kusto_clusters.csv)

## 主要表

### aznwmds 数据库 (网络 MDS 日志)

| 表名 | 用途 | 文档 |
|------|------|------|
| TunnelEventsTable | VPN Gateway 隧道事件 | [📄](./references/tables/aznwmds/TunnelEventsTable.md) |
| GatewayTenantHealth | 网关租户健康状态 | [📄](./references/tables/aznwmds/GatewayTenantHealth.md) |
| CircuitTable | ExpressRoute 线路信息 | [📄](./references/tables/aznwmds/CircuitTable.md) |
| NMAgentCriticalErrorFifteenMinuteTable | NMAgent 关键错误 | [📄](./references/tables/aznwmds/NMAgentCriticalErrorFifteenMinuteTable.md) |
| ApplicationGatewaysExtendedLatestProd | Application Gateway 信息 | [📄](./references/tables/aznwmds/ApplicationGatewaysExtendedLatestProd.md) |
| Servers | 服务器节点信息 | [📄](./references/tables/aznwmds/Servers.md) |
| DeviceInterfaceLinks | 设备接口链接 | [📄](./references/tables/aznwmds/DeviceInterfaceLinks.md) |
| DeviceStatic | 设备静态信息 | [📄](./references/tables/aznwmds/DeviceStatic.md) |
| DeviceIpInterface | 设备 IP 接口 | [📄](./references/tables/aznwmds/DeviceIpInterface.md) |
| NodeCapabilitiesEvent | 节点 VM 能力信息 | [📄](./references/tables/aznwmds/NodeCapabilitiesEvent.md) |

> ⚠️ **注意**: `HolmesNodeMetadataEvent` 表（用于查询节点硬件代系信息）在当前 Mooncake 集群中不可用。

### AzureResourceGraph 数据库 (ARG 资源图)

| 表名 | 用途 | 文档 |
|------|------|------|
| Resources | Azure 资源图 | [📄](./references/tables/AzureResourceGraph/Resources_ARG.md) |

详细表定义见: [tables/](./references/tables/)

## 工作流程

### 步骤 1: 确定问题类型

根据问题类型选择相应的查询：

| 问题类型 | 主要表 | 查询模板 |
|----------|--------|----------|
| VPN 隧道断开 | TunnelEventsTable | [vpn-tunnel.md](./references/queries/vpn-tunnel.md) |
| ExpressRoute Gateway | GatewayTenantHealth | [er-gateway.md](./references/queries/er-gateway.md) |
| ExpressRoute 线路 | CircuitTable | [er-circuit.md](./references/queries/er-circuit.md) |
| NMAgent 错误 | NMAgentCriticalErrorFifteenMinuteTable | [nmagent.md](./references/queries/nmagent.md) |
| Application Gateway | ApplicationGatewaysExtendedLatestProd | [appgw.md](./references/queries/appgw.md) |
| 服务器 TOR 信息 | Servers, DeviceInterfaceLinks | [server-tor.md](./references/queries/server-tor.md) |
| 公网 IP 查询 | Resources (ARG) | [arg-publicip.md](./references/queries/arg-publicip.md) |
| VNet/子网查询 | Resources (ARG) | [arg-vnet-subnet.md](./references/queries/arg-vnet-subnet.md) |

### 步骤 2: 查询 VPN 隧道事件

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP > ago(1d)
| where GatewayId == "{gatewayId}"
| project TIMESTAMP, RoleInstance, TunnelName, Message, TunnelStateChangeReason, 
         IsPlannedFailover, NegotiatedSAs, ConnectionVirtuallyConnected
| sort by TIMESTAMP desc
```

### 步骤 3: 查询隧道断开原因

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').TunnelEventsTable
| where TIMESTAMP > ago(7d)
| where GatewayId == "{gatewayId}"
| where TunnelStateChangeReason != ""
| project TIMESTAMP, TunnelName, TunnelStateChangeReason, IsPlannedFailover, Message
| order by TIMESTAMP desc
```

### 步骤 4: 查询 NMAgent 错误

```kql
cluster('aznwchinamc.chinanorth2.kusto.chinacloudapi.cn').database('aznwmds').NMAgentCriticalErrorFifteenMinuteTable
| where TIMESTAMP > ago(1d)
| where NodeId =~ "{nodeId}"
| project TIMESTAMP, NodeId, Message
| order by TIMESTAMP desc
```

### 步骤 5: 查询 ExpressRoute Gateway

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
cluster('aznwchinamc.chinanorth2').database('aznwmds').GatewayTenantHealth
| where PreciseTimeStamp >= starttime - 1d and PreciseTimeStamp <= endtime
| where CustomerSubscriptionId == "{subscription}"
| where GatewayType == "Dedicated"
| distinct GatewayName, GatewayId, GatewayVmSize, VIPAddress, ProvisioningState, Region
```

## 常见诊断场景

### 场景 1: VPN 连接断开
1. 获取 Gateway ID (从 Azure Portal 或活动日志)
2. 查询 TunnelEventsTable 获取隧道事件
3. 检查 TunnelStateChangeReason 了解断开原因
4. 检查 IsPlannedFailover 判断是否计划内故障转移

### 场景 2: ExpressRoute Gateway 问题
1. 查询 GatewayTenantHealth 获取网关状态
2. 通过 DeploymentId 联合 LogContainerSnapshot 获取实例信息
3. 查询 CircuitTable 获取关联的 ER 线路信息

### 场景 3: ExpressRoute 线路问题
1. 获取 ER Service Key
2. 查询 CircuitTable 获取线路状态和 MSEE 设备
3. 关联 DeviceIpInterface 获取 MSEE IP 地址

### 场景 4: 网络连接问题
1. 获取 VNet ID 或节点 ID
2. 查询 NMAgentCriticalErrorFifteenMinuteTable 获取 NMAgent 错误
3. 分析错误消息了解网络配置问题

### 场景 5: Application Gateway 问题
1. 查询 ApplicationGatewaysExtendedLatestProd 获取 App GW 状态
2. 检查 State、Substate 和 InstanceCount

### 场景 6: 公网 IP / DDoS 分析
1. 使用 ARG Resources 表查询公网 IP 信息
2. 生成 DDoS 和 SLB 监控 Dashboard 链接

### 场景 7: 服务器网络拓扑分析
1. 从 LogContainerSnapshot 获取 NodeId
2. 关联 Servers、DeviceInterfaceLinks 获取 TOR 交换机信息
3. 使用 DeviceStatic 获取设备元数据

## 预定义查询

### VPN Gateway

| 查询 | 用途 |
|------|------|
| [vpn-tunnel.md](./references/queries/vpn-tunnel.md) | VPN 隧道事件、断开原因分析 |

### ExpressRoute

| 查询 | 用途 |
|------|------|
| [er-gateway.md](./references/queries/er-gateway.md) | ExpressRoute Gateway 信息和容器 |
| [er-circuit.md](./references/queries/er-circuit.md) | ExpressRoute 线路和 MSEE 设备 |

### 网络诊断

| 查询 | 用途 |
|------|------|
| [nmagent.md](./references/queries/nmagent.md) | NMAgent 关键错误分析 |
| [server-tor.md](./references/queries/server-tor.md) | 服务器节点 TOR 交换机信息 |

### Application Gateway

| 查询 | 用途 |
|------|------|
| [appgw.md](./references/queries/appgw.md) | Application Gateway 信息 |

### ARG 资源查询

| 查询 | 用途 |
|------|------|
| [arg-publicip.md](./references/queries/arg-publicip.md) | 公网 IP 信息和监控链接 |
| [arg-vnet-subnet.md](./references/queries/arg-vnet-subnet.md) | 虚拟网络和子网配置 |

## 常用参数说明

| 参数 | 说明 | 获取方式 |
|------|------|----------|
| GatewayId | VPN/ER Gateway 资源 ID | Azure Portal Gateway 属性 |
| TunnelName | VPN 隧道名称 | VPN 连接配置 |
| VNetId | 虚拟网络 ID (resourceGuid) | Azure Portal VNet 属性 |
| NodeId | 物理节点 ID | LogContainerSnapshot 表 |
| AzureServiceKey | ExpressRoute 线路 Service Key | Azure Portal ER Circuit 属性 |

## 参考链接

- [VPN Gateway 故障排查](https://learn.microsoft.com/azure/vpn-gateway/vpn-gateway-troubleshoot)
- [ExpressRoute 故障排查](https://learn.microsoft.com/azure/expressroute/expressroute-troubleshooting-network-performance)
- [Azure 网络问题排查](https://learn.microsoft.com/azure/networking/troubleshoot-failed-state)
- [VNet Dashboard (内部)](https://aka.ms/vnetdri)
- [NMAgent Jarvis Dashboard (内部)](https://portal.microsoftgeneva.com/dashboard/User%252Fqliu/VNETNMAGENT/NMAGENT)
- [父 Skill](../SKILL.md)
