---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Common TSG/Device Enrollment.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Device Enrollment Troubleshooting (21v Mooncake)

**Public Docs**: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/troubleshoot-device-enrollment-in-intune
**Wiki**: https://www.intunewiki.com/wiki/Troubleshooting_Enrollment_Failures

## Three Types of Enrollment Failures
1. **Client Errors** - account misconfig or unable to reach enrollment endpoint
2. **Service Errors** - server-side failures
3. **Pre/Post Enrollment Failure** - not visible in DeviceLifecycle log

## General Steps

### Step 1: Get Client Information
Use UserId and AccountContextId (AAD Tenant ID) as filter:

```kql
GetEnrollmentDetailsByTimeAndScaleUnitMooncake(ago(7d), now(), "CNPASU01")
| where Scenario == "DeviceEnrollment"
| where UserId == "<userId>"
| project env_time, ActivityId, SummarizedError, Provider, PlatformType, 
         EnrollmentType, AccountId, AccountContextId, DeviceId, UserId
```

**Kusto cluster**: intunecn.chinanorth2.kusto.chinacloudapi.cn / intune

### Step 2: Query Provider-Specific Logs
Use ActivityId from Step 1 in the appropriate provider log:

| Platform | Kusto Tables |
|----------|-------------|
| Windows (Win10, HoloLens, WinPhone) | EnrollmentSoapProvider, CommonSoapMessageProviderOperations, EnrollmentService |
| iOS/Mac (iPad, iOS, Mac) | IOSEnrollmentService |
| Android (Android, AfW) | CommonSoapMessageProviderOperations, EnrollmentService |
| Any | IntuneEvent, EnrollmentLibrary |

```kql
DeviceLifecycle 
| where env_time > ago(1d)
| where SourceNamespace == "IntuneCNP"
| where ActivityId == "<activityId>"
| extend PlatformType = GetDeviceLifecyclePlatform(platform)
| extend EnrollmentType = GetDeviceLifecycleEnrollmentTypeFriendlyName(platform, ['type'])
| project env_time, details, SourceNamespace, ActivityId, PlatformType, EnrollmentType, 
         EventId, failureReason, TaskName, sessionId, accountId, userId, deviceId
| order by env_time asc
```

### Step 3: Deep Dive with IntuneEvent
```kql
IntuneEvent
| where env_time > ago(1d)
| where ActivityId == '<activityId>'
| project env_time, ActivityId, RelatedActivityId, EventUniqueName, ColMetadata, 
         Col1, Col2, Col3, Col4, Col5, Col6, Message
| extend metakeys = todynamic(split(trim_end(';',ColMetadata),';'))
| extend metavalues = pack(tostring(metakeys[0]), Col1, tostring(metakeys[1]), Col2, 
         tostring(metakeys[2]), Col3, tostring(metakeys[3]), Col4, 
         tostring(metakeys[4]), Col5, tostring(metakeys[5]), Col6)
| project env_time, ActivityId, RelatedActivityId, EventUniqueName, metavalues
| order by env_time asc
```

### Important Notes
- If no DeviceLifecycle log appears 20 min after failure -> likely pre-enrollment failure
- Pre-enrollment failures: check network connectivity, certificate trust, enrollment endpoint reachability
- Scale units: CNPASU01 (sub: a1472f7d-...), CNBASU01 (sub: 3f7fcc0f-...)
