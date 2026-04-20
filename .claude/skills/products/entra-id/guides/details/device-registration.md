# ENTRA-ID Device Registration & Join — Detailed Troubleshooting Guide

**Entries**: 118 | **Drafts fused**: 13 | **Kusto queries**: 0
**Draft sources**: ado-wiki-b-device-registration-troubleshooting-windows-10-automatic-device-registration.md, ado-wiki-b-entra-hybrid-join-using-entra-kerberos.md, ado-wiki-d-device-registration-authentication-android.md, ado-wiki-device-registration-authentication-android.md, ado-wiki-device-registration-basic-knowledge.md, ado-wiki-device-registration-flowchart.md, ado-wiki-device-registration-troubleshooting-device-management.md, ado-wiki-entra-hybrid-join-using-entra-kerberos.md, ado-wiki-troubleshooting-win10-automatic-device-registration.md, ado-wiki-troubleshooting-windows7-automatic-device-registration.md
**Generated**: 2026-04-07

---

## Phase 1: Hybrid Join
> 19 related entries

### Hybrid Azure AD Join occurs unexpectedly when GPO autoWorkplaceJoin is disabled due to GPO race condition
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: GPO race condition during refresh temporarily sets autoWorkplaceJoin=1

**Solution**: Use controlled validation per MS docs. Fix in Win10 Build 19042.962 and CU for v2004/v1909/v1903/v1809

---

### Hybrid Entra ID Joined device shows Pending registration state in Entra ID portal; device cannot complete registration process
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device cannot connect to Azure AD device registration service endpoints or cannot reach on-premises AD domain controller to discover SCP object. Common causes: outbound proxy blocking, WPAD not configured, network filtering

**Solution**: Verify device can communicate with Microsoft registration endpoints (https://learn.microsoft.com/en-us/entra/identity/devices/how-to-hybrid-join#network-connectivity-requirements) under system account. For authenticated proxy, ensure machine context auth works. Implement WPAD or configure WinHTTP proxy via GPO (Windows 10 1709+). For managed environments, device creates UserCertificate for AAD Connect sync; for federated environments, device needs WIA with IDP.

---

### Hybrid Entra ID Joined device reverts to Pending state after being moved between OUs or after admin deletes/disables device in Entra ID; device thi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device was previously registered then removed from Entra ID. Causes: (1) OU moved out of sync scope then back - device fails re-registration, (2) admin deleted stale devices, (3) VDI golden image unjoin cascaded to all cloned devices via Device Recovery LeaveThenJoin

**Solution**: Run dsregcmd /leave from elevated CMD -> wait for device to disappear from Entra portal (or manually delete) -> reboot machine and sign in with DC line of sight -> for managed domains: run Start-ADSyncSyncCycle -PolicyType Delta in PowerShell then dsregcmd /join; for federated environments: run dsregcmd /join directly (no need to wait for sync cycle)

---

### Entra Hybrid Join using Entra Kerberos fails with DSREG_TOKEN_MISSING_ON_PREM_ID (0x801c0095) - token doesn't contain an on-premises ID
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Kerberos ticket from on-premises Kerberos authority doesn't contain information required by Microsoft Entra ID. EnableKerbHaadj.exe not run on Windows Server 2025 domain controllers.

**Solution**: On every domain controller running Windows Server 2025 within the AD domain, run EnableKerbHaadj.exe and restart the DC.

---

### Entra Hybrid Join using Entra Kerberos fails with SEC_E_NO_AUTHENTICATING_AUTHORITY (0x80090311) - no authority could be contacted for authentication
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: No functional domain controller running Windows Server 2025 can be contacted by the client device during hybrid join.

**Solution**: 1) Install at least one DC running Windows Server 2025 (build 26100.6905+) in the AD domain. 2) Run EnableKerbHaadj.exe on it and restart. 3) Ensure KDC service is running on this DC. 4) Run dcdiag.exe to verify DC is advertising itself. 5) Ensure client has unimpeded network connectivity to the WS2025 DC.

---

### Entra Hybrid Join using Entra Kerberos fails with SEC_E_LOGON_DENIED (0x8009030c) / KDC_ERR_NULL_KEY (0x9) - No KerberosKeyInformation Keys found
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Kerberos key for the Microsoft Entra device registration service principal (AppId 01cb2876-7ebd-4aa4-9cc9-d28bd4d359a9) is not found. The KerberosPolicy:ExchangeForJwt tag is missing from the DRS service principal.

**Solution**: Add the tag 'KerberosPolicy:ExchangeForJwt' to the DRS service principal using Entra PowerShell: Connect-Entra → Get-EntraServicePrincipal -Filter "AppId eq '01cb2876-7ebd-4aa4-9cc9-d28bd4d359a9'" → Add tag → Set-EntraServicePrincipal. Also ensure SPN 'adrs/enterpriseregistration.windows.net' is present.

---

### Slow logon (~21 seconds delay) on Hybrid Joined devices. Unjoining with dsregcmd /leave mitigates the issue. CloudAP plugin DoGetToken step causes ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device authentication fails during PRT acquisition. Device object was deleted from Entra ID (admin removed from sync scope, deleted from Azure portal intentionally or accidentally). CloudAP plugin retries 4 times with 3-second timeout each on first logon, totaling ~21 seconds delay. This is NOT a network timeout issue - device can reach login.microsoftonline.com but device auth itself fails.

**Solution**: 1) Gather auth trace and check AAD Operational log event ID 1250 for DoGetToken correlation ID and UTC timestamp. 2) Use ASC > Sign-ins > Diagnostics > Troubleshoot a sign-in with the correlation ID to confirm Device Authentication Failed. 3) Search audit logs (last 30 days, premium licensing required) with device name as target to identify who/what deleted the device. 4) If device should remain hybrid joined: run dsregcmd /leave then rejoin to fix registration state. 5) If intentionally removed

---

### Entra Hybrid Join using Entra Kerberos fails with error DSREG_TOKEN_MISSING_ON_PREM_ID (0x801c0095) - the token doesn't contain an on-premises ID
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Kerberos ticket from the on-premises Kerberos authority doesn't contain information required by Microsoft Entra ID; domain controllers running Windows Server 2025 have not been configured with EnableKerbHaadj.exe

**Solution**: On every domain controller that runs Windows Server 2025 within the Active Directory domain, run the tool EnableKerbHaadj.exe and restart the domain controller

---

