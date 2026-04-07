# EOP IP 限流与信誉阻止 (4.7.500/5.7.708/AS codes) - Quick Reference

**Entries**: 15 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Emails rejected with NDR 4.7.500 Server busy or 5.7.708 with various AS codes... | Sending IP address throttled by EOP real-time reputation ... | Run Release Tenant IP Server Busy diagnostic in EOP Diagnostics to whitelist ... | 🟢 9 | [OneNote] |
| 2 📋 | Slow mail delivery to EXO after batch resend from gateway - new sending IP ge... | New sending IP has no reputation in EOP; batch resending ... | PG adds new IP to allowlist for 1 month to build reputation via ICM; ensure m... | 🟢 9 | [OneNote] |
| 3 📋 | Inbound email throttled with 451 4.7.500 Access denied AS112201 | Known throttling bug in EOP service (Bug 3397879). Long-t... | Escalate to MDO Escalations team to add tenant to override list. Do NOT add t... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | NDR 5.7.708 - IP blocked, traffic not accepted | Low-reputation IP, typically new customers. | Verify no spam. Release Tenant IP diagnostic. | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | NDR 4.7.500 - Server busy, gray-listed | Source IP changed sending patterns drastically. Probation... | Configure Inbound connector. Release Tenant IP Server Busy diagnostic (14-day... | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | NDR 5.7.606-649 - Sender IP banned | IP banned: degraded reputation, compromise, or malicious ... | Self-delist via sender.office.com. If 24h fail, escalate to Antispam Engineer... | 🟢 8.5 | [ADO Wiki] |
| 7 📋 | NDR 5.7.511 - Sender IP banned, self-delist NOT available | Microsoft requires investigation. Delist portal unavailab... | Forward full NDR to delist@microsoft.com. 48h response. Escalate with full hi... | 🟢 8.5 | [ADO Wiki] |
| 8 📋 | Outbound emails rejected with NDR 550 5.0.350 Address rejected due to sender ... | Sender IP (e.g. 139.219.17.x China IPs) has poor reputati... | File FP escalation via Assist 365 with sender IP and NDR details; request IP ... | 🟢 8 | [OneNote] |
| 9 📋 | 451 4.7.500 Access denied without AS code in response - back pressure message... | Transport layer back pressure (not MDO/antispam); no AS c... | If no AS code present, this is transport-layer back pressure, not MDO throttl... | 🟢 8 | [OneNote] |
| 10 📋 | 发件人收到 NDR 451 4.7.500-699 (ASxxx) 错误，邮件被退回 | 源 IP 发送模式突变（发送量远超历史模式），触发 EOP graylisting/IP throttling 机制 | 配置 EOP inbound connector 标识可信发件服务器：1) on-prem relay 场景配置 connector from email... | 🔵 7.5 | [MS Learn] |
| 11 📋 | 外部发件人向 M365 收件人发邮件被退回，收到 NDR 550 5.7.606-649 Access denied, banned sending IP | 发件人源 IP 被 Microsoft 365 blocked senders list 列入黑名单，可能因发送垃... | 1) 访问 Office 365 Anti-Spam IP Delist Portal (https://sender.office.com/); 2) ... | 🔵 6.5 | [MS Learn] |
| 12 📋 | 外部发件人收到 NDR 550 5.7.511 Access denied, banned sender，无法使用 delist portal 自助解除 | Microsoft 需要对该 IP 的邮件流量进行额外调查，常见于严重违规或反复被封锁的 IP 地址 | 1) 将收到的完整 NDR（包含错误代码和 IP 地址）转发到 delist@microsoft.com; 2) Microsoft 将在 48 小时内联... | 🔵 6.5 | [MS Learn] |
| 13 📋 | 外部发件人邮件被临时拒绝，收到 451 4.7.550 Access denied, please try again later | Microsoft 365 从源 IP 检测到可疑活动，对该 IP 实施临时限流（throttling），邮件在评... | 1) 这是临时限制，Microsoft 评估完成后会自动解除; 2) 发件人应检查是否有异常发送行为（账户被入侵、配置错误导致循环发送等）; 3) 确保 ... | 🔵 6.5 | [MS Learn] |
| 14 📋 | 外部邮件服务器发邮件被拒绝，收到 NDR 5.7.1 Unable To Relay: Blocked by Customer Allow list，但 ... | 发件人 IP 同时被添加到了 inbound connector 和 Connection Filtering 的... | 1) 从 Connection Filtering 的 IP Allow List 中移除该外部邮件服务器的 IP; 2) 移除后再次发送测试邮件，此时 ... | 🔵 6.5 | [MS Learn] |
| 15 📋 | 外部发件人收到 NDR 5.7.1 Service unavailable; Client host [IP] blocked using Blockli... | 发件人的源邮件服务器 IP 地址被列入 Microsoft 的 IP blocklist（通常因为该 IP 此前发... | 发件人将 NDR 完整邮件转发到 delist@microsoft.com 请求移除。也可使用 delist portal (https://sender... | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Run Release Tenant IP Server Busy diagnostic in EOP Diagnostics to whitelist IP for up to 30 days `[OneNote]`
2. PG adds new IP to allowlist for 1 month to build reputation via ICM `[OneNote]`
3. Escalate to MDO Escalations team to add tenant to override list. Do NOT add tenant to the engineerin `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/ndr-ip-throttling-reputation.md)
