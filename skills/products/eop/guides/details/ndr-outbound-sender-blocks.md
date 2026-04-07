# EOP 外发邮件被阻止 - 发件人/租户限制 (5.1.8/5.1.90/5.7.705/5.7.750) - Comprehensive Troubleshooting Guide

**Entries**: 16 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Blocked-Senders.md, ado-wiki-a-investigate-fraud-recover-mail-flow.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Sending domain not added as
> Source: onenote

**Symptom**: Outbound emails fail with NDR 550 5.7.750 - Client blocked from sending from unregistered domain
**Root Cause**: Sending domain not added as accepted domain in M365; or incorrectly configured connectors; or compromised account creating new inbound connectors

1. Add and validate all sending domains in M365
2. use certificate-based outbound connector with accepted domain
3. check for unusual connectors and compromised accounts

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 2: Sender account exceeded Exchange Online
> Source: onenote

**Symptom**: Outbound emails fail with NDR 550 5.1.8 Access denied bad outbound sender
**Root Cause**: Sender account exceeded Exchange Online sending limits or account compromised and used for spam

1. Check if account is compromised
2. if compromised follow Responding to a compromised email account guide
3. admin unblocks account on Restricted entities page in Microsoft 365 Defender portal (security.microsoft.com/restrictedusers)
4. restrictions removed within 1 hour

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 3: Sender exceeded daily recipient rate
> Source: onenote

**Symptom**: Outbound emails fail with NDR 5.1.90 - reached daily limit for message recipients
**Root Cause**: Sender exceeded daily recipient rate limit in Exchange Online; possible account compromise

1. Verify account not compromised
2. wait for daily limit reset
3. review sending patterns against Exchange Online sending limits
4. refer to Troubleshooting Blocked Senders guide

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 4: Tenant sending too much spam/bulk
> Source: onenote

**Symptom**: All outbound emails from tenant blocked with NDR 550 5.7.705 Access denied tenant has exceeded threshold
**Root Cause**: Tenant sending too much spam/bulk mail; common causes: compromised on-premises server routing to EXO, compromised admin account creating connectors, or expired subscription renewal

1. 1) Check for fraud (do NOT run diagnostic if fraud)
2. 2) Run Validate EOP Domain Health diagnostic
3. 3) Stop compromise: reset ALL admin passwords, enable MFA/Security Defaults
4. 4) Review outbound spam policy, connectors, mail flow
5. 5) After stopping compromise run recovery action to unblock
6. refer to aka.ms/list35

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 5: Tenant exceeded outbound spam threshold
> Source: ado-wiki

**Symptom**: GoDaddy tenant blocked with 5.7.705 Tenant Exceeded Threshold error
**Root Cause**: Tenant exceeded outbound spam threshold due to compromised account. GoDaddy cases use shared tenant UnityForDogBarking.co (0489dd82-284e-48f5-8744-f815bd65a769).

1. 1) ALL correspondence via EMAIL only - DO NOT CALL. 2) Run diagnostics with Add Alternate Tenant using PartnerEndCustomer Tenant ID. 3) Run EOP Domain Health (manual blocklist? throttled events? connectors deleted?), EOP User Health (MFA enabled?), Display Mail Flow Overview (Security Defaults?). 4) If Manual Blocklist: escalate per guidance. 5) If only ThrottledTenant: run Tenant Exceeded Threshold diagnostic to release. 6) If diagnostic removes block, send confirmation and close - no need to wait for GoDaddy response. 7) For EU tenants: use EU Assist Add Alternate Tenant and editable Tenant ID in Escalation tab.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 6: Compromised account or exceeded Outbound
> Source: ado-wiki

**Symptom**: Sender restricted - NDR 5.1.8
**Root Cause**: Compromised account or exceeded Outbound Spam Policy limits. Send-as: individual sender policy applies.

1. Remove from Restricted Users. Remediate compromise. Adjust policy. Shared mailbox: apply to ALL users.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 7: Exceeded RRL (default 10000/day). RecipientLimitPerDay=0
> Source: ado-wiki

**Symptom**: NDR 5.1.90/5.2.0 - exceeded Recipient Rate Limit
**Root Cause**: Exceeded RRL (default 10000/day). RecipientLimitPerDay=0 means default.

1. Wait 24h. Adjust policy (use 0 not 10000). Check compromise. Bulk relay: use third-party.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 8: Large volume from domains not
> Source: ado-wiki

