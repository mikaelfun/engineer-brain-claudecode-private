# ENTRA-ID Intune Integration — Quick Reference

**Entries**: 49 | **21V**: All applicable
**Last updated**: 2026-04-07
**Keywords**: intune, mdm, linux, enrollment, linux-sso, device-registration

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/intune-integration.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Microsoft Authenticator app log collection via PowerLift — PowerLift SG permission was revoked by... | PG revoked original PowerLift permission. New access requires Intune PowerLif... | 1) Apply for IntunePowerLiftFarEast entitlement at https://coreidentity.micro... | 🟢 10.0 | OneNote |
| 2 📋 | Need to verify Linux device Entra registration and Intune enrollment status - unclear if device i... | Device registration/enrollment state not easily visible on Linux without chec... | Check `~/.config/intune/registration.toml`: (1) account_hint present = signed... | 🟢 9.5 | ADO Wiki |
| 3 📋 | Outlook Mobile in 21V cloud prompts error when attaching files after migrating from third-party M... | Outlook Mobile sends token request for https://substrate.office.com (public c... | Product bug in Outlook Mobile. O365 OM team owns the fix to use correct 21V r... | 🟢 9.0 | OneNote |
| 4 📋 | Windows 10 Azure AD join (workplace join) fails with error code 80180026. Device successfully joi... | MDM auto-enroll conflicts with Azure AD workplace join. Device had previously... | Uninstall Intune manage MSI from the PC. Disable MDM auto-enroll policy. Retr... | 🟢 9.0 | OneNote |
| 5 📋 | Windows 10 Azure AD join fails with error code 80180026. Event log shows 'AAD Cloud AP plugin cal... | Device was previously MDM enrolled (Intune). MDM auto-enroll is enabled and c... | 1) Uninstall Intune manage MSI from the PC. 2) Disable MDM auto-enroll. 3) Re... | 🟢 9.0 | OneNote |
| 6 📋 | Restored device shows as non-compliant in Intune after being restored from soft-delete state | Compliance reset during soft-delete sets IsCompliant to False and nulls compl... | Initiate compliance check from Intune or wait for device to sync policy. IsCo... | 🟢 8.5 | ADO Wiki |
| 7 📋 | IsCompliant or IsManaged not marked true on device in Azure AD, CA policy blocks access | IsCompliant and IsManaged attributes are updated exclusively by Intune for an... | Route to Intune team for compliance investigation. Azure AD side: verify devi... | 🟢 8.5 | ADO Wiki |
| 8 📋 | Intune-Portal on Linux fails with 'An unexpected error has occurred' + Error 1001, journalctl sho... | SSPR (Self-Service Password Reset) enabled in tenant and user has never signe... | User should first open a browser on any device, sign into Azure portal → redi... | 🟢 8.5 | ADO Wiki |
| 9 📋 | Linux Intune enrollment shows blank screen instead of password prompt — no sign-in UI appears aft... | No default keyring set on Linux machine — broker cannot save tokens, throws '... | Open Edge browser first to trigger 'Choose password for new keyring' prompt →... | 🟢 8.5 | ADO Wiki |
| 10 📋 | Cannot enroll Ubuntu 23.xx in Intune — broker service fails with 'JAVA_HOME is set to an invalid ... | Ubuntu 23.xx ships Java 17 as default JRE but microsoft-identity-broker requi... | Ubuntu 23.xx is not officially supported. Workaround: install Java 11 OpenJDK... | 🟢 8.5 | ADO Wiki |
| 11 📋 | Linux device shows compliant in intune-portal but Edge cannot access Teams/resources — error 5300... | Stale cookies in Edge browser prevent proper device token/PRT flow despite de... | Clear cookies in Edge browser and restart Edge. | 🟢 8.5 | ADO Wiki |
| 12 📋 | Linux user gets 'Access Denied' page when accessing Azure/O365 resources via Edge with Conditiona... | Using unsupported Linux distro (only Ubuntu 20.04/22.04/24.04 and RHEL 8/9 su... | Verify: 1) Supported distro (Ubuntu 20.04/22.04/24.04, RHEL 8/9), 2) Using Ed... | 🟢 8.5 | ADO Wiki |
| 13 📋 | 'sudo apt install intune-portal' fails with 'E: Unable to locate package intune-portal' on Ubuntu... | Package tree/repository configuration is incorrect or package not available i... | Download the .deb package manually from https://packages.microsoft.com/ubuntu... | 🟢 8.5 | ADO Wiki |
| 14 📋 | dpkg install of intune-portal or identity broker packages fails with dependency errors (msalsdk-d... | Package dependency chain not satisfied: intune-portal → msalsdk-dbusclient → ... | Install dependencies in order: 1) sudo apt install default-jre libsdbus-c++1,... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Intune auto-enrollment fails during Azure AD Join when MDM Terms of Use URL is missing | Terms of Use URL not populated in MDM Scope config for Intune auto-enrollment. | In Azure Portal > Mobility > Microsoft Intune, populate Terms of Use URL corr... | 🟢 8.5 | ADO Wiki |
| 16 📋 | Device enrollment fails with error 80180014 (MENROLL_E_DEVICENOTSUPPORTED): MDM server reports pl... | User does not have permission to enroll personally owned devices; Intune enro... | In Microsoft Endpoint Manager Admin Center (endpoint.microsoft.com) → Devices... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Customer wants to prevent users from registering personally owned or all devices with Azure AD | Default Azure AD configuration allows all users to register devices; no block... | Azure AD > Devices > Device settings → modify 'Users may register their devic... | 🟢 8.5 | ADO Wiki |
| 18 📋 | Devices unjoin from Entra ID after HP OneAgent update 1.2.50.9581 (released Oct 21, 2025); MS-Org... | HP OneAgent 1.2.50.9581 runs a script that deletes certificates where subject... | 1. Check if HP OneAgent 1.2.50.9581 is installed. 2. HAADJ devices: self-heal... | 🟢 8.5 | ADO Wiki |
| 19 📋 | Intune-Portal on Ubuntu 20.04/22.04 fails to register device with 'An unexpected error has occurr... | User is in a tenant with Self-Service Password Reset (SSPR) enabled and has n... | Workaround: Open a browser on any device and sign into the Azure portal. Comp... | 🟢 8.5 | ADO Wiki |
| 20 📋 | On Ubuntu 23.xx, Intune enrollment freezes/fails to launch after entering credentials. microsoft-... | microsoft-identity-broker has a hard dependency on JDK 11, but Ubuntu 23.04+ ... | Install OpenJDK 11 manually and set JAVA_HOME in the broker service environme... | 🟢 8.5 | ADO Wiki |
| 21 📋 | 'Certificate validation failed' error during Linux Intune enrollment on Ubuntu 20.04/22.04/23.04 ... | Passkey is configured as an authentication method for the user account, but t... | Option 1: Remove passkey auth method from another device (go to account.micro... | 🟢 8.5 | ADO Wiki |
| 22 📋 | 排查时需要找到 Linux 设备在 Azure DRS 的 Device ID（aad_device_hint） | - | 运行 `cat ~/.config/intune/registration.toml`，输出中的 aad_device_hint 字段即为 Azure D... | 🟢 8.5 | ADO Wiki |
| 23 📋 | Device enrollment error 80180014 (MENROLL_E_DEVICENOTSUPPORTED): MDM server doesn't support this ... | The user does not have permission to enroll personally owned devices into Int... | In Microsoft Endpoint Manager Admin Center > Devices > Enrollment restriction... | 🟢 8.5 | ADO Wiki |
| 24 📋 | Customer wants to prevent users from registering personal or corporate devices with Azure AD; 'Us... | When Microsoft Intune or MDM is configured, the device registration setting i... | Without Intune: AAD portal > Devices > Device settings > set 'Users may regis... | 🟢 8.5 | ADO Wiki |
| 25 📋 | Need to find Azure AD device ID (aad_device_hint) or Intune device ID on a Linux desktop | - | Run `cat ~/.config/intune/registration.toml` — aad_device_hint = Azure AD Dev... | 🟢 8.5 | ADO Wiki |
| 26 📋 | `sudo apt install intune-portal` fails with 'E: Unable to locate package intune-portal' on Ubuntu... | Microsoft package repository not added to apt sources, or package tree error ... | Manually download .deb from https://packages.microsoft.com/ubuntu/20.04/prod/... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Need to verify Linux device Entra ID registration and Intune enrollment status from the client side | - | Check `~/.config/intune/registration.toml`: (1) account_hint present = user s... | 🟢 8.5 | ADO Wiki |
| 28 📋 | After activating Entra role via PIM, user cannot use elevated permissions in M365 Admin Center, I... | Role assignments activated in PIM are stored in AAD/MSODS and replicated to a... | 1) Wait 10-15 minutes after PIM activation before signing into target applica... | 🟢 8.5 | ADO Wiki |
| 29 📋 | After PIM Entra role activation, user cannot utilize permissions in M365 apps (Intune, M365 Admin... | PIM activation reflected in AAD/MSODS within 1-2 min, but apps sync via Forwa... | Wait 10-15 min after activation. Sign out completely. Sign in from incognito ... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Federated sign-in is bypassed when using QR code to bootstrap Outlook Mobile account, causing MDM... | Token transfer performed by scanning QR code bypasses the federation server, ... | Disable QR code sign-in feature via Exchange PowerShell to restore username/p... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Federated sign-in is bypassed when using QR code token transfer for Outlook mobile. MDM control e... | QR code token transfer bypasses the federation server authentication flow, so... | Disable the QR code sign-in feature via Exchange PowerShell to restore userna... | 🟢 8.5 | ADO Wiki |
| 32 📋 | Power App mobile player v3.25065.4 does not logout when MAM Intune policy is configured. Sign-out... | App not properly coordinating app data wipe and sign-out with MAM SDK in corr... | 1) Investigate app MAM SDK integration focusing on sign-out + data wipe seque... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Scheduled tasks or automation scripts that require elevation fail to run properly after Administr... | Administrator Protection requires interactive credential approval for every e... | Reconfigure tasks to run under SYSTEM account or a service account instead of... | 🟢 8.5 | ADO Wiki |
| 34 📋 | Enterprise State Roaming (ESR) settings do not sync despite GPO being correctly configured. MDM p... | MDM policy AllowSyncMySettings (Experience area CSP) is configured to 0/Disab... | Check MDMDiagReport.html (from TSSv2 BasicLog_Mini) for AllowSyncMySettings p... | 🟢 8.5 | ADO Wiki |
| 35 📋 | After enabling WHFB Passwordless Experience, the Password Credential Provider is still displayed ... | MDM/Intune policy for EnablePasswordlessExperience is not being applied to th... | Verify MDM/Intune EnablePasswordlessExperience policy is applied. Check regis... | 🟢 8.5 | ADO Wiki |
| 36 📋 | WebSign-In Credential Provider is not visible in LogonUI after enabling WHFB Passwordless Experience | WebSign-In is a separate feature that must be enabled independently via Intun... | Enable WebSign-In using Intune-MDM. Configure via Authentication CSP: EnableW... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Web sign-in option/icon does not appear at Windows logon after deploying Passwordless experience ... | GPO ExcludedCredentialProviders policy inadvertently includes the Cloud Exper... | Remove Cloud Experience Credential Provider GUID {C5D7540A-CD51-453B-B22B-053... | 🟢 8.5 | ADO Wiki |
| 38 📋 | Windows LAPS Event ID 10013: LAPS failed to find the configured local administrator account on th... | Managed local admin account in GPO/Intune does not exist on machine, or trail... | Open Local Users and Groups to verify account. Check for trailing spaces in G... | 🟢 8.5 | ADO Wiki |
| 39 📋 | Windows LAPS Event ID 10027: Unable to create acceptable new password. Password length/complexity... | LAPS password settings (Intune/GPO) conflict with machine local or domain pas... | Run secpol.msc > Account Policies > Password Policy. Align LAPS password sett... | 🟢 8.5 | ADO Wiki |
| 40 📋 | Windows LAPS Event ID 10034: Configured encryption principal is an isolated/ambiguous name. Canno... | Authorized Password Decryptors in GPO/Intune uses ambiguous name instead of d... | Update GPO/Intune Authorized Password Decryptors setting to use DomainName\Us... | 🟢 8.5 | ADO Wiki |
| ... | *9 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **linux** related issues (8 entries) `[ado-wiki]`
2. Check **intune** related issues (7 entries) `[ado-wiki]`
3. Check **enrollment** related issues (4 entries) `[ado-wiki]`
4. Check **enterprise-sso** related issues (2 entries) `[ado-wiki]`
5. Check **aadj** related issues (2 entries) `[onenote]`
6. Check **80180026** related issues (2 entries) `[onenote]`
7. Check **device-join** related issues (2 entries) `[onenote]`
8. Check **compliance** related issues (2 entries) `[ado-wiki]`
