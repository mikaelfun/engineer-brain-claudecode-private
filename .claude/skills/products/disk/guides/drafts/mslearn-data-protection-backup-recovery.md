---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-storage/blobs/recovery/data-protection-backup-recovery
importDate: 2026-04-21
type: guide-draft
---

# Azure Storage Data Protection, Backup & Recovery Guide

## Data Protection Options

### Storage Account Protection
- Enable ARM lock to prevent storage account deletion
- Does NOT protect containers/blobs from deletion
- Supports ADLS Gen2

### Blob Container Protection
- **Immutability policies**: Protect container and blobs from all deletes/overwrites. Supports legal hold and time-based retention.
- **Container soft-delete**: Restore deleted container within retention period (min 7 days recommended). Does NOT restore individual blobs.

### Blob File Protection
- **Version-level immutability**: Protect blob version from deletion. NOT available for ADLS Gen2.
- **Blob soft-delete**: Restore deleted blob/version within retention period (min 7 days). Supports ADLS Gen2.
- **Blob snapshots**: Manual point-in-time save. If blob deleted, snapshots also deleted. ADLS Gen2 preview.
- **Blob versioning**: Auto-save previous version on overwrite. NOT available for ADLS Gen2.
- **Point-in-time restore**: Restore block blobs to previous state. Only block blobs, not containers/page/append blobs. NOT for ADLS Gen2.
- **Cross-account copy**: AzCopy or Azure Data Factory to second account.

## Recovery Scenarios

### Storage Account Recovery
- Recover deleted storage account from Azure portal (conditions apply)

### Blob Container Recovery
- Recover soft-deleted container (if soft-delete enabled and within retention)
- Recovery from second storage account (if replicated)

### Blob File Recovery
- Recover via blob versioning (select previous version, Make current version)
- Recover via blob soft-delete (manage and restore soft-deleted blobs)
- Recover via point-in-time restore (within retention interval)
- Recover via snapshots (if not deleted with parent blob)
