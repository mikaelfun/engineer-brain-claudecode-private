# ENTRA-ID Mobile Platform Auth (iOS/macOS/Android) — Detailed Troubleshooting Guide

**Entries**: 92 | **Drafts fused**: 21 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-asp-auth-middleware-scenarios.md, ado-wiki-a-macos-oneauth-log-collection.md, ado-wiki-a-macos-workplacejoin-troubleshooting.md, ado-wiki-a-security-copilot-supported-scenarios.md, ado-wiki-b-common-lockout-scenarios.md, ado-wiki-c-Shared-Device-Mode-Android-iOS.md, ado-wiki-c-gdap-scenarios-troubleshooting.md, ado-wiki-c-gdap-troubleshooting-common-scenarios.md, ado-wiki-d-browser-traces-android.md, ado-wiki-d-ca-bootstrap-scenarios.md
**Generated**: 2026-04-07

---

## Phase 1: Macos
> 18 related entries

### macOS Platform SSO: Device Auth Challenge fails - UI prompt asking to register device OR unexpected error during PSSO enrollment. Customer uses SSL...
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: With 3rd party MDM registration, PRT is deviceless. Device Auth challenge falls back to PkeyAuth protocol which requires 'x-ms-PkeyAuth+' header. Firewall/proxy apps (e.g. Zscaler) invalidate or remove this header from the request, blocking the PkeyAuth handshake.

**Solution**: 1. Verify by collecting customer network trace - check if x-ms-PkeyAuth+ header appears in the /token call. If missing, the request is being modified before reaching the server. 2. Ask customer to configure their firewall/proxy to not remove or modify the x-ms-PkeyAuth+ header.

---

### macOS 26 Platform SSO: unable to get past login screen with non-admin accounts, warning dialog with no message appears during login when Authentica...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Authenticated Guest Mode (new macOS 26 feature) has not been validated or supported by Microsoft Entra ID. Apple-side configuration issue.

**Solution**: Do not use Authenticated Guest Mode with Microsoft Entra ID. No timeline for support. Wait for official validation from Microsoft before deploying.

---

### macOS Platform SSO: accessing Azure Files Storage via smb:// command fails with cloud Kerberos TGT
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: IdentifierURIs in app manifest file (Entra portal app registration) for AFS maps CIFS with uppercase (CIFS/filesharename), but Apple requires lowercase (cifs/$filesharename)

**Solution**: Change the IdentifierURIs mapping in app manifest to use lowercase: cifs/$filesharename instead of CIFS/filesharename. This fixes smb:// file share access with cloud Kerberos.

---

### macOS Platform SSO Kerberos not working - TGTs not issued or Kerberos Extension not functioning
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Kerberos MDM configuration mismatch or Apple-side Kerberos Extension issue. Only TGT issuing is owned by Microsoft; everything else managed by Apple.

**Solution**: 1) Run 'app-sso platform -s' to verify TGTs issued (check tgt_ad and tgt_cloud importSuccessful: true) 2) Verify MDM config matches MS docs sample 3) If TGTs issued but still failing → direct customer to open ticket with Apple. Key MDM settings: usePlatformSSOTGT=true, allowPlatformSSOAuthFallback=true.

---

### Chrome/Edge AADSTS50210 error on macOS when browser tries web native bridge flow to call broker
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Broker returns PERSISTENT_ERROR for native bridge call, usually caused by associated domain validation failure or SSO extension not properly configured

**Solution**: 1) Verify associated domain validation is correct and fully passes. 2) Verify SSO extension is properly configured and available on device. 3) If SSO extension intentionally disabled, also disable/remove Microsoft Single Sign-On Chrome extension.

---

### macOS Platform SSO: password sync fails with 'window shake' error during Entra ID credential enrollment. Per-User MFA is enabled on the account (no...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Per-User MFA blocks the Platform SSO password synchronization process during enrollment. This does not occur when MFA is enforced through Conditional Access.

**Solution**: Administrators should switch from Per-User MFA to Conditional Access MFA, which suppresses MFA during PSSO enrollment so password synchronization can complete successfully.

---

### macOS SSO extension: non-MSAL 3rd party app fails SSO login, blocked by CA policy due to device auth failure. SSO works for MS 1st party native app...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The 3rd party app's bundle ID is not in the SSO extension AppAllowList, so the SSO extension does not provide PRT for it.

**Solution**: In Intune Device Configuration > Platform SSO policy > Edit profile > Add settings > Authentication > Extensible SSO > Extension Data: add key 'AppAllowList' with value set to the app's bundle ID (e.g. 'com.contoso.workapp'), or use 'AppPrefixAllowList' with a prefix (e.g. 'com.contoso.').

