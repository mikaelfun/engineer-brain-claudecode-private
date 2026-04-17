# Purview 审计日志 -- Quick Reference

**Entries**: 5 | **21V**: partial | **Confidence**: high
**Last updated**: 2026-04-07

## Symptom Lookup
| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | O365 Management Activity API fails in 21V when using Global endpoints - audit log retrieval via API ... | 21V requires different API endpoints than Global. Must use manage.office365.cn i... | Change API parameters for 21V: $Enterprise='https://manage.office365.cn', $loginURL='https://login.p... | 🟢 8.0 | MCVKB/21v Office 365 Management Activity API.md |
| 2 | Mailbox message Move action not appearing in Purview audit logs — moved message to another folder bu... | Move action is not enabled in default mailbox audit logging configuration. By de... | Use PowerShell to enable Move audit action: Set-Mailbox -Identity <mailbox> -AuditOwner @{Add='Move'... | 🔵 7.5 | MCVKB/Mailbox audit logging.md |
| 3 | Identify who deleted emails or why emails missing from mailbox | User/admin deletion, mailbox rules, retention policies, shared mailbox access, m... | Purview audit log search for deletion events. EXO PowerShell investigation. Requires Audit Logs role | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/audit-log-identify-email-messages) |
| 4 | Audit log search error: Your request could not be completed. Please try again in Security and Compli... | User not assigned View-Only Audit Logs or Audit Logs role in Exchange Online | Create custom role group in Exchange admin center, add View-Only Audit Log or Audit Log role, then a... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/audit-logs/issue-search-audit-log) |
| 5 | Mailbox audit events not appearing in audit log search for non-E5 users | Mailbox audit events only return for E5 users when using unified audit log searc... | Manually enable mailbox auditing: Set-Mailbox -Identity user -AuditEnabled $true. If already enabled... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/purview/audit-troubleshooting-scenarios) |

## Quick Troubleshooting Path

1. Change API parameters for 21V: $Enterprise='https://manage.office365.cn', $loginURL='https://login.partner.microsoftonline.cn'. Reference script: http... `[source: onenote]`
2. Use PowerShell to enable Move audit action: Set-Mailbox -Identity <mailbox> -AuditOwner @{Add='Move'}. Verify with Get-Mailbox -Identity <mailbox> / S... `[source: onenote]`
3. Purview audit log search for deletion events. EXO PowerShell investigation. Requires Audit Logs role `[source: mslearn]`