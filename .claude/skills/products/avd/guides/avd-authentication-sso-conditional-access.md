# AVD AVD 认证与 SSO - conditional-access - Quick Reference

**Entries**: 3 | **21V**: partial
**Keywords**: autologon, conditional-access, entra-id, error-70044, firewall, prt, seamless-sso, sign-in-frequency
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | AVD sign-in fails after Conditional Access sign-in frequency policy rejects PRT ... | CA sign-in frequency policy rejects PRT (expected). Seamless SSO fallback URL au... | Unblock autologon.microsoftazuread-sso.com in corporate firewall. Verify URL acc... | 🔵 6.0 | OneNote |
| 2 | AVD sign-in fails when Conditional Access sign-in frequency policy is configured... | With sign-in frequency CA policy active, the Primary Refresh Token (PRT) is reje... | 1) Ensure autologon.microsoftazuread-sso.com is accessible from client devices. ... | 🔵 6.0 | OneNote |
| 3 | Conditional Access error prevents AVD access | CA policy blocks AVD/W365 apps or Windows Cloud Login app for SSO | Update CA policies to allow AVD and W365 apps; allow Windows Cloud Login for SSO | 🔵 5.5 | MS Learn |

## Quick Triage Path

1. Check: CA sign-in frequency policy rejects PRT (expected) `[Source: OneNote]`
2. Check: With sign-in frequency CA policy active, the Prima `[Source: OneNote]`
3. Check: CA policy blocks AVD/W365 apps or Windows Cloud Lo `[Source: MS Learn]`
