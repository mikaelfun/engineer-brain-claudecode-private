# ENTRA-ID Multi-Factor Authentication — Detailed Troubleshooting Guide

**Entries**: 67 | **Drafts fused**: 20 | **Kusto queries**: 1
**Draft sources**: ado-wiki-a-asc-mfa-logs-result-codes.md, ado-wiki-b-azure-portal-mfa-enforcement.md, ado-wiki-b-mfa-authentication-management.md, ado-wiki-c-azure-mfa-source-of-mfa.md, ado-wiki-c-bulk-update-mfa-phone-auth-method.md, ado-wiki-c-change-per-user-mfa-settings-msgraph.md, ado-wiki-c-external-mfa-policy.md, ado-wiki-c-get-mfa-auth-method-all-group-users.md, ado-wiki-c-mfa-server-migration-utility.md, ado-wiki-d-m365-admin-center-mandatory-mfa.md
**Kusto references**: mfa-detail.md
**Generated**: 2026-04-07

---

## Phase 1: Entra Id
> 11 related entries

### Phone number authentication method does not appear under Authentication Methods in Azure portal for legacy users, even though it is visible in MySe...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: PhoneMethod entry was never migrated from legacy backend to StrongAuthenticationMethod schema. Incomplete method displays in MySecurityInfo but not under Authentication Methods in portal.

**Solution**: No customer-facing workaround. PG backlog item exists to address parity between both views (ICM 672804544). Inform customer this is a known issue affecting a subset of legacy users.

---

### User cannot use TOTP code for MFA sign-in. After entering TOTP code in sign-in UI, nothing happens. ESTS/SAS log shows error code PhoneAppOTPOathCo...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: User entered a valid TOTP code matching a registered device, but the TOTP device flavor (e.g., third-party software TOTP) is not allowed for MFA authentication. Registration is allowed for both SSPR and MFA, but sign-in only checks MFA policy.

**Solution**: Check user in ASC -> Users -> Authentication methods to verify which TOTP device types are allowed for MFA. Ensure user is using an allowed device flavor (e.g., Microsoft Authenticator TOTP vs. third-party TOTP).

---

### Users unable to complete MFA on NPS Extension deployment. NPS Extension event logs (AuthZOptCh) show Access Rejected with Azure MFA response: Reque...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Multiple simultaneous MFA authentication attempts for the same user on NPS Extension trigger a redirect conflict in the Azure MFA backend.

**Solution**: Workaround: Configure NPS/user experience to prevent duplicate MFA attempts on the same account within a 2-minute timeframe. PG fix pending (bug 3113001, ICM 572758874).

---

### Users trying to change an already-registered phone number in My Security Info using Change get error: Phone number is already registered for this a...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Bug in My Security Info Change flow for phone number authentication method (ICM 559885796).

**Solution**: Workaround: Delete the registered phone number using Delete, then register the new number using Add sign-in method.

---

### User is redirected to register MFA method despite having usable methods registered, or stuck in redirect loop to My Security Info page with no meth...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: User default method is non-usable (disabled in Authentication methods policy) and system-preferred method is disabled. Also triggered when user is enabled for External Authentication Method (EAM).

**Solution**: Delete or change the non-usable default method to a usable one. Prevention: before disabling an auth method policy or excluding a user, verify no affected users have that method as default.

---

### After admin disables third-party software TOTP or hardware TOTP authentication method policy, users who previously registered can still use third-p...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Disabling the authentication method policy does not revoke already-registered third-party TOTP methods. Known bug tracked by PG (work item 2953713).

**Solution**: No customer-facing workaround currently available. Admin must manually remove the registered third-party TOTP methods from affected users.

---

### B2B guest users who are also GDAP admins unable to register MFA methods on aka.ms/mysecurityinfo. Users see Keep your account secure page with no m...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: GDAP guest admins cannot manage their own security information at My Security Info (by design, bug 2863208). User is both CSP (DAP/GDAP) and B2B guest.

**Solution**: Configure cross-tenant access policies to trust MFA from the trusted CSP tenant. Otherwise, tenant admin must register methods (SMS or Voice) on behalf of the GDAP guest admin. Ref: https://learn.microsoft.com/en-us/partner-center/customers/gdap-faq

---

