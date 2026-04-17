# ENTRA-ID Primary Refresh Token (PRT) — Detailed Troubleshooting Guide

**Entries**: 25 | **Drafts fused**: 3 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-validating-prt-dsregcmd-command.md, ado-wiki-prt-troubleshooting-linux.md, onenote-prt-generation-troubleshooting.md
**Generated**: 2026-04-07

---

## Phase 1: Haadj
> 3 related entries

### On HAADJ device (Mooncake), Office client shows cached credentials expired. Fix Me wizard loops. WAM renews PRT/RT but Office uses old expired RT f...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Bug in Win10 2004. WAM writes renewed RT to new cache entry but Office reads from old cache. Authority URL mismatch causes wrong cache lookup. Fixed in Outlook, not SharePoint.

**Solution**: Outlook: Update to latest. OneDrive/SharePoint: PG fix pending. Workaround: WAM diagnostics (aka.ms/wamhot) to clear token cache.

---

### HAADJ device has no PRT (Primary Refresh Token) after user logs in; device status shows valid Hybrid AAD join or pending state but authentication r...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Login delay on HAADJ device (user logs in after many days) causes the device/application not to send PRT during sign-in to validate device status; PRT is absent even though device join status appears valid

**Solution**: Ask user to perform a Password Reset from the device; this invalidates the old/missing PRT and forces issuance of a new PRT

---

### No PRT (Primary Refresh Token) on HAADJ device; device shows valid HAAD join status or pending state but has no PRT; sign-in to Azure AD-protected ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User logged into HAADJ device after prolonged absence (many days); during sign-in the device/application does not send PRT to validate device status, leaving device without a valid PRT

**Solution**: Ask user to perform a Password Reset from the machine; this invalidates the stale state and forces the system to issue a new PRT to the device

---

## Phase 2: Dsregcmd
> 2 related entries

### dsregcmd /status AzureAdPrtUpdateTime shows last network logon time instead of actual PRT refresh time
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PRTReceivedTime only updated during network logon, not during WAM RefreshToken flow

**Solution**: Bug tracked VS#28243502. Fix in version 2106

---

### dsregcmd /status shows stale 'AzureAdPrtUpdateTime' - the timestamp does not reflect when the PRT was actually last renewed by WAM
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PRTReceivedTime (shown as AzureAdPrtUpdateTime) is only updated during network logon, not during RefreshToken flow (WAM PRT refresh). This is by design per code comment to trigger network logon with user credentials every 4 hours.

**Solution**: Known bug reported to PG (IcM 198241657, Bug 28243502). ETA fix in Windows version 21H1 (2106). The fix adds a separate field to track actual PRT update time vs network logon time.

---

## Phase 3: Mfa
> 2 related entries

### Unexpected MFA prompts on Windows platform when PRT is signed with RSA device key during PRT renewal at Windows Sign-in
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ESTS only carries MFA claim from previous PRT when PRT is signed with SessionKey or ECCDeviceKey. When PRT is signed with RSADeviceKey, MFA claim is dropped, causing re-authentication prompts.

