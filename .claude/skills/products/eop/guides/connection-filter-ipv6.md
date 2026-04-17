# EOP 连接筛选与 IPv6 入站限制 - Quick Reference

**Entries**: 6 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | IP Allow List stops working after enabling Enhanced Filtering for Connectors ... | EFC enabled: original CIP not evaluated against Allow/Blo... | Add original source (skip-listed) IPs to Allow only. Check Auth-Results or X-... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Cannot add IPv6 to Connection Filter IP Allow/Block List | Connection Filter only supports IPv4. | Use Tenant Allow/Block List for IPv6. TABL not available in 21Vianet. | 🔵 7.5 | [ADO Wiki] |
| 3 📋 | 已将发件人 IP 添加到 Connection Filtering 的 IP Allow List，但邮件仍被 spam 过滤 | 两种场景导致 IP Allow List 不生效：1) IP 同时配置在 on-premises IP-based... | 1) 检查邮件 header 中 X-Forefront-Antispam-Report 是否包含 IPV:CAL; 2) 如遇上述场景，创建 mail ... | 🔵 6.5 | [MS Learn] |
| 4 📋 | 外部发件人通过 IPv6 发送邮件被拒绝，收到 550 5.2.1 Service unavailable, does not accept email ... | M365 租户未启用 anonymous inbound email over IPv6 功能，默认可能未开启 | 通过 Microsoft 365 admin center 提交支持请求，申请 opt in 启用 IPv6 inbound email 功能 | 🔵 6.5 | [MS Learn] |
| 5 📋 | 通过 IPv6 发送邮件被延迟，收到 450 4.7.25 sending IPv6 address must have reverse DNS record | 发送方 IPv6 地址没有有效的反向 DNS 查找 (PTR) 记录，EOP 要求 IPv6 发件方必须配置 PT... | 为发送服务器的 IPv6 地址配置有效的 PTR 反向 DNS 记录，使 EOP 能通过 IPv6 地址解析到域名 | 🔵 6.5 | [MS Learn] |
| 6 📋 | 通过 IPv6 发送邮件被延迟，收到 450 4.7.26 message sent over IPv6 must pass either SPF or ... | 通过 IPv6 发送的邮件要求发送域必须通过 SPF 或 DKIM 验证，当前发件方两者均未通过 | 为发送域配置正确的 SPF 记录（包含 IPv6 发送源）和/或 DKIM 签名，确保至少一项验证通过 | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Add original source (skip-listed) IPs to Allow only. Check Auth-Results or X-MS-Exchange-ExternalOri `[ADO Wiki]`
2. Use Tenant Allow/Block List for IPv6. TABL not available in 21Vianet. `[ADO Wiki]`
3. 1) 检查邮件 header 中 X-Forefront-Antispam-Report 是否包含 IPV:CAL `[MS Learn]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/connection-filter-ipv6.md)
