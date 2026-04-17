# ENTRA-ID WHfB PIN/GPO/Registry Operations — Detailed Troubleshooting Guide

**Entries**: 131 | **Drafts fused**: 80 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-adperf-version-store-scoping.md, ado-wiki-a-esr-scoping-questions.md, ado-wiki-a-gpo-scoping-aids.md, ado-wiki-a-gpo-scoping-workflow.md, ado-wiki-a-lcw-administration-unit-scoping.md, ado-wiki-a-whfb-and-tpms.md, ado-wiki-a-whfb-built-in-features.md, ado-wiki-a-whfb-device-registration.md, ado-wiki-a-whfb-error-0x00000bb-troubleshooting.md, ado-wiki-a-whfb-lab-deployment-guide.md
**Generated**: 2026-04-07

---

## Phase 1: Whfb
> 66 related entries

### WHfB PIN prompt keeps appearing at sign-in despite WHfB disabled in both GPO and Intune MDM. Registry PassportForWork and AllowSignInOptions set to 0.
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: WHfB PIN prompt triggered by SCCM Windows Hello for Business settings, which override GPO and Intune.

**Solution**: Disable WHfB from SCCM and deploy changes to all users/devices. Check SCCM WHfB settings in addition to GPO and Intune.

---

### When users click 'I Forgot My PIN' on the Windows logon screen, they get the error: 'This feature is not supported in your organization. Please con...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Microsoft PIN reset service is not properly configured in the tenant, or the client device does not have internet access to connect to the PIN Reset Service.

**Solution**: 1. Verify the PIN Reset Service configuration following: https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/pin-reset 2. Ensure the client has internet access to connect to the PIN Reset Service endpoints.

---

### WHfB PIN reset from the Windows logon screen does not work on Windows 10 Professional edition. The 'I Forgot My PIN' option may not appear or does ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PIN reset from logon screen requires Windows 10 Enterprise edition (build 1709 or later). Windows 10 Professional does not support this feature.

**Solution**: Upgrade client devices to Windows 10 Enterprise edition build 1709 or later to enable PIN reset from the logon screen.

---

### Users who set their WHfB PIN before the PIN reset policy was applied cannot use the 'I Forgot My PIN' feature from the logon screen. The PIN reset ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: During initial PIN provisioning (before PIN reset policy), the recovery key is not encrypted with the PIN Reset Service's public key. The PIN Reset Service requires the recovery key to be encrypted with its public key to function.

**Solution**: Users must first reset their PIN manually from Settings > Accounts > Sign In options > PIN > Change > I forgot My Pin. This re-provisions the recovery key with the PIN Reset Service public key encryption. After this, the PIN reset from the logon screen will work on subsequent attempts.

---

### Users click I Forgot My PIN on logon screen and get error: This feature is not supported in your organization.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: PIN reset service not configured or client lacks internet access.

**Solution**: Verify PIN Reset Service config per MS docs. Ensure client has internet access to endpoints.

---

### WHfB PIN reset from logon screen does not work on Windows 10 Professional.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Requires Windows 10 Enterprise build 1709+. Pro edition not supported.

**Solution**: Upgrade to Windows 10 Enterprise build 1709 or later.

---

### Users who set WHfB PIN before PIN reset policy applied cannot use I Forgot My PIN from logon screen.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Recovery key not encrypted with PIN Reset Service public key during initial provisioning before policy.

**Solution**: Reset PIN manually first: Settings > Accounts > Sign In options > PIN > Change > I forgot My Pin. This re-encrypts recovery key.

---

### Windows Hello for Business PIN prompt does not appear during WHfB setup. The PIN setup window is hidden behind the main window. UAC is disabled on ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: UAC is disabled on the client device. Registry key HKLM:\Software\Microsoft\Windows\CurrentVersion\policies\system\EnableLUA is set to 0, which causes the CloudExperienceHost PIN setup window to be hidden.

**Solution**: Set EnableLUA registry key to 1: Set-ItemProperty -Path HKLM:\Software\Microsoft\Windows\CurrentVersion\policies\system -Name EnableLUA -Value 1. Reboot the device.

---

### GPO 'Sign-in last interactive user automatically after a system-initiated restart' blocks WHfB PIN sign-in. PIN sign-in unavailable for initial log...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Group Policy 'Computer Configuration > Policies > Administrative Templates > Windows Components > Windows Logon Option > Sign-in last interactive user automatically after a system-initiated restart' conflicts with WHfB. Bug 15643318.

**Solution**: Do not use this GPO until the bug is resolved.

---

### GPOs 'Block launching Universal Windows apps with Windows Runtime API access from hosted content' or 'AppLocker Policies' block WHfB provisioning. ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Group Policies under 'App runtime' or 'AppLocker Policies' prevent Universal Windows apps (including CloudExperienceHost used by WHfB provisioning) from running properly.

