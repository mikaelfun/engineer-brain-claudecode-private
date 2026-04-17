# ADFS Password Expiration Sync for Federated Tenants

## Overview

How password expiration status syncs from on-prem AD to Azure AD for federated tenants, and why Office portal may still show password change notifications after user already changed password.

## Key Concepts

1. **Federated user password = on-prem AD controlled**: PasswordNeverExpires = True on cloud side.
2. **ADFS claim rule** sends `passwordexpirationtime` claim via `_PasswordExpiryStore`:
   - Only sends claim if password expires within **15 days** (hard-coded threshold)
   - Claim types: `passwordexpirationtime`, `passwordexpirationdays`, `passwordchangeurl`
3. **Azure AD** receives the ADFS token with `passwordexpirationtime` claim, sets `pwd_exp` in id token (seconds until expiry).
4. **AAD Connect** syncs `pwdLastSet` -> `LastPasswordChangeTimestamp`. Azure AD uses this to invalidate previously issued tokens.
5. **Office portal** reads `pwd_exp` from id token to decide whether to show notification.

## Password Change Flow

1. User changes password in AD
2. AAD Connect syncs `pwdLastSet` (next sync cycle, ~30 min)
3. Azure AD invalidates old tokens: `AADSTS50133: Session is invalid due to expiration or recent password change`
4. User re-authenticates, ADFS sends new `passwordexpirationtime` claim
5. Azure AD issues new token with updated `pwd_exp`

## Race Condition: Why notification persists

When Azure AD session is valid (persistent = KMSI clicked; non-persistent = browser still open):
- Old `pwd_exp` value may persist in the active session
- Only after re-authentication does the new `pwd_exp` get issued
- If user changed password but session still uses old token, Office portal continues showing notification

## Kusto Diagnostics

Find password-related re-authentication events:
```kql
| where MaskedResponse contains "AdfsRedirectUri=http" and PUID != ""
```

Find token invalidation events:
```kql
| where ErrorCode == "50133"
```

## Source

- OneNote: ADFS Case Sharing - How to sync the password expiration status to AAD for Federated tenant in real-time
- Related ID: entra-id-onenote-136