### User cannot register MFA. MFA registration fails silently or with error when user belongs to many groups.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Service limitation: if user has more than 2049 transitive group memberships, MFA registration fails.

**Solution**: Reduce user transitive group membership below 2049. Check count: Graph Explorer GET /users/{id}/transitiveMemberOf/$count. Ref: https://learn.microsoft.com/en-us/entra/identity/users/directory-service-limits-restrictions

---

### User in scope of CBA (Certificate Based Authentication) and SSPR/MFA combined registration cannot complete registration, stuck in loop. System-pref...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: When system-preferred methods is enabled and user is in scope of CBA policy, registration flow requires CBA challenge which creates circular dependency preventing SSPR/MFA method registration.

**Solution**: Exclude the CBA policy group from MFA system-preferred methods. Or use Temporary Access Pass (TAP) to satisfy MFA requirement and complete SSPR registration.

---

### MFA or PSI registration in Microsoft Authenticator app fails during interactive token acquisition step for Auth Connector resource.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Tenant admin has Conditional Access policy targeting all cloud apps, which started being applied to Auth Connector resource used by Authenticator app for MFA/PSI registration.

**Solution**: Exclude the Auth Connector resource from the Conditional Access policy that targets all cloud apps. ICM 373439038.

---

## Phase 2: Nps
> 6 related entries

### NPS MFA extension auth fails. Multiple certificates exist locally from repeated configuration script runs without proper parameter changes.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: First run generated cert locally but failed to upload to AAD. Subsequent runs created additional certs without cleaning old ones, causing cert confusion.

**Solution**: Delete excess local certs, ensure only one valid cert matching AAD. Verify AAD cert via Connect-MgGraph and Get-MgServicePrincipal for appid 981f26a1-7f43-403b-a875-f8b09b8cd720.

---

### NPS MFA extension fails to find user in AAD. On-prem AD UPN format differs from AAD UPN.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: NPS extension defaults to on-premises AD UPN for AAD user lookup. When on-prem UPN (e.g. user@domain.local) differs from AAD UPN, lookup fails.

**Solution**: Configure registry LDAP_ALTERNATE_LOGINID_ATTRIBUTE to specify AD attribute matching AAD UPN (typically mail). Restart NPS service. Ref: howto-mfa-nps-extension-advanced.

---

### NPS extension Azure MFA fails - cert on NPS server mismatches cert in AAD for SP 981f26a1.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: NPS extension cert locally out of sync with AAD-registered cert after expiration or reconfig.

**Solution**: Compare certs via Get-MgServicePrincipal. If mismatch, re-run config script with -Environment China.

---

### NPS extension MFA fails with ResourceNotFoundException using Alternate ID. MSODS 404 on user lookup.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: NPS passes alternate login (email) but MSODS looks up by UPN format which does not exist.

**Solution**: Debug via Kusto IfxUlsEvents in MSODS. Use NTRadPing to test RADIUS. Check Azure MFA event logs on NPS server.

---

### NPS MFA triggers SMS verification but VPN client cannot input verification code. NPS log: Challenge requested in Authentication Ext for User.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Azure MFA defaults to SMS. VPN clients using RADIUS cannot handle challenge-response for SMS/OTP input. After number matching update, default behavior changed.

**Solution**: (1) Change user default MFA method to Authenticator push in AAD portal. (2) Configure NPS registry OVERRIDE_NUMBER_MATCHING_WITH_OTP=FALSE for legacy Approve/Deny push. (3) Restart NPS service.

---

### NPS primary auth fails before MFA extension is invoked. Event 6273 in Security log. VPN client cannot connect despite NPS MFA extension installed.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: VPN client auth method does not match NPS network policy auth method. Mismatch causes NPS layer-1 primary auth failure before MFA extension (layer-2) is reached.

**Solution**: (1) Enable NPS audit: auditpol /set /subcategory:Network Policy Server /success:enable /failure:enable. (2) Check event 6273 for details. (3) Temporarily remove MFA DLL registry (AuthorizationDLLs/ExtensionDLLs under authsrv\parameters) to isolate. (4) Configure matching auth (e.g. PEAP-MSCHAPv2) on both NPS and VPN client.

---

## Phase 3: B2C
> 4 related entries

### B2C countryList block for SMS/Voice MFA not working; attackers bypass region restrictions despite UX changes
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: countryList changes applied to parent policy XML instead of child relying party XML. B2C does not support parent policy inheritance for this feature.