**Solution**: These GPOs are not compatible with Windows Hello for Business. Remove or disable: 1) Computer Configuration > Administrative Templates > Windows Components > App runtime > Block launching Universal Windows apps with Windows Runtime API access from hosted content; 2) Computer Configuration > Windows Settings > Security Settings > Application Control Policies > AppLocker Policies.

---

## Phase 2: Group Policy
> 13 related entries

### Group Policy editing fails with Access is denied or sharing violations on SYSVOL files (gpt.ini, registry.pol, gpttmpl.inf). Clients log Event ID 7...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Concurrent file handle locks from large numbers of GP clients downloading SYSVOL files with ShareMode Read/Write. Latency or packet loss between clients and DC extends lock duration, causing conflicts when GP editor attempts to acquire write handle.

**Solution**: Edit Group Policy only from PDC (or single designated DC). Place PDC in a separate AD Site not covering high-latency client subnets. Use machines with low network latency to the editing DC. Configure AV exclusions per KB822158 to prevent security product file locks on SYSVOL.

---

### Group Policy Advanced Audit settings not applying. auditpol /get /category:* shows settings not configured. GPO appears in gpresult /r but audit ev...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: An older GPO references the Advanced Audit Policy CSE ({F3CCC681-B74C-4060-9F26-CD84525DCA2A}) in its gPCMachineExtensionNames attribute, but the corresponding audit.csv file is missing from that GPO GPT folder (SYSVOL Policies {GUID} Machine Microsoft Windows NT Audit audit.csv).

**Solution**: Run PowerShell script to find GPOs calling Advanced Audit CSE with missing audit.csv. For the problematic GPO: 1) Backup the GPO, 2) Open the GPC object in AD, 3) Remove [{F3CCC681-B74C-4060-9F26-CD84525DCA2A}{0F3F3735-573D-9804-99E4-AB2A69BA5FD4}] from the gPCMachineExtensionNames attribute.

---

### Group Policy Advanced Audit settings not applying. GPSVC log shows error 0x8007000d (ERROR_INVALID_DATA) when processing the Audit Policy CSE. Sett...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: One of the GPOs has an audit.csv file with invalid/corrupted data in the GPT folder. The Advanced Audit Policy CSE fails to parse the corrupted audit.csv, causing all audit policy processing to fail.

**Solution**: Identify the GPO with the corrupted audit.csv by checking GPSVC debug log for the GPO GUID associated with the 0x8007000d error. Disable that particular GPO to restore audit settings processing. Optionally fix or recreate the audit settings in that GPO.

---

### User Group Policy settings not applying on Windows 10/11 clients (or Windows 7/8.1 with MS16-072 installed). GPResult shows GPO denied due to secur...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MS16-072 security update changed user GPO retrieval to use computer security context instead of user context. If Authenticated Users ACE (with Read permission) was removed from the GPO security filtering and replaced with a user-only group, the computer cannot read the GPO.

**Solution**: Re-add Authenticated Users group with Read (GpoRead) permission to affected GPOs. PowerShell: Get-GPO -All, check for missing Authenticated Users, then Set-GPPermissions -TargetName 'authenticated users' -TargetType group -PermissionLevel GpoRead.

---

### Group Policy settings not applying to certain machines. GPResult shows GPO denied with reason False WMI Filter. GPO applies correctly on some OS ve...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A WMI filter is configured on the GPO that evaluates to false on the target machine OS version/architecture. WMI filters are evaluated during GPO processing and if they return false, the entire GPO is skipped. Common: WMI filter targeting specific OS blocks GPO on newer OS versions.

**Solution**: 1) Check GPResult for False WMI Filter denial. 2) In GPSVC debug log, locate the GPO GUID and WMI filter evaluation result. 3) Review WMI filter query in GPMC and verify it matches target OS. 4) Update WMI filter to include desired OS versions or remove if unneeded. 5) Verify with gpupdate /force.

---

### Group Policy Preferences (GPP) drive mapping fails - drive not visible after GPO applied, GPP debug log shows 'The network path was not found' or '...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Incorrect share path configured in GPP drive mapping (e.g., extra trailing space in the UNC path), causing network name resolution failure

**Solution**: Enable GPP debug logging for Drive Maps via GPO. Check the User.log file in the trace folder for error messages. Analyze network trace for 'Bad Network Name' in Tree Connect frames. Verify and correct the share path in the GPP configuration, removing any extra spaces or typos.

---

### IE Group Policy Preferences setting reverted on first login on Windows 2008 R2 Terminal Servers. Setting applies correctly only from second login. ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: ie4uinit.exe (IE Per-User Initialization Utility) resets IE settings for new user profiles during first login on Windows 7/2008R2. This is by-design behavior that overwrites GPP changes.

**Solution**: 1) Replace IE desktop icon with script that runs reg add to re-apply the setting or triggers GPUpdate before launching IE. 2) Upgrade Terminal Server to Windows Server 2012R2 or newer where ie4uinit no longer resets these settings.

---

