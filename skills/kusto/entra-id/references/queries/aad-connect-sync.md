---
name: aad-connect-sync
description: AAD Connect 同步事件查询
tables:
  - IfxUlsEvents
parameters:
  - name: tenantId
    required: false
    description: 租户 ID
  - name: objectId
    required: false
    description: 对象 ID
  - name: startTime
    required: true
    description: 开始时间 (ISO 8601 格式)
  - name: endTime
    required: true
    description: 结束时间 (ISO 8601 格式)
---

# AAD Connect 同步事件查询

## 用途

查询 AAD Connect 同步活动和详细事件，用于诊断同步问题。

## 查询 1: 同步事件统计（推荐首先使用）

### 查询语句

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxUlsEvents
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{tenantId}'
| where env_cloud_role in ('msods-syncservice', 'adminwebservice')
| summarize 
    EventCount = count(),
    FirstEventTime = min(env_time),
    LastEventTime = max(env_time)
    by env_cloud_role
| order by EventCount desc
```

---

## 查询 2: 同步详细事件

### 查询语句

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxUlsEvents
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{tenantId}'
| where env_cloud_role == 'msods-syncservice'
| project env_time, correlationId, internalOperationType, message
| order by env_time desc
| take 50
```

---

## 查询 3: 内部事件日志（诊断 cmdlet/Graph API 问题）

### 查询语句

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxUlsEvents
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{objectId}'
| project env_time, env_appId, env_cloud_role,
    correlationId, resourceId, resourceType, internalOperationType, message
```

---

## 云角色映射 (env_cloud_role)

| env_cloud_role | 说明 | 来源 |
|----------------|------|------|
| becwebservice | MSOL cmdlets, O365 Portal | PowerShell MSOnline 模块和 O365 管理门户操作 |
| restdirectoryservice | AAD cmdlets, Graph API | AzureAD 模块和 Microsoft Graph API 调用 |
| adminwebservice | AAD Connect | Azure AD Connect 同步服务配置 |
| msods-syncservice | Back Sync / Forward Sync | 目录同步服务 |

---

## 常见同步操作

| 操作 | 说明 |
|------|------|
| Publish-ProvisionedPlan | 发布配置计划 |
| Publisher::PublishProvisionedPlans | 发布租户配置 |
| Publisher::Publish | 发布对象更改 |
| TryPublish | 尝试发布（可能包含错误信息） |
| An exception was thrown | 同步异常 |

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| env_cloud_role | 云角色，标识操作来源 |
| correlationId | 关联 ID |
| internalOperationType | 内部操作类型 |
| message | 详细消息内容 |
| resourceType | 资源类型 |

## 关联查询

- [audit-logs.md](./audit-logs.md) - 审计日志查询
- [authorization-manager.md](./authorization-manager.md) - 授权管理事件
