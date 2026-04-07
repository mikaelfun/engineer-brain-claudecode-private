# EOP 外发邮件被阻止 - 发件人/租户限制 (5.1.8/5.1.90/5.7.705/5.7.750) - Quick Reference

**Entries**: 16 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Outbound emails fail with NDR 550 5.7.750 - Client blocked from sending from ... | Sending domain not added as accepted domain in M365; or i... | Add and validate all sending domains in M365; use certificate-based outbound ... | 🟢 9 | [OneNote] |
| 2 📋 | Outbound emails fail with NDR 550 5.1.8 Access denied bad outbound sender | Sender account exceeded Exchange Online sending limits or... | Check if account is compromised; if compromised follow Responding to a compro... | 🟢 9 | [OneNote] |
| 3 📋 | Outbound emails fail with NDR 5.1.90 - reached daily limit for message recipi... | Sender exceeded daily recipient rate limit in Exchange On... | Verify account not compromised; wait for daily limit reset; review sending pa... | 🟢 9 | [OneNote] |
| 4 📋 | All outbound emails from tenant blocked with NDR 550 5.7.705 Access denied te... | Tenant sending too much spam/bulk mail; common causes: co... | 1) Check for fraud (do NOT run diagnostic if fraud); 2) Run Validate EOP Doma... | 🟢 9 | [OneNote] |
| 5 📋 | GoDaddy tenant blocked with 5.7.705 Tenant Exceeded Threshold error | Tenant exceeded outbound spam threshold due to compromise... | 1) ALL correspondence via EMAIL only - DO NOT CALL. 2) Run diagnostics with A... | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Sender restricted - NDR 5.1.8 | Compromised account or exceeded Outbound Spam Policy limi... | Remove from Restricted Users. Remediate compromise. Adjust policy. Shared mai... | 🟢 8.5 | [ADO Wiki] |
| 7 📋 | NDR 5.1.90/5.2.0 - exceeded Recipient Rate Limit | Exceeded RRL (default 10000/day). RecipientLimitPerDay=0 ... | Wait 24h. Adjust policy (use 0 not 10000). Check compromise. Bulk relay: use ... | 🟢 8.5 | [ADO Wiki] |
| 8 📋 | NDR 5.7.750 - unregistered domain blocked | Large volume from domains not provisioned as Accepted Dom... | Validate Domain Health diagnostic. Add Accepted Domains. Check compromise. Re... | 🟢 8.5 | [ADO Wiki] |
| 9 📋 | NDR 5.7.705 - Tenant exceeded outbound threshold | Too much spam/bulk from organization. | Follow aka.ms/mdofraud. | 🟢 8.5 | [ADO Wiki] |
| 10 📋 | 发件人收到 NDR 5.1.8 'Access denied, bad outbound sender'，无法发送邮件 | 发送账户因发送过多垃圾邮件被 EOP 阻止，通常因账户被钓鱼或恶意软件入侵 | 1) 确认并修复账户安全问题; 2) 重置账户凭据; 3) 联系 Microsoft Support 恢复发送能力 | 🔵 7.5 | [MS Learn] |
| 11 📋 | 发件人收到 NDR 5.7.501/502/503 'Access denied, spam abuse detected / banned sender' | 发送账户因检测到垃圾邮件活动被 EOP 封禁 | 1) 验证账户安全问题已解决; 2) 重置凭据; 3) 联系 Microsoft Support 通过常规渠道恢复发送能力 | 🔵 7.5 | [MS Learn] |
| 12 📋 | 用户被阻止发送邮件，出现在 Restricted entities 页面，收到 NDR 5.1.8 'Access denied, bad outboun... | 用户账户超出 outbound sending limits 或 outbound spam policy 限制，... | 1) 先按 compromised account 流程处理：重置密码、启用 MFA、扫描恶意软件、检查 inbox rules 和 delegates;... | 🔵 7.5 | [MS Learn] |
| 13 📋 | 租户外发邮件被拒绝，收到 NDR 5.7.705 tenant has exceeded threshold 或 5.7.708 traffic not ... | 来自该租户的大部分流量被检测为可疑（例如账户被入侵发送大量垃圾邮件），EOP 对整个租户的发送能力施加了封禁 | 1) 确认并修复所有 compromised 账户和 open relay；2) 通过常规支持渠道联系 Microsoft Support 解除封禁；3)... | 🔵 7.5 | [MS Learn] |
| 14 📋 | 租户外发邮件被拒绝，收到 NDR 5.7.750 Client blocked from sending from unregistered domains | 来自该租户的大量邮件使用了未经验证的域（unprovisioned domains）发送，被 EOP 检测为可疑活动 | 在 Microsoft 365 admin center 中添加并验证所有用于发送邮件的域名。参考 Fix email delivery issues f... | 🔵 7.5 | [MS Learn] |
| 15 📋 | Email to Office 365 receives NDR: 550 5.7.750 Service unavailable. Client blo... | When mail enters EOP through IP-based connector and neith... | EOP PG can whitelist IP from safe tenant block list. Prevention: (1) Add send... | 🔵 7 | [ContentIdea KB] |
| 16 📋 | 用户发送外部邮件被限制/阻止，收到通知提示因发送 outbound spam 而被封禁 | 在一定时间窗口内（如每小时）超过一半的邮件被识别为垃圾邮件，用户即被封禁发送。通常因账户被入侵（钓鱼/恶意软件）导... | 1) 调查账户是否被入侵（compromised account），按 compromised account 流程恢复。2) Admin 在 Secur... | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Add and validate all sending domains in M365 `[OneNote]`
2. Check if account is compromised `[OneNote]`
3. Verify account not compromised `[OneNote]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/ndr-outbound-sender-blocks.md)
