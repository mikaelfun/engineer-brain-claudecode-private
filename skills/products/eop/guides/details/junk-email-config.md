# EOP 邮箱垃圾邮件配置与限制 - Comprehensive Troubleshooting Guide

**Entries**: 8 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Blocked-Senders.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: When a sender is on
> Source: ado-wiki

**Symptom**: Email from blocked sender delivered to Junk folder instead of being quarantined, or vice versa. X-Forefront-Antispam-Report shows SFV:BLK and SCL:6.
**Root Cause**: When a sender is on a user Blocked Senders list, EOP assigns SCL:6 (SFV:BLK). The actual action (Move to Junk vs Quarantine) depends on the anti-spam policy spam action setting, not the block list ...

1. Check the anti-spam policy spam action configuration. If quarantine is desired for blocked senders, set the spam action to Quarantine message. Verify verdict with X-Forefront-Antispam-Report header (SFV:BLK). Use Spam Verdict Reason diagnostic to confirm.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: Domain-based entries in a user
> Source: ado-wiki

**Symptom**: Domains added to user Allowed Senders list in junk email configuration are not honored; emails from allowed domains are still being filtered by EOP.
**Root Cause**: Domain-based entries in a user Allowed Senders list are NOT honored by Exchange Online. This is by design. Domain entries are evaluated only at the mailbox level and cannot be synchronized to Micro...

1. Add specific email addresses instead of domains to the Allowed Senders list. For organization-wide domain allows, use anti-spam policy allowed domains or Exchange transport rules. Verify with Get-MailboxJunkEmailConfiguration cmdlet.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: Junk mail hash stored in
> Source: ado-wiki

**Symptom**: Allowed/blocked senders list not working as expected with Quarantine action. Safe sender messages getting quarantined unexpectedly, or blocked sender messages reaching Junk folder instead of quaran...
**Root Cause**: Junk mail hash stored in AAD has size limits: 3072 entries for allowed senders, 2048 for allowed recipients, 500 for blocked senders. Exceeding these limits causes the hash to not stay updated, lea...

1. Reduce entries to stay within hash limits (3072 allowed, 2048 recipients, 500 blocked). If ContactsTrusted is enabled, contacts count toward the hash - consider disabling it. For Shared Mailboxes exceeding limits, use non-customer-facing diagnostic to force hash sync. Avoid Quarantine action if lists exceed hash limits.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: Outlook client has a hard
> Source: ado-wiki

**Symptom**: Outlook client shows error 'You are over the Junk E-mail list limit' when trying to modify blocked or allowed senders list.
**Root Cause**: Outlook client has a hard limit of 510KB on the junk mail rule size. Large allowed/blocked sender lists cause the rule to exceed this limit. This limit is owned by the Outlook team and cannot be in...

1. Manage junk email lists via PowerShell (Set-MailboxJunkEmailConfiguration) instead of the Outlook client. Reduce the number of entries in allowed/blocked senders lists to stay under the 510KB rule size limit.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 5: The number of Trusted Senders
> Source: ado-wiki

**Symptom**: Set-MailboxJunkEmailConfiguration fails with "Junk e-mail validation error" when adding to TrustedSendersAndDomains
**Root Cause**: The number of Trusted Senders being synchronized to the hash exceeds the supported limit, typically caused by ContactsTrusted enabled and/or excessive Trusted Senders entries.

1. Disable ContactsTrusted and/or reduce the number of configured Trusted Senders to bring total within supported limit.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 6: Existing entries in TrustedSendersAndDomains contain
> Source: ado-wiki

**Symptom**: Set-MailboxJunkEmailConfiguration fails with "Property validation failed: TrustedSendersAndDomains"
**Root Cause**: Existing entries in TrustedSendersAndDomains contain wildcards or valid internal mailbox/distribution group addresses which are not allowed.

1. Remove invalid entries (wildcards, internal mailbox/DG addresses) from the Safe Sender list in Outlook, then retry the cmdlet.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 7: BlockedSendersAndDomains list has reached the
> Source: ado-wiki