### Group Policy settings (registry keys, file permissions, configurations) are applied correctly as verified by gpresult, but the application function...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The application that reads the GPO-configured settings has a timing issue or does not re-read the updated configuration. Group Policy successfully writes the configuration (registry, files, permissions) but the consuming application fails to pick up the changes. This is an application-side issue, not a Group Policy deployment issue.

**Solution**: 1. Use Process Monitor (Procmon) while running gpupdate /force to verify GP writes the correct configuration values. 2. Restart the application to force it to re-read the registry/configuration. 3. If the issue persists after restart, filter Procmon on the specific registry key/file to confirm the application is reading the correct path. 4. Engage the specific application support team (Edge, USB/Storage, etc.) rather than Directory Services, as the configuration delivery via GP is working correc

---

### GPO is in the Applied list but the actual setting value on the client differs from the configured value (e.g., a setting should be Enabled but appe...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Another GPO with higher precedence is applying the opposite setting and winning the conflict, or a non-GPO tool (SCCM, Intune, custom script) is modifying the same registry key/setting after Group Policy applies it.

**Solution**: 1. Run gpresult /h and identify the winning GPO for the conflicting setting. 2. If another GPO is winning: re-order GPO link precedence in GPMC or adjust security filtering. 3. If a non-GPO process is suspected: run gpupdate /force and verify the value is correct immediately after. Then run Procmon filtering on the specific registry key to capture which process changes it. 4. Alternatively, configure auditing on the registry key or file object to identify the modifying process. 5. Engage the app

---

### GPO appears in the Denied list in gpresult with Reason Denied: WMI Filter. The GPO is in scope for the OU but not being applied to the target machine.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The WMI Filter linked to the GPO does not match the client machine attributes (e.g., OS version, hardware properties). WMI Filters allow targeting GPOs to specific machines based on WMI queries, and a non-matching filter causes the GPO to be denied.

**Solution**: 1. Open Group Policy Management Console (GPMC) and identify the WMI Filter linked to the denied GPO. 2. Review the WMI query and test it against the target machine using wmic or PowerShell Get-WmiObject. 3. If the filter is incorrect, update the WMI query to match the intended target machines. 4. As a temporary workaround, create a separate GPO without a WMI Filter targeting the specific machine/user. 5. Engage the appropriate application team if the WMI Filter is for a specific application (Edg

---

## Phase 3: Sbsl
> 7 related entries

### Black screen after logon to Windows. Explorer.exe is NOT in Task Manager process list, and no crash event (Event ID 1000) found.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Explorer.exe started, ran, and exited without crashing. Possible causes include Access Denied errors or silent exit with non-zero status code.

**Solution**: 1) Collect Process Monitor log of the logon (use boot log if single-session scenario). 2) Review procmon for Access Denied or other errors by explorer.exe that don't occur in working scenario. 3) Check if explorer exited with non-zero status code. 4) Verify Shell registry key: HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\Shell should be 'explorer.exe'.

---

### 10+ minute logon hang or black screen after waking from sleep on Windows 10.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Critical section deadlock in GPAPI (Group Policy API) during logon or wake from sleep (KB 4339081).

**Solution**: Apply KB 4339081 hotfix. Root cause analysis requires memory dump analysis. See http://aka.ms/dbgtrain for logon hang debugging training.

---

### Slow logon with extended delay during 'Applying Group Policy' phase.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Group Policy Client service (gpsvc) processing takes excessive time during logon (KB 4077712).

**Solution**: 1) Collect xperf/WPR boot trace to identify GP processing delays. 2) Enable gpsvc debug log via registry GPSvcDebugLevel = 0x00030002. 3) Review gpresult /H output. See KB 4077712 for GP troubleshooting.

---

### Slow logoff. Delay occurs during user session logoff phase.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows Search indexing of cached profiles in registry, combined with profile deletion policy, delays logoff (KB 2576017).

**Solution**: Review and adjust profile deletion Group Policy settings. Apply KB 2576017 fix.

---

### Slow Secure Attention Sequence (SAS) - delay in presenting credential dialog after pressing Ctrl+Alt+Del.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Third-party credential providers interfering with credential dialog display. McAfee Endpoint Encryption (EEPC) is a known cause (KB 2584922).

**Solution**: 1) Check for third-party credential providers in registry. 2) Disable third-party credential providers one by one to isolate. 3) If McAfee EEPC installed, update or uninstall per KB 2584922.

---

### 20+ second delay when unlocking Windows workstation. Credential dialog slow to appear after pressing Ctrl+Alt+Del on locked screen.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: VPN connection is disconnected while screen is locked, and ForceUnlockLogon registry key is not configured (KB 4077627).

**Solution**: Set ForceUnlockLogon registry key to prevent unlock delays when VPN is disconnected. See KB 4077627. Also check for third-party credential providers.

---

### OS startup hangs or is extremely slow. System appears to deadlock during boot.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Group Policy 'Delete profiles older than N days' triggers profile deletion during profile load, causing deadlock during OS startup (KB 2703143).

