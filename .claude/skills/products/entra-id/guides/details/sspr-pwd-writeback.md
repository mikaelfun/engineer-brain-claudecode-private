# ENTRA-ID SSPR & Password Writeback — Detailed Troubleshooting Guide

**Entries**: 66 | **Drafts fused**: 13 | **Kusto queries**: 0
**Draft sources**: ado-wiki-b-password-writeback-support-overview.md, ado-wiki-b-sspr-cloud-users.md, ado-wiki-b-sspr-hybrid-users.md, ado-wiki-b-sspr-security-questions-retirement.md, ado-wiki-c-password-writeback-support-overview.md, ado-wiki-c-troubleshooting-password-writeback.md, ado-wiki-d-password-writeback-sspr-cloud-sync.md, ado-wiki-f-password-writeback-not-working.md, ado-wiki-f-sspr-mfa-combined-registration.md, ado-wiki-f-sspr-reporting.md
**Generated**: 2026-04-07

---

## Phase 1: Sspr
> 22 related entries

### Self-Service Password Reset (SSPR) using OTP method fails in Mooncake. User sees error when attempting password reset with only OTP method registered.
**Score**: 🟢 8.5 | **Source**: OneNote

**Root Cause**: SSPR OTP method is not supported in Mooncake. Known feature gap tracked in ICM 650180669 and PG backlog 3316633. No ETA.

**Solution**: Inform customer SSPR OTP is not supported in Mooncake. Recommend alternative SSPR methods (e.g., mobile phone SMS). Track PG backlog 3316633.

---

### User shows as SSPRCapable in User Registration Details but has no methods registered
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Administrators are always SSPR capable regardless of registered methods, per administrator reset policy differences

**Solution**: Check the users role assignments. Admins are always SSPR capable by design.

---

### User registered security questions but not detected as registered method for SSPR
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Number of registered security questions less than NumberOfSecurityQuestionsToRegister in SSPR policy

**Solution**: Advise customer to register sufficient security questions per policy threshold.

---

### User has fewer MethodRegistered than required but is still detected as SSPR capable
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Phone numbers from mobile, telephoneNumber, OfficeOnlyPhoneNumber count for SSPR but not shown in methodRegistered. String values like N/A or Empty are not null and count as registered.

**Solution**: Check users mobile and telephoneNumber attributes. Remove unexpected N/A or Empty values if they should not count.

---

### userCredentialUsageDetails Graph API returns empty response with no data
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: API only returns SSPR usage data. If tenant has no SSPR activity, response is empty by design.

**Solution**: Verify SSPR activity in Audit logs. If activity exists but API empty, escalate IcM to IDX/Reporting and Audit Insights with TA approval.

---

### User stuck during MFA/SSPR combined registration - no methods available when Security Defaults enabled and admin disabled app notification/code in ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Conflict between Security Defaults (only allows Authenticator app) and MFA/authentication methods policy (disabled app notification/code). No registration methods remain.

**Solution**: Re-adjust policy to allow mobile app notification/code, OR disable Security Defaults. Notify ISPDefaultProtection@service.microsoft.com.

---

### Admin blocked from disabling auth methods in SSPR blade. Error: Number of methods chose is less than number of methods required to reset. Save butt...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Migration state is Pre-migration, which respects legacy MFA/SSPR policies and enforces strict method count validation in SSPR blade.

**Solution**: Change migration state from Pre-migration to Migration in Progress (Security > Authentication methods > Manage migration). After that, SSPR blade shows warning instead of blocking error.

---

### Users can still register authenticator apps as software OATH tokens even after disabling in legacy MFA settings (Notification through mobile app / ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SSPR still has Mobile app code/notification enabled. In Pre-migration state, legacy policies for both MFA and SSPR are respected independently.

**Solution**: Disable Mobile app code and Mobile app notification in SSPR Authentication Methods blade. If blocked by method count error, first change migration state to Migration in Progress.

---

### Reset Password link not showing on Windows 10/11 logon screen for SSPR
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Multiple possible causes including registry/policy/connectivity issues

**Solution**: Run SSPR Win10 Logon Diagnostics script to identify specific cause.

---

### 自助密码重置时收到错误 "Your request could not be processed"，重试仍然失败
**Score**: 🔵 7.5 | **Source**: MS Learn

