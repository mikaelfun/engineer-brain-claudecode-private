# EOP SPF 认证失败与配置 - Quick Reference

**Entries**: 12 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | SPF shows softfail/hardfail (not temperror) but the sender's SPF record appea... | Complex SPF records with many nested includes (e.g., 6+ l... | 1) Use Vamsoft SPF Policy Tester to expand and check total query/response tim... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | SPF fails for inbound email when customer MX record does not point to EOP (on... | SPF check evaluates the connecting IP from the on-premise... | 1) Enable Enhanced Filtering for Connectors (skip listing) to evaluate SPF ag... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | SPF returns permerror for sender domain. Email authentication fails permanent... | SPF record has syntax errors OR exceeds the RFC 7208 limi... | 1) Validate SPF syntax with MXToolbox or DMARCIAN. 2) Count total DNS lookups... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Inbound emails show SPF=TEMPERROR (DNS Timeout) or DKIM=FAIL (no key for sign... | Sending domain SPF or DKIM DNS records have TTL lower tha... | Verify TTL of SPF (TXT) and DKIM (CNAME) records using Resolve-DnsName; ensur... | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | SPF=TEMPERROR for domains using macro-based SPF records or nested/flattened S... | include:spf.protection.outlook.com is missing from the ma... | Add include:spf.protection.outlook.com at the beginning of the main SPF TXT r... | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | Intermittent SPF PermError (invalid SPF mechanism) after Enhanced Filtering c... | EOP DNS query timeout threshold is 500ms (1000ms extended... | Add the spoofed sender to Spoof Intelligence allow list (external sender type... | 🟢 8 | [OneNote] |
| 7 📋 | Emails from microsoft.com to 21V mailbox fail SPF check - SPF Fail for micros... | Email from microsoft.com routed through third-party relay... | Recipient (21V tenant) must configure Enhanced Filtering for Connectors on In... | 🟢 8 | [OneNote] |
| 8 📋 | SPF/DKIM DNS timeout failure rate exceeds 0.1-0.2% for specific sending domai... | Sending domain is not on the AntispamRetrySpfWithExtended... | Check ECS configuration (Substrate/EOP_Antispam config 1423964, Extendedtimeo... | 🔵 7.5 | [ADO Wiki] |
| 9 📋 | 邮件 header 显示 spf=fail 或 spf=softfail，导致 DMARC 也失败 | 发送服务器 IP 未在域的 SPF 记录中授权。常见子原因：1) SPF 记录缺少合法源 IP; 2) spf=p... | 1) 更新 SPF 记录包含所有合法源 IP; 2) 简化 SPF 记录移除不必要的 include; 3) 修正语法错误; 4) DNS 临时故障时增大... | 🔵 7.5 | [MS Learn] |
| 10 📋 | SPF TXT 记录配置错误导致 SPF 验证 permerror 失败，邮件被退回提示 exceeded hop count 或 required to... | SPF TXT 记录中 include: 语句过多导致 DNS 查询超过 10 次限制 | 1) 在线工具检查 DNS lookup 次数; 2) 减少 include: 将不受控服务移到子域; 3) 用 ip4:/ip6: 替代部分 inclu... | 🔵 7.5 | [MS Learn] |
| 11 📋 | M365 21Vianet 环境中 SPF 配置错误，使用了 Global 版 include:spf.protection.outlook.com 导致... | 21Vianet 运营的 M365 使用不同的 SPF include 域名，使用 Global 版导致邮件源不匹配 | 21Vianet: v=spf1 include:spf.protection.partner.outlook.cn -all; GCC High: v=... | 🔵 7.5 | [MS Learn] |
| 12 📋 | Legitimate email messages quarantined by EOP. received-spf: Fail (protection.... | Sender domain SPF record does not include sending IP. Adv... | Contact remote domain to fix SPF record. Workaround: Add sender to allow send... | 🔵 7 | [ContentIdea KB] |

## Quick Troubleshooting Path

1. 1) Use Vamsoft SPF Policy Tester to expand and check total query/response time. 2) Reduce nested inc `[ADO Wiki]`
2. 1) Enable Enhanced Filtering for Connectors (skip listing) to evaluate SPF against the original send `[ADO Wiki]`
3. 1) Validate SPF syntax with MXToolbox or DMARCIAN. 2) Count total DNS lookups across all nested leve `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/email-auth-spf.md)
