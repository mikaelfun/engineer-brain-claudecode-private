---
name: RDPCoreTSEventLog
database: WVD
cluster: https://rdskmc.chinaeast2.kusto.chinacloudapi.cn
description: RDSH 主机 RDP 核心事件日志
status: active
---

# RDPCoreTSEventLog

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn |
| 数据库 | WVD |
| 状态 | ✅ 可用 |

## 用途

记录 Session Host (VM) 端的 RDP 核心终端服务事件日志。包含 RDP 协议层面的详细事件。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| TIMESTAMP | datetime | 时间戳 |
| PreciseTimeStamp | datetime | 精确时间戳 |
| Env | string | 环境 |
| Region | string | 区域 |
| RDTenant | string | RD 租户 |
| HostPool | string | 主机池 |
| HostInstance | string | Session Host FQDN |
| Level | long | 日志级别 |
| ProviderGuid | string | 事件提供程序 GUID |
| ProviderName | string | 事件提供程序名称 |
| EventId | long | 事件 ID |
| TaskName | string | 任务名称 |
| ChannelName | string | 通道名称 |
| ActivityId | string | 活动 ID |
| Message | string | 事件消息 |
| OpcodeName | string | 操作码名称 |
| KeywordName | string | 关键字名称 |

## 常用筛选字段

- `ActivityId` - 按活动 ID 筛选（关联连接）
- `HostInstance` - 按 Session Host 筛选
- `Level` - 按日志级别筛选
- `EventId` - 按事件 ID 筛选
- `ProviderName` - 按提供程序筛选

## 典型应用场景

1. **RDP 协议问题诊断** - 分析 RDP 协议层面的错误
2. **Session Host 事件分析** - 查看主机端的详细事件
3. **连接追踪** - 结合 ActivityId 追踪主机端日志

## 示例查询

### 按 ActivityId 查询

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where ActivityId == "{ActivityId}"
| where TIMESTAMP >= ago(9d)
| project TIMESTAMP, Level, TaskName, Message, ProviderName
| order by TIMESTAMP asc
```

### 按 Session Host 查询错误

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where TIMESTAMP > ago(3h)
| where HostInstance contains "{SessionHostName}"
| where Level <= 3  // Error, Warning, Critical
| project TIMESTAMP, ActivityId, Level, ProviderName, Message, HostPool
| order by TIMESTAMP desc
```

## 关联表

- [RDInfraTrace.md](./RDInfraTrace.md) - 通过 ActivityId 关联
- [DiagActivity.md](./DiagActivity.md) - 通过 ActivityId 关联

## 注意事项

- 推荐查询模式：使用 `macro-expand isfuzzy=true AVD_MC as T ( T.RDPCoreTSEventLog | <query> )` 进行跨表查询
- 此表记录的是 Session Host VM 内部的 Windows 事件日志
