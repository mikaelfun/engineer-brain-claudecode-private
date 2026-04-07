# macOS Software Update Troubleshooting Guide

> Source: OneNote - Mooncake POD Support Notebook / Intune / MacOS TSG / MacOS Update

## Kusto Query - QMS Background Task Processing

Checks how the background task processes software update status messages from QMS into CosmosDB.

```kusto
IntuneEvent
| where env_time > ago(10d)
| where ComponentName == "ProcessMacOSSoftwareUpdateStatusMessageFromQmsIntoCosmosProvider"
| where EventUniqueName !in ("GetMessagesStop", "GetMessagesStarted",
    "TaskRunTimeBeforeExit", "BatchDeleteMessagesStop",
    "BatchOfMessagesProcessingComplete", "QMSProcessedMessagesDeletedSuccesfully",
    "QMSProxyStart", "QMSProxyStop", "BatchDeleteMessagesStart")
| where DeviceId == "{deviceId}"
| project env_time, Pid, Tid, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message, AccountId, DeviceId, UserId
| order by env_time asc
```

## Event Name Reference

| Event | Explanation |
|-------|-------------|
| MessageProcessedSuccessfully | Message processed successfully |
| DiscardedOldMessage | Old message already processed (should never happen) |
| QMSProcessedMessagesDeletedSuccesfully | QMS messages deleted after processing |
| BatchOfMessagesProcessingComplete | Batch processing complete |
| SearchMacOSSoftwareUpdateReportsException | Exception searching CosmosDB |
| NoReportsToPut | No updates to store - safe to discard message |
| PutResultsNotConsistent | PUT count mismatch - something is wrong |
| MacOSSoftwareUpdateReportPutSuccessfully | Report PUT successfully |
| MacOSSoftwareUpdateReportPutException | Error PUTting report to CosmosDB |
| MacOSSoftwareUpdateReportNotMatchingKeyUpdateToSuccessState | No QMS data for stored report -> update to success |
| MacOSSoftwareUpdateReportNotMatchingKeyOldReport | QMS message older than stored report (should not happen) |
| MacOSSoftwareUpdateReportMatchingKeyNewReport | New QMS data for stored report -> update |
| MacOSSoftwareUpdateReportMatchingKeyOldReport | QMS message older than stored report -> skip |
| MacOSSoftwareUpdateReportErrorKey | CosmosDB returned report with mismatched key (should never happen) |
| PutMacOSSoftwareUpdateReportsETagNotMatchException | ETag mismatch on PUT |
| PutMacOSSoftwareUpdateReportsException | Generic PUT exception |

## Kusto Query - Plugin Command Flow

Shows how the plugin processes the policy and issues MDM commands.

```kusto
DeviceManagementProvider
| where env_time > ago(3d)
| where ActivityId == "{deviceId}"
| project env_time, message, osVersion, commandType, commandResultStatus, accountId, userId
| where message startswith "iOSPlugin" or message contains "MacOS"
    or message contains "UpdateResults" or message contains "OSUpdateStatus"
    or commandType != "" or commandResultStatus != ""
| order by env_time asc
```

## MDM Command Flow

1. **AvailableOSUpdates** command sent -> device responds with available updates count
2. **OSUpdateStatus** command sent -> device responds with current update status
3. Background task processes QMS messages and updates CosmosDB reports

## State Mapping

State integer values map to names defined in:
`Updates\src\Services\Common\Models\SoftwareUpdate\CosmosDbEntity\MacOSSoftwareUpdateState.cs`

## Reference

- [MacOS Software Update - IntuneWiki](https://www.intunewiki.com/wiki/MacOS_Software_Update)
