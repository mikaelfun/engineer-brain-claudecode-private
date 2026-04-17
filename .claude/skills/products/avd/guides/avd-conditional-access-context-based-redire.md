# AVD AVD 条件访问与 MFA - context-based-redirection - Quick Reference

**Entries**: 3 | **21V**: all applicable
**Keywords**: acrs, authentication-context, block-based, by-design, clipboard, conditional-access, context-based-redirection, mid-session
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Context Based Redirection changes not taking effect mid-session - user expects r... | Modifying redirections mid-session is unsupported by design. Redirection state i... | User must disconnect and reconnect the session for updated redirection settings ... | 🔵 7.5 | ADO Wiki |
| 2 | Context Based Redirection not working when using allow-based Conditional Access ... | Context Based Redirection only supports block-based Conditional Access policies.... | Reconfigure CA policy to use block-based approach (Grant access then Block Acces... | 🔵 7.5 | ADO Wiki |
| 3 | 使用 Context Based Redirection 时，Clipboard/Drive/Printer/USB 重定向在 AVD 或 Windows 36... | CA 策略配置为 allow-based（不支持，只支持 block-based）；或用户 token 中缺少预期的 authentication contex... | 1) 验证 CA 策略为 block-based（allow-based 不支持）；2) 检查 Entra 登录日志确认 acrs 声明是否存在；3) 修正 C... | 🔵 7.0 | ADO Wiki |

## Quick Triage Path

1. Check: Modifying redirections mid-session is unsupported `[Source: ADO Wiki]`
2. Check: Context Based Redirection only supports block-base `[Source: ADO Wiki]`
3. Check: CA 策略配置为 allow-based（不支持，只支持 block-based）；或用户 toke `[Source: ADO Wiki]`