---

### MacOS Intune enrollment fails with keychain error -25244 (errSecInvalidOwnerEdit) when registering device via Company Portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: WPJ keychain items created by one MS app lack com.microsoft general access in ACL, preventing other MS apps from updating them

**Solution**: Update WPJ client library to >= 3.3.3 which adds com.microsoft general access to ACL for all WPJ keychain items during WPJ Join. Previously required manual cleanup of WPJ keychain objects in login keychain.

---

### MacOS device authentication fails silently; third-party security tools (McAfee, Charles, JAMF-managed) block PkeyAuth or client TLS challenge
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Third-party security tools intercept or block device authentication network flows, preventing PkeyAuth or client TLS challenge from completing

**Solution**: Temporarily disable third-party security tools (McAfee, Charles proxy, etc.) while performing device authentication. For JAMF-managed devices, check if security tools are blocking cert-based auth. Use Wireshark instead of Charles for network traces as Charles interferes with client TLS.

---

### Unable to get past login screen on macOS 26 with Authenticated Guest Mode; warning dialog appears during login with no message displayed when using...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Authenticated Guest Mode introduced in macOS 26 has not been validated or supported by Microsoft Entra ID. Feature is Apple-side and Microsoft has not tested it.

**Solution**: Do not use Authenticated Guest Mode with Microsoft Entra ID at this time. No timeline for official support. Customers must wait for Microsoft validation before deploying in production or test environments.

---

## Phase 2: Ios
> 15 related entries

### iOS/macOS SSO-Extension fails with error 1001 SubStatus 6008 - associated domain validation failure, apps cannot use SSO
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Associated domain verification fails because HTTPS interception (proxy/firewall) blocks Apple CDN domains used for domain validation

**Solution**: Exclude these hosts from HTTPS interception: app-site-association.cdn-apple.com and app-site-association.networking.apple. Verify with MS Learn troubleshooting guide for SSO extension networking.

---

### High frequency authentication prompts on iOS - users prompted repeatedly with MAM policy AuthenticationEnabled=true and AAD Sign-In Frequency CA po...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MAM inactivity policy (AuthenticationEnabled=true) and AAD SIF CA policy are independent and not aware of each other; both trigger separate prompts when conditions are met simultaneously

**Solution**: Remove one of the two policies. Preferably keep the AAD SIF CA policy (more secure) and remove the MAM inactivity policy (AuthenticationEnabled=true in Intune app protection).

---

### iOS unmanaged broker: user gets 'unknown error' in M365 app (e.g. Outlook) after completing 3rd party MFA (e.g. Duo) - user returns to calling app ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When using unmanaged broker flow on iOS with app flip to Authenticator, user must complete the full auth flow in Authenticator before returning to the calling app. If user opens the calling app directly after approving MFA in another app (e.g. Duo), the auth flow breaks.

**Solution**: Instruct user to return to the Microsoft Authenticator app after approving MFA in the 3rd party app (e.g. Duo). Authenticator will automatically redirect back to the calling app once authentication completes.

---

### iOS/macOS SSO extension Browser SSO mode: user not experiencing SSO despite being signed in Authenticator and MDM profile with SSO-Extension enable...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PRT-Recovery in Browser SSO mode is not supported when customer has deployed CA Authentication Strength policy. Technical limitation prevents upgrading PRT with Authentication Strength claims in Browser SSO mode.

**Solution**: 1. Verify if Authentication Strength CA policy is enabled. 2. If enabled, PRT-Recovery cannot work in Browser SSO flow. Customer must use native MSAL library apps to call SSO-Extension directly (operation API mode) instead of relying on Browser SSO. 3. Alternative: remove Authentication Strength requirement from the CA policy if browser SSO is critical.

---

### iOS device with multiple tenant registrations: when removing and re-registering a user or adding a new user while 2+ users are registered, other ex...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in WPJ registration handling on iOS when multiple tenant registrations exist. Adding/removing a registration corrupts other registrations' format identifiers, changing 'Default' format to 'invalid'.

**Solution**: 1. Hotfix rolled out in WPJ version 3.6.1 and Authenticator version 6.8.23. 2. Affected users need to re-register the other accounts manually until Authenticator no longer shows the sign-in error. 3. Check Authenticator logs for: 'Found a registration using Default format for tenant <uid>' replaced with 'Found an invalid registration format Default with tenantId - <uid>'.

---

