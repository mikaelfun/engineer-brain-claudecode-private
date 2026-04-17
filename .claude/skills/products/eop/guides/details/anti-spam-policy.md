# EOP 反垃圾邮件策略配置与优先级 - Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: mslearn-eop-anti-spam-filtering-guide.md, mslearn-eop-recommended-settings.md, ado-wiki-b-Bulk-Confidence-Level.md, ado-wiki-a-Spam-Confidence-Level.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Deprecated country codes (XJ Jan
> Source: ado-wiki

**Symptom**: Administrators unable to modify Spam filter policies; UI error 'operation could not be completed' caused by invalid ISO 3166-1 region codes XJ/XE/XS or unsupported codes SS/EH
**Root Cause**: Deprecated country codes (XJ Jan Mayen, XE Sint Eustatius, XS Saba) or valid but UI-unsupported codes (SS South Sudan, EH Western Sahara) in RegionBlockList

1. Remove invalid codes via PowerShell: Set-HostedContentFilterPolicy -Identity 'Policy Name' -RegionBlockList @{Remove='XJ','XE','XS','SS','EH'}. Bug 6740044 for SS/EH UI support.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: Orphaned Policy object created when
> Source: ado-wiki

**Symptom**: Threat Policy (AntiSpam/AntiPhish etc) cannot be created from UI; error 'POLICYNAME already exists' in HAR
**Root Cause**: Orphaned Policy object created when New-*Rule cmdlet fails during UI creation; policy exists without associated rule (Bug 5694112)

1. Check for orphaned policy via PowerShell (e.g. Get-HostedContentFilterPolicy). Remove the orphaned policy object, then recreate from UI. Or create both policy and rule via PowerShell.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 3: BCL threshold misconfiguration or MarkAsSpamBulkMail
> Source: ado-wiki

**Symptom**: Bulk email not filtered as expected or legitimate bulk emails quarantined
**Root Cause**: BCL threshold misconfiguration or MarkAsSpamBulkMail setting. When On (default), BCL>=threshold converts to SCL 6. STRICT preset BCL threshold changed from 4 to 5.

1. Check MarkAsSpamBulkMail via PowerShell. Adjust BCL threshold (Default=7, Standard=6, Strict=5). Use Advanced Hunting to identify bulk senders. Submit wanted senders for TABL allow entry.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 4: Anti-spam policy 中的 BCL (Bulk
> Source: mslearn

**Symptom**: 合法的 bulk/marketing 邮件被 EOP 标记为 Bulk email 移至 Junk 或被隔离，或反之用户收到大量不想要的 bulk 邮件
**Root Cause**: Anti-spam policy 中的 BCL (Bulk Complaint Level) 阈值设置不当。默认阈值：Default policy=7, Standard preset=6, Strict preset=5。BCL 值越高表示发件人投诉率越高。MarkAsSpamBulkMail 设置为 On 时，超过阈值的 bulk 邮件 SCL 被设为 6

1. 1) 检查邮件 header X-Microsoft-Antispam 中的 BCL 值
2. 2) 收集多封问题邮件计算平均 BCL
3. 3) 在 Defender portal → Anti-Spam policy 中调整 BCL 阈值：降低阈值=拦截更多 bulk，升高阈值=放行更多 bulk
4. 4) 设置 bulk message action 为 Quarantine（严格）或 Move to Junk（宽松）
5. 5) 对 C-suite 等重要用户可创建专属 policy 设定更严格阈值
6. 6) 必要时配合 transport rule 按邮件内容关键词过滤 bulk

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 5: Anti-spam policy 变更需要最长 1 小时才能在整个服务中传播生效
> Source: mslearn

**Symptom**: 修改 anti-spam policy 后设置未立即生效，邮件仍按旧策略处理
**Root Cause**: Anti-spam policy 变更需要最长 1 小时才能在整个服务中传播生效

1. 保存更改后等待最多 1 小时。如超过 1 小时仍未生效，检查是否有更高优先级的 policy（如 Preset Security Policy）覆盖了自定义策略

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Administrators unable to modify Spam filter policies; UI ... | Deprecated country codes (XJ Jan | -> Phase 1 |
| Threat Policy (AntiSpam/AntiPhish etc) cannot be created ... | Orphaned Policy object created when | -> Phase 2 |
| Bulk email not filtered as expected or legitimate bulk em... | BCL threshold misconfiguration or MarkAsSpamBulkMail | -> Phase 3 |
| 合法的 bulk/marketing 邮件被 EOP 标记为 Bulk email 移至 Junk 或被隔离，或反... | Anti-spam policy 中的 BCL (Bulk | -> Phase 4 |
| 修改 anti-spam policy 后设置未立即生效，邮件仍按旧策略处理 | Anti-spam policy 变更需要最长 1 小时才能在整个服务中传播生效 | -> Phase 5 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Administrators unable to modify Spam filter policies; UI error 'operation cou... | Deprecated country codes (XJ Jan Mayen, XE Sint Eustatius... | Remove invalid codes via PowerShell: Set-HostedContentFilterPolicy -Identity ... | 🟢 8.5 | [ADO Wiki] |
| 2 | Threat Policy (AntiSpam/AntiPhish etc) cannot be created from UI; error 'POLI... | Orphaned Policy object created when New-*Rule cmdlet fail... | Check for orphaned policy via PowerShell (e.g. Get-HostedContentFilterPolicy)... | 🟢 8.5 | [ADO Wiki] |
| 3 | Bulk email not filtered as expected or legitimate bulk emails quarantined | BCL threshold misconfiguration or MarkAsSpamBulkMail sett... | Check MarkAsSpamBulkMail via PowerShell. Adjust BCL threshold (Default=7, Sta... | 🟢 8.5 | [ADO Wiki] |
| 4 | 合法的 bulk/marketing 邮件被 EOP 标记为 Bulk email 移至 Junk 或被隔离，或反之用户收到大量不想要的 bulk 邮件 | Anti-spam policy 中的 BCL (Bulk Complaint Level) 阈值设置不当。默认阈... | 1) 检查邮件 header X-Microsoft-Antispam 中的 BCL 值; 2) 收集多封问题邮件计算平均 BCL; 3) 在 Defen... | 🔵 7.5 | [MS Learn] |
| 5 | 修改 anti-spam policy 后设置未立即生效，邮件仍按旧策略处理 | Anti-spam policy 变更需要最长 1 小时才能在整个服务中传播生效 | 保存更改后等待最多 1 小时。如超过 1 小时仍未生效，检查是否有更高优先级的 policy（如 Preset Security Policy）覆盖了自定义策略 | 🔵 6.5 | [MS Learn] |