**Solution**: Modify or disable the profile deletion Group Policy. Apply KB 2703143 fix.

---

## Phase 4: Windows Time
> 4 related entries

### Windows system clock resets to dates months or years off from the current time after reboot, especially on machines without outgoing SSL traffic. N...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Secure Time Seeding (STS) feature in Windows Time service uses stale SSL metadata from the registry. On restart without outgoing SSL traffic, the feature does not clear/update old registry data and sets the clock based on stale SecureTimeEstimated registry values.

**Solution**: Disable STS via registry: net stop w32time; reg add HKLM\System\CurrentControlSet\Services\W32Time\Config /v UtilizeSslTimeData /t REG_DWORD /d 0 /f; net start w32time. Can also disable via GPO (Computer Configuration > Administrative Templates > System > Windows Time Service > Global Configuration Settings). Check SecureTimeEstimated registry under HKLM\SYSTEM\CurrentControlSet\Services\W32Time\SecureTimeLimits to confirm STS as cause. Enable w32tm debug log to see 'ClockDispln Discipline: *SET

---

### VDI (Virtual Desktop Infrastructure) machines running Windows Server 2016 or Windows 10 experience unexpected time jumps despite STS bug being fixe...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: On VDI machines, the Secure Time Seeding registry data (SecureTimeEstimated under HKLM\SYSTEM\CurrentControlSet\Services\W32Time\SecureTimeLimits) is not cleared between sessions, causing stale time data to be applied on reboot even on patched OS versions.

**Solution**: Disable Secure Time Seeding on VDI golden image: reg add HKEY_LOCAL_MACHINE\System\CurrentControlSet\Services\W32Time\Config /v UtilizeSslTimeData /t REG_DWORD /d 0 /f, then restart w32time service. Apply this to the VDI template/golden image to prevent recurrence across all VDI sessions.

---

### w32tm /resync fails with 'no time data was available'. w32tm /query /configuration shows 'The service has not been started (0x80070426)' or NtpClie...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Windows Time service (w32time) is stopped or the NtpClient time provider is disabled in registry (HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\NtpClient\Enabled = 0).

**Solution**: Start the w32time service with 'net start w32time'. If NtpClient is disabled, set registry value Enabled to 1 at HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\NtpClient, restart w32time service, and retry resync.

---

### w32tm /resync fails with 'no time data was available' on a machine that cannot find a good time source within its Active Directory site.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Registry CrossSiteSyncFlags at HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\NtpClient is set to 0 (NCCSS_None), preventing Windows Time service from selecting a time source outside the machine's AD site. Default value is 2 (NCCSS_All).

**Solution**: Change CrossSiteSyncFlags registry value to 2 (default, allows cross-site synchronization) at HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\NtpClient, restart w32time service.

---

## Phase 5: Esr
> 3 related entries

### Enterprise State Roaming (ESR) settings do not sync. GPO policies for Activity Feed, PublishUserActivities, or UploadUserActivities are set to 0 (d...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: GPO settings EnableActivityFeed, PublishUserActivities, or UploadUserActivities under HKLM\SOFTWARE\Policies\Microsoft\Windows\System are configured to 0, disabling the Activity Feed and cloud sync pipeline required by ESR.

**Solution**: Check registry keys under HKLM\SOFTWARE\Policies\Microsoft\Windows\System for EnableActivityFeed, PublishUserActivities, UploadUserActivities. Ensure all three are set to 1 (enabled). Update the corresponding GPO and run gpupdate /force on the device.

---

### Enterprise State Roaming (ESR) settings do not sync despite correct GPO settings. MDMWinsOverGP is enabled causing MDM policies to override GPO set...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Registry key HKLM\Software\Microsoft\PolicyManager\current\device\ControlPolicyConflict\MDMWinsOverGP is set to DWORD 1, causing MDM policy CSP settings to take precedence over GPO. MDM-side ESR policies (EnableActivityFeed, PublishUserActivities, UploadUserActivities) may be disabled.

**Solution**: Check MDMWinsOverGP registry key. If set to 1, verify MDM-side policies for ESR are enabled. Either update MDM policies to enable ESR settings, or if GPO should take precedence, set MDMWinsOverGP to 0. Reference: Policy CSP - ControlPolicyConflict.

---

### Enterprise State Roaming (ESR) "Do not sync" policy incorrectly defaults to sync settings being ON when admin configures "Allow users to turn synci...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: ESR "Do not sync" group policy has an incorrect default value — when the policy is set to allow users to control syncing, the default state is incorrectly set to enabled (sync ON) instead of disabled (sync OFF).

**Solution**: Known issue documented in internal KB (topic/4464980). Review the ESR policy configuration and manually set the "Do not sync" policy to the desired default state. Advise customers to explicitly configure the policy value rather than relying on the default.

---

## Phase 6: Pki
> 3 related entries