**Solution**: Engineering fix in progress (Work item: identitydivision/Engineering#3260136). ETA June 2025. Until fixed: verify PRT signing key type (SessionKey vs DeviceKey) and check if device is eligible for ECC key upgrade. ICM reference: 611248028.

---

### Rich client (non-browser) applications prompt for MFA more often than expected after configuring Remember my device with duration less than 90 days.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Rich clients use refresh tokens or PRTs. Azure AD validates the MFA Auth instance timestamp on the token against the Remember my device days. When set lower than 90 days, the MFA claim expires faster, causing more frequent prompts for rich client apps.

**Solution**: Set Remember my device duration to 90 days or more (default was increased to 90 in Sep 2020, range 1-365 days). Navigate to Azure AD > Users > Multi-Factor Authentication > Service Settings > remember multi-factor authentication, set days to 90+.

---

## Phase 4: Linux
> 2 related entries

### 无法验证 Linux 设备上 Primary Refresh Token (PRT) 的当前状态或有效性
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Linux 平台尚未实现 PRT 状态可视化/查询功能，该功能仍属于待开发的 feature enhancement

**Solution**: 目前只能通过 `cat ~/.config/intune/registration.toml` 确认设备注册状态（间接验证 PRT 前提）；Linux PRT 有效期 90 天，设备活跃时每 4 小时自动续期，不活跃时仅 14 天有效

---

### Linux 设备上 Conditional Access (CA) policy 针对 device compliance 执行异常，或 PRT 行为与 Windows/Mac 不同
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Linux 不支持 deviceless PRT；PRT 仅在安装了 Intune Company Portal（broker）时可用；目前仅 Microsoft Edge for Linux 支持 device-bound tokens 和 CA enforcement

**Solution**: 确认设备已安装 Intune Company Portal 和 Microsoft Edge；CA policy 的 device-based 控制仅对 Edge Browser 有效；其他 native app（非 Edge）不受 device-bound tokens 保护

---

## Phase 5: Pim
> 2 related entries

### After PIM activation of Azure AD Joined Device Local Administrator role, user does not have Local Administrator (BUILTIN\Administrators) privileges...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Cached Primary Refresh Token (PRT) was issued before PIM role activation. PRT only auto-refreshes every 4 hours, so new role claims (including Device Local Admin) are not reflected until PRT is renewed.

**Solution**: 1) Run 'dsregcmd /refreshprt' in Command Prompt to schedule PRT refresh. 2) Wait 1-2 minutes. 3) Sign out of Windows session. 4) Sign back in. 5) Verify with 'whoami /all' that BUILTIN\Administrators group is listed. If still failing, collect Auth.zip traces (start-auth.ps1) and check Aad_Analytic.evtx Event IDs 1018,1144,1145,1028,1032,1246.

---

### After PIM elevation to Azure AD Joined Device Local Administrator role, user does not see Local Administrator privileges on AAD joined device. whoa...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Cached Primary Refresh Token (PRT) issued before PIM elevation. PRT only refreshes every 4 hours by default, so new role claims are not reflected until a new PRT is obtained.

**Solution**: Run dsregcmd /refreshprt to schedule PRT refresh, wait 1-2 minutes, then log out and log back in. Verify with whoami /all that BUILTIN\Administrators group appears. Check AzureAdPrtUpdateTime in dsregcmd /status to confirm PRT was issued after PIM activation.

---

## Phase 6: Vdi
> 2 related entries

### Users on non-persistent VDI machines encounter error 1000504 'Request contains mismatched device ids (with non-PRT scope)' when device-bound refres...
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: Since May 2025, Microsoft enforces that device-bound refresh tokens cannot roam between VDI machines. When a device-bound RT issued on one machine is presented from a different machine, the request is blocked. This enforcement targets token reuse scenarios that could bypass Conditional Access or MFA requirements.

**Solution**: Ensure VDI environments do not roam authentication folders (%LOCALAPPDATA%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy, %LOCALAPPDATA%\Microsoft\TokenBroker, %LOCALAPPDATA%\Microsoft\OneAuth, %LOCALAPPDATA%\Microsoft\IdentityCache) or registry keys (HKCU\SOFTWARE\Microsoft\IdentityCRL, HKCU\SOFTWARE\Microsoft\Windows NT\CurrentVersion\TokenBroker). If MFA is not required, the client silently recovers using the new machine's PRT. If MFA is required, users complete one MFA challenge per sess

---

### Users on non-persistent VDI machines encounter unexpected MFA prompt when opening first application after sign-in, or error code 1000504 (invalid_g...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft enforces blocking of roamed refresh token caches across non-persistent VDI machines. Device-bound refresh tokens from machine A are rejected on machine B due to mismatched device IDs. Machine B PRT is used silently to acquire new tokens, but if local login session lacks MFA claim, user must re-complete MFA for the first app. Only impacts device-bound RTs on HAADJ/AADJ machines; non-joined devices and PRTs are not affected.

