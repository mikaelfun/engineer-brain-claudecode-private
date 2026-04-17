# Intune macOS 软件更新 / DDM — 排查工作流

**来源草稿**: onenote-macos-ios-software-update-ddm.md, onenote-macos-software-update-monitoring.md, onenote-macos-software-update-troubleshooting.md
**Kusto 引用**: (无)
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: iOS/iPadOS
> 来源: onenote-macos-ios-software-update-ddm.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Declarative software updates (Settings catalog > DDM > Software Update)
2. Update policies (Devices > Update policies for iOS/iPadOS)

## Scenario 2: macOS
> 来源: onenote-macos-ios-software-update-ddm.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Declarative software updates (Settings catalog > DDM > Software Update)
2. Update policies (Devices > Update policies for macOS)
3. Software updates (Settings catalog > System Updates > Software Update)

## MDM Software Update Command Sequence

1. `ScheduleOSUpdateScanCommand` — find available updates
2. `AvailableOSUpdatesCommand` — get update list
3. `ScheduleOSUpdateCommand` — download selected update
4. `OSUpdateStatusCommand` — poll status until `IsDownloaded`
5. `ScheduleOSUpdateCommand` (install) — trigger installation

## Scenario 3: Known Limitations
> 来源: onenote-macos-ios-software-update-ddm.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **macOS 13**: `InstallLater` action is NOT supported (also no DownloadOnly, NotifyOnly, InstallForceRestart)
- **Priority key**: Only applies to minor version updates (e.g., macOS 12.x → 12.y). Do NOT set Priority for major updates.
- `InstallLater` in Apple MDM only applies to minor version updates per Apple documentation.

## Scenario 4: Console Log Keywords
> 来源: onenote-macos-ios-software-update-ddm.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Look for `softwareupdated` process entries:
```
SUOSUMobileSoftwareUpdateController: This system is managed and a PMV was set
SUOSUScheduler: ARMED (mode=1)
SUOSUTonightObserver: Predicted start date / end date
```

## References
- [Declarative software updates | Microsoft Learn](https://learn.microsoft.com/en-us/mem/intune/protect/software-updates-declarative-ios-macos)
- [ScheduleOSUpdateCommand | Apple Developer](https://developer.apple.com/documentation/devicemanagement/scheduleosupdatecommand/command/updatesitem)
- [Integrating Declarative Management | Apple Developer](https://developer.apple.com/documentation/devicemanagement/integrating_declarative_management)

---

## Kusto 查询参考

### Kusto Query

```kql
DDMHighLevelCheckin("{{deviceid}}")
```
`[来源: onenote-macos-ios-software-update-ddm.md]`

### Primary Kusto Query

```kql
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
`[来源: onenote-macos-software-update-monitoring.md]`

### Kusto Query - Plugin Command Flow

```kql
DeviceManagementProvider
| where env_time > ago(3d)
| where ActivityId == "{deviceId}"
| project env_time, message, osVersion, commandType, commandResultStatus, accountId, userId
| where message startswith "iOSPlugin" or message contains "MacOS"
    or message contains "UpdateResults" or message contains "OSUpdateStatus"
    or commandType != "" or commandResultStatus != ""
| order by env_time asc
```
`[来源: onenote-macos-software-update-troubleshooting.md]`

---

## 判断逻辑参考

### Key EventUniqueNames

| Event | Explanation |
|---|---|
| `MessageProcessedSuccessfully` | Message was processed successfully |
| `DiscardedOldMessage` | Old/duplicate message received (should not happen) |
| `MacOSSoftwareUpdateReportPutSuccessfully` | Update status report stored in CosmosDB |

### Event Name Reference

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

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
