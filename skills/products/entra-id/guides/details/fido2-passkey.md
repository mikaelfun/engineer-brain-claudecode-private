# ENTRA-ID FIDO2/Passkey Passwordless Auth — Detailed Troubleshooting Guide

**Entries**: 103 | **Drafts fused**: 30 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-fido2-android-brokered-apps.md, ado-wiki-a-fido2-android-data-collection.md, ado-wiki-a-fido2-data-collection.md, ado-wiki-a-fido2-how-it-works.md, ado-wiki-a-fido2-introduction.md, ado-wiki-a-fido2-lab-setup.md, ado-wiki-a-fido2-looking-at-logs.md, ado-wiki-a-fido2-passkey-profiles-entra-id.md, ado-wiki-a-ms-authenticator-passwordless-detailed.md, ado-wiki-a-querying-passwordless-credentials-graph.md
**Generated**: 2026-04-07

---

## Phase 1: Fido2
> 64 related entries

### FIDO2 security key registration on Apple (macOS/iOS) fails with error 'Something went wrong. You may want to try a different security key, or conta...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Apple does not support provisioning a new PIN on the FIDO2 device. If the security key has not been set up with a PIN on another platform, Apple cannot initialize it.

**Solution**: Have the user first configure the PIN on the FIDO2 security key using a Windows device, then return to the Apple device to complete registration.

---

### FIDO2 security key authentication via NFC fails on Android devices in both browser and native app scenarios
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Android does not currently support NFC for FIDO2 security keys. Only USB interface is supported on Android (Chrome and Edge only).

**Solution**: Use USB security keys on Android instead of NFC. NFC is only supported on iOS and Windows. For Android native apps, ensure Microsoft Authenticator (6.2405.3618+) or Intune Company Portal (5.0.6262.0+) is installed as broker, and device runs Android 14+.

---

### MySecurityInfo prompts user to register a Microsoft Authenticator passkey even when authentication strength policy explicitly excludes Microsoft Au...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UI/UX inconsistency in MySecurityInfo portal. The page does not filter out Microsoft Authenticator passkey option based on the authentication strength advanced options configuration. Policy enforcement is correct (registration fails), but the prompt is misleading.

**Solution**: Instruct user to select 'Security key' instead of Microsoft Authenticator passkey option when prompted on MySecurityInfo. The registration for a supported FIDO2/WebAuthn security key will succeed. Track Bug 3039303 for permanent fix.

---

### FIDO2 security key model details show as 'unknown or invalid' in Entra ID portal and Microsoft Graph API (listFido2AuthenticationMethod). The model...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The FIDO2 key vendor has not onboarded/registered the key's AAGUID with Entra ID. Entra ID uses an AAGUID-to-model mapping to display model names. Without the mapping, model info cannot be resolved.

**Solution**: This is a display-only limitation with no functional impact on authentication. If model visibility is required for inventory/compliance, contact the FIDO2 key vendor and request they onboard the AAGUID to Microsoft. Reference ICM341190948.

---

### On 'Add a passkey' page in MySecurityInfo, clicking 'Next' does nothing. No prompt to insert key, no PIN prompt, no progress. Occurs when CA policy...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Policy mismatch between Conditional Access authentication strength (no AAGUIDs specified = allow all) and Authentication methods policy (FIDO2 restricted by specific AAGUIDs). The intersection results in no effective eligible authenticator, producing a no-op Next button.

**Solution**: Create a custom authentication strength that explicitly lists the same AAGUIDs allowed in the Authentication methods policy. Ensure both policies are aligned. If Microsoft Authenticator passkeys are intended, enable that provider in the authentication strength. Retest after policy propagation.

---

### FIDO2 browser logon stops working on specific Windows device — PIN dialog never appears or times out. Same security key works on other machines. We...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Incomplete auto-install or auto-update of Citrix client (Workspace/Receiver) without admin elevation leaves USB redirection / security key components in a broken state. These components intercept or block CTAP traffic needed for WebAuthn, causing PIN prompt failures and timeouts.

