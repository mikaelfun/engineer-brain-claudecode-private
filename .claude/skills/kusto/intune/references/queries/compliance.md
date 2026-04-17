---
name: compliance
description: Intune 设备合规状态查询
tables:
  - IntuneEvent
parameters:
  - name: deviceId
    required: true
    description: Intune 设备 ID
  - name: accountId
    required: false
    description: Intune 账户 ID
  - name: startTime
    required: false
    description: 开始时间
  - name: endTime
    required: false
    description: 结束时间
---

# 设备合规状态查询

## 用途

查询设备合规状态、合规变化历史、合规策略操作等。

---

## 查询 1: 查询单个设备合规状态

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | 设备 GUID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
let deviceGuid = '{deviceId}';
let startTime = datetime({startTime});
let endTime = datetime({endTime});
let maxRows = 1000;

IntuneEvent
| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
    or EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails"
| where Col1 contains deviceGuid
| extend complianceState = iff(EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails", Col3, extract("ComplianceState:(.*?);", 1, Col2))
| extend complianceDetails = extract("RuleDetails:(.*)", 1, Col2)
| extend accountId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 1, Col1)
| extend deviceId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 2, Col1)
| extend userId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 3, Col1)
| extend deviceSource = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 4, Col1)
| project ASU=env_cloud_name, env_time, complianceState, complianceDetails, deviceId, userId, accountId
| limit maxRows
```

---

## 查询 2: 统计从不合规变为合规的设备数量

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {accountId} | 是 | 账户 GUID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
let accountGuid = '{accountId}';
let startTime = datetime({startTime});
let endTime = datetime({endTime});

IntuneEvent 
| where env_time between (startTime .. endTime) 
| where ServiceName == "StatelessComplianceCalculationService" 
| where EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails" 
| where Col1 contains accountGuid 
| extend complianceState = Col3
| where complianceState contains "now: Compliant"
| extend accountId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 1, Col1) 
| extend deviceId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 2, Col1) 
| extend userId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 3, Col1) 
| project ASU=env_cloud_name, env_time, complianceState, EventUniqueName, deviceId, userId, accountId, Col2
```

---

## 查询 3: 合规策略操作查询

### 查询语句

```kql
IntuneEvent
| where env_time >= ago(3d)
| where ColMetadata == "AADDId;AADTrustType;Authority;EnrollType;ClientCertificate;Message;"
| where ActivityId contains '{activityId}'
| distinct DeviceId
```

---

## 查询 4: 通用设备日志查询

### 查询语句

```kql
let deviceid = '{deviceId}';

IntuneEvent
| where env_time > ago(3d)
| where ActivityId == deviceid or DeviceId == deviceid
| project env_time, ActivityId, RelatedActivityId, EventUniqueName, ColMetadata, 
    Col1, Col2, Col3, Col4, Col5, Col6, Message
| extend metakeys = todynamic(split(trim_end(';',ColMetadata),';'))
| extend metavalues = pack(tostring(metakeys[0]), Col1, tostring(metakeys[1]), Col2, 
    tostring(metakeys[2]), Col3, tostring(metakeys[3]), Col4, 
    tostring(metakeys[4]), Col5, tostring(metakeys[5]), Col6) 
| project env_time, ActivityId, RelatedActivityId, EventUniqueName, metavalues
| order by env_time asc
```

## 查询 5: Compliance 计算完整查询（含 accountId 过滤）

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | 设备 GUID |
| {accountId} | 是 | 账户 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
let deviceGuid = '{deviceId}';
let accountid = '{accountId}';
let startTime = datetime({startTime});
let endTime = datetime({endTime});

IntuneEvent
| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
    or EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails"
| where Col1 contains accountid and Col1 contains deviceGuid
| extend accountId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 1, Col1)
| extend deviceId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 2, Col1)
| extend userId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 3, Col1)
| extend deviceSource = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 4, Col1)
| extend complianceState = iff(EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails", Col3, extract("ComplianceState:(.*?);", 1, Col5))
| extend complianceDetails = extract("RuleDetails:(.*)", 1, Col5)
| project env_time, complianceState, complianceDetails, deviceId, userId, deviceSource
| limit 1000
```

---

## 关联查询

- [policy-status.md](./policy-status.md) - 策略状态
- [device-info.md](./device-info.md) - 设备信息
