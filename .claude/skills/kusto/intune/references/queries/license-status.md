---
name: license-status
description: Intune 许可证状态查询
tables:
  - IntuneEvent
  - IfxAuditLoggingCommon
parameters:
  - name: userId
    required: true
    description: 用户 ID
  - name: deviceId
    required: false
    description: 设备 ID
  - name: startTime
    required: false
    description: 开始时间
  - name: endTime
    required: false
    description: 结束时间
---

# 许可证状态查询

## 用途

查询 Intune 许可证状态、MSODS 许可证操作历史等。

> ⚠️ **注意**: MSODS 查询需要使用不同的集群和数据库

---

## 查询 1: Intune 许可证事件

### 集群信息

| 集群 | 数据库 |
|------|--------|
| `intunecn.chinanorth2.kusto.chinacloudapi.cn` | `intune` |

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {userId} | 是 | 用户 ID |
| {deviceId} | 否 | 设备 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
IntuneEvent
| where env_time between(datetime({startTime})..datetime({endTime}))
| where env_cloud_name == 'CNPASU01'
| where ComponentName == 'UserProvider'
| where UserId =~ '{userId}'
| where ActivityId has '{deviceId}'  
| project env_time, EventUniqueName, ColMetadata, Col1, Col2, Col3
```

---

## 查询 2: MSODS 许可证操作历史

### 集群信息

| 集群 | 数据库 |
|------|--------|
| `msodsmooncake.chinanorth2.kusto.chinacloudapi.cn` | `MSODS` (**大写**) |

### 查询语句

```kql
// ⚠️ 需要切换到 msods 集群，数据库名称为 MSODS (大写)
IfxAuditLoggingCommon
| where env_time between(datetime({startTime})..datetime({endTime}))
| where targetObjectId == '{userId}'
| where operationName has 'license'
| project env_time, env_seqNum, operationName, operationType, resultType, 
    internalOperationType, internalCorrelationId, contextId, 
    targetObjectId, targetObjectName
```

---

## 常用 EventUniqueName 说明

| EventUniqueName | 说明 |
|-----------------|------|
| LogUnlicensedUserOutOfGracePeriod | 用户许可证过期超出宽限期 |
| LogUnlicensedUserWithInGracePeriod | 用户在宽限期内 |
| LogNotFoundGetUserResult | 未找到用户 |

## 关联查询

- [device-info.md](./device-info.md) - 设备信息
- [enrollment.md](./enrollment.md) - 设备注册