**Root Cause**: 登记的电话号码不正确，系统无法联系到用户进行验证

**Solution**: 联系管理员更新电话号码；如可用，尝试其他验证方式（手机/办公电话/移动应用）

---

## Phase 2: Password Writeback
> 15 related entries

### Password change/reset via SSPR fails with message: Unfortunately you cannot reset this user password because your on-premises policy does not allow...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The new password provided does not comply with on-premises AD password policy (complexity, minimum length, minimum age, password history, or fine-grained password policy applied to user group).

**Solution**: Provide a compliant password. Check AD password policy via: 1) NET ACCOUNTS on DC, 2) Get-ADDefaultDomainPasswordPolicy PowerShell, 3) GPresult /H GPreport.htm. Check Fine-Grained Password Policies: Get-ADFineGrainedPasswordPolicy -Filter * and NET USER username /DOMAIN. Compare unicodePwd/pwdLastSet metadata across DCs with: repadmin /showobjmeta * DN to check for AD replication issues.

---

### Password writeback fails with Event 33009/6329: hr=8023062C 'The password could not be set because the server is not configured for insecure settin...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Sign and Encrypt LDAP Traffic is disabled in one or more of the three configuration locations in AADConnect Synchronization Service Manager AD Connector properties.

**Solution**: Enable Sign and Encrypt LDAP Traffic in all 3 locations: 1) Connectors > AD Connector > Properties > Connect to Active Directory Forest > Options. 2) Configure Directory Partitions > select partition > Options (DC connection settings). 3) Configure Directory Partitions > select partition > Set Credentials (if alternate credentials) > Options. Restart ADSync service after enabling all three.

---

### Admin resets user password from Office Admin Portal (Microsoft 365 admin center). User can sign in online with the new password, but the password i...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Office Admin Portal does not use SSPR / Password Writeback libraries. Password reset from Office Admin Portal only updates Azure AD password without triggering Password Writeback to on-premises AD. This is by design.

**Solution**: Use Azure Portal instead of Office Admin Portal for password reset operations that need Password Writeback. Distinguish the portal used via ASC > Tenant Explorer > Audit Logs: Reset password (by admin) = Azure Portal; Reset user password = Office Admin Portal. Note: Admin-initiated resets from PowerShell v1/v2 or Microsoft Graph API (except Graph beta) also do not trigger writeback.

---

### Password Writeback (SSPR) fails with error 407 Proxy Authentication Required - unable to reach ssprdedicatedsbprodncu.servicebus.windows.net on por...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Web proxy on the network requires user authentication for internet access. While logged-on users can authenticate seamlessly (domain-authenticated), the ADSync service cannot interact with proxy authentication prompts.

**Solution**: Configure the web proxy to allow the AAD Connect server to access the internet without authentication. The ADSync service account cannot handle proxy auth challenges. Ensure SSPR Service Bus endpoints are accessible without proxy auth.

---

### Entra Connect wizard error: Unable to configure password writeback. Ensure you have the required license
**Score**: 🔵 7.5 | **Source**: MS Learn

**Root Cause**: Admin account lacks Entra ID P1/P2 license, server time out of sync, or TLS 1.2 not enabled

**Solution**: Enable TLS 1.2; use cloud-only admin with proper license (not federated); sync server time. Check logs at %appdata%LocalAADConnect

---

### Password writeback fails with error code 8023062C when changing or resetting password in Entra ID; message says server not configured for insecure ...
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: Microsoft Entra Connect is configured without requiring LDAP traffic signing and encryption

**Solution**: Enable 'Sign and Encrypt LDAP Traffic' in Synchronization Service Manager in three places: AD Forest connection options, Directory Partition connection options, and Alternate Credentials options. Restart Azure AD Sync service afterwards

---

### Password not syncing from Entra ID to on-prem after change/reset; user sees request could not be processed
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: Writeback prerequisites not met, permissions wrong, reset agent not running, or network issue

**Solution**: Verify writeback prerequisites/permissions; ensure reset agent running; check connectivity; note M365 admin center resets do NOT support writeback

---

### Entra Connect wizard: Unable to configure password writeback. Ensure you have the required license
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: Admin account lacks Entra ID license, server time out of sync, or TLS 1.2 not enabled

