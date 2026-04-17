# DEFENDER Sentinel SOC 优化与运维 — Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-siem-migration-tool-old.md, ado-wiki-a-soc-optimization-tsg.md, ado-wiki-b-workspace-manager-tsg.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Siem Migration
> Sources: ado-wiki

**1. Error 'SIEM Migration agent could not be initialized. An error occurred while creating the agent' when clicking 'Start Analyzing' in the AI-Powered SIEM Migration experience**

- **Root Cause**: Security Copilot is not enabled for the tenant, or user does not have the 'Security Operator' directory role assigned in Entra ID
- **Solution**: Enable Security Copilot for the tenant (securitycopilot.microsoft.com) and assign the user the 'Security Operator' directory role
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. SIEM migration job step 3 'Prepare recommendations and generate report' never completes even after 24 hours since migration job started**

- **Root Cause**: The migration job is stuck in the backend processing pipeline
- **Solution**: Raise an ICM to the SIEM Migration team to clear the migration job in the backend, then have the customer retry the migration
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. SIEM migration job stops processing and detections time out after the Security Copilot agent identity expires (default 90 days, may be shorter with Entra policies)**

- **Root Cause**: The captured user identity on the Security Copilot SIEM Migration agent has expired; expiry period defaults to 90 days but depends on tenant Entra policies
- **Solution**: Refresh the captured identity through the Security Copilot portal: go to the edit page of the SIEM Migration agent under the Agents tab
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. SIEM migration job fails or times out when processing large number of detection rules (>2000); processing rate is approximately 150 detections/hour with 24h global timeout**

- **Root Cause**: Security Copilot agent capacity limits processing to ~150 detections/hour with a 24-hour global timeout, capping effective throughput at ~2000-3000 detections per job
- **Solution**: Break the migration into multiple smaller jobs and process each separately. Multiple jobs can be uploaded to different workspaces simultaneously. Note: uploading a new job to the same workspace deletes the previous job's data
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 2: Workspace Manager
> Sources: ado-wiki, mslearn

**1. Workspace Manager shows error 'Conflict: A job is currently running under the assignment' and group cannot be deleted or exited, user is stuck in a deadlock**

- **Root Cause**: Orphaned jobs occur when a child workspace is deleted while a Workspace Manager group publish job is in progress; the running job cannot be completed or deleted, blocking group deletion
- **Solution**: Delete the running (orphaned) Job via the Workspace Manager API to unblock the group. This scenario can also occur in a race condition when a child workspace belongs to multiple groups and multiple publishes are attempted on the same child workspace simultaneously.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Workspace Manager shows error 'For alert rule (BuiltInFusion) given resource group name (X) did not match with the workspace manager resource group name (Y)' when creating or saving groups**

- **Root Cause**: The parent Sentinel workspace was moved to a different resource group after Workspace Manager was enabled; Analytics Rule IDs still reference the old resource group name and do not auto-update
- **Solution**: Disable and re-enable, or edit and save, or delete and recreate all Analytics Rules in the Workspace Manager Sentinel workspace that was moved before resuming Workspace Manager activity. This is a known documented Sentinel behavior when a workspace is moved to a different RG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Sentinel workspace manager publish fails**

- **Root Cause**: Content items deleted, permissions changed, or member workspace deleted; max 2000 published ops per group
- **Solution**: Check Failed link for details; verify content exists; verify Sentinel Contributor role; verify workspaces
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Workspace Manager shows error 'Conflict: A job is currently running under the assignment' and gro... | Orphaned jobs occur when a child workspace is deleted while a Workspace Manager group publish job... | Delete the running (orphaned) Job via the Workspace Manager API to unblock the group. This scenar... | 🟢 8.5 | ADO Wiki |
| 2 | Workspace Manager shows error 'For alert rule (BuiltInFusion) given resource group name (X) did n... | The parent Sentinel workspace was moved to a different resource group after Workspace Manager was... | Disable and re-enable, or edit and save, or delete and recreate all Analytics Rules in the Worksp... | 🟢 8.5 | ADO Wiki |
| 3 ⚠️ | Sentinel workspace manager publish fails | Content items deleted, permissions changed, or member workspace deleted; max 2000 published ops p... | Check Failed link for details; verify content exists; verify Sentinel Contributor role; verify wo... | 🔵 6.0 | MS Learn |
| 4 | Error 'SIEM Migration agent could not be initialized. An error occurred while creating the agent'... | Security Copilot is not enabled for the tenant, or user does not have the 'Security Operator' dir... | Enable Security Copilot for the tenant (securitycopilot.microsoft.com) and assign the user the 'S... | 🔵 5.5 | ADO Wiki |
| 5 | SIEM migration job step 3 'Prepare recommendations and generate report' never completes even afte... | The migration job is stuck in the backend processing pipeline | Raise an ICM to the SIEM Migration team to clear the migration job in the backend, then have the ... | 🔵 5.5 | ADO Wiki |
| 6 | SIEM migration job stops processing and detections time out after the Security Copilot agent iden... | The captured user identity on the Security Copilot SIEM Migration agent has expired; expiry perio... | Refresh the captured identity through the Security Copilot portal: go to the edit page of the SIE... | 🔵 5.5 | ADO Wiki |
| 7 | SIEM migration job fails or times out when processing large number of detection rules (>2000); pr... | Security Copilot agent capacity limits processing to ~150 detections/hour with a 24-hour global t... | Break the migration into multiple smaller jobs and process each separately. Multiple jobs can be ... | 🔵 5.5 | ADO Wiki |
