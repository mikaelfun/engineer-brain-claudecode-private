# ENTRA-ID Multi-Factor Authentication — Quick Reference

**Entries**: 67 | **21V**: Partial (63/66)
**Last updated**: 2026-04-18
**Keywords**: mfa, entra-id, conditional-access, 21v, nps, aadsts50076

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/mfa.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Global admin locked out of tenant due to lost/damaged MFA device (Authenticator app). Only one gl... | MFA device lost/reinstalled/damaged. PG decommissioned LSM job to disable MFA... | 1) Identify other GA/Privileged Auth Admin to reset methods. 2) If no other a... | 🟢 10.0 | OneNote |
| 2 📋 | NPS MFA extension auth fails. Multiple certificates exist locally from repeated configuration scr... | First run generated cert locally but failed to upload to AAD. Subsequent runs... | Delete excess local certs, ensure only one valid cert matching AAD. Verify AA... | 🟢 10.0 | OneNote |
| 3 📋 | NPS MFA extension fails to find user in AAD. On-prem AD UPN format differs from AAD UPN. | NPS extension defaults to on-premises AD UPN for AAD user lookup. When on-pre... | Configure registry LDAP_ALTERNATE_LOGINID_ATTRIBUTE to specify AD attribute m... | 🟢 10.0 | OneNote |
| 4 📋 | 21v Teams login fails when both Call and Text MFA methods disabled in per-user MFA config. Admin ... | Teams 21v requires Call or Text MFA enabled for real-name verification. Disab... | Admin must enable at least one phone-based auth method (Call or Text) in per-... | 🟢 10.0 | OneNote |
| 5 📋 | ADFS Azure MFA authentication fails with error after AAD deprecated TLS 1.0/1.1. Schannel/DotNet ... | TLS 1.2 is not enabled on the ADFS server for .NET applications. AAD has depr... | Enable strong authentication for .NET applications by setting registry: New-I... | 🟢 9.0 | OneNote |
| 6 📋 | NPS extension Azure MFA fails - cert on NPS server mismatches cert in AAD for SP 981f26a1. | NPS extension cert locally out of sync with AAD-registered cert after expirat... | Compare certs via Get-MgServicePrincipal. If mismatch, re-run config script w... | 🟢 9.0 | OneNote |
| 7 📋 | NPS extension MFA fails with ResourceNotFoundException using Alternate ID. MSODS 404 on user lookup. | NPS passes alternate login (email) but MSODS looks up by UPN format which doe... | Debug via Kusto IfxUlsEvents in MSODS. Use NTRadPing to test RADIUS. Check Az... | 🟢 9.0 | OneNote |
| 8 📋 | Windows shows Your account requires authentication toast. AAD event log: Universal Store Native C... | Subscription Activation uses Universal Store Native Client which does not wor... | Disable SA via registry: ClipSVC DisableSubscription=1. Disable MFA banner vi... | 🟢 9.0 | OneNote |
| 9 📋 | MFA registration forces users to create App Password. During Enforced Per-user MFA registration, ... | Legacy Service Setting has 'Allow App Passwords' enabled, which auto-enables ... | In MFA Service Settings, disable 'Allow App Passwords'. This automatically di... | 🟢 9.0 | OneNote |
| 10 📋 | MFA SMS/Voice verification fails with error BlockAllEnterpriseSmsTrafficInCountryExceptAllowedTen... | Certain regions require opt-in for MFA telephony verification. The tenant's p... | 1) Verify in ESTS Kusto + MFA detail logs (idsharedmcsha AllSASCommonEvents) ... | 🟢 9.0 | OneNote |
| 11 📋 | MFA requests fail due to AAD Gateway throttling — users receive HTTP 429 Too Many Requests during... | AAD Gateway (Layer 1) throttles the request before it reaches SAS. EffectiveS... | 1) Query AAD Gateway AllRequestSummaryEvents: filter EffectiveStatusCode star... | 🟢 9.0 | OneNote |
| 12 📋 | MFA SMS/Voice calls not delivered to users in specific countries. SAS logs show BlockAllEnterpris... | Telephony-level country hard block (RepMap) — Microsoft's fraud protection bl... | 1) Search SAS AllSASCommonEvents Msg for 'BlockAll', 'OptIn', 'RepMap' keywor... | 🟢 9.0 | OneNote |
| 13 📋 | AADSTS50076 MFA required unexpectedly when accessing PIM in Azure portal. Blue screen session exp... | PIM uses .default scope evaluating all pre-authorized scopes. Some scopes (Ro... | Expected behavior per CA PG. Workaround: exclude PIM users from SPO MFA CA po... | 🟢 9.0 | OneNote |
| 14 📋 | Customer asks about AAD optional claims enfpolids and in_corp — unclear what they represent and h... | enfpolids = Object ID of Conditional Access policy hit during sign-in, mainly... | Explain enfpolids is CA policy object ID (useless for non-MS apps, no Graph/P... | 🟢 9.0 | OneNote |
| 15 📋 | NPS MFA triggers SMS verification but VPN client cannot input verification code. NPS log: Challen... | Azure MFA defaults to SMS. VPN clients using RADIUS cannot handle challenge-r... | (1) Change user default MFA method to Authenticator push in AAD portal. (2) C... | 🟢 9.0 | OneNote |
| 16 📋 | NPS primary auth fails before MFA extension is invoked. Event 6273 in Security log. VPN client ca... | VPN client auth method does not match NPS network policy auth method. Mismatc... | (1) Enable NPS audit: auditpol /set /subcategory:Network Policy Server /succe... | 🟢 9.0 | OneNote |
| 17 📋 | Unable to configure 'Verification options' under Service settings of per-user MFA in Azure portal... | The rememberMfaOnTrustedDevice.allowedNumberOfDays field has an invalid value... | Submit a PATCH request to the mfaServicePolicy endpoint with rememberMfaOnTru... | 🟢 9.0 | OneNote |
| 18 📋 | 21Vianet Teams users prompted for MFA registration endlessly. No CA/per-user MFA/security default... | China network law requires real-name auth for Teams in 21Vianet. Enforced by ... | 1) Confirm MFA works for other apps (OWA). 2) Check ASC if user has phone aut... | 🟢 9.0 | OneNote |
| 19 📋 | 21v Teams 登录时无限循环要求用户注册 MFA，即使 admin 已禁用 per-user MFA 或未配置 Conditional Access。 | 中国网络安全法第 24 条要求实名认证。21v Teams 强制要求终端用户注册手机号码作为 MFA 验证方式，此要求无法通过 per-user MFA ... | 1) 确认 MFA 在其他应用 (如 OWA partner.outlook.cn) 是否正常。2) 如仅 Teams 有问题，在 ASC 查看用户是否已... | 🟢 9.0 | OneNote |
| 20 📋 | Unexpected MFA prompts - MFA claim dropped during PRT renewal when PRT signed with RSA device key | ESTS only carries MFA claim for SessionKey or ECCDeviceKey signed PRTs, not R... | Fix tracked VS#3260136. ETA June 2025 | 🟢 8.5 | ADO Wiki |
| 21 📋 | Non-interactive AWS CLI sign-in (device code flow) fails with AADSTS50076: 'Due to a configuratio... | Conditional Access policy protects the AWS Single-Account Access application ... | Add the AWS CLI Middleware App as a target application in the same Conditiona... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Non-interactive AWS CLI sign-in (device code flow) fails with AADSTS50076: must use multi-factor ... | CA policy protects AWS Single-Account Access requiring MFA, but AWS CLI Middl... | Add the AWS CLI Middleware App as a target in the same CA policy that protect... | 🟢 8.5 | ADO Wiki |
| 23 📋 | User cannot sign in to Fortinet SSL VPN using MFA verification codes (Microsoft Authenticator app... | VPN authentication method not configured to use PAP or CHAPv2; the NPS extens... | Change the authentication method in the Fortinet SSLVPN client/server setting... | 🟢 8.5 | ADO Wiki |
| 24 📋 | Batch Explorer sign-in fails for users using Microsoft Authenticator App; both authentication pro... | Batch Explorer must authenticate the user into all accessible tenants simulta... | Option 1: Ensure all tenant accounts are registered in the Authenticator App.... | 🟢 8.5 | ADO Wiki |
| 25 📋 | User is unable to set up or use MFA; MFA prompts blocked or not appearing | User account has been added to the MFA Block list in Azure AD (Security > MFA... | Go to Azure Portal > Azure Active Directory > Security > MFA > Block/Unblock ... | 🟢 8.5 | ADO Wiki |
| 26 📋 | User encounters failures accessing myapplications.microsoft.com. AppManagement API calls fail wit... | A Conditional Access policy targeting the Office 365 app group enforces MFA, ... | Review Conditional Access policies targeting the Office 365 app group. Ensure... | 🟢 8.5 | ADO Wiki |
| 27 📋 | B2C countryList block for SMS/Voice MFA not working; attackers bypass region restrictions despite... | countryList changes applied to parent policy XML instead of child relying par... | Apply all countryList changes to child relying party XML only (e.g. SignUpOrS... | 🟢 8.5 | ADO Wiki |
| 28 📋 | Azure AD B2C MFA: Custom Greetings for MFA phone call setting at tenant level is not supported. T... | Product team explored this feature but encountered challenges; it was not ena... | No workaround available. Custom greetings for MFA phone calls are not support... | 🟢 8.5 | ADO Wiki |
| 29 📋 | User incorrectly marked as Multifactor Authentication Capable in User Registration Details | User must be included as target in tenant MFA policy to appear as MFA capable | Verify user is targeted in tenant MFA policy under Authentication methods pol... | 🟢 8.5 | ADO Wiki |
| 30 📋 | defaultMfaMethod in User Registration Details does not match portal Authentication Methods blade | Hardware token (hardwareOneTimePasscode) not shown as default MFA method by d... | Use userPreferredMethodForSecondaryAuthentication property via MS Graph API f... | 🟢 8.5 | ADO Wiki |
| 31 📋 | MFA is configured as required for PIM role activation at Subscription scope, but user is not prom... | PIM role settings (including MFA requirement) do not inherit between Subscrip... | Configure 'Require Multi-Factor Authentication on activation' independently a... | 🟢 8.5 | ADO Wiki |
| 32 📋 | MFA required for PIM role activation at subscription level but user not prompted for MFA when act... | PIM Role Settings do NOT inherit across scopes. Each scope (Subscription, Res... | Configure Require Multi-Factor Authentication on activation for the specific ... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Users unexpectedly prompted for MFA or blocked from access when Microsoft Managed CA Policies (e.... | Microsoft deploys Managed CA Policies in report-only mode with a 30-day count... | Monitor Message Center for MMP deployment notifications. Review new policies ... | 🟢 8.5 | ADO Wiki |
| 34 📋 | ROPC/non-interactive flows suddenly blocked after Security Defaults update. Users without MFA reg... | Security Defaults (Feb-Apr 2025) now enforces MFA on non-interactive flows (p... | Update apps from ROPC to secure alternatives. Or temporarily disable Security... | 🟢 8.5 | ADO Wiki |
| 35 📋 | US Gov cloud users prompted for MFA at every sign-in after April 3, 2026 Security Defaults update | Security Defaults behavior change in US Gov: MFA at every sign-in. Cannot be ... | Expected behavior. Admins can disable Security Defaults but recommended to ke... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Infinite sign-in loop when using Okta as federated MFA provider with Azure AD Conditional Access.... | Okta sign-on policy is weaker than Azure AD CA policy. Neither org-level nor ... | Ensure Okta sign-on policy requires MFA at org or app level. Contact Okta sup... | 🟢 8.5 | ADO Wiki |
| 37 📋 | User signs in via WHfB but gets blocked by CA Authentication Strength policy. Error says password... | When previous PRT has MFA claim from different method (e.g., push notificatio... | Fixed in ESTS: merge MFA containers in previous refresh tokens with user cred... | 🟢 8.5 | ADO Wiki |
| 38 📋 | In Azure Free tenants, toggling Security defaults to On in the MFA Wizard takes immediate effect ... | Security defaults toggle is applied immediately when switched On in the wizar... | Navigate to Properties blade > Manage security defaults link to disable Secur... | 🟢 8.5 | ADO Wiki |
| 39 📋 | VPN authorization fails after number matching rollout (May 8, 2023) for organizations using RADIU... | NPS extension does not support Number Matching, Rich Context, or Geographic L... | Update NPS extension to version 1.2.2216.1 or later. Users will receive One-T... | 🟢 8.5 | ADO Wiki |
| 40 📋 | Silent PTA agent installation with credentials fails when the Global Admin account is protected b... | Silent credential-based installation using PSCredential cannot handle MFA cha... | Use offline token method instead: Generate token interactively on another mac... | 🟢 8.5 | ADO Wiki |
| NEW 📋 | Unable to access MFA Server User portal due to error - Service unavailable HTTP 500 | Custom app pool under which the MFA Application was running within IIS was in st... | Updated the username, password for the custom App pool in IIS and started the Ap... | 🟢 8.0 | ContentIdea |
| ... | *26 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **mfa** related issues (18 entries) `[onenote]`
2. Check **nps** related issues (6 entries) `[onenote]`
3. Check **teams** related issues (3 entries) `[onenote]`
4. Check **21v** related issues (2 entries) `[onenote]`
5. Check **certificate** related issues (2 entries) `[onenote]`
6. Check **21vianet** related issues (2 entries) `[onenote]`
7. Check **per-user-mfa** related issues (2 entries) `[onenote]`
8. Check **sms** related issues (2 entries) `[onenote]`
