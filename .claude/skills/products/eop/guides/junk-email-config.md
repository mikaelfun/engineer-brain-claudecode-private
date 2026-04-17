# EOP 邮箱垃圾邮件配置与限制 - Quick Reference

**Entries**: 8 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Email from blocked sender delivered to Junk folder instead of being quarantin... | When a sender is on a user Blocked Senders list, EOP assi... | Check the anti-spam policy spam action configuration. If quarantine is desire... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Domains added to user Allowed Senders list in junk email configuration are no... | Domain-based entries in a user Allowed Senders list are N... | Add specific email addresses instead of domains to the Allowed Senders list. ... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Allowed/blocked senders list not working as expected with Quarantine action. ... | Junk mail hash stored in AAD has size limits: 3072 entrie... | Reduce entries to stay within hash limits (3072 allowed, 2048 recipients, 500... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Outlook client shows error 'You are over the Junk E-mail list limit' when try... | Outlook client has a hard limit of 510KB on the junk mail... | Manage junk email lists via PowerShell (Set-MailboxJunkEmailConfiguration) in... | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | Set-MailboxJunkEmailConfiguration fails with "Junk e-mail validation error" w... | The number of Trusted Senders being synchronized to the h... | Disable ContactsTrusted and/or reduce the number of configured Trusted Sender... | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Set-MailboxJunkEmailConfiguration fails with "Property validation failed: Tru... | Existing entries in TrustedSendersAndDomains contain wild... | Remove invalid entries (wildcards, internal mailbox/DG addresses) from the Sa... | 🟢 8.5 | [ADO Wiki] |
| 7 📋 | Junk email filter settings in Outlook revert to default after refresh; Set-Ma... | BlockedSendersAndDomains list has reached the maximum 102... | Remove invalid/unnecessary entries and ensure the BlockedSendersAndDomains li... | 🟢 8.5 | [ADO Wiki] |
| 8 📋 | Blocked/Safe sender domain added without @ symbol in Outlook not reflected in... | Adding domain without @ only updates property 6106001f (J... | Always add domains using @ prefix (e.g. @contoso.com) in Outlook client to en... | 🟢 8.5 | [ADO Wiki] |

## Quick Troubleshooting Path

1. Check the anti-spam policy spam action configuration. If quarantine is desired for blocked senders,  `[ADO Wiki]`
2. Add specific email addresses instead of domains to the Allowed Senders list. For organization-wide d `[ADO Wiki]`
3. Reduce entries to stay within hash limits (3072 allowed, 2048 recipients, 500 blocked). If ContactsT `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/junk-email-config.md)
