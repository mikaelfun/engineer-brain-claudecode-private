# ENTRA-ID WAM/OneAuth Authentication — Detailed Troubleshooting Guide

**Entries**: 63 | **Drafts fused**: 12 | **Kusto queries**: 0
**Draft sources**: ado-wiki-c-WebView2-Integration-Entra-ID-WAM.md, ado-wiki-e-wam-log-collection-analysis.md, ado-wiki-e-wam-profile-pictures.md, ado-wiki-e-wam-scoping-troubleshooting.md, ado-wiki-g-oneauth-msal-overview.md, ado-wiki-troubleshooting-wam-sso-issues.md, onenote-clear-oneauth-cache.md, onenote-clear-wam-cache.md, onenote-wam-auth-troubleshooting.md, onenote-wam-sso-outlook-trace.md
**Generated**: 2026-04-07

---

## Phase 1: Oneauth
> 25 related entries

### Auth error 1200 in Teams, tag 657rx code 2148073494 (TPM_E_PCP_WRONG_PARENT)
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: TPM error on device. Maps to BrokerTpmError, InteractionRequired.

**Solution**: Restart computer. If persists, manual TPM recovery per MS docs.

---

### Something went wrong [1001] tags 7q6ch/5fcl8 after Office upgrade on Win Server 2019 + Citrix
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: 7q6ch=REGDB_E_CLASSNOTREG; 5fcl8=ERROR_PROCESS_ABORTED. Known Citrix issue on Win Server 2019.

**Solution**: Apply Citrix TSG CTX267071. For 5fcl8, check if antivirus blocks AAD/MSA WAM plugin and add exclusion.

---

### Teams login failure tag 7q6ch code 2147009770 - default WAM Unexpected error
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: 7q6ch is default Unexpected tag for WAM errors on Windows.

**Solution**: Follow WAM TSG. Transfer to WAM team or WAM Core if needed.

---

### Teams/OneDrive sign-in issues with expired PRT, tag 657rx code 2148073494 (NTE_BAD_KEYSET)
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: WAM returns NTE_BAD_KEYSET. WAM recovery logic requires device to be in good state.

**Solution**: Check device state first. Fix device state if bad, then retry. Collect logs for WAM investigation.

---

### Work Profile Error after domain password change with OneAuth tag 5pa42 (SSL handshake error in broker)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Error originates from Android broker during SSL handshake, not related to OneAuth/MSAL library.

**Solution**: Route to Mobile Broker team for diagnosis. This is a broker-side issue.

---

### After Android OS v14 update, cannot access Teams and OneDrive with OneAuth tag 5ssab (broker CANCEL)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Android broker returns CANCEL status. Not related to OneAuth/MSAL.

**Solution**: Route to Mobile Broker team. Broker-side issue triggered by OS update.

---

### Android broker returning INVALID_REQUEST with tag 5objn, Something went wrong window
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Tag 5objn = broker INVALID_REQUEST. Can be returned for multiple server-side reasons.

**Solution**: Route to Android broker team. INVALID_REQUEST comes from broker, not OneAuth.

---

### Alternate ID with domain hint not functioning correctly in Office 365 with OneAuth
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: OneAuth does not pass domain hint to WAM during silent requests. Known issue, Feature 3127468.

**Solution**: Workaround: do not use alternate ID. Feature request tracked: Feature 3127468.

---

### Unexpected sign-in prompts in Word/Excel/PowerPoint/Outlook - Office calls SignInInteractively without prior InteractionRequired
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Office shared code (OXO) calls SignInInteractively when unable to find matching identity for resources. Not OneAuth InteractionRequired.

**Solution**: Check logs: if SignInInteractively called without preceding InteractionRequired, route to OXO team for resource/identity mapping fix.

---

### Connect-MicrosoftTeams error "service cannot be started" on Windows Server 2019 - WAM disabled
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: WAM (Web Account Manager) service is not enabled on the device.

**Solution**: Run services.msc, find Web Account Manager service, enable and start it, then retry.

---

## Phase 2: Wam
> 16 related entries