**Solution**: If Citrix is not required, uninstall it and retest. If Citrix is required, perform an elevated repair/reinstall of the latest supported Citrix client with administrator privileges, then reboot. Alternatively, disable Citrix USB redirection feature via policy if not needed. Verify fix by checking WebAuthN logs for absence of 0x5B4 timeout errors.

---

### User signs in to Hybrid Join or Entra ID Join PC with Windows Hello for Business (WHfB/NGC), then accesses resource with CA policy requiring FIDO2 ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: KeyID claim conflict between the WHfB credential and the FIDO2 credential during Conditional Access token exchange. Current token handling logic does not reconcile both credentials in this scenario. Tracked by engineering work item 2167915.

**Solution**: Option 1: Instruct users to sign in to the PC using the FIDO2 key (instead of WHfB) when accessing resources that require FIDO2 authentication strength. Option 2: Modify the CA policy to allow WHfB in addition to FIDO2 in the authentication strength configuration. Track fix via ADO work item 2167915.

---

### FIDO2 security keys appear as 'Disabled' on My Security Info page (aka.ms/mysecurityinfo) under Security info section. Keys continue to work for si...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UI rendering bug in the MySecurityInfo portal incorrectly marks FIDO2 keys as Disabled. The underlying authentication method remains active in Entra ID. Tracked by Incident 627758907.

**Solution**: No action required. Inform users the 'Disabled' label is a visual bug only. Do not delete or re-register keys unless there is an actual sign-in failure. Verify key is shown as Enabled in Entra ID Authentication methods admin view. Track fix via ICM 627758907.

---

### Tenant with Passkey Profiles enabled sees 'Windows Hello (preview)' option when editing a passkey profile in Entra portal, suggesting Entra Passkey...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UI prematurely exposed the Windows Hello (Entra Passkeys on Windows) option in the passkey profile editor before the feature reached public preview. PG confirmed fix to remove this option from UI.

**Solution**: Inform customer the Windows Hello (Entra Passkeys on Windows) feature is not yet available despite the UI option. PG fix to remove this option was in deployment with ETA end of Jan 30 2026.

---

### FIDO2 security key interactive logon fails with message 'This security key doesn't look familiar. Please try a different one'. WebAuthN event log s...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The security key does not have credentials registered for the relying party (login.microsoft.com). This occurs when the key was never enrolled for the user/tenant, was reset, or the credentials were deleted. The 0x2E CTAP2 error means no valid credentials found on the key for the requested RP.

**Solution**: Re-register the FIDO2 security key at aka.ms/mysecurityinfo. If key was previously working, check if it was reset (which erases all credentials). Verify the key is enrolled for the correct user/tenant. Check WebAuthN event log Event ID 2225 for the CTAP response details.

---

## Phase 2: Passkey
> 19 related entries

### Android 设备点击 'face, fingerprint, PIN or security key' 后页面停滞/超时，底部出现 'sign in another way' 小对话框；Broker 日志出现 'User canceled the request' 取消异常
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: 设备上找不到与账户匹配的 passkey（work profile 用户常见）；Credential Manager 将对话框超时或关闭注册为用户主动取消

**Solution**: 1) 点击底部小对话框展开，选择安全密钥/跨设备选项；2) 确认 Authenticator 已保存 passkey（work profile 需在工作配置的 Authenticator 中分别保存）；3) 重启设备；4) 最终方案：重新注册 passkey

---

### Android 设备无法使用 NFC YubiKey 进行 passkey 认证
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Android Credential Manager API 平台限制：仅支持 USB 连接方式，不支持 NFC，且短期内无添加计划

**Solution**: 通知客户仅支持 USB 连接方式使用 YubiKey；NFC 为已知平台限制

---

### Passkey (for Windows) not listed as registration option in Security Info Add sign-in method dropdown
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows Hello AAGUIDs not added to Passkey (FIDO2) authentication method policy

**Solution**: Add Windows Hello AAGUIDs to FIDO2 policy: 08987058 (hardware TPM), 9ddd1817 (VBS), 6028b017 (software TPM)

---

### Samsung Android 设备使用 YubiKey 进行 passkey 认证时，CredMan 返回取消错误（用户未主动取消），passkey 页面跳回认证选项
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Samsung 设备已知问题：安全密钥连接对话框期间若检测到带有 YubiOTP 启用的 YubiKey 插入，CredMan 错误返回取消；正由 YubiCo 和 Samsung 联合调查

