# EOP HVE 高量邮件发送 (OAuth/SMTP) - Quick Reference

**Entries**: 6 | **21V**: not applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | HVE (High Volume Email) 打印机或 LOB 应用配置后仍无法通过 SMTP 发送邮件 | SMTP 服务器地址、端口、TLS 或认证凭据配置错误。正确设置：smtp.hve.mx.microsoft / ... | 检查打印机或应用中 SMTP 设置：Server=smtp.hve.mx.microsoft，Port=587，TLS=Enabled，认证用 HVE 账... | 🔵 5.5 | [MS Learn] |
| 2 | HVE 发送邮件时收到 535 5.7.3 Authentication unsuccessful 或 535 5.7.139 Authenticatio... | Azure Security Defaults 启用阻止了基本身份验证，或 authentication poli... | 1) Azure Portal > Microsoft Entra ID > Properties > Manage Security Defaults ... | 🔵 5.5 | [MS Learn] |
| 3 | HVE OAuth 认证时收到 501 5.5.121/122/123/124/125/126 错误，提示 Invalid XOAUTH2 argumen... | XOAUTH2 认证数据的 base64 编码格式不正确，缺少用户地址、Bearer 关键字或 token | 确保 auth data base64 编码格式正确：user=EmailAddress + auth=Bearer OauthToken。检查各字段完整... | 🔵 5.5 | [MS Learn] |
| 4 | HVE OAuth 认证失败，收到 535 5.7.142 Token will expire soon 或 535 5.7.143 Expired token | OAuth token 已过期或即将过期，SMTP 会话时间超过 token 有效期 | 确保 SMTP 会话时间不超过 token 过期时间。重新获取新的 OAuth token 后重试认证 | 🔵 5.5 | [MS Learn] |
| 5 | HVE OAuth 认证失败，收到 535 5.7.144 XOAUTH2 authentication failed. Invalid API perm... | Azure AD 应用注册中配置的 API permissions 与 HVE 要求的权限不匹配 | 参照 HVE OAuth 配置文档检查 API Permission 部分，确保 App Registration 中已授予正确的 SMTP 发送权限并完... | 🔵 5.5 | [MS Learn] |
| 6 | HVE 发送邮件时收到 550 5.7.240 The application is not allowed for use with this High... | 使用的 Azure AD 应用不在该 HVE 账户的允许应用列表中 | 将应用添加到 HVE 账户的 allowed applications list 中。参照 HVE OAuth 文档配置允许的应用 ID | 🔵 5.5 | [MS Learn] |

## Quick Troubleshooting Path

1. 检查打印机或应用中 SMTP 设置：Server=smtp.hve.mx.microsoft，Port=587，TLS=Enabled，认证用 HVE 账户密码或有效 OAuth token。可用 P `[MS Learn]`
2. 1) Azure Portal > Microsoft Entra ID > Properties > Manage Security Defaults > 设为 No。2) 确保适用于 HVE 账户 `[MS Learn]`
3. 确保 auth data base64 编码格式正确：user=EmailAddress + auth=Bearer OauthToken。检查各字段完整性：用户邮箱地址有效、Bearer 关键字存在 `[MS Learn]`
