# AVD W365 Provisioning 配置 - provisioning-policy - Issue Details

**Entries**: 9 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Cloud PC enters grace period and gets reprovisioned after provisioning policy modification when usin...
- **ID**: `avd-ado-wiki-022`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: When GBL resize uses a single group for both licensing and provisioning policy assignment, the user is moved to a target group that belongs to a different provisioning policy. Since policy ID changes are not checked during Pending Resize, the CPC finishes resizing but remains mapped to the wrong policy. Any subsequent change to that second policy triggers policy re-evaluation → grace period → reprovisioning.
- **Solution**: Use distinct/separate groups for licensing and provisioning policy assignment during GBL resize. To diagnose: 1) Check CPCD CPC Availability for DeviceID to see Original vs Current Policy ID divergence. 2) Check CPCD Tenant Diagnostic provisioning policy tracking for group assignments. 3) Verify in ASC license changes (old SKU deleted, new SKU enabled) matching resize date. Reference: https://learn.microsoft.com/en-us/windows-365/enterprise/resize-cloud-pc#resize-a-single-cloud-pc-provisioned-with-a-group-based-license
- **Tags**: grace-period, reprovisioning, GBL, resize, provisioning-policy, windows-365

### 2. Cloud PC deleted/deprovisioned unexpectedly, end users lose access to original device, new Cloud PC ...
- **ID**: `avd-ado-wiki-342`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: W365 license or provisioning policy was removed or changed, triggering 7-day grace period followed by active deletion
- **Solution**: Verify both W365 license and provisioning policy are assigned to user. Remediate within 7-day grace period. Use CPCD Device Diagnostic (CPC Info Extended, VM Operations) and Action Diagnostic (Action Efficiency, Action Events) to investigate timeline. Active deletion is permanent and unrecoverable.
- **Tags**: cloud-pc, deletion, grace-period, provisioning-policy, license, CPCD, w365

### 3. Cloud PC is deleted/deprovisioned and end users lose access; device enters grace period then gets pe...
- **ID**: `avd-ado-wiki-345`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Provisioning policy removed or changed for the user, or W365 license removed/changed, causing Cloud PC to enter grace period followed by active deletion after 7 days
- **Solution**: Use CPCD (Cloud PC Diagnostics) to investigate: 1) Check Device Diagnostic tab for VM status and deletion timestamps, 2) Check Action Diagnostic tab for grace period and reprovision events, 3) Verify both requirements: valid W365 license AND valid Provisioning Policy assigned to user. Note: active deletion cannot be recovered - only passive deletion (license expiration/fraud) supports recovery
- **Tags**: cloud-pc, deletion, grace-period, provisioning-policy, license, cpcd, windows-365

### 4. Cloud PC unexpectedly reprovisioned when admin changes provisioning policy or adds user to secondary...
- **ID**: `avd-ado-wiki-346`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Adding user to a secondary provisioning policy or modifying the assigned provisioning policy triggers grace period on original Cloud PC and provisions a new one
- **Solution**: Advise customer not to remove or change provisioning policy assignment once Cloud PC is deployed. If using Group Based Licensing (GBL), follow the GBL resize guidance. Use CPCD Action Diagnostic tab to correlate provisioning policy changes with grace period events
- **Tags**: cloud-pc, reprovisioning, provisioning-policy, grace-period, windows-365

### 5. Cloud PC actively deleted/deprovisioned - users lose access to original device after grace period
- **ID**: `avd-ado-wiki-350`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: W365 license or Provisioning Policy was removed from user, triggering 7-day Grace Period followed by permanent active deletion
- **Solution**: Use CPCD Device Diagnostic to check LifecycleStatus and VM operations for ResourceOperation.DELETE. Use Action Diagnostic to trace GracePeriod/Delete/Reprovision events. Active deletion is NOT recoverable - only passive deletion (license expiration) can be recovered within 28 days.
- **Tags**: cloud-pc, deletion, grace-period, provisioning-policy, license, cpcd, w365

### 6. Cloud PC(s) actively deleted/deprovisioned after 7-day grace period, end users lose access to origin...
- **ID**: `avd-ado-wiki-354`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: W365 license removed/unassigned from user OR provisioning policy removed/changed, causing Cloud PC to enter 7-day grace period followed by permanent active deletion if not remediated
- **Solution**: Use CPCD (Cloud PC Diagnostics) to investigate: 1) Device Diagnostic tab - provide Device ID, check CPC Info Extended for LifecycleStatus/ProvisioningState, check VM Info for creation time, check VM Operations for ResourceOperation.DELETE. 2) Action Diagnostic tab - filter by UserID, check Action Efficiency for GracePeriod/Provision/Delete/Reprovision events with timestamps, check Action Events Overview for Device ID and Policy ID changes. Remediate within 7-day grace period by restoring license and/or provisioning policy. Note: active deletion is NOT recoverable (only passive deletion from license expiration can be recovered).
- **Tags**: cloud-pc, active-deletion, grace-period, CPCD, provisioning-policy, license, deprovisioning, w365

### 7. Cloud PC deleted/deprovisioned after license or provisioning policy removed, user loses access
- **ID**: `avd-ado-wiki-389`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: License removed or provisioning policy unassigned triggers 7-day grace period then active deletion
- **Solution**: Use CPCD Device Diagnostic to check LifecycleStatus and VM operations for DELETE event. Check Action Diagnostic for grace period entries. Active deletion is unrecoverable - only passive deletions can be recovered.
- **Tags**: cloud-pc, deletion, grace-period, cpcd, provisioning-policy, license

### 8. Cloud PC deleted/deprovisioned unexpectedly after grace period - active deletion
- **ID**: `avd-ado-wiki-339`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: W365 license or provisioning policy was removed/changed, triggering 7-day grace period followed by permanent active deletion
- **Solution**: Use CPCD Device Diagnostic and Action Diagnostic tabs to investigate timeline; active deletion is unrecoverable unlike passive deletion
- **Tags**: cloud-pc, deletion, grace-period, provisioning-policy, w365, cpcd

### 9. Windows 365 Migration API importSnapshot fails with error MissingProvisionPolicy - assigned user lac...
- **ID**: `avd-ado-wiki-c-r1-002`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: The user specified in assignedUserId does not have a provisioning policy assigned in the Windows 365 admin portal
- **Solution**: Assign a provisioning policy to the target user before calling the importSnapshot API. Ensure the policy has provisioningSourceType set to 'snapshot'
- **Tags**: migration-api, provisioning-policy, snapshot-import
