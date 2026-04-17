# EOP 恶意邮件绕过过滤 (FN) 与投递覆盖 - Quick Reference

**Entries**: 7 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | 恶意邮件/垃圾邮件绕过 EOP 过滤到达用户收件箱（false negative） | EOP anti-spam/anti-phishing 过滤器未能检测到恶意邮件，可能原因：1) 新型攻击模式; ... | 1) 用户报告为 Phishing/Junk; 2) 管理员从 Submissions 页面提交给 Microsoft 分析; 3) 在 Tenant A... | 🔵 7.5 | [MS Learn] |
| 2 📋 | 恶意软件附件绕过 EOP anti-malware 过滤器到达用户邮箱 | 零日恶意软件（zero-day malware）：该恶意软件变种此前未被捕获和分析，尚无对应的恶意软件定义和签名。... | 1) 使用 Message trace 追踪邮件; 2) 到 Microsoft Security Intelligence (https://www.m... | 🔵 7.5 | [MS Learn] |
| 3 📋 | 用户配置了 Outlook Safe Senders 或管理员配置了 allowed sender/domain list 后，恶意邮件绕过 EOP 过滤... | Safe Sender list 和 allowed sender/domain list 会覆盖 spam/sp... | 1) 优先使用 Tenant Allow/Block List 而非 Safe Sender list 或 anti-spam policy allowe... | 🔵 7.5 | [MS Learn] |
| 4 📋 | Admin submission 结果显示 'Allowed due to organizational overrides'，恶意邮件/垃圾邮件未被 E... | 组织级设置覆盖了 EOP 过滤判定，可能来源：1) Connection Filter IP Allow List... | 1) 查看 submission result details 确认具体 override 来源; 2) 审查并移除不必要的 IP Allow List ... | 🔵 7.5 | [MS Learn] |
| 5 📋 | Admin submission 结果显示 'Allowed due to user overrides'，垃圾邮件/钓鱼邮件到达用户收件箱 | 收件人邮箱中的 Outlook 可配置允许设置覆盖了 EOP 过滤：Safe Senders List、Safe ... | 1) 查看 submission result details 确认具体 user override 类型; 2) 使用 Get-MailboxJunkE... | 🔵 7.5 | [MS Learn] |
| 6 📋 | 配置了 Standard/Strict Preset Security Policy 但用户仍收到垃圾邮件，或合法邮件意外被隔离 | Policy 优先级问题：Custom policies 优先于 Standard preset，Standard... | 1) 检查 policy precedence 顺序：custom > Standard > Strict > Built-in protection; ... | 🔵 7.5 | [MS Learn] |
| 7 📋 | 钓鱼邮件绕过 EOP anti-phishing 过滤到达收件箱，message header 显示 SCL:-1 且 SFV:SKN 或 SFV:SFE | 组织级或用户级设置覆盖了 EOP 的 phishing verdict：1) Transport rule 设置 ... | 1) 检查 X-Forefront-Antispam-Report header 中 SFV 值确定 bypass 原因; 2) 使用 Message H... | 🔵 7.5 | [MS Learn] |

## Quick Troubleshooting Path

1. 1) 用户报告为 Phishing/Junk `[MS Learn]`
2. 1) 使用 Message trace 追踪邮件 `[MS Learn]`
3. 1) 优先使用 Tenant Allow/Block List 而非 Safe Sender list 或 anti-spam policy allowed lists `[MS Learn]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/false-negative-bypass.md)
