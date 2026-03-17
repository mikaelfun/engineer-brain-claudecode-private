---
name: avd
description: AVD Kusto 查询专家 - 诊断 Azure Virtual Desktop 连接失败、会话断开、主机健康等问题。当用户需要排查 AVD/WVD 问题时触发此 skill。
author: fangkun
last_modified: 2026-01-14
---

# AVD Kusto 查询 Skill

## 概述

本 Skill 用于查询 Azure Virtual Desktop (AVD) 相关的 Kusto 日志，诊断连接失败、会话断开、Session Host 健康、MSIX App Attach 等问题。

## 触发关键词

- AVD、Azure Virtual Desktop、WVD
- 会话主机、Session Host、Host Pool
- 连接失败、Connection Failed
- RDAgent、RDInfra、RDGateway
- 心跳、Heartbeat
- FSLogix、MSIX App Attach
- 远程桌面、Remote Desktop

## 集群信息

| 集群名称 | URI | 数据库 | 用途 |
|----------|-----|--------|------|
| RDSKMC | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn | WVD | AVD 主要诊断数据 |

> **注意**: Azure Global 环境使用不同的集群:
> - `rdsprodus.eastus2.kusto.windows.net`
> - `rdsprod.eastus2.kusto.windows.net`
> - `rdsprodeu.westeurope.kusto.windows.net`

详细集群信息见: [kusto_clusters.csv](./references/kusto_clusters.csv)

## 主要表

### WVD 数据库核心表

| 表名 | 用途 | 文档 |
|------|------|------|
| RDInfraTrace | AVD 基础设施跟踪日志 (Agent, Broker, Gateway) | [📄](./references/tables/RDInfraTrace.md) |
| RDClientTrace | 客户端跟踪日志 | [📄](./references/tables/RDClientTrace.md) |
| DiagActivity | 诊断活动日志 (连接、Feed) | [📄](./references/tables/DiagActivity.md) |
| DiagError | 诊断错误日志 | [📄](./references/tables/DiagError.md) |
| RDOperation | 健康检查和操作结果 | [📄](./references/tables/RDOperation.md) |
| RDPCoreTSEventLog | RDSH 主机 RDP 核心事件 | [📄](./references/tables/RDPCoreTSEventLog.md) |
| RDAgentMetadata | VM 和 Agent 元数据 | [📄](./references/tables/RDAgentMetadata.md) |
| ShoeboxAgentHealth | Agent 健康状态 (ARM 诊断) | [📄](./references/tables/ShoeboxAgentHealth.md) |
| HostPool | 主机池配置信息 | [📄](./references/tables/HostPool.md) |
| AppGroup | 应用组信息 | [📄](./references/tables/AppGroup.md) |
| RDTenant | 租户信息 | [📄](./references/tables/RDTenant.md) |

详细表定义见: [tables/](./references/tables/)

## 工作流程

### 步骤 1: 确定诊断入口

根据用户提供的信息选择入口：

| 提供信息 | 入口查询 | 说明 |
|----------|----------|------|
| UPN (用户) | DiagActivity | 查询用户活动历史和错误 |
| ActivityId | RDInfraTrace | 追踪特定连接的完整链路 |
| SessionHostName | RDOperation / RDInfraTrace | 检查主机健康和日志 |
| HostPoolName | HostPool / DiagActivity | 查询主机池级别信息 |

### 步骤 2: 用户活动分析 (Layer 1)

首先获取用户的活动记录：

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where UserName contains "{UPN}"
| where env_time >= ago(8h)
| project env_time, Id, ActivityId, Type, Outcome, Status, 
          SessionHostName, SessionHostPoolName, ClientIPAddress, ClientOS
| order by env_time desc
```

如有失败，关联查询错误详情：

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where UserName contains "{UPN}"
| where env_time >= ago(8h)
| join (
    cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagError 
) on $left.Id == $right.ActivityId
| project env_time, UserName, Id, Type, Outcome, 
          ErrorSource, ErrorCode, ErrorCodeSymbolic, ErrorMessage,
          SessionHostName, SessionHostPoolName
| order by env_time desc
```

### 步骤 3: 连接链路追踪 (Layer 2)

使用 ActivityId 追踪连接的完整链路：