**Symptom**: Junk email filter settings in Outlook revert to default after refresh; Set-MailboxJunkEmailConfiguration returns ErrorCode=2 Property validation failed
**Root Cause**: BlockedSendersAndDomains list has reached the maximum 1024 entries.

1. Remove invalid/unnecessary entries and ensure the BlockedSendersAndDomains list has fewer than 1024 entries.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 8: Adding domain without @ only
> Source: ado-wiki

**Symptom**: Blocked/Safe sender domain added without @ symbol in Outlook not reflected in Get-MailboxJunkEmailConfiguration or OWA
**Root Cause**: Adding domain without @ only updates property 6106001f (JunkBlockedDomainSuffixes) which works only on Outlook client when open. PR_EXTENDED_RULE_MSG_CONDITION (needed for server-side + OWA) only u...

1. Always add domains using @ prefix (e.g. @contoso.com) in Outlook client to ensure server-side enforcement.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Email from blocked sender delivered to Junk folder instea... | When a sender is on | -> Phase 1 |
| Domains added to user Allowed Senders list in junk email ... | Domain-based entries in a user | -> Phase 2 |
| Allowed/blocked senders list not working as expected with... | Junk mail hash stored in | -> Phase 3 |
| Outlook client shows error 'You are over the Junk E-mail ... | Outlook client has a hard | -> Phase 4 |
| Set-MailboxJunkEmailConfiguration fails with "Junk e-mail... | The number of Trusted Senders | -> Phase 5 |
| Set-MailboxJunkEmailConfiguration fails with "Property va... | Existing entries in TrustedSendersAndDomains contain | -> Phase 6 |
| Junk email filter settings in Outlook revert to default a... | BlockedSendersAndDomains list has reached the | -> Phase 7 |
| Blocked/Safe sender domain added without @ symbol in Outl... | Adding domain without @ only | -> Phase 8 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Email from blocked sender delivered to Junk folder instead of being quarantin... | When a sender is on a user Blocked Senders list, EOP assi... | Check the anti-spam policy spam action configuration. If quarantine is desire... | 🟢 8.5 | [ADO Wiki] |
| 2 | Domains added to user Allowed Senders list in junk email configuration are no... | Domain-based entries in a user Allowed Senders list are N... | Add specific email addresses instead of domains to the Allowed Senders list. ... | 🟢 8.5 | [ADO Wiki] |
| 3 | Allowed/blocked senders list not working as expected with Quarantine action. ... | Junk mail hash stored in AAD has size limits: 3072 entrie... | Reduce entries to stay within hash limits (3072 allowed, 2048 recipients, 500... | 🟢 8.5 | [ADO Wiki] |
| 4 | Outlook client shows error 'You are over the Junk E-mail list limit' when try... | Outlook client has a hard limit of 510KB on the junk mail... | Manage junk email lists via PowerShell (Set-MailboxJunkEmailConfiguration) in... | 🟢 8.5 | [ADO Wiki] |
| 5 | Set-MailboxJunkEmailConfiguration fails with "Junk e-mail validation error" w... | The number of Trusted Senders being synchronized to the h... | Disable ContactsTrusted and/or reduce the number of configured Trusted Sender... | 🟢 8.5 | [ADO Wiki] |
| 6 | Set-MailboxJunkEmailConfiguration fails with "Property validation failed: Tru... | Existing entries in TrustedSendersAndDomains contain wild... | Remove invalid entries (wildcards, internal mailbox/DG addresses) from the Sa... | 🟢 8.5 | [ADO Wiki] |
| 7 | Junk email filter settings in Outlook revert to default after refresh; Set-Ma... | BlockedSendersAndDomains list has reached the maximum 102... | Remove invalid/unnecessary entries and ensure the BlockedSendersAndDomains li... | 🟢 8.5 | [ADO Wiki] |
| 8 | Blocked/Safe sender domain added without @ symbol in Outlook not reflected in... | Adding domain without @ only updates property 6106001f (J... | Always add domains using @ prefix (e.g. @contoso.com) in Outlook client to en... | 🟢 8.5 | [ADO Wiki] |