**Solution**: Apply all countryList changes to child relying party XML only (e.g. SignUpOrSignin.xml). Ref: https://learn.microsoft.com/azure/active-directory-b2c/phone-based-mfa#mitigate-fraudulent-sign-ups-for-custom-policy

---

### Azure AD B2C MFA: Custom Greetings for MFA phone call setting at tenant level is not supported. There are no near-future plans to enable this feature.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Product team explored this feature but encountered challenges; it was not enabled. No near-future plans exist.

**Solution**: No workaround available. Custom greetings for MFA phone calls are not supported in Azure AD B2C. Advise customer this is a known limitation.

---

### MFA SMS localization not working for Estonian language (et) in Azure AD B2C despite it being listed as a supported MFA language
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Estonian language is incorrectly treated as unsupported when MFA request is initiated from B2C tenant (ADO Bug#1290638)

---

### Custom Greetings for MFA phone call setting at tenant level is not available in Azure AD B2C
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Product team explored this feature but had challenges due to which it was not enabled. No near-future plans to enable this feature.

**Solution**: Not supported. No workaround available. MFA can be enabled at user flow/custom policy level or tenant level, but custom greetings for phone call are not supported.

---

## Phase 4: Teams
> 3 related entries

### 21v Teams login fails when both Call and Text MFA methods disabled in per-user MFA config. Admin disabled phone-based MFA but Teams requires them.
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: Teams 21v requires Call or Text MFA enabled for real-name verification. Disabling both blocks auth flow required by China regulatory law. Confirmed by Teams PG.

**Solution**: Admin must enable at least one phone-based auth method (Call or Text) in per-user MFA service config. This is a government regulatory requirement.

---

### 21Vianet Teams users prompted for MFA registration endlessly. No CA/per-user MFA/security defaults configured. Other apps (OWA) work fine.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: China network law requires real-name auth for Teams in 21Vianet. Enforced by Identity Protection, cannot be disabled via AAD MFA/security defaults/CA policy.

**Solution**: 1) Confirm MFA works for other apps (OWA). 2) Check ASC if user has phone auth method registered. 3) Register phone at https://mysignins.windowsazure.cn/security-info. 4) Admin check per-user MFA config to ensure phone method allowed.

---

### 21v Teams 登录时无限循环要求用户注册 MFA，即使 admin 已禁用 per-user MFA 或未配置 Conditional Access。
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: 中国网络安全法第 24 条要求实名认证。21v Teams 强制要求终端用户注册手机号码作为 MFA 验证方式，此要求无法通过 per-user MFA (Disabled)、Security Defaults 或 CA Policy 绕过。

**Solution**: 1) 确认 MFA 在其他应用 (如 OWA partner.outlook.cn) 是否正常。2) 如仅 Teams 有问题，在 ASC 查看用户是否已注册 phone auth method。3) 未注册则让用户访问 https://mysignins.windowsazure.cn/security-info 注册手机号。4) 若无法注册，admin 检查 per-user MFA 配置页确认 phone method 已允许。5) 若仍有问题，按常规 MFA 排查收集 Authenticator/Windows event/Teams logs。

---

## Phase 5: Security Defaults
> 3 related entries

### ROPC/non-interactive flows suddenly blocked after Security Defaults update. Users without MFA registration blocked.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Security Defaults (Feb-Apr 2025) now enforces MFA on non-interactive flows (parity with CA). Previously allowed, now blocked.

**Solution**: Update apps from ROPC to secure alternatives. Or temporarily disable Security Defaults. Global admins notified ~28 days before.

---

### US Gov cloud users prompted for MFA at every sign-in after April 3, 2026 Security Defaults update
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Security Defaults behavior change in US Gov: MFA at every sign-in. Cannot be changed or postponed.

**Solution**: Expected behavior. Admins can disable Security Defaults but recommended to keep on. Consider migrating to CA.

---

### In Azure Free tenants, toggling Security defaults to On in the MFA Wizard takes immediate effect before the wizard is completed. Admin cannot re-ru...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Security defaults toggle is applied immediately when switched On in the wizard UI, not deferred to wizard completion.

**Solution**: Navigate to Properties blade > Manage security defaults link to disable Security defaults, then re-run the wizard from start.

---

