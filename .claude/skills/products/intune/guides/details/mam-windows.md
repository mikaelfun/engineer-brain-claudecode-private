# INTUNE Windows MAM 与 WIP / Edge — 已知问题详情

**条目数**: 66 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: WIP policy fails to apply with error 0x807C0003 on EDPEnforcementLevel CSP; MDM diagnostic shows status 500 for EnterpriseDataProtection/Settings/E...
**Solution**: 1. Disable Direct Access on the device or exclude it from Direct Access policy; 2. Re-sync device with Intune; 3. Verify via MDM diagnostic report that EnterpriseDataProtection CSP returns 200; 4. Reference EDP CSP pre-check error codes from Windows source for other error scenarios
`[Source: ado-wiki, Score: 9.0]`

### Step 2: DFS namespace path (\domain.name) is not recognized as corporate by WIP, but direct FQDN path (\fileserver.domain.name) works correctly
**Solution**: 1. In WIP Advanced settings > Network Perimeters > IPv4/IPv6 ranges, add the IP address range assigned to all servers that are members of the DFS namespace; 2. Keep the domain name in Protected domains; 3. Re-sync the device; 4. For further network issues, engage Windows Networking team
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Firefox, Chrome, WhatsApp desktop or other apps using custom network stack are blocked from accessing corporate resources even though they are in t...
**Solution**: Add the /*AppCompat*/ string to the WIP Cloud resources setting to stop Windows from automatically blocking connections from apps that use IP addresses instead of FQDNs
`[Source: ado-wiki, Score: 9.0]`

### Step 4: MAM (Mobile Application Management) for Edge on Windows fails when device is Azure AD joined (AADJ) or Hybrid Azure AD joined (HAADJ). Conditional ...
**Solution**: 1) Ensure device Join Type is 'Azure AD registered'; 2) Uncheck 'Allow my organization to manage my device' during registration; 3) Verify MAM flags via edge://edge-dlp-internals (mslrmv2=Enabled, msMamDlp=Enabled); 4) If flags don't persist: msedge --enable-features=msDesktopMam; 5) Check mamlog.txt at %LOCALAPPDATA%\Microsoft\; 6) Requirements: Win11 22H2+, Edge v115+, Intune license, Entra ID P1.
`[Source: onenote, Score: 8.0]`

### Step 5: WIP without enrollment (WE) policy not applying / device cannot connect to WIP MAM endpoint wip.mam.manage.microsoft.com
**Solution**: Ensure TCP port 444 is allowed through the customer firewall for WIP without enrollment connectivity. Also verify user has Azure AD Premium license (required for WIP WE).
`[Source: ado-wiki, Score: 8.0]`

### Step 6: Only one Intune app configuration policy is applied to Microsoft Edge or Managed Browser when multiple configuration profiles targeting the same se...
**Solution**: Configure each setting in only a single app configuration policy per user/group. Use exclusion groups to ensure no user is targeted by multiple policies with the same settings.
`[Source: mslearn, Score: 8.0]`

### Step 7: Windows MAM 用户在 Edge Work Profile 创建期间 AAD 设备注册完成后仍被阻止访问受保护资源
**Solution**: 1. 等待约 1 分钟后在不同标签页中重新导航到目标页面；2. 如持续被阻止，管理员应检查 Intune MAM 策略是否正确应用到该用户；3. 检查 CA 策略配置中 Require app protection policy 是否启用
`[Source: ado-wiki, Score: 7.5]`

