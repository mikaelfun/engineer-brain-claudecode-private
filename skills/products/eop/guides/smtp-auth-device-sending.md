# EOP SMTP AUTH 设备/应用发送与认证 - Quick Reference

**Entries**: 9 | **21V**: all applicable | **Last updated**: 2026-04-07

## Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | User blocked for exceeding recipient rate limit unexpectedly; message trace s... | Rate limits count against authenticated user, not From ad... | Identify SendAs/SendOnBehalf via audit logs or Get-RecipientPermission. Align... | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | 通过 on-premises Exchange 或 IIS SMTP 中继邮件到 M365 时收到 NDR 550 5.7.64 TenantAttrib... | On-premises 服务器在 TLS 握手时未发送完整的中间证书链（intermediate certific... | 1) 从证书颁发机构获取中间证书列表; 2) 在发送服务器上导出中间证书（Certificates snap-in -> Personal -> Cert... | 🔵 7.5 | [MS Learn] |
| 3 📋 | 应用或设备通过 smtp.office365.com (SMTP AUTH) 发送邮件时收到 NDR 550 5.7.57 Client was not ... | 连接 smtp.office365.com 端点需要使用具有 Exchange Online 邮箱的用户凭据进行身... | 1) 确认应用/设备设置中指定的凭据正确; 2) 确认设备支持 TLS 加密协商; 3) 若设备不支持凭据输入，改用 Direct Send 或 SMTP... | 🔵 7.5 | [MS Learn] |
| 4 📋 | SMTP AUTH 提交邮件时收到 550 5.2.251/252/253/254/255 Sender throttled 错误，之前能正常发送的邮件也被阻止 | Exchange Online 持续错误限流机制：SMTP AUTH 提交因特定错误（邮箱满 5.2.251、Se... | 1) 排查根因（清理邮箱空间/修复 Send As/验证许可证/修正收件人）; 2) 修复后等待限流周期到期; 3) 临时切换到另一个已修复的邮箱; 4)... | 🔵 7.5 | [MS Learn] |
| 5 📋 | 发送邮件后收到 NDR 550 4.4.7 QUEUE.Expired; message expired，邮件在 24 小时后投递失败 | Exchange Online 尝试投递消息但目标服务器离线/不可达/拒绝接收，或网络问题导致超时，重试 24 小... | 1) 检查目标域 MX 记录; 2) 用 Remote Connectivity Analyzer 测试; 3) 检查 SPF 记录; 4) 确认域名未过... | 🔵 7.5 | [MS Learn] |
| 6 📋 | SMTP AUTH 客户端提交邮件时收到 535 5.7.3 Authentication unsuccessful，设备/应用无法认证 | SMTP AUTH 在邮箱/租户被禁用; 邮箱启用 MFA; Azure Security Defaults 阻止... | 1) Get-CASMailbox -Identity <email> | FL SmtpClientAuthenticationDisabled，Tru... | 🔵 7.5 | [MS Learn] |
| 7 📋 | SMTP AUTH 客户端发邮件收到 5.7.60 SMTP; Client does not have permissions to send as t... | 设备/应用尝试从与登录凭据不同的邮箱地址发送邮件，登录账户缺少 Send As 权限 | 1) 确认发件地址与登录凭据一致; 2) 若需从不同地址发送，授予 Send As 权限; 3) 若必须从多个地址发送，改用 SMTP Relay | 🔵 7.5 | [MS Learn] |
| 8 📋 | SMTP AUTH 客户端连接 smtp.office365.com 时被拒绝，设备/打印机固件仅支持 TLS 1.0/1.1 | Microsoft 已拒绝 TLS 1.0/1.1 的 SMTP AUTH 连接，要求至少 TLS 1.2 | 1) 升级设备固件支持 TLS 1.2+; 2) opt-in 旧版: Set-TransportConfig -AllowLegacyTLSClient... | 🔵 7.5 | [MS Learn] |
| 9 📋 | SMTP AUTH 认证收到 535 5.7.139 Authentication unsuccessful, federated STS service... | 联合身份认证用户的 on-prem STS (AD FS) 不可达，或 STS URL 不支持 HTTPS（TLS... | 1) 检查 STS/AD FS 在线且可外部访问; 2) 确认 STS URL 支持 HTTPS + TLS 1.2; 3) 更新 TLS 配置; 4) ... | 🔵 7.5 | [MS Learn] |

## Quick Troubleshooting Path

1. Identify SendAs/SendOnBehalf via audit logs or Get-RecipientPermission. Align outbound spam policy f `[ADO Wiki]`
2. 1) 从证书颁发机构获取中间证书列表 `[MS Learn]`
3. 1) 确认应用/设备设置中指定的凭据正确 `[MS Learn]`

> This topic has a fusion troubleshooting guide with complete workflow
> -> [Complete troubleshooting guide](details/smtp-auth-device-sending.md)
