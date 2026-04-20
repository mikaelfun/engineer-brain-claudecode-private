# ENTRA-ID Device Registration & Join — Quick Reference

**Entries**: 118 | **21V**: Partial (107/112)
**Last updated**: 2026-04-18
**Keywords**: device-registration, hybrid-join, prt, kerberos, azure-ad-join, conditional-access

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/device-registration.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Device registration fails due to device quota exceeded per user in tenant | User reached max device quota (default 20). Common in kiosk/shared computer s... | Delete stale devices or increase quota in Azure Portal > AD > Device Settings... | 🟢 9.5 | ADO Wiki |
| 2 📋 | Windows downlevel (7/8.1) Hybrid Azure AD Join fails - passive authentication via hidden browser ... | Downlevel Windows devices use hidden browser control for passive authenticati... | 1) Enable WIA at AD FS/STS for the intranet zone. 2) Add Azure AD and STS URL... | 🟢 9.5 | ADO Wiki |
| 3 📋 | AADSTS50097 Device is not authenticated on AADJ device logon - OAuth invalid_grant | ESTS cannot load device object from DPX; device disabled or removed from Azur... | Re-CDJ the device to Azure AD. Verify device object exists and is enabled in ... | 🟢 9.5 | ADO Wiki |
| 4 📋 | TPM NTE_* errors on AADJ device: NTE_BAD_KEYSET 0x80090016 / NTE_INTERNAL_ERROR 0x8009002D / NTE_... | CloudAP plugin fails to use device/NGC keys in TPM. TPM corruption or key sto... | Reset TPM and re-join device to AAD. 8009xxxx = Crypto/TPM error; escalate to... | 🟢 9.5 | ADO Wiki |
| 5 📋 | HAADJ device cannot get PRT after OS reimage. Device registration fails with error: The verificat... | After OS reimage, the device generates a new self-signed UserCertificate, but... | Wait ~30 minutes for AAD Connect to sync the new UserCertificate to AAD, then... | 🟢 9.0 | OneNote |
| 6 📋 | PRT cannot be retrieved on Win10 1703 (RS2) with Alternative Login ID and automatic device regist... | Product limitation in Win10 RS2: Cloud AP Plugin cannot handle Alternative Lo... | Upgrade to Win10 RS4 (1803) or later. Workaround: verify local AD UPN suffix ... | 🟢 9.0 | OneNote |
| 7 📋 | AADSTS50097 DeviceAuthenticationRequired error on Android | Conditional Access policy requires device authentication but device is not re... | Ensure device is registered with Azure AD and app uses broker auth (MSAL/ADAL... | 🟢 8.5 | ADO Wiki |
| 8 📋 | iOS only: WorkplaceJoin throws NSURLErrorDomain code -1003 (NSURLErrorCannotFindHost) or code -10... | TLS 1.3 feature flag was temporarily enabled (3/12/2025 - 3/19/2025 PDT) caus... | 1. Check Company Portal or Authenticator logs for the affected functions duri... | 🟢 8.5 | ADO Wiki |
| 9 📋 | MacOS device registration fails with Device Quota Reached or Directory Object Quota reached error... | User has too many registered devices exceeding tenant-specific or per-user de... | Remove unused registered devices from Azure AD portal, or contact ADRS team t... | 🟢 8.5 | ADO Wiki |
| 10 📋 | MacOS device shows as registered locally but gets 401 (device disabled) or 404 (device not found)... | Device registration records were deleted or disabled on server side (Azure AD... | Re-enroll the device through Intune Company Portal. For 401, client library r... | 🟢 8.5 | ADO Wiki |
| 11 📋 | Hybrid Azure AD Join occurs unexpectedly when GPO autoWorkplaceJoin is disabled due to GPO race c... | GPO race condition during refresh temporarily sets autoWorkplaceJoin=1 | Use controlled validation per MS docs. Fix in Win10 Build 19042.962 and CU fo... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Hybrid devices dont get PRT when off corporate network using user-authenticated VPN | Kerberos has no visibility to DC when VPN not connected | Unlock, enable VPN, lock/unlock to trigger network logon. Or use machine-auth... | 🟢 8.5 | ADO Wiki |
| 13 📋 | AADLoginForWindows VM extension fails with terminal error code 1007 / exit code -2145648574 (DSRE... | Extension cannot query Azure AD tenant info because system-assigned managed i... | Enable system-assigned managed identity on VM (Identity pane > System assigne... | 🟢 8.5 | ADO Wiki |
| 14 📋 | RDP to Azure VM fails with 'Your credentials did not work' when logging in with Azure AD account | Multiple causes: client not AAD/hybrid joined to same directory, registered P... | Ensure client AAD/hybrid joined to same directory. For registered PCs use Azu... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Windows 10 device shows dual state - both domain-joined and Azure AD registered simultaneously | Device was AAD registered before Hybrid Azure AD join was enabled | Win10 1809+: auto-resolved. Win10 1803: install KB4489894. Prevent with regis... | 🟢 8.5 | ADO Wiki |
| 16 📋 | NTE_BAD_KEYSET error on registered Windows 8.1 device - device suddenly loses access to WPJ certi... | TPM was reset/disabled or the system board containing the TPM was replaced, d... | Unregister the device and re-register it. There is no way to recover the TPM-... | 🟢 8.5 | ADO Wiki |
| 17 📋 | NTE_BAD_KEY_STATE error on Windows 7 device after user password reset - device cannot authenticat... | Known race condition in Windows 7 causes permanent loss of access to WPJ cert... | 1. Ensure device has line of sight to domain controller. 2. Run checkprivatek... | 🟢 8.5 | ADO Wiki |
| 18 📋 | Users on Windows 7 RDP VMs cannot do auto workplace join - silent WPJ stops working on new devices | User signing into multiple random VMs running Windows 7 causes multiple devic... | Clean up stale device records for the user in Azure AD portal to free up quot... | 🟢 8.5 | ADO Wiki |
| 19 📋 | Device registration incomplete — dsregcmd /status shows no PRT on Azure AD Joined or Hybrid Azure... | User authenticated with SmartCard or non-UPN credential which cannot trigger ... | 1) Ensure user signs in with UPN+password or WHfB (not SmartCard). 2) Reboot ... | 🟢 8.5 | ADO Wiki |
| 20 📋 | Azure AD Registered Windows device display name does not update in Azure AD after the hostname is... | AAD Registered devices do not auto-update display names post-registration unl... | Use PowerShell Set-EntraDevice or Graph API to manually update the display na... | 🟢 8.5 | ADO Wiki |
| 21 📋 | Hybrid Azure AD joined device display name not updating in Azure AD when device was joined via fe... | When using federation to perform Hybrid Azure AD join without Azure AD Connec... | Enable Azure AD Connect with device writeback/sync for Hybrid Azure AD joined... | 🟢 8.5 | ADO Wiki |
| 22 📋 | User unable to register new device with Azure AD, device registration fails due to quota limit | User has reached the maximum number of devices allowed per user configured in... | Remove unused/stale devices from Azure AD to free up quota, or increase the '... | 🟢 8.5 | ADO Wiki |
| 23 📋 | On Hybrid Azure AD Joined device, User2 inherits User1's Azure AD PRT when switching users in bro... | By design: the browser passes the device's Azure AD PRT on sign-in attempts; ... | No fix needed — this is expected behavior. PRT only provides device identity ... | 🟢 8.5 | ADO Wiki |
| 24 📋 | AADSTS5000611: Symmetric Key Derivation Function version '1' is invalid — users on unpatched Wind... | Windows devices missing the July 2021 security update (CVE-2021-33781) still ... | Apply Windows security updates (any cumulative update after July 2021 include... | 🟢 8.5 | ADO Wiki |
| 25 📋 | AADSTS5000611: Symmetric Key Derivation Function version '1' is invalid — user sign-in fails on W... | Windows device missing July 2021 security patch (CVE-2021-33781). ESTS is dep... | Apply latest Windows security updates to upgrade device from KDFv1 to KDFv2. ... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Chrome SSO fails with error -2147186936 (AAD_BROWSERCORE_E_ENTERPRISE_POLICY_NOT_ALLOWED) in cons... | Windows Information Protection (WIP/EDP) policy marks Chrome as not acceptabl... | Review and update WIP/EDP policies to allow Chrome. Follow guidance at http:/... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Hybrid Azure AD Join fails - domain-joined Windows devices not appearing in Azure AD portal due t... | SCP in Active Directory is configured with wrong value. For managed domains S... | 1) Verify SCP configuration in AD Sites and Services or via PowerShell. 2) Fo... | 🟢 8.5 | ADO Wiki |
| 28 📋 | Windows 10 Hybrid Azure AD Join fails in SYSTEM context - device cannot discover proxy or authent... | Hybrid Azure AD Join runs as SYSTEM, which cannot discover user-level proxy s... | 1) Configure WPAD (Web Proxy Auto-Discovery) so SYSTEM context can discover p... | 🟢 8.5 | ADO Wiki |
| 29 📋 | Hybrid Azure AD Join fails - domain-joined devices not appearing in Azure AD portal, SCP discover... | Service Connection Point (SCP) configured incorrectly for domain type. Manage... | For managed domains: SCP should point to contoso.onmicrosoft.com (requires Se... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Hybrid Azure AD Join fails with connectivity errors - device registration runs in SYSTEM context ... | Outbound proxy configured only for user context, not system/computer context.... | Use WPAD for automatic proxy discovery in system context, or deploy proxy set... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Windows 7/8.1 (down-level) automatic device registration fails - WIA authentication fails in hidd... | Required URLs not added to intranet zone, or Internet Explorer Enhanced Prote... | Add required federation/Azure AD URLs to IE intranet zone. For Seamless SSO, ... | 🟢 8.5 | ADO Wiki |
| 32 📋 | Device hangs after AADJ when workgroup name equals on-prem domain NetBIOS name | Windows conflicts between workgroup name and AD domain NetBIOS name during AADJ. | Rename device to a name different from the domain NetBIOS name before perform... | 🟢 8.5 | ADO Wiki |
| 33 📋 | 0xC00484B2 Device is not cloud domain joined - CloudAP plugin error in operational logs | CloudAP plugin cannot find AAD device certificate; registration failed or cer... | Re-join device to Azure AD to re-provision the AAD device certificate. | 🟢 8.5 | ADO Wiki |
| 34 📋 | DSREG_E_DEVICE_AUTHORIZATION_ERROR 0x801C0003 - user not authorized to enroll device | User lacks permission; Users may join devices to Azure AD setting is disabled... | Azure Portal > Devices > Device Settings: set Users may join devices to Azure... | 🟢 8.5 | ADO Wiki |
| 35 📋 | DSREG_E_DEVICE_REGISTRATION_QUOTA_EXCCEEDED 0x801C000E - device registration quota reached | User reached maximum device limit per user in Azure AD. | Unjoin other devices or increase device limit in Azure Portal > Devices > Dev... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Built-in administrator cannot complete Azure AD Join - clicking AADJ option does nothing | Built-in admin cannot launch modern apps required for AADJ flow (Windows limi... | Use a non-built-in admin account. Create local user, add to Administrators gr... | 🟢 8.5 | ADO Wiki |
| 37 📋 | PRT acquisition fails with STATUS_LOGON_FAILURE (0xc000006d) or STATUS_WRONG_PASSWORD (0xc000006a... | Device unable to connect to AAD authentication service, or received HTTP 400 ... | 1) Ensure computer account can discover and silently authenticate to outbound... | 🟢 8.5 | ADO Wiki |
| 38 📋 | PRT acquisition fails with AADSTS50155: Device authentication failed on Azure AD Joined or Hybrid... | AAD is unable to authenticate the device to issue a PRT. The device object ma... | 1) Confirm device has not been deleted or disabled in Azure portal (Devices b... | 🟢 8.5 | ADO Wiki |
| 39 📋 | PRT acquisition fails with AADSTS50126: Error validating credentials due to invalid username or p... | If tenant has Password Hash Sync enabled and device is Hybrid Joined, the new... | Wait for the AAD Connect sync cycle to complete (default 30 min) to acquire a... | 🟢 8.5 | ADO Wiki |
| 40 📋 | LAPS password not updated to Azure AD. Event ID 10059 with error Local admin password solution is... | LAPS feature not enabled in Azure AD tenant Device settings (disabled by defa... | Navigate to Azure AD > Devices > Device settings, toggle Enable Azure AD Loca... | 🟢 8.5 | ADO Wiki |
| NEW 📋 | HybridDevicesHealthChecker PowerShell script checks  the health status of hybrid Azure AD joined dev... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | This PowerShell script automates resolving Device  Registration Service Connection Point (SCP) creat... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | This article describes how to unjoin a Windows 10 computer that has been Microsoft Entra joined to a... | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | Are Hybrid Azure AD joined machines escrowing bitlocker recovery information to Azure AD or not | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | Hybrid Azure AD joined machines escrow bitlocker recovery information in Azure AD or not. | N/A | N/A | 🟡 6.5 | ContentIdea |
| NEW 📋 | Azure AD joined machines take approximately 3 hours  (=2.77 hours) to boot up the logon screen. The ... | When you logon with AzureAD account synced with on-premises AD, the domain infor... | Change the Work Group name of the client to a different name than the Domain Net... | 🟢 8.0 | ContentIdea |
| ... | *72 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **device-registration** related issues (10 entries) `[ado-wiki]`
2. Check **prt** related issues (4 entries) `[onenote]`
3. Check **device-quota** related issues (2 entries) `[ado-wiki]`
4. Check **azure-ad-join** related issues (2 entries) `[ado-wiki]`
5. Check **aadsts50097** related issues (2 entries) `[ado-wiki]`
6. Check **tpm** related issues (2 entries) `[ado-wiki]`
7. Check **nte_bad_keyset** related issues (2 entries) `[ado-wiki]`
8. Check **haadj** related issues (2 entries) `[onenote]`