**Solution**: 临时方案：在 YubiKey 上禁用 YubiOTP；长期方案：等待 YubiCo/Samsung 官方修复

---

### Passkey authentication fails on iOS17/iOS18 devices restored from iCloud backup; user sees passkey in Authenticator but auth fails
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Device-bound passkey key material is not synced via iCloud (by design). After restore, passkey appears but private key is missing

**Solution**: Delete and re-add passkey on new device. Fix deployed Oct 28 2024: opening Authenticator auto-removes incorrectly restored passkeys

---

### Passkey in Microsoft Authenticator not listed as registration option in Security Info dropdown
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft Authenticator AAGUIDs not added to Passkey (FIDO2) authentication method policy

**Solution**: Add Authenticator AAGUIDs: 90a3ccdf-635c-4729-a248-9b709135078f (iOS), de1e552d-db1d-4423-a619-566b625cdc84 (Android)

---

### Passkey authentication fails with 'Your company policy requires a different method'; sign-in error code 135016 'FIDO sign-in is disabled via policy'
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: AAGUID for user's version of Microsoft Authenticator no longer listed in Passkey (FIDO2) authentication method policy

**Solution**: Add correct AAGUID for user's Authenticator to FIDO2 policy: iOS=90a3ccdf, Android=de1e552d

---

### 'There are no matching passkeys saved in Authenticator for login.microsoft.com' during passkey auth; authenticationMethod=null in sign-in logs
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Passkey deleted from user Entra ID account but remains in Authenticator app on device

**Solution**: Verify passkey not in registered auth methods via Graph (users/{id}/authentication/methods). If missing, delete passkey from Authenticator app and re-register

---

### 'Unknown error occurred during passkey registration' on Android when registering passkey in Microsoft Authenticator
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: All providers for Passwords and accounts disabled on Android device

**Solution**: On Android: Settings > General management > Passwords, passkeys, and autofill > toggle Authenticator to Enabled

---

### 'We were unable to register the passkey you attempted to add' error; CMUX logs show 'Attestation format none not supported for aaguid'
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: User used a provider other than Microsoft Authenticator or Windows Hello; AAGUID mismatch

**Solution**: Check CMUX logs (IAMUXPROD db, IfxDiagnosticsEventPII table) for AAGUID. Verify against known AAGUIDs. Guide customer to use only MS Authenticator or Windows Hello

---

## Phase 3: Passkey Profiles
> 5 related entries

### Saving Passkey (FIDO2) policy fails with error: Include conditions are missing passkey profile targets, after opting in to Passkey Profiles preview...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Once Passkey Profile schema is enabled, every Target in includeTargets must be associated with at least one Passkey Profile. Adding a Target without a profile link triggers 400 Bad Request.

**Solution**: Before clicking Save, link the targeted group to a Passkey Profile by selecting one or more profiles in the Passkey Profiles dropdown for that Target row in the Enable and Target tab.

---

### Saving Passkey (FIDO2) authentication methods policy fails with error: Policy size is larger than allowed by N bytes. 400 Bad Request in browser tr...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Default User Credential Policy in Entra ID has a 20KB size limit covering all nested authentication method configurations. Too many targeted groups, AAGUIDs, or Passkey Profiles exceeds this limit.

**Solution**: Reduce targeted groups or simplify AAGUID lists. Check current size: GET /beta/policies/authenticationMethodsPolicy, save JSON as .txt, check file size. Upcoming: Passkey policy will be decoupled from default container with its own 20KB limit.

---

### Passkey (FIDO2) policy save fails with 400 'Include conditions are missing passkey profile targets' after opting in to Passkey Profiles preview, wh...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Once Passkey Profile schema is enabled via preview opt-in, every Target group must be linked to at least one Passkey Profile. Adding a Target without a profile link causes the PATCH call to fail with badRequest.

**Solution**: Before clicking Save, link the targeted group to a passkey profile by selecting a profile from the Passkey Profiles drop-down for that target.

