# iOS SSO Architecture and Debugging Guide

> Source: MCVKB/Intune/iOS/##MCVKB--ios SSO and debug.md
> Status: draft (pending SYNTHESIZE)

## SSO Architecture on iOS

### Broker Types

**Unmanaged Broker (non-MDM devices):**
- Used for interactive requests only
- Communication via iOS URL schemes; broker response encrypted
- Returns refresh token to the app; app uses RT silently until expiry
- On expiry, user returns to broker interactively

**Managed Broker (MDM devices) — Entra ID SSO Extension:**
- Available only on MDM-managed devices
- Relies on Apple Enterprise SSO feature; admin enables in MDM profile
- Supports silent token operations — all requests go through broker
- MDM + AADR/AADJ/HAADJ device with Microsoft authentication broker

### Browser SSO

| Browser | Configuration |
|---------|--------------|
| Safari | No additional config needed |
| Chrome | Install [Microsoft SSO Chrome extension](https://chromewebstore.google.com/detail/microsoft-single-sign-on/ppnbnpeolgkicgegkbkbjmhlideopiji) |
| Edge | Sign into Edge profile |
| Custom native apps | Admin must add bundleId to SSO extension allow-list |

### Supported Apps
- Apps integrated with MSAL libraries capable of calling platform broker
- Browsers listed in [Conditional Access supported browsers](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-conditions#supported-browsers)
- Other apps may work with SSO extension in Browser SSO mode (nuanced)

## macOS Notes
- Only managed broker (Entra ID SSO extension) supported
- XPC method for unmanaged Mac devices (Apple engineering, expected H1 2025)
- XPC will NOT support Platform SSO (Entra ID login to Mac)

## Troubleshooting

### Step 1: Check Sign-in Logs
- Azure AD sign-in request status
- Kusto: PerRequestTableIfx with CorrelationId, check ErrorCode, DeviceTrustType, IsDeviceCompliantAndManaged

### Step 2: Collect Broker Logs
- Collect Fiddler trace on iOS
- Collect broker logs via Intune diagnostics

### Step 3: Analyze Auth Flow
- Look for `Prompt=login` — forces fresh login, bypasses SSO
- Check `sso_extension_mode` (full = managed broker active)
- Check `wpj_status` (joined = device registered)
- Check `device_mode` (personal vs shared)

## Known Issues
- **Prompt=login blocking SSO**: See intune-onenote-260
- **Cross-tenant device compliance with Edge**: See intune-onenote-261
- **B2B/CC B2B SSO failure**: Edge PG confirmed bug for cross-tenant scenarios

## ADO Wiki Reference
- [Entra ID device registration and broker scenarios on iOS and macOS](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1761912/Entra-ID-device-registration-and-broker-scenarios-on-iOS-and-macOS)
