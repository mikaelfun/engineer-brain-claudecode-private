---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG 349 AFS Sync Progress and Initial Sync_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FTSGs%2FTSG%20349%20AFS%20Sync%20Progress%20and%20Initial%20Sync_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG 349: AFS Sync Progress and Initial Sync

## Summary

Understanding sync progress in various scenarios, particularly during initial sync.

## Initial Sync Sequence

### Step 1: Initial Cloud Enumeration
- Cloud share finishes initial enumeration (tracked in "Cloud Change Enumeration" section)
- Can be long-running and blocks further steps
- Sync sessions may report `ECS_E_REPLICA_NOT_READY` or `ECS_E_REPLICA_RECONCILIATION_NEEDED` during this phase

### Step 2: "Fast DR" Download Sync Session (FullGhostedSync)
- All cloud content downloaded to server as tiered files
- Upload sessions won't run during this phase

### Step 3: Initial Server Enumeration
- Server scans for local content (tracked via 9125/9100 events)
- Long-running but does NOT block step 4

### Step 4: "Initial Upload" Sync Sessions (InitialUploadSync)
- Runs in parallel with step 3
- Multiple InitialUploadSync sessions may occur
- Initial upload is complete when first `RegularSync` upload session appears

### Step 5: All Sync is Incremental (RegularSync)
- All sessions marked as `RegularSync` in both upload/download directions

## Key Telemetry Events

### 9102 - Sync Complete Event
Logged at end of each sync session. Key fields:
- **SyncScenario**: FullGhostedSync / InitialUploadSync / RegularSync / SnapshotSync
- **SyncDirection**: Upload / Download
- **HResult**: 0 = success. Nonzero = failure (OK if making progress)
- **AppliedFileCount/AppliedDirCount/AppliedSizeBytes**: Content successfully applied (progress measure)
- **PerItemErrorCount**: Failed files (if high, check 9121 events)
- **CorrelationId**: Session identity for drill-down queries

### 9302 - Sync Progress Event
Logged during sync sessions (per batch, ~1000 files or 1GB):
- **AppliedItemCount/AppliedBytes**: Current progress
- **TotalItemCount/TotalBytes**: Target totals
- **AreTotalCountsFinal**: True when totals are fully calculated

**Note**: TotalBytes represents file content size, NOT network transfer. For actual data transfer, use 7005/7006 events.

## Cloud Change Enumeration
- Table: `AFSCloudChangeDetectionTaskInfo` filtered on ShareId
- `TaskSucceeded` = last scan completed
- Progress: `SyncChangeEnumerationProgress` table (`dirsScannedAcrossCheckpoints`, `filesScannedAcrossCheckpoints`)

## Server Change Enumeration
- **9125**: Enumeration begun
- **9100**: Enumeration complete (HResult: 0 = success)
- For large namespaces, multiple begin events (checkpointing)