---

### Passkey (FIDO2) policy save fails with 400 'Policy size is larger than allowed by N bytes' when configuring many Passkey Profiles, targets or AAGUIDs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Default User Credential Policy has 20KB limit including all nested auth method configs. Passkey policy will be decoupled to own 20KB limit in future.

**Solution**: Reduce targeted groups or simplify settings. Check size: GET graph.microsoft.com/beta/policies/authenticationMethodsPolicy, save as .txt, check size. Ref: base ~1.44KB, 1 target+profile ~0.23KB.

---

### After passkey profiles auto-enablement (April-May 2026), users who already registered Microsoft Authenticator unexpectedly prompted to register a p...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Auto-enablement with synced passkeys + Microsoft-managed campaign changes target from Authenticator to passkeys, expands to all MFA-capable users, snooze becomes non-configurable.

**Solution**: Set registration campaign to Enabled keeping Authenticator selected, or Disabled. Opt in before April 2026 to configure preferred passkeyType values.

---

## Phase 4: Android
> 4 related entries

### Android passkey sign-in: page stalls/times out after clicking 'Face, fingerprint, PIN or security key' option, small dialog at bottom says 'sign in...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: No matching passkey found on device. Common with work profile devices - passkey must be saved in work profile Authenticator. Older passkeys may be corrupted.

**Solution**: 1) For YubiKey/cross-device: click 'sign in another way' dialog to see security key options 2) Verify passkey exists in Authenticator (work profile if applicable) 3) Restart device 4) Last resort: re-register passkey. Search broker logs for 'AuthFidoChallengeHandler' and 'User canceled the request' CredMan exception.

---

### Android YubiKey sign-in fails on Samsung devices - passkey web page gets sent back to auth options even though passkey dialogs still present, cance...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known issue on Samsung devices: CredMan returns cancellation error when user plugs in or has a YubiKey with YubiOTP enabled during security key connection dialog

**Solution**: Workaround: Disable YubiOTP on YubiKeys if not needed. Issue is being investigated with YubiCo and Samsung. Ensure all system updates are applied.

---

### Android passkey: dialog says no passkeys saved on device despite having Authenticator installed
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Authenticator not enabled as passkey provider in device settings, or passkey not saved in correct profile (personal vs work profile)

**Solution**: 1) Enable Authenticator as passkey provider in Android Settings (both personal and work profile if applicable) 2) Verify passkey is saved in Authenticator 3) Restart device 4) Re-register passkey if issue persists.

---

### Cannot use NFC YubiKey for passkey authentication on Android
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Android Credential Manager only supports YubiKey connection via USB, NFC not supported. No plans to add NFC support in near future.

**Solution**: Use USB connection for YubiKey instead of NFC. This is a platform limitation of Android Credential Manager.

---

## Phase 5: Tap
> 2 related entries

### MFA required message appears when registering FIDO key using TAP, but registration resumes after page refresh
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Session timeout occurs if FIDO registration takes more than 10 minutes after TAP sign-in

**Solution**: Refresh the page and resume FIDO key registration. Complete registration within 10 minutes of sign-in

---

### MFA required error appears during FIDO key registration with TAP
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: FIDO registration took more than 10 minutes after sign-in, causing the session to time out

**Solution**: User should refresh the page and resume registration. Ensure FIDO registration is completed within 10 minutes of signing in with TAP.

---

## Phase 6: Authenticator
> 1 related entries

### Microsoft Authenticator passwordless phone sign-in and Certificate-Based Authentication (CBA) are not available in Mooncake (21Vianet).
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Prerequisite infrastructure for device-bound passkeys has not landed in China. FIDO2 ETA ~2027. Authenticator phone sign-in and CBA share same prerequisite.

**Solution**: Features not available in Mooncake. Device-bound passkeys (FIDO2) rough ETA 2027. Recommend alternative auth methods (password + MFA via SMS/OATH token).

---

## Phase 7: Linux
> 1 related entries

### Linux Intune enrollment fails with 'Certificate validation failed' error dialog
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Passkey configured as authentication method for the user account — Linux broker cannot correctly handle passkey authentication