**Solution**: Enable TLS 1.2; use cloud admin account with proper license; sync server time with authoritative time server

---

### Password change/reset fails. Application EventID 33009 and 6329 show error hr=8023062C: The password could not be set because the server is not con...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: AAD Connect has 'Sign and Encrypt LDAP Traffic' disabled in one or more of the three possible configuration locations in the Synchronization Service Manager.

**Solution**: Enable 'Sign and Encrypt LDAP Traffic' in all 3 locations in Synchronization Service Manager: 1. Connectors > AD Connector > Properties > Connect to Active Directory Forest > Options. 2. Connectors > AD Connector > Properties > Configure Directory Partitions > Select partition > Options (under DC connection settings). 3. Connectors > AD Connector > Properties > Configure Directory Partitions > Select partition > Set Credentials (if Alternate credentials) > Options. After enabling in all 3 locati

---

### Admin resets a user's password from Office Admin Portal (M365 admin center). User can sign in with the new password in the cloud, but the new passw...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The Office Admin Portal does not use SSPR / Password Writeback libraries. It resets the password only in Azure AD without triggering writeback to on-premises AD. This is by design.

**Solution**: Use Azure Portal (Entra admin center) instead of Office Admin Portal for password resets to ensure Password Writeback works. To verify which portal was used: check ASC > Tenant Explorer > Audit Logs. Activity 'Reset password (by admin)' = Azure Portal; Activity 'Reset user password' = Office Admin Portal.

---

## Phase 3: Cloud Sync
> 5 related entries

### Cloud Sync password writeback fails - agent connectivity issues or provisioning errors. Prerequisites check shows TLS 1.2 not enabled on the server...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Cloud Sync agent requires TLS 1.2 enabled. TLS 1.3 only works on Windows Server 2022 with .NET 4.8+. If TLS 1.2 is disabled or TLS 1.3 is misconfigured, agent cannot establish secure connection

**Solution**: Enable TLS 1.2 using the PowerShell script from Microsoft docs (reference-connect-tls-enforcement). For TLS 1.3, ensure Windows Server 2022 and .NET 4.8+. Also verify agent build 1.1.977.0 or greater is installed

---

### Password writeback via Cloud Sync fails with ADUserNotFound error. SSPR cannot find the target user in on-premises AD
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: An OU in scope was renamed in Active Directory. The OnPremisesDistinguishedName property of child objects does not get updated with the new DN. Cloud Sync SSPR uses the on-premises DN to find the user in AD, so the old DN fails to match

**Solution**: Update the user OnPremisesDistinguishedName to reflect the new OU path, or move and re-sync the affected users. Verify the DN used by SSPR matches the current AD structure after OU rename

---

### Password reset via Cloud Sync fails with event ID 33001. Verbose logs show System.Runtime.InteropServices.COMException (0x8007200A): The specified ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Cloud Sync password writeback uses DirectoryServices.AccountManagement.UserPrincipal.FindByIdentity method which requires read permissions on the built-in Users container at root domain level. If the gMSA account lacks these permissions, the method fails with COMException 0x8007200A

**Solution**: 1) Check gMSA permissions using Set-AADCloudSyncPermissions cmdlet. 2) Verify gMSA has at least read permissions on the built-in Users container at the Root Domain level. Grant permissions if missing

---

### Password writeback via Cloud Sync fails with System.UnauthorizedAccessException: Access is denied (HRESULT: 0x80070005 E_ACCESSDENIED) at SDSUtils....
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A policy restricting remote calls to SAM (Security Account Manager) is blocking the gMSA account from performing password reset operations on the target user, even though gMSA permissions appear correctly configured

**Solution**: Review and modify the Network access: Restrict clients allowed to make remote calls to SAM policy to allow the gMSA account. Follow the detailed steps in the ADO wiki article on Troubleshooting Password Writeback (SSPR_0029 - servers not allowed to make remote calls to SAM)

---

### Cloud Sync password writeback fails with System.Security.Cryptography.CryptographicException: A certificate chain could not be built to a trusted r...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Cloud Sync gMSA service account cannot validate CRL/OCSP endpoints for the password reset signing certificate. WinINet (used for HTTP proxy) is not supported for service accounts including gMSA, so even with proxy configured, gMSA cannot reach CRL URLs like oneocsp.microsoft.com, crl.microsoft.com, ocsp.digicert.com