### CA service fails to start with 'Keyset does not exist 0x80090016 NTE_BAD_KEYSET'
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The CA private keys are missing or inaccessible. The link between the CA certificate and its corresponding private key may be broken, or the key container file is missing.

**Solution**: 1) Run certutil -v -store my and certutil -v -verifykeys to confirm. 2) For software keys, locate and restore key container files from C:\ProgramData\Microsoft\Crypto\Keys. 3) Use certutil -repairstore to re-link cert and key. 4) For HSM keys, engage HSM vendor. 5) If old CA cert key is missing, replace its thumbprint with '-' in CACertHash registry.

---

### ADCS cluster CA fails to start with Event ID 17 CertificationAuthority
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The ADCS database is marked for restore operations. A RestoreInProgress registry key exists at HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration that prevents the CA from starting.

**Solution**: 1) Verify RestoreInProgress key exists in HKLM\SYSTEM\CurrentControlSet\Services\CertSvc\Configuration. 2) Note the cluster node owning the ADCS resource. 3) Remove the RestoreInProgress registry key on that node. 4) Restart the cluster ADCS resource.

---

### Root certificates published in AD not deployed on client machines. Certificates missing from Trusted Root CA store despite being correctly publishe...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Certificate auto-enrollment not enabled via GPO AND certificates were previously manually deleted from local store. Once deleted autoenrollment will not re-download until USN change detected in AD tracked in AEDirectoryCache registry key.

**Solution**: 1) Enable autoenrollment GPO in Computer Config > Public Key Policies > Auto-Enrollment > Enabled with both checkboxes. 2) Export then delete AEDirectoryCache registry key to force re-download. 3) Run gpupdate /force. 4) Ensure Network List Services and Network Location Awareness running.

---

## Phase 7: Secure Channel
> 3 related entries

### Citrix PVS non-persistent VDI machines lose trust relationship with domain after reboot once machine account password age threshold is reached. Net...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The Workstation (LanmanWorkstation) service lacks dependency on PvsVMAgent service. When Netlogon changes the machine password, PvsVMAgent is not notified of the registry change and does not update its ini file. On next VDA reboot, old password values are written back to the registry.

**Solution**: Add PvsVMAgent as dependency of LanmanWorkstation in the base image: 'sc config LanmanWorkstation depend= Bowser/MRxSmb20/NSI/pvsVMAgent'. Also add 'PvsVmAgent' to DependOnService REG_MULTI_SZ at HKLM\SYSTEM\CurrentControlSet\LanmanWorkstation. Citrix articles CTX249833 and CTX251326 provide additional details.

---

### 'The trust relationship between this workstation and the primary domain failed' on computers using state-reverting software (Deep Freeze, Sandboxie...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: State-reverting PCI hardware or software reverts the machine to its saved state on each reboot. After 30 days the machine password changes, but the next reboot reverts the password in the registry, causing mismatch with AD (same mechanism as non-persistent VDI).

**Solution**: Rejoin the machine to the domain and contact the state-reverting software vendor for proper configuration. Some vendors suggest disabling machine account password changes (not a Microsoft recommendation). Adjust image refresh schedule to be within password age window.

---

### 'The trust relationship between this workstation and the primary domain failed' on Windows Embedded clients after an unexpected shutdown or power l...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Windows Embedded uses a RegFilter driver that writes protected registry changes to a Regfdata volume. Changes to HKLM\SECURITY\Policy\Secrets\$machine.ACC are only committed on clean shutdown. Unclean shutdown loses the new machine account password, reverting to the old value.

**Solution**: Either (1) disable RegFilter driver: reg add HKLM\SYSTEM\CurrentControlSet\Services\RegFilter /v Start /t REG_DWORD /d 0x4, or (2) add registry filter bypass for domain secret key by adding MonitoredKeys entry with RelativeKeyName=Security\Policy\Secrets under HKLM\SYSTEM\CurrentControlSet\Services\RegFilter\Parameters.

---

## Phase 8: Office 2013
> 3 related entries

### Users in federated domain see yellow exclamation mark in Office 2013 apps when not synced to Entra ID
**Score**: 🔵 7.5 | **Source**: MS Learn

**Root Cause**: Office 2013 IDCRL detects federated domain, tries Entra ID auth, but user not synced so does not exist there

**Solution**: Set registry HKCUSoftwareMicrosoftOffice.0CommonSignInSignInOptions=3 (local AD only, non-synced users). Or upgrade to Office 2016+

---

### Users in federated domain not synced to Entra ID see yellow exclamation mark in Office 2013 apps
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: Office 2013 IDCRL detects federated domain and tries Entra ID auth; user not synced so auth fails showing warning

**Solution**: Set registry HKCU\Software\Microsoft\Office\15.0\Common\SignIn\SignInOptions to 3 (local AD auth only); or upgrade to Office 2016+. Do NOT set for synced users

---

### Users in a federated domain see a yellow exclamation mark in Office 2013 applications. The user exists in federated domain but is not synced to Ent...
**Score**: 🟡 4.5 | **Source**: MS Learn

