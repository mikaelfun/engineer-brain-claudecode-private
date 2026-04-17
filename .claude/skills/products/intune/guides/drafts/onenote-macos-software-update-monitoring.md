# macOS Software Update Monitoring via Intune (Kusto)

> Source: Case 2307240030003651 | MacOS Update
> Status: draft (pending SYNTHESIZE review)

## Primary Kusto Query

```kusto
IntuneEvent
| where env_time > ago(10d)
| where ComponentName == "ProcessMacOSSoftwareUpdateStatusMessageFromQmsIntoCosmosProvider"
| where EventUniqueName !in ("GetMessagesStop", "GetMessagesStarted",
        "TaskRunTimeBeforeExit", "BatchDeleteMessagesStop",
        "BatchOfMessagesProcessingComplete",
        "QMSProcessedMessagesDeletedSuccesfully",
        "QMSProxyStart", "QMSProxyStop", "BatchDeleteMessagesStart")
| where DeviceId == "<device-id>"
| project env_time, Pid, Tid, EventUniqueName, ColMetadata,
          Col1, Col2, Col3, Col4, Col5, Col6,
          Message, AccountId, DeviceId, UserId
| order by env_time asc
```

## Key EventUniqueNames

| Event | Explanation |
|---|---|
| `MessageProcessedSuccessfully` | Message was processed successfully |
| `DiscardedOldMessage` | Old/duplicate message received (should not happen) |
| `MacOSSoftwareUpdateReportPutSuccessfully` | Update status report stored in CosmosDB |

## Understanding Results

- One message per update category per device
- ProductKey format: `_MACOS_<version>` for OS updates, `MSU_UPDATE_<build>_patch_<version>` for supplemental updates
- State mapping defined in: `Updates\src\Services\Common\Models\SoftwareUpdate\CosmosDbEntity\MacOSSoftwareUpdateState.cs`
- Filter by `Pid` to see messages for a single background task instance

## Reference

- [IntuneWiki: MacOS Software Update](https://www.intunewiki.com/wiki/MacOS_Software_Update)