**Solution**: Allow Cloud Sync provisioning agent direct access (bypassing proxy) to: crl3.digicert.com, crl4.digicert.com, ocsp.digicert.com, crl.microsoft.com, oneocsp.microsoft.com, ocsp.msocsp.com (port 80/HTTP), and ctldl.windowsupdate.com, www.microsoft.com/pkiops (port 443/HTTPS)

---

## Phase 4: Sspr 0029
> 4 related entries

### Synced AD administrator (member of AD Protected Group) gets SSPR_0029 error when trying to reset forgotten password via SSPR from cloud. Applicatio...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User is member of on-premises AD Protected Group (adminCount=1). SDProp background task overwrites AD permissions with AdminSDHolder settings every 60 minutes, removing Password Writeback MSOL account permission to reset password on protected accounts.

**Solution**: Protected group admins cannot use Forgot Password flow to reset password via SSPR+Password Writeback. They can only use Change Password (where current password is known). To enable reset: manually grant MSOL account Reset Password permission on user AD object (will be overwritten by SDProp unless AdminSDHolder is also modified). Check adminCount attribute on user object to confirm protected status.

---

### SSPR_0029 error for non-protected synced user. Event 6329 shows hr=80230626 'management agent credentials were denied access' with 'Access denied s...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The AD DS Connector account (MSOL_xxx) lacks necessary AD permissions (Reset Password, Write lockoutTime, Write pwdLastSet) on the target user OU or object in Active Directory.

**Solution**: Grant proper AD permissions to the AD DS Connector account on the user OU: Reset Password, Write lockoutTime, Write pwdLastSet. Use the AADConnect wizard Set AD DS Connector Account Permissions option, or manually configure via ADUC Security tab. Verify which MSOL account is in use by checking Synchronization Service Manager > Connectors > AD Connector Properties.

---

### SSPR_0029 error with Event 6329 showing 'Failed to acquire user information: Contoso\MSOL_xxx. Error Code: ERROR_ACCESS_DENIED' in admaexport.cpp(2...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The 'Network access: Restrict clients allowed to make remote calls to SAM' security policy is applied on the DC or AADConnect server, blocking the MSOL account from making remote SAM calls. Even after disabling the GPO, the RestrictRemoteSam registry value persists.

**Solution**: Option A: Keep the policy but add the AD DS Connector account (MSOL_xxx) to the allowed list. Option B: 1) Run GPupdate /force, 2) Verify policy is Not Defined via GPresult, 3) Manually delete registry: Remove-ItemProperty -Path HKLM:\System\CurrentControlSet\Control\Lsa -Name restrictremotesam. Important: Repeat on ALL Domain Controllers.

---

### SSPR_0029 error with Event 6329 showing hr=80005000 'unable to get error text' and Event 33001. User AD Distinguished Name contains reserved charac...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User AD Distinguished Name contains reserved LDAP characters (forward slash, comma, plus sign, backslash, angle brackets, etc.) which the new Password Writeback implementation cannot handle properly, causing ExportPasswordSet to fail with 0x80005000.

**Solution**: Remove the reserved character from user Distinguished Name in AD. Reserved characters: comma, plus sign, double quote, backslash, angle brackets, semicolon, LF, CR, equals sign, forward slash. Workaround (not recommended): Enable legacy implementation via registry HKLM\SYSTEM\CurrentControlSet\Services\ADSync\Parameters\PerMAInstance\domainName.com with PasswordChangeAccessCheckLegacy=dword:1. Warning: Legacy mode depends on NetUserGetInfo API prone to Access Denied on DCs.

---

## Phase 5: Aadc
> 3 related entries

### Admin can reset password from O365 admin portal but fails from Azure Portal with password policy violation. Password writeback applies on-prem pass...
**Score**: 🟢 8.0 | **Source**: OneNote

**Root Cause**: By design: Azure Portal password reset triggers password writeback (applies on-prem policy). O365 portal and PowerShell (Set-MsolUserPassword, Set-AzureADUserPassword) do NOT trigger writeback - they only apply cloud password policy.

