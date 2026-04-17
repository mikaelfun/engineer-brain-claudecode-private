---
name: gateway-broker
description: Gateway 和 Broker 信息查询
tables:
  - RDInfraTrace
  - RDClientTrace
parameters:
  - name: ActivityId
    required: true
    description: 连接活动 ID
---

# Gateway 和 Broker 信息查询

## 用途

获取 AVD 连接经过的 Gateway 和 Broker 信息，用于诊断网络路由问题。

## 查询 1: 从基础设施日志获取 Gateway 信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {ActivityId} | 是 | 连接活动 ID |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where PreciseTimeStamp > ago(9d)
| where ActivityId == "{ActivityId}"
| where Category == "Microsoft.RDInfra.Diagnostics.AspExtensions.RequestHeadersLoggingMiddleware"
| where Msg contains "Host"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, Msg
| order by PreciseTimeStamp asc
```

---

## 查询 2: 从客户端日志获取 Gateway 信息

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDClientTrace
| where ActivityId == "{ActivityId}"
| where Msg has "rdgateway"
| project TIMESTAMP, ClientOS, ClientType, ClientInstance, ClientIP, Level, Msg
| order by TIMESTAMP asc
```

---

## 查询 3: 批量查询多个连接的 Gateway 信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {ActivityId1}, {ActivityId2}, ... | 是 | 多个活动 ID |

### 查询语句

```kql
let ids = datatable(Id:string)
[
    "{ActivityId1}", 
    "{ActivityId2}", 
    "{ActivityId3}"
];
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where PreciseTimeStamp > ago(14d)
| where ActivityId in (ids)
| where Category == "Microsoft.RDInfra.Diagnostics.AspExtensions.RequestHeadersLoggingMiddleware"
| where Msg contains "rdgateway-"
| project PreciseTimeStamp, ActivityId, Level, Category, Role, Msg
| distinct Role, Msg
```

---

## 查询 4: Broker 处理信息

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == "{ActivityId}"
| where PreciseTimeStamp > ago(2d)
| where Role == "Broker"
| project PreciseTimeStamp, Level, Category, Msg
| order by PreciseTimeStamp asc
```

---

## 查询 5: Gateway 错误

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where ActivityId == "{ActivityId}"
| where PreciseTimeStamp > ago(2d)
| where Role == "Gateway"
| where Level <= 3  // Error, Warning
| project PreciseTimeStamp, Level, Category, Msg
| order by PreciseTimeStamp asc
```

## 关联查询

- [connection-tracking.md](./connection-tracking.md) - 完整连接追踪
- [user-activity.md](./user-activity.md) - 用户活动查询