**Solution**: 1) Remove passkey as auth method at https://account.microsoft.com/account → security info. 2) Ensure phone authenticator is set as 2FA. 3) On Linux: stop broker service, clear all broker/intune/edge caches (rm -rf ~/.cache/intune-portal ~/.config/microsoft-identity-broker etc). 4) Reboot, wait 5 min, login, wait 5 min, run intune-portal from terminal. 5) Re-enroll with password + phone authenticator.

---

## Phase 8: Oneauth
> 1 related entries

### FIDO key not recognized in unbrokered passwordless auth on Mac (webauthn=1 passed)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Confirmed Apple bug (feedbackassistant.apple.com/feedback/15493539). OneAuth library works as expected.

**Solution**: Customer must work with Apple. This is an Apple platform bug, not an auth library issue.

---

## Phase 9: Web Sign In
> 1 related entries

### Windows Web Sign-in with Passkey (device-bound passkey in MS Authenticator) fails with 'Something went wrong' after scanning QR code
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Corporate firewall/proxy blocks FIDO2 tunnel service domains: Cable.auth.com (Apple) and Cable.ua5v.com (Google)

**Solution**: Unblock Cable.auth.com (Apple devices) and Cable.ua5v.com (Google/Android devices) in corporate firewall/proxy. Required for cross-device passkey authentication via QR code.

---

## Phase 10: Idx10500
> 1 related entries

### IDX10500: Signature validation failed. No security keys were provided to validate the signature. Token signature cannot be validated because Issuer...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When using Microsoft.IdentityModel directly to validate tokens, the IssuerSigningKeys property in TokenValidationParameters is not set. The application has not fetched signing keys from the OIDC metadata endpoint. Middleware implementations handle this automatically.

**Solution**: If using Microsoft.IdentityModel directly: fetch OpenIdConnectConfiguration from {authority}/.well-known/openid-configuration and set IssuerSigningKeys=publicOpenIdConfig.SigningKeys. If using middleware: verify Authority/Metadata URL points to correct Entra ID endpoint. For Microsoft.Identity.Web see github wiki. For ASP.NET Core see JWT Bearer docs. For OWIN ensure correct Bearer auth config.

---

## Phase 11: Mfa Fraud
> 1 related entries

### User in legacy MFA blocked list can still sign in with password-only for resources not protected by MFA, or with FIDO2/WHfB/other strong auth metho...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Legacy MFA block list only prevents MFA authentication (registration or sign-in with traditional MFA methods). It does not block other authentication paths like FIDO2 or WHfB.

**Solution**: Use new Report Suspicious Activity feature (integrates with Identity Protection) for more comprehensive coverage. With AAD P2, risk-based CA policies can drive self-remediation. With AAD P1, use Risk Detections API to detect "User reported suspicious activity" and disable user account or force password change.

---

## Phase 12: Aadsts75011
> 1 related entries

### AADSTS75011 when using Passkeys (FIDO2/Authenticator passkey) to access SAML app. Auth method MultiFactor/Fido does not match Password. SAML reques...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When multiple AuthnContextClassRef values present in RequestedAuthnContext, Entra ID prioritizes Password if present regardless of order. FIDO2 produces MultiFactor/Fido which does not match Password with Comparison=exact. By design.

**Solution**: Recommended: Remove RequestedAuthnContext entirely from SAML request. Alternative: Remove Password from list and use only Unspecified. This allows stronger auth methods like passkeys. Verify: 1) Check AADSTS75011, 2) Decode SAML request, 3) Confirm Password present, 4) Check sign-in logs for MultiFactor/Fido.

---

## Phase 13: Wam
> 1 related entries

### WebAuthn via WAM does not support Windows Hello-based authentication. Users attempting WHFB/passkey auth through WAM-brokered WebAuthn flow find it...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: WAM WebAuthn implementation does not support Windows Hello for Business (WHFB) as an authentication method. This is a known platform limitation.

**Solution**: Use FIDO2 security keys instead of WHFB for WebAuthn scenarios via WAM. Or use browser-native WebAuthn (non-brokered) which supports WHFB directly.

---

## Phase 14: Whfb
> 1 related entries

