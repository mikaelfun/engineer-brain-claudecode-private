# EOP DKIM 签名验证失败与配置 - Quick Reference

**Entries**: 8 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | DKIM fails with 'body hash did not verify' (dkim=fail body hash fail). Messag... | 3rd-party or on-premises MX modified the message body aft... | 1) Primary: stop body modifications before DKIM verification at EOP. 2) Alter... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | DKIM fails with 'signature did not verify' (dkim=fail signature did not verif... | An intermediate server modified one of the headers listed... | 1) Check h= value in DKIM-Signature header to identify signed headers. 2) Sto... | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | 邮件 header 显示 dkim=fail (no key for signature) 或 dkim=fail (signature didn't v... | 1) DKIM 公钥未在 DNS 发布（CNAME/TXT 记录缺失）; 2) 密钥不匹配签名; 3) 消息在传输... | 1) 在 DNS 发布 DKIM 公钥; 2) 验证 selector 和 d= 值匹配; 3) TTL 设置至少 1 小时; 4) 中间服务修改场景配置... | 🔵 7.5 | [MS Learn] |
| 4 📋 | 邮件 header 显示 dkim=fail (body hash fail)，DKIM 签名验证失败，原因是邮件正文在签名后被中间服务修改 | 邮件经中间服务（mailing list、转发服务、安全设备）处理时，正文内容在 DKIM 签名后被修改（如添加 ... | 1) 发件人：确认邮件正文在 DKIM 签名后到离开发送环境期间未被修改；考虑使用 M365 本身添加 footer/disclaimer 而非第三方服务... | 🔵 7.5 | [MS Learn] |
| 5 📋 | 邮件 header 显示 dkim=fail (Signature didnt verify)，DKIM 签名验证失败，原因是邮件 header 在签名后... | 邮件经中间服务（mailing list、转发服务、安全设备）处理时，DKIM 签名包含的 header（如 Su... | 1) 发件人：确保签名 header 从 DKIM 签名到邮件离开环境期间保持不变。2) 中间服务提供商：配置为 trusted ARC sealer 以... | 🔵 7.5 | [MS Learn] |
| 6 📋 | 使用 M365 Admin Center DKIM 诊断工具验证 DKIM 配置，结果显示 No Configuration Created 或 Conf... | DKIM 签名配置问题分三种情况：1) 未创建 DKIM 签名配置，邮件可能使用默认域设置；2) 配置已创建但 D... | 1) 未创建：使用 PowerShell New-DkimSigningConfig 创建配置。2) 发布错误：检查 DNS 中 CNAME 记录是否正确... | 🔵 7.5 | [MS Learn] |
| 7 📋 | 启用 DKIM 签名后状态显示 CnameMissing 或 NoDKIMKeys，DKIM 未对出站邮件签名，Toggle 无法切换为 Enabled | DKIM CNAME 记录未在域注册商 DNS 中正确发布，或发布后 M365 尚未检测到新 CNAME 记录（需... | 1. 在 Defender portal Email authentication DKIM 页面获取 selector1._domainkey 和 se... | 🔵 5.5 | [MS Learn] |
| 8 📋 | DKIM key rotation 执行后新密钥未立即生效，出站邮件仍使用旧 selector 签名，DKIM-Signature header 中 s=... | DKIM key rotation 设计上需要 4 天（96 小时）才能生效，在 RotateOnDate 之前系... | 等待 96 小时让 rotation 生效。通过 Get-DkimSigningConfig 检查 RotateOnDate / SelectorAfte... | 🔵 5.5 | [MS Learn] |

## Quick Troubleshooting Path

1. 1) Primary: stop body modifications before DKIM verification at EOP. 2) Alternative: configure trust `[ADO Wiki]`
2. 1) Check h= value in DKIM-Signature header to identify signed headers. 2) Stop header modifications  `[ADO Wiki]`
3. 1) 在 DNS 发布 DKIM 公钥 `[MS Learn]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/email-auth-dkim.md)
