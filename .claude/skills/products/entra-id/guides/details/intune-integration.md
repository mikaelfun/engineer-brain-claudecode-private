# ENTRA-ID Intune Integration — Detailed Troubleshooting Guide

**Entries**: 52 | **Drafts fused**: 4 | **Kusto queries**: 0
**Draft sources**: ado-wiki-b-azure-ad-mobility-mdm-mam.md, ado-wiki-c-Intune-Configure-CA-Policy.md, ado-wiki-e-windows-laps-intune-mdm-log-analysis.md, ado-wiki-intune-identity-support-boundaries.md
**Generated**: 2026-04-07

---

## Phase 1: Linux
> 9 related entries

### Need to verify Linux device Entra registration and Intune enrollment status - unclear if device is registered, enrolled, or signed in
**Score**: 🟢 9.5 | **Source**: ADO Wiki

**Root Cause**: Device registration/enrollment state not easily visible on Linux without checking local config file

**Solution**: Check `~/.config/intune/registration.toml`: (1) account_hint present = signed into Intune, (2) aad_device_hint present = registered with Azure AD, (3) device_hint present = enrolled in management. Note: Compliance failures for Drive Encryption or Password Complexity are Intune team issues, not Azure AD.

---

### Intune-Portal on Linux fails with 'An unexpected error has occurred' + Error 1001, journalctl shows 'URI has no auth code (code) query parameter', ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SSPR (Self-Service Password Reset) enabled in tenant and user has never signed in before — first-time sign-in redirects to mysignins for auth method registration, which breaks the broker's interactive flow

**Solution**: User should first open a browser on any device, sign into Azure portal → redirected to mysignins → register required auth methods. Then return to Linux machine and retry Intune enrollment.

---

### Linux Intune enrollment shows blank screen instead of password prompt — no sign-in UI appears after entering UPN
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: No default keyring set on Linux machine — broker cannot save tokens, throws 'Unable to save to Keyring. Likely because there is no default keyring set on the machine'

**Solution**: Open Edge browser first to trigger 'Choose password for new keyring' prompt → set keyring password → then retry Intune enrollment. PG is pursuing a fix to auto-trigger this prompt.

---

### Cannot enroll Ubuntu 23.xx in Intune — broker service fails with 'JAVA_HOME is set to an invalid directory: /usr/lib/jvm/java-11-openjdk-amd64', se...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Ubuntu 23.xx ships Java 17 as default JRE but microsoft-identity-broker requires Java 11; broker package dependency is 'default-jre' which resolves to Java 17 on Ubuntu 23.xx

**Solution**: Ubuntu 23.xx is not officially supported. Workaround: install Java 11 OpenJDK and set JAVA_HOME in broker service: Environment="JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64". Or use supported Ubuntu 20.04/22.04.

---

### Linux device shows compliant in intune-portal but Edge cannot access Teams/resources — error 530003 'Device State unregistered', 'Set up your devic...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Stale cookies in Edge browser prevent proper device token/PRT flow despite device being registered and compliant

**Solution**: Clear cookies in Edge browser and restart Edge.

---

### Linux user gets 'Access Denied' page when accessing Azure/O365 resources via Edge with Conditional Access enabled for Linux device platform
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Using unsupported Linux distro (only Ubuntu 20.04/22.04/24.04 and RHEL 8/9 supported), or using non-Edge browser (Firefox/Chrome/Safari), or device not enrolled in Intune, or device not compliant, or user not logged into Edge profile

**Solution**: Verify: 1) Supported distro (Ubuntu 20.04/22.04/24.04, RHEL 8/9), 2) Using Edge browser with signed-in profile, 3) Intune enrollment completed via Company Portal, 4) Device compliant in Intune, 5) User in correct user groups, 6) Tenant configured for Linux device platform in CA policy. Note: hardware binding (TPM/HSM) not supported on Linux.

---

### 'sudo apt install intune-portal' fails with 'E: Unable to locate package intune-portal' on Ubuntu/Debian Linux
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Package tree/repository configuration is incorrect or package not available in the configured apt sources

**Solution**: Download the .deb package manually from https://packages.microsoft.com/ubuntu/{version}/prod/pool/main/i/intune-portal/ and install using 'sudo dpkg -i intune-portal_<version>_amd64.deb'

---