### iOS/macOS SSO Extension: frequent/unexpected MFA prompts. Sign-in logs show AADSTS700007 'grant issued for different client id' or AADSTS500139/AAD...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Token service implementation did not account for MFA + Sign-in Frequency CA policies used together, causing PRT validation failures and repeated MFA prompts.

**Solution**: [Resolved] Fix deployed in Company Portal for macOS and MS Authenticator for iOS. Workarounds before fix: 1) Exclude affected user from MFA or SIF policy temporarily. 2) Add com.apple.safari to AppBlockList to disable browser SSO (only for Safari-specific issues). Reference ICMs: 592994990, 577735953, 574972652.

---

### iOS unmanaged broker (app flip) 场景：用户在第三方 MFA app（如 Duo）完成审批后直接打开 Outlook 等目标应用，导致显示 unknown error
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Auth 流程需在 Authenticator 中闭环：Duo 批准后需手动返回 Authenticator，由 Authenticator 完成流程后自动回跳目标应用

**Solution**: 引导用户：第三方 MFA 批准后先返回 Microsoft Authenticator app，等待 Authenticator 自动回跳到 Outlook 等目标应用，不能直接打开目标应用

---

### iOS 18.1.x 设备使用 NFC YubiKey 认证时，顶部通知提示检测到 YubiKey 并要求打开 Safari，但无密码输入弹窗，用户无法完成认证
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: iOS 18.1.x 已知 bug（Yubico 报告）：NFC YubiKey 在该版本无法正常工作

**Solution**: 升级设备 iOS 至 18.2.x 或更高版本（Apple 已在 18.2.x 中修复）

---

### iOS 用户频繁收到交互式登录提示；Broker 日志大量 prompt=login + MAM resource 请求；MAM 日志 AuthenticationEnabled=true
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Intune MAM 非活动超时策略（AuthenticationEnabled=true）与 AAD Sign-In Frequency CA 策略互不感知，同时触发时在同一会话产生两次独立登录提示

**Solution**: 移除其中一个策略；建议保留 AAD SIF CA 策略，移除 MAM 的 AuthenticationEnabled=true 非活动策略

---

### iOS/macOS SSO extension 无法启动，OneAuth 报错 1001/1000/1003，sub status 6008，日志出现 'Sso Extension is returning unexpected error'
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Apple framework 在调用 SSO extension 前执行 associated domain 验证失败（App 请求 → Apple 验证 associated domain → 失败 → 未到达 SSO extension）

**Solution**: 检查并修复 associated domain 配置，确保验证完整通过；参考 SSO extension troubleshooting 文档检查网络设置和 associated domain 配置

---

## Phase 3: Oneauth
> 15 related entries

### Teams iOS unable to sign in after tenant migration - old tenant data in keychain
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: Company Portal account deletion insufficient to clear iOS keychain. Old tenant data persists.

**Solution**: Sign out from app + Authenticator + Company Portal. Open Edge, edge://signin-internals, RemoveAllAccounts. Sign in again.

---

### Android Edge CA does not prompt to register device, tag 5sr96 (interaction required from broker)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Tag 5sr96 = interaction required from Android broker due to CA policy. Logsminer shows UserStrongAuthClientAuthNRequired.

**Solution**: Review customer CA policy. Interaction required is caused by CA policy requiring strong auth.

---

### Invalid account (2201) errors in Edge on Android Shared Device Mode (SDM) using SSO
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Under SDM, Edge SignInSilently fails with InteractionRequired when account is in interrupt state. Teams resolves interrupt first.

**Solution**: Upgrade to OneAuth 6.2.1 with partial success status for SignIn* methods.

---

### Teams cannot sign-in on macOS due to corrupted keychain error -25308 (OSQuery bug)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in OSQuery (github.com/osquery/osquery/issues/7780) corrupts Local Items keychain. MS Defender may trigger this.

**Solution**: Quit all M365 apps. Go to ~/Library/Keychains. Delete folders with long alphanumeric names (keep .db files). Restart Mac.

---

### Unable to sign back in after signing out on MacOS, tag 6p73z (Account previously signed out)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Dual-headed account (UPN mapped to both AAD and MSA). Keychain entries prevent re-authentication.

**Solution**: Delete keychain entries: search tenant ID GUID + MSA Tenant GUID 4c5b-b112-36a304b66dad in Keychain Access, delete all, restart Mac. WARNING: removes sign-in state from all MSFT apps.

---

### User asked for password on MacOS despite SSO Extension being available and configured
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known OneAuth-MSAL feature gap. SignInSilently only works on Windows/iOS-SDM/Android-SDM. OneAuth sends prompt=login blocking SSO Extension.