### Entra Hybrid Join using Entra Kerberos fails with SEC_E_NO_AUTHENTICATING_AUTHORITY (0x80090311) - no authority could be contacted for authentication
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: No functional domain controller running Windows Server 2025 can be contacted in the Active Directory domain; KDC service may not be running or DC is not reachable by the client

**Solution**: Install at least one domain controller running Windows Server 2025 build 26100.6905 or later; run EnableKerbHaadj.exe and restart; ensure KDC service is running; run dcdiag.exe to confirm DC is advertising itself and reachable

---

### Entra Hybrid Join using Entra Kerberos fails with SEC_E_LOGON_DENIED (0x8009030c) / Kerberos event log KDC_ERR_NULL_KEY (0x9) - 'No KerberosKeyInfo...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Kerberos key for the Microsoft Entra Device Registration Service principal (AppId: 01cb2876-7ebd-4aa4-9cc9-d28bd4d359a9) has not been configured; the tag KerberosPolicy:ExchangeForJwt is missing from the service principal tags

**Solution**: Add the tag 'KerberosPolicy:ExchangeForJwt' to the ADRS service principal using Microsoft Entra PowerShell: connect with Application.ReadWrite.All scope, then Set-EntraServicePrincipal -ObjectId $drsSP.Id -Tags $tags (after appending the tag to existing tags list)

---

## Phase 2: Device Registration
> 14 related entries

### Device registration fails due to device quota exceeded per user in tenant
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: User reached max device quota (default 20). Common in kiosk/shared computer scenarios

**Solution**: Delete stale devices or increase quota in Azure Portal > AD > Device Settings. Quota does NOT apply to Win10 AD domain-joined auto-registered devices

---

### Windows 10 device shows dual state - both domain-joined and Azure AD registered simultaneously
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device was AAD registered before Hybrid Azure AD join was enabled

**Solution**: Win10 1809+: auto-resolved. Win10 1803: install KB4489894. Prevent with registry HKLM\SOFTWARE\Policies\Microsoft\Windows\WorkplaceJoin BlockAADWorkplaceJoin=dword:1

---

### NTE_BAD_KEYSET error on registered Windows 8.1 device - device suddenly loses access to WPJ certificate private key and cannot authenticate to Azur...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TPM was reset/disabled or the system board containing the TPM was replaced, destroying the private key stored in TPM.

**Solution**: Unregister the device and re-register it. There is no way to recover the TPM-backed private key after TPM reset.

---

### NTE_BAD_KEY_STATE error on Windows 7 device after user password reset - device cannot authenticate to Azure AD
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known race condition in Windows 7 causes permanent loss of access to WPJ certificate private key after password reset. Temporary condition may self-recover after regaining DC connectivity.

**Solution**: 1. Ensure device has line of sight to domain controller. 2. Run checkprivatekey tool as the affected user. 3. If output shows 'Failed to acquire private key. Exit code: 0x8009000b' → permanent condition confirmed. 4. Unregister and re-register the device.

---

### Users on Windows 7 RDP VMs cannot do auto workplace join - silent WPJ stops working on new devices
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User signing into multiple random VMs running Windows 7 causes multiple device registrations (one per VM per user), eventually exhausting the per-user device quota in Azure AD.

**Solution**: Clean up stale device records for the user in Azure AD portal to free up quota. Consider limiting auto workplace join to specific machines rather than shared RDP VMs.

---

### Azure AD Registered Windows device display name does not update in Azure AD after the hostname is changed on the device
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AAD Registered devices do not auto-update display names post-registration unless managed by an MDM authority that actively updates this property

**Solution**: Use PowerShell Set-EntraDevice or Graph API to manually update the display name, or enroll the device in MDM (e.g., Intune) which will own display name updates

---

### Hybrid Azure AD joined device display name not updating in Azure AD when device was joined via federation (not Azure AD Connect)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When using federation to perform Hybrid Azure AD join without Azure AD Connect device sync enabled, the display name is not synced from on-premises AD to Azure AD

**Solution**: Enable Azure AD Connect with device writeback/sync for Hybrid Azure AD joined devices. Azure AD Connect treats on-prem AD as the source of truth for display names. For Windows 1903+, AADJ devices will auto-update even without MDM.

---

### User unable to register new device with Azure AD, device registration fails due to quota limit
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User has reached the maximum number of devices allowed per user configured in Azure AD Device Settings

**Solution**: Remove unused/stale devices from Azure AD to free up quota, or increase the 'Maximum number of devices per user' setting in Azure AD > Devices > Device settings. Use ApproximateLastLogonTimestamp to identify stale devices for cleanup.

---

### Azure AD Portal 'Users may register their devices with Azure AD' setting is grayed out and cannot be disabled
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft Intune application (AppId 0000000a-0000-0000-c000-000000000000) is enabled in the tenant. When Intune is enabled, it takes control of device registration settings and grays out the portal toggle.

**Solution**: If not using Intune: disable Microsoft Intune Enterprise Application (AppId 0000000a-0000-0000-c000-000000000000) via Enterprise Applications UI. For Gov tenants where Enterprise Apps search may not work: use PowerShell: Connect-MgGraph -Scopes Application.ReadWrite.All → Get-MgServicePrincipalByAppId -AppId 0000000a-0000-0000-c000-000000000000 → Update-MgServicePrincipalByAppId -AppId 0000000a-0000-0000-c000-000000000000 -AccountEnabled $false

---

### Windows 10 'Add Work or School Account' MDM enrollment fails with 'Something went wrong' error but work account still appears added
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known behavior since RS2: MDM enrollment failure no longer prevents work account from being added. User sees error but account connection succeeds without MDM enrollment.

**Solution**: If admin requires MDM for resource access: user should click 'Connect' again and go through the process to re-enroll into MDM. Note: DeviceRegTroubleshooter tool (https://aka.ms/DSRegTool) performs 30+ tests to identify and fix common device registration issues for all join types.

---

## Phase 3: Prt
> 10 related entries

### PRT cannot be retrieved on Win10 1703 (RS2) with Alternative Login ID and automatic device registration; realm discovery returns account_type Unkno...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Product limitation in Win10 RS2: Cloud AP Plugin cannot handle Alternative Login ID, realm discovery fails because UPN suffix does not match verified domain

**Solution**: Upgrade to Win10 RS4 (1803) or later. Workaround: verify local AD UPN suffix (not feasible for most Alternative Login ID customers)

---

### Hybrid devices dont get PRT when off corporate network using user-authenticated VPN
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Kerberos has no visibility to DC when VPN not connected

**Solution**: Unlock, enable VPN, lock/unlock to trigger network logon. Or use machine-authenticated VPN

---

### Device registration incomplete — dsregcmd /status shows no PRT on Azure AD Joined or Hybrid Azure AD Joined device, user cannot get SSO
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User authenticated with SmartCard or non-UPN credential which cannot trigger PRT issuance; PRT requires UPN+password or Windows Hello for Business authentication

**Solution**: 1) Ensure user signs in with UPN+password or WHfB (not SmartCard). 2) Reboot machine twice with correct credentials. 3) If still failing: run dsregcmd /leave as admin, download PsExec, run psexec -i -s cmd.exe for machine context, then dsregcmd /debug to rejoin.