### dpkg install of intune-portal or identity broker packages fails with dependency errors (msalsdk-dbusclient, microsoft-identity-broker, libsdbus-c++...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Package dependency chain not satisfied: intune-portal → msalsdk-dbusclient → microsoft-identity-broker + libsdbus-c++1 → default-jre

**Solution**: Install dependencies in order: 1) sudo apt install default-jre libsdbus-c++1, 2) sudo dpkg -i microsoft-identity-broker, 3) sudo dpkg -i msalsdk-dbusclient, 4) sudo dpkg -i intune-portal. If apt fails with unmet dependencies, run 'sudo apt --fix-broken install' first.

---

### 排查时需要找到 Linux 设备在 Azure DRS 的 Device ID（aad_device_hint）
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Solution**: 运行 `cat ~/.config/intune/registration.toml`，输出中的 aad_device_hint 字段即为 Azure Device Registration Service 的 Device ID

---

## Phase 2: Linux Sso
> 8 related entries

### Intune-Portal on Ubuntu 20.04/22.04 fails to register device with 'An unexpected error has occurred' on-screen. After closing, user sees 'Error Som...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User is in a tenant with Self-Service Password Reset (SSPR) enabled and has never signed in before. On first sign-in they are immediately redirected to mysignins to register required authentication methods, which interrupts the Intune enrollment flow (JavaFX WebView fails to process the redirect).

**Solution**: Workaround: Open a browser on any device and sign into the Azure portal. Complete MFA/auth method registration at mysignins.microsoft.com. Once registration is complete, return to the Linux machine and retry Intune-Portal enrollment.

---

### On Ubuntu 23.xx, Intune enrollment freezes/fails to launch after entering credentials. microsoft-identity-broker.service fails with: 'ERROR: JAVA_H...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: microsoft-identity-broker has a hard dependency on JDK 11, but Ubuntu 23.04+ ships with Java 17 as the default JRE. The broker's systemd unit references a hardcoded path to java-11-openjdk that does not exist on Ubuntu 23.xx. Ubuntu 23.xx is NOT officially supported.

**Solution**: Install OpenJDK 11 manually and set JAVA_HOME in the broker service environment: Environment='JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64'. Run 'apt install intune-portal' to pull in the java11 dependency. Note: Ubuntu 23.xx is unsupported — recommend using Ubuntu 20.04 or 22.04.

---

### 'Certificate validation failed' error during Linux Intune enrollment on Ubuntu 20.04/22.04/23.04 or RHEL 8.x/9.x. Error appears after entering cred...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Passkey is configured as an authentication method for the user account, but the Linux broker/Intune stack does not correctly handle passkey as an auth method, causing certificate validation to fail.