## Phase 6: Sms
> 2 related entries

### MFA SMS/Voice verification fails with error BlockAllEnterpriseSmsTrafficInCountryExceptAllowedTenants or BlockAllEnterpriseVoiceTrafficInCountryExc...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Certain regions require opt-in for MFA telephony verification. The tenant's phone number country code is in a region that requires explicit opt-in via IcM to PG.

**Solution**: 1) Verify in ESTS Kusto + MFA detail logs (idsharedmcsha AllSASCommonEvents) using correlation ID. 2) Raise CRI/IcM to PG: Identity Reputation Manage and Abuse Prevention > Telecom Queue. 3) Reference: https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-regional-opt-in

---

### MFA SMS/Voice calls not delivered to users in specific countries. SAS logs show BlockAllEnterpriseSms/VoiceTrafficInCountry or RepMap/OptIn keywords.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Telephony-level country hard block (RepMap) — Microsoft's fraud protection blocks SMS/Voice MFA delivery to certain countries flagged for telephony fraud. This is not rate-based throttling but a country-level policy.

**Solution**: 1) Search SAS AllSASCommonEvents Msg for 'BlockAll', 'OptIn', 'RepMap' keywords. 2) If country is blocked, customer must use alternative MFA methods (Authenticator app TOTP/Push instead of SMS/Voice). 3) Reference: https://docs.azure.cn/zh-cn/entra/identity/authentication/concept-mfa-telephony-fraud. 4) Kusto cluster (21V): idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn / idmfacne.

---

## Phase 7: Aws
> 2 related entries

### Non-interactive AWS CLI sign-in (device code flow) fails with AADSTS50076: 'Due to a configuration change made by your administrator, you must use ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Conditional Access policy protects the AWS Single-Account Access application requiring MFA, but the AWS CLI Middleware App (used by device code flow) is not included in the CA policy. The device code flow authentication does not prompt for MFA, so the OBO token acquisition for AWS SSO fails.

**Solution**: Add the AWS CLI Middleware App as a target application in the same Conditional Access policy that protects the AWS Single-Account Access application, so MFA is enforced during the device code flow authentication.

---

### Non-interactive AWS CLI sign-in (device code flow) fails with AADSTS50076: must use multi-factor authentication. MSEntraAuthAWSCLI.exe shows intera...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CA policy protects AWS Single-Account Access requiring MFA, but AWS CLI Middleware App (device code flow target) is not in the CA policy. OBO token acquisition fails without MFA claim.

**Solution**: Add the AWS CLI Middleware App as a target in the same CA policy that protects AWS Single-Account Access.

---

## Phase 8: Nps Extension
> 2 related entries

### User cannot sign in to Fortinet SSL VPN using MFA verification codes (Microsoft Authenticator app code or SMS code); receives 'Access deny' error a...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: VPN authentication method not configured to use PAP or CHAPv2; the NPS extension for Azure AD MFA requires PAP to support all authentication methods (TOTP, SMS, app-based)

**Solution**: Change the authentication method in the Fortinet SSLVPN client/server settings to PAP (Password Authentication Protocol) or CHAPv2; PAP enables the NPS extension to pass the secondary factor verification to Azure AD MFA

---

### VPN authorization fails after number matching rollout (May 8, 2023) for organizations using RADIUS protocols other than PAP. AuthZOptCh event log s...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: NPS extension does not support Number Matching, Rich Context, or Geographic Location awareness. Non-PAP RADIUS protocols cannot handle the number matching challenge flow.

**Solution**: Update NPS extension to version 1.2.2216.1 or later. Users will receive One-Time Passcodes (OTP) via SMS push notification as fallback. Ensure RADIUS uses PAP protocol for best compatibility. Alternatively, modify registry for TOTP per MS Learn NPS extension guidance.

---

## Phase 9: User Registration
> 2 related entries

### User incorrectly marked as Multifactor Authentication Capable in User Registration Details
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User must be included as target in tenant MFA policy to appear as MFA capable

**Solution**: Verify user is targeted in tenant MFA policy under Authentication methods policies.

---

### defaultMfaMethod in User Registration Details does not match portal Authentication Methods blade
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Hardware token (hardwareOneTimePasscode) not shown as default MFA method by design

**Solution**: Use userPreferredMethodForSecondaryAuthentication property via MS Graph API for both hardware and software tokens.

