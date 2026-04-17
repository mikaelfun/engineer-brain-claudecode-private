---
name: HostPool
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: AVD 主机池配置信息
status: active
---

# HostPool

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录 AVD 主机池的配置信息，包括负载均衡类型、最大会话数、位置等。Id 字段可与其他表的 HostPoolId 或 SessionHostPoolId 关联。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| env_time | datetime | 环境时间 |
| Name | string | 主机池名称 |
| Id | string | 主机池 ID（关联字段） |
| SHCount | long | Session Host 数量 |
| PoolType | string | 池类型 (Pooled, Personal) |
| PDAssignmentType | string | 个人桌面分配类型 |
| TenantId | string | 租户 ID |
| AADTenantId | string | AAD 租户 ID |
| SubscriptionId | string | 订阅 ID |
| ResourceGroup | string | 资源组 |
| LoadBalancerType | string | 负载均衡类型 (BreadthFirst, DepthFirst) |
| MaxSessions | long | 每主机最大会话数 |
| Location | string | 位置 |
| ArmPath | string | ARM 资源路径 |
| EnableStartVMOnConnect | bool | 是否启用连接时启动 VM |
| IsCPC | bool | 是否为 Cloud PC |
| RDPProperties | string | RDP 属性设置 |
| PublicNetworkAccess | string | 公共网络访问设置 |
| ManagementType | string | 管理类型 |

## 常用筛选字段

- `Name` - 按主机池名称筛选
- `Id` - 按主机池 ID 筛选
- `TenantId` - 按租户筛选
- `SubscriptionId` - 按订阅筛选

## 典型应用场景

1. **主机池配置查询** - 获取主机池的配置信息
2. **负载均衡分析** - 了解负载均衡设置
3. **容量规划** - 查看 Session Host 数量和最大会话数

## 示例查询

### 按租户 ID 获取主机池列表

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where TenantId == "{TenantId}"
| where env_time >= ago(2d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, PoolType, SHCount, LoadBalancerType, MaxSessions, Location
```

### 获取特定主机池配置

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where Name has "{HostPoolName}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, Id, PoolType, SHCount, LoadBalancerType, MaxSessions, 
          EnableStartVMOnConnect, PublicNetworkAccess, RDPProperties
```

### 按订阅获取主机池

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').HostPool
| where SubscriptionId == "{SubscriptionId}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by Id
| project Name, ResourceGroup, PoolType, SHCount, Location
```

## 关联表

- [DiagActivity.md](./DiagActivity.md) - 通过 Id = SessionHostPoolId 关联
- [AppGroup](../tables/) - 通过 Id = HostPoolId 关联
- [RDAgentMetadata.md](./RDAgentMetadata.md) - 通过 Id = HostPoolId 关联

## 注意事项

- 推荐查询模式：使用 `macro-expand isfuzzy=true AVD_MC as T ( T.HostPool | <query> )` 进行跨表查询
- 使用 `summarize arg_max()` 获取最新配置快照
- PoolType: "Pooled" 为共享池，"Personal" 为个人桌面
- LoadBalancerType: "BreadthFirst" 广度优先，"DepthFirst" 深度优先
