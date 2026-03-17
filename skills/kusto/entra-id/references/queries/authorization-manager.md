---
name: authorization-manager
description: MSODS 授权管理查询
tables:
  - IfxBECAuthorizationManager
parameters:
  - name: correlationId
    required: false
    description: 内部关联 ID (internalCorrelationId)
  - name: userId
    required: false
    description: 用户对象 ID (userObjectId)
  - name: tenantId
    required: false
    description: 租户 ID (contextId)
  - name: startTime
    required: false
    description: 开始时间 (ISO 8601 格式)
  - name: endTime
    required: false
    description: 结束时间 (ISO 8601 格式)
---

# MSODS 授权管理查询

## 用途

查询权限和授权事件，用于诊断权限拒绝问题。

## 查询 1: 按关联 ID 查询

### 查询语句

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxBECAuthorizationManager
| where env_time > ago(1d)
| where internalCorrelationId == "{correlationId}"
| project env_time, task, result, contextId, userObjectId, scopeClaim, isAppGrantedAccess
| order by env_time asc
```

---

## 查询 2: 查询被拒绝的授权

### 查询语句

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxBECAuthorizationManager
| where env_time between(datetime({startTime})..datetime({endTime}))
| where userObjectId == "{userId}"
| where result == "DENIED"
| project env_time, task, result, scopeClaim, applicationId, isAppGrantedAccess
```

---

## 查询 3: 按租户统计授权事件

### 查询语句

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxBECAuthorizationManager
| where env_time > ago(1h)
| where contextId == "{tenantId}"
| summarize 
    AllowedCount = countif(result == "ALLOWED"),
    DeniedCount = countif(result == "DENIED")
    by task
| order by DeniedCount desc
```

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| result | 授权结果：DENIED (拒绝) / ALLOWED (允许) |
| scopeClaim | 权限范围声明（如 Directory.Read.All） |
| isAppGrantedAccess | 应用是否被授权 |
| isUserGrantedAccess | 用户是否被授权 |
| task | 任务/操作名称 |
| applicationId | 应用程序 ID |

---

## 常见授权失败原因

| 原因 | 说明 |
|------|------|
| 缺少 scopeClaim | 应用未被授予所需权限 |
| isAppGrantedAccess = false | 应用未获得管理员同意 |
| isUserGrantedAccess = false | 用户未获得相应权限 |

## 关联查询

- [audit-logs.md](./audit-logs.md) - 审计日志查询
- [aad-connect-sync.md](./aad-connect-sync.md) - AAD Connect 同步事件
