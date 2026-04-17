# EOP ZAP 与投递后邮件移动 - Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Messages-Moved-Post-Delivery.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Post-delivery movement to junk can
> Source: ado-wiki

**Symptom**: Emails moved post-delivery to junk mail folder - need to determine if MDO or EXO scope
**Root Cause**: Post-delivery movement to junk can be caused by either MDO (ZAP) or Exchange Online (mailbox-level junk mail rules). The message header 'dest:' field indicates the source

1. Check message header 'dest:' field: if dest:I → the movement occurred in the mailbox (EXO scope, not MDO). If dest:J → ZAP or MDO policy moved it (MDO scope). Route accordingly.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: ZAP, Outlook add-ins (MoMT), mobile
> Source: ado-wiki

**Symptom**: Message delivered to Inbox but moved to Junk/Deleted without user action
**Root Cause**: ZAP, Outlook add-ins (MoMT), mobile client (AirSync), or third-party app.

1. Check ZAP via MDO Message Explorer. Run Get Store Mailbox Events. Enable Move audit if needed.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: ZAP (Zero-hour Auto Purge) or
> Source: ado-wiki

**Symptom**: Email delayed several hours within EOP, or email disappears then reappears hours later; Received header shows 'MailboxResubmission by AntispamTT'; STOREDRIVER DELIVER or DUPLICATEDELIVER events for...
**Root Cause**: ZAP (Zero-hour Auto Purge) or reverse ZAP: EOP initially detected message as malicious (e.g. phish) and quarantined it, then later determined the detection was a false positive and triggered revers...

1. Check EMT for SAFETYNET RESUBMIT and AntispamTT references in custom_data. DUPLICATEDELIVER = original still in mailbox (user deleted before ZAP, so reverse ZAP drops duplicate). DELIVER = message successfully returned to inbox. Check quarantine for the original ZAP action record.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 4: ZAP does not honor TABL
> Source: ado-wiki

**Symptom**: ZAP quarantines email despite TABL sender allow entry; affects high confidence phish
**Root Cause**: ZAP does not honor TABL sender allow for high confidence phish (Feature 6044388)

1. Known limitation. TABL URL allow IS honored by ZAP. Use TABL URL allow if needed.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 5: ZAP for spam 仅对未读邮件生效（unread only）。如果用户已读取邮件，ZAP
> Source: mslearn

**Symptom**: ZAP 未对已投递的垃圾邮件执行操作，用户报告垃圾邮件仍留在收件箱
**Root Cause**: ZAP for spam 仅对未读邮件生效（unread only）。如果用户已读取邮件，ZAP 不会对其执行移动到 Junk 或隔离操作。此外，ZAP 可被 Safe Sender lists、mail flow rules (SCL=-1) 或 Advanced Delivery policy 覆盖

1. 1) 确认邮件是否在 ZAP 生效前已被用户读取（ZAP for spam 仅对 unread 消息生效，ZAP for phishing/malware 对 read+unread 均生效）
2. 2) 检查是否有 Safe Sender list / transport rule / IP Allow List 覆盖了 ZAP
3. 3) 使用 Threat Explorer → All email → Additional action 列筛选 ZAP 查看 ZAP 执行记录
4. 4) 使用 Mailflow status report 的 Mailflow view 查看 ZAP 影响的邮件数量
5. 5) 确认 anti-spam policy 中 ZAP for spam 已启用

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Emails moved post-delivery to junk mail folder - need to ... | Post-delivery movement to junk can | -> Phase 1 |
| Message delivered to Inbox but moved to Junk/Deleted with... | ZAP, Outlook add-ins (MoMT), mobile | -> Phase 2 |
| Email delayed several hours within EOP, or email disappea... | ZAP (Zero-hour Auto Purge) or | -> Phase 3 |
| ZAP quarantines email despite TABL sender allow entry; af... | ZAP does not honor TABL | -> Phase 4 |
| ZAP 未对已投递的垃圾邮件执行操作，用户报告垃圾邮件仍留在收件箱 | ZAP for spam 仅对未读邮件生效（unread only）。如果用户已读取邮件，ZAP | -> Phase 5 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Emails moved post-delivery to junk mail folder - need to determine if MDO or ... | Post-delivery movement to junk can be caused by either MD... | Check message header 'dest:' field: if dest:I → the movement occurred in the ... | 🟢 8.5 | [ADO Wiki] |
| 2 | Message delivered to Inbox but moved to Junk/Deleted without user action | ZAP, Outlook add-ins (MoMT), mobile client (AirSync), or ... | Check ZAP via MDO Message Explorer. Run Get Store Mailbox Events. Enable Move... | 🟢 8.5 | [ADO Wiki] |
| 3 | Email delayed several hours within EOP, or email disappears then reappears ho... | ZAP (Zero-hour Auto Purge) or reverse ZAP: EOP initially ... | Check EMT for SAFETYNET RESUBMIT and AntispamTT references in custom_data. DU... | 🔵 7.5 | [ADO Wiki] |
| 4 | ZAP quarantines email despite TABL sender allow entry; affects high confidenc... | ZAP does not honor TABL sender allow for high confidence ... | Known limitation. TABL URL allow IS honored by ZAP. Use TABL URL allow if nee... | 🔵 7.5 | [ADO Wiki] |
| 5 | ZAP 未对已投递的垃圾邮件执行操作，用户报告垃圾邮件仍留在收件箱 | ZAP for spam 仅对未读邮件生效（unread only）。如果用户已读取邮件，ZAP 不会对其执行移动... | 1) 确认邮件是否在 ZAP 生效前已被用户读取（ZAP for spam 仅对 unread 消息生效，ZAP for phishing/malware... | 🔵 7.5 | [MS Learn] |