**Solution**: Expected behavior until fix ships (Q2/Q3 CY25). After fix, SignInSilently should work on MacOS with SSO Extension.

---

### Multiple login prompts on iOS with keychain error -25308, tag 4ut12
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device keychain corrupted. Keychain save fails with status -25308.

**Solution**: Collect sys.diagnose dump. Route to msal-objC (Apple) team for investigation.

---

### iOS MAM integration causing multiple credential prompts during MFA
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MAM/Authenticator app integration issue causing duplicate auth prompts.

**Solution**: Update Authenticator to latest version. Collect broker logs if persists.

---

### AADSTS50020 on iOS Office apps after tenant migration - account from old tenant
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: After tenant migration, auth library still requests from previous tenant. Known issue, fix tracked no ETA.

**Solution**: Clear cache: uninstall affected apps, Edge edge://signin-internals removeAllAccounts, remove/re-add accounts in Authenticator, reinstall apps.

---

### Edge iOS cannot permanently clear accounts with "sign out and forget"
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: On iOS, only Authenticator app has permission to permanently remove accounts. Non-broker apps cannot.

**Solution**: Sign into Authenticator with the account, then remove it in Authenticator.

---

## Phase 4: Msal
> 6 related entries

### iOS/macOS app using MSAL Obj-C throws MSALErrorDomain Code=-51118. Token acquisition fails with no clear error message.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Redirect URI misconfiguration: msauth.BUNDLE_ID://auth not properly set in MSAL config, app registration, or info.plist. Missing CFBundleURLSchemes or LSApplicationQueriesSchemes entries.

**Solution**: Verify redirect URI format is msauth.BUNDLE_ID://auth and registered on app registration. Ensure info.plist has msauth.{package_name} under CFBundleURLSchemes and msauthv2/msauthv3 under LSApplicationQueriesSchemes.

---

### MSAL iOS/macOS app gets error "No cached preferred_network for authority" when authenticating with Azure AD B2C.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: B2C authority URL does not include the tfp (trust framework policy) path segment required by MSAL for proper authority validation and caching.

**Solution**: Include tfp in the B2C authority URL: https://b2cdomain.b2clogin.com/tfp/b2cdomain.onmicrosoft.com/b2c_1_policy

---

### MSAL iOS/macOS app returns "Authority validation is not supported for this type of authority" error when using Azure AD B2C authority.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: B2C login domain (e.g. b2cdomain.b2clogin.com) is not added to MSAL knownAuthorities configuration, so instance discovery validation rejects it.

**Solution**: Add the B2C login domain to MSAL knownAuthorities. See https://learn.microsoft.com/en-us/entra/identity-platform/config-authority#change-the-default-authority

---

### Xcode compile error "no visible @interface for {DataType} declares the selector {DataField}" (e.g. NSData msidAES128DecryptedDataWithKey) when buil...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Category name collision between MSAL internal categories (e.g. NSData+AES.h) and other frameworks in the project that use the same category names.

**Solution**: Fork MSAL Obj-C repo and rename the conflicting category file (e.g. NSData+AES.h to NSData+msidAES.h). Update all internal imports referencing the old name. Consume MSAL manually via submodules.

---

### iOS app using MSAL gets keychain errors: "cannot_access_publisher_keychain" or "Failed to delete broker key with error: -34018". App cannot acquire...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Keychain sharing not properly configured in Xcode entitlements, or keychain group name mismatch between MSAL config and entitlements file.

**Solution**: Enable Keychain sharing in Xcode entitlements with group "com.microsoft.adalcache". Verify MSAL uses the same keychain group via WithIosKeychainSecurityGroup(). Ensure Custom Entitlements path is set in Bundle Signing. Try: restart device, rebuild, remove/reinstall app, delete iCloud app data.

---

### iOS app using MSAL SDK repeatedly prompts user to sign in after initial login — SSO not working between app and Safari
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Custom browser configuration (SFAuthenticationSession/SFSafariViewController/WKWebView) does not share cookies with system browser, breaking SSO state sharing

**Solution**: Use ASWebAuthenticationSession (recommended for iOS 12+, required for iOS 13+) which shares cookies with Safari system browser. If using WKWebView, SSO is limited to within the app only. Avoid mixing browser types.

---

## Phase 5: Passwordless
> 4 related entries

### After accepting Terms of Use (ToU) Conditional Access policy, PSI sign-in fails on iPhone with error 'Something went wrong. Please try again later'...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Known bug with ToU Conditional Access Policies and PSI interaction on iOS (tracked in Bug 628199).

