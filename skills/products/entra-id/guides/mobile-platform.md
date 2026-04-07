# ENTRA-ID Mobile Platform Auth (iOS/macOS/Android) — Quick Reference

**Entries**: 92 | **21V**: Partial (85/92)
**Last updated**: 2026-04-07
**Keywords**: ios, macos, oneauth, android, msal, sso-extension

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/mobile-platform.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | macOS Platform SSO: Device Auth Challenge fails - UI prompt asking to register device OR unexpect... | With 3rd party MDM registration, PRT is deviceless. Device Auth challenge fal... | 1. Verify by collecting customer network trace - check if x-ms-PkeyAuth+ head... | 🟢 9.5 | ADO Wiki |
| 2 📋 | Teams iOS unable to sign in after tenant migration - old tenant data in keychain | Company Portal account deletion insufficient to clear iOS keychain. Old tenan... | Sign out from app + Authenticator + Company Portal. Open Edge, edge://signin-... | 🟢 9.5 | ADO Wiki |
| 3 📋 | ADFS integration with RSA Authentication Agent (custom MFA provider) fails to start secondary aut... | System locale mismatch between ADFS service account and the third-party MFA a... | Align system locale: 1) Verify ADFS service account. 2) Get SID: Get-ADUser -... | 🟢 9.0 | OneNote |
| 4 📋 | In dual-federation environment with same UPN in both public and 21v clouds, iOS users get "Org Da... | Intune SDK for iOS changed device primary user determination from UPN to OID ... | Short-term: (1) Use Edge web apps instead of native PowerApps app. (2) Use Te... | 🟢 9.0 | OneNote |
| 5 📋 | Newer Android devices cannot login Outlook when Intune Company Portal installed. White screen aft... | With Intune, Outlook uses Company Portal broker via WebView for SSO. ADFS ser... | Configure ADFS server or front-end NLB to return full certificate chain inclu... | 🟢 9.0 | OneNote |
| 6 📋 | Android broker network errors: device_network_not_available, device_network_not_available_doze_mo... | Unreliable network connectivity, firewall/proxy blocking broker requests, or ... | 1) Check internet connection stability 2) Disable firewall/proxy blocking for... | 🟢 8.5 | ADO Wiki |
| 7 📋 | macOS 26 Platform SSO: unable to get past login screen with non-admin accounts, warning dialog wi... | Authenticated Guest Mode (new macOS 26 feature) has not been validated or sup... | Do not use Authenticated Guest Mode with Microsoft Entra ID. No timeline for ... | 🟢 8.5 | ADO Wiki |
| 8 📋 | macOS Platform SSO: accessing Azure Files Storage via smb:// command fails with cloud Kerberos TGT | IdentifierURIs in app manifest file (Entra portal app registration) for AFS m... | Change the IdentifierURIs mapping in app manifest to use lowercase: cifs/$fil... | 🟢 8.5 | ADO Wiki |
| 9 📋 | macOS Platform SSO Kerberos not working - TGTs not issued or Kerberos Extension not functioning | Kerberos MDM configuration mismatch or Apple-side Kerberos Extension issue. O... | 1) Run 'app-sso platform -s' to verify TGTs issued (check tgt_ad and tgt_clou... | 🟢 8.5 | ADO Wiki |
| 10 📋 | iOS/macOS SSO-Extension fails with error 1001 SubStatus 6008 - associated domain validation failu... | Associated domain verification fails because HTTPS interception (proxy/firewa... | Exclude these hosts from HTTPS interception: app-site-association.cdn-apple.c... | 🟢 8.5 | ADO Wiki |
| 11 📋 | High frequency authentication prompts on iOS - users prompted repeatedly with MAM policy Authenti... | MAM inactivity policy (AuthenticationEnabled=true) and AAD SIF CA policy are ... | Remove one of the two policies. Preferably keep the AAD SIF CA policy (more s... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Chrome/Edge AADSTS50210 error on macOS when browser tries web native bridge flow to call broker | Broker returns PERSISTENT_ERROR for native bridge call, usually caused by ass... | 1) Verify associated domain validation is correct and fully passes. 2) Verify... | 🟢 8.5 | ADO Wiki |
| 13 📋 | x-ms-PKeyAuth+ header blocked by network proxy causing authentication failure - NSURLErrorDomain ... | Network proxy blocks HTTP requests containing '+' character in headers, speci... | Ask customer to configure proxy to allow x-ms-PKeyAuth+ header ('+' is a vali... | 🟢 8.5 | ADO Wiki |
| 14 📋 | iOS unmanaged broker: user gets 'unknown error' in M365 app (e.g. Outlook) after completing 3rd p... | When using unmanaged broker flow on iOS with app flip to Authenticator, user ... | Instruct user to return to the Microsoft Authenticator app after approving MF... | 🟢 8.5 | ADO Wiki |
| 15 📋 | iOS/macOS SSO extension Browser SSO mode: user not experiencing SSO despite being signed in Authe... | PRT-Recovery in Browser SSO mode is not supported when customer has deployed ... | 1. Verify if Authentication Strength CA policy is enabled. 2. If enabled, PRT... | 🟢 8.5 | ADO Wiki |
| 16 📋 | iOS device with multiple tenant registrations: when removing and re-registering a user or adding ... | Bug in WPJ registration handling on iOS when multiple tenant registrations ex... | 1. Hotfix rolled out in WPJ version 3.6.1 and Authenticator version 6.8.23. 2... | 🟢 8.5 | ADO Wiki |
| 17 📋 | macOS Platform SSO: password sync fails with 'window shake' error during Entra ID credential enro... | Per-User MFA blocks the Platform SSO password synchronization process during ... | Administrators should switch from Per-User MFA to Conditional Access MFA, whi... | 🟢 8.5 | ADO Wiki |
| 18 📋 | macOS SSO extension: non-MSAL 3rd party app fails SSO login, blocked by CA policy due to device a... | The 3rd party app's bundle ID is not in the SSO extension AppAllowList, so th... | In Intune Device Configuration > Platform SSO policy > Edit profile > Add set... | 🟢 8.5 | ADO Wiki |
| 19 📋 | macOS 15+ Platform SSO: frequent re-registration prompts. Sysdiagnose logs show 'Error deserializ... | Apple concurrency bug: AppSSOAgent and AppSSODaemon both update PSSO device c... | Ask customer to file an Apple Care ticket and engage with Apple to resolve th... | 🟢 8.5 | ADO Wiki |
| 20 📋 | iOS/macOS SSO Extension: frequent/unexpected MFA prompts. Sign-in logs show AADSTS700007 'grant i... | Token service implementation did not account for MFA + Sign-in Frequency CA p... | [Resolved] Fix deployed in Company Portal for macOS and MS Authenticator for ... | 🟢 8.5 | ADO Wiki |
| 21 📋 | MacOS Intune enrollment fails with keychain error -25244 (errSecInvalidOwnerEdit) when registerin... | WPJ keychain items created by one MS app lack com.microsoft general access in... | Update WPJ client library to >= 3.3.3 which adds com.microsoft general access... | 🟢 8.5 | ADO Wiki |
| 22 📋 | MacOS device authentication fails silently; third-party security tools (McAfee, Charles, JAMF-man... | Third-party security tools intercept or block device authentication network f... | Temporarily disable third-party security tools (McAfee, Charles proxy, etc.) ... | 🟢 8.5 | ADO Wiki |
| 23 📋 | Shared Device Mode (SDM) app authentication failure on Android/iOS - need to determine if issue i... | SDM authentication issues can be in the SDM framework (MSAL/Authenticator bro... | 1) Try another SDM-aware app to isolate: if only one app fails, collaborate w... | 🟢 8.5 | ADO Wiki |
| 24 📋 | CBA sign-in fails with AADSTS1001003: Unable To Acquire Value Specified In Binding From Certificate | User selected the wrong certificate from the certificate picker during sign-i... | Instruct user to swipe through the certificate list and select the correct on... | 🟢 8.5 | ADO Wiki |
| 25 📋 | Android Edge CA does not prompt to register device, tag 5sr96 (interaction required from broker) | Tag 5sr96 = interaction required from Android broker due to CA policy. Logsmi... | Review customer CA policy. Interaction required is caused by CA policy requir... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Invalid account (2201) errors in Edge on Android Shared Device Mode (SDM) using SSO | Under SDM, Edge SignInSilently fails with InteractionRequired when account is... | Upgrade to OneAuth 6.2.1 with partial success status for SignIn* methods. | 🟢 8.5 | ADO Wiki |
| 27 📋 | Teams cannot sign-in on macOS due to corrupted keychain error -25308 (OSQuery bug) | Bug in OSQuery (github.com/osquery/osquery/issues/7780) corrupts Local Items ... | Quit all M365 apps. Go to ~/Library/Keychains. Delete folders with long alpha... | 🟢 8.5 | ADO Wiki |
| 28 📋 | Unable to sign back in after signing out on MacOS, tag 6p73z (Account previously signed out) | Dual-headed account (UPN mapped to both AAD and MSA). Keychain entries preven... | Delete keychain entries: search tenant ID GUID + MSA Tenant GUID 4c5b-b112-36... | 🟢 8.5 | ADO Wiki |
| 29 📋 | User asked for password on MacOS despite SSO Extension being available and configured | Known OneAuth-MSAL feature gap. SignInSilently only works on Windows/iOS-SDM/... | Expected behavior until fix ships (Q2/Q3 CY25). After fix, SignInSilently sho... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Multiple login prompts on iOS with keychain error -25308, tag 4ut12 | Device keychain corrupted. Keychain save fails with status -25308. | Collect sys.diagnose dump. Route to msal-objC (Apple) team for investigation. | 🟢 8.5 | ADO Wiki |
| 31 📋 | iOS MAM integration causing multiple credential prompts during MFA | MAM/Authenticator app integration issue causing duplicate auth prompts. | Update Authenticator to latest version. Collect broker logs if persists. | 🟢 8.5 | ADO Wiki |
| 32 📋 | AADSTS50020 on iOS Office apps after tenant migration - account from old tenant | After tenant migration, auth library still requests from previous tenant. Kno... | Clear cache: uninstall affected apps, Edge edge://signin-internals removeAllA... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Edge iOS cannot permanently clear accounts with "sign out and forget" | On iOS, only Authenticator app has permission to permanently remove accounts.... | Sign into Authenticator with the account, then remove it in Authenticator. | 🟢 8.5 | ADO Wiki |
| 34 📋 | License seats not released after on-premises synced group with GBL is removed from sync scope and... | When synced group is deleted, the DeletingLicensedGroupNotAllowed protection ... | Reprocess individual users via Entra portal (small scale) or use Invoke-MgLic... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Unable to get past login screen on macOS 26 with Authenticated Guest Mode; warning dialog appears... | Authenticated Guest Mode introduced in macOS 26 has not been validated or sup... | Do not use Authenticated Guest Mode with Microsoft Entra ID at this time. No ... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Platform SSO Kerberos integration not working - TGTs not being used or Kerberos authentication fa... | Either TGTs were not successfully issued by Entra ID during PSSO PRT acquisit... | 1. Run 'app-sso platform -s' to verify TGTs are issued (check tgt_ad/tgt_clou... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Access to Azure Files Storage via smb:// command on macOS fails when using Platform SSO cloud Ker... | IdentifierURIs in Azure Files app manifest in Entra portal uses uppercase 'CI... | Check the IdentifierURIs in the app manifest of the Azure Files Storage app r... | 🟢 8.5 | ADO Wiki |
| 38 📋 | iOS unmanaged broker (app flip) 场景：用户在第三方 MFA app（如 Duo）完成审批后直接打开 Outlook 等目标应用，导致显示 unknown error | Auth 流程需在 Authenticator 中闭环：Duo 批准后需手动返回 Authenticator，由 Authenticator 完成流程后自... | 引导用户：第三方 MFA 批准后先返回 Microsoft Authenticator app，等待 Authenticator 自动回跳到 Outloo... | 🟢 8.5 | ADO Wiki |
| 39 📋 | iOS 18.1.x 设备使用 NFC YubiKey 认证时，顶部通知提示检测到 YubiKey 并要求打开 Safari，但无密码输入弹窗，用户无法完成认证 | iOS 18.1.x 已知 bug（Yubico 报告）：NFC YubiKey 在该版本无法正常工作 | 升级设备 iOS 至 18.2.x 或更高版本（Apple 已在 18.2.x 中修复） | 🟢 8.5 | ADO Wiki |
| 40 📋 | macOS Chrome/Edge 使用 web native bridge 流程时报错 AADSTS50210: This web native bridge call resulted in... | 浏览器通过 native bridge 调用 broker 时，broker 返回 PERSISTENT_ERROR；最常见原因是 associated ... | 1) 检查并确保 associated domain 验证完整通过；2) 确认 SSO extension 正确配置；3) 若 SSO extension... | 🟢 8.5 | ADO Wiki |
| ... | *52 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **macos** related issues (10 entries) `[ado-wiki]`
2. Check **ios** related issues (7 entries) `[ado-wiki]`
3. Check **psso** related issues (4 entries) `[ado-wiki]`
4. Check **platform-sso** related issues (3 entries) `[ado-wiki]`
5. Check **sso-extension** related issues (3 entries) `[ado-wiki]`
6. Check **pkeyauth** related issues (2 entries) `[ado-wiki]`
7. Check **intune** related issues (2 entries) `[onenote]`
8. Check **mam** related issues (2 entries) `[onenote]`
