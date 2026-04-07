# EOP ZAP 与投递后邮件移动 - Quick Reference

**Entries**: 5 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Emails moved post-delivery to junk mail folder - need to determine if MDO or ... | Post-delivery movement to junk can be caused by either MD... | Check message header 'dest:' field: if dest:I → the movement occurred in the ... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Message delivered to Inbox but moved to Junk/Deleted without user action | ZAP, Outlook add-ins (MoMT), mobile client (AirSync), or ... | Check ZAP via MDO Message Explorer. Run Get Store Mailbox Events. Enable Move... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Email delayed several hours within EOP, or email disappears then reappears ho... | ZAP (Zero-hour Auto Purge) or reverse ZAP: EOP initially ... | Check EMT for SAFETYNET RESUBMIT and AntispamTT references in custom_data. DU... | 🔵 7.5 | [ADO Wiki] |
| 4 📋 | ZAP quarantines email despite TABL sender allow entry; affects high confidenc... | ZAP does not honor TABL sender allow for high confidence ... | Known limitation. TABL URL allow IS honored by ZAP. Use TABL URL allow if nee... | 🔵 7.5 | [ADO Wiki] |
| 5 📋 | ZAP 未对已投递的垃圾邮件执行操作，用户报告垃圾邮件仍留在收件箱 | ZAP for spam 仅对未读邮件生效（unread only）。如果用户已读取邮件，ZAP 不会对其执行移动... | 1) 确认邮件是否在 ZAP 生效前已被用户读取（ZAP for spam 仅对 unread 消息生效，ZAP for phishing/malware... | 🔵 7.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Check message header 'dest:' field: if dest:I → the movement occurred in the mailbox (EXO scope, not `[ADO Wiki]`
2. Check ZAP via MDO Message Explorer. Run Get Store Mailbox Events. Enable Move audit if needed. `[ADO Wiki]`
3. Check EMT for SAFETYNET RESUBMIT and AntispamTT references in custom_data. DUPLICATEDELIVER = origin `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/zap-post-delivery.md)
