# EOP FP/FN 调查与升级流程 - Quick Reference

**Entries**: 4 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Legitimate emails with URLs repeatedly flagged as malware (FP) - short-term w... | EOP URL scanning detects certain URLs as malicious; stand... | Request Safe Links MustNotBrowse from Product Group for long-term URL whiteli... | 🟢 9 | [OneNote] |
| 2 📋 | Phishing email disguised as Microsoft Teams voicemail notification bypasses d... | Phishing campaigns use fake Teams voicemail emails with .... | Compare email to known patterns: Real Teams voicemail has audio.mp3 attachmen... | 🔵 7.5 | [ADO Wiki] |
| 3 📋 | Admin submission 结果显示 'The reason behind this verdict was lost in transit'，无法... | 邮件通过 Hybrid mail flow 在 on-premises Exchange 和 Exchange O... | 1) 检查类似邮件是否直接投递到云邮箱（绕过 hybrid 路由），对比过滤结果; 2) 检查 on-premises Exchange transpor... | 🔵 5.5 | [MS Learn] |
| 4 📋 | US Government (GCC/GCC High/DoD) 环境中 admin/user submission 返回 'Further invest... | 美国政府环境的合规限制：数据不允许离开组织边界，因此 submissions 仅执行 email authenti... | 1) 这是预期行为，非 bug; 2) 需要联系 Microsoft Support 开工单进行人工审查; 3) 管理员仍可查看 authenticati... | 🔵 5.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Request Safe Links MustNotBrowse from Product Group for long-term URL whitelisting in China EOP `[OneNote]`
2. Compare email to known patterns: Real Teams voicemail has audio.mp3 attachment from legitimate sende `[ADO Wiki]`
3. 1) 检查类似邮件是否直接投递到云邮箱（绕过 hybrid 路由），对比过滤结果 `[MS Learn]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/fp-fn-escalation.md)
