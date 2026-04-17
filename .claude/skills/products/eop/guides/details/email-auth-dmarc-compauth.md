# EOP DMARC/CompAuth 与 ARC 信任链 - Comprehensive Troubleshooting Guide

**Entries**: 8 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-email-authentication-spf-dkim-dmarc.md, ado-wiki-a-Spoofing-Impersonation.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: SRS rewrites P1 From for
> Source: onenote

**Symptom**: Auto-forwarded emails from Global M365 to 21V mailbox rejected with 550 5.7.509 - sending domain does not pass DMARC verification (DMARC policy=reject)
**Root Cause**: SRS rewrites P1 From for SPF but does not fix DMARC alignment for forwarded messages; ARC (Authenticated Received Chain) which preserves original authentication results is NOT supported in 21V envi...

1. Create Exchange Transport Rule (ETR) with SCL=-1 to bypass filtering for forwarded messages from trusted source
2. or add sending domain/IP to tenant allow list
3. ARC feature request filed (Issue 4949836) but no ETA for 21V

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 2: DNS TTL values for SPF/DKIM/DMARC
> Source: ado-wiki

**Symptom**: SPF/DKIM/DMARC returns temperror/timeout intermittently for inbound email. Auth-Results header shows dkim=timeout or dmarc=temperror or spf=temperror.
**Root Cause**: DNS TTL values for SPF/DKIM/DMARC records (including sub-entries like nested SPF includes, DKIM CNAME-to-TXT chains) are below 3600 seconds, causing frequent cache expiry and DNS lookup delays exce...

1. 1) Check all DNS TTLs (top-level and sub-entries) using digwebinterface.com with Authoritative server option. 2) Increase all TTLs to >=3600 seconds. 3) For SPF, check nested includes with Vamsoft SPF Policy Tester. 4) For DKIM, check selector CNAME and TXT record TTLs. 5) If issue persists after TTL fix and is quantifiable, escalate to MDO Escalations -- engineering may enable a 1000ms retry timeout. Do NOT offer the extended timeout directly to customers.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: SRS rewrites P1 (MailFrom) sender
> Source: ado-wiki

**Symptom**: Auto-forwarded emails from tenant A to tenant B fail DMARC and are marked as spoof. Auth-Results shows dmarc=fail, SPF domain is rewritten by SRS to forwarding tenant domain (P1 != P2), DKIM for or...
**Root Cause**: SRS rewrites P1 (MailFrom) sender with forwarding tenant domain on forward, breaking SPF alignment with P2 (From). If a 3rd-party email service (MX for forwarding tenant) modifies message body/head...

1. 1) Primary: ensure original sender DKIM-signs with P2 (From) domain AND prevent message modification in transit. 2) If not possible: add TABL spoof allow -- * as spoofed sender, forwarding tenant onmicrosoft.com as sending infrastructure (NOT outlook.com). 3) If 3rd-party supports ARC, add as trusted ARC sealer. Check Authentication-Results-Original header to determine where DKIM breaks. Note: TABL and ARC sealers have limitations in 21V.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: Direct Send allows any Internet
> Source: ado-wiki

**Symptom**: Self-domain spoofing emails delivered to inbox via Direct Send when MX does not point to Microsoft 365; CompAuth=none reason=451 or 905; AuthAs=Anonymous
**Root Cause**: Direct Send allows any Internet device on port 25 to send to M365 mailboxes without authentication. When MX does not point to M365, DMARC policies are not honored and CompAuth checks can be bypassed.

1. Option 1: Lock down M365 to only accept mail from third-party service (connector lockdown). Option 2: Enable Reject Direct Send feature. Option 3: Escalate to MDO Escalations Tier 1 for manual internal list. Temp workaround: transport rule to quarantine messages failing DMARC from accepted domains.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 5: SPF 或 DKIM 未通过且与 From
> Source: mslearn

**Symptom**: 邮件被拒绝或隔离，message header 显示 dmarc=fail action=quarantine/reject，compauth=fail
**Root Cause**: SPF 或 DKIM 未通过且与 From 地址域不对齐，DMARC 策略为 p=quarantine 或 p=reject。可能原因：1) 发件人 SPF/DKIM 配置错误; 2) 收件人使用非 Microsoft 过滤服务导致认证失败

1. 发件人：确保 SPF 包含所有合法源 IP，配置 DKIM，验证 DMARC 对齐。收件人：配置 Enhanced Filtering for Connectors，配置 trusted ARC sealers，将消息修改（页脚/免责声明）移至 M365 执行

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 6: 发件人域未发布 DMARC TXT 记录。DMARC 检查默认通过（bestguesspass），但无法提供实际保护
> Source: mslearn

**Symptom**: 邮件 header 显示 dmarc=bestguesspass action=none，发件人域没有 DMARC 记录，消息正常投递但缺乏认证保护
**Root Cause**: 发件人域未发布 DMARC TXT 记录。DMARC 检查默认通过（bestguesspass），但无法提供实际保护

1. 建议发件人发布 DMARC 记录（p=quarantine 或 p=reject）。虽然消息被接受，但缺少 DMARC 策略意味着发件人域易被冒充。参考：Set up DMARC to validate the From address domain

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 7: 邮件经过中间服务（mailing list/转发服务/安全设备）修改后 SPF 或 DKIM
> Source: mslearn

**Symptom**: 邮件 header 显示 compauth=pass reason=130（ARC validated），经第三方服务/转发后 SPF/DKIM 直接检查失败，但因可信 ARC 签名而通过认证
**Root Cause**: 邮件经过中间服务（mailing list/转发服务/安全设备）修改后 SPF 或 DKIM 失败。Microsoft 365 通过受信任的 ARC（Authenticated Received Chain）签名验证原始认证有效

