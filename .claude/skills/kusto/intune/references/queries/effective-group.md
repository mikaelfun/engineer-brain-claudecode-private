---
name: effective-group
description: Intune 有效组 (Effective Group) 评估查询
tables:
  - IntuneEvent
  - DeviceManagementProvider
parameters:
  - name: targetId
    required: true
    description: 目标 ID (设备 ID 或用户 ID)
  - name: accountId
    required: false
    description: Intune 账户 ID
  - name: policyId
    required: false
    description: 策略 ID
---

# 有效组 (Effective Group) 查询

## 用途

查询设备/用户的 EG 变更、策略通过 EG 分配情况等。

---

## 查询 1: 查询设备/用户的 EG 变更

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {targetId} | 是 | 设备 ID 或用户 ID |

### 查询语句

```kql
IntuneEvent
| where env_time > ago(21d)
| where env_cloud_name == "CNPASU01"
| where ServiceName contains "GroupingServiceV2BgTaskService" 
| where EventUniqueName contains "EffectiveGroupMembershipUpdated"
| project env_time, TargetId=Col2, EGId=Col1, AccountId, ActiveClauses=Col5, StaleClauses=Col6, ServiceName, env_cloud_name
| where TargetId == '{targetId}'
| order by env_time asc
```

---

## 查询 2: 查询策略通过 EG 分配的情况

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {accountId} | 是 | Intune 账户 ID |
| {policyId} | 是 | 策略 ID |
| {egIdList} | 是 | EG ID 列表，例如: ("eg-id-1", "eg-id-2") |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
IntuneEvent
| where env_time >= datetime({startTime}) and env_time <= datetime({endTime})
| where env_cloud_name == "CNPASU01"
| where EventUniqueName == "47121"
| where AccountId == '{accountId}'
| where PayLoadId == '{policyId}'
| extend EffectiveGroupId = Col1
| extend IsDeletedDeployment = Col3
| where EffectiveGroupId in ({egIdList})  // 例如: ("eg-id-1", "eg-id-2")
| extend jsonString = parse_json(extract("SerializedMessage:({.*)",1,Message))
| project env_time, EffectiveGroupId, IsDeletedDeployment, Col4, Col5, Col6, ActivityId
| order by env_time asc
// 注意: ActivityId 是生效的 device
```

---

## 查询 3: 查询策略分配给特定 EG 的设备

### 查询语句

```kql
IntuneEvent
| where env_time > ago(7d)
| where env_cloud_name == "CNPASU01"
| where EventUniqueName == "47121"
| where AccountId == '{accountId}'
| where PayLoadId == '{policyId}'
| extend EffectiveGroupId = Col1
| where EffectiveGroupId in ({egIdList})
| extend jsonString = parse_json(extract("SerializedMessage:({.*)",1,Message))
| project env_time, AccountId, PayLoadId, Col1, Col2, Col3, Col4, Col5, Col6, 
    ColMetadata, ActivityId, jsonString, Message
| order by env_time asc
```

---

## 查询 4: 设备 EG 签入查询

### 查询语句

```kql
DeviceManagementProvider 
| where env_time > ago(30d)
| where message contains "DeviceEG" or message contains "UserEG="
| where deviceId has '{deviceId}'
| project env_time, deviceId, userId, message
| order by env_time asc
```

## 查询 5: 按 policyID 查询 EG 分配详情（含 SerializedMessage 解析）

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {accountId} | 是 | Intune 账户 ID |
| {policyId} | 是 | 策略 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |
| {egId} | 否 | EG ID 过滤（可选，留空则返回所有 EG）|

### 查询语句

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let policyid = '{policyId}';
let egid = '{egId}';

IntuneEvent
| where env_time between (starttime .. endtime)
| where EventUniqueName == "47121"
| where AccountId == accountid
| where PayLoadId contains policyid
| extend EffectiveGroupId = Col1
| where EffectiveGroupId contains egid
| extend jsonString = parse_json(extract("SerializedMessage:({.*)", 1, Message))
| project env_time, PayLoadId, EffectiveGroupId, PayloadType = Col2, IsDeletedDeployment = Col3, DeploymentDateTime = Col4, Source = Col5, MessageId = Col6, ActivityId, jsonString, Message
| order by env_time asc
| limit 1000
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| PayLoadId | 策略 ID |
| EffectiveGroupId | 有效组 ID |
| PayloadType | 策略类型 |
| IsDeletedDeployment | 是否已删除部署 |
| DeploymentDateTime | 部署时间 |
| ActivityId | 生效设备的 Activity ID |
| jsonString | 序列化消息的 JSON 解析 |

---

## 查询 6: EG Check-in 事件查询（含 DeviceEG/UserEG 解析）

### 查询语句

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let userid = '{userId}';
let deviceid = '{deviceId}';

DeviceManagementProvider
| where env_time between (starttime.. endtime)
| where accountId contains accountid
| where message contains "DeviceEG" or message contains "UserEG"
| where userId =~ userid or deviceId =~ deviceid
| parse message with * 'DeviceEG=' DeviceEG ' UserEG=' UserEG ' PrimaryUserEG=' *
| project env_time, deviceId, userId, DeviceEG, UserEG, message
| extend targettype = iff(deviceId == deviceid, "Device", "User")
| order by env_time asc
| limit 1000
```

---

## 查询 7: EG 成员变更事件查询（EffectiveGroupMembershipUpdated）

### 查询语句

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let accountid = '{accountId}';
let userid = '{userId}';
let deviceid = '{deviceId}';

IntuneEvent
| where env_time between (starttime .. endtime)
| where AccountId == accountid
| where ServiceName contains "GroupingServiceV2BgTaskService"
| where EventUniqueName contains "EffectiveGroupMembershipUpdated"
| project env_time, TargetId=Col2, EGId=Col1, AccountId, ActiveClauses=Col5, StaleClauses=Col6, ServiceName
| where TargetId =~ deviceid or TargetId =~ userid
| extend targettype = iff(TargetId == deviceid, "Device", iff(TargetId == userid, "User", "unknown"))
| order by env_time asc
| limit 1000
```

---

## 关联查询

- [policy-status.md](./policy-status.md) - 策略状态
- [device-checkin.md](./device-checkin.md) - 设备签入
