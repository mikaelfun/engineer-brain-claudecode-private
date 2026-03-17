---
name: certificate
description: Intune 证书相关查询 (SCEP/PKCS/MDM Certificate)
tables:
  - DeviceManagementProvider
  - IntuneEvent
  - DeviceLifecycle
parameters:
  - name: deviceId
    required: true
    description: 设备 ID
  - name: accountId
    required: false
    description: Intune 账户 ID
  - name: thumbprint
    required: false
    description: 证书指纹
---

# 证书查询

## 用途

查询 SCEP/PKCS 证书部署状态、MDM Identity Certificate 过期日期等。

---

## 查询 1: 证书部署状态查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | 设备 ID |

### 查询语句

```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId contains '{deviceId}'
| where * contains "scep" or * contains "pkcs" or * contains "certificate"
| project env_time, accountId, userId, DeviceID=ActivityId, PolicyName=name, 
    PolicyType=typeAndCategory, Applicability=applicablilityState, 
    Compliance=reportComplianceState, EventMessage, message, TaskName
```

---

## 查询 2: SCEP 证书事件查询

### 查询语句

```kql
IntuneEvent
| where env_time > ago(3h)
| where DeviceId == '{deviceId}' or ActivityId == '{deviceId}'
| where * contains "scep"
| project env_time, ComponentName, DeviceId, Message, EventUniqueName, 
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ActivityId
```

---

## 查询 3: 检查 SCEP/Trusted Root Profile 部署状态

### 查询语句

```kql
let _deviceId = '{deviceId}';
let _startTime = datetime({startTime});
let _endTime = datetime({endTime});

DeviceManagementProvider 
| where env_time between (_startTime .. _endTime)
| where TaskName == "DeviceManagementProviderCIReportDataEvent" 
| where deviceId == _deviceId
| where typeAndCategory contains "TrustedRootCertificate" or typeAndCategory contains "ClientAuthCertificate"
| project env_time, policyId, typeAndCategory, applicablilityState, reportComplianceState, EventMessage
| order by env_time desc
```

---

## 查询 4: 证书指纹查询

> ⚠️ **注意**: 原 DmpLogs 表在 Mooncake 集群不存在，改用 DeviceManagementProvider

### 查询语句

```kql
DeviceManagementProvider
| where env_time > ago(7d)
| where ActivityId == '{deviceId}' or userId == '{userId}'
| where message contains '{thumbprint}'
| project env_time, deviceId, ActivityId, message, EventId, userId, TaskName
| order by env_time
```

---

## 查询 5: 依赖配置文件查询

### 查询语句

```kql
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId contains '{deviceId}'
| where message contains "dependent profile"
| project env_time, ActivityId, cV, message
```

---

## MDM Identity Certificate 过期日期查询

### 背景

MDM 证书有效期为 1 年，到期前 30 天自动续订。以下查询可用于检查 Apple 设备的 MDM 证书过期日期。

### 查询 6: 使用 IntuneEvent 查询证书过期 (推荐)

```kql
let accountId = '{accountId}';

// 获取 macOS 设备列表 (platform=10)
let macDevices = DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform == "10"  // 10=macOS, 7=iPhone, 8=iPad
| where deviceId != ""
| summarize by deviceId;

// 从 GetDeviceIdentityAsync 事件提取证书信息
IntuneEvent
| where env_time > ago(7d)
| where AccountId == accountId
| where DeviceId in (macDevices)
| where EventUniqueName == "GetDeviceIdentityAsync"
| where ColMetadata == "RegistrationStatus;EnrollCertStartTime;EnrollCertExpiryTime;"
| summarize arg_max(env_time, Col2, Col3) by DeviceId
| extend CertExpiryDate = todatetime(Col3)
| extend CertStartDate = todatetime(Col2)
| extend DaysUntilExpiry = datetime_diff('day', CertExpiryDate, now())
| project 
    DeviceId, 
    CertStartDate, 
    CertExpiryDate, 
    DaysUntilExpiry, 
    LastCheckedTime = env_time
| order by DaysUntilExpiry asc
| take 100
```

### 查询 7: 使用 DeviceManagementProvider 查询证书过期

```kql
let accountId = '{accountId}';

let macDevices = DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform == "10"  // macOS
| where deviceId != ""
| summarize by deviceId;

DeviceManagementProvider
| where env_time > ago(14d)
| where accountId == accountId
| where ActivityId in (macDevices)
| where message contains "Enroll cert expiry time:"
| extend CertExpiryStr = extract("Enroll cert expiry time: ([0-9/]+ [0-9:]+ [AP]M)", 1, message)
| extend CertStartStr = extract("Enroll cert start time: ([0-9/]+ [0-9:]+ [AP]M)", 1, message)
| summarize arg_max(env_time, CertExpiryStr, CertStartStr) by DeviceId=ActivityId
| extend CertExpiryDate = todatetime(CertExpiryStr)
| extend CertStartDate = todatetime(CertStartStr)
| extend DaysUntilExpiry = datetime_diff('day', CertExpiryDate, now())
| project 
    DeviceId, 
    CertStartDate, 
    CertExpiryDate, 
    DaysUntilExpiry, 
    LastCheckedTime = env_time
| order by DaysUntilExpiry asc
| take 100
```

### 查询 8: 查询即将过期的设备（60天内）

```kql
let accountId = '{accountId}';
let warningDays = 60;

let appleDevices = DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform in ("7", "8", "10")  // iPhone, iPad, macOS
| where deviceId != ""
| summarize by deviceId;

IntuneEvent
| where env_time > ago(7d)
| where AccountId == accountId
| where DeviceId in (appleDevices)
| where EventUniqueName == "GetDeviceIdentityAsync"
| where ColMetadata == "RegistrationStatus;EnrollCertStartTime;EnrollCertExpiryTime;"
| summarize arg_max(env_time, Col2, Col3) by DeviceId
| extend CertExpiryDate = todatetime(Col3)
| extend DaysUntilExpiry = datetime_diff('day', CertExpiryDate, now())
| where DaysUntilExpiry <= warningDays and DaysUntilExpiry >= 0
| project DeviceId, CertExpiryDate, DaysUntilExpiry, LastCheckedTime = env_time
| order by DaysUntilExpiry asc
```

## 关联查询

- [enrollment.md](./enrollment.md) - 设备注册
- [policy-status.md](./policy-status.md) - 策略状态