**Symptom**: NDR 5.7.750 - unregistered domain blocked
**Root Cause**: Large volume from domains not provisioned as Accepted Domains.

1. Validate Domain Health diagnostic. Add Accepted Domains. Check compromise. Release diagnostic.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 9: Too much spam/bulk from organization.
> Source: ado-wiki

**Symptom**: NDR 5.7.705 - Tenant exceeded outbound threshold
**Root Cause**: Too much spam/bulk from organization.

1. Follow aka.ms/mdofraud.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 10: 发送账户因发送过多垃圾邮件被 EOP 阻止，通常因账户被钓鱼或恶意软件入侵
> Source: mslearn

**Symptom**: 发件人收到 NDR 5.1.8 'Access denied, bad outbound sender'，无法发送邮件
**Root Cause**: 发送账户因发送过多垃圾邮件被 EOP 阻止，通常因账户被钓鱼或恶意软件入侵

1. 1) 确认并修复账户安全问题
2. 2) 重置账户凭据
3. 3) 联系 Microsoft Support 恢复发送能力

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 11: 发送账户因检测到垃圾邮件活动被 EOP 封禁
> Source: mslearn

**Symptom**: 发件人收到 NDR 5.7.501/502/503 'Access denied, spam abuse detected / banned sender'
**Root Cause**: 发送账户因检测到垃圾邮件活动被 EOP 封禁

1. 1) 验证账户安全问题已解决
2. 2) 重置凭据
3. 3) 联系 Microsoft Support 通过常规渠道恢复发送能力

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 12: 用户账户超出 outbound sending limits 或
> Source: mslearn

**Symptom**: 用户被阻止发送邮件，出现在 Restricted entities 页面，收到 NDR 5.1.8 'Access denied, bad outbound sender'
**Root Cause**: 用户账户超出 outbound sending limits 或 outbound spam policy 限制，通常因账户被入侵发送大量垃圾邮件

1. 1) 先按 compromised account 流程处理：重置密码、启用 MFA、扫描恶意软件、检查 inbox rules 和 delegates
2. 2) 管理员在 Defender portal → Restricted entities 页面解除限制
3. 3) 或使用 PowerShell: Remove-BlockedSenderAddress -SenderAddress user@domain.com
4. 4) 验证 'User restricted from sending email' 告警策略已启用
5. 5) 解除限制通常在 1 小时内生效，最多 24 小时

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 13: 来自该租户的大部分流量被检测为可疑（例如账户被入侵发送大量垃圾邮件），EOP 对整个租户的发送能力施加了封禁
> Source: mslearn

**Symptom**: 租户外发邮件被拒绝，收到 NDR 5.7.705 tenant has exceeded threshold 或 5.7.708 traffic not accepted from this IP
**Root Cause**: 来自该租户的大部分流量被检测为可疑（例如账户被入侵发送大量垃圾邮件），EOP 对整个租户的发送能力施加了封禁

1. 1) 确认并修复所有 compromised 账户和 open relay；2) 通过常规支持渠道联系 Microsoft Support 解除封禁；3) 参考 Fix email delivery issues for error codes 5.7.700 through 5.7.750

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 14: 来自该租户的大量邮件使用了未经验证的域（unprovisioned domains）发送，被 EOP 检测为可疑活动
> Source: mslearn

**Symptom**: 租户外发邮件被拒绝，收到 NDR 5.7.750 Client blocked from sending from unregistered domains
**Root Cause**: 来自该租户的大量邮件使用了未经验证的域（unprovisioned domains）发送，被 EOP 检测为可疑活动

1. 在 Microsoft 365 admin center 中添加并验证所有用于发送邮件的域名。参考 Fix email delivery issues for error codes 5.7.700 through 5.7.750

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 15: When mail enters EOP through
> Source: contentidea-kb

**Symptom**: Email to Office 365 receives NDR: 550 5.7.750 Service unavailable. Client blocked from sending from unregistered domains.
**Root Cause**: When mail enters EOP through IP-based connector and neither sender nor recipient are accepted domains, message is relayed through safe tenant. High volumes or spam/bulk from single IP causes blocking.

