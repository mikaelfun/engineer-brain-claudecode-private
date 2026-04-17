---
name: rdp-core-events
description: RDP 核心终端服务事件查询
tables:
  - RDPCoreTSEventLog
parameters:
  - name: ActivityId
    required: false
    description: 连接活动 ID
  - name: SessionHostName
    required: false
    description: Session Host 名称
---

# RDP 核心事件查询

## 用途

查询 Session Host VM 端的 RDP 核心终端服务事件日志，诊断 RDP 协议层面的问题。

## 查询 1: 按 ActivityId 查询 RDP 事件

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {ActivityId} | 是 | 连接活动 ID |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where ActivityId == "{ActivityId}"
| where TIMESTAMP >= ago(9d)
| project TIMESTAMP, Level, TaskName, Message, ProviderName
| order by TIMESTAMP asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| Level | 日志级别 |
| TaskName | 任务名称 |
| Message | 事件消息 |
| ProviderName | 事件提供程序 |

---

## 查询 2: 按 Session Host 查询错误

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where TIMESTAMP > ago(3h)
| where HostInstance contains "{SessionHostName}"
| where Level <= 3  // Error, Warning, Critical
| project TIMESTAMP, ActivityId, Level, ProviderName, Message, HostPool
| order by TIMESTAMP desc
```

---

## 查询 3: RDP 连接建立过程

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where ActivityId == "{ActivityId}"
| where TIMESTAMP >= ago(9d)
| where Message contains "connection" or Message contains "session"
| project TIMESTAMP, Level, TaskName, ProviderName, Message
| order by TIMESTAMP asc
```

---

## 查询 4: 特定事件 ID 查询

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where TIMESTAMP > ago(1d)
| where HostInstance contains "{SessionHostName}"
| where EventId in (1149, 4624, 4625, 21, 22, 23, 24, 25)
| project TIMESTAMP, EventId, Level, ProviderName, Message
| order by TIMESTAMP desc
```

## 常见事件 ID

| 事件 ID | 说明 |
|---------|------|
| 21 | Remote Desktop Services: Session logon succeeded |
| 22 | Remote Desktop Services: Shell start notification received |
| 23 | Remote Desktop Services: Session logoff succeeded |
| 24 | Remote Desktop Services: Session has been disconnected |
| 25 | Remote Desktop Services: Session reconnection succeeded |
| 1149 | User authentication succeeded |

## 关联查询

- [connection-tracking.md](./connection-tracking.md) - 完整连接追踪
- [session-host.md](./session-host.md) - Session Host 信息
