# EOP FP/FN 调查与升级流程 - Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 5 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Troubleshooting-FP-FN.md, ado-wiki-a-Triage-FPFN-Diagnostics.md, onenote-fnfp-escalation-process.md, ado-wiki-a-fnfp-pcms-reviews.md, ado-wiki-b-emea-fp-fn-communication-template.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: EOP URL scanning detects certain
> Source: onenote

**Symptom**: Legitimate emails with URLs repeatedly flagged as malware (FP) - short-term whitelisting expires after 1 week to 1 month, causing recurring blocks
**Root Cause**: EOP URL scanning detects certain URLs as malicious; standard FP whitelisting is temporary (1 week-1 month); Safe Links Trust/Allow feature not available in China 21V; no long-term URL allow mechani...

1. Request Safe Links MustNotBrowse from Product Group for long-term URL whitelisting in China EOP
2. this is a PG-level action, not configurable by support engineer or customer directly

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 9/10 - [OneNote]]`

### Phase 2: Phishing campaigns use fake Teams
> Source: ado-wiki

**Symptom**: Phishing email disguised as Microsoft Teams voicemail notification bypasses detection or is misrouted
**Root Cause**: Phishing campaigns use fake Teams voicemail emails with .html attachments mimicking Microsoft 365/Office 365 branding, while real voicemails use .mp3 audio attachments

1. Compare email to known patterns: Real Teams voicemail has audio.mp3 attachment from legitimate sender. Fake voicemail uses .html attachment with Office 365 branding -> MDO scope, investigate with Advanced Hunting (MessageEvents, MessageURLInfo). Real voicemail spam -> route to Teams team.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 3: 邮件通过 Hybrid mail flow 在
> Source: mslearn

**Symptom**: Admin submission 结果显示 'The reason behind this verdict was lost in transit'，无法确定邮件被放行/拦截的原因
**Root Cause**: 邮件通过 Hybrid mail flow 在 on-premises Exchange 和 Exchange Online 之间路由时，EOP 的过滤判定（X-Forefront-Antispam-Report 等 anti-spam headers）在传输过程中丢失

1. 1) 检查类似邮件是否直接投递到云邮箱（绕过 hybrid 路由），对比过滤结果
2. 2) 检查 on-premises Exchange transport rules 是否移除了 anti-spam headers
3. 3) 修正 hybrid 邮件路由配置确保 headers 保留
4. 4) 考虑将邮箱迁移到 Exchange Online 消除 hybrid 路由问题

> :warning: 21Vianet: Not applicable

`[Score: 🔵 5.5/10 - [MS Learn]]`

### Phase 4: 美国政府环境的合规限制：数据不允许离开组织边界，因此 submissions 仅执行 email authentication
> Source: mslearn

**Symptom**: US Government (GCC/GCC High/DoD) 环境中 admin/user submission 返回 'Further investigation needed'，无法获取有效分析结果
**Root Cause**: 美国政府环境的合规限制：数据不允许离开组织边界，因此 submissions 仅执行 email authentication checks 和 policy hits 分析，不执行 payload reputation/detonation 和 grader analysis

1. 1) 这是预期行为，非 bug
2. 2) 需要联系 Microsoft Support 开工单进行人工审查
3. 3) 管理员仍可查看 authentication check 和 policy hits 结果
4. 4) 手动在 Tenant Allow/Block List 添加 block/allow entries 作为临时缓解

> :warning: 21Vianet: Not applicable

`[Score: 🔵 5.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Legitimate emails with URLs repeatedly flagged as malware... | EOP URL scanning detects certain | -> Phase 1 |
| Phishing email disguised as Microsoft Teams voicemail not... | Phishing campaigns use fake Teams | -> Phase 2 |
| Admin submission 结果显示 'The reason behind this verdict was... | 邮件通过 Hybrid mail flow 在 | -> Phase 3 |
| US Government (GCC/GCC High/DoD) 环境中 admin/user submissio... | 美国政府环境的合规限制：数据不允许离开组织边界，因此 submissions 仅执行 email authentication | -> Phase 4 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Legitimate emails with URLs repeatedly flagged as malware (FP) - short-term w... | EOP URL scanning detects certain URLs as malicious; stand... | Request Safe Links MustNotBrowse from Product Group for long-term URL whiteli... | 🟢 9 | [OneNote] |
| 2 | Phishing email disguised as Microsoft Teams voicemail notification bypasses d... | Phishing campaigns use fake Teams voicemail emails with .... | Compare email to known patterns: Real Teams voicemail has audio.mp3 attachmen... | 🔵 7.5 | [ADO Wiki] |
| 3 | Admin submission 结果显示 'The reason behind this verdict was lost in transit'，无法... | 邮件通过 Hybrid mail flow 在 on-premises Exchange 和 Exchange O... | 1) 检查类似邮件是否直接投递到云邮箱（绕过 hybrid 路由），对比过滤结果; 2) 检查 on-premises Exchange transpor... | 🔵 5.5 | [MS Learn] |
| 4 | US Government (GCC/GCC High/DoD) 环境中 admin/user submission 返回 'Further invest... | 美国政府环境的合规限制：数据不允许离开组织边界，因此 submissions 仅执行 email authenti... | 1) 这是预期行为，非 bug; 2) 需要联系 Microsoft Support 开工单进行人工审查; 3) 管理员仍可查看 authenticati... | 🔵 5.5 | [MS Learn] |