**Root Cause**: Office 2013 uses IDCRL (Microsoft Online Services Sign-in Assistant) which detects the federated domain and tries to authenticate to Entra ID. Since the user is not synced, authentication fails silently showing the yellow mark.

**Solution**: Set registry key HKCU\Software\Microsoft\Office\15.0\Common\SignIn\SignInOptions=3 to force local AD authentication only. Alternatively, upgrade to Office 2016+ which does not have this issue.

---

## Phase 9: Dmsa
> 2 related entries

### Service configured with dMSA account fails to start with Error 1297: A privilege that the service requires to function properly does not exist in t...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The dMSA account is missing the "Log on as a service" user right in the local security policy on the machine where the service runs.

**Solution**: Open secpol.msc > Local Policies > User Rights Assignment > Log on as a service. Add the dMSA account to this privilege. Alternatively use Group Policy to assign the right.

---

### Service with dMSA fails to start with Error 1069: The service did not start due to a logon failure. Applies to both new dMSA and migrated service a...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: One or more of: (1) DelegatedMSAEnabled registry key not set under HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters, (2) msDS-DelegatedMSAState attribute not set to 3 on the dMSA object, (3) machine account not listed in PrincipalsAllowedToRetrieveManagedPassword on the dMSA, (4) machine not rebooted after registry change.

**Solution**: 1) Set registry: reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\Parameters" /v DelegatedMSAEnabled /t REG_DWORD /d 1 /f, then reboot. 2) Verify msDS-DelegatedMSAState is 3: Get-ADServiceAccount -Identity <dMSA> -Properties msDS-DelegatedMSAState. 3) Verify machine permission: Get-ADServiceAccount -Identity <dMSA> -Properties PrincipalsAllowedToRetrieveManagedPassword.

---

## Phase 10: Dfsr
> 2 related entries

### DFSR events 2212/2214 logged on most server/service restarts, event 2213 (AutoRecovery) triggered repeatedly, database failures occur after every s...
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Service Control Manager (SCM) default 20-second WaitToKillServiceTimeout is too short for complex DFSR implementations, causing forcible dfsrs.exe termination before the JET database is properly closed

**Solution**: Set registry WaitToKillServiceTimeout (HKLM\SYSTEM\CurrentControlSet\Control, String type) to 300000 (5 min). Monitor events 1006 (stopping) and 1008 (stopped) to determine actual shutdown time, then tune value accordingly. Install hotfix KB2549760 on Server 2008 R2. Max value is 1 hour (3600000). See KB2846759 for details.

---

### DFSR SYSVOL replication stops on downstream DC. Group Policy changes not replicated, backlog increasing. No DFSR events logged. Restarting DFSR or ...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: A parent folder object in the DFSR database cannot be installed due to error 87 (ERROR_INVALID_PARAMETER) at NtfsFileSystem::MakeBackupCreateWriter. Subordinate objects fail with Could not find parent, creating a cascading blockage of the entire SYSVOL content set replication. (KB4466692)

**Solution**: 1. Check debug logs for Meet::Install -> WAIT Error with code 87 and Meet::GetParent -> BLOCKED. 2. Verify replication state via PowerShell: Get-WmiObject -Namespace root\MicrosoftDFS -Class DfsrReplicatedFolderInfo (State 2 = stuck). 3. AVOID needlessly resetting SYSVOL authoritatively unless SME/TA approves. 4. AVOID database deletions/recreations unless approved by DFSR SME. 5. Contact DFSR SME or TA. See KB4466692.

---

## Phase 11: Aadc
> 1 related entries

### AADC upgrade from 1.1.819.0 to 1.1.882.0 fails with IndexOutOfRangeException at BuildMsiArguments
**Score**: 🔵 7.0 | **Source**: OneNote

**Root Cause**: AADC sync service account in registry ObjectName uses UPN format (user@domain.com) instead of Domain\User. Upgrade code splits on backslash to get domain/user, UPN format causes array index error

**Solution**: In Services.msc, change Microsoft Azure AD Sync logon account back to Domain\Username format, restart service, retry upgrade. Bug 510761 filed with PG

---

## Phase 12: Chrome Extension
> 1 related entries

### Chrome SSO fails with 'Access to the native messaging host was disabled by the administrator' in Chrome debug logs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Admin disabled Chrome native messaging host via NativeMessagingBlacklist group policy (HKLM\SOFTWARE\Policies\Google\Chrome\NativeMessagingBlacklist = * or includes com.microsoft.browsercore)

**Solution**: Whitelist BrowserCore native messaging host: add HKLM\SOFTWARE\Policies\Google\Chrome\NativeMessagingWhitelist\2 = 'com.microsoft.browsercore', or remove from NativeMessagingBlacklist

---

## Phase 13: Rds Aad Auth
> 1 related entries

