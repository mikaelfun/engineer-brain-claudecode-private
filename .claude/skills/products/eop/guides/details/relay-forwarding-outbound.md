# EOP 中继/转发/外发路由与 HRDP - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Relay-Pools.md, mslearn-email-forwarding-alert-investigation.md, mslearn-email-delivery-troubleshooting.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Gmail blocking due to poor
> Source: ado-wiki

**Symptom**: Emails from M365 to Gmail blocked with 550 5.7.1 very low reputation of sending domain or 421 4.7.28 rate limited
**Root Cause**: Gmail blocking due to poor domain/IP reputation. Common causes: missing or failing SPF/DKIM/DMARC authentication, domain not verified with Gmail Postmaster Tools, or high spam rate from sending dom...

1. 1) Verify SPF/DKIM/DMARC all configured and passing per https://techcommunity.microsoft.com/t5/exchange-team-blog/authenticate-outbound-email-to-improve-deliverability/ba-p/3947623. 2) For domain errors: verify domain with Gmail Postmaster Tools (postmaster.google.com), check Domain Reputation/Spam Rate/Authentication pages. 3) For IP errors: review Google Sending Guidelines at https://support.google.com/mail/answer/81126. 4) Before escalating to PG, confirm authentication passes and reputation is good - include screenshots.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: Messages sent via Relay Pool:
> Source: ado-wiki

**Symptom**: Outbound forwarded/relayed email from M365 lands in recipient Junk or is rejected
**Root Cause**: Messages sent via Relay Pool: sender not in accepted domain, SPF fails, DKIM not configured. Relay Pool IPs (40.95.0.0/16) not in SPF records.

1. Ensure forwarded messages meet ONE: (1) sender in accepted domain, (2) SPF passes on inbound, (3) DKIM passes. For third-party MX, enable Enhanced Filtering.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: SRS not applied for Relay
> Source: ado-wiki

**Symptom**: SPF fails for forwarded messages through M365, DMARC fails at recipient, rejected by DMARC policy
**Root Cause**: SRS not applied for Relay Pool. P1 From not modified, causing SPF fail at recipient.

1. Ensure SPF or DKIM passes on inbound so SRS applied and message sent via Regular Pool. Use Enhanced Filtering if MX to third-party.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: Outbound Spam Policy forwarding Automatic=Off
> Source: ado-wiki

**Symptom**: NDR 5.7.520 - External forwarding restricted
**Root Cause**: Outbound Spam Policy forwarding Automatic=Off since 2021.

1. Custom policy for specific users with forwarding On. Default Off.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 5: Outbound spam filter policy 中
> Source: mslearn

**Symptom**: 用户自动转发邮件给外部收件人时收到 NDR 5.7.520 Access denied, Your organization does not allow external forwarding
**Root Cause**: Outbound spam filter policy 中 Automatic forwarding 设置为 Off 或 Automatic - System-controlled（现在等同于 Off），阻止了所有用户通过 Inbox rules 或 mailbox forwarding (ForwardingSmtpAddress) 的外部自动转发

1. 1) 如需允许特定用户转发：创建新 outbound spam filter policy → Automatic forwarding=On → 仅 scope 到需要转发的用户/组
2. 2) 如需限制转发目标域：使用 Remote Domain 的 AutoForwardEnabled 设置按域控制
3. 3) 注意优先级：outbound spam policy Off > Remote Domain allow → block wins
4. 4) 可通过 Auto forwarded messages report 监控转发行为
5. 5) 管理员通过 Set-Mailbox ForwardingAddress 配置的转发不受 outbound spam policy 影响

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 6: Remote Domain 配置中 AutoForwardEnabled 被设为
> Source: mslearn

**Symptom**: 用户配置了 Inbox rule 自动转发邮件到外部域，但邮件未到达外部收件人且无 NDR 或错误提示
**Root Cause**: Remote Domain 配置中 AutoForwardEnabled 被设为 $false，该设置静默丢弃自动转发邮件而不向用户发送错误通知。Remote Domain 设置覆盖用户的 Inbox rule 和 Outlook forwarding 设置

1. 1) 检查 Remote Domain 设置：Get-RemoteDomain | Where {$_.AutoForwardEnabled -eq $false}
2. 2) 如需允许转发到特定域，创建对应 Remote Domain 并设置 AutoForwardEnabled=$true
3. 3) 注意：管理员通过 Set-Mailbox ForwardingAddress 和 mail flow rules 配置的转发不受 Remote Domain 影响
4. 4) OOF replies、delivery reports、NDR 也可被 Remote Domain 设置控制

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 7: Inbound connector 的 TlsSenderCertificateName 与
> Source: mslearn