**Solution**: Fixed in Bug 628199. Update Microsoft Authenticator app to the latest version.

---

### Users with multiple passwordless accounts on one Android device intermittently fail to receive PSI authentication notifications.
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Company Portal app installed on the device takes over as broker instead of Authenticator app. Multi-account PSI requires updated broker library protocol that Company Portal has not yet onboarded to. Check Authenticator logs for 'isAuthenticatorBroker: false' to confirm.

**Solution**: Uninstall Company Portal to ensure Authenticator app is used as broker. This conflict is resolved at GA when Company Portal onboards the new broker library. On Android 6.2404.2872+, multiple PSI accounts are supported.

---

### After accepting ToU CA policy, PSI fails on iPhone with Something went wrong at PIN/biometric step after correct number match.
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Known bug with ToU CA Policies and PSI on iOS (Bug 628199).

**Solution**: Fixed in Bug 628199. Update Authenticator to latest version.

---

### Multiple PSI accounts on one Android device intermittently fail to receive notifications.
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Company Portal takes over as broker instead of Authenticator. Multi-account PSI needs updated broker library. Check logs: isAuthenticatorBroker: false.

**Solution**: Uninstall Company Portal to ensure Authenticator is broker. Fixed at GA. Android 6.2404.2872+ supports multi-account.

---

## Phase 6: Adfs
> 3 related entries

### ADFS integration with RSA Authentication Agent (custom MFA provider) fails to start secondary auth process for iOS and Mac OS platform. Error: No s...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: System locale mismatch between ADFS service account and the third-party MFA agent. ADFS service using EN-GB locale while RSA agent configured for EN-US only. iOS/Mac detect locale from server while Windows may handle it differently.

**Solution**: Align system locale: 1) Verify ADFS service account. 2) Get SID: Get-ADUser -Identity service_account | select SID. 3) Configure the ADFS service account to use the same system locale as the RSA Authentication Agent by modifying user profile registry entries.

---

### User resets password containing apostrophe, double quotes, or double hyphens. Password works on Windows/Web/Android/iPad but fails on iOS (iPhone)....
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: iOS Smart Punctuation feature (since iOS 11) converts: vertical apostrophe (U+0027) to left/right quotation marks (U+2018/U+2019), double hyphens (--) to em dash, and straight double quotes to curly quotes. iPadOS keyboard handles differently explaining iPad success. The altered characters result in a different password being sent to the authentication service.

**Solution**: Option 1: Long-press apostrophe key on iOS and select vertical apostrophe (rightmost). Option 2: Disable iOS Smart Punctuation: Settings > General > Keyboards > toggle Smart Punctuation off. Option 3 (server-side): Add spellcheck=false to ADFS password field via onload.js web theme customization: var pwdf=document.getElementById("passwordInput"); if(pwdf){pwdf.spellcheck=false}.

---

### Android device (Samsung S23) sign-in fails with error 50126 (invalid username or password) across all apps (Outlook, Samsung email, 1st and 3rd par...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Default Samsung keyboard alters special characters in password input similarly to iOS Smart Punctuation sending incorrect character codes to the authentication service.

**Solution**: Change default Samsung keyboard to Gboard keyboard. Debug via Chrome remote debugging: enable Developer Options on Android, enable USB Debugging, connect via USB, use chrome://inspect/#devices on Windows to trace the mobile browser session.

---

## Phase 7: Android
> 3 related entries

### Android broker network errors: device_network_not_available, device_network_not_available_doze_mode, or io_error in broker logs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Unreliable network connectivity, firewall/proxy blocking broker requests, or battery/power optimizations (doze mode) interfering with network access

**Solution**: 1) Check internet connection stability 2) Disable firewall/proxy blocking for broker endpoints 3) Turn off battery/power optimizations for Company Portal and Authenticator 4) Verify device can reach internet from system browser

---

### Device authentication fails in Android browsers after user changes device sign-in method (password to PIN or vice versa)
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: WPJ (browser access) certificate and its private key become inaccessible after changing device sign-in method

**Solution**: Re-register the device or reinstall the browser access certificate from Authenticator/Company Portal settings (Enable Browser Access).

---

### Unnecessary credential prompts on Android after company updates UPN suffix, SSO not working
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Email/UPN mismatch causes broker to skip using PRT, falling back to interactive authentication

**Solution**: Ensure UPN is consistent between on-premises AD and Azure AD. After UPN change, user may need to re-register device and re-sign into broker app.

---

## Phase 8: Msal Js
> 2 related entries

