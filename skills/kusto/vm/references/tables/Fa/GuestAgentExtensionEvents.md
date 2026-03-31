---
name: GuestAgentExtensionEvents
database: Fa
cluster: https://azcore.chinanorth3.kusto.chinacloudapi.cn
description: Guest Agent 扩展事件表，记录扩展操作和状态
status: active
---

# GuestAgentExtensionEvents

## 基本信息

| 属性 | 值 |
|------|-----|
| 集群 | https://azcore.chinanorth3.kusto.chinacloudapi.cn |
| 数据库 | Fa |
| 状态 | ✅ 可用 |

## 用途

记录 Guest Agent 扩展的操作事件，包括安装、更新、心跳等。用于排查扩展问题。

## 关键字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| PreciseTimeStamp | datetime | 精确时间戳 |
| ContainerId | string | 容器 ID |
| Level | string | 日志级别 |
| GAVersion | string | Guest Agent 版本 |
| Version | string | 扩展版本 |
| Operation | string | 操作类型 |
| Message | string | 消息内容 |
| Duration | long | 持续时间 |

## 示例查询

```kql
cluster('https://azcore.chinanorth3.kusto.chinacloudapi.cn').database('fa').GuestAgentExtensionEvents
| where PreciseTimeStamp > ago(3d)
| where ContainerId == "{containerId}"
| where Operation !in ('HeartBeat', 'HttpErrors')
| where isnotempty(Message)
| project PreciseTimeStamp, ContainerId, Level, GAVersion, Version, Operation, Message, Duration
```

## 关联表

- [LogContainerSnapshot.md](./LogContainerSnapshot.md) - 获取 ContainerId
- [VmHealthRawStateEtwTable.md](./VmHealthRawStateEtwTable.md) - VM 健康状态
