# Azure MFA 常见问题排查索引

> Source: [Troubleshoot Azure Multi-Factor Authentication issues](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/mfa/troubleshoot-azure-mfa-issue)

## 场景索引

| 场景 | KB | 关键词 |
|------|-----|--------|
| 未收到 MFA 验证码短信/语音呼叫 | KB2834956 | verification-code, blocked-user |
| 设置安全验证时 "Sorry! We can't process your request" | KB2909939 | security-verification-settings |
| 手机丢失或号码变更后无法 MFA 登录 | KB2834954 | phone-lost, mfa-reset |
| "We did not receive the expected response" 错误 | KB2834968 | unexpected-response |
| "Account verification system is having trouble" 错误 | KB2834966 | account-verification |
| 无法使用工作/学校账户登录 Office 应用 | KB2834958 | office-app, sign-in |
| 无法登录 Office 365/Azure/Intune | KB2412085 | sign-in-failure |

## 排查要点

1. **验证码未收到**: 检查手机号码是否正确 → 检查用户是否被 Block sign in → 尝试其他验证方式
2. **手机丢失**: 需要另一个全局管理员重置 MFA 设置（Manage user settings → Require re-register）
3. **通用排查**: 确认 MFA 策略配置（per-user MFA vs Conditional Access）、检查 Entra ID sign-in logs
