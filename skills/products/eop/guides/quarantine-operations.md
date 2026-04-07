# EOP 隔离区操作、通知与释放 - Quick Reference

**Entries**: 9 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Messages released from Quarantine without user interaction | Quarantine notification routed through third-party that a... | Audit quarantine ops. Trace notification from quarantine@messaging.microsoft.... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Quarantined message cannot be found by end user or admin in quarantine portal | Most common causes: (1) message expired past retention pe... | Check retention period in anti-spam policy vs message age. For blocked sender... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Quarantine notifications not being sent to end users at expected frequency or... | Quarantine notifications controlled by per-policy ESNEnab... | Verify: (1) quarantine policy has ESNEnabled=True, (2) check global frequency... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Custom quarantine email notification not delivered to end users despite quara... | Strict Preset Security Policy or Standard Preset Security... | 1) Disable Strict/Standard Preset Security Policy in SCC portal (security.mic... | 🟢 8 | [OneNote] |
| 5 📋 | ZAPped emails sent to quarantine but do not appear in MDO quarantine page or ... | Quarantine metadata not saved correctly during ZAP; mails... | Check Service Incident DZ1247911. Latest Delivery Location will show 'Quarant... | 🔵 7.5 | [ADO Wiki] |
| 6 📋 | 从隔离区释放的邮件未到达收件人收件箱，或释放后再次被隔离 | 多种可能原因：1) 非 Microsoft 防病毒/安全服务二次扫描并重新隔离; 2) Inbox rules 将... | 1) 排查是否有非 Microsoft 过滤服务导致二次隔离; 2) 检查收件人 Inbox rules; 3) 使用 Release-Quarantin... | 🔵 7.5 | [MS Learn] |
| 7 📋 | Quarantine notification 邮件未收到，用户不知道有邮件被隔离 | 默认 quarantine policy AdminOnlyAccessPolicy 和 DefaultFullA... | 1) 使用 preset security policy 的用户自动获得通知（DefaultFullAccessWithNotificationPolic... | 🔵 7.5 | [MS Learn] |
| 8 📋 | 用户无法自行释放被隔离的邮件，只能 Request Release，即使 quarantine policy 配置了 Full Access 权限 | 以下三类邮件无论 quarantine policy 如何配置，用户都不能自行释放：1) anti-malware... | 这是 by design 行为。管理员需定期检查 quarantine 中的 release request。release request 默认发送给 ... | 🔵 7.5 | [MS Learn] |
| 9 📋 | Shared mailbox 用户未收到 quarantine notification，不知道有邮件被隔离 | Quarantine notifications 仅支持对 shared mailbox 拥有 FullAcces... | 确认需要接收 quarantine notification 的用户对 shared mailbox 具有 FullAccess delegation 权... | 🔵 7.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Audit quarantine ops. Trace notification from quarantine@messaging.microsoft.com. Check MailItemsAcc `[ADO Wiki]`
2. Check retention period in anti-spam policy vs message age. For blocked sender: use -IncludeMessagesF `[ADO Wiki]`
3. Verify: (1) quarantine policy has ESNEnabled=True, (2) check global frequency via Get-QuarantinePoli `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/quarantine-operations.md)