1. EOP PG can whitelist IP from safe tenant block list. Prevention: (1) Add sending/receiving domain to Accepted Domains, or (2) Change connector to certificate-based (cert name must match Accepted Domain).

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7/10 - [ContentIdea KB]]`

### Phase 16: 在一定时间窗口内（如每小时）超过一半的邮件被识别为垃圾邮件，用户即被封禁发送。通常因账户被入侵（钓鱼/恶意软件）导致发送大量垃圾邮件
> Source: mslearn

**Symptom**: 用户发送外部邮件被限制/阻止，收到通知提示因发送 outbound spam 而被封禁
**Root Cause**: 在一定时间窗口内（如每小时）超过一半的邮件被识别为垃圾邮件，用户即被封禁发送。通常因账户被入侵（钓鱼/恶意软件）导致发送大量垃圾邮件

1. 1) 调查账户是否被入侵（compromised account），按 compromised account 流程恢复。2) Admin 在 Security Portal > Restricted entities 中解除用户封禁。3) 大部分 outbound spam 会通过 high-risk delivery pool 路由

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Outbound emails fail with NDR 550 5.7.750 - Client blocke... | Sending domain not added as | -> Phase 1 |
| Outbound emails fail with NDR 550 5.1.8 Access denied bad... | Sender account exceeded Exchange Online | -> Phase 2 |
| Outbound emails fail with NDR 5.1.90 - reached daily limi... | Sender exceeded daily recipient rate | -> Phase 3 |
| All outbound emails from tenant blocked with NDR 550 5.7.... | Tenant sending too much spam/bulk | -> Phase 4 |
| GoDaddy tenant blocked with 5.7.705 Tenant Exceeded Thres... | Tenant exceeded outbound spam threshold | -> Phase 5 |
| Sender restricted - NDR 5.1.8 | Compromised account or exceeded Outbound | -> Phase 6 |
| NDR 5.1.90/5.2.0 - exceeded Recipient Rate Limit | Exceeded RRL (default 10000/day). RecipientLimitPerDay=0 | -> Phase 7 |
| NDR 5.7.750 - unregistered domain blocked | Large volume from domains not | -> Phase 8 |
| NDR 5.7.705 - Tenant exceeded outbound threshold | Too much spam/bulk from organization. | -> Phase 9 |
| 发件人收到 NDR 5.1.8 'Access denied, bad outbound sender'，无法发送邮件 | 发送账户因发送过多垃圾邮件被 EOP 阻止，通常因账户被钓鱼或恶意软件入侵 | -> Phase 10 |
| 发件人收到 NDR 5.7.501/502/503 'Access denied, spam abuse dete... | 发送账户因检测到垃圾邮件活动被 EOP 封禁 | -> Phase 11 |
| 用户被阻止发送邮件，出现在 Restricted entities 页面，收到 NDR 5.1.8 'Access... | 用户账户超出 outbound sending limits 或 | -> Phase 12 |
| 租户外发邮件被拒绝，收到 NDR 5.7.705 tenant has exceeded threshold 或 ... | 来自该租户的大部分流量被检测为可疑（例如账户被入侵发送大量垃圾邮件），EOP 对整个租户的发送能力施加了封禁 | -> Phase 13 |
| 租户外发邮件被拒绝，收到 NDR 5.7.750 Client blocked from sending from... | 来自该租户的大量邮件使用了未经验证的域（unprovisioned domains）发送，被 EOP 检测为可疑活动 | -> Phase 14 |
| Email to Office 365 receives NDR: 550 5.7.750 Service una... | When mail enters EOP through | -> Phase 15 |
| 用户发送外部邮件被限制/阻止，收到通知提示因发送 outbound spam 而被封禁 | 在一定时间窗口内（如每小时）超过一半的邮件被识别为垃圾邮件，用户即被封禁发送。通常因账户被入侵（钓鱼/恶意软件）导致发送大量垃圾邮件 | -> Phase 16 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Outbound emails fail with NDR 550 5.7.750 - Client blocked from sending from ... | Sending domain not added as accepted domain in M365; or i... | Add and validate all sending domains in M365; use certificate-based outbound ... | 🟢 9 | [OneNote] |
| 2 | Outbound emails fail with NDR 550 5.1.8 Access denied bad outbound sender | Sender account exceeded Exchange Online sending limits or... | Check if account is compromised; if compromised follow Responding to a compro... | 🟢 9 | [OneNote] |
| 3 | Outbound emails fail with NDR 5.1.90 - reached daily limit for message recipi... | Sender exceeded daily recipient rate limit in Exchange On... | Verify account not compromised; wait for daily limit reset; review sending pa... | 🟢 9 | [OneNote] |
| 4 | All outbound emails from tenant blocked with NDR 550 5.7.705 Access denied te... | Tenant sending too much spam/bulk mail; common causes: co... | 1) Check for fraud (do NOT run diagnostic if fraud); 2) Run Validate EOP Doma... | 🟢 9 | [OneNote] |
| 5 | GoDaddy tenant blocked with 5.7.705 Tenant Exceeded Threshold error | Tenant exceeded outbound spam threshold due to compromise... | 1) ALL correspondence via EMAIL only - DO NOT CALL. 2) Run diagnostics with A... | 🟢 8.5 | [ADO Wiki] |
| 6 | Sender restricted - NDR 5.1.8 | Compromised account or exceeded Outbound Spam Policy limi... | Remove from Restricted Users. Remediate compromise. Adjust policy. Shared mai... | 🟢 8.5 | [ADO Wiki] |
| 7 | NDR 5.1.90/5.2.0 - exceeded Recipient Rate Limit | Exceeded RRL (default 10000/day). RecipientLimitPerDay=0 ... | Wait 24h. Adjust policy (use 0 not 10000). Check compromise. Bulk relay: use ... | 🟢 8.5 | [ADO Wiki] |
| 8 | NDR 5.7.750 - unregistered domain blocked | Large volume from domains not provisioned as Accepted Dom... | Validate Domain Health diagnostic. Add Accepted Domains. Check compromise. Re... | 🟢 8.5 | [ADO Wiki] |
| 9 | NDR 5.7.705 - Tenant exceeded outbound threshold | Too much spam/bulk from organization. | Follow aka.ms/mdofraud. | 🟢 8.5 | [ADO Wiki] |
| 10 | 发件人收到 NDR 5.1.8 'Access denied, bad outbound sender'，无法发送邮件 | 发送账户因发送过多垃圾邮件被 EOP 阻止，通常因账户被钓鱼或恶意软件入侵 | 1) 确认并修复账户安全问题; 2) 重置账户凭据; 3) 联系 Microsoft Support 恢复发送能力 | 🔵 7.5 | [MS Learn] |
| 11 | 发件人收到 NDR 5.7.501/502/503 'Access denied, spam abuse detected / banned sender' | 发送账户因检测到垃圾邮件活动被 EOP 封禁 | 1) 验证账户安全问题已解决; 2) 重置凭据; 3) 联系 Microsoft Support 通过常规渠道恢复发送能力 | 🔵 7.5 | [MS Learn] |
| 12 | 用户被阻止发送邮件，出现在 Restricted entities 页面，收到 NDR 5.1.8 'Access denied, bad outboun... | 用户账户超出 outbound sending limits 或 outbound spam policy 限制，... | 1) 先按 compromised account 流程处理：重置密码、启用 MFA、扫描恶意软件、检查 inbox rules 和 delegates;... | 🔵 7.5 | [MS Learn] |
| 13 | 租户外发邮件被拒绝，收到 NDR 5.7.705 tenant has exceeded threshold 或 5.7.708 traffic not ... | 来自该租户的大部分流量被检测为可疑（例如账户被入侵发送大量垃圾邮件），EOP 对整个租户的发送能力施加了封禁 | 1) 确认并修复所有 compromised 账户和 open relay；2) 通过常规支持渠道联系 Microsoft Support 解除封禁；3)... | 🔵 7.5 | [MS Learn] |
| 14 | 租户外发邮件被拒绝，收到 NDR 5.7.750 Client blocked from sending from unregistered domains | 来自该租户的大量邮件使用了未经验证的域（unprovisioned domains）发送，被 EOP 检测为可疑活动 | 在 Microsoft 365 admin center 中添加并验证所有用于发送邮件的域名。参考 Fix email delivery issues f... | 🔵 7.5 | [MS Learn] |
| 15 | Email to Office 365 receives NDR: 550 5.7.750 Service unavailable. Client blo... | When mail enters EOP through IP-based connector and neith... | EOP PG can whitelist IP from safe tenant block list. Prevention: (1) Add send... | 🔵 7 | [ContentIdea KB] |
| 16 | 用户发送外部邮件被限制/阻止，收到通知提示因发送 outbound spam 而被封禁 | 在一定时间窗口内（如每小时）超过一半的邮件被识别为垃圾邮件，用户即被封禁发送。通常因账户被入侵（钓鱼/恶意软件）导... | 1) 调查账户是否被入侵（compromised account），按 compromised account 流程恢复。2) Admin 在 Secur... | 🔵 6.5 | [MS Learn] |