**Solution**: This is by design. Educate customer: 1) Azure portal reset triggers writeback, on-prem policy applies. 2) O365 portal/PowerShell reset is cloud-only, cloud policy applies, password not written back. 3) End users can only trigger writeback via self-service password reset portal. 4) Using PowerShell may create 2 sets of passwords (cloud vs on-prem).

---

### Password writeback stops working. Users cannot reset passwords via self-service portal. Support code shown on password reset portal may not appear ...
**Score**: 🔵 7.0 | **Source**: OneNote

**Root Cause**: Internal bad state of password writeback configuration, proxy/connectivity issues, or unsupported OS.

**Solution**: 1) Get support code from password reset portal. 2) Search Application event log on AAD Connect server. 3) If not found, check prerequisites. 4) Reset writeback config:
$conn = Get-ADSyncConnector -name '<tenant>.onmicrosoft.com - AAD'
Set-ADSyncAADPasswordResetConfiguration -Connector $conn.Name -Enable $true
Get-ADSyncAADPasswordResetConfiguration -Connector $conn.Name
5) Check proxy/connectivity to Azure endpoints.

---

### Password writeback suddenly fails (was working before), Application event log shows 'make sure the target object is in scope of password sync rule'...
**Score**: 🔵 7.0 | **Source**: OneNote

**Root Cause**: Password writeback flows via sync rule 'Out to AAD - User Join' with 'Enable Password Sync' checked. If unchecked (even when Password Sync not enabled in AADC config), password writeback fails

**Solution**: In Synchronization Rules Editor, check 'Out to AAD - User Join' sync rule, ensure 'Enable Password Sync' is checked. Run Full Sync after. No need to reinstall AADC

---

## Phase 6: Authentication Methods
> 2 related entries

### Unable to download 'User Registration details' report from Entra ID portal (Authentication methods > User registration details blade)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Portal download fails due to throttling when the tenant has a high number of users — the portal report download endpoint hits rate limits for large datasets.

**Solution**: Use MS Graph PowerShell instead: (1) $RequiredScopes = @('Directory.AccessAsUser.All','Directory.ReadWrite.All','AuditLog.Read.All'); (2) Connect-MgGraph -Scopes $RequiredScopes; (3) Select-MgProfile -Name 'beta'; (4) Get-MgReportAuthenticationMethodUserRegistrationDetail -All | select UserPrincipalName,UserDisplayName,IsMfaCapable,IsPasswordlessCapable,IsSsprCapable,IsSsprRegistered,DefaultMfaMethod | Export-Csv -Path C:\output.csv

---

### Legacy MFA (Per-user MFA Verification Options) and SSPR auth method policies can no longer be edited in Entra ID portal after Sep 30, 2025.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft retired editing of legacy MFA and SSPR policies starting Sep 30, 2025. UX changes enforce migration to Authentication Methods Policy (AMP).

**Solution**: Use Authentication Methods Policy (Entra ID > Authentication Methods > Policies). Follow migration guide. Request exception (valid until Jan 2026) via support. Auto-migration planned for 2026.

---

## Phase 7: Tap
> 2 related entries

### TAP sign-in fails for SSPR-enabled users who are redirected to SSPR registration interrupt flow
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SSPR registration is required before accessing Security Info. FIDO2 and Phone sign-in are not supported SSPR authentication methods

**Solution**: User must first register SSPR-required authentication methods (e.g., email) before navigating to My Security Info to register passwordless credentials

---

### TAP sign-in fails for SSPR-enabled users - redirected to SSPR interrupt flow but cannot register FIDO2/phone sign-in for SSPR
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SSPR requires users to register SSPR-compatible methods first. FIDO2 and Phone sign-in are not SSPR authentication methods.

**Solution**: User must first register SSPR required methods (e.g., email) before going to My Security Info to register passwordless methods.

---

## Phase 8: Pta
> 2 related entries

### PTA user with expired password or Must change password on next logon flag cannot sign in to Azure AD joined (AADJ) device. Error: The sign-in metho...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows 10/11 AAD Authentication Client does not support the redirect for expired or temporary passwords to force password change for PTA customers on pure AADJ devices

**Solution**: User must change password via browser-based authentication first. Alternatively, if device is Hybrid Azure AD Joined (HAADJ), the Windows AD prompt to change password works correctly. Tracked by Windows 10 AAD Client Team (workitem 41197)

---