---

### On Hybrid Azure AD Joined device, User2 inherits User1's Azure AD PRT when switching users in browser, causing Conditional Access device compliance...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design: the browser passes the device's Azure AD PRT on sign-in attempts; PRT carries device identity (device ID) not user identity, so User2 does not impersonate User1

**Solution**: No fix needed — this is expected behavior. PRT only provides device identity claims. User2 authenticates with their own credentials; the shared PRT only satisfies device-based Conditional Access policies.

---

### AADSTS5000611: Symmetric Key Derivation Function version '1' is invalid — users on unpatched Windows devices fail to sign in to Entra ID using PRT
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows devices missing the July 2021 security update (CVE-2021-33781) still use the insecure KDFv1 algorithm for PRT key derivation. ESTS is progressively blocking KDFv1 authentications (100% block for non-allow-listed tenants completed Aug 2025).

**Solution**: Apply Windows security updates (any cumulative update after July 2021 includes the fix). Check CVE-2021-33781 for supported OS patch details. For large enterprises unable to patch immediately (>500 devices or >20% fleet), request temporary tenant allow-listing via ICM to Cloud Identity AuthN Client / Apple team OCE at Sev 2.5 with customer acknowledgment email.

---

### AADSTS5000611: Symmetric Key Derivation Function version '1' is invalid — user sign-in fails on Windows device
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows device missing July 2021 security patch (CVE-2021-33781). ESTS is deprecating KDFv1 algorithm in phased rollout, blocking unpatched devices from using PRT for authentication

**Solution**: Apply latest Windows security updates to upgrade device from KDFv1 to KDFv2. If immediate patching impossible (>500 devices or >20%), request temporary allow-list via ICM to 'Cloud Identity AuthN Client / Apple team OCE' with Sev 2.5. Lock/unlock desktop to retry (may land in allowed percentage during phased rollout).

---

### PRT acquisition fails with STATUS_LOGON_FAILURE (0xc000006d) or STATUS_WRONG_PASSWORD (0xc000006a) on Azure AD Joined or Hybrid Joined Windows device
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device unable to connect to AAD authentication service, or received HTTP 400 error from AAD auth service or WS-Trust endpoint. Outbound proxy may block computer account authentication.

**Solution**: 1) Ensure computer account can discover and silently authenticate to outbound proxy. 2) Check Events 1081/1088 in AAD Operational logs for server error code. 3) Check Event 1022 in AAD Analytic logs for the URL being accessed. 4) For federated auth, verify WS-Trust endpoint is reachable.

---

### PRT acquisition fails with AADSTS50155: Device authentication failed on Azure AD Joined or Hybrid Joined device
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AAD is unable to authenticate the device to issue a PRT. The device object may have been deleted or disabled in the Azure portal.

**Solution**: 1) Confirm device has not been deleted or disabled in Azure portal (Devices blade). 2) Re-register the device based on join type: for AADJ — re-join; for Hybrid AADJ — re-sync via Azure AD Connect or re-join domain. See Microsoft docs for device re-registration steps.

---

### PRT acquisition fails with AADSTS50126: Error validating credentials due to invalid username or password on Hybrid Joined device after password change
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: If tenant has Password Hash Sync enabled and device is Hybrid Joined, the new password may not have synced to AAD yet after a recent password change. AAD still validates against the old password hash.

**Solution**: Wait for the AAD Connect sync cycle to complete (default 30 min) to acquire a fresh PRT with the new credentials. Can force sync via Start-ADSyncSyncCycle -PolicyType Delta on the AAD Connect server.

---

### Cannot acquire PRT on Hybrid Azure AD Joined machine. AzureAdPrt=NO in dsregcmd /status. WHfB not working, Conditional Access failing, SSO not work...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TPM is locked out (dictionary attack protection) or in an unknown state, preventing access to TPM keys used to protect device keys for PRT acquisition.

**Solution**: Clear/reset the TPM: Windows Defender Security Center → Device security → Security processor details → Security processor troubleshooting → Clear TPM → Restart. Warning: clearing TPM may break BitLocker and other TPM-dependent services. Check BIOS settings for TPM lockout reset first. Engage hardware vendor if needed.

---

## Phase 4: Azure Ad Join
> 8 related entries

### AADSTS50097 Device is not authenticated on AADJ device logon - OAuth invalid_grant
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: ESTS cannot load device object from DPX; device disabled or removed from Azure AD directory.

**Solution**: Re-CDJ the device to Azure AD. Verify device object exists and is enabled in portal.

---

### TPM NTE_* errors on AADJ device: NTE_BAD_KEYSET 0x80090016 / NTE_INTERNAL_ERROR 0x8009002D / NTE_DEVICE_NOT_READY 0x80090030
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: CloudAP plugin fails to use device/NGC keys in TPM. TPM corruption or key storage failure.

**Solution**: Reset TPM and re-join device to AAD. 8009xxxx = Crypto/TPM error; escalate to Crypto team if persistent.

---

### Device hangs after AADJ when workgroup name equals on-prem domain NetBIOS name
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows conflicts between workgroup name and AD domain NetBIOS name during AADJ.

**Solution**: Rename device to a name different from the domain NetBIOS name before performing Azure AD Join.

---

### 0xC00484B2 Device is not cloud domain joined - CloudAP plugin error in operational logs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: CloudAP plugin cannot find AAD device certificate; registration failed or cert lost.

**Solution**: Re-join device to Azure AD to re-provision the AAD device certificate.

---

### DSREG_E_DEVICE_AUTHORIZATION_ERROR 0x801C0003 - user not authorized to enroll device
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User lacks permission; Users may join devices to Azure AD setting is disabled or restricted.

**Solution**: Azure Portal > Devices > Device Settings: set Users may join devices to Azure AD to All or add user to selected group.

---