---

## Phase 10: Pim
> 2 related entries

### MFA is configured as required for PIM role activation at Subscription scope, but user is not prompted for MFA when activating the same role at Reso...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PIM role settings (including MFA requirement) do not inherit between Subscription, Resource Group, and Resource scopes. Each scope has independent role settings configuration.

**Solution**: Configure 'Require Multi-Factor Authentication on activation' independently at each scope level (Subscription, Resource Group, Resource) where MFA enforcement is needed. Alert subscription/resource group owner about the role setting inconsistency.

---

### MFA required for PIM role activation at subscription level but user not prompted for MFA when activating the same role at resource group or resourc...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PIM Role Settings do NOT inherit across scopes. Each scope (Subscription, Resource Group, Resource) has independent Role Settings configuration.

**Solution**: Configure Require Multi-Factor Authentication on activation for the specific role at each scope level independently via Resource filter > Role Settings.

---

## Phase 11: Ests
> 2 related entries

### Infinite sign-in loop when using Okta as federated MFA provider with Azure AD Conditional Access. Users stuck in authentication loop between Okta a...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Okta sign-on policy is weaker than Azure AD CA policy. Neither org-level nor app-level Okta policy requires MFA, but Azure AD CA expects completed MFA claim from Okta, causing redirect loop.

**Solution**: Ensure Okta sign-on policy requires MFA at org or app level. Contact Okta support for known preview MFA feature issue.

---

### User signs in via WHfB but gets blocked by CA Authentication Strength policy. Error says password not satisfied despite WHfB being an allowed method.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When previous PRT has MFA claim from different method (e.g., push notification), the MFA claim in NGC (WHfB) was dropped. Auth strength requires Password + Push Notification combination.

**Solution**: Fixed in ESTS: merge MFA containers in previous refresh tokens with user credentials like WHfB. See ESTS-Main PR 10740696. ICM: 521412781.

---

## Phase 12: Adfs
> 1 related entries

### ADFS Azure MFA authentication fails with error after AAD deprecated TLS 1.0/1.1. Schannel/DotNet errors in ADFS event logs when Azure MFA adapter t...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: TLS 1.2 is not enabled on the ADFS server for .NET applications. AAD has deprecated TLS 1.0/1.1, so ADFS MFA adapter cannot establish secure connection to Azure MFA service.

**Solution**: Enable strong authentication for .NET applications by setting registry: New-ItemProperty -path 'HKLM:\SOFTWARE\Microsoft\.NetFramework\v4.0.30319' -name 'SchUseStrongCrypto' -value '1' -PropertyType 'DWord' -Force. Reference: https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/operations/manage-ssl-protocols-in-ad-fs#enable-strong-authentication-for-net-applications

---

## Phase 13: Subscription Activation
> 1 related entries

### Windows shows Your account requires authentication toast. AAD event log: Universal Store Native Client (268761a2) auth error for onestore.microsoft...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Subscription Activation uses Universal Store Native Client which does not work in 21V. New since Win11 23H2+KB5034848.

**Solution**: Disable SA via registry: ClipSVC DisableSubscription=1. Disable MFA banner via MfaRequiredInClipRenew=0. SA is Windows DND scope.

---

## Phase 14: App Password
> 1 related entries

### MFA registration forces users to create App Password. During Enforced Per-user MFA registration, the App Password step is mandatory and cannot be s...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Legacy Service Setting has 'Allow App Passwords' enabled, which auto-enables App Password in user's Authentication Methods policy (only visible via F12 browser dev tools).

**Solution**: In MFA Service Settings, disable 'Allow App Passwords'. This automatically disables App Password in user Authentication Methods policy.

---

## Phase 15: Throttling
> 1 related entries

### MFA requests fail due to AAD Gateway throttling — users receive HTTP 429 Too Many Requests during MFA sign-in. MFA service (SAS) never receives the...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: AAD Gateway (Layer 1) throttles the request before it reaches SAS. EffectiveStatusCode=429 and IsThrottled=true in RequestSummaryEventCore. This is the highest-impact throttling layer.

