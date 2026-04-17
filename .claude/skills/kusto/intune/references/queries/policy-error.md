---
name: policy-error
description: 策略错误排查和 Tattoo 状态查询
tables:
  - DeviceManagementProvider
  - IntuneEvent
parameters:
  - name: deviceId
    required: true
    description: Intune 设备 ID
  - name: policyId
    required: false
    description: 问题策略 ID
  - name: accountId
    required: false
    description: Intune 账户 ID
---

# 策略错误排查查询

## 用途

排查 Intune 策略错误、Check-in 停滞问题、Tattoo 状态等。

> 🔥 **推荐用于排查 Check-in 停滞问题**

---

## 查询 1: 发现策略错误概览

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |

### 查询语句

```kql
let intuneDeviceId = '{deviceId}';

DeviceManagementProvider  
| where env_time > ago(15d)
| where EventId == 5786
| where deviceId == intuneDeviceId
| where reportComplianceState == 'Error'
| summarize 
    LastError=max(env_time),
    FirstError=min(env_time),
    ErrorCount=count(),
    Compliant=countif(reportComplianceState=='Compliant')
  by PolicyName=name, PolicyId=id, PolicyType=typeAndCategory
| extend SuccessRate = round(100.0 * Compliant / (Compliant + ErrorCount), 1)
| where ErrorCount > 0
| order by ErrorCount desc, LastError desc
| limit 20
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| PolicyName | 策略名称 |
| PolicyId | 策略 ID |
| ErrorCount | 错误次数 |
| SuccessRate | 成功率 |

---

## 查询 2: 查看错误详细消息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {policyId} | 是 | 问题策略 ID（从查询 1 获取）|

### 查询语句

```kql
let intuneDeviceId = '{deviceId}';
let problemPolicyId = '{policyId}';

DeviceManagementProvider  
| where env_time > ago(15d)
| where deviceId == intuneDeviceId
| where reportComplianceState == 'Error'
| where id contains problemPolicyId
| project env_time, PolicyID=id, PolicyType=typeAndCategory, EventMessage, message
| take 5
```

---

## 查询 3: 评估影响范围

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {accountId} | 是 | Intune 账户 ID |
| {policyId} | 是 | 问题策略 ID |

### 查询语句

```kql
let accountId = '{accountId}';
let problemPolicy = '{policyId}';

DeviceManagementProvider  
| where env_time > ago(15d)
| where accountId == accountId
| where id contains problemPolicy
| where reportComplianceState == 'Error'
| summarize 
    ErrorCount=count(),
    FirstError=min(env_time),
    LastError=max(env_time),
    AffectedDevices=dcount(deviceId)
  by accountId, PolicyType=typeAndCategory
| project accountId, AffectedDevices, ErrorCount, FirstError, LastError, PolicyType
```

---

## 查询 4: 错误时间线分析

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |

### 查询语句

```kql
let intuneDeviceId = '{deviceId}';

DeviceManagementProvider  
| where env_time > ago(7d)
| where deviceId == intuneDeviceId
| where EventId == 5786
| summarize 
    ErrorCount=countif(reportComplianceState == 'Error'),
    CompliantCount=countif(reportComplianceState == 'Compliant'),
    PendingCount=countif(reportComplianceState == 'Pending')
  by bin(env_time, 1h)
| order by env_time asc
```

---

## 排查经验总结 (实际案例)

> **案例时间**: 2026-01-06

### 症状
- Intune 门户显示 Check-in 时间停滞，但设备仍在使用

### 根因
- 配置策略 (Application) 错误导致 Check-in 部分失败

### 影响
- 门户的 "Last Check-in" 时间只更新完全成功的签到
- 公司门户应用循环跑状态检查，因为策略验证一直失败
- 单个策略错误影响了 17,771 台设备

### 排查步骤
1. 使用 `device-info.md` 宽泛搜索确认设备存在
2. 使用 `device-checkin.md` 确认后台 Check-in 正常
3. 使用本文件的 **查询 1** 发现策略错误
4. 使用 **查询 2** 查看错误详情
5. 使用 **查询 3** 评估影响范围
6. 在 Intune 门户修复或移除问题策略

---

## 策略删除/撤销 (Tattoo) 查询

### 查询 5: 查询已撤销的策略

```kql
DeviceManagementProvider
| where SourceNamespace == "IntuneCNP" 
| where env_time >= now(-10d)
| where EventMessage contains "Tattoo removed for - AccountID: '{accountId}'; DeviceID: '{deviceId}'" 
| project env_time, EventMessage 
```

### 查询 6: Tattoo 状态检查

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where ActivityId == '{deviceId}'
| where message contains "Tattoo"
| project env_time, ActivityId, cV, message
```

### 查询 7: Tattoo 相关事件 (IntuneEvent)

```kql
IntuneEvent
| where env_time > ago(1d)
| where ActivityId contains '{deviceId}'
| where * contains "Tattoo"
| project ActivityId, env_time, ComponentName, EventUniqueName, 
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```

## 关联查询

- [device-info.md](./device-info.md) - 设备信息
- [device-checkin.md](./device-checkin.md) - 设备 Check-in 状态
- [policy-status.md](./policy-status.md) - 策略状态
