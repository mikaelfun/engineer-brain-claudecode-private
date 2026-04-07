---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/How to investigate sync performance and progress_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FHow%20to%20investigate%20sync%20performance%20and%20progress_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Investigate Sync Performance and Progress

## Tools

1. **Azure File Sync Dashboard** - Primary tool for monitoring
2. **9102 Telemetry Events** - Server endpoint sync session details
3. **CounterWebRequestInfo** - Azure-side cloud operations
4. **7005/7006 Events** - Per-batch detailed information

## Investigating from 9102 Events

- **DataTransfer** value: if low (<1MBps), check TransferredBytes - if >1MB then server network bandwidth is low
- **Upload sync**: compare PutChangeBatchDuration + PrepareSyncBatchDataDuration vs DurationSeconds. If >50%, cloud operations are slow
- **Download sync**: compare PutSyncKnowledgeDuration + GetChangeBatchDuration vs DurationSeconds. If >50%, cloud operations are slow
- **OtherOperationDuration** vs DurationSeconds >50%: local operations are slow (disk or CPU)

## Performance Tracking Queries (Jarvis)

### Files/sec tracking
- Use 9302 events, group by 10-min windows
- Calculate FilesSynced per window, derive FilesPerSecond

### MBps/ETA tracking
- Use 9302 events, group by 12-hour windows per CorrelationId
- Calculate BytesPerSecond, MBps, MBPerDay, BytesLeft, BYTES_ETA
- Requires customer subscription ID and registered AFS Server ID