**Solution**: 1) Query AAD Gateway AllRequestSummaryEvents: filter EffectiveStatusCode startswith '429', TargetService contains 'mysignins' or 'strongauthenticationservice'. 2) Aggregate by time to identify throttling windows. 3) Gateway throttling blocks all MFA for affected services — escalate to identity platform team if persistent. 4) Kusto cluster (21V): idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn / AADGatewayProd.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Global admin locked out of tenant due to lost/damaged MFA device (Authenticat... | MFA device lost/reinstalled/damaged. PG decommissioned LS... | 1) Identify other GA/Privileged Auth Admin to reset metho... | 🟢 10.0 | OneNote |
| 2 | NPS MFA extension auth fails. Multiple certificates exist locally from repeat... | First run generated cert locally but failed to upload to ... | Delete excess local certs, ensure only one valid cert mat... | 🟢 10.0 | OneNote |
| 3 | NPS MFA extension fails to find user in AAD. On-prem AD UPN format differs fr... | NPS extension defaults to on-premises AD UPN for AAD user... | Configure registry LDAP_ALTERNATE_LOGINID_ATTRIBUTE to sp... | 🟢 10.0 | OneNote |
| 4 | 21v Teams login fails when both Call and Text MFA methods disabled in per-use... | Teams 21v requires Call or Text MFA enabled for real-name... | Admin must enable at least one phone-based auth method (C... | 🟢 10.0 | OneNote |
| 5 | ADFS Azure MFA authentication fails with error after AAD deprecated TLS 1.0/1... | TLS 1.2 is not enabled on the ADFS server for .NET applic... | Enable strong authentication for .NET applications by set... | 🟢 9.0 | OneNote |
| 6 | NPS extension Azure MFA fails - cert on NPS server mismatches cert in AAD for... | NPS extension cert locally out of sync with AAD-registere... | Compare certs via Get-MgServicePrincipal. If mismatch, re... | 🟢 9.0 | OneNote |
| 7 | NPS extension MFA fails with ResourceNotFoundException using Alternate ID. MS... | NPS passes alternate login (email) but MSODS looks up by ... | Debug via Kusto IfxUlsEvents in MSODS. Use NTRadPing to t... | 🟢 9.0 | OneNote |
| 8 | Windows shows Your account requires authentication toast. AAD event log: Univ... | Subscription Activation uses Universal Store Native Clien... | Disable SA via registry: ClipSVC DisableSubscription=1. D... | 🟢 9.0 | OneNote |
| 9 | MFA registration forces users to create App Password. During Enforced Per-use... | Legacy Service Setting has 'Allow App Passwords' enabled,... | In MFA Service Settings, disable 'Allow App Passwords'. T... | 🟢 9.0 | OneNote |
| 10 | MFA SMS/Voice verification fails with error BlockAllEnterpriseSmsTrafficInCou... | Certain regions require opt-in for MFA telephony verifica... | 1) Verify in ESTS Kusto + MFA detail logs (idsharedmcsha ... | 🟢 9.0 | OneNote |
| 11 | MFA requests fail due to AAD Gateway throttling — users receive HTTP 429 Too ... | AAD Gateway (Layer 1) throttles the request before it rea... | 1) Query AAD Gateway AllRequestSummaryEvents: filter Effe... | 🟢 9.0 | OneNote |
| 12 | MFA SMS/Voice calls not delivered to users in specific countries. SAS logs sh... | Telephony-level country hard block (RepMap) — Microsoft's... | 1) Search SAS AllSASCommonEvents Msg for 'BlockAll', 'Opt... | 🟢 9.0 | OneNote |
| 13 | AADSTS50076 MFA required unexpectedly when accessing PIM in Azure portal. Blu... | PIM uses .default scope evaluating all pre-authorized sco... | Expected behavior per CA PG. Workaround: exclude PIM user... | 🟢 9.0 | OneNote |
| 14 | Customer asks about AAD optional claims enfpolids and in_corp — unclear what ... | enfpolids = Object ID of Conditional Access policy hit du... | Explain enfpolids is CA policy object ID (useless for non... | 🟢 9.0 | OneNote |
| 15 | NPS MFA triggers SMS verification but VPN client cannot input verification co... | Azure MFA defaults to SMS. VPN clients using RADIUS canno... | (1) Change user default MFA method to Authenticator push ... | 🟢 9.0 | OneNote |
| 16 | NPS primary auth fails before MFA extension is invoked. Event 6273 in Securit... | VPN client auth method does not match NPS network policy ... | (1) Enable NPS audit: auditpol /set /subcategory:Network ... | 🟢 9.0 | OneNote |
| 17 | Unable to configure 'Verification options' under Service settings of per-user... | The rememberMfaOnTrustedDevice.allowedNumberOfDays field ... | Submit a PATCH request to the mfaServicePolicy endpoint w... | 🟢 9.0 | OneNote |
| 18 | 21Vianet Teams users prompted for MFA registration endlessly. No CA/per-user ... | China network law requires real-name auth for Teams in 21... | 1) Confirm MFA works for other apps (OWA). 2) Check ASC i... | 🟢 9.0 | OneNote |
| 19 | 21v Teams 登录时无限循环要求用户注册 MFA，即使 admin 已禁用 per-user MFA 或未配置 Conditional Access。 | 中国网络安全法第 24 条要求实名认证。21v Teams 强制要求终端用户注册手机号码作为 MFA 验证方式，此... | 1) 确认 MFA 在其他应用 (如 OWA partner.outlook.cn) 是否正常。2) 如仅 Tea... | 🟢 9.0 | OneNote |
| 20 | Unexpected MFA prompts - MFA claim dropped during PRT renewal when PRT signed... | ESTS only carries MFA claim for SessionKey or ECCDeviceKe... | Fix tracked VS#3260136. ETA June 2025 | 🟢 8.5 | ADO Wiki |
| 21 | Non-interactive AWS CLI sign-in (device code flow) fails with AADSTS50076: 'D... | Conditional Access policy protects the AWS Single-Account... | Add the AWS CLI Middleware App as a target application in... | 🟢 8.5 | ADO Wiki |
| 22 | Non-interactive AWS CLI sign-in (device code flow) fails with AADSTS50076: mu... | CA policy protects AWS Single-Account Access requiring MF... | Add the AWS CLI Middleware App as a target in the same CA... | 🟢 8.5 | ADO Wiki |
| 23 | User cannot sign in to Fortinet SSL VPN using MFA verification codes (Microso... | VPN authentication method not configured to use PAP or CH... | Change the authentication method in the Fortinet SSLVPN c... | 🟢 8.5 | ADO Wiki |
| 24 | Batch Explorer sign-in fails for users using Microsoft Authenticator App; bot... | Batch Explorer must authenticate the user into all access... | Option 1: Ensure all tenant accounts are registered in th... | 🟢 8.5 | ADO Wiki |
| 25 | User is unable to set up or use MFA; MFA prompts blocked or not appearing | User account has been added to the MFA Block list in Azur... | Go to Azure Portal > Azure Active Directory > Security > ... | 🟢 8.5 | ADO Wiki |
| 26 | User encounters failures accessing myapplications.microsoft.com. AppManagemen... | A Conditional Access policy targeting the Office 365 app ... | Review Conditional Access policies targeting the Office 3... | 🟢 8.5 | ADO Wiki |
| 27 | B2C countryList block for SMS/Voice MFA not working; attackers bypass region ... | countryList changes applied to parent policy XML instead ... | Apply all countryList changes to child relying party XML ... | 🟢 8.5 | ADO Wiki |
| 28 | Azure AD B2C MFA: Custom Greetings for MFA phone call setting at tenant level... | Product team explored this feature but encountered challe... | No workaround available. Custom greetings for MFA phone c... | 🟢 8.5 | ADO Wiki |
| 29 | User incorrectly marked as Multifactor Authentication Capable in User Registr... | User must be included as target in tenant MFA policy to a... | Verify user is targeted in tenant MFA policy under Authen... | 🟢 8.5 | ADO Wiki |
| 30 | defaultMfaMethod in User Registration Details does not match portal Authentic... | Hardware token (hardwareOneTimePasscode) not shown as def... | Use userPreferredMethodForSecondaryAuthentication propert... | 🟢 8.5 | ADO Wiki |


---

## Incremental Update (2026-04-18) - +1 entries from contentidea-kb

### Unable to access MFA Server User portal due to error - Service unavailable HTTP 500
**Score**: 🟢 8.0 | **Source**: ContentIdea KB | **ID**: entra-id-3673

**Root Cause**: Custom app pool under which the MFA Application was running within IIS was in stopped state.

**Solution**: Updated the username, password for the custom App pool in IIS and started the Application pool.

