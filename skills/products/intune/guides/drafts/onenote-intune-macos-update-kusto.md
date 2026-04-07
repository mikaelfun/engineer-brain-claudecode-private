---
source: onenote
sourceRef: "MCVKB/Intune/Kusto/MacOS Update.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune macOS Software Update — Kusto Troubleshooting Guide

## Query 1: QMS Processing Status

Track macOS software update status messages processed by Intune backend:

```kql
IntuneEvent
| where env_time > ago(10d)
| where ComponentName == "ProcessMacOSSoftwareUpdateStatusMessageFromQmsIntoCosmosProvider"
| where EventUniqueName !in ("GetMessagesStop", "GetMessagesStarted",
    "TaskRunTimeBeforeExit", "BatchDeleteMessagesStop",
    "BatchOfMessagesProcessedComplete", "QMSProcessedMessagesDeletedSuccesfully",
    "QMSProxyStart", "QMSProxyStop", "BatchDeleteMessagesStart")
| where DeviceId == "{deviceId}"
| project env_time, Pid, Tid, EventUniqueName, ColMetadata, Col1, Col2, Col3,
          Col4, Col5, Col6, Message, AccountId, DeviceId, UserId 
| order by env_time asc
```

**Key indicators**:
- `EventUniqueName == "MessageProcessedSuccessfully"` → update processed OK
- Filter by `Pid` to see messages for a single background task instance
- 1 message per update category; individual update data visible in Col fields
- State int mappings: see `Updates\src\Services\Common\Models\SoftwareUpdate\CosmosDbEntity\MacOSSoftwareUpdateState.cs`

## Query 2: Device Plugin Actions

Check what update commands were sent to the device:

```kql
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "{deviceId}"
| project env_time, message, osVersion, commandType, commandResultStatus, accountId, userId 
| where message startswith "iOSPlugin" or message contains "MacOS"
    or message contains "UpdateResults" or message contains "OSUpdateStatus"
    or commandType != "" or commandResultStatus != ""
| order by env_time asc
```

**Interpretation**:
- Log lines with `iOSPlugin[CreateOrUpdate]: Scheduling [{ProductKey}] to be updated with installAction [Default]` → updates being scheduled, likely Apple-side issue if no errors follow
- Cross-reference `ProductKey` between both queries to correlate QMS processing with device plugin actions
- If reporting seems wrong, check plugin logs and correlate ProductKeys
