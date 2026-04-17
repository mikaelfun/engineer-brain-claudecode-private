---
name: session-host
description: Session Host 信息和日志查询
tables:
  - RDInfraTrace
  - RDAgentMetadata
  - DiagActivity
parameters:
  - name: SessionHostName
    required: true
    description: Session Host 名称或 FQDN
---

# Session Host 信息查询

## 用途

查询 Session Host 的详细信息，包括 VM 元数据、连接统计、日志等。

## 查询 1: Session Host 基础日志

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {SessionHostName} | 是 | Session Host 名称 |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance contains "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Level <= 4
| project PreciseTimeStamp, Level, Category, Role, Msg, ActivityId, HostPool
| order by PreciseTimeStamp desc
| take 500
```

---

## 查询 2: Session Host VM 元数据

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDAgentMetadata
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| summarize arg_max(TIMESTAMP, *) by HostInstance
| project TIMESTAMP, SubscriptionId, HostPool, HostInstance, 
          Location, OsType, Sku, VmSize, AzureResourceId
```

---

## 查询 3: Session Host 连接统计

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where SessionHostName has "{SessionHostName}"
| where env_time >= ago(1d)
| where Type == "Connection"
| summarize 
    TotalConnections = count(),
    SuccessCount = countif(Outcome == "Success"),
    FailureCount = countif(Outcome == "Failure")
| extend SuccessRate = round(100.0 * SuccessCount / TotalConnections, 2)
```

---

## 查询 4: Session Host 错误日志

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance contains "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Level <= 2  // Critical, Error
| project PreciseTimeStamp, Level, Category, Role, Msg
| order by PreciseTimeStamp desc
```

---

## 查询 5: 用户连接创建事件

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance contains "{SessionHostName}"
| where PreciseTimeStamp >= datetime({starttime}) and PreciseTimeStamp <= datetime({endtime})
| where Msg contains "Creating a pending connection for User"
| project PreciseTimeStamp, Role, Msg, ActivityId, Level, Category, HostPool
| order by PreciseTimeStamp asc
```

## 关联查询

- [heartbeat.md](./heartbeat.md) - 心跳状态
- [health-check.md](./health-check.md) - 健康检查状态
- [connection-tracking.md](./connection-tracking.md) - 连接追踪
