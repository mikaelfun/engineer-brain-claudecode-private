---
name: DiagActivity
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: AVD 诊断活动日志，记录用户连接和 Feed 活动
status: active
---

# DiagActivity

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录 AVD 用户的诊断活动信息，是 AVD 诊断的主要入口表。包含连接活动、Feed 刷新等用户操作记录。常与 DiagError 表通过 ActivityId 关联进行错误分析。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| env_time | datetime | 环境时间（推荐用于筛选） |
| ActivityId | string | 活动 ID |
| Id | string | 诊断 ID（与 DiagError.ActivityId 关联） |
| Type | string | 活动类型 (Connection, Feed, Management) |
| StartDate | datetime | 活动开始时间 |
| EndDate | datetime | 活动结束时间 |
| UserName | string | 用户 UPN |
| Outcome | string | 结果 (Success, Failure) |
| Status | string | 状态 |
| SessionHostName | string | Session Host 名称 |
| SessionHostPoolName | string | 主机池名称 |
| SessionHostPoolId | string | 主机池 ID |
| SessionHostSessionId | string | 会话 ID |
| ClientOS | string | 客户端操作系统 |
| ClientVersion | string | 客户端版本 |
| ClientType | string | 客户端类型 |
| ClientIPAddress | string | 客户端 IP |
| AadTenantId | string | AAD 租户 ID |
| ArmPathHostPoolName | string | ARM 路径中的主机池名 |
| ArmPathSubscriptionId | string | ARM 订阅 ID |
| ArmPathResourceGroupName | string | ARM 资源组 |
| UdpUse | string | UDP 使用状态 |
| GatewayRegion | string | 网关区域 |

## 常用筛选字段

- `UserName` - 按用户 UPN 筛选
- `SessionHostName` - 按 Session Host 筛选
- `SessionHostPoolName` - 按主机池筛选
- `Type` - 按活动类型筛选 (Connection, Feed)
- `Outcome` - 按结果筛选 (Success, Failure)
- `env_time` - 按时间筛选（推荐）

## 典型应用场景

1. **用户活动查询** - 查看用户的连接历史和 Feed 刷新
2. **连接失败分析** - 关联 DiagError 分析失败原因
3. **负载均衡分析** - 分析连接分配到各 Session Host 的情况
4. **客户端统计** - 统计客户端类型和版本分布

## 示例查询

### 查询用户活动

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where UserName contains "{UPN}"
| where env_time >= ago(8h)
| project env_time, Id, ActivityId, Type, Outcome, Status, 
          SessionHostName, SessionHostPoolName, ClientIPAddress, ClientOS
| order by env_time desc
```

### 查询连接失败（关联 DiagError）

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where UserName contains "{UPN}"
| join (
    cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagError 
) on $left.Id == $right.ActivityId
| where env_time >= ago(1d)
| project env_time, UserName, Id, Type, Outcome, 
          ErrorSource, ErrorCode, ErrorCodeSymbolic, ErrorMessage,
          SessionHostName, SessionHostPoolName
| order by env_time desc
```

### 按 Session Host 查询连接

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where SessionHostName has "{SessionHostName}"
| where env_time >= datetime({starttime}) and env_time < datetime({endtime})
| where Type == "Connection"
| project env_time, UserName, Outcome, ClientOS, ClientIPAddress, SessionHostSessionId
| order by env_time desc
```

### 负载均衡分析

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where Type == "Connection"
| where SessionHostPoolId == "{HostPoolId}"
| where StartDate between (datetime({starttime}) .. datetime({endtime}))
| summarize ConnectionCount = count() by SessionHostName
| order by ConnectionCount desc
```

## 关联表

- [DiagError.md](./DiagError.md) - 通过 Id = ActivityId 关联
- [RDInfraTrace.md](./RDInfraTrace.md) - 通过 ActivityId 关联
- [RDClientTrace.md](./RDClientTrace.md) - 通过 ActivityId 关联
- [HostPool.md](./HostPool.md) - 通过 SessionHostPoolId = Id 关联

## 注意事项

- 推荐查询模式：使用 `macro-expand isfuzzy=true AVD_MC as T ( T.DiagActivity | <query> )` 进行跨表查询
- 与 DiagError 关联时使用 `DiagActivity.Id = DiagError.ActivityId`
- Type 字段主要值：Connection（连接）、Feed（资源刷新）、Management（管理操作）
