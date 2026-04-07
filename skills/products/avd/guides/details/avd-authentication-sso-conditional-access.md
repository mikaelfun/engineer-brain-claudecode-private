# AVD AVD 认证与 SSO - conditional-access - Issue Details

**Entries**: 3 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. AVD sign-in fails after Conditional Access sign-in frequency policy rejects PRT (error 70044). Seaml...
- **ID**: `avd-onenote-055`
- **Source**: OneNote | **Score**: 🔵 6.0
- **Root Cause**: CA sign-in frequency policy rejects PRT (expected). Seamless SSO fallback URL autologon.microsoftazuread-sso.com blocked by corporate firewall.
- **Solution**: Unblock autologon.microsoftazuread-sso.com in corporate firewall. Verify URL accessible from client devices via browser test.
- **Tags**: conditional-access, sign-in-frequency, seamless-sso, prt, firewall, autologon

### 2. AVD sign-in fails when Conditional Access sign-in frequency policy is configured. User selects auto-...
- **ID**: `avd-onenote-056`
- **Source**: OneNote | **Score**: 🔵 6.0
- **Root Cause**: With sign-in frequency CA policy active, the Primary Refresh Token (PRT) is rejected by AAD. Client falls back to Seamless SSO mechanism, but the required endpoint autologon.microsoftazuread-sso.com is blocked by corporate network/firewall.
- **Solution**: 1) Ensure autologon.microsoftazuread-sso.com is accessible from client devices. 2) Test by visiting https://autologon.microsoftazuread-sso.com/ in browser. 3) If still failing, collect Fiddler trace + Network Monitor for further analysis.
- **Tags**: Conditional-Access, sign-in-frequency, PRT, Seamless-SSO, error-70044, autologon, firewall

### 3. Conditional Access error prevents AVD access
- **ID**: `avd-mslearn-053`
- **Source**: MS Learn | **Score**: 🔵 5.5
- **Root Cause**: CA policy blocks AVD/W365 apps or Windows Cloud Login app for SSO
- **Solution**: Update CA policies to allow AVD and W365 apps; allow Windows Cloud Login for SSO
- **Tags**: conditional-access, Entra-ID, SSO
