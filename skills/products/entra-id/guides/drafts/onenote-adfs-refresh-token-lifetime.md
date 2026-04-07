---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======11. AAD=======/11.13 [ADFS] AD FS 2016 Refresh Token Lifetime.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AD FS 2016 Refresh Token Lifetime

Official doc: https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/operations/ad-fs-single-sign-on-settings

## Key Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| SsoLifetime | 480 min (8h) | Session SSO cookie lifetime |
| PersistentSsoLifetimeMins | 129600 min (90d) | Persistent SSO cookies lifetime for registered device |
| KmsiLifetimeMins | 1440 min (1d) | "Keep me signed in" lifetime (max 7 days) |
| DeviceUsageWindowInDays | 14 days | Sliding window for device usage |

## Behavior Matrix

### KMSI Not Enabled

**Unregistered device:**
- `refresh_token.ValidTo = SsoLifetime`
- Refresh token **cannot** be refreshed. Ignore `refresh_token_expires_in`.

**Registered device:**
- `refresh_token.ValidTo = Min(SsoLifetime, PersistentSsoLifetimeMins, DeviceUsageWindowInDays)`
- Refresh token **can** be refreshed until `Min(SsoLifetime, PersistentSsoLifetimeMins)` is reached
- `refresh_token_expires_in = Min(SsoLifetime, PersistentSsoLifetimeMins, DeviceUsageWindowInDays)`

### KMSI Enabled
Session lifetime extends from SsoLifetime to KmsiLifetimeMins (8h -> 24h by default).

## Common Pitfalls

1. These values can be set between 0 and Int.Max, leading to unexpected behavior (e.g., PersistentSsoLifetimeMins < DeviceUsageWindowInDays)
2. AD FS Management Console has a **hard-coded max of 9999** for SsoLifetime. Use PowerShell for larger values.
3. DeviceUsageWindowInDays governs `refresh_token_expires_in` but NOT the actual user authentication inside the refresh token - it's a sliding window.

## Related Docs
- AAD token lifetime: https://docs.microsoft.com/en-us/azure/active-directory/active-directory-configurable-token-lifetimes
- AAD B2C token lifetime: https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-token-session-sso