**Solution**: Option 1: Remove passkey auth method from another device (go to account.microsoft.com/account → Security info, remove passkey, ensure phone authenticator is available). Then on Linux: stop microsoft-identity-device-broker, clear all cached credentials (rm -rf ~/.cache/intune-portal ~/.cache/Microsoft ~/.cache/microsoft-edge ~/.config/intune ~/.config/microsoft-edge ~/.config/microsoft-identity-broker ~/.Microsoft ~/.local/share/intune-portal and sudo rm -rf /var/lib/microsoft-identity-device-bro

---

### Need to find Azure AD device ID (aad_device_hint) or Intune device ID on a Linux desktop
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Solution**: Run `cat ~/.config/intune/registration.toml` — aad_device_hint = Azure AD Device ID (from Azure DRS), device_hint = Intune Device ID, account_hint = signed-in account UPN

---

### `sudo apt install intune-portal` fails with 'E: Unable to locate package intune-portal' on Ubuntu/Debian
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft package repository not added to apt sources, or package tree error preventing apt from resolving the package.

**Solution**: Manually download .deb from https://packages.microsoft.com/ubuntu/20.04/prod/pool/main/i/intune-portal/ (Ubuntu 20.04) or https://packages.microsoft.com/ubuntu/22.04/prod/pool/main/i/intune-portal/ (Ubuntu 22.04). Click 'main' > 'i' > 'intune-portal', then install with `sudo dpkg -i intune-portal_<VERSION>_amd64.deb` and resolve dependency errors.

---

### Need to verify Linux device Entra ID registration and Intune enrollment status from the client side
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Solution**: Check `~/.config/intune/registration.toml`: (1) account_hint present = user signed into Intune; (2) aad_device_hint present = device registered with Entra ID (Azure DRS); (3) device_hint present = device enrolled in Intune MDM

---

### User sees blank screen during Linux sign-in or Intune enrollment. Issue is caused by outdated Nvidia GPU drivers rather than keyring or authenticat...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Nvidia drivers are out of date, causing display/rendering issues that result in blank screens during authentication WebView rendering.

**Solution**: Run: sudo ubuntu-drivers autoinstall

---

### Intune compliance check fails on Linux due to Drive Encryption or Password Complexity policy not met
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Compliance policy evaluation for Drive Encryption and Password Complexity is managed by Intune, not Entra ID. These are Intune-side requirements.

**Solution**: Route to Intune support team. For Password Complexity: configure pam_pwquality (min 12 chars, uppercase, lowercase, digit, symbol) in /etc/pam.d/common-password. For Drive Encryption: configure LVM encryption during Ubuntu installation (Advanced Options > Use LVM > Encrypt). See Walk-Through guides for full setup.

---

## Phase 3: Laps
> 3 related entries

### Windows LAPS Event ID 10013: LAPS failed to find the configured local administrator account on the machine.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Managed local admin account in GPO/Intune does not exist on machine, or trailing spaces in account name configuration.

**Solution**: Open Local Users and Groups to verify account. Check for trailing spaces in GPO/MDM account name and in the actual account.

---

### Windows LAPS Event ID 10027: Unable to create acceptable new password. Password length/complexity policy mismatch.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: LAPS password settings (Intune/GPO) conflict with machine local or domain password policy requirements.

**Solution**: Run secpol.msc > Account Policies > Password Policy. Align LAPS password settings with machine password policy.

---

### Windows LAPS Event ID 10034: Configured encryption principal is an isolated/ambiguous name. Cannot manage account password.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Authorized Password Decryptors in GPO/Intune uses ambiguous name instead of domain-qualified format (user@domain.com or domain\user).

**Solution**: Update GPO/Intune Authorized Password Decryptors setting to use DomainName\Username format.

---

## Phase 4: Outlook Mobile
> 2 related entries

### Outlook Mobile in 21V cloud prompts error when attaching files after migrating from third-party MDM to Intune. AADSTS500011 InvalidResourceServiceP...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Outlook Mobile sends token request for https://substrate.office.com (public cloud resource) instead of https://substrate.partner.outlook.cn (21V cloud resource). SSO enablement via Intune/broker triggers the issue.

**Solution**: Product bug in Outlook Mobile. O365 OM team owns the fix to use correct 21V resource endpoint (substrate.partner.outlook.cn) when sending requests in Gallatin environment.

---

### Federated sign-in is bypassed when using QR code to bootstrap Outlook Mobile account, causing MDM control enforcement to fail at device level
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Token transfer performed by scanning QR code bypasses the federation server, preventing MDM policies from being enforced during Outlook Mobile sign-in

**Solution**: Disable QR code sign-in feature via Exchange PowerShell to restore username/password bootstrapping that goes through the federation server

---

## Phase 5: Aadj
> 2 related entries

### Windows 10 Azure AD join (workplace join) fails with error code 80180026. Device successfully joins Azure AD then immediately initiates un-join (DE...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: MDM auto-enroll conflicts with Azure AD workplace join. Device had previously enrolled via MDM (Intune), and MDM auto-enroll was still enabled, causing the immediate unjoin after successful join.

**Solution**: Uninstall Intune manage MSI from the PC. Disable MDM auto-enroll policy. Retry Azure AD join after both steps are completed.

---

### Windows 10 Azure AD join fails with error code 80180026. Event log shows 'AAD Cloud AP plugin call Lookup name from SID returned error: 0xC000023C'...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Device was previously MDM enrolled (Intune). MDM auto-enroll is enabled and conflicts with Azure AD join (workplace join) process. The MDM enrollment triggers the un-join operation after initial AAD join succeeds.

**Solution**: 1) Uninstall Intune manage MSI from the PC. 2) Disable MDM auto-enroll. 3) Retry Azure AD join.

---

## Phase 6: Device Join
> 2 related entries

### Device enrollment fails with error 80180014 (MENROLL_E_DEVICENOTSUPPORTED): MDM server reports platform not supported; user cannot enroll device in...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User does not have permission to enroll personally owned devices; Intune enrollment restriction 'Personally owned' is set to Block for the device type

