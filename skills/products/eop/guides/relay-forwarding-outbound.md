# EOP 中继/转发/外发路由与 HRDP - Quick Reference

**Entries**: 10 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Emails from M365 to Gmail blocked with 550 5.7.1 very low reputation of sendi... | Gmail blocking due to poor domain/IP reputation. Common c... | 1) Verify SPF/DKIM/DMARC all configured and passing per https://techcommunity... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Outbound forwarded/relayed email from M365 lands in recipient Junk or is reje... | Messages sent via Relay Pool: sender not in accepted doma... | Ensure forwarded messages meet ONE: (1) sender in accepted domain, (2) SPF pa... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | SPF fails for forwarded messages through M365, DMARC fails at recipient, reje... | SRS not applied for Relay Pool. P1 From not modified, cau... | Ensure SPF or DKIM passes on inbound so SRS applied and message sent via Regu... | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | NDR 5.7.520 - External forwarding restricted | Outbound Spam Policy forwarding Automatic=Off since 2021. | Custom policy for specific users with forwarding On. Default Off. | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | 用户自动转发邮件给外部收件人时收到 NDR 5.7.520 Access denied, Your organization does not allow... | Outbound spam filter policy 中 Automatic forwarding 设置为 Of... | 1) 如需允许特定用户转发：创建新 outbound spam filter policy → Automatic forwarding=On → 仅 s... | 🔵 7.5 | [MS Learn] |
| 6 📋 | 用户配置了 Inbox rule 自动转发邮件到外部域，但邮件未到达外部收件人且无 NDR 或错误提示 | Remote Domain 配置中 AutoForwardEnabled 被设为 $false，该设置静默丢弃自动... | 1) 检查 Remote Domain 设置：Get-RemoteDomain | Where {$_.AutoForwardEnabled -eq $f... | 🔵 7.5 | [MS Learn] |
| 7 📋 | 通过 M365 中继外发邮件时收到 NDR 550 5.7.64 TenantAttribution 错误 | Inbound connector 的 TlsSenderCertificateName 与 on-prem 发送... | 1) 首选：重新运行 HCW 更新 inbound connector（hybrid 场景）; 2) 手动更新 connector 确保证书匹配; 3) ... | 🔵 6.5 | [MS Learn] |
| 8 📋 | 转发或中继邮件被拒绝，收到 NDR 550 5.7.367 'Remote server returned not permitted to relay'... | M365 检测到入站邮件 SPF/DKIM 认证失败，将转发邮件路由到 relay pool（未发布的 IP 池，... | 1) 启用 Enhanced Filtering for Connectors 修正 SPF 验证（当 MX 指向第三方服务时）; 2) 确保发件域在 M... | 🔵 6.5 | [MS Learn] |
| 9 📋 | 外发邮件被退回，收到 NDR 550 5.7.23，目标邮件服务器拒绝 | 发件域的 SPF DNS 记录配置错误，或邮件被 M365 判定为垃圾邮件后路由到 High Risk Deliv... | 1) 验证域的 SPF DNS 记录正确包含所有发送源; 2) 在 M365 中注册所有使用的域; 3) 将 on-premises IP 加入域的 SP... | 🔵 6.5 | [MS Learn] |
| 10 📋 | 外发邮件被路由到 High-Risk Delivery Pool (HRDP)，导致目标服务器拒收或邮件延迟/丢失 | M365 检测到外发邮件为垃圾邮件、发件域无 A 记录和 MX 记录、或账户超出发送限制，将邮件路由到 HRDP ... | 1) Message trace 检查 OutboundIpPoolName 属性确认使用了哪个出站池; 2) 确保发件域在 DNS 有 A 记录和 MX... | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. 1) Verify SPF/DKIM/DMARC all configured and passing per https://techcommunity.microsoft.com/t5/excha `[ADO Wiki]`
2. Ensure forwarded messages meet ONE: (1) sender in accepted domain, (2) SPF passes on inbound, (3) DK `[ADO Wiki]`
3. Ensure SPF or DKIM passes on inbound so SRS applied and message sent via Regular Pool. Use Enhanced  `[ADO Wiki]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/relay-forwarding-outbound.md)
