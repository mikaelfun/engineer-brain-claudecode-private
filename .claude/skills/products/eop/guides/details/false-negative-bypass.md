# EOP 恶意邮件绕过过滤 (FN) 与投递覆盖 - Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Troubleshooting-FP-FN.md, mslearn-eop-recommended-settings.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: EOP anti-spam/anti-phishing 过滤器未能检测到恶意邮件，可能原因：1) 新型攻击模式; 2)
> Source: mslearn

**Symptom**: 恶意邮件/垃圾邮件绕过 EOP 过滤到达用户收件箱（false negative）
**Root Cause**: EOP anti-spam/anti-phishing 过滤器未能检测到恶意邮件，可能原因：1) 新型攻击模式; 2) 发件人允许列表过宽; 3) SCL=-1 transport rule bypass; 4) 组织安全策略配置不足

1. 1) 用户报告为 Phishing/Junk
2. 2) 管理员从 Submissions 页面提交给 Microsoft 分析
3. 3) 在 Tenant Allow/Block List 创建 block 条目
4. 4) 检查是否有 SCL=-1 的 transport rule 需要移除
5. 5) 启用 preset security policies (Standard/Strict)

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 2: 零日恶意软件（zero-day malware）：该恶意软件变种此前未被捕获和分析，尚无对应的恶意软件定义和签名。恶意软件定义每小时更新一次，但新变种在定义发布前可能已被投递
> Source: mslearn

**Symptom**: 恶意软件附件绕过 EOP anti-malware 过滤器到达用户邮箱
**Root Cause**: 零日恶意软件（zero-day malware）：该恶意软件变种此前未被捕获和分析，尚无对应的恶意软件定义和签名。恶意软件定义每小时更新一次，但新变种在定义发布前可能已被投递

1. 1) 使用 Message trace 追踪邮件
2. 2) 到 Microsoft Security Intelligence (https://www.microsoft.com/wdsi/filesubmission) 提交恶意软件样本
3. 3) 启用 common attachments filter 在 anti-malware policy 中阻止高风险文件类型（exe, bat, cmd 等）
4. 4) ZAP for malware 默认启用，会在定义更新后自动隔离恶意邮件
5. 5) 注意：无法通过 transport rule 绕过 malware 过滤，也无法通过任何用户/管理员设置跳过附件的恶意软件扫描
6. 6) 唯一例外是 Advanced Delivery policy 中配置的 SecOps 邮箱

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 3: Safe Sender list 和 allowed
> Source: mslearn

**Symptom**: 用户配置了 Outlook Safe Senders 或管理员配置了 allowed sender/domain list 后，恶意邮件绕过 EOP 过滤（包括 ZAP）到达收件箱
**Root Cause**: Safe Sender list 和 allowed sender/domain list 会覆盖 spam/spoof/phishing 过滤（不覆盖 malware 和 high confidence phishing）。同时 Safe Sender list 会干扰 ZAP 执行，导致 ZAP 无法对已允许发件人的邮件采取行动。攻击者可伪造被允许的发件人域名成功投递恶意邮件

1. 1) 优先使用 Tenant Allow/Block List 而非 Safe Sender list 或 anti-spam policy allowed lists
2. 2) 如必须使用 mail flow rule 允许发件人，务必同时检查 Authentication-Results header 中 dmarc=pass
3. 3) 不要将 popular domains (如 microsoft.com) 或 accepted domains 添加到允许列表
4. 4) 检查邮件 header X-Forefront-Antispam-Report 中的 SFV:SFE (Safe Sender bypass) 或 SFV:SKN (transport rule bypass)
5. 5) 定期审查 IP Allow List 和 allowed sender/domain list，移除不必要的条目
6. 6) 将误判邮件提交给 Microsoft 分析

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 4: 组织级设置覆盖了 EOP 过滤判定，可能来源：1) Connection Filter
> Source: mslearn

**Symptom**: Admin submission 结果显示 'Allowed due to organizational overrides'，恶意邮件/垃圾邮件未被 EOP 过滤到达收件箱
**Root Cause**: 组织级设置覆盖了 EOP 过滤判定，可能来源：1) Connection Filter IP Allow List; 2) Tenant Allow/Block List 的 allow entries; 3) Transport rule 设置 SCL=-1 bypass spam filtering; 4) Enhanced Filtering for Connectors 配置; 5)...

