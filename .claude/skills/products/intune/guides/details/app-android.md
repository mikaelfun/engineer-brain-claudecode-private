# Intune Android 应用部署 — 综合排查指南

**条目数**: 13 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**Kusto 引用**: app-install.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (1 条)

- **rootCause_conflict** (medium): intune-ado-wiki-364 vs intune-contentidea-kb-347 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Kusto 诊断查询

#### app-install.md
`[工具: Kusto skill — app-install.md]`

```kql
DeviceManagementProvider  
| where env_time >= ago(7d)
| where ActivityId == '{deviceId}'
| where (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
    name, ['id'], typeAndCategory, applicablilityState, reportComplianceState, 
    EventMessage, message, env_cloud_name, ActivityId, tenantId, userId, 
    sessionId, relatedActivityId2, appPolicyId, platform, technology, devicePlatformType 
| order by ActivityId, env_time asc 
```

```kql
DeviceManagementProvider  
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where (['id'] contains '{appId}' or appPolicyId contains '{appId}' 
    or message contains '{appId}' or name contains '{appName}')  
| where (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
    name, ['id'], typeAndCategory, applicablilityState, reportComplianceState, 
    EventMessage, message, env_cloud_name, ActivityId, tenantId, userId, 
    sessionId, relatedActivityId2, appPolicyId, platform, technology, devicePlatformType 
| order by ActivityId, env_time asc 
```

```kql
DeviceManagementProvider
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where message contains '{appName}' or EventMessage contains '{appName}'
| project env_time, message, EventMessage, aadDeviceId, ActivityId
```

```kql
let devId='{deviceId}';

DeviceManagementProvider
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(7d) and ActivityId == devId
| where EventId==5786
| project env_time, EventId, Level, name, type=typeAndCategory, compliance=reportComplianceState, EventMessage  
| where type=="AppModel;AppModel" and compliance=="NotInstalled"
| summarize lastNotInstalled=max(env_time) by name 
| join kind= leftouter (
    DeviceManagementProvider
    | where SourceNamespace == "IntuneCNP"
    | where env_time > ago(7d) and ActivityId == devId
    | where EventId==5786
    | project env_time, EventId, Level, name, type=typeAndCategory, compliance=reportComplianceState, EventMessage  
    | where type=="AppModel;AppModel" and compliance=="Installed"
    | summarize 1stInstalled=min(env_time) by name 
) on name 
| project name, lastNotInstalled, 1stInstalled, compliance = iff(isnull(1stInstalled), "NotInstalled", "Installed")
```

```kql
DownloadService
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(1d)
| where EventId in (13796)
| where deviceId == '{deviceId}' 
| project env_time, SourceNamespace, accountId, deviceId, userId, TaskName, 
    EventId, status, platform, statusCode, exception, errorEventId, result, EventMessage
```

```kql
IntuneEvent
| where env_time >= ago(3d)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, 
    ComponentName, RelatedActivityId, SessionId
```

```kql
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| extend Policy = split(Col3, ',')
| extend PolicyId = split(Policy[0],':')[1]
| extend PolicyType = split(Policy[1],':')[1]
| extend PolicyVersion = split(Policy[2],':')[1]
| extend PolicyBody = split(Policy[5],'":\"')[1]
| project PolicyId, PolicyType, PolicyVersion, PolicyBody
```

```kql
DeviceManagementProvider
| where env_time >= ago(30d)
| where * contains '{deviceId}'
| where * contains 'IntuneWindowsAgent'
| project env_time, name, applicablilityState, reportComplianceState  
| summarize max(env_time) by name, applicablilityState, reportComplianceState 
```

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';
let inputAccountId = '{accountId}';
let ApplicationId = '{appId}';

let correlationTable = cluster('intunecn.chinanorth2.kusto.chinacloudapi.cn').database('intune').
IntuneEvent
| where env_time between (starttime..endtime)
| where DeviceId contains deviceid
| where ComponentName == 'DownloadService'
| where EventUniqueName == 'AppRequestCorrelation'
| where AccountId == inputAccountId
| project env_time, env_seqNum, env_cloud_name, env_cloud_role, env_cloud_roleInstance, ApplicationName, BuildVersion, Pid, Tid, ActivityId, RelatedActivityId,
Level = TraceLevel, EventUniqueName, AccountId, ContextId, UserId, DeviceId, ApplicationId = Col1, ContentId = Col2, FileId = Col3, HttpVerb = Col4, cV, Exception = Message;

