---
name: policy-status
description: 策略应用状态和部署查询
tables:
  - DeviceManagementProvider
  - IntuneEvent
parameters:
  - name: deviceId
    required: true
    description: Intune 设备 ID
  - name: policyId
    required: false
    description: 策略 ID
  - name: startTime
    required: false
    description: 开始时间
  - name: endTime
    required: false
    description: 结束时间
---

# 策略状态查询

## 用途

查询 Intune 策略应用状态、合规性统计、策略部署结果等。

---

## 查询 1: 基础策略状态查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
DeviceManagementProvider
| where env_time between(datetime({startTime})..datetime({endTime}))
| where deviceId =~ '{deviceId}'
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    TaskName, EventId, EventMessage, message, tenantContextId, tenantId
| order by env_time asc
| limit 1000
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| PolicyName | 策略名称 |
| PolicyType | 策略类型 |
| Applicability | 适用性状态（Applicable/NotApplicable）|
| Compliance | 合规状态（Compliant/Error/Pending/NotInstalled）|

---

## 查询 2: 查询设备收到的所有策略

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |

### 查询语句

```kql
DeviceManagementProvider 
| where env_time > ago(7d) 
| where ActivityId == '{deviceId}'
| where EventId == 5786
| project env_time, DeviceID=ActivityId, policyId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    TaskName, EventId, EventMessage, message 
| order by env_time asc
```

---

## 查询 3: 查询特定策略的部署状态

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {policyId} | 是 | 策略 ID |

### 查询语句

```kql
DeviceManagementProvider 
| where env_time > ago(3d)
| where EventId == 5786
| where ActivityId == '{deviceId}'
| extend PolicyId = extract("PolicyID: '(.*?)';", 1, EventMessage)
| where PolicyId == '{policyId}'
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyId, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    TaskName, EventId, EventMessage, message
| order by env_time asc
```

---

## 查询 4: 策略整体状态统计

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {policyId} | 否 | 策略 ID（可选筛选）|

### 查询语句

```kql
DeviceManagementProvider  
| where env_time > ago(3d)
| where EventId == 5786
| where deviceId == '{deviceId}'
| where id has '{policyId}'
| project ActivityId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    deviceId=ActivityId, PolicyID=['id'], env_time, policyId
| summarize 
    Success=(count(Compliance=='Compliant')>0), 
    Pending=(count(Compliance=='Compliant')==0), 
    Error=(count(Compliance=='Error')>0),
    LastSeen=max(env_time)
  by ActivityId, PolicyName, PolicyType, PolicyID, Applicability, policyId
| summarize 
    SuccessCount=sum(Success), 
    PendingCount=sum(Pending), 
    ErrorCount=sum(Error) 
  by PolicyName, PolicyType, ActivityId, PolicyID, Applicability, LastSeen, policyId
| project policyId, PolicyType, Applicability, SuccessCount, PendingCount, ErrorCount, LastSeen
| order by Applicability asc, LastSeen asc
```

---

## 查询 5: 通过 CIID 或 PolicyId 查询策略状态

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {accountId} | 是 | Intune 账户 ID |
| {policyId} | 否 | 策略 ID |
| {ciid} | 否 | Configuration Item ID |

### 查询语句

```kql
let starttime = ago(30d);
let endtime = now();
let deviceid = '{deviceId}';
let accountid = '{accountId}';
let policyid = '{policyId}';
let ciid = '{ciid}';

DeviceManagementProvider 
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where ActivityId contains deviceid
| extend rawciid = iff(ciid <> '', ciid, iff(policyid <> '', replace_regex(policyid,'-','_'), ''))
| where EventId == 5786
| parse EventMessage with * "PolicyID: '" parsedPolicyId "';" * "CIId: '" parsedCIID "';" *
| where parsedCIID contains rawciid or parsedPolicyId == policyid
| project env_time, userId, deviceId, policyId=parsedPolicyId, CIID=parsedCIID, 
    PolicyType=typeAndCategory, Applicability=applicablilityState, 
    Compliance=reportComplianceState, TaskName, EventMessage, PolicyName=name 
| order by env_time asc
```

---

## 查询 6: Tattoo 移除状态查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |

### 查询语句

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where ActivityId == '{deviceId}'
| where message contains "Tattoo"
| project env_time, ActivityId, cV, message
```

---

## 查询 7: 查询已撤销的策略

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | Intune 设备 ID |
| {accountId} | 是 | Intune 账户 ID |

### 查询语句

```kql
DeviceManagementProvider
| where SourceNamespace == "IntuneCNP" 
| where env_time >= now(-10d)
| where EventMessage contains "Tattoo removed for - AccountID: '{accountId}'; DeviceID: '{deviceId}'" 
| project env_time, EventMessage 
```

## 关联查询

- [policy-error.md](./policy-error.md) - 策略错误分析
- [device-info.md](./device-info.md) - 设备信息
- [effective-group.md](./effective-group.md) - 有效组评估