### DSREG_E_DEVICE_REGISTRATION_QUOTA_EXCCEEDED 0x801C000E - device registration quota reached
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User reached maximum device limit per user in Azure AD.

**Solution**: Unjoin other devices or increase device limit in Azure Portal > Devices > Device Settings.

---

### Built-in administrator cannot complete Azure AD Join - clicking AADJ option does nothing
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Built-in admin cannot launch modern apps required for AADJ flow (Windows limitation since RS2).

**Solution**: Use a non-built-in admin account. Create local user, add to Administrators group.

---

### AADJ fails for Fairfax/Government tenant: Azure Government tenant blocked in Public cloud
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Government tenants do not have AADJ capability enabled by default; needs allow-listing.

**Solution**: Submit request in Teams Device Registration page to allow-list the Government tenant.

---

## Phase 5: Dsreg
> 6 related entries

### Device registration fails with DSREG_E_DEVICE_AUTHENTICATION_ERROR (0x801C0002 / -2145648638) - server failed to authenticate the user
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Token expired, environment mismatch (PPE token sent to PROD ADRS or vice versa), or bad/corrupt authentication token

**Solution**: Retry the operation. If persistent, check ADRS server logs using correlation ID and timestamp from dsreg admin log. Verify environment registry settings are correct (PPE vs PROD). Run dsregcmd /status to check device join state.

---

### Device registration fails with DSREG_E_DEVICE_AUTHORIZATION_ERROR (0x801C0003 / -2145648637) - user not authorized to enroll
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User does not have permission to perform the device join operation. Azure AD device settings may restrict who can join devices.

**Solution**: For Cloud Domain Join (CDJ): Check Azure portal > Users > Device settings > Users may join devices to Azure AD. Ensure the user has appropriate permissions or is in the allowed group.

---

### Device registration fails with DSREG_E_DEVICE_REGISTRATION_QUOTA_EXCEEDED (0x801C000E / -2145648626) - registration quota reached
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user has reached the maximum number of devices that can be registered/joined under their account in Azure AD

**Solution**: Unjoin or remove unused devices currently joined using the same account, then retry registration. Check Azure AD > Devices > Device settings for the maximum device limit per user.

---

### Hybrid Azure AD Join fails with DSREG_AUTOJOIN_ADCONFIG_READ_FAILED (0x801C001D / -2145648611) - failed to read DJ++ configurations from AD
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Either (1) misconfiguration with both AAD info (tenant name/ID) and on-prem DRS info set in AD, or (2) failed to read configuration from AD due to LDAP connectivity/configuration issues

**Solution**: Verify AD configuration - ensure only one configuration source (AAD or on-prem DRS) is set. Check LDAP connectivity. Review debug log for detailed error information.

---

### Device registration or NGC provisioning fails with DSREG_MFA_REQUIRED (0x801C0023 / -2145648605) - operation requires multi-factor authentication
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ADRS server does not find the MFA claim in the authentication token. MFA was not completed or the MFA claim was not included in the token.

**Solution**: Troubleshoot CloudAP or WAM plugin log. Ensure MFA is properly completed before device registration. Check Conditional Access policies that may require MFA for device registration.

---

### Operation fails with DSREG_E_DEVICE_NOT_FOUND (0x801C03F3 / -2145647629) - device object not found in Azure AD directory
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The device object was deleted from the Azure AD directory

**Solution**: Ask the customer to rejoin the device to Azure AD. Run dsregcmd /leave followed by dsregcmd /join or unjoin and rejoin through Settings > Accounts > Access work or school.

---

## Phase 6: Hybrid Aadj
> 5 related entries

### Windows downlevel (7/8.1) Hybrid Azure AD Join fails - passive authentication via hidden browser control fails due to WIA, Seamless SSO, or Interne...
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: Downlevel Windows devices use hidden browser control for passive authentication (WIA). Failure causes: 1) WIA not enabled at federation server, 2) Required Azure AD/STS URLs not in IE Intranet Zone, 3) MFA prompt or HRD page shown during auth, 4) Enhanced Protected Mode or Enhanced Security Configuration enabled in IE. For Seamless SSO: specific URLs missing from intranet zone or scripts not allowed to interact with status bar.

**Solution**: 1) Enable WIA at AD FS/STS for the intranet zone. 2) Add Azure AD and STS URLs to IE Local Intranet Zone. 3) For Seamless SSO: add specific URLs to intranet zone and enable 'Allow updates to status bar via script'. 4) Disable Enhanced Protected Mode and Enhanced Security Configuration in IE. 5) Ensure no MFA or HRD prompt is triggered during device registration flow.

---

### Hybrid Azure AD Join fails - domain-joined Windows devices not appearing in Azure AD portal due to Service Connection Point (SCP) misconfiguration ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SCP in Active Directory is configured with wrong value. For managed domains SCP must point to tenant.onmicrosoft.com; for federated domains SCP must point to the verified domain (contoso.com). Exception: federated + only Windows 10 + 3rd party STS + AAD Connect syncing computer objects → SCP can use onmicrosoft.com.

**Solution**: 1) Verify SCP configuration in AD Sites and Services or via PowerShell. 2) For managed domains: set SCP to 'contoso.onmicrosoft.com' and ensure Seamless SSO is configured if Windows 7 devices exist. 3) For federated domains: set SCP to 'contoso.com'. 4) Use AAD Connect wizard to configure SCP correctly.

---

### Windows 10 Hybrid Azure AD Join fails in SYSTEM context - device cannot discover proxy or authenticate through proxy because proxy settings are con...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Hybrid Azure AD Join runs as SYSTEM, which cannot discover user-level proxy settings. If outbound proxy requires authentication, computer accounts may not be able to authenticate. WPAD discovery or computer-scoped proxy GPO not configured.

**Solution**: 1) Configure WPAD (Web Proxy Auto-Discovery) so SYSTEM context can discover proxy. 2) Deploy proxy settings GPO to computer objects (not just users). 3) Ensure proxy supports computer account authentication (machine Kerberos/NTLM). 4) Add Azure AD device registration endpoints to proxy allowlist.

---

### Hybrid Azure AD Join fails - domain-joined devices not appearing in Azure AD portal, SCP discovery pointing to wrong endpoint
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Service Connection Point (SCP) configured incorrectly for domain type. Managed domains using federated SCP format or vice versa. For federated domains with only Win10+ and 3rd party STS with AAD Connect syncing computer objects, SCP can optionally use managed format.

