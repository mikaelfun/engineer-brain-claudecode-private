# ENTRA-ID WHfB PIN/GPO/Registry Operations — Quick Reference

**Entries**: 131 | **21V**: Partial (129/131)
**Last updated**: 2026-04-07
**Keywords**: whfb, registry, group-policy, gpo, pin-reset, pin

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/whfb-operations.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | WHfB PIN prompt keeps appearing at sign-in despite WHfB disabled in both GPO and Intune MDM. Regi... | WHfB PIN prompt triggered by SCCM Windows Hello for Business settings, which ... | Disable WHfB from SCCM and deploy changes to all users/devices. Check SCCM WH... | 🟢 9.0 | OneNote |
| 2 📋 | Chrome SSO fails with 'Access to the native messaging host was disabled by the administrator' in ... | Admin disabled Chrome native messaging host via NativeMessagingBlacklist grou... | Whitelist BrowserCore native messaging host: add HKLM\SOFTWARE\Policies\Googl... | 🟢 8.5 | ADO Wiki |
| 3 📋 | No AAD sign-in prompt appears when RDP to AADJ/HAADJ device - only Windows login prompt shown (RD... | RDS AAD Auth negotiation failed and fell back to legacy auth. Common causes: ... | 1. Verify enablerdsaadauth:i:1 in RDP file or AVD Host Pool properties. 2. Ch... | 🟢 8.5 | ADO Wiki |
| 4 📋 | When users click 'I Forgot My PIN' on the Windows logon screen, they get the error: 'This feature... | The Microsoft PIN reset service is not properly configured in the tenant, or ... | 1. Verify the PIN Reset Service configuration following: https://learn.micros... | 🟢 8.5 | ADO Wiki |
| 5 📋 | WHfB PIN reset from the Windows logon screen does not work on Windows 10 Professional edition. Th... | PIN reset from logon screen requires Windows 10 Enterprise edition (build 170... | Upgrade client devices to Windows 10 Enterprise edition build 1709 or later t... | 🟢 8.5 | ADO Wiki |
| 6 📋 | Users who set their WHfB PIN before the PIN reset policy was applied cannot use the 'I Forgot My ... | During initial PIN provisioning (before PIN reset policy), the recovery key i... | Users must first reset their PIN manually from Settings > Accounts > Sign In ... | 🟢 8.5 | ADO Wiki |
| 7 📋 | Users click I Forgot My PIN on logon screen and get error: This feature is not supported in your ... | PIN reset service not configured or client lacks internet access. | Verify PIN Reset Service config per MS docs. Ensure client has internet acces... | 🟢 8.5 | ADO Wiki |
| 8 📋 | WHfB PIN reset from logon screen does not work on Windows 10 Professional. | Requires Windows 10 Enterprise build 1709+. Pro edition not supported. | Upgrade to Windows 10 Enterprise build 1709 or later. | 🟢 8.5 | ADO Wiki |
| 9 📋 | Users who set WHfB PIN before PIN reset policy applied cannot use I Forgot My PIN from logon screen. | Recovery key not encrypted with PIN Reset Service public key during initial p... | Reset PIN manually first: Settings > Accounts > Sign In options > PIN > Chang... | 🟢 8.5 | ADO Wiki |
| 10 📋 | Azure AD Connect Provisioning Agent service fails to start on the server | Group Policy prevents the local NT Service Logon Account (NT SERVICE\AADConne... | Open Services editor, change the Logon Account for provisioning agent service... | 🟢 8.5 | ADO Wiki |
| 11 📋 | Azure AD Join fails with error code 8018000a 'The device is already enrolled', even after removin... | Stale enrollment registry GUIDs remain under HKLM\SOFTWARE\Microsoft\Enrollme... | 1. Export backup: reg export HKLM\SOFTWARE\Microsoft\Enrollments\ Enrollment.... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Incorrect SAM account name (e.g. AzureAD\OldUsername) displayed at Start > Settings > Accounts > ... | Stale registry keys at HKLM\SOFTWARE\Microsoft\IdentityStore\LogonCache (Name... | 1. Remove account from Other Users; 2. Download PSExec and run 'Start-Process... | 🟢 8.5 | ADO Wiki |
| 13 📋 | Incorrect SAM account (AzureAD\OldUsername) displayed for Azure AD user at Start > Settings > Acc... | Stale SAM account mapping cached in registry under HKLM\SOFTWARE\Microsoft\Id... | 1) Remove account from Other Users. 2) Use PsExec (Sysinternals) to open Powe... | 🟢 8.5 | ADO Wiki |
| 14 📋 | Windows Hello for Business PIN prompt does not appear during WHfB setup. The PIN setup window is ... | UAC is disabled on the client device. Registry key HKLM:\Software\Microsoft\W... | Set EnableLUA registry key to 1: Set-ItemProperty -Path HKLM:\Software\Micros... | 🟢 8.5 | ADO Wiki |
| 15 📋 | GPO 'Sign-in last interactive user automatically after a system-initiated restart' blocks WHfB PI... | Group Policy 'Computer Configuration > Policies > Administrative Templates > ... | Do not use this GPO until the bug is resolved. | 🟢 8.5 | ADO Wiki |
| 16 📋 | GPOs 'Block launching Universal Windows apps with Windows Runtime API access from hosted content'... | Group Policies under 'App runtime' or 'AppLocker Policies' prevent Universal ... | These GPOs are not compatible with Windows Hello for Business. Remove or disa... | 🟢 8.5 | ADO Wiki |
| 17 📋 | GPO 'Interactive logon: Number of previous logons to cache' blocks WHfB login. Error: 'We can't s... | Group Policy 'Computer Configuration > Windows Settings > Security Settings >... | Login as Local Administrator and set GPO 'Interactive logon: Number of previo... | 🟢 8.5 | ADO Wiki |
| 18 📋 | Newly created WHfB PIN credential cannot be used for up to 30 minutes after provisioning | Azure AD Connect sync cycle interval causes delay between PIN creation and ke... | Wait up to 30 minutes for sync to complete. One-time manual sync acceptable f... | 🟢 8.5 | ADO Wiki |
| 19 📋 | WHfB PIN unavailable for initial logon when Sign-in last interactive user GPO enabled (Bug 15643318) | GPO 'Sign-in last interactive user automatically after system-initiated resta... | Do not use this GPO until bug resolved. PIN available from unlock screen. | 🟢 8.5 | ADO Wiki |
| 20 📋 | WHfB sign-in fails: domain not available, when Interactive logon cache GPO set to 0 | GPO 'Interactive logon: Number of previous logons to cache' set to 0 prevents... | Set Interactive logon cache GPO to minimum value 1. Requires local admin pass... | 🟢 8.5 | ADO Wiki |
| 21 📋 | Windows Hello for Business PIN setup prompt does not appear during WHfB provisioning - PIN window... | UAC is disabled on the client device. Registry key HKLM\Software\Microsoft\Wi... | Set EnableLUA registry key to 1 to re-enable UAC. Run: Set-ItemProperty -Path... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Newly provisioned WHfB PIN cannot be used immediately - user must wait up to 30 minutes after PIN... | Azure AD Connect sync cycle interval causes delay between PIN creation and ke... | Wait 30 minutes after PIN creation. For troubleshooting only: one-time manual... | 🟢 8.5 | ADO Wiki |
| 23 📋 | WHfB PIN configuration dialog opens and immediately closes or does not complete. Caused by GPOs: ... | Certain GPOs incompatible with WHfB on Win10 1709: App runtime UWP blocking, ... | Remove or disable incompatible GPOs. For Sign-in last interactive user: do no... | 🟢 8.5 | ADO Wiki |
| 24 📋 | WHfB sign-in fails: 'We cannot sign you in with this credential because your domain is not availa... | Logon cache count GPO set to 0 or too low, preventing cached logon with WHfB ... | Set GPO: Computer Config > Windows Settings > Security Settings > Local Polic... | 🟢 8.5 | ADO Wiki |
| 25 📋 | WHfB: All options under Settings > Accounts > Sign-in Options are grayed out. Users cannot change... | Registry key HKLM\SOFTWARE\Microsoft\PolicyManager\default\Settings\AllowSign... | Set the registry key Value to 1: HKLM\SOFTWARE\Microsoft\PolicyManager\defaul... | 🟢 8.5 | ADO Wiki |
| 26 📋 | WHfB PIN registration fails with error 0x800706d9 after completing MFA successfully. Process Moni... | The NgcCtnrSvc (Microsoft Passport Container) service was disabled on the aff... | 1. Set registry HKLM\SYSTEM\CurrentControlSet\Services\NgcCtnrSvc\Start to 3 ... | 🟢 8.5 | ADO Wiki |
| 27 📋 | WHfB PIN Reset: User clicks 'I Forgot My PIN' on login screen and gets error 'This feature is not... | Either (1) PIN Reset Service is not properly configured, (2) client has no in... | 1. Verify PIN Reset Service configuration per https://learn.microsoft.com/en-... | 🟢 8.5 | ADO Wiki |
| 28 📋 | All options under Settings > Accounts > Sign-in Options are grayed out - cannot change/reset WHfB... | Registry AllowSignInOptions Value set to 0, disabling all sign-in options. Ma... | Set registry AllowSignInOptions Value to 1. Check if Group Policy or base ima... | 🟢 8.5 | ADO Wiki |
| 29 📋 | WHFB PIN registration fails with error 0x800706d9 after completing MFA - NgcCtnrSvc service disabled | NgcCtnrSvc (Microsoft Passport Container) service is disabled. Handles privat... | Set registry HKLM\SYSTEM\CurrentControlSet\Services\NgcCtnrSvc Start=3 (Manua... | 🟢 8.5 | ADO Wiki |
| 30 📋 | WHfB PIN Reset: I Forgot My PIN on login screen returns This feature is not supported in your org... | PIN Reset Service not configured, or client has no internet access to reach t... | Verify PIN Reset Service config. Ensure client has internet connectivity. | 🟢 8.5 | ADO Wiki |
| 31 📋 | WHfB PIN Reset from login screen fails after policy configured - works from Settings but not lock... | User provisioned PIN before PIN Reset policy was applied. Recovery key not en... | Reset PIN from Settings > Accounts > Sign-in Options > PIN > Change > I forgo... | 🟢 8.5 | ADO Wiki |
| 32 📋 | All options under Settings > Accounts > Sign-in Options are grayed out. Users cannot change/reset... | Registry key HKLM\SOFTWARE\Microsoft\PolicyManager\default\Settings\AllowSign... | Set the registry key HKLM\SOFTWARE\Microsoft\PolicyManager\default\Settings\A... | 🟢 8.5 | ADO Wiki |
| 33 📋 | WHfB policies configured via both Group Policy and Intune produce unexpected results (e.g., wrong... | When GPO and Intune both configure WHfB policies, GPO takes precedence over I... | Use only one management method (GPO or Intune) for WHfB policies to avoid con... | 🟢 8.5 | ADO Wiki |
| 34 📋 | User forgot PIN and wants to reset from the Windows logon screen | PIN reset from logon screen requires Windows 10 Enterprise edition and the PI... | For Enterprise: configure PIN reset service per MS docs. For non-Enterprise: ... | 🟢 8.5 | ADO Wiki |
| 35 📋 | User does not know password and asks for destructive PIN reset from Windows logon screen | Destructive PIN reset from logon screen is not supported by design. It would ... | User must recover password first, then logon with password to perform PIN res... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Need to know biometric and PIN failed attempt limits for WHfB lockout behavior | Non-configurable limits: Biometric locks after 3 failed matches. PIN allows 4... | These limits are hardcoded and non-configurable. After biometric lockout, use... | 🟢 8.5 | ADO Wiki |
| 37 📋 | WHfB policies deployed via both GPO and Intune produce unexpected configuration on Windows client... | When Group Policy and Intune are both used to configure Windows Hello for Bus... | Use only one management tool for WHfB configuration. If both are required, be... | 🟢 8.5 | ADO Wiki |
| 38 📋 | User forgot Windows Hello for Business PIN and cannot sign in; no Enterprise edition for self-ser... | PIN reset from logon screen requires Windows 10 Enterprise and Azure AD PIN r... | With Win10 Enterprise: use PIN reset from logon screen (requires PIN reset se... | 🟢 8.5 | ADO Wiki |
| 39 📋 | User locked out after failed biometric or PIN attempts on Windows Hello; behavior is non-configur... | Windows Hello enforces non-configurable lockout: biometric locks after 3 fail... | Biometric: locked after 3 failed matches, unlocks after successful sign-in. P... | 🟢 8.5 | ADO Wiki |
| 40 📋 | GSA Private DNS not working; `netsh namespace show policy` returns empty output even though NRPT ... | A malformed Group Policy Object (GPO) creates an empty DnsPolicyConfig key at... | On domain controller, run the SYSVOL scanning PowerShell script to identify G... | 🟢 8.5 | ADO Wiki |
| ... | *91 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **whfb** related issues (14 entries) `[onenote]`
2. Check **pin-reset** related issues (6 entries) `[ado-wiki]`
3. Check **gpo** related issues (5 entries) `[ado-wiki]`
4. Check **pin** related issues (4 entries) `[onenote]`
5. Check **logon-screen** related issues (2 entries) `[ado-wiki]`
6. Check **windows-10-pro** related issues (2 entries) `[ado-wiki]`
7. Check **recovery-key** related issues (2 entries) `[ado-wiki]`
8. Check **aadj** related issues (2 entries) `[ado-wiki]`
