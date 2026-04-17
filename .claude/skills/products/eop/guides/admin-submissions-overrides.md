# EOP 管理员提交与第三方网关覆盖 - Quick Reference

**Entries**: 2 | **21V**: partial | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | 无法与远程邮件服务器建立 TLS 连接，Exchange Server 消息队列中邮件处于 Retry 状态 | 远程服务器证书链中使用了不安全的签名算法（MD5 或 MD2），启用 TLS 1.2 后 Exchange 在 T... | 更新远程邮件服务器证书使用安全签名算法（如 SHA-256）。临时方案：配置远程服务器不通告 TLS（但传输将不加密） | 🔵 7.5 | [MS Learn] |
| 2 📋 | MX 指向第三方过滤服务但未锁定 M365 入站，外部邮件可直接绕过第三方过滤到达 Exchange Online | 组织未配置 Partner inbound connector 的 RestrictDomainsToCertif... | 1) 创建 Partner 类型 inbound connector，设置 RestrictDomainsToCertificate=$true + Tl... | 🔵 6.5 | [MS Learn] |

## Quick Troubleshooting Path

1. 更新远程邮件服务器证书使用安全签名算法（如 SHA-256）。临时方案：配置远程服务器不通告 TLS（但传输将不加密） `[MS Learn]`
2. 1) 创建 Partner 类型 inbound connector，设置 RestrictDomainsToCertificate=$true + TlsSenderCertificateName（ `[MS Learn]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/admin-submissions-overrides.md)