**Solution**: For managed domains: SCP should point to contoso.onmicrosoft.com (requires Seamless SSO for Windows 7). For federated domains: SCP should point to contoso.com. Exception: federated domain with only Win10+, 3rd party STS and AAD Connect syncing computer objects can use onmicrosoft.com.

---

### Hybrid Azure AD Join fails with connectivity errors - device registration runs in SYSTEM context and cannot reach Azure AD endpoints through proxy
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Outbound proxy configured only for user context, not system/computer context. Hybrid AADJ registration runs in SYSTEM context which has different proxy settings. Proxy authentication may block computer accounts.

**Solution**: Use WPAD for automatic proxy discovery in system context, or deploy proxy settings GPO to computer accounts (not just users). Ensure computer accounts can authenticate at the proxy if proxy authentication is enabled.

---

## Phase 7: Bitlocker
> 5 related entries

### BitLocker Graph API query fails with BadRequest 400: 'Parameter (ocp-client-name) is required but missing from headers' or 'Parameter (ocp-client-v...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: BitLocker MS Graph API requires custom headers ocp-client-name and ocp-client-version in every request. These are Azure Device Registration Service headers used to track client identity.

**Solution**: Add both headers to the Graph API request: ocp-client-name and ocp-client-version. Any value will work. To find actual client values, enable browser dev tools > Network tab when viewing recovery key in Azure Portal, look for the request ending in $select=key and check Request Headers for ocp-client-* values.

---

### End user cannot perform self-service BitLocker recovery key retrieval from myaccount portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User is not the registered owner of the device, OR device is Hybrid Azure AD Joined (HAADJ) which does not support end-user self-service recovery.

**Solution**: If user is not registered owner: contact tenant administrator and provide the BitLocker Key ID. If device is HAADJ: user must contact tenant administrator. Admin can retrieve via Azure Portal (AAD > Devices > device > Show recovery key) or Graph API GET /BitLocker/recoveryKeys/{keyId}?$select=key.

---

### Administrator cannot view BitLocker recovery key in Azure AD Portal or via Graph API
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Administrator does not have one of the required roles: Global administrator, Cloud device administrator, Helpdesk administrator, Security reader, Security administrator, Intune service administrator, or registered owner.

**Solution**: Assign one of the required roles to the administrator. Minimum role: Cloud device administrator or Helpdesk administrator for key retrieval. Note: Feature is limited to Azure AD Joined Windows 10+ devices only.

---

### BitLocker recovery key was backed up to Entra ID but device object was deleted - cannot recover the key
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: BitLocker recovery key is linked to the device object in Entra ID. Unlike users or apps, device objects cannot be restored after deletion (no soft delete).

**Solution**: There is no way to recover the BitLocker key if the associated device object is deleted and the key was not backed up elsewhere. Advise customers to maintain secondary backup of recovery keys. For future prevention: use manage-bde -protectors -get c: to document keys before device deletion.

---

### BitLocker key backed up to wrong device entry on dual state device (both Entra Registered and Hybrid Joined exist)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device was registered to Entra ID prior to Hybrid Join. Entra Registered entry not removed, creating dual state. manage-bde may upload key to either HAADJ or WPJ entry unpredictably.

**Solution**: Remove the unused Workplace Joined (Entra Registered) object to resolve dual state. Always suggest customers clean up unused WPJ objects to avoid this scenario.

---

## Phase 8: Haadj
> 4 related entries

### HAADJ device cannot get PRT after OS reimage. Device registration fails with error: The verification of the signature failed. PRT not obtainable un...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: After OS reimage, the device generates a new self-signed UserCertificate, but AAD still has the old certificate. Device registration authentication fails because the certificate mismatch. AAD Connect default sync interval is 30 minutes, and registration task is only triggered by user logon or event 4096.

**Solution**: Wait ~30 minutes for AAD Connect to sync the new UserCertificate to AAD, then re-login to the device to trigger device registration task again. After successful device registration, re-login once more to obtain PRT. If AAD Connect Wizard is open in debug mode, sync will be paused - close it first.

---

### Unexpected Hybrid Azure AD Join occurs even when GPO 'Register domain joined computers as devices' is set to DISABLED
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: GPO race condition during GPO refresh temporarily changes autoWorkplaceJoin registry value to 1, triggering the Workplace Join Automatic-Device-Join scheduled task before it is set back to disabled

**Solution**: Follow controlled validation of hybrid Azure AD join documentation. Fix available in Windows 10 Build 19042.962 (20H2) and later (KB for v2004/v1909/v1903/v1809). Ensure customers apply cumulative update. Until patched, implement controlled validation per Microsoft docs.

---

### Hybrid Azure AD Joined (DJ++) devices do not get a PRT when VPN is not connected; users experience broken SSO after coming back online
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Hybrid devices off corporate network rely on user-authenticated VPN to reach DC. Kerberos has no visibility to DC without VPN, so PRT update is not scheduled after Windows logon.

**Solution**: Workaround: 1. Unlock device, 2. Enable VPN, 3. Lock and unlock again to trigger network logon and PRT update. Permanent fix: Use machine-authenticated VPN that stays active when users are not logged in.

---

### Dollar sign character in HAADJ device name causes Hybrid Azure AD Join issues
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Special character handling issue with dollar sign in device names

**Solution**: See MS TechCommunity blog on dollar sign in hybrid join device names

---

## Phase 9: Laps
> 4 related entries

### LAPS password not updated to Azure AD. Event ID 10059 with error Local admin password solution is not enabled for this tenant. Reset-LapsPassword f...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: LAPS feature not enabled in Azure AD tenant Device settings (disabled by default)

**Solution**: Navigate to Azure AD > Devices > Device settings, toggle Enable Azure AD Local Administrator Password Solution (LAPS) to Yes. Can also enable via Graph API PUT https://graph.microsoft.com/beta/policies/deviceRegistrationPolicy

---

### LAPS password update fails with HTTP 400 Event 10059: The device deviceId in tenantId could not be found
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device was removed or deleted from the Azure AD tenant

**Solution**: Check device registration status with dsregcmd /status. Re-register the device to Azure AD if needed.

---

### Windows LAPS Event ID 10025: Azure discovery failed. Machine cannot reach Azure AD endpoints for password backup.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD/Hybrid joined machine cannot connect to enterpriseregistration.windows.net for LAPS password backup to Entra ID.

**Solution**: Verify connectivity to Azure AD endpoints. Check firewall rules, proxy settings, and network connectivity.

---