### AADSTS50210 error during MSAL.js native broker bridge authentication on MacOS: "This web native bridge call resulted in a non-retriable error from ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Browser called native broker (Company Portal) but broker returned PERSISTENT_ERROR. Most commonly caused by failed associated domain validation or SSO extension misconfiguration on MacOS.

**Solution**: Review associated domain validation (section 3.1.1 of iOS/macOS broker TSG). Ensure SSO extension is configured. If SSO ext disabled, also remove Microsoft Single Sign-On Chrome extension. Company Portal 2603+ returns DISABLED status when SSO ext unavailable.

---

### AADSTS9002325 during MSAL.js native broker bridge on MacOS/iOS: "Proof Key for Code Exchange is required for cross-origin authorization code redemp...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: On Windows, PKCE bypassed for tb-env header requests. On MacOS/iOS the equivalent purpose=broker JWT claim is not recognized by ESTS.

**Solution**: Retry the request. Known platform limitation tracked by engineering team.

---

## Phase 9: Alternate Login Id
> 2 related entries

### OneDrive on iOS fails to sign user in with email as alternate ID when not prompted with MFA. Authentication succeeds but OneDrive app fails.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in OneDrive iOS app handling of alternate login ID tokens when MFA prompt is not triggered.

**Solution**: Prompt user for MFA or have the Microsoft Authenticator app installed and the user identity enrolled in the app.

---

### OneDrive on iOS fails to sign in user with email alternate ID when MFA is not prompted; shows permission error after successful authentication
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: OneDrive iOS app does not properly handle email alternate login ID authorization flow when MFA prompt is absent

**Solution**: Prompt user for MFA or have the Microsoft Authenticator App installed with the user identity enrolled in the app

---

## Phase 10: Global Secure Access
> 2 related entries

### Global Secure Access tile does not appear in the Microsoft Defender for Endpoint iOS app after onboarding the tenant to Global Secure Access
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Defender for Endpoint app may not refresh its UI to show the GSA tile immediately after onboarding is completed.

**Solution**: Force stop the Microsoft Defender for Endpoint app and relaunch it. The GSA tile should then appear on the Defender dashboard.

---

### Access to Private Access application shows a connection time-out error on iOS after a successful interactive sign-in via Global Secure Access
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: The initial connection may not fully establish after the first interactive sign-in, causing a transient timeout on the Private Access tunnel.

**Solution**: Reload the application or refresh the web browser. The connection should establish successfully on the second attempt.

---

## Phase 11: Dual Federation
> 1 related entries

### In dual-federation environment with same UPN in both public and 21v clouds, iOS users get "Org Data Removal" prompt in Outlook/PowerApps, or auth f...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Intune SDK for iOS changed device primary user determination from UPN to OID (since 2022/05/25). In dual-fed environments with same UPN across clouds, the SDK cannot correctly distinguish users, causing MAM policy conflicts and data removal prompts.

**Solution**: Short-term: (1) Use Edge web apps instead of native PowerApps app. (2) Use Teams add-in apps for PowerApps. (3) PG publishes private version under different publisher. Long-term: (1) Use cross-cloud B2B (different UPN for 21v). (2) Change UPN in one cloud by modifying ADFS config + AAD Connect sync rules + on-prem AD attributes. (3) Wait for Intune MAM "Multiple Managed Account" feature.

---

## Phase 12: Outlook Mobile
> 1 related entries

### Newer Android devices cannot login Outlook when Intune Company Portal installed. White screen after entering username. Works if Company Portal unin...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: With Intune, Outlook uses Company Portal broker via WebView for SSO. ADFS server/NLB only returns leaf SSL certificate without intermediate certificates. Android WebView cannot auto-complete certificate chains unlike Chrome/Edge, causing SSL_UNTRUSTED error. Newer Android versions enforce stricter SSL chain validation.

**Solution**: Configure ADFS server or front-end NLB to return full certificate chain including intermediate certificates. Verify with: openssl s_client -connect adfs.domain.com:443 -showcerts

---

## Phase 13: Proxy
> 1 related entries

### x-ms-PKeyAuth+ header blocked by network proxy causing authentication failure - NSURLErrorDomain Code=-1005 network connection lost immediately aft...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Network proxy blocks HTTP requests containing '+' character in headers, specifically the x-ms-PKeyAuth+ header required for device authentication protocol negotiation

**Solution**: Ask customer to configure proxy to allow x-ms-PKeyAuth+ header ('+' is a valid character for HTTP headers). Alternative: check if ADFS server is also blocking the header.

---

## Phase 14: Macos15
> 1 related entries