1. 1) 查看 submission result details 确认具体 override 来源
2. 2) 审查并移除不必要的 IP Allow List 条目
3. 3) 检查 transport rules 中的 SCL=-1 规则，如已启用 Enhanced Filtering 则应移除
4. 4) 审查 Tenant Allow/Block List 的 allow entries 是否过宽
5. 5) 确认 SecOps mailbox 配置正确
6. 6) 使用 Get-TransportRule | Where {$_.SetSCL -eq -1} 查找 bypass 规则

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 5: 收件人邮箱中的 Outlook 可配置允许设置覆盖了 EOP 过滤：Safe
> Source: mslearn

**Symptom**: Admin submission 结果显示 'Allowed due to user overrides'，垃圾邮件/钓鱼邮件到达用户收件箱
**Root Cause**: 收件人邮箱中的 Outlook 可配置允许设置覆盖了 EOP 过滤：Safe Senders List、Safe Recipients List、Contacts 中的发件人、或启用了 'Safe Lists only' 模式

1. 1) 查看 submission result details 确认具体 user override 类型
2. 2) 使用 Get-MailboxJunkEmailConfiguration -Identity user@domain.com 检查用户 junk email 设置
3. 3) 移除不当的 Safe Sender 条目
4. 4) 教育用户不要将不可信发件人添加到 Safe Senders
5. 5) 考虑使用 Set-MailboxJunkEmailConfiguration 集中管理
6. 6) 建议使用 Tenant Allow/Block List 替代用户级 Safe Sender

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 6: Policy 优先级问题：Custom policies 优先于 Standard
> Source: mslearn

**Symptom**: 配置了 Standard/Strict Preset Security Policy 但用户仍收到垃圾邮件，或合法邮件意外被隔离
**Root Cause**: Policy 优先级问题：Custom policies 优先于 Standard preset，Standard 优先于 Strict preset，Strict 优先于 Built-in protection。如果用户同时被 custom policy 和 preset policy 覆盖，custom policy 的设置会生效，preset policy 被忽略。此外 Built-i...

1. 1) 检查 policy precedence 顺序：custom > Standard > Strict > Built-in protection
2. 2) 确保目标用户未同时在 custom policy 和 preset policy 中
3. 3) 使用 exceptions 从低优先级 policy 中排除用户
4. 4) Standard preset 中 spam → Junk folder，Strict preset 中 spam → quarantine
5. 5) Standard BCL≥6 → Junk，Strict BCL≥5 → quarantine
6. 6) 使用 Get-EOPProtectionPolicyRule 和 Get-ATPProtectionPolicyRule 验证规则状态

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 7: 组织级或用户级设置覆盖了 EOP 的 phishing verdict：1)
> Source: mslearn

**Symptom**: 钓鱼邮件绕过 EOP anti-phishing 过滤到达收件箱，message header 显示 SCL:-1 且 SFV:SKN 或 SFV:SFE
**Root Cause**: 组织级或用户级设置覆盖了 EOP 的 phishing verdict：1) Transport rule 设置 SCL=-1 bypass spam filtering; 2) IP Allow List; 3) 用户 Safe Sender list; 4) Allowed sender/domain list 中包含了 accepted domains 或 popular domain...

