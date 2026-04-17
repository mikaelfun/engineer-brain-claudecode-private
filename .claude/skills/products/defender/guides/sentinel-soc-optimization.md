# DEFENDER Sentinel SOC 优化与运维 — Troubleshooting Quick Reference

**Entries**: 7 | **21V**: 6/7 applicable
**Sources**: ado-wiki, mslearn | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/sentinel-soc-optimization.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Workspace Manager shows error 'Conflict: A job is currently running under the assignment' and gro... | Orphaned jobs occur when a child workspace is deleted while a Workspace Manager group publish job... | Delete the running (orphaned) Job via the Workspace Manager API to unblock the group. This scenar... | 🟢 8.5 | ADO Wiki |
| 2 | Workspace Manager shows error 'For alert rule (BuiltInFusion) given resource group name (X) did n... | The parent Sentinel workspace was moved to a different resource group after Workspace Manager was... | Disable and re-enable, or edit and save, or delete and recreate all Analytics Rules in the Worksp... | 🟢 8.5 | ADO Wiki |
| 3 | Sentinel workspace manager publish fails | Content items deleted, permissions changed, or member workspace deleted; max 2000 published ops p... | Check Failed link for details; verify content exists; verify Sentinel Contributor role; verify wo... | 🔵 6.0 | MS Learn |
| 4 | Error 'SIEM Migration agent could not be initialized. An error occurred while creating the agent'... | Security Copilot is not enabled for the tenant, or user does not have the 'Security Operator' dir... | Enable Security Copilot for the tenant (securitycopilot.microsoft.com) and assign the user the 'S... | 🔵 5.5 | ADO Wiki |
| 5 | SIEM migration job step 3 'Prepare recommendations and generate report' never completes even afte... | The migration job is stuck in the backend processing pipeline | Raise an ICM to the SIEM Migration team to clear the migration job in the backend, then have the ... | 🔵 5.5 | ADO Wiki |
| 6 | SIEM migration job stops processing and detections time out after the Security Copilot agent iden... | The captured user identity on the Security Copilot SIEM Migration agent has expired; expiry perio... | Refresh the captured identity through the Security Copilot portal: go to the edit page of the SIE... | 🔵 5.5 | ADO Wiki |
| 7 | SIEM migration job fails or times out when processing large number of detection rules (>2000); pr... | Security Copilot agent capacity limits processing to ~150 detections/hour with a 24-hour global t... | Break the migration into multiple smaller jobs and process each separately. Multiple jobs can be ... | 🔵 5.5 | ADO Wiki |

## Quick Troubleshooting Path

1. Delete the running (orphaned) Job via the Workspace Manager API to unblock the group. This scenario can also occur in a race condition when a child workspace belongs to multiple groups and multiple... `[Source: ADO Wiki]`
2. Disable and re-enable, or edit and save, or delete and recreate all Analytics Rules in the Workspace Manager Sentinel workspace that was moved before resuming Workspace Manager activity. This is a ... `[Source: ADO Wiki]`
3. Check Failed link for details; verify content exists; verify Sentinel Contributor role; verify workspaces `[Source: MS Learn]`
4. Enable Security Copilot for the tenant (securitycopilot.microsoft.com) and assign the user the 'Security Operator' directory role `[Source: ADO Wiki]`
5. Raise an ICM to the SIEM Migration team to clear the migration job in the backend, then have the customer retry the migration `[Source: ADO Wiki]`