**Solution**: In Microsoft Endpoint Manager Admin Center (endpoint.microsoft.com) → Devices > Enrollment restrictions > Device type restrictions > All Users > Properties > Edit Platform settings → set 'Personally owned' to Allow for the required device type → Review + Save

---

### Device enrollment error 80180014 (MENROLL_E_DEVICENOTSUPPORTED): MDM server doesn't support this platform/version; actually indicates user has no p...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The user does not have permission to enroll personally owned devices into Intune; Intune enrollment restrictions block personally owned device enrollment by default

**Solution**: In Microsoft Endpoint Manager Admin Center > Devices > Enrollment restrictions > Device type restrictions > All Users > Properties > Edit Platform settings > Set Personally owned to Allow for required device categories > Review + Save

---

## Phase 7: Device Registration
> 2 related entries

### Customer wants to prevent users from registering personally owned or all devices with Azure AD
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Default Azure AD configuration allows all users to register devices; no blocking policy configured

**Solution**: Azure AD > Devices > Device settings → modify 'Users may register their devices with Azure AD' (note: greyed out if Intune MDM is configured). For Intune environments: configure Device type restrictions in Microsoft Endpoint Manager Admin Center → set 'Personally owned' to Block for target device platforms

---

### Customer wants to prevent users from registering personal or corporate devices with Azure AD; 'Users may register their devices with Azure AD' sett...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When Microsoft Intune or MDM is configured, the device registration setting in AAD portal becomes unavailable and enrollment must be managed through Intune enrollment restrictions instead

**Solution**: Without Intune: AAD portal > Devices > Device settings > set 'Users may register their devices with Azure AD' to None/selected users. With Intune: Endpoint Manager > Devices > Enrollment restrictions > Device type restrictions > configure Personally owned to Block for target device types

---

## Phase 8: Pim
> 2 related entries

### After activating Entra role via PIM, user cannot use elevated permissions in M365 Admin Center, Intune Portal, SharePoint Online, or Exchange Onlin...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Role assignments activated in PIM are stored in AAD/MSODS and replicated to application-specific directory stores via ForwardSync with ~15min delay. Applications also cache role assignment info locally for 15+ minutes from previous sign-ins.

**Solution**: 1) Wait 10-15 minutes after PIM activation before signing into target applications. 2) Completely sign out of ALL sessions before attempting access. 3) Use incognito/private browser. 4) Do NOT retry within 15 minutes as it refreshes local app cache without new role data. For persistent issues: collect HAR/Fiddler trace from incognito browser, check id_token claims for role assignments.

---

### After PIM Entra role activation, user cannot utilize permissions in M365 apps (Intune, M365 Admin Center, SPO, Exchange) and receives insufficient ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PIM activation reflected in AAD/MSODS within 1-2 min, but apps sync via ForwardSync (up to 15 min) and cache role info locally (additional 15 min). M365 Admin Center: ~30 min. SPO: ~2 min (15 max). Purview: up to 2 hours.

**Solution**: Wait 10-15 min after activation. Sign out completely. Sign in from incognito browser. Do not retry within 10-15 min (refreshes stale cache). For persistent issues: collect HAR trace + audit log timestamps and compare id_token wids claim with activated role.

---

## Phase 9: Esr
> 2 related entries

### Enterprise State Roaming (ESR) settings do not sync despite GPO being correctly configured. MDM policy AllowSyncMySettings is set to 0 (disabled).
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MDM policy AllowSyncMySettings (Experience area CSP) is configured to 0/Disabled, blocking ESR sync at the MDM policy level. This overrides GPO settings when MDMWinsOverGP is enabled.

**Solution**: Check MDMDiagReport.html (from TSSv2 BasicLog_Mini) for AllowSyncMySettings policy. If value is 0, collaborate with MDM/Intune team to set AllowSyncMySettings to 1 (enabled). Also check EnableActivityFeed, PublishUserActivities, UploadUserActivities MDM policies under HKLM\Software\Microsoft\PolicyManager.

---

### Enterprise State Roaming Do not Sync group policy configured with Allow users to turn syncing on option causes sync settings to default to ON inste...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Known issue with the Windows Do not Sync policy implementation where the Allow users to turn syncing on override option incorrectly sets the default sync state to enabled instead of disabled, contrary to the policy description.

**Solution**: Apply the workaround from the Microsoft article (ADDS: ESR: Do not Sync policy incorrectly defaults to sync settings being ON). As a temporary fix, use alternative policy configuration or manually configure the sync setting to disabled on affected devices via Intune CSP ./Vendor/MSFT/Policy/Config/Experience/AllowSyncMySettings set to 0.

