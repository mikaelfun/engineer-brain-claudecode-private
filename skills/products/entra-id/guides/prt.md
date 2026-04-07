# ENTRA-ID Primary Refresh Token (PRT) — Quick Reference

**Entries**: 25 | **21V**: Partial (24/25)
**Last updated**: 2026-04-07
**Keywords**: prt, haadj, dsregcmd, wam, conditional-access, refresh-token

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/prt.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Users on non-persistent VDI machines encounter error 1000504 'Request contains mismatched device ... | Since May 2025, Microsoft enforces that device-bound refresh tokens cannot ro... | Ensure VDI environments do not roam authentication folders (%LOCALAPPDATA%\Pa... | 🟢 9.5 | ADO Wiki |
| 2 📋 | On HAADJ device (Mooncake), Office client shows cached credentials expired. Fix Me wizard loops. ... | Bug in Win10 2004. WAM writes renewed RT to new cache entry but Office reads ... | Outlook: Update to latest. OneDrive/SharePoint: PG fix pending. Workaround: W... | 🟢 9.0 | OneNote |
| 3 📋 | Fraction of users blocked by CA; PRT not received (AzureAdPrt: NO) on hybrid AAD joined Win10 170... | Win10 1709 Cloud AP Plugin uses UPN from logon cache (HKLM\\SOFTWARE\\Microso... | Upgrade Windows 10 to 1803+. Workaround: delete registry key HKLM\\SOFTWARE\\... | 🟢 9.0 | OneNote |
| 4 📋 | dsregcmd /status AzureAdPrtUpdateTime shows last network logon time instead of actual PRT refresh... | PRTReceivedTime only updated during network logon, not during WAM RefreshToke... | Bug tracked VS#28243502. Fix in version 2106 | 🟢 8.5 | ADO Wiki |
| 5 📋 | Edge WebView2-based application does not get SSO via Azure AD Primary Refresh Token (PRT); users ... | By default, Edge WebView2 has AllowSingleSignOnUsingOSPrimaryAccount set to F... | Application developer must set the environment variable AllowSingleSignOnUsin... | 🟢 8.5 | ADO Wiki |
| 6 📋 | Edge WebView-based application does not get SSO via PRT — user prompted to sign in again in WebVi... | Edge WebView AllowSingleSignOnUsingOSPrimaryAccount setting defaults to FALSE... | Application developer must set CoreWebView2EnvironmentOptions.AllowSingleSign... | 🟢 8.5 | ADO Wiki |
| 7 📋 | User2 passes Conditional Access device compliance check using User1's PRT after switching users i... | By design: browser passes the PRT to Azure AD and only the device ID is extra... | This is expected behavior (by design). Only device ID is pulled from PRT duri... | 🟢 8.5 | ADO Wiki |
| 8 📋 | PRT acquisition fails with STATUS_NO_SUCH_LOGON_SESSION (0xc000005f) — user realm discovery failed | AAD authentication service unable to find the user's domain because the UPN d... | 1) Add the domain of the user's UPN as a custom domain in AAD. 2) If on-prem ... | 🟢 8.5 | ADO Wiki |
| 9 📋 | Sign in silently not working on Linux - device bound PRT downgraded to device-less PRT by eSTS | eSTS server bug: device-bound PRT wrongly downgraded to device-less PRT. Logs... | File ICM to eSTS team. Check Logsminer for "device" keyword to confirm PRT la... | 🟢 8.5 | ADO Wiki |
| 10 📋 | HAADJ device has no PRT (Primary Refresh Token) after user logs in; device status shows valid Hyb... | Login delay on HAADJ device (user logs in after many days) causes the device/... | Ask user to perform a Password Reset from the device; this invalidates the ol... | 🟢 8.5 | ADO Wiki |
| 11 📋 | dsregcmd /status shows stale 'AzureAdPrtUpdateTime' - the timestamp does not reflect when the PRT... | PRTReceivedTime (shown as AzureAdPrtUpdateTime) is only updated during networ... | Known bug reported to PG (IcM 198241657, Bug 28243502). ETA fix in Windows ve... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Unexpected MFA prompts on Windows platform when PRT is signed with RSA device key during PRT rene... | ESTS only carries MFA claim from previous PRT when PRT is signed with Session... | Engineering fix in progress (Work item: identitydivision/Engineering#3260136)... | 🟢 8.5 | ADO Wiki |
| 13 📋 | 无法验证 Linux 设备上 Primary Refresh Token (PRT) 的当前状态或有效性 | Linux 平台尚未实现 PRT 状态可视化/查询功能，该功能仍属于待开发的 feature enhancement | 目前只能通过 `cat ~/.config/intune/registration.toml` 确认设备注册状态（间接验证 PRT 前提）；Linux P... | 🟢 8.5 | ADO Wiki |
| 14 📋 | Linux 设备上 Conditional Access (CA) policy 针对 device compliance 执行异常，或 PRT 行为与 Windows/Mac 不同 | Linux 不支持 deviceless PRT；PRT 仅在安装了 Intune Company Portal（broker）时可用；目前仅 Micro... | 确认设备已安装 Intune Company Portal 和 Microsoft Edge；CA policy 的 device-based 控制仅对 ... | 🟢 8.5 | ADO Wiki |
| 15 📋 | No PRT (Primary Refresh Token) on HAADJ device; device shows valid HAAD join status or pending st... | User logged into HAADJ device after prolonged absence (many days); during sig... | Ask user to perform a Password Reset from the machine; this invalidates the s... | 🟢 8.5 | ADO Wiki |
| 16 📋 | After PIM activation of Azure AD Joined Device Local Administrator role, user does not have Local... | Cached Primary Refresh Token (PRT) was issued before PIM role activation. PRT... | 1) Run 'dsregcmd /refreshprt' in Command Prompt to schedule PRT refresh. 2) W... | 🟢 8.5 | ADO Wiki |
| 17 📋 | After PIM elevation to Azure AD Joined Device Local Administrator role, user does not see Local A... | Cached Primary Refresh Token (PRT) issued before PIM elevation. PRT only refr... | Run dsregcmd /refreshprt to schedule PRT refresh, wait 1-2 minutes, then log ... | 🟢 8.5 | ADO Wiki |
| 18 📋 | Teams and OneDrive frequently having sign-in issues caused by invalid/expired Primary Refresh Tok... | NTE_BAD_KEYSET error mapped to InteractionRequired by WAM. WAM has recovery l... | Check device state first and fix if needed. Collect recording and logs, then ... | 🟢 8.5 | ADO Wiki |
| 19 📋 | Rich client (non-browser) applications prompt for MFA more often than expected after configuring ... | Rich clients use refresh tokens or PRTs. Azure AD validates the MFA Auth inst... | Set Remember my device duration to 90 days or more (default was increased to ... | 🟢 8.5 | ADO Wiki |
| 20 📋 | Users on non-persistent VDI machines encounter unexpected MFA prompt when opening first applicati... | Microsoft enforces blocking of roamed refresh token caches across non-persist... | 1) Recommended: Enable Microsoft Entra auth for RDP (https://learn.microsoft.... | 🟢 8.5 | ADO Wiki |
| 21 📋 | Slow logon on Windows 10 clients connected to Azure AD (Entra ID). PRT token refresh failures see... | Firewall or proxy dropping packets to login.microsoftonline.com, preventing A... | 1) Check dsregcmd /status output for device registration state. 2) Check AAD ... | 🟢 8.5 | ADO Wiki |
| 22 📋 | SSO stops working for desktop apps after user only uses browser for extended period. PRT becomes ... | Browser SSO (IE/Edge/Chrome extension) consumes PRT to generate SSO cookie, b... | Ensure at least one WAM-based app acquires token periodically (triggers PRT r... | 🟢 8.0 | OneNote |
| 23 📋 | Windows 10 Subscription Activation fails - LicenseAcquisition scheduled task errors, AAD event lo... | WAM plugin cannot silently acquire access token for https://onestore.microsof... | Collect system-context Fiddler trace using PsExec -s (LicenseAcquisition runs... | 🔵 7.5 | ADO Wiki |
| 24 📋 | Linux device PRT expires unexpectedly or SSO fails after period of device inactivity | On Linux, PRT is valid 90 days and renewed every 4 hours only when device is ... | Ensure device is used regularly to trigger PRT renewal (every 4 hours when ac... | 🔵 7.5 | ADO Wiki |
| 25 📋 | No local admin privileges on Entra joined device after Device Local Administrator role assignment | PRT cached before role assignment/PIM activation. CloudAP renews PRT every 4 ... | Run dsregcmd /refreshprt, wait 1-2 min, sign out/in. Verify with whoami /groups | 🔵 5.5 | MS Learn |

## Quick Troubleshooting Path

1. Check **prt** related issues (17 entries) `[onenote]`
2. Check **haadj** related issues (4 entries) `[onenote]`
3. Check **conditional-access** related issues (3 entries) `[onenote]`
4. Check **linux** related issues (3 entries) `[ado-wiki]`
5. Check **mfa** related issues (3 entries) `[ado-wiki]`
6. Check **vdi** related issues (2 entries) `[ado-wiki]`
7. Check **token-roaming** related issues (2 entries) `[ado-wiki]`
8. Check **dsregcmd** related issues (2 entries) `[ado-wiki]`
