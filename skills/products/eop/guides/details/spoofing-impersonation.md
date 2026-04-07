# EOP 仿冒与用户/域名冒充检测 - Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Spoofing-Impersonation.md, mslearn-spoof-intelligence-management.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Inbound Connector with EFSkipLastIP only
> Source: onenote

**Symptom**: Legitimate emails quarantined as CAT:SPOOF after passing through multi-hop relay chain (e.g. VW Group gateway -> on-premises Exchange -> 21V EOP) - SPF softfail + DKIM none -> DMARC fail
**Root Cause**: Inbound Connector with EFSkipLastIP only traces back 1 hop; intermediate relay IPs (not in sender SPF) become the evaluated source IP; DKIM signature stripped by relay chain; Enhanced Filtering not...

1. Configure Enhanced Filtering on Inbound Connector: Set-InboundConnector -EFSkipLastIP $false -EFSkipIPs <all-intermediate-IPs> -EFUsers <test-users-first>
2. verify X-MS-Exchange-ExternalOriginalInternetSender header appears
3. after testing remove -EFUsers to apply org-wide
4. keep rollback command ready

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 2: Anti-phish detects matching display name
> Source: ado-wiki

**Symptom**: Protected user personal email to work account flagged as User Impersonation (CAT:UIMP)
**Root Cause**: Anti-phish detects matching display name from external sender against protected users list.

1. Add personal address to Safe Senders list. Mailbox Intelligence learns relationship over time.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: Spoof detection triggered: sending source
> Source: ado-wiki

**Symptom**: Legitimate external email flagged as spoofing (CAT:SPOOF) due to auth failure from known sender
**Root Cause**: Spoof detection triggered: sending source not in SPF, no DKIM. Common for cloud apps.

1. Add to Spoof Intelligence allow list or TABL Spoofing tab. TABL not available in 21Vianet.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 4: 发件人未通过 SPF/DKIM/DMARC 认证且 composite authentication
> Source: mslearn

**Symptom**: 合法的 spoofed 邮件（如邮件列表、代发邮件、内部应用通知）被 EOP spoof intelligence 阻止或标记为钓鱼
**Root Cause**: 发件人未通过 SPF/DKIM/DMARC 认证且 composite authentication 也未通过，spoof intelligence 自动将其判定为恶意 spoof 并阻止。合法 spoof 场景包括：外部公司代发邮件、邮件列表中继、内部应用发送通知

1. 1) 在 Defender portal → Tenant Allow/Block List → Spoofed senders 中将该发件人/基础设施对标记为 Allow
2. 2) 或在 Spoof intelligence insight 页面覆盖判定
3. 3) PowerShell: New-TenantAllowBlockListSpoofItems 创建允许条目
4. 4) 允许基于 spoofed domain + sending infrastructure 的组合，不影响其他发件人
5. 5) Get-SpoofIntelligenceInsight 可查看 30 天数据

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 5: 管理员在 Tenant Allow/Block List 中创建了
> Source: mslearn

**Symptom**: Tenant Allow/Block List 中存在 spoofed sender 的 allow 条目，compauth=fail 的邮件仍被允许投递
**Root Cause**: 管理员在 Tenant Allow/Block List 中创建了 spoofed sender 的 allow 条目（Tenant Allow/Block List spoof allowed），即使邮件认证检查失败，消息也被允许投递。Header 显示 compauth=fail reason=000 但消息被组织策略允许

1. 管理员应定期审查 Tenant Allow/Block List 中的 spoofed sender allow 条目，确保只有必要的发件人被允许。过度使用 TABL 允许条目会导致本应被拒绝的恶意邮件被投递。在 Email entity page 的 All Overrides 部分可确认是否有 TABL 覆盖

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Legitimate emails quarantined as CAT:SPOOF after passing ... | Inbound Connector with EFSkipLastIP only | -> Phase 1 |
| Protected user personal email to work account flagged as ... | Anti-phish detects matching display name | -> Phase 2 |
| Legitimate external email flagged as spoofing (CAT:SPOOF)... | Spoof detection triggered: sending source | -> Phase 3 |
| 合法的 spoofed 邮件（如邮件列表、代发邮件、内部应用通知）被 EOP spoof intelligence... | 发件人未通过 SPF/DKIM/DMARC 认证且 composite authentication | -> Phase 4 |
| Tenant Allow/Block List 中存在 spoofed sender 的 allow 条目，com... | 管理员在 Tenant Allow/Block List 中创建了 | -> Phase 5 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Legitimate emails quarantined as CAT:SPOOF after passing through multi-hop re... | Inbound Connector with EFSkipLastIP only traces back 1 ho... | Configure Enhanced Filtering on Inbound Connector: Set-InboundConnector -EFSk... | 🟢 9 | [OneNote] |
| 2 | Protected user personal email to work account flagged as User Impersonation (... | Anti-phish detects matching display name from external se... | Add personal address to Safe Senders list. Mailbox Intelligence learns relati... | 🟢 8.5 | [ADO Wiki] |
| 3 | Legitimate external email flagged as spoofing (CAT:SPOOF) due to auth failure... | Spoof detection triggered: sending source not in SPF, no ... | Add to Spoof Intelligence allow list or TABL Spoofing tab. TABL not available... | 🔵 7.5 | [ADO Wiki] |
| 4 | 合法的 spoofed 邮件（如邮件列表、代发邮件、内部应用通知）被 EOP spoof intelligence 阻止或标记为钓鱼 | 发件人未通过 SPF/DKIM/DMARC 认证且 composite authentication 也未通过，s... | 1) 在 Defender portal → Tenant Allow/Block List → Spoofed senders 中将该发件人/基础设施对... | 🔵 7.5 | [MS Learn] |
| 5 | Tenant Allow/Block List 中存在 spoofed sender 的 allow 条目，compauth=fail 的邮件仍被允许投递 | 管理员在 Tenant Allow/Block List 中创建了 spoofed sender 的 allow ... | 管理员应定期审查 Tenant Allow/Block List 中的 spoofed sender allow 条目，确保只有必要的发件人被允许。过度使... | 🔵 7.5 | [MS Learn] |
