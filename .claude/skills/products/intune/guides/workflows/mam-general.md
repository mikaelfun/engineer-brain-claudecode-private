# Intune MAM 通用策略与 App SDK — 排查工作流

**来源草稿**: (无)
**Kusto 引用**: mam-policy.md
**场景数**: 0
**生成日期**: 2026-04-07

---

## Kusto 查询参考

### 查询 1: MAM 账户维护状态查询

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
`[来源: mam-policy.md]`

### 查询 2: MAM 完整签入流程 (含 HttpSubsystem)

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
`[来源: mam-policy.md]`
