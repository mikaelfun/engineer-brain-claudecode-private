---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Protection/Windows MAM"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Protection%2FWindows%20MAM"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows MAM (Mobile Application Management) for Edge

## About
Intune MAM extended to Microsoft Edge for Business on workplace joined Windows 11 BYOD devices. Allows secure access to organizational data via Edge Work Profile on personal Windows devices.

## How It Works
- **Application Configuration Policies (ACP)**: Customize org user experience in Edge
- **Application Protection Policies (APP)**: Secure org data and ensure device health
- **Windows Security Center MTD**: Detect local health threats on personal devices
- **Conditional Access**: Require app protection policy grant control via Entra ID
- **WAM (Web Account Manager)**: MAM-aware Edge acquires access tokens via silent/interactive flows

## Requirements
- Windows 11, build 10.0.22621 (22H2) or later
- Device NOT managed (not AAD Joined, not MDM enrolled)
- Not Workplace Joined to more than 2 users (limit 3 total)
- Windows Security Application Version: 1000.25873.0.9001+
- Windows Security Service Version: 1.0.2306.10002-0+
- Licensing: E3/Microsoft Intune Plan 1 for MAM, Entra ID P1 for CA

## Configuration Steps

### 1. Configure CA for App Protection on Windows
- Cloud apps: Office 365
- Conditions > Device platforms: Windows only
- Conditions > Client apps: Browser only
- Grant: Require app protection policy
- Enable policy: On

### 2. Enable MTD Connector
- Tenant Administration > Connectors and tokens > Mobile Threat Defense
- Add Windows Security Center connector
- Status changes to "Enabled" after first MAM enrollment (~30 min)

### 3. Configure Application Protection Policies
- Ref: https://learn.microsoft.com/en-us/mem/intune/apps/app-protection-policy-settings-windows

## Support Boundaries

| Scenario | Owning Team | Support Area Path |
|---|---|---|
| CA with Require app protection policy fails | MSaaS AAD Auth/Auth | Azure/AAD/CA/Grant or block |
| Workplace Join fails (>3 users) | Identity + Edge | Browser/Edge for Windows |
| Edge Work Profile setup/config/login | Edge support | Browser/Edge for Windows |
| MAM policy sent but behaviors not seen | Edge support | Browser/Edge for Windows |
| edge://edge-dlp-internals MAM flags not enabled | Edge support | Browser/Edge for Windows |
| Device Threat Levels inaccurate | MDE/Security | Security/MDTI |
| Unable to enable MTD connector | Intune | Azure/Intune/Protect/MTD |
| Configure CA for Windows MAM | Intune | Azure/Intune/App Protection - Windows |
| CA deployed but not working correctly | MSaaS AAD + Intune | Azure/AAD/CA |
| Configure APP for Windows MAM | Intune | Azure/Intune/App Protection - Windows |
| MAM flags enabled but compliance check fails | Intune | Azure/Intune/App Protection - Windows/Conditional Launch |

## Troubleshooting

### Key Diagnostic URLs
- `edge://policy` - View applied policies (MAM policies should appear)
- `edge://edge-dlp-internals` - View DLP state and MAM enabled status
- `edge://mam-internals` - Simulate health-check and deep link scenarios

### Log Files
| Area | Log Path |
|---|---|
| Entra ID / WAM | AAD Sign-in Events in Azure Portal |
| Windows Security Center | `%programfiles%\windows defender\mpcmdrun -Getfiles` |
| MAM Logs | `%LOCALAPPDATA%\Microsoft\Edge\User Data\MamLog.txt` |
| MAM Cache | `%LOCALAPPDATA%\Microsoft\Edge\User Data\MamCache.json` |
| Edge Crash Dumps | `%LOCALAPPDATA%\Microsoft\Edge\User Data\Crashpad\reports` |

### MamCache.json Structure
```json
{
  "CacheVersion": "<ver>",
  "Users": [{
    "Identity": "<AAD user ID>",
    "TenantId": "<AAD tenant ID>",
    "CloudEnvironment": "{Public|US|China}",
    "Preproduction": false,
    "Location": "<JWT>",
    "Enrollment": "<JWT>",
    "Policy": "<JWT>",
    "DeviceAction": "<JWT>"
  }]
}
```
All JWTs can be decoded with standard JWT tools.

### Policy Not Active in Edge
1. Check `edge://policy` and `edge://edge-dlp-internals/#mam-dlp-policies`
2. If policy not as configured, review MamLog.txt for service connection errors
3. Service request issues logged with correlation ID (client-request-id)

## Known Issues
1. **GCC-H/Mooncake**: Not supported (bug blocking FF/CN environments)
2. **BingChat**: Contextual Chat blocked with MAM applied
3. **Device Registration Delay**: User may be blocked briefly after successful registration - wait 1 min, retry in new tab
4. **Pre-existing Account**: Signing into Edge without registering via Heads Up Page permanently blocks MAM enrollment
5. **Health Check Bypass**: Dismissing health check dialog then switching profiles may allow access to protected content (fix in progress)

## Common Scenarios & Guidance
| Scenario | Guidance |
|---|---|
| APP not sent to subset of users | Standard targeting troubleshooting + check signed-in Edge Work Profile |
| Data leak scenarios | Managed Locations not applicable in Windows MAM v1 |
| Copy from unmanaged to managed app | Not applicable - only Edge is MAM app |
| App exemptions | Not applicable - Edge is the only Windows MAM app |
| Sharing/Data Transfer | All contained within Edge browser |
| Application Configuration Policies | Not applicable for Windows MAM v1 |
| Managed Location | Not applicable in v1 |

## Escalation Path
1. Post to Intune Apps-Protection and Configuration Teams Channel
2. Review Support Boundaries table
3. If RFC/IET needed after due diligence: email IntuneMAMEdgeCollab@microsoft.com