### No AAD sign-in prompt appears when RDP to AADJ/HAADJ device - only Windows login prompt shown (RDS AAD Auth fallback)
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: RDS AAD Auth negotiation failed and fell back to legacy auth. Common causes: enablerdsaadauth not enabled on client/host pool, target OS unsupported (Server 2016/2019), or AVD client outdated.

**Solution**: 1. Verify enablerdsaadauth:i:1 in RDP file or AVD Host Pool properties. 2. Check target OS is supported (Win10/11, Server 2022+). 3. Check fEnableRdsAadAuth registry on target not set to 0. 4. Update AVD client to latest. 5. Test with AVD Web client as baseline.

---

## Phase 14: Provisioning Agent
> 1 related entries

### Azure AD Connect Provisioning Agent service fails to start on the server
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Group Policy prevents the local NT Service Logon Account (NT SERVICE\AADConnectProvisioningAgent) from having permissions to start the service.

**Solution**: Open Services editor, change the Logon Account for provisioning agent service to a domain admin account, restart the service.

---

## Phase 15: Aad Join
> 1 related entries

### Azure AD Join fails with error code 8018000a 'The device is already enrolled', even after removing the work or school account from Windows Settings.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Stale enrollment registry GUIDs remain under HKLM\SOFTWARE\Microsoft\Enrollments\ after a previous work/school account was registered as 'Azure AD registered'. These leftover keys block new Azure AD Join enrollment.