correlationTable
| summarize by RelatedActivityId, ApplicationId, ContextId
| join (
    DownloadService
    | where env_time between (starttime..endtime) and EventId == 13796
    | where accountId =~ inputAccountId
    | project env_time, env_seqNum, env_cloud_name, env_cloud_role, env_cloud_roleInstance, ApplicationName = I_App,
    BuildVersion = I_BuildVer, Pid, Tid, ActivityId,
    RelatedActivityId = relatedActivityId2, Level, EventUniqueName = TaskName, AccountId = accountId, UserId = userId, DeviceId = deviceId, exceptionType,
    platform, requestedRange, statusCode, bytesDelivered, bytesRequested, timeElapsed, cV, Message = EventMessage
) on RelatedActivityId
| project-away RelatedActivityId1
| order by env_time asc, env_seqNum asc
| summarize MegabytesTransfered = sum(bytesDelivered)/1024/1024 by ApplicationId, AccountId, DeviceId, bin(env_time, 10m)
| order by MegabytesTransfered desc
| limit 1000
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Android 设备上应用部署显示 Install Failed 状态 | 常见原因：APK 文件损坏、设备未允许来自未知来源的安装、APK 未签名 | 1. 查看 OMADM 日志中 'Error installing application <app name>, result code: <code>' 的 Android 错误码；2. 通... | 🟢 8.5 | ADO Wiki |
| 2 | Managed Google Play (MGP) account upgrade to Entra identity fails with 'Domain is already being u... | The domain is already registered with another Google service or enterprise ac... | Customer must contact Google Support directly to resolve the domain conflict. Reference: https://... | 🟢 8.5 | ADO Wiki |
| 3 | Cannot perform MGP account upgrade — original user who connected Managed Google Play no longer ex... | MGP upgrade requires Google Super Admin role which was held by the user who i... | Customer can either request Google to provide current Super Admin details or initiate a request t... | 🟢 8.5 | ADO Wiki |
| 4 | Managed Google Play account upgrade fails with generic 'Service Error' at Intune portal level dur... | Transient error from Google Enterprise Mobility Management (EMM) API service | 1) Retry after some time. 2) If error persists, escalate — potentially involving Google support. ... | 🔵 7.5 | ADO Wiki |
| 5 | Cannot attach photos in work profile apps (Word, Excel, Outlook, OneDrive) on Android Enterprise ... | Android requires an additional file explorer application in the workspace to ... | Approve and assign a File Explorer app (e.g., Google Files) from managed Google Play store to the... | 🔵 7.5 | MS Learn |
| 6 | When trying to push the Delve app on Android the device displays &quot;Device must be managed&quo... | Delve for Android is not supported for devices that are enrolled into Microso... |  | 🔵 7.0 | ContentIdea KB |
| 7 | You may encounter a customer stating that users are unable to create new contacts in the Outlook ... | This isn't actually an Intune problem even though customers may report it as ... | A new version of the Outlook app for iOS and Android became available in June of 2017 which added... | 🔵 7.0 | ContentIdea KB |
| 8 | You notice that the Intune Company Portal app for Android no longer receives automatic updates fr... | This can occur if the Company Portal app has not been manually approved in th... | To manually approve the Company Portal app, complete the following steps:1. Browse to the Intune ... | 🔵 7.0 | ContentIdea KB |
| 9 | When attempting to upload an APK file in the Azure Intune portal, after selecting the file, the O... | This can occur if there is an issue with the manifest for the Android app in ... | Contact the publisher or developer of the app and have them update the app. | 🔵 7.0 | ContentIdea KB |
| 10 | This walkthrough will show you how to configure and enroll a COSU device with the QR code methodW... | Education | If you haven't already...Onboard to Google  Approve any applications from      the Managed Play S... | 🔵 7.0 | ContentIdea KB |
| 11 | Customers are unable to enroll specific Huawei models that are running Android 8. 1. Download Com... | We have an internal thread with Huawei and they informed us that this is a KN... | The below workaround was tested and confirmed for the following device models:Huawei P20Huawei P ... | 🔵 7.0 | ContentIdea KB |
| 12 | If your customer is reporting Managed Google Play applications are not auto-updating when enrolle... | There are many factors controlled by Google that can impact the app update be... | Managed Google Play app update overview The update experience for apps installed from managed Goo... | 🔵 7.0 | ContentIdea KB |
| 13 | Company Portal shows "We cannot update enrollment now. Try again later" notification when enrolli... | Outdated version of the Company Portal app on the device. | Update Company Portal to the latest version from the respective app store (Microsoft Store / App ... | 🔵 6.5 | MS Learn |
