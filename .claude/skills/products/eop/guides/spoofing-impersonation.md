# EOP 仿冒与用户/域名冒充检测 - Quick Reference

**Entries**: 5 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Legitimate emails quarantined as CAT:SPOOF after passing through multi-hop re... | Inbound Connector with EFSkipLastIP only traces back 1 ho... | Configure Enhanced Filtering on Inbound Connector: Set-InboundConnector -EFSk... | 🟢 9 | [OneNote] |
| 2 📋 | Protected user personal email to work account flagged as User Impersonation (... | Anti-phish detects matching display name from external se... | Add personal address to Safe Senders list. Mailbox Intelligence learns relati... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Legitimate external email flagged as spoofing (CAT:SPOOF) due to auth failure... | Spoof detection triggered: sending source not in SPF, no ... | Add to Spoof Intelligence allow list or TABL Spoofing tab. TABL not available... | 🔵 7.5 | [ADO Wiki] |
| 4 📋 | 合法的 spoofed 邮件（如邮件列表、代发邮件、内部应用通知）被 EOP spoof intelligence 阻止或标记为钓鱼 | 发件人未通过 SPF/DKIM/DMARC 认证且 composite authentication 也未通过，s... | 1) 在 Defender portal → Tenant Allow/Block List → Spoofed senders 中将该发件人/基础设施对... | 🔵 7.5 | [MS Learn] |
| 5 📋 | Tenant Allow/Block List 中存在 spoofed sender 的 allow 条目，compauth=fail 的邮件仍被允许投递 | 管理员在 Tenant Allow/Block List 中创建了 spoofed sender 的 allow ... | 管理员应定期审查 Tenant Allow/Block List 中的 spoofed sender allow 条目，确保只有必要的发件人被允许。过度使... | 🔵 7.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Configure Enhanced Filtering on Inbound Connector: Set-InboundConnector -EFSkipLastIP $false -EFSkip `[OneNote]`
2. Add personal address to Safe Senders list. Mailbox Intelligence learns relationship over time. `[ADO Wiki]`
3. Add to Spoof Intelligence allow list or TABL Spoofing tab. TABL not available in 21Vianet. `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/spoofing-impersonation.md)