**Symptom**: 通过 M365 中继外发邮件时收到 NDR 550 5.7.64 TenantAttribution 错误
**Root Cause**: Inbound connector 的 TlsSenderCertificateName 与 on-prem 发送服务器使用的证书不匹配，M365 无法识别发送服务器的身份

1. 1) 首选：重新运行 HCW 更新 inbound connector（hybrid 场景）
2. 2) 手动更新 connector 确保证书匹配
3. 3) 检查 send connector 日志确认实际使用的证书指纹
4. 4) 确保发件人域或证书域已在 M365 租户中验证

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 8: M365 检测到入站邮件 SPF/DKIM 认证失败，将转发邮件路由到 relay
> Source: mslearn

**Symptom**: 转发或中继邮件被拒绝，收到 NDR 550 5.7.367 'Remote server returned not permitted to relay'，下游网关（如 Proofpoint/Barracuda）拒绝接收
**Root Cause**: M365 检测到入站邮件 SPF/DKIM 认证失败，将转发邮件路由到 relay pool（未发布的 IP 池，不在 M365 SPF 记录中），下游网关因 relay pool IP 不在允许范围内拒绝邮件

1. 1) 启用 Enhanced Filtering for Connectors 修正 SPF 验证（当 MX 指向第三方服务时）
2. 2) 确保发件域在 M365 accepted domains 中
3. 3) 确保 SPF 或 DKIM 在邮件进入 M365 时通过
4. 4) 减少多跳复杂转发链
5. 5) Message trace 检查 OutboundIpPoolName 属性确认是否使用了 relay pool

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 9: 发件域的 SPF DNS 记录配置错误，或邮件被 M365
> Source: mslearn

**Symptom**: 外发邮件被退回，收到 NDR 550 5.7.23，目标邮件服务器拒绝
**Root Cause**: 发件域的 SPF DNS 记录配置错误，或邮件被 M365 判定为垃圾邮件后路由到 High Risk Delivery Pool（HRDP），HRDP 的 IP 不在发件域 SPF 记录中，导致目标服务器 SPF 校验失败

1. 1) 验证域的 SPF DNS 记录正确包含所有发送源
2. 2) 在 M365 中注册所有使用的域
3. 3) 将 on-premises IP 加入域的 SPF 记录
4. 4) 确认邮件未被误判为垃圾邮件路由到 HRDP
5. 5) 如被误判为垃圾邮件联系 Microsoft Support

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

### Phase 10: M365 检测到外发邮件为垃圾邮件、发件域无 A 记录和 MX
> Source: mslearn

**Symptom**: 外发邮件被路由到 High-Risk Delivery Pool (HRDP)，导致目标服务器拒收或邮件延迟/丢失
**Root Cause**: M365 检测到外发邮件为垃圾邮件、发件域无 A 记录和 MX 记录、或账户超出发送限制，将邮件路由到 HRDP 专用低信誉 IP 池。HRDP 的 IP 可能被外部 blocklist 列入

