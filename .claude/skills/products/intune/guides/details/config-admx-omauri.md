# INTUNE ADMX / OMA-URI / Settings Catalog — 已知问题详情

**条目数**: 81 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Intune Device Restriction policy for password complexity (DeviceLock/MinDevicePasswordComplexCharacters) reports 'Error' status on Windows 10 deskt...
**Solution**: Change password complexity setting to a supported value (1, 2, or 3) for Windows desktop devices. Value 4 is only supported on mobile. Use Windows LAPS if customer needs to manage local admin passwords. Kusto: DeviceManagementProvider with EventId 5786 to check policy compliance status. Reference IcMs: 163176114, 160587823.
`[Source: onenote, Score: 9.5]`

### Step 2: Custom OMA-URI device configuration policies may stop working or show unexpected behavior after Intune migrates Windows policies to unified setting...
**Solution**: Check if the custom OMA-URI setting is already available in Settings Catalog. If yes, migrate to Settings Catalog policy and remove the custom policy. Reference: Microsoft Tech Community blog 'Support tip: Windows device configuration policies migrating to unified settings platform in Intune' (article ID 4189665).
`[Source: onenote, Score: 9.5]`

### Step 3: Need to restrict which users can log on locally to Windows devices managed by Intune; want to block domain users from using Ctrl+Alt+Del to sign in...
**Solution**: Create Intune custom profile: OMA-URI: ./Device/Vendor/MSFT/Policy/Config/UserRights/AllowLocalLogOn. For specific user: Value = 'AzureAD\user@domain.com'. For SID-based: Value = '<![CDATA[*S-1-5-113]]>' (local accounts only). Must use CDATA tag for UserRights policies. Multiple entries separated by &#xF000; delimiter.
`[Source: onenote, Score: 9.5]`

### Step 4: Need to restrict domain user local logon on Intune-managed Windows 10 AADJ device. Want to allow only specific AAD users/groups to log on locally.
**Solution**: Create custom profile: OMA-URI ./Device/Vendor/MSFT/Policy/Config/UserRights/AllowLocalLogOn, Data Type String, use CDATA tag with SIDs (e.g. *S-1-5-113 for local accounts). For AAD groups: use LocalUsersAndGroups CSP to add AAD group SID to built-in group (Remote Desktop Users S-1-5-32-555), then allow that group via AllowLocalLogOn. Use 0xF000 as delimiter for multiple entries.
`[Source: onenote, Score: 9.5]`

### Step 5: After applying AllowLocalLogOn CSP via Intune custom profile, unassigning or setting policy to Not Configured does NOT revert the setting. Users re...
**Solution**: Must manually fix on device with local admin: Open gpedit.msc -> Allow log on locally -> remove Intune-deployed values -> restore original values. Cannot be remediated remotely via policy unassignment alone.
`[Source: onenote, Score: 9.5]`

### Step 6: Windows Device Configuration policy 显示 error (Remediation Failed) 但设备实际行为符合预期，设置已确认在 MDMDiagReport 和 Registry 中
**Solution**: 确认 CSP 文档中是否支持 Add/Get/Replace/Delete 操作。如果 CSP 不支持 Get 操作（如 Account CSP），设置会报 failed 但实际已生效，属于预期行为。参考: https://learn.microsoft.com/en-us/windows/client-management/mdm/configuration-service-provider-reference
`[Source: ado-wiki, Score: 9.0]`

### Step 7: macOS custom profile (DLP/TCC payload) fails with error 'The profile must be a system profile. User profiles are not supported' in syslog_intune.lo...
**Solution**: Reassign the custom configuration profile to a device group instead of a user group. TCC/Privacy Preferences, DLP, and similar payloads must be delivered as system profiles (device-scoped assignment).
`[Source: ado-wiki, Score: 9.0]`

