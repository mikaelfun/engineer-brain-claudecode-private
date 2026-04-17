---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Archived Wikis/Device registration_Troubleshooting Windows 7 Automatic Device Registration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FArchived%20Wikis%2FDevice%20registration_Troubleshooting%20Windows%207%20Automatic%20Device%20Registration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Understand Your Customer

Before proceeding to troubleshooting, gather clarity on the customer scenario and environment:

**Device registration intent:**
1. Hybrid Azure AD Join (on-prem AD domain joined → auto-register with Azure AD)?
2. Azure AD Join?
3. BYOD registration (Add work or school account)?

**Environment:**
1. Multiple verified domains?
2. Managed or federated domain?
3. AD FS or 3rd party STS?
4. Cloud only / hybrid / on-prem only?
5. Device management: GP / SCCM / MDM?
6. Client OS: Windows 7, Windows 10, iOS, MacOS, Android?

## Background

- Windows 7 auto workplace join registers in **user context** (not system level like Win10 DJ++)
- Multiple device records can exist per machine (one per domain user signing in)
- 3 stages: discovery → acquire token silently → registration
- Discovery uses SCP or DNS CNAME fallback
- Token acquisition uses hidden browser control with IWA (Integrated Windows Authentication)
- For federated domains: requires AD FS as IDP STS; 3rd party STS needs WIAORMULTIAUTHN support
- For Seamless SSO: add `https://autologon.microsoftazuread-sso.com` and `https://aadg.windows.net.nsatc.net` to intranet zone; enable "Allow updates to status bar via script"
- **NOTE**: Windows 7 Autoworkplace will NOT work for managed domains with just PTA or PHS without enabling Seamless SSO
- **NOTE**: Seamless SSO doesn't work in private browsing mode (Firefox, Edge), Enhanced Protected mode (IE), or InPrivate/Guest mode (Chromium Edge)

## Troubleshooting: None of the Windows 7 devices registering

1. Run `Get-EntraDomain` — check Name, Status, Authentication; domain must be verified & federated
2. Verify SCP is configured correctly for Azure DRS (not on-prem DRS)
3. Network connectivity — device must reach:
   - `https://enterpriseregistration.windows.net`
   - `https://login.microsoftonline.com`
   - `https://device.login.microsoftonline.com`
4. Whitelist Office 365 URLs for CA
5. Direct line of sight to domain controller
6. Ensure AD FS (not 3rd party STS) — 3rd party may not support WIAORMULTIAUTHN
7. AD FS RP for Azure AD must have WIAORMULTIAUTHN enabled
8. AD FS must return WIAORMULTIAUTHN in authnmethodreferences claim
9. HRD page must not appear during token acquisition
10. Avoid SAMLP protocol between AAD and on-prem AD FS (untested/unsupported)
11. For Desktop/Seamless SSO: verify SSO steps from background section

## Troubleshooting: Some devices not registering (user/device specific)

1. User UPN domain suffix must be a verified, federated domain
2. User account must be enabled and not locked out
3. Check device quota not exceeded
4. Verify network connectivity to DC when workplace join task runs (VPN timing issue)
   - Run as admin: `nltest /dsgetdc:DOMAIN_SUFFIX`
5. Check if user is subjected to MFA → ensure WIAORMULTIAUTHN on AD FS RP
6. Check for HRD page at AD FS
7. Check IE settings — GP may prevent autoworkplace.exe from adding STS URL to Local Intranet zone

## Troubleshooting: Repeated re-registration needed

1. WPJ state stored in 2 places: user profile (HKCU) + user's My cert store — must be in sync
   - Enterprise credential roaming or user profile roaming can break sync
2. Users signing into multiple RDP VMs running Windows 7 → device quota exhaustion → silent WPJ stops working

## Specific Errors

### Key Permission error
Ask IT admin to configure the appropriate GP setting for key permissions.

### NTE_BAD_KEYSET (TPM reset on Windows 8.1)
TPM reset/disabled or system board replacement → private key lost → device can't authenticate.
**Fix**: Unregister and re-register the device.

### NTE_BAD_KEY_STATE
After user password reset, device may lose private key access. Can be temporary (recovers after DC connection) or permanent (known race condition in Win7).
**Detection**: Ensure DC line of sight, run `checkprivatekey` tool as affected user. If output shows `"Failed to acquire private key. Exit code: 0x8009000b"` → confirmed permanent.
**Fix**: Unregister and re-register the device.

### Certificate prompt during device authentication
Add to IE Local Intranet zone:
1. `https://device.login.microsoftonline.com`
2. Local AD FS URL (if using device auth on-premises)

## Debug Log Collection

1. Event Viewer → View → Show Analytic and Debug Logs
2. Enable: `Applications & Services > Microsoft-Workplace Join > Debug`
3. Reproduce: sign out → sign in → wait 5 mins
4. Save debug log (English language)

**Interactive mode**: Run `"%programFiles%\Microsoft Workplace Join\autoworkplace.exe /i"` to see registration status and common errors.

**Navigation timeout analysis**: If token acquisition fails (navigation stops after ~1 minute), copy the stopped URL → paste in IE → screenshot to differentiate HRD page / missing WIAORMULTIAUTHN / missing intranet zone config.