**Solution**: 1) Recommended: Enable Microsoft Entra auth for RDP (https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on#enable-microsoft-entra-authentication-for-rdp) and enforce MFA at device sign-in to avoid additional prompts. 2) Legacy MFA: use NGC logon (face, smartcard) so PRT includes MFA claim. 3) Temporary exemption: open ICM to Identity AuthN Client / Cloud Identity AuthN MSAL Objective C, title "Request for KDFv1 exception", Sev 2.5, include Tenant ID and customer acknow

---

## Phase 7: Conditional Access
> 1 related entries

### Fraction of users blocked by CA; PRT not received (AzureAdPrt: NO) on hybrid AAD joined Win10 1709 devices; AADSTS50034 user account does not exist
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Win10 1709 Cloud AP Plugin uses UPN from logon cache (HKLM\\SOFTWARE\\Microsoft\\IdentityStore\\LogonCache) which contained incorrect onmicrosoft.com suffix instead of federated domain. Bug fixed in Win10 1803

**Solution**: Upgrade Windows 10 to 1803+. Workaround: delete registry key HKLM\\SOFTWARE\\Microsoft\\IdentityStore\\LogonCache to force rewrite with correct credentials

---

## Phase 8: Browser Sso
> 1 related entries

### SSO stops working for desktop apps after user only uses browser for extended period. PRT becomes stale, apps prompt for credentials again.
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: Browser SSO (IE/Edge/Chrome extension) consumes PRT to generate SSO cookie, but does NOT update/renew PRT. PRT is only renewed during Windows logon or WAM-based token acquisition. Extended browser-only usage causes PRT to age without renewal.

**Solution**: Ensure at least one WAM-based app acquires token periodically (triggers PRT renewal every 4 hours). If issue persists, lock/unlock workstation to trigger Cloud AP PRT renewal via Windows logon flow.

---

## Phase 9: Webview2
> 1 related entries

### Edge WebView2-based application does not get SSO via Azure AD Primary Refresh Token (PRT); users prompted to sign in even on AAD joined/registered ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By default, Edge WebView2 has AllowSingleSignOnUsingOSPrimaryAccount set to FALSE, so PRT is not injected into WebView2 requests

**Solution**: Application developer must set the environment variable AllowSingleSignOnUsingOSPrimaryAccount to TRUE in CoreWebView2EnvironmentOptions. End user can also enable 'Allow single sign-on for work or school sites using this profile' in Edge Settings > Profiles > Profile preferences if not signed into Edge.

---

## Phase 10: Sso
> 1 related entries

### Edge WebView-based application does not get SSO via PRT — user prompted to sign in again in WebView control
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Edge WebView AllowSingleSignOnUsingOSPrimaryAccount setting defaults to FALSE. Without this setting, PRT-based SSO is not injected into WebView browser requests

**Solution**: Application developer must set CoreWebView2EnvironmentOptions.AllowSingleSignOnUsingOSPrimaryAccount to TRUE. For Edge Chromium browser, enable 'Allow single sign-on for work or school sites using this profile' in Settings > Profiles > Profile preferences.

---

## Phase 11: Prt Sharing
> 1 related entries

### User2 passes Conditional Access device compliance check using User1's PRT after switching users in browser on HAADJ device
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design: browser passes the PRT to Azure AD and only the device ID is extracted from it. User2 cannot impersonate User1 based on shared PRT. The device-based CA policy checks device identity, not user identity from PRT.

**Solution**: This is expected behavior (by design). Only device ID is pulled from PRT during Conditional Access evaluation. User2 still authenticates with their own credentials. No action needed — not a security vulnerability.

---

## Phase 12: Status_No_Such_Logon_Session
> 1 related entries

### PRT acquisition fails with STATUS_NO_SUCH_LOGON_SESSION (0xc000005f) — user realm discovery failed
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AAD authentication service unable to find the user's domain because the UPN domain is not added as a custom domain in AAD, or the on-premises domain is non-routable (e.g. contoso.local).

**Solution**: 1) Add the domain of the user's UPN as a custom domain in AAD. 2) If on-prem domain is non-routable, configure Alternate Login ID (AltID). 3) Check Event 1144 in AAD Analytic logs for the UPN provided.

---

## Phase 13: Subscription Activation
> 1 related entries

### Windows 10 Subscription Activation fails - LicenseAcquisition scheduled task errors, AAD event log shows token acquisition failure for onestore.mic...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: WAM plugin cannot silently acquire access token for https://onestore.microsoft.com using PRT, or licensing.mp.microsoft.com rejects the request. Common causes: PRT not available, proxy/firewall blocking endpoints, stale device state.

