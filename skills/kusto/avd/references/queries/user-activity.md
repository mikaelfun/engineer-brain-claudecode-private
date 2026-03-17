---
name: user-activity
description: 用户活动和错误查询
tables:
  - DiagActivity
  - DiagError
parameters:
  - name: UPN
    required: true
    description: 用户 UPN (如 user@contoso.com)
  - name: timeRange
    required: false
    description: 时间范围 (默认 8h)
---

# 用户活动查询

## 用途

查询用户的 AVD 活动历史，包括连接、Feed 刷新等操作，以及关联的错误信息。是 AVD 诊断的主要入口查询。

## 查询 1: 用户活动概览

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {UPN} | 是 | 用户 UPN |

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where UserName contains "{UPN}"
| where env_time >= ago(8h)
| project env_time, Id, ActivityId, Type, Outcome, Status, 
          SessionHostName, SessionHostPoolName, ClientIPAddress, ClientOS, ClientType
| order by env_time desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 活动时间 |
| Id | 诊断 ID（用于关联 DiagError） |
| ActivityId | 活动 ID（用于追踪日志） |
| Type | 活动类型 (Connection, Feed) |
| Outcome | 结果 (Success, Failure) |
| SessionHostName | Session Host 名称 |
| SessionHostPoolName | 主机池名称 |
| ClientIPAddress | 客户端 IP |
| ClientOS | 客户端操作系统 |

---

## 查询 2: 用户连接失败详情

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where UserName contains "{UPN}"
| where env_time >= ago(1d)
| join kind=inner (
    cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagError 
) on $left.Id == $right.ActivityId
| project env_time, UserName, Id, Type, Outcome, 
          ErrorSource, ErrorCode, ErrorCodeSymbolic, ErrorMessage,
          SessionHostName, SessionHostPoolName, ClientIPAddress
| order by env_time desc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| ErrorSource | 错误来源 (ServiceError, Client, SessionHost) |
| ErrorCode | 错误代码 |
| ErrorCodeSymbolic | 符号化错误代码（用于分类问题） |
| ErrorMessage | 错误消息 |

---

## 查询 3: 用户连接统计

### 查询语句

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where UserName contains "{UPN}"
| where env_time >= ago(7d)
| where Type == "Connection"
| summarize 
    TotalConnections = count(),
    SuccessCount = countif(Outcome == "Success"),
    FailureCount = countif(Outcome == "Failure")
    by bin(env_time, 1d)
| extend SuccessRate = round(100.0 * SuccessCount / TotalConnections, 2)
| order by env_time desc
```

## 关联查询

- [connection-tracking.md](./connection-tracking.md) - 使用 ActivityId 追踪连接链路
- [health-check.md](./health-check.md) - 检查 Session Host 健康状态
