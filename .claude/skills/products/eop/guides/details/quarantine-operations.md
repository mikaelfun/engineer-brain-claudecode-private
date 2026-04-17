# EOP 隔离区操作、通知与释放 - Comprehensive Troubleshooting Guide

**Entries**: 9 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Quarantine-Operations.md, ado-wiki-a-Quarantine-Release-Without-Interaction.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Quarantine notification routed through third-party
> Source: ado-wiki

**Symptom**: Messages released from Quarantine without user interaction
**Root Cause**: Quarantine notification routed through third-party that activated release link, or app accessed notification.

1. Audit quarantine ops. Trace notification from quarantine@messaging.microsoft.com. Check MailItemsAccessed. Validate AppId.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: Most common causes: (1) message
> Source: ado-wiki

**Symptom**: Quarantined message cannot be found by end user or admin in quarantine portal
**Root Cause**: Most common causes: (1) message expired past retention period (default 15 days), (2) message from Blocked Sender filtered out by default, (3) message deleted from quarantine.

1. Check retention period in anti-spam policy vs message age. For blocked sender: use -IncludeMessagesFromBlockedSenderAddress parameter. For deletion: search Unified Audit Log for RecordType Quarantine + Operation QuarantineDeleteMessage.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: Quarantine notifications controlled by per-policy
> Source: ado-wiki

**Symptom**: Quarantine notifications not being sent to end users at expected frequency or at all
**Root Cause**: Quarantine notifications controlled by per-policy ESNEnabled (must be True) and Global Quarantine Policy frequency. Settings stamped at delivery time - changing policy after quarantine won't retroa...

1. Verify: (1) quarantine policy has ESNEnabled=True, (2) check global frequency via Get-QuarantinePolicy -QuarantinePolicyType GlobalQuarantinePolicy, (3) trace quarantine@messaging.microsoft.com delivery.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: Strict Preset Security Policy or
> Source: onenote

**Symptom**: Custom quarantine email notification not delivered to end users despite quarantine policy configuration with notification enabled
**Root Cause**: Strict Preset Security Policy or Standard Preset Security Policy overrides custom quarantine policy settings; preset policies take higher priority and suppress custom quarantine notification config...

