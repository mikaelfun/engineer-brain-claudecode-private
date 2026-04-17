# EOP HVE 高量邮件发送 (OAuth/SMTP) - Issue Details

**Entries**: 6 | **Type**: Quick Reference Only
**Generated**: 2026-04-07

---

### 1. HVE (High Volume Email) 打印机或 LOB 应用配置后仍无法通过 SMTP 发送邮件

- **Root Cause**: SMTP 服务器地址、端口、TLS 或认证凭据配置错误。正确设置：smtp.hve.mx.microsoft / Port 587 / StartTLS 启用 / HVE 账户凭据或 OAuth token
- **Solution**: 检查打印机或应用中 SMTP 设置：Server=smtp.hve.mx.microsoft，Port=587，TLS=Enabled，认证用 HVE 账户密码或有效 OAuth token。可用 Power Automate SMTP connector 验证 HVE 服务是否正常
- **Score**: 🔵 5.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 2. HVE 发送邮件时收到 535 5.7.3 Authentication unsuccessful 或 535 5.7.139 Authentication unsuccessful, the organization configuration does not allow this aut...

- **Root Cause**: Azure Security Defaults 启用阻止了基本身份验证，或 authentication policy 中 AllowBasicAuthSmtp 未启用
- **Solution**: 1) Azure Portal > Microsoft Entra ID > Properties > Manage Security Defaults > 设为 No。2) 确保适用于 HVE 账户的 authentication policy 中 AllowBasicAuthSmtp=true。HVE 账户不受 TransportConfig SMTPClientAuthenticationDisabled 影响
- **Score**: 🔵 5.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 3. HVE OAuth 认证时收到 501 5.5.121/122/123/124/125/126 错误，提示 Invalid XOAUTH2 argument 或 auth data 格式错误

- **Root Cause**: XOAUTH2 认证数据的 base64 编码格式不正确，缺少用户地址、Bearer 关键字或 token
- **Solution**: 确保 auth data base64 编码格式正确：user=EmailAddress + auth=Bearer OauthToken。检查各字段完整性：用户邮箱地址有效、Bearer 关键字存在、OAuth token 存在且有效
- **Score**: 🔵 5.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 4. HVE OAuth 认证失败，收到 535 5.7.142 Token will expire soon 或 535 5.7.143 Expired token

- **Root Cause**: OAuth token 已过期或即将过期，SMTP 会话时间超过 token 有效期
- **Solution**: 确保 SMTP 会话时间不超过 token 过期时间。重新获取新的 OAuth token 后重试认证
- **Score**: 🔵 5.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 5. HVE OAuth 认证失败，收到 535 5.7.144 XOAUTH2 authentication failed. Invalid API permissions

- **Root Cause**: Azure AD 应用注册中配置的 API permissions 与 HVE 要求的权限不匹配
- **Solution**: 参照 HVE OAuth 配置文档检查 API Permission 部分，确保 App Registration 中已授予正确的 SMTP 发送权限并完成 admin consent
- **Score**: 🔵 5.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable

### 6. HVE 发送邮件时收到 550 5.7.240 The application is not allowed for use with this High Volume Email account

- **Root Cause**: 使用的 Azure AD 应用不在该 HVE 账户的允许应用列表中
- **Solution**: 将应用添加到 HVE 账户的 allowed applications list 中。参照 HVE OAuth 文档配置允许的应用 ID
- **Score**: 🔵 5.5/10 | **Source**: [MS Learn]
- **21Vianet**: Not applicable