### Office 客户端反复弹出 WAM 认证提示 (0xCAA10001 Need user interaction)，用户频繁被要求重新登录。
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: WAM 被调用时未传入 web account (webAccountCount=0)，只传了 LoginHint。当 LoginHint 的 UPN 与 Windows 已登录域用户不一致时，WAM 返回 0xCAA10001 (ERROR_ADAL_NEED_CREDENTIAL) 触发认证提示。首次认证成功后 WAM 会缓存 RT 和 web account，后续带 web account 调用可正常静默获取 token。

**Solution**: 1) 分析 WAM 日志 (Event ID 0x4AA50119) 确认 webAccountCount 和 LoginHint。2) 如果是首次登录触发的提示属正常行为。3) 如果反复出现，检查 Office 是否正确传递 web account 信息。4) 使用 WAM diagnostics tool (aka.ms/wamhot) 清理 token cache 后重新登录。5) 确认 LoginHint UPN 是否与期望用户一致。

---

### Security software (Tumbleweed/Axway Desktop Validator) causes WAM SSO failure 0xCAA70007 and 0xCAA5001C
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Third-party cert chain verification software interferes with WAM SSO process

**Solution**: Check CAPI2 logs for cert chain issues. Whitelist or reconfigure security software

---

### Sign-in prompt loop with AADSTS135011 'Device used during authentication is disabled'; AADSTS70002 credential validation error
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device object disabled in Azure AD by admin, policy, or security concern

**Solution**: Enterprise admin re-enables the device in Azure AD portal (Manage device identities). Verify device not accidentally disabled by stale device cleanup policy

---

### Error 0xcaa70007 (ERROR_INET_DOWNLOAD_FAILURE) / 0xCAA5001C Token broker operation failed during WAM SSO; CAPI2 logs show certificate chain verific...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Third-party security software (Tumbleweed Desktop Validator/tmwdcapiclient.dll or Axway Desktop Validator) interferes with WAM SSO flow by intercepting certificate chain verification during token acquisition

**Solution**: Check CAPI2 logs at the time of the 0xCAA70007 error for certificate chain verification failures from 3rd party apps. Identify if Tumbleweed Desktop Validator or Axway Desktop Validator is installed. Work with vendor or exclude security software from intercepting WAM/AAD certificate operations.

---

### Error 'the service cannot be started, either because it is disabled or because it has no enabled devices associated with it' when running Connect-M...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Web Account Manager (WAM) service is not enabled or running on the device.

**Solution**: Enable WAM by running services.msc, locate 'Web Account Manager' service, enable and start it, then retry.

---

### Silent token calls on WAM failing with wamcompat_id_token not present in WAM response on Windows 10 RS1. Error tag 62ubh.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Obtaining wamcompat_id_token is only supported starting with Windows 10 RS2 and above. RS1 does not support this feature.

**Solution**: Upgrade to Windows 10 RS2 or later. This is expected behavior on RS1.

---

### Users unable to sign-in to M365 apps after installing Windows patch KB5062554. WAM returns AADSTS9002341: User is required to permit SSO.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AADSTS9002341 is a by-design DMA (Data Migration Authorization) block. Results in WAM UI being shown, which may fail for other reasons.

**Solution**: Follow WAM SSO TSG DMA error section. If interactive sign-in also fails after user permits SSO, investigate further with WAM team.

---

### Teams interactive logon failures after installing March 12, 2024 Windows Updates. WAM-dependent Teams sign-in breaks after applying monthly securit...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: March 12, 2024 Windows security update (KB) introduced a regression affecting WAM/Token Broker flows used by Teams for interactive logon. ICM 482538640.

**Solution**: Check if uninstalling the March 2024 cumulative update or applying the follow-up fix resolves the issue. See linked internal article for specific KB remediation.

---

### Dell Optimizer driver ExpCo10X64.sys causes sign-in issues in Outlook and Microsoft Teams on Dell devices. Repeated authentication prompts or failu...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Dell Optimizer driver (ExpCo10X64.sys) interferes with WAM/Token Broker authentication flows, blocking or corrupting token acquisition for AAD-integrated applications.

**Solution**: Uninstall or disable Dell Optimizer driver (ExpCo10X64.sys). Verify sign-in works after driver removal. Contact Dell for updated driver that does not conflict with WAM.

---