### PTA user with Must change password on next logon flag or expired password fails to sign in on Azure AD Joined (AADJ) device with error: The sign-in...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows 10 AAD Authentication Client does not support the password change redirect for PTA customers on AADJ devices

**Solution**: User must change password via browser instead of Windows login screen. Alternatively use Hybrid Azure AD Joined (HAADJ) device where the Windows AD prompt for password change works. Tracked by Windows 10 AAD Client Team workitem 411947

---

## Phase 9: Publisher Verification
> 1 related entries

### Publisher Verification error UnableToAddPublisher: A verified publisher cannot be added to this application
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft security risk assessment flagged the user or app/MPN account as risky (Identity Protection signals)

**Solution**: Have the user perform password reset via SSPR portal (https://aka.ms/sspr). Wait up to 24 hours for the risky user state to clear. Also check Identity Protection limitation where risky user blocked by policy may not appear in reports.

---

## Phase 10: Aad Connect
> 1 related entries

### Password writeback service down after previously working; unable to enable/reconfigure Password Reset Service in AD Connect wizard; Event ID 31034 ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AD Connect is not using TLS 1.2; .NET Framework not configured for strong cryptography; connection to ssprdedicatedsbprodncu.servicebus.windows.net is dropped because the client and server cannot agree on a common algorithm

**Solution**: Add registry keys to force TLS 1.2: under HKLM\SOFTWARE\Microsoft\.NETFramework\v2.0.50727 and v4.0.30319 set SystemDefaultTlsVersions=dword:1 and SchUseStrongCrypto=dword:1; then restart Microsoft Azure AD Sync Service and verify Password Writeback can be enabled

---

## Phase 11: Software Oath
> 1 related entries

### Cannot block registration of authenticator apps as software OATH tokens even after unchecking legacy MFA settings (Notification through mobile app ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SSPR still has Mobile app code and/or Mobile app notification checked in Authentication methods blade, and migration state is Pre-migration. Legacy policies for both MFA and SSPR control registration independently.

**Solution**: Also uncheck SSPR authentication method settings for Mobile app code/notification, or complete the migration from Pre-migration to Authentication Method Policies (set migration status to Complete).

---

## Phase 12: My Staff
> 1 related entries

### In My Staff, rapidly adding, changing, or deleting a user phone number causes the phone number to become corrupted in the backend. Even with correc...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Rapid sequential edits (add/change/delete) to phone numbers in My Staff cause backend data corruption due to race conditions in the credential management system.

**Solution**: Contact Microsoft support directly if phone number corruption is suspected. Avoid rapidly performing multiple sequential actions on a user phone number in My Staff.

---

## Phase 13: Mfa
> 1 related entries

### After migrating from legacy MFA to Voice Call authentication method policy, users with Office phone defined as an authentication method cannot see ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When Voice Call authentication method policy is enabled, the Office phone option must be separately enabled under the Configure tab. If not enabled, users with Office phone method on their user object will not see it during MFA.

**Solution**: In Entra admin center, go to Authentication methods > Voice call policy > Configure tab, enable the Office phone option. If tenant uses SSPR with Office phone enabled, enable Voice calls auth method policy with Office phone option enabled.

---

## Phase 14: Sspr 009
> 1 related entries

### User with Azure AD Administrator role gets SSPR_009 error: 'Your organization has not turned on password reset' when trying to reset password via S...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SSPR for Administrators (SSPR-A) is not enabled on the tenant. SSPR-A and SSPR for Users (SSPR-U) are separate configurations. Azure AD accounts with admin roles (Global Admin, Billing Admin, etc.) use SSPR-A which must be independently enabled.

**Solution**: Enable password writeback in SSPR: 1) Sign in to Entra admin center as Global Administrator. 2) Browse to Protection > Password reset > On-premises integration. 3) Check Write back passwords to your on-premises directory. 4) Optionally check Write back passwords with Microsoft Entra Connect cloud sync if provisioning agents detected. 5) Check Allow users to unlock accounts without resetting their password to Yes. 6) Save.

---

## Phase 15: Sspr 0030
> 1 related entries

### Password reset/change fails with SSPR_0030 connectivity error. All connectivity tests from Connect Sync pass successfully. Customer previously had ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When Cloud Sync configuration with password writeback was deleted, orphaned published resources remained in the tenant. These stale domain-specific published resources interfere with Connect Sync password writeback routing, causing connectivity failures.

