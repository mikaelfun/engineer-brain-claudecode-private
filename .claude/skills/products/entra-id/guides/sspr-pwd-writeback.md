# ENTRA-ID SSPR & Password Writeback — Quick Reference

**Entries**: 66 | **21V**: Partial (59/65)
**Last updated**: 2026-04-18
**Keywords**: password-writeback, sspr, password-reset, aad-connect, entra-connect, cloud-sync

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/sspr-pwd-writeback.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Self-Service Password Reset (SSPR) using OTP method fails in Mooncake. User sees error when attem... | SSPR OTP method is not supported in Mooncake. Known feature gap tracked in IC... | Inform customer SSPR OTP is not supported in Mooncake. Recommend alternative ... | 🟢 8.5 | OneNote |
| 2 📋 | Password writeback service down after previously working; unable to enable/reconfigure Password R... | AD Connect is not using TLS 1.2; .NET Framework not configured for strong cry... | Add registry keys to force TLS 1.2: under HKLM\SOFTWARE\Microsoft\.NETFramewo... | 🟢 8.5 | ADO Wiki |
| 3 📋 | Unable to download 'User Registration details' report from Entra ID portal (Authentication method... | Portal download fails due to throttling when the tenant has a high number of ... | Use MS Graph PowerShell instead: (1) $RequiredScopes = @('Directory.AccessAsU... | 🟢 8.5 | ADO Wiki |
| 4 📋 | TAP sign-in fails for SSPR-enabled users who are redirected to SSPR registration interrupt flow | SSPR registration is required before accessing Security Info. FIDO2 and Phone... | User must first register SSPR-required authentication methods (e.g., email) b... | 🟢 8.5 | ADO Wiki |
| 5 📋 | TAP sign-in fails for SSPR-enabled users - redirected to SSPR interrupt flow but cannot register ... | SSPR requires users to register SSPR-compatible methods first. FIDO2 and Phon... | User must first register SSPR required methods (e.g., email) before going to ... | 🟢 8.5 | ADO Wiki |
| 6 📋 | User shows as SSPRCapable in User Registration Details but has no methods registered | Administrators are always SSPR capable regardless of registered methods, per ... | Check the users role assignments. Admins are always SSPR capable by design. | 🟢 8.5 | ADO Wiki |
| 7 📋 | User registered security questions but not detected as registered method for SSPR | Number of registered security questions less than NumberOfSecurityQuestionsTo... | Advise customer to register sufficient security questions per policy threshold. | 🟢 8.5 | ADO Wiki |
| 8 📋 | User has fewer MethodRegistered than required but is still detected as SSPR capable | Phone numbers from mobile, telephoneNumber, OfficeOnlyPhoneNumber count for S... | Check users mobile and telephoneNumber attributes. Remove unexpected N/A or E... | 🟢 8.5 | ADO Wiki |
| 9 📋 | userCredentialUsageDetails Graph API returns empty response with no data | API only returns SSPR usage data. If tenant has no SSPR activity, response is... | Verify SSPR activity in Audit logs. If activity exists but API empty, escalat... | 🟢 8.5 | ADO Wiki |
| 10 📋 | User stuck during MFA/SSPR combined registration - no methods available when Security Defaults en... | Conflict between Security Defaults (only allows Authenticator app) and MFA/au... | Re-adjust policy to allow mobile app notification/code, OR disable Security D... | 🟢 8.5 | ADO Wiki |
| 11 📋 | Cannot block registration of authenticator apps as software OATH tokens even after unchecking leg... | SSPR still has Mobile app code and/or Mobile app notification checked in Auth... | Also uncheck SSPR authentication method settings for Mobile app code/notifica... | 🟢 8.5 | ADO Wiki |
| 12 📋 | PTA user with expired password or Must change password on next logon flag cannot sign in to Azure... | Windows 10/11 AAD Authentication Client does not support the redirect for exp... | User must change password via browser-based authentication first. Alternative... | 🟢 8.5 | ADO Wiki |
| 13 📋 | PTA user with Must change password on next logon flag or expired password fails to sign in on Azu... | Windows 10 AAD Authentication Client does not support the password change red... | User must change password via browser instead of Windows login screen. Altern... | 🟢 8.5 | ADO Wiki |
| 14 📋 | In My Staff, rapidly adding, changing, or deleting a user phone number causes the phone number to... | Rapid sequential edits (add/change/delete) to phone numbers in My Staff cause... | Contact Microsoft support directly if phone number corruption is suspected. A... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Admin blocked from disabling auth methods in SSPR blade. Error: Number of methods chose is less t... | Migration state is Pre-migration, which respects legacy MFA/SSPR policies and... | Change migration state from Pre-migration to Migration in Progress (Security ... | 🟢 8.5 | ADO Wiki |
| 16 📋 | Users can still register authenticator apps as software OATH tokens even after disabling in legac... | SSPR still has Mobile app code/notification enabled. In Pre-migration state, ... | Disable Mobile app code and Mobile app notification in SSPR Authentication Me... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Legacy MFA (Per-user MFA Verification Options) and SSPR auth method policies can no longer be edi... | Microsoft retired editing of legacy MFA and SSPR policies starting Sep 30, 20... | Use Authentication Methods Policy (Entra ID > Authentication Methods > Polici... | 🟢 8.5 | ADO Wiki |
| 18 📋 | After migrating from legacy MFA to Voice Call authentication method policy, users with Office pho... | When Voice Call authentication method policy is enabled, the Office phone opt... | In Entra admin center, go to Authentication methods > Voice call policy > Con... | 🟢 8.5 | ADO Wiki |
| 19 📋 | Cloud Sync password writeback fails - agent connectivity issues or provisioning errors. Prerequis... | Cloud Sync agent requires TLS 1.2 enabled. TLS 1.3 only works on Windows Serv... | Enable TLS 1.2 using the PowerShell script from Microsoft docs (reference-con... | 🟢 8.5 | ADO Wiki |
| 20 📋 | Password writeback via Cloud Sync fails with ADUserNotFound error. SSPR cannot find the target us... | An OU in scope was renamed in Active Directory. The OnPremisesDistinguishedNa... | Update the user OnPremisesDistinguishedName to reflect the new OU path, or mo... | 🟢 8.5 | ADO Wiki |
| 21 📋 | Password reset via Cloud Sync fails with event ID 33001. Verbose logs show System.Runtime.Interop... | Cloud Sync password writeback uses DirectoryServices.AccountManagement.UserPr... | 1) Check gMSA permissions using Set-AADCloudSyncPermissions cmdlet. 2) Verify... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Password writeback via Cloud Sync fails with System.UnauthorizedAccessException: Access is denied... | A policy restricting remote calls to SAM (Security Account Manager) is blocki... | Review and modify the Network access: Restrict clients allowed to make remote... | 🟢 8.5 | ADO Wiki |
| 23 📋 | Cloud Sync password writeback fails with System.Security.Cryptography.CryptographicException: A c... | Cloud Sync gMSA service account cannot validate CRL/OCSP endpoints for the pa... | Allow Cloud Sync provisioning agent direct access (bypassing proxy) to: crl3.... | 🟢 8.5 | ADO Wiki |
| 24 📋 | Synced AD administrator (member of AD Protected Group) gets SSPR_0029 error when trying to reset ... | User is member of on-premises AD Protected Group (adminCount=1). SDProp backg... | Protected group admins cannot use Forgot Password flow to reset password via ... | 🟢 8.5 | ADO Wiki |
| 25 📋 | SSPR_0029 error for non-protected synced user. Event 6329 shows hr=80230626 'management agent cre... | The AD DS Connector account (MSOL_xxx) lacks necessary AD permissions (Reset ... | Grant proper AD permissions to the AD DS Connector account on the user OU: Re... | 🟢 8.5 | ADO Wiki |
| 26 📋 | SSPR_0029 error with Event 6329 showing 'Failed to acquire user information: Contoso\MSOL_xxx. Er... | The 'Network access: Restrict clients allowed to make remote calls to SAM' se... | Option A: Keep the policy but add the AD DS Connector account (MSOL_xxx) to t... | 🟢 8.5 | ADO Wiki |
| 27 📋 | SSPR_0029 error with Event 6329 showing hr=80005000 'unable to get error text' and Event 33001. U... | User AD Distinguished Name contains reserved LDAP characters (forward slash, ... | Remove the reserved character from user Distinguished Name in AD. Reserved ch... | 🟢 8.5 | ADO Wiki |
| 28 📋 | User with Azure AD Administrator role gets SSPR_009 error: 'Your organization has not turned on p... | SSPR for Administrators (SSPR-A) is not enabled on the tenant. SSPR-A and SSP... | Enable password writeback in SSPR: 1) Sign in to Entra admin center as Global... | 🟢 8.5 | ADO Wiki |
| 29 📋 | Password change/reset via SSPR fails with message: Unfortunately you cannot reset this user passw... | The new password provided does not comply with on-premises AD password policy... | Provide a compliant password. Check AD password policy via: 1) NET ACCOUNTS o... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Password writeback fails with Event 33009/6329: hr=8023062C 'The password could not be set becaus... | Sign and Encrypt LDAP Traffic is disabled in one or more of the three configu... | Enable Sign and Encrypt LDAP Traffic in all 3 locations: 1) Connectors > AD C... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Admin resets user password from Office Admin Portal (Microsoft 365 admin center). User can sign i... | Office Admin Portal does not use SSPR / Password Writeback libraries. Passwor... | Use Azure Portal instead of Office Admin Portal for password reset operations... | 🟢 8.5 | ADO Wiki |
| 32 📋 | Password reset/change fails with SSPR_0030 connectivity error. All connectivity tests from Connec... | When Cloud Sync configuration with password writeback was deleted, orphaned p... | Use ASC Graph Explorer to query: onPremisesPublishingProfiles/provisioning/pu... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Need to clean up previously synced password hashes from Azure AD after disabling Password Hash Sy... | PHS stores password hashes in Azure AD including the last 4 password history ... | 1) Disable Password Writeback in AAD Connect wizard (Optional features). 2) D... | 🟢 8.5 | ADO Wiki |
| 34 📋 | Password Writeback (SSPR) fails with error 407 Proxy Authentication Required - unable to reach ss... | Web proxy on the network requires user authentication for internet access. Wh... | Configure the web proxy to allow the AAD Connect server to access the interne... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Error 'Failed to Disable staging mode' when activating a new staging Entra Connect server. Log sh... | Password Writeback feature conflicts with the process of disabling staging mo... | 1) Cancel the Entra Connect wizard. 2) Re-launch wizard and uncheck Password ... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Admin can reset password from O365 admin portal but fails from Azure Portal with password policy ... | By design: Azure Portal password reset triggers password writeback (applies o... | This is by design. Educate customer: 1) Azure portal reset triggers writeback... | 🟢 8.0 | OneNote |
| 37 📋 | Reset Password link not showing on Windows 10/11 logon screen for SSPR | Multiple possible causes including registry/policy/connectivity issues | Run SSPR Win10 Logon Diagnostics script to identify specific cause. | 🔵 7.5 | ADO Wiki |
| 38 📋 | 自助密码重置时收到错误 "Your request could not be processed"，重试仍然失败 | 登记的电话号码不正确，系统无法联系到用户进行验证 | 联系管理员更新电话号码；如可用，尝试其他验证方式（手机/办公电话/移动应用） | 🔵 7.5 | MS Learn |
| 39 📋 | 自助密码重置时收到错误 "Oops! We encountered an unexpected error while contacting you" | 登记的电话号码不正确，系统无法联系到用户 | 联系管理员更新电话号码；尝试其他验证方式（手机/办公电话/移动应用） | 🔵 7.5 | MS Learn |
| 40 📋 | Entra Connect wizard error: Unable to configure password writeback. Ensure you have the required ... | Admin account lacks Entra ID P1/P2 license, server time out of sync, or TLS 1... | Enable TLS 1.2; use cloud-only admin with proper license (not federated); syn... | 🔵 7.5 | MS Learn |
| NEW 📋 | When SSPR enabled user tries to register at https://aka.ms/ssprsetup , it fails with an error &quot;... | Proof-up failure due to Proxy address conflict in Azure AD. | Correct the Proxy address for the account to resolve the conflict. | 🟢 8.0 | ContentIdea |
| ... | *25 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **sspr** related issues (14 entries) `[onenote]`
2. Check **password-writeback** related issues (3 entries) `[ado-wiki]`
3. Check **authentication-methods** related issues (3 entries) `[ado-wiki]`
4. Check **user-registration** related issues (3 entries) `[ado-wiki]`
5. Check **tap** related issues (2 entries) `[ado-wiki]`
6. Check **registration** related issues (2 entries) `[ado-wiki]`
7. Check **mfa** related issues (2 entries) `[ado-wiki]`
8. Check **pta** related issues (2 entries) `[ado-wiki]`