```kql
// 基础设施日志
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == "{ActivityId}"
| where PreciseTimeStamp > ago(2d)
| project PreciseTimeStamp, Level, Category, Role, HostInstance, HostPool, Msg
| order by PreciseTimeStamp asc

// 客户端日志
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDClientTrace
| where ActivityId == "{ActivityId}"
| where TIMESTAMP > ago(3d)
| project TIMESTAMP, TaskName, ChannelName, ClientOS, ClientType, Msg
| order by TIMESTAMP asc
```

### 步骤 4: 主机健康检查 (Layer 3)

检查 Session Host 的健康状态：

```kql
// 健康检查结果
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| where Name endswith "Check"
| project TIMESTAMP, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc

// 心跳检测
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance has "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Category contains "Heartbeat" or Msg contains "Heartbeat"
| project PreciseTimeStamp, Level, Category, Role, Msg
| order by PreciseTimeStamp desc
```

## 常见诊断场景

### 场景 1: 连接失败

1. 使用 DiagActivity + DiagError 按 UPN 查找失败记录
2. 获取 ActivityId 后，查询 RDInfraTrace 获取详细日志
3. 分析 ErrorCodeSymbolic 确定失败原因

| ErrorCodeSymbolic | 含义 | 下一步 |
|-------------------|------|--------|
| ConnectionFailedNoHealthyHost | 无可用主机 | 检查主机池容量和主机健康 |
| ConnectionFailedClientDisconnect | 客户端断开 | 检查客户端网络/配置 |
| ConnectionFailedServerDisconnect | 服务端断开 | 检查主机状态和日志 |
| ConnectionFailedUserAuthentication | 认证失败 | 检查 AAD/条件访问 |
| ConnectionFailedReverseConnect | 反向连接失败 | 检查网络/防火墙配置 |

### 场景 2: Session Host 不可用

1. 使用 RDOperation 检查健康检查状态
2. 查询 ShoeboxAgentHealth 确认 URL 访问
3. 使用 RDInfraTrace 检查心跳状态
4. 查询 RDAgentMetadata 确认 VM 信息

常见健康检查项：
- `SxSStackListenerCheck` - SxS Stack 监听器
- `DomainReachableHealthCheck` - 域可达性
- `DomainJoinedCheck` - 域加入状态
- `FSLogixHealthCheck` - FSLogix 健康
- `SessionHostCanAccessUrlsCheck` - URL 访问
- `RDAgentCanReachRDGatewayURL` - 网关可达性
- `RdInfraAgentConnectToRdBroker` - Broker 连接

### 场景 3: 心跳失败

1. 检查 RDInfraTrace 中的心跳日志
2. 确认 Agent 版本和状态
3. 检查网络连通性

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance has "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Category contains "Heartbeat"
| where Level <= 3  // 仅错误和警告
| project PreciseTimeStamp, Level, Category, Role, Msg
```

### 场景 4: MSIX App Attach 问题

1. 查询 RDOperation 中的 MSIX 相关操作
2. 检查 Staging 和 Registration 状态

### 场景 5: 负载均衡分析

1. 查询 DiagActivity 分析连接分配
2. 检查 HostPool 配置（LoadBalancerType, MaxSessions）

## 预定义查询

详细查询模板见: [queries/](./references/queries/)

| 查询 | 用途 |
|------|------|
| [user-activity.md](./references/queries/user-activity.md) | 用户活动和错误查询 |
| [connection-tracking.md](./references/queries/connection-tracking.md) | 连接链路追踪 |
| [health-check.md](./references/queries/health-check.md) | 健康检查状态 |
| [heartbeat.md](./references/queries/heartbeat.md) | 心跳检测 |
| [session-host.md](./references/queries/session-host.md) | Session Host 信息 |
| [hostpool-info.md](./references/queries/hostpool-info.md) | 主机池配置 |
| [msix-appattach.md](./references/queries/msix-appattach.md) | MSIX App Attach |
| [url-access-check.md](./references/queries/url-access-check.md) | URL 访问检查 |
| [gateway-broker.md](./references/queries/gateway-broker.md) | Gateway/Broker 信息 |
| [rdp-core-events.md](./references/queries/rdp-core-events.md) | RDP 核心事件 |

## 参考链接

- [Azure Virtual Desktop 文档](https://docs.microsoft.com/zh-cn/azure/virtual-desktop/)
- [AVD 故障排查指南](https://docs.microsoft.com/zh-cn/azure/virtual-desktop/troubleshoot-set-up-overview)
- [父 Skill](../SKILL.md)

---

*最后更新: 2026-01*
