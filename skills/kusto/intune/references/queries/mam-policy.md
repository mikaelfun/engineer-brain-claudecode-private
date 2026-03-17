---
name: mam-policy
description: Intune MAM (Mobile Application Management) 查询
tables:
  - IntuneEvent
  - HttpSubsystem
parameters:
  - name: userId
    required: true
    description: 用户 ID
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

# MAM 策略查询

## 用途

查询 MAM 账户维护状态、签入流程、策略分发等。

---

## 查询 1: MAM 账户维护状态查询

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {userId} | 是 | 用户 ID |
| {startTime} | 是 | 开始时间 |
| {endTime} | 是 | 结束时间 |

### 查询语句

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let userid = '{userId}';

let activityIds = IntuneEvent
    | where env_time between (starttime..endtime)
    | where UserId == userid
    | where ServiceName startswith "StatelessApplicationManagementService"
    | where EventUniqueName == "IsAccountInMaintenance"
    | project env_time, SourceNamespace, env_cloud_name, AccountId, UserId, ActivityId, cV, env_cloud_roleInstance, BuildVersion, Pid, Tid
    | summarize makeset(ActivityId, 10000);

IntuneEvent
    | where env_time between (starttime..endtime)
    | where ActivityId in (activityIds)
    | where ServiceName == "StatelessApplicationManagementService"
    | where EventUniqueName == "GetAction"
    | where ColMetadata contains "AppInstanceId;AadDeviceId;UpdateFlags;PolicyState"
    | project 
        env_time, SourceNamespace, env_cloud_name, AccountId, UserId, ActivityId, cV, ColMetadata,
        AppInstanceId = Col1, AadDeviceId = Col2, UpdateFlags = Col3, PolicyState = Col4,
        env_cloud_roleInstance, BuildVersion, Pid, Tid
```

---

## 查询 2: MAM 完整签入流程 (含 HttpSubsystem)

### 查询语句

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let userid = '{userId}';
let accountID = '{accountId}';

let activityIds = IntuneEvent
    | where env_time between (starttime..endtime)
    | where UserId == userid
    | where ServiceName startswith "StatelessApplicationManagementService"
    | where EventUniqueName == "IsAccountInMaintenance"
    | summarize makeset(ActivityId, 10000);

let MAMappids = IntuneEvent
    | where env_time between (starttime..endtime)
    | where ActivityId in (activityIds)
    | where ServiceName == "StatelessApplicationManagementService"
    | where EventUniqueName == "GetAction"
    | where ColMetadata contains "AppInstanceId;AadDeviceId;UpdateFlags;PolicyState"
    | summarize makeset(Col1, 10000);

HttpSubsystem
    | where env_time between (starttime..endtime)
    | where TaskName == "HttpSubsystemCompleteHttpOperationEvent"
    | where ActivityId in (activityIds)
    | where I_Srv startswith "StatelessApplicationManagementService"
    | where httpVerb !in ("Options", "PING")
    | extend type = case(
        collectionName == "Actions" and httpVerb == "GetLink", "Checkin", 
        httpVerb == "Action", "Action", 
        collectionName == "ApplicationInstances" and httpVerb == "Create", "Enroll", 
        collectionName == "ApplicationInstances" and httpVerb == "Delete", "Unenroll", 
        collectionName == "ApplicationInstances" and httpVerb == "Get", "Get", 
        collectionName == "ApplicationInstances" and httpVerb == "Patch", "Patch", 
        "???")
    | extend parsedUrl = parse_url(url)
    | extend appInstId = extract("guid'([^']*)'", 1, tostring(parsedUrl["Path"]))
    | extend queryParameters = parsedUrl["Query Parameters"]
    | extend Os = tostring(queryParameters["Os"])
    | extend DeviceId = tostring(queryParameters["DeviceId"])
    | extend AppVersion = tostring(queryParameters["AppVersion"])
    | extend SdkVersion = tostring(queryParameters["SdkVersion"])
    | extend DeviceHealth = tostring(queryParameters["DeviceHealth"])
    | extend ManagementLevel = tostring(queryParameters["ManagementLevel"])
    | project env_time, SourceNamespace, env_cloud_name, type, accountId, ActivityId, statusCode,
        appInstId, Os, DeviceId, AppVersion, SdkVersion, DeviceHealth, ManagementLevel,
        collectionName, httpVerb, url, env_cloud_roleInstance, I_BuildVer
```

---

## 常见 ReasonCode 说明

| ReasonCode | 名称 | 说明 |
|------------|------|------|
| 300 | CMAREnrollmentTriggerAppUnEnroll | 应用调用注销 |
| 303 | CMAREnrollmentTriggerOfflineWipe | 离线擦除 |
| 304 | CMAREnrollmentTriggerWipeCommand | 擦除命令 |
| 307 | CMAREnrollmentTriggerSwitchUser | 切换用户 |
| 309 | CMAREnrollmentTriggerDeviceNonCompliant | 设备不合规 |

## 关联查询

- [policy-status.md](./policy-status.md) - 策略状态
- [compliance.md](./compliance.md) - 合规状态
