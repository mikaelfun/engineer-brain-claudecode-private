# AVD AVD 条件访问与 MFA - context-based-redirection - Issue Details

**Entries**: 3 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Context Based Redirection changes not taking effect mid-session - user expects redirection to change...
- **ID**: `avd-ado-wiki-171`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Modifying redirections mid-session is unsupported by design. Redirection state is determined at connection time based on Conditional Access authentication context claims
- **Solution**: User must disconnect and reconnect the session for updated redirection settings to take effect. This is expected behavior, not a bug
- **Tags**: context-based-redirection, mid-session, unsupported, by-design

### 2. Context Based Redirection not working when using allow-based Conditional Access policies
- **ID**: `avd-ado-wiki-172`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Context Based Redirection only supports block-based Conditional Access policies. Allow-based CA policies are not supported
- **Solution**: Reconfigure CA policy to use block-based approach (Grant access then Block Access). Ensure CA policy targets correct authentication context and uses device filter conditions
- **Tags**: context-based-redirection, conditional-access, block-based, unsupported

### 3. 使用 Context Based Redirection 时，Clipboard/Drive/Printer/USB 重定向在 AVD 或 Windows 365 会话中意外被禁用或不生效
- **ID**: `avd-ado-wiki-0799`
- **Source**: ADO Wiki | **Score**: 🔵 7.0
- **Root Cause**: CA 策略配置为 allow-based（不支持，只支持 block-based）；或用户 token 中缺少预期的 authentication context claims (acrs)；或 CA 策略未正确匹配目标用户/设备条件
- **Solution**: 1) 验证 CA 策略为 block-based（allow-based 不支持）；2) 检查 Entra 登录日志确认 acrs 声明是否存在；3) 修正 CA 策略的目标用户/组/设备条件；4) 确保所有 auth contexts 至少被一个 CA 策略引用；5) 断开重连会话。注意：不支持会话中途修改重定向设置
- **Tags**: context-based-redirection, clipboard, conditional-access, authentication-context, acrs