---

## Phase 10: Whfb
> 2 related entries

### After enabling WHFB Passwordless Experience, the Password Credential Provider is still displayed in LogonUI on the client machine
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MDM/Intune policy for EnablePasswordlessExperience is not being applied to the client machine. The registry key at HKLM\Software\Microsoft\PolicyManager\Current\Device\Authentication is not set.

**Solution**: Verify MDM/Intune EnablePasswordlessExperience policy is applied. Check registry key HKLM\Software\Microsoft\PolicyManager\Current\Device\Authentication. For testing, manually set: reg add HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\PolicyManager\default\Authentication\EnablePasswordlessExperience /v value /t REG_DWORD /d 0x1 /f. If Intune policy not deploying, engage Intune team.

---

### WebSign-In Credential Provider is not visible in LogonUI after enabling WHFB Passwordless Experience
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: WebSign-In is a separate feature that must be enabled independently via Intune-MDM, not automatically enabled with Passwordless Experience

**Solution**: Enable WebSign-In using Intune-MDM. Configure via Authentication CSP: EnableWebSignIn policy. Reference: https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-authentication#enablewebsignin

---

## Phase 11: Authenticator
> 1 related entries

### Microsoft Authenticator app log collection via PowerLift — PowerLift SG permission was revoked by PG; must now apply via Intune PowerLift Far East ...
**Score**: 🟢 10.0 | **Source**: OneNote

**Root Cause**: PG revoked original PowerLift permission. New access requires Intune PowerLift regional entitlement.

**Solution**: 1) Apply for IntunePowerLiftFarEast entitlement at https://coreidentity.microsoft.com/manage/Entitlement/entitlement/intunepowerl-tew1. 2) Ask customer to open Authenticator → top-left menu → Send Feedback → Report Issue → input anything → Send. Customer gets an incident ID (EASYID). 3) Go to https://aka.ms/powerlift, sign in, click Incident, input EASYID, download files.

---

## Phase 12: Soft Delete
> 1 related entries

### Restored device shows as non-compliant in Intune after being restored from soft-delete state
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Compliance reset during soft-delete sets IsCompliant to False and nulls compliance-related flags; MDM App ID is retained but compliance state is wiped

**Solution**: Initiate compliance check from Intune or wait for device to sync policy. IsCompliant will remain False until device reports in. MDM App ID is preserved so Intune will resume management automatically.

---

## Phase 13: Compliance
> 1 related entries

### IsCompliant or IsManaged not marked true on device in Azure AD, CA policy blocks access
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: IsCompliant and IsManaged attributes are updated exclusively by Intune for any device OS type — if not true, issue is on Intune side not Azure AD

**Solution**: Route to Intune team for compliance investigation. Azure AD side: verify device exists in AAD, check IsCompliant/IsManaged values, confirm device has PRT (dsregcmd /status on Windows).

---

## Phase 14: Azure Ad Join
> 1 related entries

### Intune auto-enrollment fails during Azure AD Join when MDM Terms of Use URL is missing
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Terms of Use URL not populated in MDM Scope config for Intune auto-enrollment.

**Solution**: In Azure Portal > Mobility > Microsoft Intune, populate Terms of Use URL correctly. Verify MDM Scope.

---

## Phase 15: Groups
> 1 related entries

### Intune fails to migrate soft-deleted group membership during device state change
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Device migration (Autopilot/Hybrid Join/WPJ) copies memberships but skips soft-deleted group memberships

