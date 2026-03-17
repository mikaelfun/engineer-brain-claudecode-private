---
name: apple-device
description: Intune Apple 设备查询 (iOS/macOS/iPad)
tables:
  - IntuneEvent
  - IOSEnrollmentService
  - DeviceLifecycle
parameters:
  - name: deviceId
    required: true
    description: 设备 ID
  - name: accountId
    required: false
    description: Intune 账户 ID
---

# Apple 设备查询

## 用途

查询 Apple 设备 (iOS/macOS/iPad) 的请求/响应、注册服务、设备列表等。

---

## 平台代码说明

| 代码 | 平台 |
|------|------|
| 7 | iPhone |
| 8 | iPad |
| 10 | macOS |

---

## 查询 1: Apple 设备请求/响应查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {deviceId} | 是 | 设备 ID |

### 查询语句

```kql
let _deviceId = '{deviceId}';

IntuneEvent
| where env_time > ago(6h)
| where env_cloud_name == "CNPASU01"
| where DeviceId == _deviceId
| where EventUniqueName in ("ExternalAppleHttpCallRequestBody", "ExternalAppleHttpCallResponseBody")
| extend _body = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", Col5, Col4)
| extend _url = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", Col4, Col3)
| extend _durationMs = iff(EventUniqueName == "ExternalAppleHttpCallRequestBody", parse_json(Col6).durationMs, "(response has no duration)")
| extend _json = parse_json(_body)
| project env_time, cV, _url, _durationMs, _json, DeviceId
| order by env_time asc
```

---

## 查询 2: iOS 注册服务查询

### 查询语句

```kql
IOSEnrollmentService 
| where env_time > ago(30d)
| where ActivityId == '{deviceId}'
| project env_time, userId, callerMethod, message, deviceTypeAsString, 
    serialNumber, siteCode, ActivityId, relatedActivityId2
```

---

## 查询 3: 获取 Apple 设备列表

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {accountId} | 是 | Intune 账户 ID |

### 查询语句

```kql
let accountId = '{accountId}';

DeviceLifecycle
| where env_time > ago(90d)
| where accountId == accountId
| where platform in ("7", "8", "10")  // iPhone, iPad, macOS
| where deviceId != ""
| summarize 
    LastSeen=max(env_time),
    FirstSeen=min(env_time)
  by deviceId, platform
| extend PlatformName = case(
    platform=="7", "iPhone",
    platform=="8", "iPad",
    platform=="10", "macOS",
    platform)
| order by LastSeen desc
| limit 1000
```

## 关联查询

- [enrollment.md](./enrollment.md) - 设备注册
- [vpp-token.md](./vpp-token.md) - VPP 令牌
- [certificate.md](./certificate.md) - 证书管理