**Solution**: Use ASC Graph Explorer to query: onPremisesPublishingProfiles/provisioning/publishedResources to find orphaned published resources. Remove stale published resources from the previous Cloud Sync configuration. Also verify standard connectivity requirements: servicebus endpoints (ssprdedicatedsbprodscu/ncu.servicebus.windows.net port 443), TLS 1.2 support, and required SSL certificates (DigiCert Global Root G2 and CA).

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Self-Service Password Reset (SSPR) using OTP method fails in Mooncake. User s... | SSPR OTP method is not supported in Mooncake. Known featu... | Inform customer SSPR OTP is not supported in Mooncake. Re... | 🟢 8.5 | OneNote |
| 2 | Password writeback service down after previously working; unable to enable/re... | AD Connect is not using TLS 1.2; .NET Framework not confi... | Add registry keys to force TLS 1.2: under HKLM\SOFTWARE\M... | 🟢 8.5 | ADO Wiki |
| 3 | Unable to download 'User Registration details' report from Entra ID portal (A... | Portal download fails due to throttling when the tenant h... | Use MS Graph PowerShell instead: (1) $RequiredScopes = @(... | 🟢 8.5 | ADO Wiki |
| 4 | TAP sign-in fails for SSPR-enabled users who are redirected to SSPR registrat... | SSPR registration is required before accessing Security I... | User must first register SSPR-required authentication met... | 🟢 8.5 | ADO Wiki |
| 5 | TAP sign-in fails for SSPR-enabled users - redirected to SSPR interrupt flow ... | SSPR requires users to register SSPR-compatible methods f... | User must first register SSPR required methods (e.g., ema... | 🟢 8.5 | ADO Wiki |
| 6 | User shows as SSPRCapable in User Registration Details but has no methods reg... | Administrators are always SSPR capable regardless of regi... | Check the users role assignments. Admins are always SSPR ... | 🟢 8.5 | ADO Wiki |
| 7 | User registered security questions but not detected as registered method for ... | Number of registered security questions less than NumberO... | Advise customer to register sufficient security questions... | 🟢 8.5 | ADO Wiki |
| 8 | User has fewer MethodRegistered than required but is still detected as SSPR c... | Phone numbers from mobile, telephoneNumber, OfficeOnlyPho... | Check users mobile and telephoneNumber attributes. Remove... | 🟢 8.5 | ADO Wiki |
| 9 | userCredentialUsageDetails Graph API returns empty response with no data | API only returns SSPR usage data. If tenant has no SSPR a... | Verify SSPR activity in Audit logs. If activity exists bu... | 🟢 8.5 | ADO Wiki |
| 10 | User stuck during MFA/SSPR combined registration - no methods available when ... | Conflict between Security Defaults (only allows Authentic... | Re-adjust policy to allow mobile app notification/code, O... | 🟢 8.5 | ADO Wiki |
| 11 | Cannot block registration of authenticator apps as software OATH tokens even ... | SSPR still has Mobile app code and/or Mobile app notifica... | Also uncheck SSPR authentication method settings for Mobi... | 🟢 8.5 | ADO Wiki |
| 12 | PTA user with expired password or Must change password on next logon flag can... | Windows 10/11 AAD Authentication Client does not support ... | User must change password via browser-based authenticatio... | 🟢 8.5 | ADO Wiki |
| 13 | PTA user with Must change password on next logon flag or expired password fai... | Windows 10 AAD Authentication Client does not support the... | User must change password via browser instead of Windows ... | 🟢 8.5 | ADO Wiki |
| 14 | In My Staff, rapidly adding, changing, or deleting a user phone number causes... | Rapid sequential edits (add/change/delete) to phone numbe... | Contact Microsoft support directly if phone number corrup... | 🟢 8.5 | ADO Wiki |
| 15 | Admin blocked from disabling auth methods in SSPR blade. Error: Number of met... | Migration state is Pre-migration, which respects legacy M... | Change migration state from Pre-migration to Migration in... | 🟢 8.5 | ADO Wiki |
| 16 | Users can still register authenticator apps as software OATH tokens even afte... | SSPR still has Mobile app code/notification enabled. In P... | Disable Mobile app code and Mobile app notification in SS... | 🟢 8.5 | ADO Wiki |
| 17 | Legacy MFA (Per-user MFA Verification Options) and SSPR auth method policies ... | Microsoft retired editing of legacy MFA and SSPR policies... | Use Authentication Methods Policy (Entra ID > Authenticat... | 🟢 8.5 | ADO Wiki |
| 18 | After migrating from legacy MFA to Voice Call authentication method policy, u... | When Voice Call authentication method policy is enabled, ... | In Entra admin center, go to Authentication methods > Voi... | 🟢 8.5 | ADO Wiki |
| 19 | Cloud Sync password writeback fails - agent connectivity issues or provisioni... | Cloud Sync agent requires TLS 1.2 enabled. TLS 1.3 only w... | Enable TLS 1.2 using the PowerShell script from Microsoft... | 🟢 8.5 | ADO Wiki |
| 20 | Password writeback via Cloud Sync fails with ADUserNotFound error. SSPR canno... | An OU in scope was renamed in Active Directory. The OnPre... | Update the user OnPremisesDistinguishedName to reflect th... | 🟢 8.5 | ADO Wiki |
| 21 | Password reset via Cloud Sync fails with event ID 33001. Verbose logs show Sy... | Cloud Sync password writeback uses DirectoryServices.Acco... | 1) Check gMSA permissions using Set-AADCloudSyncPermissio... | 🟢 8.5 | ADO Wiki |
| 22 | Password writeback via Cloud Sync fails with System.UnauthorizedAccessExcepti... | A policy restricting remote calls to SAM (Security Accoun... | Review and modify the Network access: Restrict clients al... | 🟢 8.5 | ADO Wiki |
| 23 | Cloud Sync password writeback fails with System.Security.Cryptography.Cryptog... | Cloud Sync gMSA service account cannot validate CRL/OCSP ... | Allow Cloud Sync provisioning agent direct access (bypass... | 🟢 8.5 | ADO Wiki |
| 24 | Synced AD administrator (member of AD Protected Group) gets SSPR_0029 error w... | User is member of on-premises AD Protected Group (adminCo... | Protected group admins cannot use Forgot Password flow to... | 🟢 8.5 | ADO Wiki |
| 25 | SSPR_0029 error for non-protected synced user. Event 6329 shows hr=80230626 '... | The AD DS Connector account (MSOL_xxx) lacks necessary AD... | Grant proper AD permissions to the AD DS Connector accoun... | 🟢 8.5 | ADO Wiki |
| 26 | SSPR_0029 error with Event 6329 showing 'Failed to acquire user information: ... | The 'Network access: Restrict clients allowed to make rem... | Option A: Keep the policy but add the AD DS Connector acc... | 🟢 8.5 | ADO Wiki |
| 27 | SSPR_0029 error with Event 6329 showing hr=80005000 'unable to get error text... | User AD Distinguished Name contains reserved LDAP charact... | Remove the reserved character from user Distinguished Nam... | 🟢 8.5 | ADO Wiki |
| 28 | User with Azure AD Administrator role gets SSPR_009 error: 'Your organization... | SSPR for Administrators (SSPR-A) is not enabled on the te... | Enable password writeback in SSPR: 1) Sign in to Entra ad... | 🟢 8.5 | ADO Wiki |
| 29 | Password change/reset via SSPR fails with message: Unfortunately you cannot r... | The new password provided does not comply with on-premise... | Provide a compliant password. Check AD password policy vi... | 🟢 8.5 | ADO Wiki |
| 30 | Password writeback fails with Event 33009/6329: hr=8023062C 'The password cou... | Sign and Encrypt LDAP Traffic is disabled in one or more ... | Enable Sign and Encrypt LDAP Traffic in all 3 locations: ... | 🟢 8.5 | ADO Wiki |


---

## Incremental Update (2026-04-18) - +1 entries from contentidea-kb

### When SSPR enabled user tries to register at https://aka.ms/ssprsetup , it fails with an error &quot;Oops! We encountered an unexpected error while sav...
**Score**: 🟢 8.0 | **Source**: ContentIdea KB | **ID**: entra-id-3672

**Root Cause**: Proof-up failure due to Proxy address conflict in Azure AD.

**Solution**: Correct the Proxy address for the account to resolve the conflict.