**Solution**: Known limitation. Soft-deleted group memberships not migrated to new device object.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Microsoft Authenticator app log collection via PowerLift — PowerLift SG permi... | PG revoked original PowerLift permission. New access requ... | 1) Apply for IntunePowerLiftFarEast entitlement at https:... | 🟢 10.0 | OneNote |
| 2 | Need to verify Linux device Entra registration and Intune enrollment status -... | Device registration/enrollment state not easily visible o... | Check `~/.config/intune/registration.toml`: (1) account_h... | 🟢 9.5 | ADO Wiki |
| 3 | Outlook Mobile in 21V cloud prompts error when attaching files after migratin... | Outlook Mobile sends token request for https://substrate.... | Product bug in Outlook Mobile. O365 OM team owns the fix ... | 🟢 9.0 | OneNote |
| 4 | Windows 10 Azure AD join (workplace join) fails with error code 80180026. Dev... | MDM auto-enroll conflicts with Azure AD workplace join. D... | Uninstall Intune manage MSI from the PC. Disable MDM auto... | 🟢 9.0 | OneNote |
| 5 | Windows 10 Azure AD join fails with error code 80180026. Event log shows 'AAD... | Device was previously MDM enrolled (Intune). MDM auto-enr... | 1) Uninstall Intune manage MSI from the PC. 2) Disable MD... | 🟢 9.0 | OneNote |
| 6 | Restored device shows as non-compliant in Intune after being restored from so... | Compliance reset during soft-delete sets IsCompliant to F... | Initiate compliance check from Intune or wait for device ... | 🟢 8.5 | ADO Wiki |
| 7 | IsCompliant or IsManaged not marked true on device in Azure AD, CA policy blo... | IsCompliant and IsManaged attributes are updated exclusiv... | Route to Intune team for compliance investigation. Azure ... | 🟢 8.5 | ADO Wiki |
| 8 | Intune-Portal on Linux fails with 'An unexpected error has occurred' + Error ... | SSPR (Self-Service Password Reset) enabled in tenant and ... | User should first open a browser on any device, sign into... | 🟢 8.5 | ADO Wiki |
| 9 | Linux Intune enrollment shows blank screen instead of password prompt — no si... | No default keyring set on Linux machine — broker cannot s... | Open Edge browser first to trigger 'Choose password for n... | 🟢 8.5 | ADO Wiki |
| 10 | Cannot enroll Ubuntu 23.xx in Intune — broker service fails with 'JAVA_HOME i... | Ubuntu 23.xx ships Java 17 as default JRE but microsoft-i... | Ubuntu 23.xx is not officially supported. Workaround: ins... | 🟢 8.5 | ADO Wiki |
| 11 | Linux device shows compliant in intune-portal but Edge cannot access Teams/re... | Stale cookies in Edge browser prevent proper device token... | Clear cookies in Edge browser and restart Edge. | 🟢 8.5 | ADO Wiki |
| 12 | Linux user gets 'Access Denied' page when accessing Azure/O365 resources via ... | Using unsupported Linux distro (only Ubuntu 20.04/22.04/2... | Verify: 1) Supported distro (Ubuntu 20.04/22.04/24.04, RH... | 🟢 8.5 | ADO Wiki |
| 13 | 'sudo apt install intune-portal' fails with 'E: Unable to locate package intu... | Package tree/repository configuration is incorrect or pac... | Download the .deb package manually from https://packages.... | 🟢 8.5 | ADO Wiki |
| 14 | dpkg install of intune-portal or identity broker packages fails with dependen... | Package dependency chain not satisfied: intune-portal → m... | Install dependencies in order: 1) sudo apt install defaul... | 🟢 8.5 | ADO Wiki |
| 15 | Intune auto-enrollment fails during Azure AD Join when MDM Terms of Use URL i... | Terms of Use URL not populated in MDM Scope config for In... | In Azure Portal > Mobility > Microsoft Intune, populate T... | 🟢 8.5 | ADO Wiki |
| 16 | Device enrollment fails with error 80180014 (MENROLL_E_DEVICENOTSUPPORTED): M... | User does not have permission to enroll personally owned ... | In Microsoft Endpoint Manager Admin Center (endpoint.micr... | 🟢 8.5 | ADO Wiki |
| 17 | Customer wants to prevent users from registering personally owned or all devi... | Default Azure AD configuration allows all users to regist... | Azure AD > Devices > Device settings → modify 'Users may ... | 🟢 8.5 | ADO Wiki |
| 18 | Devices unjoin from Entra ID after HP OneAgent update 1.2.50.9581 (released O... | HP OneAgent 1.2.50.9581 runs a script that deletes certif... | 1. Check if HP OneAgent 1.2.50.9581 is installed. 2. HAAD... | 🟢 8.5 | ADO Wiki |
| 19 | Intune-Portal on Ubuntu 20.04/22.04 fails to register device with 'An unexpec... | User is in a tenant with Self-Service Password Reset (SSP... | Workaround: Open a browser on any device and sign into th... | 🟢 8.5 | ADO Wiki |
| 20 | On Ubuntu 23.xx, Intune enrollment freezes/fails to launch after entering cre... | microsoft-identity-broker has a hard dependency on JDK 11... | Install OpenJDK 11 manually and set JAVA_HOME in the brok... | 🟢 8.5 | ADO Wiki |
| 21 | 'Certificate validation failed' error during Linux Intune enrollment on Ubunt... | Passkey is configured as an authentication method for the... | Option 1: Remove passkey auth method from another device ... | 🟢 8.5 | ADO Wiki |
| 22 | 排查时需要找到 Linux 设备在 Azure DRS 的 Device ID（aad_device_hint） | - | 运行 `cat ~/.config/intune/registration.toml`，输出中的 aad_devi... | 🟢 8.5 | ADO Wiki |
| 23 | Device enrollment error 80180014 (MENROLL_E_DEVICENOTSUPPORTED): MDM server d... | The user does not have permission to enroll personally ow... | In Microsoft Endpoint Manager Admin Center > Devices > En... | 🟢 8.5 | ADO Wiki |
| 24 | Customer wants to prevent users from registering personal or corporate device... | When Microsoft Intune or MDM is configured, the device re... | Without Intune: AAD portal > Devices > Device settings > ... | 🟢 8.5 | ADO Wiki |
| 25 | Need to find Azure AD device ID (aad_device_hint) or Intune device ID on a Li... | - | Run `cat ~/.config/intune/registration.toml` — aad_device... | 🟢 8.5 | ADO Wiki |
| 26 | `sudo apt install intune-portal` fails with 'E: Unable to locate package intu... | Microsoft package repository not added to apt sources, or... | Manually download .deb from https://packages.microsoft.co... | 🟢 8.5 | ADO Wiki |
| 27 | Need to verify Linux device Entra ID registration and Intune enrollment statu... | - | Check `~/.config/intune/registration.toml`: (1) account_h... | 🟢 8.5 | ADO Wiki |
| 28 | After activating Entra role via PIM, user cannot use elevated permissions in ... | Role assignments activated in PIM are stored in AAD/MSODS... | 1) Wait 10-15 minutes after PIM activation before signing... | 🟢 8.5 | ADO Wiki |
| 29 | After PIM Entra role activation, user cannot utilize permissions in M365 apps... | PIM activation reflected in AAD/MSODS within 1-2 min, but... | Wait 10-15 min after activation. Sign out completely. Sig... | 🟢 8.5 | ADO Wiki |
| 30 | Federated sign-in is bypassed when using QR code to bootstrap Outlook Mobile ... | Token transfer performed by scanning QR code bypasses the... | Disable QR code sign-in feature via Exchange PowerShell t... | 🟢 8.5 | ADO Wiki |


---

## Incremental Update (2026-04-18) - +3 entries from contentidea-kb

### The MDM Terms of Use are set in the Mobility (MDM and MAM) blade of Azure Active Directory for the MDM applications defined here. These include Intune...
**Score**: 🟡 6.5 | **Source**: ContentIdea KB | **ID**: entra-id-3677

**Description**: The MDM Terms of Use are set in the Mobility (MDM and MAM) blade of Azure Active Directory for the MDM applications defined here. These include Intune, 3rd party On-Premises MDM Applications, and 3rd party cloud MDM�s.   The MDM User Scope set inside of the MDM application will determine who is targ

> This entry contains description only, no explicit root cause/solution.


### You are using AAD Joined Windows Scenario the appliance of Manage account protection settings with endpoint security policies in Microsoft Intune | Mi...
**Score**: 🟢 8.0 | **Source**: ContentIdea KB | **ID**: entra-id-3678

**Root Cause**: AAD Group membership evaluation currently does not work for the built-in group of "Users"

**Solution**: Two proposed workarounds.  1st Solution    create a new local group add the SID of the AAD      Group to this newly created local group on the device grant "Allow log on locally" to the local group in order for the members of the group to      have the necessary permissions to log on to the device r...


### MDM Terms of Use troubleshooting for Azure Active Directory Mobility blade. Users not receiving MDM enrollment prompt during device registration. Cove...
**Score**: 🟡 6.5 | **Source**: ContentIdea KB | **ID**: entra-id-3685

**Description**: MDM Terms of Use troubleshooting for Azure Active Directory Mobility blade. Users not receiving MDM enrollment prompt during device registration. Covers DefaultMDMPolicy verification, ghost MDM applications, and token claims debugging.

> This entry contains description only, no explicit root cause/solution.