### Step 8: Security baseline shows 'Error' status; setting fails to apply due to scope or applicability issue
**Solution**: 1) Check error code in Intune portal for explanation. 2) Review CSP pre-requirements for each failing setting. 3) Verify device OS version supports the setting. KB: https://internal.evergreen.microsoft.com/en-us/topic/47625e81-41a4-d0d2-6fa2-93e0adbd3d59
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intune Device Restriction policy for password complexity (DeviceLock/MinDevic... | Password complexity value 4 ('Digits, lowercase letters, uppercase letters, a... | Change password complexity setting to a supported value (1, 2, or 3) for Wind... | 9.5 | onenote |
| 2 | Custom OMA-URI device configuration policies may stop working or show unexpec... | Microsoft is migrating Windows device configuration policies to unified setti... | Check if the custom OMA-URI setting is already available in Settings Catalog.... | 9.5 | onenote |
| 3 | Need to restrict which users can log on locally to Windows devices managed by... | Windows allows any valid credential holder to log on locally by default. Intu... | Create Intune custom profile: OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Use... | 9.5 | onenote |
| 4 | Need to restrict domain user local logon on Intune-managed Windows 10 AADJ de... | No built-in Intune UI for AllowLocalLogOn user rights assignment. Must use cu... | Create custom profile: OMA-URI ./Device/Vendor/MSFT/Policy/Config/UserRights/... | 9.5 | onenote |
| 5 | After applying AllowLocalLogOn CSP via Intune custom profile, unassigning or ... | Windows design limitation - AllowLocalLogOn CSP is a tattooed policy that per... | Must manually fix on device with local admin: Open gpedit.msc -> Allow log on... | 9.5 | onenote |
| 6 | Windows Device Configuration policy 显示 error (Remediation Failed) 但设备实际行为符合预期... | CSP 不支持 Get 操作。Intune 下发 Add/Replace 操作后，通过 Get 操作验证值，如果 Get 返回值与下发值不匹配或 CSP ... | 确认 CSP 文档中是否支持 Add/Get/Replace/Delete 操作。如果 CSP 不支持 Get 操作（如 Account CSP），设置会... | 9.0 | ado-wiki |
| 7 | macOS custom profile (DLP/TCC payload) fails with error 'The profile must be ... | Profile was deployed to a user group instead of a device group. TCC and certa... | Reassign the custom configuration profile to a device group instead of a user... | 9.0 | ado-wiki |
| 8 | Security baseline shows 'Error' status; setting fails to apply due to scope o... | Setting either assigned to wrong scope (user vs device) or device does not su... | 1) Check error code in Intune portal for explanation. 2) Review CSP pre-requi... | 9.0 | ado-wiki |
| 9 | Security baseline profile shows 'Error' status — security setting failed to a... | Typically related to scope (wrong assignment to user vs device group) or appl... | 1) Review CSP pre-requirements for each security setting 2) Check if device s... | 9.0 | ado-wiki |
| 10 | TargetReleaseVersion CSP and Feature Update policy behave differently for con... | TargetReleaseVersion CSP is client-side control; Feature Update policy is ser... | Use TargetReleaseVersion CSP (OMA-URI ./Vendor/MSFT/Policy/Config/Update/Targ... | 8.5 | onenote |
| 11 | Custom VPN profile (OMA-URI) reports 2016281112 Remediation Failed in Intune ... | Win10 response XML differs from policy XML; Intune interprets mismatch as fai... | Ignore error or use standard VPN profile instead of custom OMA-URI. | 8.0 | mslearn |
| 12 | ADMX-backed custom OMA-URI policy deployed via Intune shows 'Not applicable' ... | Certain Policy CSPs (e.g., AppVirtualization) used in ADMX-backed policies ar... | Verify CSP edition support at docs.microsoft.com/windows/client-management/md... | 7.5 | onenote |
| 13 | Issue:  Windows 10 Enterprise Mobile devices are assigned the CSP Policies as... | The CSP is being ignored and is currently BUG: Bug 11941212 | Currently there is no work around for this issue, and the BUG is being worked... | 7.5 | contentidea-kb |
| 14 | (no symptom) | Customers are wanting to deploy their Commercial ID (from Microsoft Operation... | Prereqs:  �         Azure AD Premium  �         Microsoft Operations Manageme... | 7.5 | contentidea-kb |
| 15 | Customers are wanting to deploy their Commercial ID (from Microsoft Operation... | Prereqs:  �&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Azure AD Premium�&nbsp;&nbsp;... | Solution:Section 1: Microsoft Operations Management Suite (OMS) Configuration... | 7.5 | contentidea-kb |
| 16 | Onboarding Windows Defender ATP with Microsoft Intune - guide for OMA-URI set... |  |  | 7.5 | contentidea-kb |
| 17 | OMA-URI ./Vendor/MSFT/Policy/Config/Start/HideAppList policy is not applying ... | This is a client side bug fixed in Windows 10 RS3. | Upgrade to Windows 10 RS3. ICM 43249767. | 7.5 | contentidea-kb |
| 18 | After creating a Windows 10 configuration profile and supplying the URL to an... | This can occur if SetEduPolicies is not set to TRUE. Managing the desktop ima... | To resolve this prob lem complete the following:1. Login to portal.azure.com.... | 7.5 | contentidea-kb |
| 19 | �         The �Windows Defender Security Center� is showing unexpected result... | The �Enable user access to Windows Defender� is not working correctly. Settin... | The workaround, until a fix is implemented to resolve the CSP being set incor... | 7.5 | contentidea-kb |
| 20 | After creating and assigning a Device Configuration profile that defines a cu... | This occurs because in certain scenarios, the response sent by the Windows 10... | You can ignore this error as the connection does work as expected. Alternativ... | 7.5 | contentidea-kb |
| 21 | Cannot apply Windows 10 Custom Setting to set IE DisableHomePageChange via OM... | Quotation marks in the policy value XML string are not in UTF-8 unicode (smar... | Edit the OMA-URI and modify its string value ensuring standard UTF-8 quotatio... | 7.5 | contentidea-kb |
| 22 | OneDrive KFM (Known Folder Move) allows you to redirect common Windows folder... | Protect Critical Data With OneDrive & Known Folder Move (KFM)https://blogs.te... | To setup OneDrive for Business KFM, you will need to perform the following ac... | 7.5 | contentidea-kb |
| 23 | If the customer is trying to use machine certificates for a VPN profile inste... |  |  | 7.5 | contentidea-kb |
| 24 | For an Azure AD joined or Hybrid Azure AD joined device, every time a user si... |  |  | 7.5 | contentidea-kb |
| 25 | When deploying VPNv2 CSP profile using a custom policy certain values report ... | The setting./User/Vendor/MSFT/VPNv2/Always-On-VPN-v2/NativeProfile/Servers - ... | Changing the NativeProfile CSP in the VPN settings to reflect serverFQDN;serv... | 7.5 | contentidea-kb |
| 26 | User Rights (https://docs.microsoft.com/en-us/windows/security/threat-protect... |  |  | 7.5 | contentidea-kb |
| 27 | ODJ connector is installed but not showing up in the Intune consoleIf you loo... | This indicates that the communication is not happening correctly between the ... | Configuring the proxy on the .Net Framework directly by editing&nbsp;the mach... | 7.5 | contentidea-kb |
| 28 | Administrative templates are rolling out to Intune tenants the week of July 5... |  |  | 7.5 | contentidea-kb |
| 29 | When trying to deploy an OMA-URI for wired lan settings the policy fails. | This particular OMA-URI only works on Windows 10 1903 and later. | Make sure the customer applying this to 1903 machines and is using the follow... | 7.5 | contentidea-kb |
| 30 | Intune does not natively offer any method of adding a user to the local admin... |  |  | 7.5 | contentidea-kb |
| 31 | Custom settings are configured differently for each platform. To control feat... |  |  | 7.5 | contentidea-kb |
| 32 | When using some OMA-URIs on Windows devices they might conflict with group po... |  |  | 7.5 | contentidea-kb |
| 33 | Using Intune custom OMA-URI policy the customer can lock out local account lo... |  |  | 7.5 | contentidea-kb |
| 34 | Symptoms&nbsp;When Policy CSP – ControlPolicyConflict/MDMWinsOverGP is at def... |  |  | 7.5 | contentidea-kb |
| 35 | New Intune change Announced:After an investigation performed in collaboration... |  |  | 7.5 | contentidea-kb |
| 36 | This article is for one complex issue on co-managed devices about the Edge ap... |  |  | 7.5 | contentidea-kb |
| 37 | There are many users trying to set up Windows 10 tablets as multi-app kiosk d... |  | Step 1: Find out the applications that need to be allowed for the target desk... | 7.5 | contentidea-kb |
| 38 | Kiosk mode for Windows 10 will not work with Edge Chromium.&nbsp;Edge Browser... |  |  | 7.5 | contentidea-kb |
| 39 | Devices are showing Failed status in the Feature Update End user update statu... | This occurs because the End user update status report leverages Update CSP to... | By-design behavior. It's a limitation if Update CSP. | 7.5 | contentidea-kb |
| 40 | After Windows 10 devices receive an Application Control policy, the devices p... | This occurs because Application Control settings from the Endpoint portal use... | If all the Windows 10 devices are 1903+ you can deploy a customized Applicati... | 7.5 | contentidea-kb |
| 41 | Engineers need to read and understand below topics before starting this lab:1... |  |  | 7.5 | contentidea-kb |
| 42 | Self-evaluation questions:Try to find answers to following questions through ... |  |  | 7.5 | contentidea-kb |
| 43 | Update Channel in the Intune administrative template doesn't update Office on... | Office Update policy from servicing profile takes precedence over Update chan... | To resolve this problem:  Login to&nbsp;https://config.office.com&nbsp;and na... | 7.5 | contentidea-kb |
| 44 | This is an example from a case I handled where the Deviceenroller.exe was dis... |  |  | 7.5 | contentidea-kb |
| 45 | Surface Hub devices (different models) randomly disconnect from wifi network. | This can occur if you are using&nbsp;MAC Address Authentication and the Surfa... | To resolve this problem, extract a Network LAN Profile from another corporate... | 7.5 | contentidea-kb |
| 46 | Attack Surface Reduction policy setting &quot;Block abuse of exploited vulner... | The custom profile and the Endpoint Security template profile are in conflict... | In order to deploy all ASR policies, deploy the policy setting &quot;Block ab... | 7.5 | contentidea-kb |
| 47 | Endpoint protection policy is configured to set&nbsp;LAN Manager Authenticati... | This can occur if there is a GPO applied to the device setting the &quot;LAN ... | To avoid a conflict there are two approaches: First Approach:  Delete the app... | 7.5 | contentidea-kb |
| 48 | For Active Directory, admin can leverage allow local logon GPO to define whic... |  | If we only need to allow specific AAD user to logon to AAD joined device, we ... | 7.5 | contentidea-kb |
| 49 | You try to apply Intune policies like Device Configuration profiles to non-En... | As of this writing, February 2022, not all Intune policies work correctly whe... | Until these language localization issues are addressed in a future roadmap, t... | 7.5 | contentidea-kb |
| 50 | When configuring the Wallpaper from the Intune Device restrictions the device... | Windows 10 PRO does not support the CSP for DesktopImage by default, it requi... | From the article&nbsp;https://docs.microsoft.com/en-us/windows/client-managem... | 7.5 | contentidea-kb |
| 51 | Customer configured the Lock screen and Logon image using the Intune Settings... | The below Device Restriction policy supports image URL. Intune policy relies ... | As a workaround, customer removed Lock screen settings from “Settings Catalog... | 7.5 | contentidea-kb |
| 52 | The correct      Time Zone is not getting updated on machines after using Aut... | This can occur if automatic time zone is set to Off (default). | There is no native MEM functionality to set automatic time zone directly     ... | 7.5 | contentidea-kb |
| 53 | Intune has a new feature that allows you to manage the members of local group... | The new&nbsp;feature is using the security identified (SID) number for the lo... | To&nbsp;create Account Protection Policy: 1. Open the&nbsp;MEM Portal2. Click... | 7.5 | contentidea-kb |
| 54 | SyncML is a public tool developed by Oliver Kieselbach (Microsoft MVP) that&n... |  |  | 7.5 | contentidea-kb |
| 55 | When attempting to upload an ADMX template you get the following error: The u... | This can occur if the Microsoft.Policies.Windows.ADMX dependency is missing. ... | To resolve this problem complete the following: 1.&nbsp;Navigate to&nbsp;c:\w... | 7.5 | contentidea-kb |
| 56 | Before you start:            The purpose of this article is to help streamlin... |  |  | 7.5 | contentidea-kb |
| 57 | After deploying a Windows Hello For Business policy from Identity protection ... | This occurs because when running Terminal or Event Viewer as Administrator, n... | Check whether the UAC setting on the device is set to &quot;Not recommended&q... | 7.5 | contentidea-kb |
| 58 | Unable to upload Google Chrome Update. Customer follows official Google artic... | There are admx dependencies while uploading the Google Update admx.&nbsp;Belo... | If you didn't import the google.admx and google.adml first: Additionally, it'... | 7.5 | contentidea-kb |
| 59 | This article will show you how to use Intune custom policy to map a network d... |  |  | 7.5 | contentidea-kb |
| 60 | Restrict user to install any .exe software |  | We can choose to go with WDAC; which is a device-based policy; once an applic... | 7.5 | contentidea-kb |
| 61 | This is an informational article only. Please remember that we don't support ... |  |  | 7.5 | contentidea-kb |
| 62 | First you need to install&nbsp;Download and install the Windows ADK / Microso... |  |  | 7.5 | contentidea-kb |
| 63 | Intune : Getting error while running app with elevated privilege : There was ... | This issue arises due to the implementation of the &quot;AllowLocalLogOn&quot... | The co-deployment of the AllowLocalLogon policy and the EPM Policy is not fea... | 7.5 | contentidea-kb |
| 64 | Restricting the personal team account on the windows 11 devices or Disable Wi... | Many of the times customer do not want to allow users to use the personal tea... | Resolution:  As per the Intune configuration profile there are two ways to re... | 7.5 | contentidea-kb |
| 65 | Windows devices were getting factory reset after multiple attempts to launch ... | The Directory Services team collected TSS logs and found in CredprovAuthui.et... | Excluding Zscaler via group policy or Intune ADMX policy addressed the issue.... | 7.5 | contentidea-kb |
| 66 | Configuring TLS 1.3 for EAP Authentication in Intune: A Guide to Security, Pe... | Enabling or disabling TLS 1.3 for Extensible Authentication Protocol (EAP) Cl... | Before creating a policy, understanding the Configuration Service Provider (C... | 7.5 | contentidea-kb |
| 67 | How to disable screen recording option in Snipping tool via Intune. |  | There is an existing CSP with path: ./User/Vendor/MSFT/Policy/Config/Experien... | 7.5 | contentidea-kb |
| 68 | In order to prevent users from installing apps from the Microsoft Public stor... |  |  | 7.5 | contentidea-kb |
| 69 | Many customers started to report: After user login to Windows Device, Device ... |  |  | 7.5 | contentidea-kb |
| 70 | Customers are experiencing persistent failures when attempting to delete impo... | This behavior is by design. The&nbsp;Windows.admx&nbsp;file serves as a found... | Dependent ADMX templates can be removed using two approaches, with a modified... | 7.5 | contentidea-kb |
| 71 | Phone Link disabled (grayed out) on Windows devices enrolled in Intune | Issue with Intune policy&nbsp;or GPO if applicable | Troubleshooting: Follow below steps:&nbsp;  When you enable or disable Phone-... | 7.5 | contentidea-kb |
| 72 | Phone Link disabled (grayed out) on Windows devices enrolled in Intune | Issue with Intune policy&nbsp;or GPO if applicable | Troubleshooting:&nbsp;Follow below steps:&nbsp;  When you enable or disable P... | 7.5 | contentidea-kb |
| 73 | Windows managed devices report a successful sync on the device but fail to up... | A legacy Administrative Template policy was configured for the Microsoft Edge... | The issue was resolved by: Removing the problematic Edge policy configuration... | 7.5 | contentidea-kb |
| 74 | A Device Configuration policy related to the Maintenance Scheduler&nbsp;disab... | This issue is caused by a client‑side bug in registry key parsing, triggered ... | Intune Service‑Side Fix A fix has been rolled out on the Intune service side ... | 7.5 | contentidea-kb |
| 75 | User Rights Management policy (Add/Replace/Remove users or groups) fails to a... | Windows built-in group and account display names are locale-dependent and dif... | Use Security Identifiers (SIDs) instead of display names when configuring use... | 7.0 | ado-wiki |
| 76 | ODJ connector is installed but not showing up in the Intune console If you lo... | This indicates that the communication is not happening correctly between the ... | Configuring the proxy on the .Net Framework directly by editing the machine.c... | 4.5 | contentidea-kb |
| 77 | When trying to deploy an OMA-URI for wired lan settings the policy fails. | This particular OMA-URI only works on Windows 10 1903 and later. | Make sure the customer applying this to 1903 machines and is using the follow... | 4.5 | contentidea-kb |
| 78 | For an Azure AD joined or Hybrid Azure AD joined device, every time a user si... |  |  | 3.0 | contentidea-kb |
| 79 | When deploying VPNv2 CSP profile using a custom policy certain values report ... | The setting ./User/Vendor/MSFT/VPNv2/Always-On-VPN-v2/NativeProfile/Servers -... | Changing the NativeProfile CSP in the VPN settings to reflect serverFQDN;serv... | 3.0 | contentidea-kb |
| 80 | User Rights ( https://docs.microsoft.com/en-us/windows/security/threat-protec... |  |  | 3.0 | contentidea-kb |
| 81 | Administrative templates are rolling out to Intune tenants the week of July 5... |  |  | 3.0 | contentidea-kb |
