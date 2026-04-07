# EOP Backscatter NDR 误判 - Quick Reference

**Entries**: 2 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Valid NDR (bounce message) detected as backscatter by EOP and delivered to re... | EOP backscatter rule checks Message-ID/In-Reply-To header... | Request PG to add tenant to anti-backscatter rule allow list via ICM escalati... | 🟢 8 | [OneNote] |
| 2 | 收到大量自己未发送的邮件的 NDR 退信通知（backscatter），用户误以为账户被入侵 | 垃圾邮件发送者伪造用户的 From 地址发送邮件，目标邮件服务器将 NDR 退回给伪造的发件人地址。这种无用的 N... | 1) 检查 Sent Items 确认无异常发送的邮件，如无异常则可忽略 backscatter; 2) 如发现异常邮件则按账户被入侵流程处理（重置密码、... | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Request PG to add tenant to anti-backscatter rule allow list via ICM escalation `[OneNote]`
2. 1) 检查 Sent Items 确认无异常发送的邮件，如无异常则可忽略 backscatter `[MS Learn]`
