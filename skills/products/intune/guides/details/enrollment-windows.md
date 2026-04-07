# Intune Windows 注册与 Auto-Enrollment — 综合排查指南

**条目数**: 11 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**Kusto 引用**: enrollment.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (3 条)

- **solution_conflict** (high): intune-contentidea-kb-180 vs intune-mslearn-122 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-contentidea-kb-180 vs intune-mslearn-134 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-contentidea-kb-369 vs intune-mslearn-122 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Kusto 诊断查询

#### enrollment.md
`[工具: Kusto skill — enrollment.md]`

```kql
IntuneOperation
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where TenantId == '{tenantId}'
| where operationName contains "Enrollment"
| project env_time, AccountId, DeviceId, UserId, operationName, resultType, resultDescription
| order by env_time desc
```

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';
let accountid = '{accountId}';

DeviceLifecycle
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where deviceId contains deviceid
| project env_time, deviceId, userId, tenantID, accountId, ActivityId, relatedActivityId2
| order by env_time desc
```

```kql
let _deviceId = '{deviceId}';
let _tenantId = '{tenantId}';
let _maxcount = int(5000);

DeviceLifecycle
| where tenantId <> ''
| where deviceId == _deviceId or userId == _deviceId
| extend TypeName = case(
    type==0, 'Unknown', type==1, 'User Personal', type==2, 'User Personal with AAD',
    type==3, 'User Corporate', type==4, 'User Corporate with AAD', type==5, 'Userless Corporate',
    type==10, 'AutoEnrollment', type==12, 'On Premise Comanaged',
    type==13, 'AutoPilot Azure Domain Joined with profile', tostring(type))
| extend EventName = case(
    EventId==46801, 'EnrollmentAddDeviceEvent', EventId==46804, 'EnrollmentAddDeviceFailedEvent',
    EventId==46806, 'EnrollmentStartEvent', EventId==46802, 'Renewal succeeded',
    EventId==46821, 'Registration succeeded', EventId==46822, 'Device removed',
    EventId==46825, 'Device checked in', tostring(EventId))
| extend PlatformName = case(
    platform==3, 'Windows 10', platform==7, 'iPhone', platform==8, 'iPad',
    platform==11, 'Android', platform==14, 'Android for Work', tostring(platform))
| project env_time, EventId, EventName, TypeName, PlatformName, deviceId, userId, accountId,
    oldManagementState, newManagementState, oldRegistrationState, newRegistrationState, details
| limit _maxcount
```

```kql
IOSEnrollmentService 
| where env_time > ago(30d)
| where ActivityId == '{deviceId}'
| project env_time, userId, callerMethod, message, deviceTypeAsString, 
    serialNumber, siteCode, ActivityId, relatedActivityId2
```

```kql
let deviceid = '{deviceId}';
let starttime = datetime({startTime});
let endtime = datetime({endTime});

DeviceManagementProvider
| where env_time between (starttime..endtime)
| where ActivityId == deviceid or userId == deviceid
| project env_time, deviceId, ActivityId, message, EventId, userId, TaskName
| order by env_time
```

```kql
DeviceManagementProvider
| where env_time between (datetime({startTime}) .. datetime({endTime}))
| where ActivityId =~ '{deviceId}'
| where message contains "ending management session" or message contains "starting management session"
| project env_time, message, EventMessage, EventId, ActivityId, relatedActivityId2, 
    actionName, deviceId, accountId
| sort by env_time asc
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Microsoft Intune Enrollment service principal (AppId d4ebce55-015a-49b5-a083-c84d1797ae8c) missin... | The 'Microsoft Intune Enrollment' enterprise application was accidentally del... | 1) Go to Azure portal > Azure Active Directory > MDM > select 'Microsoft Intune Enrollment' > Del... | 🟢 9.0 | OneNote |
| 2 | Windows enrollment fails with error 8018000a The device is already enrolled. Another user has alr... | A different user account has already enrolled the device in Intune or joined ... | Sign in with the other account that enrolled/joined the device. Go to Settings > Accounts > Work ... | 🔵 7.5 | MS Learn |
| 3 | Auto MDM Enroll: Failed with error 0x8018002b via Group Policy. Event ID 76 logged in DeviceManag... | UPN contains unverified or non-routable domain suffix (e.g., .local), or MDM ... | For UPN issue: change user UPN suffix to a valid verified domain in AD Users and Computers, then ... | 🔵 7.5 | MS Learn |
| 4 | Windows 10 GP-based auto-enrollment fails with 0x80180002b. dsregcmd /status shows AzureAdPrt=NO ... | Device previously joined to different Entra tenant without proper unjoin. Sta... | dsregcmd /leave, delete device in Entra, unjoin from AD, delete device from DC, rejoin AD, delta ... | 🔵 7.5 | MS Learn |
| 5 | After configuring OOBE enrollment for a Surface Hub device, enrollment appears to succeed althoug... | Surface Hubs cannot be managed via Auto Enrollment/Azure AD joins. The proces... | To resolve this problem, be sure the Surface Hub users are not being targeted for being managed b... | 🔵 7.0 | ContentIdea KB |
| 6 | When attempting to join a Windows 10 PC to Azure Active Directory, the join fails with error: Som... | This can occur if both of the following conditions exist: MDM auto-enrollment... | Either disable MDM auto-enrollment in Azure, or uninstall the PC agent or SCCM client agent. Once... | 🔵 7.0 | ContentIdea KB |
| 7 | After configuring hybrid Azure AD per https://docs.microsoft.com/en-us/azure/active-directory/dev... | This can occur for two reasons:1. The GPO for auto enrollment per https://doc... | To work around this problem, either upgrade the client PCs to Windows 10 build 1709 and implement... | 🔵 7.0 | ContentIdea KB |
| 8 | When attempting to enroll a Windows 10 device into hybrid mobile device management with SCCM and ... | This error will occur if Windows enrollment has been disabled for the organiz... | To resolve this problem, enable Windows enrollment as detailed below:    In your SCCM console, go... | 🔵 7.0 | ContentIdea KB |
| 9 | After configuring a Device Restriction policy that sets "Manual Unenrollment" to "Block" per the ... | This can occur if the Windows computer is Azure AD joined and MDM auto-enroll... | If you wish you use this policy setting, you will need to either disable auto-enrollment and/or m... | 🔵 7.0 | ContentIdea KB |
| 10 | GPO-based auto-enrollment into Intune fails for co-managed hybrid AAD joined devices; dsregcmd /s... | User UPN suffix in Active Directory is non-routable (e.g., .local domain), pr... | In Active Directory Users and Computers open user properties Account tab, modify UPN suffix from ... | 🔵 7.0 | OneNote |
| 11 | Co-management: Device sync fails after auto-enrollment. Error 0xcaa2000c interaction_required. | MFA or CA policies requiring MFA applied to all cloud apps block user token. | Disable per-user MFA, use Trusted IPs, or exclude Intune app from CA policies requiring MFA. | 🔵 6.5 | MS Learn |
