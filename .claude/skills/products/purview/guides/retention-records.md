# Purview 保留策略与记录管理 -- Quick Reference

**Entries**: 11 | **21V**: partial | **Confidence**: high
**Last updated**: 2026-04-07

## Symptom Lookup
| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | EXO Archive Quota increase request during mailbox migration from Global to Gallatin — need temporary... | Default EXO archive quota is 100GB. During migration (PST import + restore), bot... | File ICM to PG for temporary quota increase. Key limits: max temporary ArchiveQuota = 220GB (only if... | 🔵 7.5 | MCVKB/[Morgan] Archive Quota increase during mailbox mig.md |
| 2 📋 | Restoring inactive mailbox with auto-expanding archive enabled is not supported — migration plan blo... | Microsoft does not support restoring an inactive mailbox that has auto-expanding... | Do NOT enable auto-expanding archive on the shared mailbox used as migration landing. Only enable au... | 🔵 7.5 | MCVKB/[Morgan] Archive Quota increase during mailbox mig.md |
| 3 📋 | Retention policy error We cannot process your policy with ActiveDirectorySyncError | Retention policy failed to sync with Microsoft Entra ID | Retry via Purview portal or Set-RetentionCompliancePolicy -Identity name -RetryDistribution | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies) |
| 4 📋 | Retention policy error Something went wrong with PolicyNotifyError | Notification pipeline error in policy sync | Retry via Purview portal or Set-RetentionCompliancePolicy -RetryDistribution | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies#error-something-went-wrong) |
| 5 📋 | Retention policy error We ran into a problem with InternalError | Unspecified internal error in policy sync | Retry via Purview portal or Set-RetentionCompliancePolicy -RetryDistribution | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies#error-we-ran-into-a-problem) |
| 6 📋 | Retention policy We are still processing with PolicySyncTimeout | Policy sync did not finish within expected timeframe | Retry via Purview portal or Set-RetentionCompliancePolicy -RetryDistribution | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies#error-were-still-processing-your-policy) |
| 7 📋 | Retention policy You cannot apply a hold here with RecipientTypeNotAllowed | Unsupported mailbox type added to retention policy | Remove problematic locations. Use Set-RetentionCompliancePolicy without invalid mailbox types | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies#error-you-cant-apply-a-hold-here) |
| 8 📋 | Retention policy stuck in PendingDeletion state | Unspecified error during policy deletion | Remove-RetentionCompliancePolicy -Identity name -ForceDeletion | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/resolve-errors-in-retention-and-retention-label-policies#error-your-policy-is-stuck-in-pendingdeletion) |
| 9 📋 | Audit log events missing even with mailbox auditing on by default | License-based retention (E5=1yr, non-E5=180d). Some events need Audit Premium. B... | Get-AdminAuditLogConfig to verify. Check license retention. Run audit diagnostic. Check bypass assoc... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/audit-search#before-you-search-the-audit-log) |
| 10 📋 | MRM retention tags not archiving/deleting emails as expected | Wrong policy, personal tags override, compliance conflict, MFA not processing | Get-MailboxFolderStatistics -IncludeOldestAndNewestItems. Check policy columns. Start-ManagedFolderA... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/retention/troubleshoot-mrm-email-archive-deletion) |
| 11 📋 | Retention policy not working after mailbox migrated from on-prem to EXO (hybrid) | RetentionHoldEnabled set True by default during hybrid migration | Set-Mailbox user -RetentionHoldEnabled $false | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/holds/retention-policy-not-working-after-mailbox-moved) |

## Quick Troubleshooting Path

1. File ICM to PG for temporary quota increase. Key limits: max temporary ArchiveQuota = 220GB (only if RecoverableItemsQuota reduced to 20GB minimum); m... `[source: onenote]`
2. Do NOT enable auto-expanding archive on the shared mailbox used as migration landing. Only enable auto-expanding on the final target user mailbox afte... `[source: onenote]`
3. Retry via Purview portal or Set-RetentionCompliancePolicy -Identity name -RetryDistribution `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Full troubleshooting workflow](details/retention-records.md#troubleshooting-workflow)