### Step 8: 用户在 Edge 中使用预先存在的未注册账号登录后，永久无法完成 MAM 注册，始终被 Conditional Access 阻止
**Solution**: 1. 用户需要从 Edge 中移除该工作账号；2. 从 Settings > Accounts > Access work or school 移除组织账号；3. 重新在 Edge 中添加工作账号并确保通过 Heads Up Page 完成设备注册；4. 如问题持续，可能需要清除 Edge Profile 数据重新开始
`[Source: ado-wiki, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | WIP policy fails to apply with error 0x807C0003 on EDPEnforcementLevel CSP; M... | Direct Access is enabled on the device, which conflicts with WIP deployment. ... | 1. Disable Direct Access on the device or exclude it from Direct Access polic... | 9.0 | ado-wiki |
| 2 | DFS namespace path (\domain.name) is not recognized as corporate by WIP, but ... | WIP network isolation policy only includes the domain name but not the IP add... | 1. In WIP Advanced settings > Network Perimeters > IPv4/IPv6 ranges, add the ... | 9.0 | ado-wiki |
| 3 | Firefox, Chrome, WhatsApp desktop or other apps using custom network stack ar... | These apps use their own network stack and resolve connections by IP address ... | Add the /*AppCompat*/ string to the WIP Cloud resources setting to stop Windo... | 9.0 | ado-wiki |
| 4 | MAM (Mobile Application Management) for Edge on Windows fails when device is ... | Desktop MAM for Edge on Windows only supports Azure AD registered (Workplace ... | 1) Ensure device Join Type is 'Azure AD registered'; 2) Uncheck 'Allow my org... | 8.0 | onenote |
| 5 | WIP without enrollment (WE) policy not applying / device cannot connect to WI... | TCP port 444 is blocked by customer firewall. WIP WE uses port 444/TCP for MA... | Ensure TCP port 444 is allowed through the customer firewall for WIP without ... | 8.0 | ado-wiki |
| 6 | Only one Intune app configuration policy is applied to Microsoft Edge or Mana... | Intune does not support merging Edge or Managed Browser app configuration pol... | Configure each setting in only a single app configuration policy per user/gro... | 8.0 | mslearn |
| 7 | Windows MAM 用户在 Edge Work Profile 创建期间 AAD 设备注册完成后仍被阻止访问受保护资源 | 设备注册和 MAM 注册过程虽然成功完成，但 CA 策略评估存在延迟，导致用户在短时间内仍被 Conditional Access 阻止 | 1. 等待约 1 分钟后在不同标签页中重新导航到目标页面；2. 如持续被阻止，管理员应检查 Intune MAM 策略是否正确应用到该用户；3. 检查 C... | 7.5 | ado-wiki |
| 8 | 用户在 Edge 中使用预先存在的未注册账号登录后，永久无法完成 MAM 注册，始终被 Conditional Access 阻止 | 如果 Edge 中存在预先登录但未通过 Heads Up Page 进行设备注册的账号，该账号将永远无法正确注册到 MAM，这是一个已知的产品限制 | 1. 用户需要从 Edge 中移除该工作账号；2. 从 Settings > Accounts > Access work or school 移除组织账... | 7.5 | ado-wiki |
| 9 | MAM Health Check 阻止对话框被关闭后，用户切换到非托管 Edge Profile 再切回托管 Profile 后可绕过保护访问受保护内容 | MAM Health Check 阻止对话框的状态在 Profile 切换时未正确持久化，存在安全漏洞（修复进行中） | 1. 这是已知安全问题，修复将通过 Microsoft Edge 更新发布；2. 临时缓解：教育用户不要在被阻止时切换 Profile；3. 管理员可考虑... | 7.5 | ado-wiki |
| 10 | 启用 MAM 的 Edge Profile 中 BingChat 上下文聊天功能被阻止 | Windows MAM 的 DLP 策略会阻止 BingChat 的 Contextual Chat 功能，这是已知限制而非 bug | 1. 告知客户这是预期行为——MAM 策略会阻止 BingChat 上下文功能；2. 用户可在非托管 Profile 中使用 BingChat；3. 此限... | 7.5 | ado-wiki |
| 11 | WIP is not applying when updating from Office Pro Plus version 1706 or 1707 t... | Office executables code signed by the wrong CA | Office suite: Non-security updates must be performed for version 1707 and it ... | 7.5 | contentidea-kb |
| 12 | Intune for Education: Take a Test Profile See https://technet.microsoft.com/e... |  |  | 7.5 | contentidea-kb |
| 13 | When configuring the option "Use private store only" in the Intune for EDU po... | Targeted computers have Windows PRO Education which does not support the Requ... | The RequirePrivateStoreOnly CSP policy is not supported on Windows 10 PRO Edu... | 7.5 | contentidea-kb |
| 14 | OverviewIt is important to have a basic understanding of CSPs (Configuration ... |  |  | 7.5 | contentidea-kb |
| 15 | When attempting to enroll a Windows 10 computer in Intune, or join a Windows ... | This can occur if the MDM terms and conditions in Azure AD is blank or does n... | To resolve this problem, ensure that the MDM terms of use URL in Azure AD has... | 7.5 | contentidea-kb |
| 16 | This article describes the technical support boundaries for Windows Informati... |  |  | 7.5 | contentidea-kb |
| 17 | If a machine is joined to AD and enrolled in MDM some of the AD Group Policie... |  |  | 7.5 | contentidea-kb |
| 18 | On Windows 10 devices, an administrator can create a block list for Microsoft... |  |  | 7.5 | contentidea-kb |
| 19 | Training: Troubleshooting Windows MDM client and CSP issues. Covers SyncML, M... |  |  | 7.5 | contentidea-kb |
| 20 | Windows Information Protection was not applying on Office 365 suite when down... |  |  | 7.5 | contentidea-kb |
| 21 | We have deployed Kiosk profile or AssignedAccess CSP profile to Windows devic... | By design. The logoff was initiated from explorer.exe, and this is because of... | Deploy the profile to individual Azure AD accounts, autologin accounts or loc... | 7.5 | contentidea-kb |
| 22 | You experience one of more of the following issues: JCYou cannot load the “He... | This can occur if your browser is configured to block 3rd party cookies. | To resolve this issue, configure your browser to allow cookies. The example b... | 7.5 | contentidea-kb |
| 23 | After creating and deploying a custom policy for windows OS, it reports back ... | Apparently, Intune is currently unable to confirm successful application of c... | It is highly suggested to use the built in features as Intune will need to cr... | 7.5 | contentidea-kb |
| 24 | Intune uses various CSP's provided by Windows to apply settings configured th... |  |  | 7.5 | contentidea-kb |
| 25 | There has been some confusion about Windows Information Protection (&quot;WIP... |  | The Admin ExperienceWindows Information Protection (WIP), previously known as... | 7.5 | contentidea-kb |
| 26 | Customer would like to know how to implement an Intune policy to change file ... | This is a how to article. | Create a new Configuration –      Custom policy for Windows 10 devices:2. Cli... | 7.5 | contentidea-kb |
| 27 | When you create an app protection policy for iOS/iPadOS and Android apps, you... |  |  | 7.5 | contentidea-kb |
| 28 | Microsoft Endpoint Manager - Intune - Client Apps - Part III - Windows Inform... |  |  | 7.5 | contentidea-kb |
| 29 | You cannot deploy a WIP policy to Windows 10 devices. The policy is partially... | This can occur if the target device has Direct Access enabled. This is not co... | To resolve this issue, disable Direct Access on the client machine. | 7.5 | contentidea-kb |
| 30 | When attempt to synchronize files with OneDrive, the process fails with error... | The identity used to sign in in Windows/OneDrive is not included on the WIP p... | Edit the WIP policy -&gt;      Add a network Boundary -&gt; Protected Domains... | 7.5 | contentidea-kb |
| 31 | Customer has ACE Agent Extension working with the Edge browser. When a&nbsp;W... | This is caused by incorrect settings for Network Boundary in the WIP policy. | To resolve this problem, add the following to the&nbsp;WIP policy Cloud Resou... | 7.5 | contentidea-kb |
| 32 | Support Tip:&nbsp;&nbsp;&nbsp; Managing Google Chrome and Mozilla Firefox in ... |  |  | 7.5 | contentidea-kb |
| 33 | Important re-branding noticeOffice 365 ProPlus is being renamed to&nbsp;Micro... | By Design Behavior. | By Design Behavior.&nbsp;From a technical POV, the Office Clipboard is shared... | 7.5 | contentidea-kb |
| 34 | When a WIP policy is deployed to devices running Edge Chromium keep in mind t... |  |  | 7.5 | contentidea-kb |
| 35 | Case Description==================Corporate files can’t be opened by Microsof... |  |  | 7.5 | contentidea-kb |
| 36 | WIP WE policy is successfully applied, however, files can’t be marked as corp... | The encryption is implemented by Encrypting File System (EFS). The error abov... | To resolve this problem, complete the following:\ 1. Check the EFS recovery p... | 7.5 | contentidea-kb |
| 37 | This profile does not perform any action by itself. It allows to create a lis... |  |  | 7.5 | contentidea-kb |
| 38 | When deploying a WIP policy, the system performs a series of pre-checks to ma... |  |  | 7.5 | contentidea-kb |
| 39 | Users are unable to copy and paste corporate files from a Windows 10 device t... | This can occur if the DNS suffix of the VPN adapter (found by running&nbsp;ip... | To resolve this, the customer's internal network team should check and&nbsp;c... | 7.5 | contentidea-kb |
| 40 | When using Windows Information Protection (WIP) to protect cloud resources wi... | This can occur if the connected work account's domain isn't protected. To ver... | To resolve this problem do one of the following:change the Corporate identity... | 7.5 | contentidea-kb |
| 41 | This lab serves to:Improve a Support Engineer's knowledge of Windows Informat... |  |  | 7.5 | contentidea-kb |
| 42 | Engineers need to read and understand below topics before starting this lab.K... |  |  | 7.5 | contentidea-kb |
| 43 | High-level steps (Details): Note that this part should be completed by yourse... |  |  | 7.5 | contentidea-kb |
| 44 | How would you verify the component works as expected using the GUI, logs and ... |  |  | 7.5 | contentidea-kb |
| 45 | The links below should help improve your understanding of the components and ... |  |  | 7.5 | contentidea-kb |
| 46 | Windows devices fail to apply expedited update policy. In the Windows Expedit... | This can occur if the&nbsp;IsActiveZeroExhaust CSP is enabled. In this scenar... | If updates are required,&nbsp;IsActiveZeroExhaust should not be set to 1. Ins... | 7.5 | contentidea-kb |
| 47 | MAM: Allowed URLs are opening in InPrivate mode when accessed from Microsoft ... | This can occur if you have&nbsp;openInPrivateIfBlocked is set to True&nbsp;in... | To resolve this problem, add all the Intune and Office365 Endpoints which are... | 7.5 | contentidea-kb |
| 48 | Windows 10 enterprise devices fail to load corporate apps and all apps runnin... | This can occur if&nbsp;Windows Information Protection (WIP) is enabled.  It i... | Turn off WIP and delete&nbsp;all of the files at C:\Windows\System32\AppLocke... | 7.5 | contentidea-kb |
| 49 | When trying&nbsp;to deploy a Windows Information Protection (WIP) Without Enr... | In Azure AD, Mobility (MDM and MAM) was not targeted to the Users group of em... | To resolve this problem and apply WIP Without Enrollment policy to Teams and ... | 7.5 | contentidea-kb |
| 50 | WIP-WE policy inconsistencies: As we downloaded a file from SPO or Outlook on... | The WIP policy was allowed for the right Edge policy, and it did not have the... | 1.     Need to add URL:      attachments.office.net      to the cloud reso... | 7.5 | contentidea-kb |
| 51 | Customers might create support cases for Intune that should instead be create... |  |  | 7.5 | contentidea-kb |
| 52 | Customer deployed&nbsp;Secured-core PC configuration lock to their Windows 11... | The 0x86000029 error does indicate Secure-Core PC is not ready and it occurs ... | Customer will have to contact with hardware vendor, they must implement Built... | 7.5 | contentidea-kb |
| 53 | On scenarios where an end user is trying to sign-in to their O365 accounts on... |  |  | 7.5 | contentidea-kb |
| 54 | The purpose of this article is to assist CSS Intune Support with messaging an... |  |  | 7.5 | contentidea-kb |
| 55 | Windows Defender firewall offers the option to log the successful and dropped... |  |  | 7.5 | contentidea-kb |
| 56 | The customer had requirement to whitelist &quot;logln.microsoftonline.eu.com&... | Intune MS edge SmartScreen URL whitelist ADMX policy was not working as expec... | From Intune, it's possible to exempt an URL from smart screen via setting cat... | 7.5 | contentidea-kb |
| 57 | Always-On VPN disconnects when the device sync with Intune if you deploy the ... | SyncML mismatch between Win11 OS and Cloud CSP cache, Intune will send a &quo... | Make sure the deployed VPN Profile XML is working and user is able to connect... | 7.5 | contentidea-kb |
| 58 | Organizations implementing Microsoft Purview Data Loss Prevention (DLP) for b... | This behavior occurs due to Microsoft Purview Data Loss Prevention (DLP) enfo... | There is no Intune-side remediation available to bypass or override this beha... | 7.5 | contentidea-kb |
| 59 | Scenario When Endpoint Privilege Management (EPM) is enabled, Intune installs... | If&nbsp;App Control for Business (ACfB)&nbsp;with&nbsp;Managed Installer&nbsp... | Let me start by explaining what is going on. First when the EnterpriseDesktop... | 7.5 | contentidea-kb |
| 60 | When deploying the Intune Reboot CSP (as documented in Related Content sectio... | The task generated by the Intune Reboot CSP is created by importing a task th... | As a workaround, the reboot schedule must be configured with UTC time explici... | 7.5 | contentidea-kb |
| 61 | edge://edge-dlp-internals 显示 MAM flags 未启用，手动启用后关闭所有 Edge 实例后不持久 | MAM 未正确注册到设备/用户，导致 DLP 标志无法持久化。可能是设备注册问题或 MAM 策略未正确下发 | 1. 此场景归属 Edge 支持团队（Browser > Microsoft Edge > Edge for Windows）；2. 检查 MamCach... | 6.5 | ado-wiki |
| 62 | RemoteWipe doWipe fails on Windows 10 with Event ID 400 The request is not su... | Windows Recovery Environment (WinRE) is disabled. RemoteWipe CSP requires WinRE. | Run Reagentc /info as admin to check WinRE status. If Disabled troubleshoot a... | 6.5 | mslearn |
| 63 | We have deployed Kiosk profile or AssignedAccess CSP profile to Windows devic... | By design. The logoff was initiated from explorer.exe, and this is because of... | Deploy the profile to individual Azure AD accounts, autologin accounts or loc... | 4.5 | contentidea-kb |
| 64 | Windows Information Protection was not applying on Office 365 suite when down... |  |  | 3.0 | contentidea-kb |
| 65 | You experience one of more of the following issues: JC You cannot load the “H... | This can occur if your browser is configured to block 3rd party cookies. | To resolve this issue, configure your browser to allow cookies. The example b... | 3.0 | contentidea-kb |
| 66 | After creating and deploying a custom policy for windows OS, it reports back ... | Apparently, Intune is currently unable to confirm successful application of c... | It is highly suggested to use the built in features as Intune will need to cr... | 3.0 | contentidea-kb |
