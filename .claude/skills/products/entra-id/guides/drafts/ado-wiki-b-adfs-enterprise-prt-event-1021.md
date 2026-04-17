---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Deep Dives - Features explained/ADFS EnterprisePRT and Event Id 1021"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20Deep%20Dives%20-%20Features%20explained%2FADFS%20EnterprisePRT%20and%20Event%20Id%201021"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS EnterprisePRT and Event ID 1021

## What is EnterprisePRT
Enterprise Primary Refresh Token is an optional token obtained from ADFS during Windows logon for federated domain users on Hybrid/Azure AD Joined devices. Used for on-premises resource access via ADFS conditional access. NOT needed for Azure-hosted resources.

Reference: https://identitypro.blog/enterprise-primary-refresh-tokens-prt-and-ad-fs-403e4d7fc7f2

## Event ID 1021 - Root Cause
- Windows 10/11 client invokes OAuth 2.0 Protocol Extensions for Broker Clients regardless of whether Device Auth is enabled on ADFS
- The JWT Bearer request from the device is not signed by a registered device
- ADFS checks AD for registered device info but cannot find it (no Device Writeback configured)
- Expected on ADFS 2016/2019/2022/2025 if Device Writeback is not enabled or Device Authentication is not configured

## Fix Options (Decision Tree)

### Option 1: Ignore (Recommended if not using WHFB Cert Trust)
Events are noisy but harmless. No action needed.

### Option 2: Disable EnterprisePRT on Clients (Preferred fix for noise)
Deploy via GPO:
```registry
[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\IdentityStore\LoadParameters\{B16898C6-A148-4967-9171-64D755DA8520}]
"EnterpriseSTSTokenDisabled"=dword:00000001
```

### Option 3: Configure Device Writeback + Device Auth
Full setup: https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/operations/configure-device-based-conditional-access-on-premises

### Option 4: Disable OAuth2 Endpoint (Server 2019+ only)
Only if no OAuth/OIDC apps are configured on ADFS. Do NOT disable OpenIDConfig endpoint on Server 2019+.

## Related Error: MSIS9448
> MSIS9448: Interaction is required by the token broker to resolve the issue. Enable the DeviceAuthenticationMethod 'SignedToken' in the Global Policy.

Fix:
```powershell
Set-AdfsGlobalAuthenticationPolicy -DeviceAuthenticationMethod SignedToken
Restart-Service adfssrv
```
**Warning**: Only do this on Server 2016. On Server 2019+, use Option 2 or 3 instead.

## Related Error: MSIS9426
> MSIS9426: Received invalid Oauth JWT Bearer. The JWT Bearer payload must contain 'scope'.

Troubleshooting:
- Check ADFS Debug logs Event ID 178 for request details
- Check Event ID 151 for /claims/displayname to identify calling device
- Disable unnecessary Windows call-home services on the device

## Related Error: MSIS9699
> MSIS9699: GlobalAuthenticationPolicy on the Server doesn't allow this OAuth JWT Bearer request.

Root Cause: EnterprisePRT failing because Device Authentication not configured.

Fix:
```powershell
Add-AdfsScopeDescription -Name ugs
# Then create ApplicationPermission and update GlobalAuthenticationPolicy
```

## Customer Email Template

**Subject: EnterprisePRT and Event Id 1021**

This is about the Event Id 1021. Essentially, devices (Windows 10/11) are trying to get an EnterprisePRT from ADFS. It's nothing bad, it's optional, but noisy if you have a large device base and your AD domain is federated.

Options:
- Ignore the events
- Disable EnterprisePRT acquisition on clients (recommended)
- Configure DeviceWriteback in AAD Connect + device authentication in ADFS
- Disable ADFS/Oauth2 Endpoint (only if no OAuth apps hosted)

Recommended: Deploy GPO registry key to stop EnterprisePRT requests:
```
HKLM\SOFTWARE\Microsoft\IdentityStore\LoadParameters\{B16898C6-A148-4967-9171-64D755DA8520}
"EnterpriseSTSTokenDisabled"=dword:00000001
```
