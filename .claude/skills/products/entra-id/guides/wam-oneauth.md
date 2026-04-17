# ENTRA-ID WAM/OneAuth Authentication — Quick Reference

**Entries**: 63 | **21V**: Partial (62/63)
**Last updated**: 2026-04-07
**Keywords**: wam, oneauth, windows, sso, teams, broker

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/wam-oneauth.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | PowerApps mobile app fails to authenticate Mooncake account in dual-federation environment when O... | OneAuth feature bug: when enabled for public tenant, PowerApps mobile uses On... | (1) Select Use legacy sign-in in Power Apps mobile login UI. (2) Engage Power... | 🟢 10.0 | OneNote |
| 2 📋 | Auth error 1200 in Teams, tag 657rx code 2148073494 (TPM_E_PCP_WRONG_PARENT) | TPM error on device. Maps to BrokerTpmError, InteractionRequired. | Restart computer. If persists, manual TPM recovery per MS docs. | 🟢 9.5 | ADO Wiki |
| 3 📋 | Something went wrong [1001] tags 7q6ch/5fcl8 after Office upgrade on Win Server 2019 + Citrix | 7q6ch=REGDB_E_CLASSNOTREG; 5fcl8=ERROR_PROCESS_ABORTED. Known Citrix issue on... | Apply Citrix TSG CTX267071. For 5fcl8, check if antivirus blocks AAD/MSA WAM ... | 🟢 9.5 | ADO Wiki |
| 4 📋 | Teams login failure tag 7q6ch code 2147009770 - default WAM Unexpected error | 7q6ch is default Unexpected tag for WAM errors on Windows. | Follow WAM TSG. Transfer to WAM team or WAM Core if needed. | 🟢 9.5 | ADO Wiki |
| 5 📋 | Teams/OneDrive sign-in issues with expired PRT, tag 657rx code 2148073494 (NTE_BAD_KEYSET) | WAM returns NTE_BAD_KEYSET. WAM recovery logic requires device to be in good ... | Check device state first. Fix device state if bad, then retry. Collect logs f... | 🟢 9.5 | ADO Wiki |
| 6 📋 | Office client (OneNote/Outlook) shows FixMe button and yellow triangle in MeControl. After clicki... | Office client CredAccessor constructed without specific account, tries both g... | Workaround: Sign out the Gallatin/21V account so only one cloud account is ac... | 🟢 9.0 | OneNote |
| 7 📋 | Office 客户端反复弹出 WAM 认证提示 (0xCAA10001 Need user interaction)，用户频繁被要求重新登录。 | WAM 被调用时未传入 web account (webAccountCount=0)，只传了 LoginHint。当 LoginHint 的 UPN 与... | 1) 分析 WAM 日志 (Event ID 0x4AA50119) 确认 webAccountCount 和 LoginHint。2) 如果是首次登录触... | 🟢 9.0 | OneNote |
| 8 📋 | Security software (Tumbleweed/Axway Desktop Validator) causes WAM SSO failure 0xCAA70007 and 0xCA... | Third-party cert chain verification software interferes with WAM SSO process | Check CAPI2 logs for cert chain issues. Whitelist or reconfigure security sof... | 🟢 8.5 | ADO Wiki |
| 9 📋 | Sign-in prompt loop with AADSTS135011 'Device used during authentication is disabled'; AADSTS7000... | Device object disabled in Azure AD by admin, policy, or security concern | Enterprise admin re-enables the device in Azure AD portal (Manage device iden... | 🟢 8.5 | ADO Wiki |
| 10 📋 | WebView2 WAM sign-in: IdP login page shows blank or broken UI in mini-browser after enabling WebV... | Third-party IdP relies on legacy EdgeHTML behaviors or user-agent detection (... | IdP must update login page for Chromium compatibility: use capability-based d... | 🟢 8.5 | ADO Wiki |
| 11 📋 | WebView2 integration not enabled in WAM despite setting WebView2Integration registry key to 1 | Device not patched to min build (26100.7462 or 26200.7462), registry key path... | 1) Verify Win 24H2 26100.7462+ or 25H2 26200.7462+. 2) Confirm HKLM Software ... | 🟢 8.5 | ADO Wiki |
| 12 📋 | WebView2 embedded browser in WAM closes immediately after opening, shows blank window, or cannot ... | Third-party security software (antivirus/DLP) injecting DLLs into msedgewebvi... | Use Procmon to check for external DLLs in BrokerPlugin.exe or msedgewebview2.... | 🟢 8.5 | ADO Wiki |
| 13 📋 | WebView2 WAM auth fails: browser crashes after customer hardened System32 permissions | ALL APPLICATION PACKAGES permissions removed from System32 folder causing int... | Restore default ALL APPLICATION PACKAGES permissions on C:\Program Files (x86... | 🟢 8.5 | ADO Wiki |
| 14 📋 | WebView2 WAM mini-browser no internet - auth flow fails while Edge browser works fine | Firewall blocking msedgewebview2.exe outbound connections - WebView2 uses Chr... | Remove msedgewebview2.exe from firewall blocked applications list. WebView2 i... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Work Profile Error after domain password change with OneAuth tag 5pa42 (SSL handshake error in br... | Error originates from Android broker during SSL handshake, not related to One... | Route to Mobile Broker team for diagnosis. This is a broker-side issue. | 🟢 8.5 | ADO Wiki |
| 16 📋 | After Android OS v14 update, cannot access Teams and OneDrive with OneAuth tag 5ssab (broker CANCEL) | Android broker returns CANCEL status. Not related to OneAuth/MSAL. | Route to Mobile Broker team. Broker-side issue triggered by OS update. | 🟢 8.5 | ADO Wiki |
| 17 📋 | Android broker returning INVALID_REQUEST with tag 5objn, Something went wrong window | Tag 5objn = broker INVALID_REQUEST. Can be returned for multiple server-side ... | Route to Android broker team. INVALID_REQUEST comes from broker, not OneAuth. | 🟢 8.5 | ADO Wiki |
| 18 📋 | Alternate ID with domain hint not functioning correctly in Office 365 with OneAuth | OneAuth does not pass domain hint to WAM during silent requests. Known issue,... | Workaround: do not use alternate ID. Feature request tracked: Feature 3127468. | 🟢 8.5 | ADO Wiki |
| 19 📋 | Unexpected sign-in prompts in Word/Excel/PowerPoint/Outlook - Office calls SignInInteractively wi... | Office shared code (OXO) calls SignInInteractively when unable to find matchi... | Check logs: if SignInInteractively called without preceding InteractionRequir... | 🟢 8.5 | ADO Wiki |
| 20 📋 | Connect-MicrosoftTeams error "service cannot be started" on Windows Server 2019 - WAM disabled | WAM (Web Account Manager) service is not enabled on the device. | Run services.msc, find Web Account Manager service, enable and start it, then... | 🟢 8.5 | ADO Wiki |
| 21 📋 | OneDrive does not silently sign in on VMs, tag 5akgo (Account provider is null) | Missing WAM account provider on VM. OneAuth forces UI flow to register provider. | Route to WAM team to investigate why account provider is missing on VM. | 🟢 8.5 | ADO Wiki |
| 22 📋 | Silent token calls on WAM failing, tag 62ubh (wamcompat_id_token not present) on Win10 RS1 | wamcompat_id_token not supported on Win10 RS1. Expected behavior, supported R... | Upgrade to Windows 10 RS2 or later. | 🟢 8.5 | ADO Wiki |
| 23 📋 | Unable to login Office 1001 with tag 48v35 on Win10 22H2 AVD - AppXSvc crash | Known Windows OS update bug on Win10 22H2/AVD. AppXSvc crash due to uninitial... | Check event logs for AppXSvc/svchost crash. Involve Windows performance team ... | 🟢 8.5 | ADO Wiki |
| 24 📋 | SSO not working on Office apps, tag 6i0ht code 2147942405 (access denied from WAM) | Access denied error from WAM resulting in ApiContractViolation status. | Follow WAM TSG. Route to WAM team if needed. | 🟢 8.5 | ADO Wiki |
| 25 📋 | Teams "No network connection" error 2603 - HTTP 511 | HTTP 511 STATUS_NETWORK_AUTHENTICATION_REQUIRED. Caused by customer proxy set... | Check proxy settings. Network/proxy config issue, not auth library problem. | 🟢 8.5 | ADO Wiki |
| 26 📋 | Outlook 1001 after EXO migration - access denied to Entra endpoints behind Kerberos proxy | Kerberos TGT fails to refresh behind proxy. After expiry, Entra calls fail wi... | Restart machine for new TGT. Configure M365 endpoint special handling. Route ... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Unable to sign-in to M365 apps after KB5062554 - AADSTS9002341 user required to permit SSO | By design: WAM blocks when SSO consent not given. Block itself is not root ca... | By design. See WAM DMA error TSG. Investigate further only if interactive sig... | 🟢 8.5 | ADO Wiki |
| 28 📋 | Error 5z9gd signing into Word/Excel from AVD - URL access restrictions | Server-side URL access restrictions blocking Microsoft cloud URLs for authori... | Whitelist M365 URLs per learn.microsoft.com M365 URLs and IP address ranges. | 🟢 8.5 | ADO Wiki |
| 29 📋 | VS Code MCP login logs into wrong account after CBA flow - WAM bug | WAM bug confirmed: wrong account hint shown on WAM UI after CBA flow. | Route to WAM team. Confirmed WAM bug. | 🟢 8.5 | ADO Wiki |
| 30 📋 | Connect-MgGraph fails with AADSTS50011 redirect URI mismatch for sovereign clouds (UsGov/China) a... | Microsoft.Graph PowerShell SDK 2.34.0 enables WAM (Web Account Manager) by de... | Use -UseDeviceCode or -UseDeviceAuthentication switch with Connect-MgGraph, O... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Connect-MgGraph fails with AADSTS50011 for sovereign clouds after Microsoft.Graph PowerShell 2.34.0+ | SDK 2.34.0 enables WAM by default. WAM redirect URIs not registered for sover... | Use -UseDeviceCode or -UseDeviceAuthentication switch, OR downgrade to versio... | 🟢 8.5 | ADO Wiki |
| 32 📋 | Error 0xcaa70007 (ERROR_INET_DOWNLOAD_FAILURE) / 0xCAA5001C Token broker operation failed during ... | Third-party security software (Tumbleweed Desktop Validator/tmwdcapiclient.dl... | Check CAPI2 logs at the time of the 0xCAA70007 error for certificate chain ve... | 🟢 8.5 | ADO Wiki |
| 33 📋 | MSAL Python 使用 enable_broker_on_linux 标志在 WSL 和 standalone Linux 行为不同，不清楚依赖差异 | WSL 使用 Windows Authentication Manager (WAM) 作为 broker（无需额外依赖）；standalone Linu... | WSL 环境：启用 enable_broker_on_linux 标志无需额外依赖（WAM 默认提供）；standalone Linux：需安装 Intu... | 🟢 8.5 | ADO Wiki |
| 34 📋 | MSAL.NET MsalUiRequiredException ErrorCode current_broker_account: Only some brokers (WAM) can lo... | WAM broker cannot perform silent auth when OS signed in with personal MS acco... | Sign in with work/school account. Enable ListOperatingSystemAccounts in Broke... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Azure CLI/PowerShell/SDK/IaC operations fail after mandatory MFA Phase 2 enforcement. Error may n... | Azure System Policy checks MFA claim in access token for ARM control plane op... | Enforce MFA via CA Policy/Security Defaults/Per-user MFA. Use interactive log... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Office 365 users prompted for credentials instead of seamless SSO when using Alternate ID with do... | OneAuth does not pass the domain hint to WAM during silent requests, causing ... | Workaround: Do not use Alternate ID. OneAuth currently does not support passi... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Error 'the service cannot be started, either because it is disabled or because it has no enabled ... | Web Account Manager (WAM) service is not enabled or running on the device. | Enable WAM by running services.msc, locate 'Web Account Manager' service, ena... | 🟢 8.5 | ADO Wiki |
| 38 📋 | Silent token calls on WAM failing with wamcompat_id_token not present in WAM response on Windows ... | Obtaining wamcompat_id_token is only supported starting with Windows 10 RS2 a... | Upgrade to Windows 10 RS2 or later. This is expected behavior on RS1. | 🟢 8.5 | ADO Wiki |
| 39 📋 | Authentication error 1200 in Teams App with error tag 657rx, error code 2148073494. TPM-related e... | TPM error (TPM_E_PCP_WRONG_PARENT). Windows authentication broker cannot comp... | Restart the computer. If issue persists, perform manual recovery per https://... | 🟢 8.5 | ADO Wiki |
| 40 📋 | Something went wrong [1001] with tags 7q6ch and 5fcl8 after upgrading Office 365 from version 230... | REGDB_E_CLASSNOTREG and ERROR_NOT_FOUND on Windows Server 2019 + Citrix envir... | Apply Citrix TSG: https://support.citrix.com/s/article/CTX267071. For 5fcl8 e... | 🟢 8.5 | ADO Wiki |
| ... | *23 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **oneauth** related issues (11 entries) `[onenote]`
2. Check **wam** related issues (9 entries) `[onenote]`
3. Check **windows** related issues (7 entries) `[ado-wiki]`
4. Check **webview2** related issues (5 entries) `[ado-wiki]`
5. Check **android** related issues (3 entries) `[ado-wiki]`
6. Check **657rx** related issues (2 entries) `[ado-wiki]`
7. Check **7q6ch** related issues (2 entries) `[ado-wiki]`
8. Check **office** related issues (2 entries) `[onenote]`
