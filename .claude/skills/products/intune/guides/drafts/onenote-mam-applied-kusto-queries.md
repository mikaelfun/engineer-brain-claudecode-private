# MAM Applied — Kusto Diagnostic Queries and UnenrollReason Codes

> Source: OneNote — MAM Applied
> Status: draft (pending SYNTHESIZE)

## MAM Checkin Flow Query (21v Compatible)

AmsActivityForUser() and AMS() functions are **NOT available in 21v Mooncake**. Use these alternative queries:

### Step 1: Get MAM ActivityIds for a User

```kql
let starttime = datetime(YYYY-MM-DD HH:MM:SS);
let endtime = datetime(YYYY-MM-DD HH:MM:SS);
let userid = '<USER_ID>';
let activityIds = IntuneEvent
| where env_time between (starttime..endtime)
| where UserId == userid
| where ServiceName startswith "StatelessApplicationManagementService"
| where EventUniqueName == "IsAccountInMaintenance"
| project env_time, SourceNamespace, env_cloud_name, AccountId, UserId, ActivityId, cV
| summarize makeset(ActivityId, 10000);
```

### Step 2: Get MAM Policy State (GetAction)

```kql
IntuneEvent
| where env_time between (starttime..endtime)
| where ActivityId in (activityIds)
| where ServiceName == "StatelessApplicationManagementService"
| where EventUniqueName == "GetAction"
| where ColMetadata contains "AppInstanceId;AadDeviceId;UpdateFlags;PolicyState"
| project env_time, AccountId, UserId, ActivityId,
    AppInstanceId = Col1, AadDeviceId = Col2,
    UpdateFlags = Col3, PolicyState = Col4
```

### Step 3: Full MAM Flow via HttpSubsystem

```kql
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
// ... extract AppId, Os, DeviceId, AppVersion etc. from URL query parameters
```

## MAM UnenrollReason Codes

| ReasonCode | Name | Description |
|---|---|---|
| 300 | CMAREnrollmentTriggerAppUnEnroll | App calls un-enroll |
| 301 | CMAREnrollmentTriggerAppUnEnrollLegacy | Legacy call to un-enroll |
| 302 | CMAREnrollmentTriggerAppUnEnrollLegacySwitchUser | Legacy un-enroll and switch device user |
| 303 | CMAREnrollmentTriggerOfflineWipe | Un-enroll caused by offline wipe |
| 304 | CMAREnrollmentTriggerWipeCommand | Un-enroll caused by wipe command |
| 305 | CMAREnrollmentTriggerDifferentDeviceUser | New device user account |
| 306 | CMAREnrollmentTriggerDifferentMdmUser | Different MDM user account |
| 307 | CMAREnrollmentTriggerSwitchUser | User selected to change primary account |
| 308 | CMAREnrollmentTriggerExceededMaxPinRetryWipe | Wipe due to exceeded max PIN attempts |
| 309 | CMAREnrollmentTriggerDeviceNonCompliant | Wipe due to jailbroken device |
| 310 | CMAREnrollmentTriggerBlockedOSVersion | Wipe due to blocked OS version |
| 311 | CMAREnrollmentTriggerBlockedAppVersion | Wipe due to blocked app version |
| 312 | CMAREnrollmentTriggerBlockedSDKVersion | Wipe due to blocked SDK version |
| 313 | CMAREnrollmentTriggerBlockedDeviceModel | Wipe due to blocked device model |

## AppFriendlyName Mapping (Key Apps)

| AppId pattern | Friendly Name | Tier |
|---|---|---|
| com.microsoft.Office.Outlook | Outlook | 1 |
| com.microsoft.skype.teams / com.microsoft.teams | Teams | 1 |
| com.microsoft.Office.Excel | Excel | 1 |
| com.microsoft.office.word | Word | 1 |
| com.microsoft.sharepoint | SharePoint | 1 |
| skydrive | OneDrive | 1 |
| emmx / msedge | Edge | 1 |
| com.microsoft.powerbi | PowerBI | 2 |
| com.microsoft.dynamics | Dynamics | 2 |
| yammer / wefwef | Yammer | 2 |

## Notes

- AppTier 1 = Core M365 apps, 2 = Secondary, 3 = Utility, 4 = LOB/3rd party
- AppEnvironment: 'prod' for production, 'dogfood'/'dev' for internal testing
- DeviceHealth: 0 = Healthy, 1 = Unhealthy (jailbroken/rooted)