### Windows RDClient published as Citrix app fails to do feed discovery for WVD/AVD. Immersive Shell/WAM dependency causes feed discovery failure in Ci...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: RDClient relies on WAM (Immersive Shell) for feed discovery but Citrix published app environment does not properly support WAM broker plugin, breaking token acquisition.

**Solution**: Use RDClient natively instead of as Citrix published app, or use web client as alternative for AVD feed discovery. Verify Citrix environment WAM broker support.

---

## Phase 3: Webview2
> 6 related entries

### WebView2 WAM sign-in: IdP login page shows blank or broken UI in mini-browser after enabling WebView2Integration registry key on Windows 24H2/25H2
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Third-party IdP relies on legacy EdgeHTML behaviors or user-agent detection (e.g. Edge/18.x) that does not recognize Chromium-based WebView2 engine

**Solution**: IdP must update login page for Chromium compatibility: use capability-based detection instead of user-agent checks. Quick test: if page fails in Edge browser, it will fail in WebView2.

---

### WebView2 integration not enabled in WAM despite setting WebView2Integration registry key to 1
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device not patched to min build (26100.7462 or 26200.7462), registry key path/value incorrect, or device not rebooted

**Solution**: 1) Verify Win 24H2 26100.7462+ or 25H2 26200.7462+. 2) Confirm HKLM Software Policies Microsoft Windows AAD WebView2Integration = DWORD 1. 3) Reboot. Verify via Task Manager: multiple processes under Work or School account.

---

### WebView2 embedded browser in WAM closes immediately after opening, shows blank window, or cannot connect to internet
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Third-party security software (antivirus/DLP) injecting DLLs into msedgewebview2.exe or Microsoft.AAD.BrokerPlugin.exe

**Solution**: Use Procmon to check for external DLLs in BrokerPlugin.exe or msedgewebview2.exe child processes. Exclude msedgewebview2.exe from antivirus/DLP scanning.

---

### WebView2 WAM auth fails: browser crashes after customer hardened System32 permissions
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ALL APPLICATION PACKAGES permissions removed from System32 folder causing integrity level mismatch for WebView2 runtime

**Solution**: Restore default ALL APPLICATION PACKAGES permissions on C:\Program Files (x86)\Microsoft\EdgeWebView\Application AND C:\Windows\System32\Microsoft-Edge-WebView.

---

### WebView2 WAM mini-browser no internet - auth flow fails while Edge browser works fine
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Firewall blocking msedgewebview2.exe outbound connections - WebView2 uses Chromium networking stack separate from Windows networking

**Solution**: Remove msedgewebview2.exe from firewall blocked applications list. WebView2 is Chromium-based with different proxy/TLS behavior than legacy EdgeHTML - verify proxy and TLS compatibility separately.

---

### IDP login page renders in Edge browser but fails/blank in WAM WebView2 mini-browser (BrokerPlugin running from System32)
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Problem with System WebView2 runtime files in System32\Microsoft-Edge-Webview - sandboxed system runtime behaves differently than Evergreen runtime

**Solution**: Engage Windows Platforms support for System runtime issues. Escalation: ICM via aka.ms/wamhot, Scenario: Cloud Identity AuthN Client Team (Windows). Try reproducing with Evergreen runtime for comparison.

---

## Phase 4: Dma
> 3 related entries

### Windows user in EEA region receives AADSTS9002341 error (User is required to permit SSO) when signing in to apps. The error appears in AAD Operatio...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Digital Markets Act (DMA) compliance requires Windows to prompt EEA users for SSO consent before sharing credentials across apps. This is by-design behavior triggered when x-ms-SsoFlags header indicates EEA device region. The block exposes WAM UI, which may fail if other issues exist (e.g., AV blocking AAD WAM plugin).

**Solution**: User must click Continue on the SSO consent notice. This is a legal requirement - do NOT recommend disabling WAM or falling back to ADAL. If user clicks dont sign in, the prompt reappears next time. For S500 customers with SevA, a KIR (Known Issue Rollback) is available per Windows version. Check for underlying WAM issues if the UI flow itself fails.

---

### User receives AADSTS9002342 error (User denied SSO permission) in Azure sign-in logs after clicking dont sign in on the DMA SSO consent prompt.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User actively chose to decline SSO permission on the DMA consent notice. This choice is not persisted - the prompt will appear again next time an app requests SSO.