### Event ID 10032 - LAPS fails to authenticate to Azure using device identity
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Device credential/certificate issue preventing authentication to Azure AD Device Registration Service

**Solution**: Check device registration status with dsregcmd /status. Verify device certificate is valid. Re-register device if certificate is expired or missing. Run Reset-LapsPassword -Verbose -Debug for details.

---

## Phase 10: Whfb
> 4 related entries

### Unable to acquire PRT on Hybrid Joined machine; WHfB/CA/SSO not working. Event 344 'Failed to access device key' and Event 1026 'TPM defending agai...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TPM locked out or in dictionary attack defense mode, preventing access to device keys for PRT

**Solution**: Clear/reset TPM: Windows Defender Security Center > Device Security > Security processor troubleshooting > Clear TPM. Check BIOS settings first. Warning: may break BitLocker.

---

### Cannot acquire PRT on Hybrid Azure AD Joined or AADJ machine - WHfB not working, CA failing, SSO broken. Event 344 'Failed to access the device key...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: TPM is in lockout/dictionary attack defense mode, preventing access to device keys used for PRT acquisition.

**Solution**: Clear/reset TPM: Windows Defender Security Center > Device security > Security processor details > Security processor troubleshooting > Clear TPM. Check BIOS for TPM lockout reset. WARNING: Clearing TPM may break BitLocker.

---

### Devices are both AAD Registered and Hybrid Azure AD Joined, causing nondeterministic Conditional Access evaluation
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AAD Registered + Hybrid Joined is an unsupported dual state. Hybrid join usually takes precedence but dual state can cause nondeterministic device evaluation.

**Solution**: Upgrade to Windows 10 v1803+ which auto-cleans the AAD registered state. Do not AAD Register devices that will be Hybrid Joined. If already in dual state, remove the AAD registration.

---

### Device registration failing for Windows Hello for Business deployment. Devices cannot authenticate to identity providers (Azure AD for cloud/hybrid...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Device registration is invalid or incomplete. Device may not be properly joined to Azure AD or the on-premises AD FS.

**Solution**: Verify device registration using dsregcmd /status. Check event logs under Application and Service Logs > Microsoft > Windows > User Device Registration. For Hybrid deployment, verify both AzureAdJoined and certificate trust chain. See Device registration/Troubleshooting Windows 10 Automatic Device Registration wiki for detailed steps.

---

## Phase 11: Conditional Access
> 3 related entries

### Customer wants to create a Conditional Access policy targeting only Azure AD Joined devices (not Hybrid Azure AD joined, not Intune compliant) but ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Feature not available by design. Simply having a device registered/joined is not considered a strong enough security control. PG confirmed no plans to introduce a standalone Azure AD Join device control in CA.

**Solution**: Use existing CA access controls: 'Require device to be marked as compliant' (requires Intune management) or 'Require Hybrid Azure AD joined'. There is no standalone Azure AD Joined device control. For Azure AD joined devices, Intune compliance is the recommended enforcement mechanism.

---

### After deleting a registered device from user account in Azure AD, user gets 'Something went wrong' error when trying to re-register the device via ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Stale state in Microsoft Authenticator and device registration cache after admin deletes the device record from Azure AD.

**Solution**: Close all applications completely. Re-launch the Office application - the device should register successfully on the second attempt.

---

### Custom Controls (e.g. Duo), Session controls, Client apps condition, and Device state condition do not work when CA policy uses Register or join de...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design - Register or join devices user action disables all Grant controls except Azure MFA and disables all Session controls, Client apps and Device state (Preview) conditions

**Solution**: Only Azure Multi-factor authentication Grant control is supported with Register or join devices user action. Use User risk, Sign-in risk, Device Platforms, or Time conditions instead of unsupported conditions

---

## Phase 12: Workplace Join
> 3 related entries

### Workplace Join fails with 'The maximum number of devices that can be joined to the workplace by the user has been reached' (Event ID 200)
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: User has registered the maximum number of devices allowed by the device quota (DRS or Entra ID Device Settings)

**Solution**: Delete unused devices for the user from Entra ID portal (Users > Devices > Delete Device), or increase the quota in Entra ID Device Settings (Maximum Number of devices per user). For on-prem AD FS: Set-ADFSDeviceRegistration -DevicesPerUser <value>

---

### Workplace Join fails with 'Confirm you are using the current sign-in info' or 'Can't connect to the service' when using Device Registration Services
**Score**: 🔵 5.5 | **Source**: MS Learn

**Root Cause**: Multiple possible causes: DNS misconfiguration (enterpriseregistration CNAME missing), Device Registration not enabled, AD FS/DRS service not running, certificate issues, or max device limit reached

**Solution**: Check Event Viewer for specific error codes (102/103/200), verify DNS with nslookup enterpriseregistration.domain.com, ensure Device Registration is enabled in Azure portal, verify AD FS and DRS services are running, update root certificates

---

### Workplace Join fails with Event ID 103 'Server returned http status 404' - user sees 'Confirm you are using the current sign-in info' error before ...
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Device Registration Service (DRS) endpoint is disabled/stopped, DNS records for EnterpriseRegistration are missing/misconfigured, or SSL certificate doesn't cover the domain suffix

**Solution**: 1) Verify DNS: nslookup enterpriseregistration.domain.com should return CNAME to EnterpriseRegistration.windows.net (AAD) or internal ADFS node. 2) Enable Device Registration in Azure portal > Microsoft Entra ID > Configure. 3) Check SSL cert bindings via 'netsh http show sslcert' - ensure IP port binding exists for the EnterpriseRegistration endpoint

---

## Phase 13: Macos
> 2 related entries

### MacOS device registration fails with Device Quota Reached or Directory Object Quota reached error during enrollment
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User has too many registered devices exceeding tenant-specific or per-user device registration limit in Azure AD

**Solution**: Remove unused registered devices from Azure AD portal, or contact ADRS team to increase tenant-specific device registration limit.

---

### MacOS device shows as registered locally but gets 401 (device disabled) or 404 (device not found) from ADRS during device authentication
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Device registration records were deleted or disabled on server side (Azure AD) while local WPJ keychain items remain valid

**Solution**: Re-enroll the device through Intune Company Portal. For 401, client library removes WPJ records from both DRS and local keychain. For 404, removes from local keychain only.

---

## Phase 14: Vm Extension
> 2 related entries

### AADLoginForWindows VM extension fails with terminal error code 1007 / exit code -2145648574 (DSREG_E_MSI_TENANTID_UNAVAILABLE)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Extension cannot query Azure AD tenant info because system-assigned managed identity (MSI) not enabled on VM, or IMDS endpoint unreachable