1. 1) Disable Strict/Standard Preset Security Policy in SCC portal (security.microsoftonline.cn)
2. 2) Enable quarantine email notification in custom quarantine policy
3. 3) Apply custom quarantine policy in Anti-spam or Anti-phishing policy
4. 4) Test with GTUBE string: XJS*C4JDBQADN1.NSBN3*2IDNEN*GTUBE-STANDARD-ANTI-UBE-TEST-EMAIL*C.34X
5. 5) Notification frequency: every 4 hours / 1 day / 1 week depending on policy setting

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8/10 - [OneNote]]`

### Phase 5: Quarantine metadata not saved correctly
> Source: ado-wiki

**Symptom**: ZAPped emails sent to quarantine but do not appear in MDO quarantine page or Get-QuarantineMessage
**Root Cause**: Quarantine metadata not saved correctly during ZAP; mails are moved to secured quarantine folder but metadata is missing (Service Incident DZ1247911, PSI IcM 21000000941799)

1. Check Service Incident DZ1247911. Latest Delivery Location will show 'Quarantine' in Threat Explorer. If SI not on customer dashboard, follow Global High Impact SI Process wiki to add it.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 6: 多种可能原因：1) 非 Microsoft 防病毒/安全服务二次扫描并重新隔离; 2)
> Source: mslearn

**Symptom**: 从隔离区释放的邮件未到达收件人收件箱，或释放后再次被隔离
**Root Cause**: 多种可能原因：1) 非 Microsoft 防病毒/安全服务二次扫描并重新隔离; 2) Inbox rules 将释放的邮件移走/删除; 3) 原始隔离的 transport rule 对释放邮件再次触发; 4) 释放到 on-premises 收件人时 anti-spam headers 丢失导致重新隔离

1. 1) 排查是否有非 Microsoft 过滤服务导致二次隔离
2. 2) 检查收件人 Inbox rules
3. 3) 使用 Release-QuarantineMessage -Force 强制释放
4. 4) Force 仍失败则关闭非 Microsoft 过滤后释放到备用邮箱
5. 5) 使用 Message trace 跟踪邮件投递状态

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 7: 默认 quarantine policy AdminOnlyAccessPolicy 和
> Source: mslearn

**Symptom**: Quarantine notification 邮件未收到，用户不知道有邮件被隔离
**Root Cause**: 默认 quarantine policy AdminOnlyAccessPolicy 和 DefaultFullAccessPolicy 不发送通知。只有 DefaultFullAccessWithNotificationPolicy（用于 preset security policy）和 NotificationEnabledPolicy 默认启用通知

1. 1) 使用 preset security policy 的用户自动获得通知（DefaultFullAccessWithNotificationPolicy）。2) 自定义策略需创建新的 quarantine policy 并启用通知。3) 在 Defender portal > Quarantine policies > Global settings 中自定义通知频率（4小时/每天/每周）、发件人和 logo

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 8: 以下三类邮件无论 quarantine policy 如何配置，用户都不能自行释放：1) anti-malware
> Source: mslearn

**Symptom**: 用户无法自行释放被隔离的邮件，只能 Request Release，即使 quarantine policy 配置了 Full Access 权限
**Root Cause**: 以下三类邮件无论 quarantine policy 如何配置，用户都不能自行释放：1) anti-malware policy 隔离的 malware; 2) Safe Attachments policy 隔离的 malware 或 phishing; 3) anti-spam policy 隔离的 high confidence phishing。用户只能 request releas...

1. 这是 by design 行为。管理员需定期检查 quarantine 中的 release request。release request 默认发送给 TenantAdmins 角色组成员，配置在 alert policy 'User requested to release a quarantined message' 中。管理员可在 Defender portal quarantine 页面批量审批

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 9: Quarantine notifications 仅支持对 shared mailbox
> Source: mslearn

**Symptom**: Shared mailbox 用户未收到 quarantine notification，不知道有邮件被隔离
**Root Cause**: Quarantine notifications 仅支持对 shared mailbox 拥有 FullAccess 权限的用户。Send As 或 Send on Behalf 权限不够

1. 确认需要接收 quarantine notification 的用户对 shared mailbox 具有 FullAccess delegation 权限。在 EAC > Recipients > Shared 中编辑 mailbox delegation，或使用 Add-MailboxPermission cmdlet

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Messages released from Quarantine without user interaction | Quarantine notification routed through third-party | -> Phase 1 |
| Quarantined message cannot be found by end user or admin ... | Most common causes: (1) message | -> Phase 2 |
| Quarantine notifications not being sent to end users at e... | Quarantine notifications controlled by per-policy | -> Phase 3 |
| Custom quarantine email notification not delivered to end... | Strict Preset Security Policy or | -> Phase 4 |
| ZAPped emails sent to quarantine but do not appear in MDO... | Quarantine metadata not saved correctly | -> Phase 5 |
| 从隔离区释放的邮件未到达收件人收件箱，或释放后再次被隔离 | 多种可能原因：1) 非 Microsoft 防病毒/安全服务二次扫描并重新隔离; 2) | -> Phase 6 |
| Quarantine notification 邮件未收到，用户不知道有邮件被隔离 | 默认 quarantine policy AdminOnlyAccessPolicy 和 | -> Phase 7 |
| 用户无法自行释放被隔离的邮件，只能 Request Release，即使 quarantine policy 配置... | 以下三类邮件无论 quarantine policy 如何配置，用户都不能自行释放：1) anti-malware | -> Phase 8 |
| Shared mailbox 用户未收到 quarantine notification，不知道有邮件被隔离 | Quarantine notifications 仅支持对 shared mailbox | -> Phase 9 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Messages released from Quarantine without user interaction | Quarantine notification routed through third-party that a... | Audit quarantine ops. Trace notification from quarantine@messaging.microsoft.... | 🟢 8.5 | [ADO Wiki] |
| 2 | Quarantined message cannot be found by end user or admin in quarantine portal | Most common causes: (1) message expired past retention pe... | Check retention period in anti-spam policy vs message age. For blocked sender... | 🟢 8.5 | [ADO Wiki] |
| 3 | Quarantine notifications not being sent to end users at expected frequency or... | Quarantine notifications controlled by per-policy ESNEnab... | Verify: (1) quarantine policy has ESNEnabled=True, (2) check global frequency... | 🟢 8.5 | [ADO Wiki] |
| 4 | Custom quarantine email notification not delivered to end users despite quara... | Strict Preset Security Policy or Standard Preset Security... | 1) Disable Strict/Standard Preset Security Policy in SCC portal (security.mic... | 🟢 8 | [OneNote] |
| 5 | ZAPped emails sent to quarantine but do not appear in MDO quarantine page or ... | Quarantine metadata not saved correctly during ZAP; mails... | Check Service Incident DZ1247911. Latest Delivery Location will show 'Quarant... | 🔵 7.5 | [ADO Wiki] |
| 6 | 从隔离区释放的邮件未到达收件人收件箱，或释放后再次被隔离 | 多种可能原因：1) 非 Microsoft 防病毒/安全服务二次扫描并重新隔离; 2) Inbox rules 将... | 1) 排查是否有非 Microsoft 过滤服务导致二次隔离; 2) 检查收件人 Inbox rules; 3) 使用 Release-Quarantin... | 🔵 7.5 | [MS Learn] |
| 7 | Quarantine notification 邮件未收到，用户不知道有邮件被隔离 | 默认 quarantine policy AdminOnlyAccessPolicy 和 DefaultFullA... | 1) 使用 preset security policy 的用户自动获得通知（DefaultFullAccessWithNotificationPolic... | 🔵 7.5 | [MS Learn] |
| 8 | 用户无法自行释放被隔离的邮件，只能 Request Release，即使 quarantine policy 配置了 Full Access 权限 | 以下三类邮件无论 quarantine policy 如何配置，用户都不能自行释放：1) anti-malware... | 这是 by design 行为。管理员需定期检查 quarantine 中的 release request。release request 默认发送给 ... | 🔵 7.5 | [MS Learn] |
| 9 | Shared mailbox 用户未收到 quarantine notification，不知道有邮件被隔离 | Quarantine notifications 仅支持对 shared mailbox 拥有 FullAcces... | 确认需要接收 quarantine notification 的用户对 shared mailbox 具有 FullAccess delegation 权... | 🔵 7.5 | [MS Learn] |
