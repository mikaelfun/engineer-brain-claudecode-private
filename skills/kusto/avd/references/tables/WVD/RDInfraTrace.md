---
name: RDInfraTrace
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: AVD 基础设施跟踪日志，包含 Agent、Broker、Gateway 组件日志
status: active
---

# RDInfraTrace

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录 AVD 基础设施服务的跟踪日志，包括 RDAgent、Broker、Gateway 等组件的详细日志信息。通过 ActivityId 字段可与其他表关联。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| ActivityId | string | 活动 ID（关联字段） |
| Level | long | 日志级别 (1=Critical, 2=Error, 3=Warning, 4=Info, 5=Verbose) |
| Category | string | 日志类别 |
| Role | string | 组件角色 (RDAgent, Broker, Gateway) |
| HostInstance | string | Session Host FQDN |
| HostPool | string | 主机池名称 |
| Msg | string | 日志消息内容 |
| Ex | string | 异常信息 |
| Env | string | 环境 |
| Ring | string | 部署环 |
| Region | string | 区域 |

## 常用筛选字段

- `ActivityId` - 按活动 ID 筛选（关联连接）
- `HostInstance` - 按 Session Host 筛选
- `HostPool` - 按主机池筛选
- `Level` - 按日志级别筛选
- `Category` - 按类别筛选

## 典型应用场景

1. **连接链路追踪** - 使用 ActivityId 追踪连接的完整日志
2. **心跳监控** - 检查 Agent 到 Broker 的心跳状态
3. **错误诊断** - 分析特定主机或主机池的错误日志
4. **组件问题定位** - 根据 Role 筛选特定组件日志

## 示例查询

### 按 ActivityId 查询连接日志

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == "{ActivityId}"
| where PreciseTimeStamp > ago(2d)
| project PreciseTimeStamp, Level, Category, Role, HostInstance, HostPool, Msg
| order by PreciseTimeStamp asc
```

### 按 Session Host 查询错误和警告

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance contains "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Level <= 3  // Error, Warning, Critical
| project PreciseTimeStamp, Level, Category, Role, Msg
| order by PreciseTimeStamp desc
```

### 检查心跳状态

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance has "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Category contains "Heartbeat" or Msg contains "Heartbeat"
| project PreciseTimeStamp, Level, Category, Role, Msg
| order by PreciseTimeStamp desc
```

### 按 Host Pool 查询

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostPool has "{HostPoolName}"
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime})
| project PreciseTimeStamp, Level, Category, Role, HostInstance, Msg
| order by PreciseTimeStamp asc
```

## 关联表

- [DiagActivity.md](./DiagActivity.md) - 通过 ActivityId 关联
- [RDClientTrace.md](./RDClientTrace.md) - 通过 ActivityId 关联
- [RDOperation.md](./RDOperation.md) - 通过 HostInstance 关联

## 注意事项

- 推荐查询模式：使用 `macro-expand isfuzzy=true AVD_MC as T ( T.RDInfraTrace | <query> )` 进行跨表查询
- Level 字段数值越小表示严重程度越高
- 心跳日志通常每 30 秒产生一条
