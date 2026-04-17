---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Endpoint Security/Dual-Enrollment (MMPC, MDE Attach, EPM)"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FDual-Enrollment%20(MMPC%2C%20MDE%20Attach%2C%20EPM)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Dual Enrollment Troubleshooting (MMPC, MDE Attach, EPM)

Dual enrollment enables MDE Attach, EPM, and Windows Expedited Updates.

## Troubleshooting Steps
1. Collect ODC logs
2. Open Event Viewer > Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin
3. Search for "dual" or "enroll" to find errors

## Finding MMPC Device ID
- Registry: `HKLM\Software\Microsoft\Enrollments` > DMClient key with "Microsoft Device Management" folder > EntDMID = MMPC Device ID

## Kusto Queries

### Find MMPC DeviceID from Intune DeviceID
```kql
let SearchId = "<AccountID>";
cluster('intune.kusto.windows.net').database('Intune').IntuneEvent
| where env_time > ago(3d)
| where EventUniqueName == "DeviceIdMappingCacheAsideBehavior:StoreGetAsync:FoundDeviceIdMapping"
| where Col3 has SearchId
| parse Col3 with "IntuneAccountId:"AccountId","*"AADDeviceId:"AADDeviceId", IntuneDeviceId:"IntuneDeviceId", MMPCDeviceId:"MMPCDeviceId","*
| summarize max(UserId) by AADDeviceId, IntuneDeviceId, MMPCDeviceId, AccountId, ContextId
```

### Check MMPC Dual Enrollment Activity
```kql
cluster('mmpc.northcentralus.kusto.windows.net').database('mmpc').IntuneEvent
| where env_time > ago(2d)
| where ServiceName in ("DeviceCheckinFEService", "DeviceCheckinMTService")
| where ScenarioType !startswith "BackgroundTask"
| where * has "<MMPCDeviceId>"
| project env_time, ServiceName, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, TenantId = AccountId, EmmId = ContextId, DeviceId, UserId, PayLoadId, ScenarioType, ScenarioId, ScenarioInstanceId, SessionId, cV, ActivityId, RelatedActivityId
```

### Drill Down with ActivityId
```kql
cluster('mmpc.northcentralus.kusto.windows.net').database('mmpc').IntuneEvent
| where env_time > ago(2d)
| where ServiceName in ("DeviceCheckinFEService", "DeviceCheckinMTService")
| where ScenarioType !startswith "BackgroundTask"
| where ActivityId == "<ActivityId>"
| project env_time, ServiceName, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, TenantId = AccountId
```