1. 如果是预期的复杂路由场景，无需操作。中间服务提供商应实现 ARC headers。收件人管理员需在 M365 中配置 trusted ARC sealers（Settings > Email authentication > ARC）。M365 组织间转发时 microsoft.com 的 ARC 签名自动受信任

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 8: 发件人未配置 SPF 和 DKIM，Microsoft 365
> Source: mslearn

**Symptom**: 邮件 header 显示 compauth=pass reason=116/111，通过 PTR（反向 DNS）验证通过认证，但 SPF/DKIM 均未正确配置
**Root Cause**: 发件人未配置 SPF 和 DKIM，Microsoft 365 回退到 PTR 记录验证。发送服务器 IP 的 PTR 记录匹配了 From 地址域名，因此系统将消息视为已认证

1. 发件人应正确配置 SPF 和 DKIM，不应依赖 PTR 回退认证。PTR pass 只是一个指标，表明需要改进 SPF/DKIM 配置。收件人看到此结果时建议通知发件人改进认证设置

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Auto-forwarded emails from Global M365 to 21V mailbox rej... | SRS rewrites P1 From for | -> Phase 1 |
| SPF/DKIM/DMARC returns temperror/timeout intermittently f... | DNS TTL values for SPF/DKIM/DMARC | -> Phase 2 |
| Auto-forwarded emails from tenant A to tenant B fail DMAR... | SRS rewrites P1 (MailFrom) sender | -> Phase 3 |
| Self-domain spoofing emails delivered to inbox via Direct... | Direct Send allows any Internet | -> Phase 4 |
| 邮件被拒绝或隔离，message header 显示 dmarc=fail action=quarantine/r... | SPF 或 DKIM 未通过且与 From | -> Phase 5 |
| 邮件 header 显示 dmarc=bestguesspass action=none，发件人域没有 DMARC... | 发件人域未发布 DMARC TXT 记录。DMARC 检查默认通过（bestguesspass），但无法提供实际保护 | -> Phase 6 |
| 邮件 header 显示 compauth=pass reason=130（ARC validated），经第三方... | 邮件经过中间服务（mailing list/转发服务/安全设备）修改后 SPF 或 DKIM | -> Phase 7 |
| 邮件 header 显示 compauth=pass reason=116/111，通过 PTR（反向 DNS）验... | 发件人未配置 SPF 和 DKIM，Microsoft 365 | -> Phase 8 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Auto-forwarded emails from Global M365 to 21V mailbox rejected with 550 5.7.5... | SRS rewrites P1 From for SPF but does not fix DMARC align... | Create Exchange Transport Rule (ETR) with SCL=-1 to bypass filtering for forw... | 🟢 9 | [OneNote] |
| 2 | SPF/DKIM/DMARC returns temperror/timeout intermittently for inbound email. Au... | DNS TTL values for SPF/DKIM/DMARC records (including sub-... | 1) Check all DNS TTLs (top-level and sub-entries) using digwebinterface.com w... | 🟢 8.5 | [ADO Wiki] |
| 3 | Auto-forwarded emails from tenant A to tenant B fail DMARC and are marked as ... | SRS rewrites P1 (MailFrom) sender with forwarding tenant ... | 1) Primary: ensure original sender DKIM-signs with P2 (From) domain AND preve... | 🟢 8.5 | [ADO Wiki] |
| 4 | Self-domain spoofing emails delivered to inbox via Direct Send when MX does n... | Direct Send allows any Internet device on port 25 to send... | Option 1: Lock down M365 to only accept mail from third-party service (connec... | 🟢 8.5 | [ADO Wiki] |
| 5 | 邮件被拒绝或隔离，message header 显示 dmarc=fail action=quarantine/reject，compauth=fail | SPF 或 DKIM 未通过且与 From 地址域不对齐，DMARC 策略为 p=quarantine 或 p=r... | 发件人：确保 SPF 包含所有合法源 IP，配置 DKIM，验证 DMARC 对齐。收件人：配置 Enhanced Filtering for Conne... | 🔵 7.5 | [MS Learn] |
| 6 | 邮件 header 显示 dmarc=bestguesspass action=none，发件人域没有 DMARC 记录，消息正常投递但缺乏认证保护 | 发件人域未发布 DMARC TXT 记录。DMARC 检查默认通过（bestguesspass），但无法提供实际保护 | 建议发件人发布 DMARC 记录（p=quarantine 或 p=reject）。虽然消息被接受，但缺少 DMARC 策略意味着发件人域易被冒充。参考：... | 🔵 7.5 | [MS Learn] |
| 7 | 邮件 header 显示 compauth=pass reason=130（ARC validated），经第三方服务/转发后 SPF/DKIM 直接检查... | 邮件经过中间服务（mailing list/转发服务/安全设备）修改后 SPF 或 DKIM 失败。Microso... | 如果是预期的复杂路由场景，无需操作。中间服务提供商应实现 ARC headers。收件人管理员需在 M365 中配置 trusted ARC sealer... | 🔵 7.5 | [MS Learn] |
| 8 | 邮件 header 显示 compauth=pass reason=116/111，通过 PTR（反向 DNS）验证通过认证，但 SPF/DKIM 均未正确配置 | 发件人未配置 SPF 和 DKIM，Microsoft 365 回退到 PTR 记录验证。发送服务器 IP 的 P... | 发件人应正确配置 SPF 和 DKIM，不应依赖 PTR 回退认证。PTR pass 只是一个指标，表明需要改进 SPF/DKIM 配置。收件人看到此结果... | 🔵 7.5 | [MS Learn] |
