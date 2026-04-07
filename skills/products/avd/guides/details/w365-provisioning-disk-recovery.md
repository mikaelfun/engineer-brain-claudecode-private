# AVD W365 Provisioning 配置 - disk-recovery - Issue Details

**Entries**: 3 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Cloud PC VM disk deleted due to service issue, need to recover managed disk
- **ID**: `avd-ado-wiki-390`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Service issue caused active deletion of Cloud PC VM disk
- **Solution**: Check disk soft-delete status via Kusto (DiskRPResourceLifecycleEvent). Soft-deleted (disk >10 days old, deleted <96h ago): file IcM to Support/APTS. Hard-deleted: check Jarvis IsRecoverable flag, if true file IcM to Xstore/Triage + GC on-call. Ultra Disk not supported.
- **Tags**: cloud-pc, disk-recovery, soft-delete, kusto, icm

### 2. Cloud PC VM disk deleted due to service issue - need to recover managed disk
- **ID**: `avd-ado-wiki-348`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: Service issue caused active deletion of Cloud PC; managed disk may be recoverable via soft delete (if disk created >10 days ago and deleted <96 hours ago) or hard delete recovery (check IsRecoverable flag)
- **Solution**: For soft delete: file IcM to Support/APTS team. For hard delete: check IsRecoverable via Jarvis Action; if true, file IcM to Xstore/Triage team and engage GC on-call. Ultra Disk not supported for soft delete recovery.
- **Tags**: cloud-pc, disk-recovery, soft-delete, hard-delete, w365, icm

### 3. Cloud PC managed disk deleted due to service issue (active deletion), need to recover disk data
- **ID**: `avd-ado-wiki-357`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: Service issue caused active deletion of Cloud PC; disk may be in soft-deleted state (created >10 days, deleted <96 hours ago) or hard-deleted state
- **Solution**: For soft-deleted disks: verify via DiskRPResourceLifecycleEvent Kusto query, file IcM to Support/APTS team. For hard-deleted: check Jarvis Get Blob Recovery Info IsRecoverable flag, if true file IcM to Xstore/Triage + engage GC on-call. Ultra Disk not supported for soft delete recovery.
- **Tags**: cloud-pc, disk-recovery, soft-delete, hard-delete, managed-disk, icm