### macOS 15+ Platform SSO: frequent re-registration prompts. Sysdiagnose logs show 'Error deserializing device config' with 'Garbage at end around lin...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Apple concurrency bug: AppSSOAgent and AppSSODaemon both update PSSO device config file simultaneously, corrupting it. This invalidates device registration and triggers re-registration. Apple feedback ticket: https://feedbackassistant.apple.com/feedback/15904041

**Solution**: Ask customer to file an Apple Care ticket and engage with Apple to resolve the issue. This is an Apple-side concurrency bug. No client-side workaround available.

---

## Phase 15: Windows 365
> 1 related entries

### RDP sign-in to Windows 365 AADJ Cloud PC fails when connecting from Windows desktop client (msrdc.exe), PKU2U authentication error
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Local device is not AADJ/HAADJ/Registered in the same tenant as the Cloud PC, or PKU2U protocol is disabled by Security Baseline group policy

**Solution**: Ensure local device is Azure AD Joined, Hybrid Azure AD Joined, or Registered in same tenant as Cloud PC. If Security Baseline policies are deployed to Cloud PCs, re-enable PKU2U protocol in group policy. Alternative: use web client, Android, macOS, or iOS client which support username/password without local device state requirement.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | macOS Platform SSO: Device Auth Challenge fails - UI prompt asking to registe... | With 3rd party MDM registration, PRT is deviceless. Devic... | 1. Verify by collecting customer network trace - check if... | 🟢 9.5 | ADO Wiki |
| 2 | Teams iOS unable to sign in after tenant migration - old tenant data in keychain | Company Portal account deletion insufficient to clear iOS... | Sign out from app + Authenticator + Company Portal. Open ... | 🟢 9.5 | ADO Wiki |
| 3 | ADFS integration with RSA Authentication Agent (custom MFA provider) fails to... | System locale mismatch between ADFS service account and t... | Align system locale: 1) Verify ADFS service account. 2) G... | 🟢 9.0 | OneNote |
| 4 | In dual-federation environment with same UPN in both public and 21v clouds, i... | Intune SDK for iOS changed device primary user determinat... | Short-term: (1) Use Edge web apps instead of native Power... | 🟢 9.0 | OneNote |
| 5 | Newer Android devices cannot login Outlook when Intune Company Portal install... | With Intune, Outlook uses Company Portal broker via WebVi... | Configure ADFS server or front-end NLB to return full cer... | 🟢 9.0 | OneNote |
| 6 | Android broker network errors: device_network_not_available, device_network_n... | Unreliable network connectivity, firewall/proxy blocking ... | 1) Check internet connection stability 2) Disable firewal... | 🟢 8.5 | ADO Wiki |
| 7 | macOS 26 Platform SSO: unable to get past login screen with non-admin account... | Authenticated Guest Mode (new macOS 26 feature) has not b... | Do not use Authenticated Guest Mode with Microsoft Entra ... | 🟢 8.5 | ADO Wiki |
| 8 | macOS Platform SSO: accessing Azure Files Storage via smb:// command fails wi... | IdentifierURIs in app manifest file (Entra portal app reg... | Change the IdentifierURIs mapping in app manifest to use ... | 🟢 8.5 | ADO Wiki |
| 9 | macOS Platform SSO Kerberos not working - TGTs not issued or Kerberos Extensi... | Kerberos MDM configuration mismatch or Apple-side Kerbero... | 1) Run 'app-sso platform -s' to verify TGTs issued (check... | 🟢 8.5 | ADO Wiki |
| 10 | iOS/macOS SSO-Extension fails with error 1001 SubStatus 6008 - associated dom... | Associated domain verification fails because HTTPS interc... | Exclude these hosts from HTTPS interception: app-site-ass... | 🟢 8.5 | ADO Wiki |
| 11 | High frequency authentication prompts on iOS - users prompted repeatedly with... | MAM inactivity policy (AuthenticationEnabled=true) and AA... | Remove one of the two policies. Preferably keep the AAD S... | 🟢 8.5 | ADO Wiki |
| 12 | Chrome/Edge AADSTS50210 error on macOS when browser tries web native bridge f... | Broker returns PERSISTENT_ERROR for native bridge call, u... | 1) Verify associated domain validation is correct and ful... | 🟢 8.5 | ADO Wiki |
| 13 | x-ms-PKeyAuth+ header blocked by network proxy causing authentication failure... | Network proxy blocks HTTP requests containing '+' charact... | Ask customer to configure proxy to allow x-ms-PKeyAuth+ h... | 🟢 8.5 | ADO Wiki |
| 14 | iOS unmanaged broker: user gets 'unknown error' in M365 app (e.g. Outlook) af... | When using unmanaged broker flow on iOS with app flip to ... | Instruct user to return to the Microsoft Authenticator ap... | 🟢 8.5 | ADO Wiki |
| 15 | iOS/macOS SSO extension Browser SSO mode: user not experiencing SSO despite b... | PRT-Recovery in Browser SSO mode is not supported when cu... | 1. Verify if Authentication Strength CA policy is enabled... | 🟢 8.5 | ADO Wiki |
| 16 | iOS device with multiple tenant registrations: when removing and re-registeri... | Bug in WPJ registration handling on iOS when multiple ten... | 1. Hotfix rolled out in WPJ version 3.6.1 and Authenticat... | 🟢 8.5 | ADO Wiki |
| 17 | macOS Platform SSO: password sync fails with 'window shake' error during Entr... | Per-User MFA blocks the Platform SSO password synchroniza... | Administrators should switch from Per-User MFA to Conditi... | 🟢 8.5 | ADO Wiki |
| 18 | macOS SSO extension: non-MSAL 3rd party app fails SSO login, blocked by CA po... | The 3rd party app's bundle ID is not in the SSO extension... | In Intune Device Configuration > Platform SSO policy > Ed... | 🟢 8.5 | ADO Wiki |
| 19 | macOS 15+ Platform SSO: frequent re-registration prompts. Sysdiagnose logs sh... | Apple concurrency bug: AppSSOAgent and AppSSODaemon both ... | Ask customer to file an Apple Care ticket and engage with... | 🟢 8.5 | ADO Wiki |
| 20 | iOS/macOS SSO Extension: frequent/unexpected MFA prompts. Sign-in logs show A... | Token service implementation did not account for MFA + Si... | [Resolved] Fix deployed in Company Portal for macOS and M... | 🟢 8.5 | ADO Wiki |
| 21 | MacOS Intune enrollment fails with keychain error -25244 (errSecInvalidOwnerE... | WPJ keychain items created by one MS app lack com.microso... | Update WPJ client library to >= 3.3.3 which adds com.micr... | 🟢 8.5 | ADO Wiki |
| 22 | MacOS device authentication fails silently; third-party security tools (McAfe... | Third-party security tools intercept or block device auth... | Temporarily disable third-party security tools (McAfee, C... | 🟢 8.5 | ADO Wiki |
| 23 | Shared Device Mode (SDM) app authentication failure on Android/iOS - need to ... | SDM authentication issues can be in the SDM framework (MS... | 1) Try another SDM-aware app to isolate: if only one app ... | 🟢 8.5 | ADO Wiki |
| 24 | CBA sign-in fails with AADSTS1001003: Unable To Acquire Value Specified In Bi... | User selected the wrong certificate from the certificate ... | Instruct user to swipe through the certificate list and s... | 🟢 8.5 | ADO Wiki |
| 25 | Android Edge CA does not prompt to register device, tag 5sr96 (interaction re... | Tag 5sr96 = interaction required from Android broker due ... | Review customer CA policy. Interaction required is caused... | 🟢 8.5 | ADO Wiki |
| 26 | Invalid account (2201) errors in Edge on Android Shared Device Mode (SDM) usi... | Under SDM, Edge SignInSilently fails with InteractionRequ... | Upgrade to OneAuth 6.2.1 with partial success status for ... | 🟢 8.5 | ADO Wiki |
| 27 | Teams cannot sign-in on macOS due to corrupted keychain error -25308 (OSQuery... | Bug in OSQuery (github.com/osquery/osquery/issues/7780) c... | Quit all M365 apps. Go to ~/Library/Keychains. Delete fol... | 🟢 8.5 | ADO Wiki |
| 28 | Unable to sign back in after signing out on MacOS, tag 6p73z (Account previou... | Dual-headed account (UPN mapped to both AAD and MSA). Key... | Delete keychain entries: search tenant ID GUID + MSA Tena... | 🟢 8.5 | ADO Wiki |
| 29 | User asked for password on MacOS despite SSO Extension being available and co... | Known OneAuth-MSAL feature gap. SignInSilently only works... | Expected behavior until fix ships (Q2/Q3 CY25). After fix... | 🟢 8.5 | ADO Wiki |
| 30 | Multiple login prompts on iOS with keychain error -25308, tag 4ut12 | Device keychain corrupted. Keychain save fails with statu... | Collect sys.diagnose dump. Route to msal-objC (Apple) tea... | 🟢 8.5 | ADO Wiki |
