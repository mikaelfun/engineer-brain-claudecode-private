---
name: connection-tracking
description: 连接链路追踪
tables:
  - RDInfraTrace
  - RDClientTrace
  - RDPCoreTSEventLog
parameters:
  - name: ActivityId
    required: true
    description: 连接活动 ID (从 DiagActivity 获取)
---

# 连接链路追踪

## 用途

使用 ActivityId 追踪 AVD 连接的完整链路，包括客户端日志、基础设施日志、RDP 核心事件等。

## 查询 1: 基础设施日志追踪

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {ActivityId} | 是 | 活动 ID |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == "{ActivityId}"
| where PreciseTimeStamp > ago(2d)
| project PreciseTimeStamp, Level, Category, Role, HostInstance, HostPool, Msg
| order by PreciseTimeStamp asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| Level | 日志级别 (1=Critical, 2=Error, 3=Warning, 4=Info) |
| Category | 日志类别 |
| Role | 组件角色 (RDAgent, Broker, Gateway) |
| HostInstance | Session Host FQDN |
| Msg | 日志消息 |

---

## 查询 2: 仅错误和警告

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == "{ActivityId}"
| where PreciseTimeStamp > ago(2d)
| where Level <= 3  // Critical, Error, Warning
| project PreciseTimeStamp, Level, Category, Role, HostInstance, HostPool, Msg
| order by PreciseTimeStamp asc
```

---

## 查询 3: 客户端日志追踪

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDClientTrace
| where ActivityId == "{ActivityId}"
| where TIMESTAMP > ago(3d)
| project TIMESTAMP, TaskName, ChannelName, ClientOS, ClientType, ClientIP, Msg
| order by TIMESTAMP asc
```

---

## 查询 4: RDP 核心事件

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDPCoreTSEventLog
| where ActivityId == "{ActivityId}"
| where TIMESTAMP >= ago(9d)
| project TIMESTAMP, Level, TaskName, ProviderName, Message
| order by TIMESTAMP asc
```

---

## 查询 5: 完整链路追踪 (联合查询)

### 查询语句

```kql
let activityId = "{ActivityId}";
let infraLogs = cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == activityId
| where PreciseTimeStamp > ago(2d)
| project Timestamp = PreciseTimeStamp, Source = "InfraTrace", Level, Role, Message = Msg;
let clientLogs = cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDClientTrace
| where ActivityId == activityId
| where TIMESTAMP > ago(3d)
| project Timestamp = TIMESTAMP, Source = "ClientTrace", Level, Role = ClientType, Message = Msg;
union infraLogs, clientLogs
| order by Timestamp asc
```

## 关联查询

- [user-activity.md](./user-activity.md) - 获取 ActivityId
- [gateway-broker.md](./gateway-broker.md) - Gateway/Broker 详细信息
