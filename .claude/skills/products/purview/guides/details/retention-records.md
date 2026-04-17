# Purview 保留策略与记录管理 -- Comprehensive Troubleshooting Guide

**Entries**: 11 | **Drafts fused**: 1 | **Kusto queries fused**: 2
**Source drafts**: [onenote-retention-policy-distribution-jarvis.md](..\guides/drafts/onenote-retention-policy-distribution-jarvis.md)
**Kusto references**: [dlm-elc-operations.md](../../kusto/purview/references/queries/dlm-elc-operations.md), [dlm-policy-sync.md](../../kusto/purview/references/queries/dlm-policy-sync.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: onenote-retention-policy-distribution-jarvis.md

1. Retention Policy Distribution Troubleshooting via Jarvis `[source: onenote-retention-policy-distribution-jarvis.md]`
2. When to Use `[source: onenote-retention-policy-distribution-jarvis.md]`
3. 1. Get Policy GUID `[source: onenote-retention-policy-distribution-jarvis.md]`
4. 2. Query Jarvis `[source: onenote-retention-policy-distribution-jarvis.md]`
5. 3. Analyze Results `[source: onenote-retention-policy-distribution-jarvis.md]`
6. 21V Applicability `[source: onenote-retention-policy-distribution-jarvis.md]`

### Phase 2: Data Collection (KQL)

```kusto
source
| project env_time, Workload, ObjectType, Stage, Status, RetryCount, Description, CustomData
| sort by env_time asc
```
`[tool: onenote-retention-policy-distribution-jarvis.md]`

```kusto
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let mailboxguid = "{mailboxGuid}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let elc_state = iff(isempty(tenantid), 'Need tenant Id to fullfil geneva link',
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcStatsLogEntryEvent,ElcStatsLogEntryExceptionEvent&conditions=[["tenantId","%3D%3D","', tenantid,
           '"],["mailboxGuid","contains","', mailboxguid,
           '"]]&kqlClientQuery=source%0A|%20sort%20by%20env_time%20asc'));
print elc_state
```
`[tool: Kusto skill -- dlm-elc-operations.md]`

```kusto
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let mailboxguid = "{mailboxGuid}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let elc_trace = iff(isempty(tenantid), 'Need tenant Id to fullfil geneva link',
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365PassiveGal&en=ElcAssistantTraceEvent,ElcAssistantTraceExEvent&conditions=[["tenantId","%3D%3D","', tenantid,
           '"],["mailboxGuid","contains","', mailboxguid,
           '"]]&kqlClientQuery=source%0A|%20project%20env_time,%20message,%20activityId,%20operationId,assistantName%20,%20scenario,%20subScenario,%20mailboxGuid%0A|%20sort%20by%20env_time%20asc'));
print elc_trace
```
`[tool: Kusto skill -- dlm-elc-operations.md]`

```kusto
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let timediff_minutes = datetime_diff('minute', endtime, starttime);
let policy_sync_log = iff(isempty(tenantid), "Need a tenant ID to fullfil geneva link",
    strcat("https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=", starttime,
           "&offset=", timediff_minutes,
           '&offsetUnit=Minutes&UTC=true&ep=CA%20Mooncake&ns=O365EopGal&en=UnifiedPolicyMonitoringInfoLogEvent&conditions=[["TenantId","%3D%3D","', tenantid,
           '"],["ClientCorrelationId","contains","', correlationid,
           '"]]&kqlClientQuery=source%0A|%20project%20env_time,%20activityId,%20operationId,%20ObjectId,%20Workload,%20PolicyScenario%20,ClientCorrelationId,%20Stage,%20Status,%20CustomData,%20Latency%0A|%20extend%20Pipeline%20%3D%20iif(ObjectId%20%3D%3D%20"00000000-0000-0000-0000-000000000000",%20"FileSync",%20"ObjectSync")'));
print policy_sync_log
```
`[tool: Kusto skill -- dlm-policy-sync.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| EXO Archive Quota increase request during mailbox migration from Global to Galla... | Default EXO archive quota is 100GB. During migration (PST im... | File ICM to PG for temporary quota increase. Key limits: max temporary ArchiveQu... |
| Restoring inactive mailbox with auto-expanding archive enabled is not supported ... | Microsoft does not support restoring an inactive mailbox tha... | Do NOT enable auto-expanding archive on the shared mailbox used as migration lan... |
| Retention policy error We cannot process your policy with ActiveDirectorySyncErr... | Retention policy failed to sync with Microsoft Entra ID | Retry via Purview portal or Set-RetentionCompliancePolicy -Identity name -RetryD... |
| Retention policy error Something went wrong with PolicyNotifyError | Notification pipeline error in policy sync | Retry via Purview portal or Set-RetentionCompliancePolicy -RetryDistribution |
| Retention policy error We ran into a problem with InternalError | Unspecified internal error in policy sync | Retry via Purview portal or Set-RetentionCompliancePolicy -RetryDistribution |
| Retention policy We are still processing with PolicySyncTimeout | Policy sync did not finish within expected timeframe | Retry via Purview portal or Set-RetentionCompliancePolicy -RetryDistribution |
| Retention policy You cannot apply a hold here with RecipientTypeNotAllowed | Unsupported mailbox type added to retention policy | Remove problematic locations. Use Set-RetentionCompliancePolicy without invalid ... |
| Retention policy stuck in PendingDeletion state | Unspecified error during policy deletion | Remove-RetentionCompliancePolicy -Identity name -ForceDeletion |

`[conclusion: 🔵 7.5/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | EXO Archive Quota increase request during mailbox migration from Global to Gallatin — need temporary... | Default EXO archive quota is 100GB. During migration (PST import + restore), bot... | File ICM to PG for temporary quota increase. Key limits: max temporary ArchiveQuota = 220GB (only if... | 🔵 7.5 | MCVKB/[Morgan] Archive Quota increase during mailbox mig.md |
| 2 | Restoring inactive mailbox with auto-expanding archive enabled is not supported — migration plan blo... | Microsoft does not support restoring an inactive mailbox that has auto-expanding... | Do NOT enable auto-expanding archive on the shared mailbox used as migration landing. Only enable au... | 🔵 7.5 | MCVKB/[Morgan] Archive Quota increase during mailbox mig.md |
| 3 | Retention policy error We cannot process your policy with ActiveDirectorySyncError | Retention policy failed to sync with Microsoft Entra ID | Retry via Purview portal or Set-RetentionCompliancePolicy -Identity name -RetryDistribution | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies) |
| 4 | Retention policy error Something went wrong with PolicyNotifyError | Notification pipeline error in policy sync | Retry via Purview portal or Set-RetentionCompliancePolicy -RetryDistribution | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies#error-something-went-wrong) |
| 5 | Retention policy error We ran into a problem with InternalError | Unspecified internal error in policy sync | Retry via Purview portal or Set-RetentionCompliancePolicy -RetryDistribution | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies#error-we-ran-into-a-problem) |
| 6 | Retention policy We are still processing with PolicySyncTimeout | Policy sync did not finish within expected timeframe | Retry via Purview portal or Set-RetentionCompliancePolicy -RetryDistribution | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies#error-were-still-processing-your-policy) |
| 7 | Retention policy You cannot apply a hold here with RecipientTypeNotAllowed | Unsupported mailbox type added to retention policy | Remove problematic locations. Use Set-RetentionCompliancePolicy without invalid mailbox types | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies#error-you-cant-apply-a-hold-here) |
| 8 | Retention policy stuck in PendingDeletion state | Unspecified error during policy deletion | Remove-RetentionCompliancePolicy -Identity name -ForceDeletion | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies#error-your-policy-is-stuck-in-pendingdeletion) |
| 9 | Audit log events missing even with mailbox auditing on by default | License-based retention (E5=1yr, non-E5=180d). Some events need Audit Premium. B... | Get-AdminAuditLogConfig to verify. Check license retention. Run audit diagnostic. Check bypass assoc... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/audit-search#before-you-search-the-audit-log) |
| 10 | MRM retention tags not archiving/deleting emails as expected | Wrong policy, personal tags override, compliance conflict, MFA not processing | Get-MailboxFolderStatistics -IncludeOldestAndNewestItems. Check policy columns. Start-ManagedFolderA... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/troubleshoot-mrm-email-archive-deletion) |
| 11 | Retention policy not working after mailbox migrated from on-prem to EXO (hybrid) | RetentionHoldEnabled set True by default during hybrid migration | Set-Mailbox user -RetentionHoldEnabled $false | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/holds/retention-policy-not-working-after-mailbox-moved) |