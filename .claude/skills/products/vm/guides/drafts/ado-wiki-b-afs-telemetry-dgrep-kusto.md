---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG 170 AFS Formatting Server Telemetry Events in DGrep_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FTSG%20170%20AFS%20Formatting%20Server%20Telemetry%20Events%20in%20DGrep_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG 170: AFS Formatting Server Telemetry Events in DGrep/Kusto

Guide on how to format telemetry in DGrep/Kusto for Azure File Sync troubleshooting.

## Client Query Using RegEx (DGrep)

Preferred method uses regular expressions to extract fields from event messages.

### Event ID 9102 (Sync Sessions)

- DGrep query: https://jarvis-west.dc.ad.msft.net/FDB39A04
- Geneva portal: https://portal.microsoftgeneva.com/s/B3F4AF23

**Key fields extracted from EventData (split by '!'):**

| Index | Field | Description |
|-------|-------|-------------|
| 0 | ServerEndpointName | Server endpoint name |
| 84 | SyncGroupName | Sync group name |
| 4 | SyncScenario | Sync scenario |
| 6 | SyncDirection | Upload/Download |
| 38 | HResult | Result code (convert to hex) |
| 8/10/12 | SyncFileCount/DirCount/TombstoneCount | Items to sync |
| 90/92/94 | AppliedFileCount/DirCount/TombstoneCount | Items applied |
| 16/18/82 | NamespaceFileCount/DirCount/TombstoneCount | Total namespace |
| 22 | PerItemErrorCount | Per-item errors |
| 34 | DurationSeconds | Session duration |
| 36 | CorrelationId | Correlation ID |
| 60/62 | TransferredFiles/Bytes | Transfer stats |
| 102 | PlatformFlags | Platform flags (check IsAuthUpload) |
| 114 | ReconcileReason | Reconcile reason |

**Current status per SyncGroup/Server/Direction:**
- DGrep query: https://jarvis-west.dc.ad.msft.net/F1702675

### Event ID 9302 (Tiering Sessions)

- DGrep query: https://jarvis-west.dc.ad.msft.net/C7B3E683

**Combined 9102 + 9302 health query:**
- DGrep query: https://jarvis-west.dc.ad.msft.net/9F1A8302

## Kusto Queries

### Sync Session Analysis (Event 9102)

```kusto
cluster('xfiles.westcentralus.kusto.windows.net').database('xsynctelemetrysf').ServerTelemetryEvents
| where SubscriptionId in ("<SUB ID>")
| where EventData contains "<Upload/Download>"
| where ServerId in ("<Server ID>")
| where ServerEventId == 9102
| where PreciseTimeStamp >= ago(7d)
| extend f = split(EventData, '!')
| extend ServerEndpointName = f[0]
| extend SyncGroupName = f[84]
| extend SyncDirection = f[6]
| extend HResult = tohex(toint(f[38]))
| extend SyncFileCount = tolong(f[8])
| extend PerItemErrorCount = tolong(f[22])
| extend DurationSeconds = tolong(f[34])
| extend AppliedFileCount = tolong(f[90])
| extend TransferredFiles = tolong(f[60])
| extend TransferredBytes = tolong(f[62])
| project PreciseTimeStamp, SyncDirection, HResult, SyncFileCount, AppliedFileCount, PerItemErrorCount, DurationSeconds, TransferredFiles, TransferredBytes, SyncGroupName, ServerEndpointName
| order by PreciseTimeStamp desc
```

### Tiering Session Analysis (Event 9302)

```kusto
cluster('xfiles.westcentralus.kusto.windows.net').database('xsynctelemetrysf').ServerTelemetryEvents
| where SubscriptionId in ("<SUB ID>")
| where ServerEventId == 9302
| where PreciseTimeStamp >= ago(7d)
| extend f = split(EventData, '!')
| extend SyncGroupName = f[86]
| extend ServerEndpointName = f[0]
| extend HResult = tohex(toint(f[40]))
| extend TotalTieredFileCount = tolong(f[6])
| extend TotalTieredBytes = tolong(f[8])
| extend VolumeFreeSpacePercent = toreal(f[10])
| extend DurationSeconds = tolong(f[38])
| project PreciseTimeStamp, SyncGroupName, ServerEndpointName, HResult, TotalTieredFileCount, TotalTieredBytes, VolumeFreeSpacePercent, DurationSeconds
| order by PreciseTimeStamp desc
```

### Per-Item Error Query (Event 9116)

```kusto
cluster('xfiles.westcentralus.kusto.windows.net').database('xsynctelemetrysf').ServerTelemetryEvents
| where SubscriptionId in ("<SUB ID>")
| where ServerEventId == 9116
| where PreciseTimeStamp >= ago(7d)
| extend f = split(EventData, '!')
| extend FileName = f[0]
| extend HResult = tohex(toint(f[10]))
| extend SyncDirection = f[4]
| extend SyncGroupName = f[20]
| project PreciseTimeStamp, FileName, HResult, SyncDirection, SyncGroupName
| order by PreciseTimeStamp desc
```

### Cloud-side correlation

Correlate server-side 9102 with cloud-side session views using SyncProcessChangeBatch table once you have the ShareID.

## Notes

- All DGrep shared queries are under "Shared Queries -> TSGs"
- Queries may be updated if underlying events change
- For complete field reference, see the original wiki page