**Solution**: This is expected behavior. The user can click Continue on the next prompt to grant SSO permission. If the user wants SSO, they need to accept the notice. The decline only applies to that single prompt instance.

---

### User sees a TypeError dialog instead of the DMA SSO consent prompt when signing in on Windows in EEA region.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Underlying bug in the WebView stack where Intl API is not available. Occurs when the machine timezone settings do not match the geographic region. Bug 51735640 - will not be fixed.

**Solution**: Check Windows timezone settings (Settings > Time and Language > Language and Region > Device Setup Region) and ensure the machine is set to the same timezone as the geographic region the user is in.

---

## Phase 5: Powershell
> 2 related entries

### Connect-MgGraph fails with AADSTS50011 redirect URI mismatch for sovereign clouds (UsGov/China) after upgrading to Microsoft.Graph PowerShell 2.34.0+
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft.Graph PowerShell SDK 2.34.0 enables WAM (Web Account Manager) by default on Windows, but WAM redirect URIs are not registered for sovereign cloud applications

**Solution**: Use -UseDeviceCode or -UseDeviceAuthentication switch with Connect-MgGraph, OR downgrade to Microsoft.Graph version 2.28.0

---

### Connect-MgGraph fails with AADSTS50011 for sovereign clouds after Microsoft.Graph PowerShell 2.34.0+
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SDK 2.34.0 enables WAM by default. WAM redirect URIs not registered for sovereign cloud apps.

**Solution**: Use -UseDeviceCode or -UseDeviceAuthentication switch, OR downgrade to version 2.28.0.

---

## Phase 6: Dual Federation
> 1 related entries

### PowerApps mobile app fails to authenticate Mooncake account in dual-federation environment when OneAuth is enabled for public tenant.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: OneAuth feature bug: when enabled for public tenant, PowerApps mobile uses OneAuth instead of Authenticator. OneAuth cannot distinguish dual-fed accounts with same UPN.

**Solution**: (1) Select Use legacy sign-in in Power Apps mobile login UI. (2) Engage PowerApps PG to disable OneAuth feature flag on the tenant. (3) Users must re-install PowerApps mobile app after PG change.

---

## Phase 7: Mecontrol
> 1 related entries

### Office client (OneNote/Outlook) shows FixMe button and yellow triangle in MeControl. After clicking FixMe, CC B2B (cross-cloud B2B) error appears. ...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Office client CredAccessor constructed without specific account, tries both global and Gallatin accounts. When CA requires re-auth, both accounts fail silently, triggering FixMe. FixMe attempts sign-in using Gallatin login_hint against public Entra ID endpoint, triggering CC B2B flow that fails because accounts are not invited cross-cloud.

**Solution**: Workaround: Sign out the Gallatin/21V account so only one cloud account is active. Or ask admin to relax CA policy. Long-term fix requires code change in Office identity client (MeControl owned by Office Lifecycle Programmable Surfaces/FIO team).

---

## Phase 8: Prt
> 1 related entries

### Applications using pure ADAL (non-WAM) library do not benefit from PRT SSO. MFA prompts repeat across applications even though MFA was already comp...
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: PRT is only created/updated by WAM (broker) and Cloud AP plugin flows. Pure ADAL library bypasses WAM, so MFA claim is not stored in PRT. Other apps using WAM cannot see the MFA satisfaction.

**Solution**: Migrate applications from ADAL to MSAL with broker (WAM) enabled. Ensure apps use WAM-aware authentication to share PRT and MFA claims across all apps on the device.

---

## Phase 9: Sso
> 1 related entries

### Need reference: Sample working SSO trace for Outlook client on AADJ device using WAM/PRT - shows complete token acquisition flow from GetTokenSilen...
**Score**: 🟢 8.0 | **Source**: OneNote