**Solution**: 1. Export backup: reg export HKLM\SOFTWARE\Microsoft\Enrollments\ Enrollment.reg. 2. Delete all GUID subkeys under HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Enrollments\ EXCEPT: Context, Ownership, Status, ValidNodePaths. 3. Reboot. 4. Retry Azure AD Join. Note: If a stale device object appeared in AAD portal after the error, verify its timestamp and delete it before retrying.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | WHfB PIN prompt keeps appearing at sign-in despite WHfB disabled in both GPO ... | WHfB PIN prompt triggered by SCCM Windows Hello for Busin... | Disable WHfB from SCCM and deploy changes to all users/de... | 🟢 9.0 | OneNote |
| 2 | Chrome SSO fails with 'Access to the native messaging host was disabled by th... | Admin disabled Chrome native messaging host via NativeMes... | Whitelist BrowserCore native messaging host: add HKLM\SOF... | 🟢 8.5 | ADO Wiki |
| 3 | No AAD sign-in prompt appears when RDP to AADJ/HAADJ device - only Windows lo... | RDS AAD Auth negotiation failed and fell back to legacy a... | 1. Verify enablerdsaadauth:i:1 in RDP file or AVD Host Po... | 🟢 8.5 | ADO Wiki |
| 4 | When users click 'I Forgot My PIN' on the Windows logon screen, they get the ... | The Microsoft PIN reset service is not properly configure... | 1. Verify the PIN Reset Service configuration following: ... | 🟢 8.5 | ADO Wiki |
| 5 | WHfB PIN reset from the Windows logon screen does not work on Windows 10 Prof... | PIN reset from logon screen requires Windows 10 Enterpris... | Upgrade client devices to Windows 10 Enterprise edition b... | 🟢 8.5 | ADO Wiki |
| 6 | Users who set their WHfB PIN before the PIN reset policy was applied cannot u... | During initial PIN provisioning (before PIN reset policy)... | Users must first reset their PIN manually from Settings >... | 🟢 8.5 | ADO Wiki |
| 7 | Users click I Forgot My PIN on logon screen and get error: This feature is no... | PIN reset service not configured or client lacks internet... | Verify PIN Reset Service config per MS docs. Ensure clien... | 🟢 8.5 | ADO Wiki |
| 8 | WHfB PIN reset from logon screen does not work on Windows 10 Professional. | Requires Windows 10 Enterprise build 1709+. Pro edition n... | Upgrade to Windows 10 Enterprise build 1709 or later. | 🟢 8.5 | ADO Wiki |
| 9 | Users who set WHfB PIN before PIN reset policy applied cannot use I Forgot My... | Recovery key not encrypted with PIN Reset Service public ... | Reset PIN manually first: Settings > Accounts > Sign In o... | 🟢 8.5 | ADO Wiki |
| 10 | Azure AD Connect Provisioning Agent service fails to start on the server | Group Policy prevents the local NT Service Logon Account ... | Open Services editor, change the Logon Account for provis... | 🟢 8.5 | ADO Wiki |
| 11 | Azure AD Join fails with error code 8018000a 'The device is already enrolled'... | Stale enrollment registry GUIDs remain under HKLM\SOFTWAR... | 1. Export backup: reg export HKLM\SOFTWARE\Microsoft\Enro... | 🟢 8.5 | ADO Wiki |
| 12 | Incorrect SAM account name (e.g. AzureAD\OldUsername) displayed at Start > Se... | Stale registry keys at HKLM\SOFTWARE\Microsoft\IdentitySt... | 1. Remove account from Other Users; 2. Download PSExec an... | 🟢 8.5 | ADO Wiki |
| 13 | Incorrect SAM account (AzureAD\OldUsername) displayed for Azure AD user at St... | Stale SAM account mapping cached in registry under HKLM\S... | 1) Remove account from Other Users. 2) Use PsExec (Sysint... | 🟢 8.5 | ADO Wiki |
| 14 | Windows Hello for Business PIN prompt does not appear during WHfB setup. The ... | UAC is disabled on the client device. Registry key HKLM:\... | Set EnableLUA registry key to 1: Set-ItemProperty -Path H... | 🟢 8.5 | ADO Wiki |
| 15 | GPO 'Sign-in last interactive user automatically after a system-initiated res... | Group Policy 'Computer Configuration > Policies > Adminis... | Do not use this GPO until the bug is resolved. | 🟢 8.5 | ADO Wiki |
| 16 | GPOs 'Block launching Universal Windows apps with Windows Runtime API access ... | Group Policies under 'App runtime' or 'AppLocker Policies... | These GPOs are not compatible with Windows Hello for Busi... | 🟢 8.5 | ADO Wiki |
| 17 | GPO 'Interactive logon: Number of previous logons to cache' blocks WHfB login... | Group Policy 'Computer Configuration > Windows Settings >... | Login as Local Administrator and set GPO 'Interactive log... | 🟢 8.5 | ADO Wiki |
| 18 | Newly created WHfB PIN credential cannot be used for up to 30 minutes after p... | Azure AD Connect sync cycle interval causes delay between... | Wait up to 30 minutes for sync to complete. One-time manu... | 🟢 8.5 | ADO Wiki |
| 19 | WHfB PIN unavailable for initial logon when Sign-in last interactive user GPO... | GPO 'Sign-in last interactive user automatically after sy... | Do not use this GPO until bug resolved. PIN available fro... | 🟢 8.5 | ADO Wiki |
| 20 | WHfB sign-in fails: domain not available, when Interactive logon cache GPO se... | GPO 'Interactive logon: Number of previous logons to cach... | Set Interactive logon cache GPO to minimum value 1. Requi... | 🟢 8.5 | ADO Wiki |
| 21 | Windows Hello for Business PIN setup prompt does not appear during WHfB provi... | UAC is disabled on the client device. Registry key HKLM\S... | Set EnableLUA registry key to 1 to re-enable UAC. Run: Se... | 🟢 8.5 | ADO Wiki |
| 22 | Newly provisioned WHfB PIN cannot be used immediately - user must wait up to ... | Azure AD Connect sync cycle interval causes delay between... | Wait 30 minutes after PIN creation. For troubleshooting o... | 🟢 8.5 | ADO Wiki |
| 23 | WHfB PIN configuration dialog opens and immediately closes or does not comple... | Certain GPOs incompatible with WHfB on Win10 1709: App ru... | Remove or disable incompatible GPOs. For Sign-in last int... | 🟢 8.5 | ADO Wiki |
| 24 | WHfB sign-in fails: 'We cannot sign you in with this credential because your ... | Logon cache count GPO set to 0 or too low, preventing cac... | Set GPO: Computer Config > Windows Settings > Security Se... | 🟢 8.5 | ADO Wiki |
| 25 | WHfB: All options under Settings > Accounts > Sign-in Options are grayed out.... | Registry key HKLM\SOFTWARE\Microsoft\PolicyManager\defaul... | Set the registry key Value to 1: HKLM\SOFTWARE\Microsoft\... | 🟢 8.5 | ADO Wiki |
| 26 | WHfB PIN registration fails with error 0x800706d9 after completing MFA succes... | The NgcCtnrSvc (Microsoft Passport Container) service was... | 1. Set registry HKLM\SYSTEM\CurrentControlSet\Services\Ng... | 🟢 8.5 | ADO Wiki |
| 27 | WHfB PIN Reset: User clicks 'I Forgot My PIN' on login screen and gets error ... | Either (1) PIN Reset Service is not properly configured, ... | 1. Verify PIN Reset Service configuration per https://lea... | 🟢 8.5 | ADO Wiki |
| 28 | All options under Settings > Accounts > Sign-in Options are grayed out - cann... | Registry AllowSignInOptions Value set to 0, disabling all... | Set registry AllowSignInOptions Value to 1. Check if Grou... | 🟢 8.5 | ADO Wiki |
| 29 | WHFB PIN registration fails with error 0x800706d9 after completing MFA - NgcC... | NgcCtnrSvc (Microsoft Passport Container) service is disa... | Set registry HKLM\SYSTEM\CurrentControlSet\Services\NgcCt... | 🟢 8.5 | ADO Wiki |
| 30 | WHfB PIN Reset: I Forgot My PIN on login screen returns This feature is not s... | PIN Reset Service not configured, or client has no intern... | Verify PIN Reset Service config. Ensure client has intern... | 🟢 8.5 | ADO Wiki |