1. 1) 检查 X-Forefront-Antispam-Report header 中 SFV 值确定 bypass 原因
2. 2) 使用 Message Header Analyzer (mha.azurewebsites.net) 解析 headers
3. 3) 移除 anti-spam policy 中的 accepted domains 和 popular domains
4. 4) 使用 Configuration Analyzer 对比 Standard/Strict 推荐设置
5. 5) 完善 SPF/DKIM/DMARC 配置
6. 6) 启用 MFA 防止被钓鱼账户被 compromise
7. 7) 配置 spoof intelligence 并将 action 设为 Quarantine

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| 恶意邮件/垃圾邮件绕过 EOP 过滤到达用户收件箱（false negative） | EOP anti-spam/anti-phishing 过滤器未能检测到恶意邮件，可能原因：1) 新型攻击模式; 2) | -> Phase 1 |
| 恶意软件附件绕过 EOP anti-malware 过滤器到达用户邮箱 | 零日恶意软件（zero-day malware）：该恶意软件变种此前未被捕获和分析，尚无对应的恶意软件定义和签名。恶意软件定义每小时更新一次，但新变种在定义发布前可能已被投递 | -> Phase 2 |
| 用户配置了 Outlook Safe Senders 或管理员配置了 allowed sender/domain ... | Safe Sender list 和 allowed | -> Phase 3 |
| Admin submission 结果显示 'Allowed due to organizational over... | 组织级设置覆盖了 EOP 过滤判定，可能来源：1) Connection Filter | -> Phase 4 |
| Admin submission 结果显示 'Allowed due to user overrides'，垃圾邮... | 收件人邮箱中的 Outlook 可配置允许设置覆盖了 EOP 过滤：Safe | -> Phase 5 |
| 配置了 Standard/Strict Preset Security Policy 但用户仍收到垃圾邮件，或合法... | Policy 优先级问题：Custom policies 优先于 Standard | -> Phase 6 |
| 钓鱼邮件绕过 EOP anti-phishing 过滤到达收件箱，message header 显示 SCL:-1... | 组织级或用户级设置覆盖了 EOP 的 phishing verdict：1) | -> Phase 7 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | 恶意邮件/垃圾邮件绕过 EOP 过滤到达用户收件箱（false negative） | EOP anti-spam/anti-phishing 过滤器未能检测到恶意邮件，可能原因：1) 新型攻击模式; ... | 1) 用户报告为 Phishing/Junk; 2) 管理员从 Submissions 页面提交给 Microsoft 分析; 3) 在 Tenant A... | 🔵 7.5 | [MS Learn] |
| 2 | 恶意软件附件绕过 EOP anti-malware 过滤器到达用户邮箱 | 零日恶意软件（zero-day malware）：该恶意软件变种此前未被捕获和分析，尚无对应的恶意软件定义和签名。... | 1) 使用 Message trace 追踪邮件; 2) 到 Microsoft Security Intelligence (https://www.m... | 🔵 7.5 | [MS Learn] |
| 3 | 用户配置了 Outlook Safe Senders 或管理员配置了 allowed sender/domain list 后，恶意邮件绕过 EOP 过滤... | Safe Sender list 和 allowed sender/domain list 会覆盖 spam/sp... | 1) 优先使用 Tenant Allow/Block List 而非 Safe Sender list 或 anti-spam policy allowe... | 🔵 7.5 | [MS Learn] |
| 4 | Admin submission 结果显示 'Allowed due to organizational overrides'，恶意邮件/垃圾邮件未被 E... | 组织级设置覆盖了 EOP 过滤判定，可能来源：1) Connection Filter IP Allow List... | 1) 查看 submission result details 确认具体 override 来源; 2) 审查并移除不必要的 IP Allow List ... | 🔵 7.5 | [MS Learn] |
| 5 | Admin submission 结果显示 'Allowed due to user overrides'，垃圾邮件/钓鱼邮件到达用户收件箱 | 收件人邮箱中的 Outlook 可配置允许设置覆盖了 EOP 过滤：Safe Senders List、Safe ... | 1) 查看 submission result details 确认具体 user override 类型; 2) 使用 Get-MailboxJunkE... | 🔵 7.5 | [MS Learn] |
| 6 | 配置了 Standard/Strict Preset Security Policy 但用户仍收到垃圾邮件，或合法邮件意外被隔离 | Policy 优先级问题：Custom policies 优先于 Standard preset，Standard... | 1) 检查 policy precedence 顺序：custom > Standard > Strict > Built-in protection; ... | 🔵 7.5 | [MS Learn] |
| 7 | 钓鱼邮件绕过 EOP anti-phishing 过滤到达收件箱，message header 显示 SCL:-1 且 SFV:SKN 或 SFV:SFE | 组织级或用户级设置覆盖了 EOP 的 phishing verdict：1) Transport rule 设置 ... | 1) 检查 X-Forefront-Antispam-Report header 中 SFV 值确定 bypass 原因; 2) 使用 Message H... | 🔵 7.5 | [MS Learn] |