1. 1) Message trace 检查 OutboundIpPoolName 属性确认使用了哪个出站池
2. 2) 确保发件域在 DNS 有 A 记录和 MX 记录
3. 3) 排查账户是否被入侵并发送了垃圾邮件
4. 4) 检查 outbound spam policy 配置
5. 5) 如邮件被误判为垃圾邮件联系 Microsoft Support

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Emails from M365 to Gmail blocked with 550 5.7.1 very low... | Gmail blocking due to poor | -> Phase 1 |
| Outbound forwarded/relayed email from M365 lands in recip... | Messages sent via Relay Pool: | -> Phase 2 |
| SPF fails for forwarded messages through M365, DMARC fail... | SRS not applied for Relay | -> Phase 3 |
| NDR 5.7.520 - External forwarding restricted | Outbound Spam Policy forwarding Automatic=Off | -> Phase 4 |
| 用户自动转发邮件给外部收件人时收到 NDR 5.7.520 Access denied, Your organiz... | Outbound spam filter policy 中 | -> Phase 5 |
| 用户配置了 Inbox rule 自动转发邮件到外部域，但邮件未到达外部收件人且无 NDR 或错误提示 | Remote Domain 配置中 AutoForwardEnabled 被设为 | -> Phase 6 |
| 通过 M365 中继外发邮件时收到 NDR 550 5.7.64 TenantAttribution 错误 | Inbound connector 的 TlsSenderCertificateName 与 | -> Phase 7 |
| 转发或中继邮件被拒绝，收到 NDR 550 5.7.367 'Remote server returned not... | M365 检测到入站邮件 SPF/DKIM 认证失败，将转发邮件路由到 relay | -> Phase 8 |
| 外发邮件被退回，收到 NDR 550 5.7.23，目标邮件服务器拒绝 | 发件域的 SPF DNS 记录配置错误，或邮件被 M365 | -> Phase 9 |
| 外发邮件被路由到 High-Risk Delivery Pool (HRDP)，导致目标服务器拒收或邮件延迟/丢失 | M365 检测到外发邮件为垃圾邮件、发件域无 A 记录和 MX | -> Phase 10 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Emails from M365 to Gmail blocked with 550 5.7.1 very low reputation of sendi... | Gmail blocking due to poor domain/IP reputation. Common c... | 1) Verify SPF/DKIM/DMARC all configured and passing per https://techcommunity... | 🟢 8.5 | [ADO Wiki] |
| 2 | Outbound forwarded/relayed email from M365 lands in recipient Junk or is reje... | Messages sent via Relay Pool: sender not in accepted doma... | Ensure forwarded messages meet ONE: (1) sender in accepted domain, (2) SPF pa... | 🟢 8.5 | [ADO Wiki] |
| 3 | SPF fails for forwarded messages through M365, DMARC fails at recipient, reje... | SRS not applied for Relay Pool. P1 From not modified, cau... | Ensure SPF or DKIM passes on inbound so SRS applied and message sent via Regu... | 🟢 8.5 | [ADO Wiki] |
| 4 | NDR 5.7.520 - External forwarding restricted | Outbound Spam Policy forwarding Automatic=Off since 2021. | Custom policy for specific users with forwarding On. Default Off. | 🟢 8.5 | [ADO Wiki] |
| 5 | 用户自动转发邮件给外部收件人时收到 NDR 5.7.520 Access denied, Your organization does not allow... | Outbound spam filter policy 中 Automatic forwarding 设置为 Of... | 1) 如需允许特定用户转发：创建新 outbound spam filter policy → Automatic forwarding=On → 仅 s... | 🔵 7.5 | [MS Learn] |
| 6 | 用户配置了 Inbox rule 自动转发邮件到外部域，但邮件未到达外部收件人且无 NDR 或错误提示 | Remote Domain 配置中 AutoForwardEnabled 被设为 $false，该设置静默丢弃自动... | 1) 检查 Remote Domain 设置：Get-RemoteDomain | Where {$_.AutoForwardEnabled -eq $f... | 🔵 7.5 | [MS Learn] |
| 7 | 通过 M365 中继外发邮件时收到 NDR 550 5.7.64 TenantAttribution 错误 | Inbound connector 的 TlsSenderCertificateName 与 on-prem 发送... | 1) 首选：重新运行 HCW 更新 inbound connector（hybrid 场景）; 2) 手动更新 connector 确保证书匹配; 3) ... | 🔵 6.5 | [MS Learn] |
| 8 | 转发或中继邮件被拒绝，收到 NDR 550 5.7.367 'Remote server returned not permitted to relay'... | M365 检测到入站邮件 SPF/DKIM 认证失败，将转发邮件路由到 relay pool（未发布的 IP 池，... | 1) 启用 Enhanced Filtering for Connectors 修正 SPF 验证（当 MX 指向第三方服务时）; 2) 确保发件域在 M... | 🔵 6.5 | [MS Learn] |
| 9 | 外发邮件被退回，收到 NDR 550 5.7.23，目标邮件服务器拒绝 | 发件域的 SPF DNS 记录配置错误，或邮件被 M365 判定为垃圾邮件后路由到 High Risk Deliv... | 1) 验证域的 SPF DNS 记录正确包含所有发送源; 2) 在 M365 中注册所有使用的域; 3) 将 on-premises IP 加入域的 SP... | 🔵 6.5 | [MS Learn] |
| 10 | 外发邮件被路由到 High-Risk Delivery Pool (HRDP)，导致目标服务器拒收或邮件延迟/丢失 | M365 检测到外发邮件为垃圾邮件、发件域无 A 记录和 MX 记录、或账户超出发送限制，将邮件路由到 HRDP ... | 1) Message trace 检查 OutboundIpPoolName 属性确认使用了哪个出站池; 2) 确保发件域在 DNS 有 A 记录和 MX... | 🔵 6.5 | [MS Learn] |