**Solution**: Collect system-context Fiddler trace using PsExec -s (LicenseAcquisition runs as SYSTEM). Check AAD Operational event logs: Get-WinEvent -LogName 'Microsoft-Windows-AAD/Operational' | ?{$_.message -like '*onestore.microsoft.com*'}. Check Client-Licensing event logs at Applications and Service Logs > Windows > Client-Licensing > Admin. Verify PRT status with dsregcmd /status.

---

## Phase 14: Oneauth
> 1 related entries

### Sign in silently not working on Linux - device bound PRT downgraded to device-less PRT by eSTS
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: eSTS server bug: device-bound PRT wrongly downgraded to device-less PRT. Logsminer keyword "device" shows PRT lacks DeviceId.

**Solution**: File ICM to eSTS team. Check Logsminer for "device" keyword to confirm PRT lacks DeviceId.

---

## Phase 15: Linux Sso
> 1 related entries

### Linux device PRT expires unexpectedly or SSO fails after period of device inactivity
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: On Linux, PRT is valid 90 days and renewed every 4 hours only when device is in use. If unused, PRT is only valid for 14 days. Linux only integrates Intune and Edge Browser as native apps with broker support.

**Solution**: Ensure device is used regularly to trigger PRT renewal (every 4 hours when active). Only Edge Browser is supported for device-bound tokens and CA enforcement on Linux. If SSO fails after inactivity, re-authenticate via Intune Portal to obtain a new PRT.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Users on non-persistent VDI machines encounter error 1000504 'Request contain... | Since May 2025, Microsoft enforces that device-bound refr... | Ensure VDI environments do not roam authentication folder... | 🟢 9.5 | ADO Wiki |
| 2 | On HAADJ device (Mooncake), Office client shows cached credentials expired. F... | Bug in Win10 2004. WAM writes renewed RT to new cache ent... | Outlook: Update to latest. OneDrive/SharePoint: PG fix pe... | 🟢 9.0 | OneNote |
| 3 | Fraction of users blocked by CA; PRT not received (AzureAdPrt: NO) on hybrid ... | Win10 1709 Cloud AP Plugin uses UPN from logon cache (HKL... | Upgrade Windows 10 to 1803+. Workaround: delete registry ... | 🟢 9.0 | OneNote |
| 4 | dsregcmd /status AzureAdPrtUpdateTime shows last network logon time instead o... | PRTReceivedTime only updated during network logon, not du... | Bug tracked VS#28243502. Fix in version 2106 | 🟢 8.5 | ADO Wiki |
| 5 | Edge WebView2-based application does not get SSO via Azure AD Primary Refresh... | By default, Edge WebView2 has AllowSingleSignOnUsingOSPri... | Application developer must set the environment variable A... | 🟢 8.5 | ADO Wiki |
| 6 | Edge WebView-based application does not get SSO via PRT — user prompted to si... | Edge WebView AllowSingleSignOnUsingOSPrimaryAccount setti... | Application developer must set CoreWebView2EnvironmentOpt... | 🟢 8.5 | ADO Wiki |
| 7 | User2 passes Conditional Access device compliance check using User1's PRT aft... | By design: browser passes the PRT to Azure AD and only th... | This is expected behavior (by design). Only device ID is ... | 🟢 8.5 | ADO Wiki |
| 8 | PRT acquisition fails with STATUS_NO_SUCH_LOGON_SESSION (0xc000005f) — user r... | AAD authentication service unable to find the user's doma... | 1) Add the domain of the user's UPN as a custom domain in... | 🟢 8.5 | ADO Wiki |
| 9 | Sign in silently not working on Linux - device bound PRT downgraded to device... | eSTS server bug: device-bound PRT wrongly downgraded to d... | File ICM to eSTS team. Check Logsminer for "device" keywo... | 🟢 8.5 | ADO Wiki |
| 10 | HAADJ device has no PRT (Primary Refresh Token) after user logs in; device st... | Login delay on HAADJ device (user logs in after many days... | Ask user to perform a Password Reset from the device; thi... | 🟢 8.5 | ADO Wiki |
| 11 | dsregcmd /status shows stale 'AzureAdPrtUpdateTime' - the timestamp does not ... | PRTReceivedTime (shown as AzureAdPrtUpdateTime) is only u... | Known bug reported to PG (IcM 198241657, Bug 28243502). E... | 🟢 8.5 | ADO Wiki |
| 12 | Unexpected MFA prompts on Windows platform when PRT is signed with RSA device... | ESTS only carries MFA claim from previous PRT when PRT is... | Engineering fix in progress (Work item: identitydivision/... | 🟢 8.5 | ADO Wiki |
| 13 | 无法验证 Linux 设备上 Primary Refresh Token (PRT) 的当前状态或有效性 | Linux 平台尚未实现 PRT 状态可视化/查询功能，该功能仍属于待开发的 feature enhancement | 目前只能通过 `cat ~/.config/intune/registration.toml` 确认设备注册状态（... | 🟢 8.5 | ADO Wiki |
| 14 | Linux 设备上 Conditional Access (CA) policy 针对 device compliance 执行异常，或 PRT 行为与 ... | Linux 不支持 deviceless PRT；PRT 仅在安装了 Intune Company Portal（... | 确认设备已安装 Intune Company Portal 和 Microsoft Edge；CA policy ... | 🟢 8.5 | ADO Wiki |
| 15 | No PRT (Primary Refresh Token) on HAADJ device; device shows valid HAAD join ... | User logged into HAADJ device after prolonged absence (ma... | Ask user to perform a Password Reset from the machine; th... | 🟢 8.5 | ADO Wiki |
| 16 | After PIM activation of Azure AD Joined Device Local Administrator role, user... | Cached Primary Refresh Token (PRT) was issued before PIM ... | 1) Run 'dsregcmd /refreshprt' in Command Prompt to schedu... | 🟢 8.5 | ADO Wiki |
| 17 | After PIM elevation to Azure AD Joined Device Local Administrator role, user ... | Cached Primary Refresh Token (PRT) issued before PIM elev... | Run dsregcmd /refreshprt to schedule PRT refresh, wait 1-... | 🟢 8.5 | ADO Wiki |
| 18 | Teams and OneDrive frequently having sign-in issues caused by invalid/expired... | NTE_BAD_KEYSET error mapped to InteractionRequired by WAM... | Check device state first and fix if needed. Collect recor... | 🟢 8.5 | ADO Wiki |
| 19 | Rich client (non-browser) applications prompt for MFA more often than expecte... | Rich clients use refresh tokens or PRTs. Azure AD validat... | Set Remember my device duration to 90 days or more (defau... | 🟢 8.5 | ADO Wiki |
| 20 | Users on non-persistent VDI machines encounter unexpected MFA prompt when ope... | Microsoft enforces blocking of roamed refresh token cache... | 1) Recommended: Enable Microsoft Entra auth for RDP (http... | 🟢 8.5 | ADO Wiki |
| 21 | Slow logon on Windows 10 clients connected to Azure AD (Entra ID). PRT token ... | Firewall or proxy dropping packets to login.microsoftonli... | 1) Check dsregcmd /status output for device registration ... | 🟢 8.5 | ADO Wiki |
| 22 | SSO stops working for desktop apps after user only uses browser for extended ... | Browser SSO (IE/Edge/Chrome extension) consumes PRT to ge... | Ensure at least one WAM-based app acquires token periodic... | 🟢 8.0 | OneNote |
| 23 | Windows 10 Subscription Activation fails - LicenseAcquisition scheduled task ... | WAM plugin cannot silently acquire access token for https... | Collect system-context Fiddler trace using PsExec -s (Lic... | 🔵 7.5 | ADO Wiki |
| 24 | Linux device PRT expires unexpectedly or SSO fails after period of device ina... | On Linux, PRT is valid 90 days and renewed every 4 hours ... | Ensure device is used regularly to trigger PRT renewal (e... | 🔵 7.5 | ADO Wiki |
| 25 | No local admin privileges on Entra joined device after Device Local Administr... | PRT cached before role assignment/PIM activation. CloudAP... | Run dsregcmd /refreshprt, wait 1-2 min, sign out/in. Veri... | 🔵 5.5 | MS Learn |
