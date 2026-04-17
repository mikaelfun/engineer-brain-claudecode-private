# AVD W365 Provisioning 配置 - disk-recovery - Quick Reference

**Entries**: 3 | **21V**: partial
**Keywords**: cloud-pc, disk-recovery, hard-delete, icm, kusto, managed-disk, soft-delete
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Cloud PC VM disk deleted due to service issue, need to recover managed disk | Service issue caused active deletion of Cloud PC VM disk | Check disk soft-delete status via Kusto (DiskRPResourceLifecycleEvent). Soft-del... | 🔵 7.5 | ADO Wiki |
| 2 | Cloud PC VM disk deleted due to service issue - need to recover managed disk | Service issue caused active deletion of Cloud PC; managed disk may be recoverabl... | For soft delete: file IcM to Support/APTS team. For hard delete: check IsRecover... | 🔵 6.0 | ADO Wiki |
| 3 | Cloud PC managed disk deleted due to service issue (active deletion), need to re... | Service issue caused active deletion of Cloud PC; disk may be in soft-deleted st... | For soft-deleted disks: verify via DiskRPResourceLifecycleEvent Kusto query, fil... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: Service issue caused active deletion of Cloud PC V `[Source: ADO Wiki]`
2. Check: Service issue caused active deletion of Cloud PC; `[Source: ADO Wiki]`