**Solution**: Enable system-assigned managed identity on VM (Identity pane > System assigned > On). Verify IMDS: curl -H Metadata:true http://169.254.169.254/metadata/identity/info?api-version=2018-02-01

---

### RDP to Azure VM fails with 'Your credentials did not work' when logging in with Azure AD account
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple causes: client not AAD/hybrid joined to same directory, registered PC without AzureAD\UPN format, extension uninstalled, PKU2U disabled, or temp password

**Solution**: Ensure client AAD/hybrid joined to same directory. For registered PCs use AzureAD\UPN. Verify extension installed. Enable PKU2U policy on both sides. Check for temp password

---

## Phase 15: Adfs
> 2 related entries

### Users cannot sign in to Azure AD Joined/Hybrid Joined Windows 10 devices from outside corporate network when ADFS MFA is configured. Error 0xC00484...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ADFS MFA policy (global or per-RPT) blocks Windows device sign-in because it uses non-interactive WS-Trust flow (user-agent: Windows-AzureAD-Authentication-Provider/1.0) which cannot present an MFA prompt.

**Solution**: For classic AdditionalAuthenticationRules: add exclusion NOT exists([Type=="http://schemas.microsoft.com/2012/01/requestcontext/claims/x-ms-client-user-agent", Value=="Windows-AzureAD-Authentication-Provider/1.0"]) before the MFA issuance rule. For Access Control Policies: configure exception for the user-agent AND add explicit PERMIT condition. Also verify AuthorizationRules do not require authnmethodsreferences for MFA without the same exclusion.

---

### Workplace Join, Device Registration, or Client Certificate Authentication fails when ADFS is behind a load balancer
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SSL Bridging on the load balancer interferes with these features which require end-to-end SSL passthrough