**Solution**: AAD Analytic log (Event ID 1099) flow: 1) GetTokenSilently started (0x4AA5001A) 2) Token request params logged (client=d3590ed6, resource=partner.outlook.cn, authority=login.partner.microsoftonline.cn) 3) Load client from cache using webaccount (0x4AA5011A) 4) Primary user context loaded (0x4AA50017) 5) Read RT from cache file (0x4AA50010, BrokerPlugin LocalState) 6) Send web request to /common/oauth2/token (0x4AA90010) 7) Renew token by PRT success (0x4AA90055) 8) Write renewed RT to cache (0x4

---

## Phase 10: Linux
> 1 related entries

### MSAL Python 使用 enable_broker_on_linux 标志在 WSL 和 standalone Linux 行为不同，不清楚依赖差异
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: WSL 使用 Windows Authentication Manager (WAM) 作为 broker（无需额外依赖）；standalone Linux 需要安装 Intune Portal 才能启用 broker；若 standalone Linux 未安装 broker 会自动 fallback 到 non-broker 认证流

**Solution**: WSL 环境：启用 enable_broker_on_linux 标志无需额外依赖（WAM 默认提供）；standalone Linux：需安装 Intune Portal 作为 broker；若只希望在 WSL 启用 broker（不影响 standalone），可在 Azure CLI 代码中仅在 WSL 检测时才设置 enable_broker_on_linux；未安装 broker 时自动 fallback，不会报错

---

## Phase 11: Msal.Net
> 1 related entries

### MSAL.NET MsalUiRequiredException ErrorCode current_broker_account: Only some brokers (WAM) can log in the current OS account
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: WAM broker cannot perform silent auth when OS signed in with personal MS account or ListOperatingSystemAccounts not enabled

**Solution**: Sign in with work/school account. Enable ListOperatingSystemAccounts in BrokerOptions. Use PublicClientApplication.OperatingSystemAccount for silent auth.

---

## Phase 12: Mandatory Mfa
> 1 related entries

### Azure CLI/PowerShell/SDK/IaC operations fail after mandatory MFA Phase 2 enforcement. Error may not mention MFA. PUT/PATCH/CREATE/DELETE on ARM den...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure System Policy checks MFA claim in access token for ARM control plane ops. Missing MFA flag = denied. User NOT prompted for MFA. Phase 2 started Sep 2025, public rollout Jan 2026.

**Solution**: Enforce MFA via CA Policy/Security Defaults/Per-user MFA. Use interactive login (browser/WAM/device-code). ROPC (az login --username --password) not supported - migrate to browser or device code flow.

---

## Phase 13: Teams
> 1 related entries

### Authentication error 1200 in Teams App with error tag 657rx, error code 2148073494. TPM-related error requiring device recovery.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TPM error (TPM_E_PCP_WRONG_PARENT). Windows authentication broker cannot complete request due to TPM issue.

**Solution**: Restart the computer. If issue persists, perform manual recovery per https://docs.microsoft.com/en-us/office365/troubleshoot/authentication/connection-issue-when-sign-in-office-2016#manual-recovery

---

## Phase 14: Citrix
> 1 related entries

### Something went wrong [1001] with tags 7q6ch and 5fcl8 after upgrading Office 365 from version 2308 to 2402 on Windows Server 2019 with Citrix.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: REGDB_E_CLASSNOTREG and ERROR_NOT_FOUND on Windows Server 2019 + Citrix environment. Tag 5fcl8 (ERROR_PROCESS_ABORTED) may indicate antivirus blocking AAD/MSA WAM plugin.

**Solution**: Apply Citrix TSG: https://support.citrix.com/s/article/CTX267071. For 5fcl8 errors, add exclusion in antivirus/protection software for AAD/MSA WAM plugin.

---

## Phase 15: Aadsts50214
> 1 related entries

### AADSTS50214: This web native bridge call resulted in an error from the operating system without external error data. Also AADSTS50207 in ASC Diagno...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The app MSAL.js integration uses allowNativeBroker flag, which enforces login requests through the native broker (Web Account Manager / WAM) for MFA. MSAL.js acquires tokens from WAM on Windows which are device-bound and not cached in browser storage.

**Solution**: For custom apps: set system.allowNativeBroker to false in MSAL config. Other options: (1) Update WAM and Azure AD Broker Plugin to latest, install latest Microsoft Authenticator on mobile. (2) Clear cached tokens, sign out all Microsoft accounts, clear cookies, restart browser. (3) Verify device meets CA compliance. (4) Try InPrivate/Incognito to bypass cached broker tokens.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | PowerApps mobile app fails to authenticate Mooncake account in dual-federatio... | OneAuth feature bug: when enabled for public tenant, Powe... | (1) Select Use legacy sign-in in Power Apps mobile login ... | 🟢 10.0 | OneNote |
| 2 | Auth error 1200 in Teams, tag 657rx code 2148073494 (TPM_E_PCP_WRONG_PARENT) | TPM error on device. Maps to BrokerTpmError, InteractionR... | Restart computer. If persists, manual TPM recovery per MS... | 🟢 9.5 | ADO Wiki |
| 3 | Something went wrong [1001] tags 7q6ch/5fcl8 after Office upgrade on Win Serv... | 7q6ch=REGDB_E_CLASSNOTREG; 5fcl8=ERROR_PROCESS_ABORTED. K... | Apply Citrix TSG CTX267071. For 5fcl8, check if antivirus... | 🟢 9.5 | ADO Wiki |
| 4 | Teams login failure tag 7q6ch code 2147009770 - default WAM Unexpected error | 7q6ch is default Unexpected tag for WAM errors on Windows. | Follow WAM TSG. Transfer to WAM team or WAM Core if needed. | 🟢 9.5 | ADO Wiki |
| 5 | Teams/OneDrive sign-in issues with expired PRT, tag 657rx code 2148073494 (NT... | WAM returns NTE_BAD_KEYSET. WAM recovery logic requires d... | Check device state first. Fix device state if bad, then r... | 🟢 9.5 | ADO Wiki |
| 6 | Office client (OneNote/Outlook) shows FixMe button and yellow triangle in MeC... | Office client CredAccessor constructed without specific a... | Workaround: Sign out the Gallatin/21V account so only one... | 🟢 9.0 | OneNote |
| 7 | Office 客户端反复弹出 WAM 认证提示 (0xCAA10001 Need user interaction)，用户频繁被要求重新登录。 | WAM 被调用时未传入 web account (webAccountCount=0)，只传了 LoginHint... | 1) 分析 WAM 日志 (Event ID 0x4AA50119) 确认 webAccountCount 和 L... | 🟢 9.0 | OneNote |
| 8 | Security software (Tumbleweed/Axway Desktop Validator) causes WAM SSO failure... | Third-party cert chain verification software interferes w... | Check CAPI2 logs for cert chain issues. Whitelist or reco... | 🟢 8.5 | ADO Wiki |
| 9 | Sign-in prompt loop with AADSTS135011 'Device used during authentication is d... | Device object disabled in Azure AD by admin, policy, or s... | Enterprise admin re-enables the device in Azure AD portal... | 🟢 8.5 | ADO Wiki |
| 10 | WebView2 WAM sign-in: IdP login page shows blank or broken UI in mini-browser... | Third-party IdP relies on legacy EdgeHTML behaviors or us... | IdP must update login page for Chromium compatibility: us... | 🟢 8.5 | ADO Wiki |
| 11 | WebView2 integration not enabled in WAM despite setting WebView2Integration r... | Device not patched to min build (26100.7462 or 26200.7462... | 1) Verify Win 24H2 26100.7462+ or 25H2 26200.7462+. 2) Co... | 🟢 8.5 | ADO Wiki |
| 12 | WebView2 embedded browser in WAM closes immediately after opening, shows blan... | Third-party security software (antivirus/DLP) injecting D... | Use Procmon to check for external DLLs in BrokerPlugin.ex... | 🟢 8.5 | ADO Wiki |
| 13 | WebView2 WAM auth fails: browser crashes after customer hardened System32 per... | ALL APPLICATION PACKAGES permissions removed from System3... | Restore default ALL APPLICATION PACKAGES permissions on C... | 🟢 8.5 | ADO Wiki |
| 14 | WebView2 WAM mini-browser no internet - auth flow fails while Edge browser wo... | Firewall blocking msedgewebview2.exe outbound connections... | Remove msedgewebview2.exe from firewall blocked applicati... | 🟢 8.5 | ADO Wiki |
| 15 | Work Profile Error after domain password change with OneAuth tag 5pa42 (SSL h... | Error originates from Android broker during SSL handshake... | Route to Mobile Broker team for diagnosis. This is a brok... | 🟢 8.5 | ADO Wiki |
| 16 | After Android OS v14 update, cannot access Teams and OneDrive with OneAuth ta... | Android broker returns CANCEL status. Not related to OneA... | Route to Mobile Broker team. Broker-side issue triggered ... | 🟢 8.5 | ADO Wiki |
| 17 | Android broker returning INVALID_REQUEST with tag 5objn, Something went wrong... | Tag 5objn = broker INVALID_REQUEST. Can be returned for m... | Route to Android broker team. INVALID_REQUEST comes from ... | 🟢 8.5 | ADO Wiki |
| 18 | Alternate ID with domain hint not functioning correctly in Office 365 with On... | OneAuth does not pass domain hint to WAM during silent re... | Workaround: do not use alternate ID. Feature request trac... | 🟢 8.5 | ADO Wiki |
| 19 | Unexpected sign-in prompts in Word/Excel/PowerPoint/Outlook - Office calls Si... | Office shared code (OXO) calls SignInInteractively when u... | Check logs: if SignInInteractively called without precedi... | 🟢 8.5 | ADO Wiki |
| 20 | Connect-MicrosoftTeams error "service cannot be started" on Windows Server 20... | WAM (Web Account Manager) service is not enabled on the d... | Run services.msc, find Web Account Manager service, enabl... | 🟢 8.5 | ADO Wiki |
| 21 | OneDrive does not silently sign in on VMs, tag 5akgo (Account provider is null) | Missing WAM account provider on VM. OneAuth forces UI flo... | Route to WAM team to investigate why account provider is ... | 🟢 8.5 | ADO Wiki |
| 22 | Silent token calls on WAM failing, tag 62ubh (wamcompat_id_token not present)... | wamcompat_id_token not supported on Win10 RS1. Expected b... | Upgrade to Windows 10 RS2 or later. | 🟢 8.5 | ADO Wiki |
| 23 | Unable to login Office 1001 with tag 48v35 on Win10 22H2 AVD - AppXSvc crash | Known Windows OS update bug on Win10 22H2/AVD. AppXSvc cr... | Check event logs for AppXSvc/svchost crash. Involve Windo... | 🟢 8.5 | ADO Wiki |
| 24 | SSO not working on Office apps, tag 6i0ht code 2147942405 (access denied from... | Access denied error from WAM resulting in ApiContractViol... | Follow WAM TSG. Route to WAM team if needed. | 🟢 8.5 | ADO Wiki |
| 25 | Teams "No network connection" error 2603 - HTTP 511 | HTTP 511 STATUS_NETWORK_AUTHENTICATION_REQUIRED. Caused b... | Check proxy settings. Network/proxy config issue, not aut... | 🟢 8.5 | ADO Wiki |
| 26 | Outlook 1001 after EXO migration - access denied to Entra endpoints behind Ke... | Kerberos TGT fails to refresh behind proxy. After expiry,... | Restart machine for new TGT. Configure M365 endpoint spec... | 🟢 8.5 | ADO Wiki |
| 27 | Unable to sign-in to M365 apps after KB5062554 - AADSTS9002341 user required ... | By design: WAM blocks when SSO consent not given. Block i... | By design. See WAM DMA error TSG. Investigate further onl... | 🟢 8.5 | ADO Wiki |
| 28 | Error 5z9gd signing into Word/Excel from AVD - URL access restrictions | Server-side URL access restrictions blocking Microsoft cl... | Whitelist M365 URLs per learn.microsoft.com M365 URLs and... | 🟢 8.5 | ADO Wiki |
| 29 | VS Code MCP login logs into wrong account after CBA flow - WAM bug | WAM bug confirmed: wrong account hint shown on WAM UI aft... | Route to WAM team. Confirmed WAM bug. | 🟢 8.5 | ADO Wiki |
| 30 | Connect-MgGraph fails with AADSTS50011 redirect URI mismatch for sovereign cl... | Microsoft.Graph PowerShell SDK 2.34.0 enables WAM (Web Ac... | Use -UseDeviceCode or -UseDeviceAuthentication switch wit... | 🟢 8.5 | ADO Wiki |