### Windows Hello for Business smart card emulation stops working when more than 10 users enroll WHfB on a shared device; users beyond the 10th lose sm...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows supports maximum 10 concurrent smart card readers. Each enrolled WHfB credential uses a virtualized smart card reader for smart card emulation. WHfB was not designed for shared computing environments.

**Solution**: For shared workstations, use FIDO2 security keys or physical smart cards instead of WHfB. Do not exceed 10 WHfB enrollments per device. Going above 10 is unsupported and could break. DCR opened (05/2024) to enforce enrollment limit.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Microsoft Authenticator passwordless phone sign-in and Certificate-Based Auth... | Prerequisite infrastructure for device-bound passkeys has... | Features not available in Mooncake. Device-bound passkeys... | 🟢 9.0 | OneNote |
| 2 | Android passkey sign-in: page stalls/times out after clicking 'Face, fingerpr... | No matching passkey found on device. Common with work pro... | 1) For YubiKey/cross-device: click 'sign in another way' ... | 🟢 8.5 | ADO Wiki |
| 3 | Android YubiKey sign-in fails on Samsung devices - passkey web page gets sent... | Known issue on Samsung devices: CredMan returns cancellat... | Workaround: Disable YubiOTP on YubiKeys if not needed. Is... | 🟢 8.5 | ADO Wiki |
| 4 | Android passkey: dialog says no passkeys saved on device despite having Authe... | Authenticator not enabled as passkey provider in device s... | 1) Enable Authenticator as passkey provider in Android Se... | 🟢 8.5 | ADO Wiki |
| 5 | Cannot use NFC YubiKey for passkey authentication on Android | Android Credential Manager only supports YubiKey connecti... | Use USB connection for YubiKey instead of NFC. This is a ... | 🟢 8.5 | ADO Wiki |
| 6 | Linux Intune enrollment fails with 'Certificate validation failed' error dialog | Passkey configured as authentication method for the user ... | 1) Remove passkey as auth method at https://account.micro... | 🟢 8.5 | ADO Wiki |
| 7 | FIDO2 security key registration on Apple (macOS/iOS) fails with error 'Someth... | Apple does not support provisioning a new PIN on the FIDO... | Have the user first configure the PIN on the FIDO2 securi... | 🟢 8.5 | ADO Wiki |
| 8 | FIDO2 security key authentication via NFC fails on Android devices in both br... | Android does not currently support NFC for FIDO2 security... | Use USB security keys on Android instead of NFC. NFC is o... | 🟢 8.5 | ADO Wiki |
| 9 | MySecurityInfo prompts user to register a Microsoft Authenticator passkey eve... | UI/UX inconsistency in MySecurityInfo portal. The page do... | Instruct user to select 'Security key' instead of Microso... | 🟢 8.5 | ADO Wiki |
| 10 | FIDO2 security key model details show as 'unknown or invalid' in Entra ID por... | The FIDO2 key vendor has not onboarded/registered the key... | This is a display-only limitation with no functional impa... | 🟢 8.5 | ADO Wiki |
| 11 | On 'Add a passkey' page in MySecurityInfo, clicking 'Next' does nothing. No p... | Policy mismatch between Conditional Access authentication... | Create a custom authentication strength that explicitly l... | 🟢 8.5 | ADO Wiki |
| 12 | FIDO2 browser logon stops working on specific Windows device — PIN dialog nev... | Incomplete auto-install or auto-update of Citrix client (... | If Citrix is not required, uninstall it and retest. If Ci... | 🟢 8.5 | ADO Wiki |
| 13 | User signs in to Hybrid Join or Entra ID Join PC with Windows Hello for Busin... | KeyID claim conflict between the WHfB credential and the ... | Option 1: Instruct users to sign in to the PC using the F... | 🟢 8.5 | ADO Wiki |
| 14 | FIDO2 security keys appear as 'Disabled' on My Security Info page (aka.ms/mys... | UI rendering bug in the MySecurityInfo portal incorrectly... | No action required. Inform users the 'Disabled' label is ... | 🟢 8.5 | ADO Wiki |
| 15 | Tenant with Passkey Profiles enabled sees 'Windows Hello (preview)' option wh... | UI prematurely exposed the Windows Hello (Entra Passkeys ... | Inform customer the Windows Hello (Entra Passkeys on Wind... | 🟢 8.5 | ADO Wiki |
| 16 | FIDO2 security key interactive logon fails with message 'This security key do... | The security key does not have credentials registered for... | Re-register the FIDO2 security key at aka.ms/mysecurityin... | 🟢 8.5 | ADO Wiki |
| 17 | FIDO2 security key PIN entry fails repeatedly. CBOR-decoded CTAP2 response to... | User has exhausted all PIN retry attempts on the FIDO2 se... | The FIDO2 security key must be reset to restore functiona... | 🟢 8.5 | ADO Wiki |
| 18 | FIDO2 registration on Apple fails: Something went wrong when key has no PIN | Apple cannot provision new PIN on FIDO2 device | Configure PIN on Windows first then use on Apple | 🟢 8.5 | ADO Wiki |
| 19 | FIDO2 NFC fails on Android in browser and native apps | Android does not support NFC for FIDO2. Only USB (Chrome/... | Use USB keys. For native apps install Authenticator 6.240... | 🟢 8.5 | ADO Wiki |
| 20 | FIDO key not recognized in unbrokered passwordless auth on Mac (webauthn=1 pa... | Confirmed Apple bug (feedbackassistant.apple.com/feedback... | Customer must work with Apple. This is an Apple platform ... | 🟢 8.5 | ADO Wiki |
| 21 | FIDO2 security key model details show as unknown or invalid in Entra ID porta... | The FIDO2 key vendor has not onboarded/registered the key... | Display-only limitation with no functional impact. If mod... | 🟢 8.5 | ADO Wiki |
| 22 | On Add a passkey page in MySecurityInfo, clicking Next does nothing. Occurs w... | Policy mismatch between CA authentication strength (no AA... | Create a custom authentication strength that explicitly l... | 🟢 8.5 | ADO Wiki |
| 23 | FIDO2 browser logon stops working on specific Windows device - PIN dialog nev... | Incomplete auto-install or auto-update of Citrix client w... | If Citrix not required, uninstall and retest. If required... | 🟢 8.5 | ADO Wiki |
| 24 | User signs in to Hybrid/Entra ID Join PC with WHfB/NGC, then accesses resourc... | KeyID claim conflict between WHfB credential and FIDO2 cr... | Option 1: Sign in to PC using FIDO2 key instead of WHfB f... | 🟢 8.5 | ADO Wiki |
| 25 | FIDO2 security keys appear as Disabled on My Security Info page (aka.ms/mysec... | UI rendering bug in MySecurityInfo portal incorrectly mar... | No action required. Inform users the Disabled label is a ... | 🟢 8.5 | ADO Wiki |
| 26 | Tenant with Passkey Profiles sees Windows Hello (preview) option when editing... | UI prematurely exposed Windows Hello (Entra Passkeys on W... | Inform customer the feature is not yet available. PG fix ... | 🟢 8.5 | ADO Wiki |
| 27 | FIDO2 security key interactive logon fails with This security key does not lo... | Security key has no credentials registered for the relyin... | Re-register the FIDO2 security key at aka.ms/mysecurityin... | 🟢 8.5 | ADO Wiki |
| 28 | FIDO2 security key PIN entry fails. CBOR-decoded CTAP2 response shows 0 PIN r... | User exhausted all PIN retry attempts. Key firmware locks... | Reset the FIDO2 security key (WARNING: erases ALL credent... | 🟢 8.5 | ADO Wiki |
| 29 | FIDO2 interactive logon fails with error 0xc000006d / 0xC0048585. AAD Operati... | NCSI (Network Connection Status Indicator) traffic to htt... | Allow NCSI traffic through proxy/firewall. Ensure http://... | 🟢 8.5 | ADO Wiki |
| 30 | FIDO2 security key registration or sign-in fails in browser. Device logs (edg... | Firmware bugs in certain FIDO2 security keys (e.g. Nitrok... | Update security key firmware if supported (e.g. Nitrokey ... | 🟢 8.5 | ADO Wiki |