**Solution**: Use SSL Pass-through mode on load balancer for ADFS traffic when Workplace Join, Device Registration, or Client Certificate Authentication is required. SSL Bridging and SSL Termination/Offloading break these features.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Device registration fails due to device quota exceeded per user in tenant | User reached max device quota (default 20). Common in kio... | Delete stale devices or increase quota in Azure Portal > ... | 🟢 9.5 | ADO Wiki |
| 2 | Windows downlevel (7/8.1) Hybrid Azure AD Join fails - passive authentication... | Downlevel Windows devices use hidden browser control for ... | 1) Enable WIA at AD FS/STS for the intranet zone. 2) Add ... | 🟢 9.5 | ADO Wiki |
| 3 | AADSTS50097 Device is not authenticated on AADJ device logon - OAuth invalid_... | ESTS cannot load device object from DPX; device disabled ... | Re-CDJ the device to Azure AD. Verify device object exist... | 🟢 9.5 | ADO Wiki |
| 4 | TPM NTE_* errors on AADJ device: NTE_BAD_KEYSET 0x80090016 / NTE_INTERNAL_ERR... | CloudAP plugin fails to use device/NGC keys in TPM. TPM c... | Reset TPM and re-join device to AAD. 8009xxxx = Crypto/TP... | 🟢 9.5 | ADO Wiki |
| 5 | HAADJ device cannot get PRT after OS reimage. Device registration fails with ... | After OS reimage, the device generates a new self-signed ... | Wait ~30 minutes for AAD Connect to sync the new UserCert... | 🟢 9.0 | OneNote |
| 6 | PRT cannot be retrieved on Win10 1703 (RS2) with Alternative Login ID and aut... | Product limitation in Win10 RS2: Cloud AP Plugin cannot h... | Upgrade to Win10 RS4 (1803) or later. Workaround: verify ... | 🟢 9.0 | OneNote |
| 7 | AADSTS50097 DeviceAuthenticationRequired error on Android | Conditional Access policy requires device authentication ... | Ensure device is registered with Azure AD and app uses br... | 🟢 8.5 | ADO Wiki |
| 8 | iOS only: WorkplaceJoin throws NSURLErrorDomain code -1003 (NSURLErrorCannotF... | TLS 1.3 feature flag was temporarily enabled (3/12/2025 -... | 1. Check Company Portal or Authenticator logs for the aff... | 🟢 8.5 | ADO Wiki |
| 9 | MacOS device registration fails with Device Quota Reached or Directory Object... | User has too many registered devices exceeding tenant-spe... | Remove unused registered devices from Azure AD portal, or... | 🟢 8.5 | ADO Wiki |
| 10 | MacOS device shows as registered locally but gets 401 (device disabled) or 40... | Device registration records were deleted or disabled on s... | Re-enroll the device through Intune Company Portal. For 4... | 🟢 8.5 | ADO Wiki |
| 11 | Hybrid Azure AD Join occurs unexpectedly when GPO autoWorkplaceJoin is disabl... | GPO race condition during refresh temporarily sets autoWo... | Use controlled validation per MS docs. Fix in Win10 Build... | 🟢 8.5 | ADO Wiki |
| 12 | Hybrid devices dont get PRT when off corporate network using user-authenticat... | Kerberos has no visibility to DC when VPN not connected | Unlock, enable VPN, lock/unlock to trigger network logon.... | 🟢 8.5 | ADO Wiki |
| 13 | AADLoginForWindows VM extension fails with terminal error code 1007 / exit co... | Extension cannot query Azure AD tenant info because syste... | Enable system-assigned managed identity on VM (Identity p... | 🟢 8.5 | ADO Wiki |
| 14 | RDP to Azure VM fails with 'Your credentials did not work' when logging in wi... | Multiple causes: client not AAD/hybrid joined to same dir... | Ensure client AAD/hybrid joined to same directory. For re... | 🟢 8.5 | ADO Wiki |
| 15 | Windows 10 device shows dual state - both domain-joined and Azure AD register... | Device was AAD registered before Hybrid Azure AD join was... | Win10 1809+: auto-resolved. Win10 1803: install KB4489894... | 🟢 8.5 | ADO Wiki |
| 16 | NTE_BAD_KEYSET error on registered Windows 8.1 device - device suddenly loses... | TPM was reset/disabled or the system board containing the... | Unregister the device and re-register it. There is no way... | 🟢 8.5 | ADO Wiki |
| 17 | NTE_BAD_KEY_STATE error on Windows 7 device after user password reset - devic... | Known race condition in Windows 7 causes permanent loss o... | 1. Ensure device has line of sight to domain controller. ... | 🟢 8.5 | ADO Wiki |
| 18 | Users on Windows 7 RDP VMs cannot do auto workplace join - silent WPJ stops w... | User signing into multiple random VMs running Windows 7 c... | Clean up stale device records for the user in Azure AD po... | 🟢 8.5 | ADO Wiki |
| 19 | Device registration incomplete — dsregcmd /status shows no PRT on Azure AD Jo... | User authenticated with SmartCard or non-UPN credential w... | 1) Ensure user signs in with UPN+password or WHfB (not Sm... | 🟢 8.5 | ADO Wiki |
| 20 | Azure AD Registered Windows device display name does not update in Azure AD a... | AAD Registered devices do not auto-update display names p... | Use PowerShell Set-EntraDevice or Graph API to manually u... | 🟢 8.5 | ADO Wiki |
| 21 | Hybrid Azure AD joined device display name not updating in Azure AD when devi... | When using federation to perform Hybrid Azure AD join wit... | Enable Azure AD Connect with device writeback/sync for Hy... | 🟢 8.5 | ADO Wiki |
| 22 | User unable to register new device with Azure AD, device registration fails d... | User has reached the maximum number of devices allowed pe... | Remove unused/stale devices from Azure AD to free up quot... | 🟢 8.5 | ADO Wiki |
| 23 | On Hybrid Azure AD Joined device, User2 inherits User1's Azure AD PRT when sw... | By design: the browser passes the device's Azure AD PRT o... | No fix needed — this is expected behavior. PRT only provi... | 🟢 8.5 | ADO Wiki |
| 24 | AADSTS5000611: Symmetric Key Derivation Function version '1' is invalid — use... | Windows devices missing the July 2021 security update (CV... | Apply Windows security updates (any cumulative update aft... | 🟢 8.5 | ADO Wiki |
| 25 | AADSTS5000611: Symmetric Key Derivation Function version '1' is invalid — use... | Windows device missing July 2021 security patch (CVE-2021... | Apply latest Windows security updates to upgrade device f... | 🟢 8.5 | ADO Wiki |
| 26 | Chrome SSO fails with error -2147186936 (AAD_BROWSERCORE_E_ENTERPRISE_POLICY_... | Windows Information Protection (WIP/EDP) policy marks Chr... | Review and update WIP/EDP policies to allow Chrome. Follo... | 🟢 8.5 | ADO Wiki |
| 27 | Hybrid Azure AD Join fails - domain-joined Windows devices not appearing in A... | SCP in Active Directory is configured with wrong value. F... | 1) Verify SCP configuration in AD Sites and Services or v... | 🟢 8.5 | ADO Wiki |
| 28 | Windows 10 Hybrid Azure AD Join fails in SYSTEM context - device cannot disco... | Hybrid Azure AD Join runs as SYSTEM, which cannot discove... | 1) Configure WPAD (Web Proxy Auto-Discovery) so SYSTEM co... | 🟢 8.5 | ADO Wiki |
| 29 | Hybrid Azure AD Join fails - domain-joined devices not appearing in Azure AD ... | Service Connection Point (SCP) configured incorrectly for... | For managed domains: SCP should point to contoso.onmicros... | 🟢 8.5 | ADO Wiki |
| 30 | Hybrid Azure AD Join fails with connectivity errors - device registration run... | Outbound proxy configured only for user context, not syst... | Use WPAD for automatic proxy discovery in system context,... | 🟢 8.5 | ADO Wiki |


---

## Incremental Update (2026-04-18) - +6 entries from contentidea-kb

### HybridDevicesHealthChecker PowerShell script checks  the health status of hybrid Azure AD joined devices. This PowerShell  script performs various tes...
**Score**: 🟡 6.5 | **Source**: ContentIdea KB | **ID**: entra-id-3642

**Description**: HybridDevicesHealthChecker PowerShell script checks  the health status of hybrid Azure AD joined devices. This PowerShell  script performs various tests on selected devices and shows the result  on the Shell screen, grid view and generates  HTML report. Why is this script useful?  To check the hybri

> This entry contains description only, no explicit root cause/solution.


### This PowerShell script automates resolving Device  Registration Service Connection Point (SCP) creation and configuration  issues while configuring Hy...
**Score**: 🟡 6.5 | **Source**: ContentIdea KB | **ID**: entra-id-3643

**Description**: This PowerShell script automates resolving Device  Registration Service Connection Point (SCP) creation and configuration  issues while configuring Hybrid Azure Active Directory Joined devices.  The script verifies all needed prerequisites  to install SCP, installs the missing ones, then, it creates

> This entry contains description only, no explicit root cause/solution.


### This article describes how to unjoin a Windows 10 computer that has been Microsoft Entra joined to a Microsoft Entra tenant.  OOBE Setup in Windows 10...
**Score**: 🟡 6.5 | **Source**: ContentIdea KB | **ID**: entra-id-3657

**Description**: This article describes how to unjoin a Windows 10 computer that has been Microsoft Entra joined to a Microsoft Entra tenant.  OOBE Setup in Windows 10 Enterprise presents the user with two &quot;domain join&quot; options to choose from.      Join Azure AD   Choose this option if your organization us

> This entry contains description only, no explicit root cause/solution.


### Are Hybrid Azure AD joined machines escrowing bitlocker recovery information to Azure AD or not
**Score**: 🟡 6.5 | **Source**: ContentIdea KB | **ID**: entra-id-3666

**Description**: Are Hybrid Azure AD joined machines escrowing bitlocker recovery information to Azure AD or not

> This entry contains description only, no explicit root cause/solution.


### Hybrid Azure AD joined machines escrow bitlocker recovery information in Azure AD or not.
**Score**: 🟡 6.5 | **Source**: ContentIdea KB | **ID**: entra-id-3667

**Description**: Hybrid Azure AD joined machines escrow bitlocker recovery information in Azure AD or not.

> This entry contains description only, no explicit root cause/solution.


### Azure AD joined machines take approximately 3 hours  (=2.77 hours) to boot up the logon screen. The machine is not hung and you will see a black scree...
**Score**: 🟢 8.0 | **Source**: ContentIdea KB | **ID**: entra-id-3668

**Root Cause**: When you logon with AzureAD account synced with on-premises AD, the domain information of the on-premises AD is set to the client OS. If the on-premises Domain NetBIOS name and the Work Group name of the client are the same, the deadlock occurs after the rebooting client.

**Solution**: Change the Work Group name of the client to a different name than the Domain NetBIOS name of the on-premises AD. This bug will be fixed in the future release.

