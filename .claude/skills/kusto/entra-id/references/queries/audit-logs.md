---
name: audit-logs
description: MSODS 目录审计日志查询
tables:
  - IfxAuditLoggingCommon
parameters:
  - name: objectId
    required: false
    description: AAD 对象 ID（用户/组/设备/租户）
  - name: tenantId
    required: false
    description: 租户 ID (actorContextId)
  - name: correlationId
    required: false
    description: 内部关联 ID (internalCorrelationId)
  - name: operationName
    required: false
    description: 操作名称（如 add/delete/update）
  - name: startTime
    required: true
    description: 开始时间 (ISO 8601 格式)
  - name: endTime
    required: true
    description: 结束时间 (ISO 8601 格式)
---

# MSODS 目录审计日志查询

## 用途

查看用户/组/设备的增删改操作历史，用于审计和变更追踪。

## 查询 1: 按对象 ID 查询

### 查询语句

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxAuditLoggingCommon
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{objectId}'  // AAD Object id/tenant id/device id
// | where operationName has '{operationName}'
// | where actorContextId has '{tenantId}'
// | where * has '{upn}'
| take 1000
| project env_time, env_seqNum, operationName, operationType, resultType,
    targetObjectId, actorObjectId, resourceId, resourceType, contextId,
    targetObjectName, internalOperationType, internalCorrelationId,
    env_appId, actorIdentityType
| order by env_time asc
```

---

## 查询 2: 按 internalCorrelationId 查询

### 查询语句

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxAuditLoggingCommon
| where internalCorrelationId == "{correlationId}"
| project env_time, operationName, resultType, targetObjectId, actorObjectId
```

---

## 常见操作名称

| operationName | 说明 |
|---------------|------|
| Add user | 添加用户 |
| Delete user | 删除用户 |
| Update user | 更新用户 |
| Add group member | 添加组成员 |
| Remove group member | 移除组成员 |
| Add owner to group | 添加组所有者 |
| Remove owner from group | 移除组所有者 |
| Reset user password | 重置用户密码 |
| Add device | 添加设备 |
| Delete device | 删除设备 |
| Update device | 更新设备 |
| Add service principal | 添加服务主体 |
| Update application | 更新应用程序 |
| Update authorization policy | 更新授权策略 |

---

## 结果字段说明

| 字段 | 说明 |
|------|------|
| operationName | 操作名称 |
| operationType | 操作类型 |
| resultType | 结果类型（Success/Failure） |
| targetObjectId | 目标对象 ID |
| actorObjectId | 执行者对象 ID |
| resourceType | 资源类型 |
| internalCorrelationId | 内部关联 ID |
| actorIdentityType | 执行者身份类型 |

## 关联查询

- [aad-connect-sync.md](./aad-connect-sync.md) - 同步相关事件
- [authorization-manager.md](./authorization-manager.md) - 授权管理事件
