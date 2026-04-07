# AVD W365 Provisioning 配置 - provisioning-policy - Quick Reference

**Entries**: 9 | **21V**: partial
**Keywords**: active-deletion, cloud-pc, cpcd, deletion, deprovisioning, gbl, grace-period, license
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Cloud PC enters grace period and gets reprovisioned after provisioning policy mo... | When GBL resize uses a single group for both licensing and provisioning policy a... | Use distinct/separate groups for licensing and provisioning policy assignment du... | 🔵 7.5 | ADO Wiki |
| 2 | Cloud PC deleted/deprovisioned unexpectedly, end users lose access to original d... | W365 license or provisioning policy was removed or changed, triggering 7-day gra... | Verify both W365 license and provisioning policy are assigned to user. Remediate... | 🔵 7.5 | ADO Wiki |
| 3 | Cloud PC is deleted/deprovisioned and end users lose access; device enters grace... | Provisioning policy removed or changed for the user, or W365 license removed/cha... | Use CPCD (Cloud PC Diagnostics) to investigate: 1) Check Device Diagnostic tab f... | 🔵 7.5 | ADO Wiki |
| 4 | Cloud PC unexpectedly reprovisioned when admin changes provisioning policy or ad... | Adding user to a secondary provisioning policy or modifying the assigned provisi... | Advise customer not to remove or change provisioning policy assignment once Clou... | 🔵 7.5 | ADO Wiki |
| 5 | Cloud PC actively deleted/deprovisioned - users lose access to original device a... | W365 license or Provisioning Policy was removed from user, triggering 7-day Grac... | Use CPCD Device Diagnostic to check LifecycleStatus and VM operations for Resour... | 🔵 7.5 | ADO Wiki |
| 6 | Cloud PC(s) actively deleted/deprovisioned after 7-day grace period, end users l... | W365 license removed/unassigned from user OR provisioning policy removed/changed... | Use CPCD (Cloud PC Diagnostics) to investigate: 1) Device Diagnostic tab - provi... | 🔵 7.5 | ADO Wiki |
| 7 | Cloud PC deleted/deprovisioned after license or provisioning policy removed, use... | License removed or provisioning policy unassigned triggers 7-day grace period th... | Use CPCD Device Diagnostic to check LifecycleStatus and VM operations for DELETE... | 🔵 7.5 | ADO Wiki |
| 8 | Cloud PC deleted/deprovisioned unexpectedly after grace period - active deletion | W365 license or provisioning policy was removed/changed, triggering 7-day grace ... | Use CPCD Device Diagnostic and Action Diagnostic tabs to investigate timeline; a... | 🔵 6.0 | ADO Wiki |
| 9 | Windows 365 Migration API importSnapshot fails with error MissingProvisionPolicy... | The user specified in assignedUserId does not have a provisioning policy assigne... | Assign a provisioning policy to the target user before calling the importSnapsho... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: When GBL resize uses a single group for both licen `[Source: ADO Wiki]`
2. Check: W365 license or provisioning policy was removed or `[Source: ADO Wiki]`
3. Check: Provisioning policy removed or changed for the use `[Source: ADO Wiki]`
4. Check: Adding user to a secondary provisioning policy or `[Source: ADO Wiki]`
5. Check: W365 license or Provisioning Policy was removed fr `[Source: ADO Wiki]`
