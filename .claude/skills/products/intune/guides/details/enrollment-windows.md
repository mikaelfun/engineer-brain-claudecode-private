# INTUNE Windows 注册与 Auto-Enrollment — 已知问题详情

**条目数**: 42 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Microsoft Intune Enrollment service principal (AppId d4ebce55-015a-49b5-a083-c84d1797ae8c) missing from Azure AD; MDM auto-enrollment fails
**Solution**: 1) Go to Azure portal > Azure Active Directory > MDM > select 'Microsoft Intune Enrollment' > Delete. 2) Open admin PowerShell: Connect-AzureAD, then run New-AzureADServicePrincipal -AppId d4ebce55-015a-49b5-a083-c84d1797ae8c. Verify with Get-AzureADServicePrincipal | Where-Object DisplayName -like '*Intune*'.
`[Source: onenote, Score: 9.5]`

### Step 2: Co-managed Windows device fails to auto-enroll to Intune via scheduled task; need to manually trigger MDM enrollment using AAD device credentials
**Solution**: Manually trigger: elevated CMD > C:\Windows\System32 > DeviceEnroller.exe /c /AutoEnrollMDMUsingAADDeviceCredential. Verify scheduled task: Task Scheduler > Microsoft > Windows > EnterpriseMgmt. For ConfigMgr path: verify WMI ROOT\CCM\CCM_CloudClientConfig > AutoAADJoin = True using WmiExplorer. Check CoManagementHandler.log. If CCM_CloudClientConfig missing, ConfigMgr client settings incorrect.
`[Source: onenote, Score: 9.5]`

### Step 3: Windows 10 device fails to auto-enroll in Intune via GPO 'Enable automatic MDM enrollment using default Azure AD credential'. Scheduled Task for MD...
**Solution**: 1) Deploy 'Enable automatic MDM enrollment using default Azure AD credential' via Domain GPO instead of Local GPO to bypass the local GPO blocking. 2) Verify MDM authority is set to Intune (not Unknown). 3) After fixing both, confirm Task Schedule is created and device enrolls successfully.
`[Source: onenote, Score: 9.5]`

### Step 4: Intune auto-enrollment via GPO fails on some VMs because Group Policy is not delivered in time after VM start.
**Solution**: Run gpupdate /force to force GPO update, then verify with gpresult /r that the MDM auto-enrollment policy is applied. Once GPO is delivered, VM enrolls to Intune successfully.
`[Source: onenote, Score: 9.0]`

### Step 5: Auto MDM Enroll: Failed with error 0x8018002b via Group Policy. Event ID 76 logged in DeviceManagement-Enterprise-Diagnostics-Provider/Admin.
**Solution**: For UPN issue: change user UPN suffix to a valid verified domain in AD Users and Computers, then force delta sync (Start-ADSyncSyncCycle -PolicyType Delta). For MDM scope: set MDM user scope to All or Some in Entra ID > Mobility > Microsoft Intune.
`[Source: mslearn, Score: 8.0]`

### Step 6: Windows 10 GP-based auto-enrollment fails with 0x80180002b. dsregcmd /status shows AzureAdPrt=NO and incorrect TenantId/AuthCodeUrl.
**Solution**: dsregcmd /leave, delete device in Entra, unjoin from AD, delete device from DC, rejoin AD, delta sync, verify AzureAdJoined/DomainJoined/AzureAdPrt=YES, gpupdate /force.
`[Source: mslearn, Score: 8.0]`

### Step 7: GPO-based auto-enrollment into Intune fails for co-managed hybrid AAD joined devices; dsregcmd /status shows AzureAdPrt: NO; device cannot obtain P...
**Solution**: In Active Directory Users and Computers open user properties Account tab, modify UPN suffix from non-routable (e.g., wmt.local) to routable domain (e.g., company.com). Verify with whoami /upn and dsregcmd /status (AzureAdPrt should show YES).
`[Source: onenote, Score: 7.5]`

### Step 8: Question whether GPO Enable automatic MDM enrollment using default Azure AD credentials is required for co-management MDM enrollment of hybrid AAD ...
**Solution**: GPO is NOT required for co-management auto-enrollment. Without GPO: ConfigMgr CoManagementHandler queues enrollment timer, waits for user logon, enrolls when timer fires. With GPO: enrollment triggers immediately via scheduled task. Use GPO when faster enrollment is desired. Both methods result in the same co-managed state. Log: CoManagementHandler.log shows timer scheduling and enrollment flow.
`[Source: onenote, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Microsoft Intune Enrollment service principal (AppId d4ebce55-015a-49b5-a083-... | The 'Microsoft Intune Enrollment' enterprise application was accidentally del... | 1) Go to Azure portal > Azure Active Directory > MDM > select 'Microsoft Intu... | 9.5 | onenote |
| 2 | Co-managed Windows device fails to auto-enroll to Intune via scheduled task; ... | Auto-enrollment scheduled task under Enterprise Management may fail or not tr... | Manually trigger: elevated CMD > C:\Windows\System32 > DeviceEnroller.exe /c ... | 9.5 | onenote |
| 3 | Windows 10 device fails to auto-enroll in Intune via GPO 'Enable automatic MD... | Local GPO setting 'Turn off Local Group Policy Objects processing' was enable... | 1) Deploy 'Enable automatic MDM enrollment using default Azure AD credential'... | 9.5 | onenote |
| 4 | Intune auto-enrollment via GPO fails on some VMs because Group Policy is not ... | After VM boot, GPO was not delivered to the VM automatically. Without GPO, th... | Run gpupdate /force to force GPO update, then verify with gpresult /r that th... | 9.0 | onenote |
| 5 | Auto MDM Enroll: Failed with error 0x8018002b via Group Policy. Event ID 76 l... | UPN contains unverified or non-routable domain suffix (e.g., .local), or MDM ... | For UPN issue: change user UPN suffix to a valid verified domain in AD Users ... | 8.0 | mslearn |
| 6 | Windows 10 GP-based auto-enrollment fails with 0x80180002b. dsregcmd /status ... | Device previously joined to different Entra tenant without proper unjoin. Sta... | dsregcmd /leave, delete device in Entra, unjoin from AD, delete device from D... | 8.0 | mslearn |
| 7 | GPO-based auto-enrollment into Intune fails for co-managed hybrid AAD joined ... | User UPN suffix in Active Directory is non-routable (e.g., .local domain), pr... | In Active Directory Users and Computers open user properties Account tab, mod... | 7.5 | onenote |
| 8 | Question whether GPO Enable automatic MDM enrollment using default Azure AD c... | Without GPO, co-management queues an enrollment timer with randomization dela... | GPO is NOT required for co-management auto-enrollment. Without GPO: ConfigMgr... | 7.5 | onenote |
| 9 | Linux 设备注册时出现 Error 1001 / 'An unexpected error has occurred'；日志显示 ErrorCode:... | 租户启用了 SSPR（Self-Service Password Reset），用户首次登录时被重定向到 mysignins 页面注册必需的 MFA 方法... | 让用户先打开浏览器登录 Azure Portal（portal.azure.com）→ 自动跳转到 mysignins → 注册所需的身份验证方法 → 返... | 7.5 | ado-wiki |
| 10 | Windows 10 MDM auto-enrollment into Intune via GPO fails. Task Scheduler gene... | This can occur if MDM user scope is set to None in Azure AD Mobility settings. | Navigate to Azure portal > Azure Active Directory > Mobility (MDM and MAM) > ... | 7.5 | contentidea-kb |
| 11 | When attempting to join a Windows 10 PC to Azure Active Directory, the join f... | This can occur if both of the following conditions exist: MDM auto-enrollment... | Either disable MDM auto-enrollment in Azure, or uninstall the PC agent or SCC... | 7.5 | contentidea-kb |
| 12 | In the Azure Intune portal under Devices -&gt; All Devices, some devices show... | This can occur if the users with missing information originally had a valid I... | To resolve this problem, go to the Office 365 portal -&gt; Users and assign t... | 7.5 | contentidea-kb |
| 13 | After configuring Exchange Online, Windows 10 users receive errors similar to... | This can occur if the default Windows device policies in the O365 portal are ... | To resolve this problem, assuming the customer does not want this functionali... | 7.5 | contentidea-kb |
| 14 | After configuring a Device Restriction policy that sets "Manual Unenrollment"... | This can occur if the Windows computer is Azure AD joined and MDM auto-enroll... | If you wish you use this policy setting, you will need to either disable auto... | 7.5 | contentidea-kb |
| 15 | Windows 10 MDM auto-enrollment into Intune via GPO fails and the following sy... | This can occur if the domain for the UPN is either unverified or unroutable. ... | To resolve this problem, complete the following:1.	Open Active Directory User... | 7.5 | contentidea-kb |
| 16 | Configuring and Deploying Hybrid Autopilot in a Hyper-V environment          ... |  |  | 7.5 | contentidea-kb |
| 17 | BackgroundYou want to enroll a domain-joined Windows 10 device into Intune. D... |  |  | 7.5 | contentidea-kb |
| 18 | When attempting to install the Intune Connector for Active Directory, during ... | Internet Explorer Enhanced Security Configuration mode&nbsp;is active on Wind... | To resolve this issue, turn off IE Enhanced Security Configuration for the Ad... | 7.5 | contentidea-kb |
| 19 | This article contains resources for troubleshooting Co-Management issues in M... |  |  | 7.5 | contentidea-kb |
| 20 | We have a blog post by Intune Support Engineer Saurabh Sarkar where he walks ... |  |  | 7.5 | contentidea-kb |
| 21 | Tell me about the problem you are having?&nbsp; Technician Only:&nbsp; Make s... |  |  | 7.5 | contentidea-kb |
| 22 | When we follow steps below to auto enroll hybrid AAD joined devices &amp; use... | When the auto-enrollment Group Policy is enabled, a task is created in the ba... | After we sign-in the MFA enabled account into the windows, there will be prom... | 7.5 | contentidea-kb |
| 23 | When scoping a case for Device Profiles it's important to get the following i... |  |  | 7.5 | contentidea-kb |
| 24 | Windows devices not enrolling into Intune as Co-Managed with error code This ... | Device was enrolled with other MDM previously. | Device was showing as Hybrid Azure AD Join on Intune console however, was not... | 7.5 | contentidea-kb |
| 25 | Intune Device Actions: Fresh Start                       Fresh Start is one o... |  |  | 7.5 | contentidea-kb |
| 26 | In this scenario, Hybrid Azure AD Joined devices were failing to enroll in In... | We confirmed the enrollment was not getting blocked by a group policy. Instea... | Depending on your Windows version, open Regedit and navigate to the following... | 7.5 | contentidea-kb |
| 27 | Windows 10 devices fail to enroll in Intune using co-management in a GCC-H en... | Dsregcmd /status cmdlet shows the computers picked the wrong Endpoints (.com ... | To resolve this problem, change the endpoint in Azure Active Directory -&gt; ... | 7.5 | contentidea-kb |
| 28 | Auto-enrollment succeeds on Windows 10, version 1803 or later doing co-manage... | This issue can occur when one or both of the following are true:1. Multi-fact... | To fix the issue, use one of the following methods based on the solution the ... | 7.5 | contentidea-kb |
| 29 | &nbsp;The MDM Terms of Use are set in the Mobility (MDM and MAM) blade of Azu... |  |  | 7.5 | contentidea-kb |
| 30 | Devices with Windows 10&nbsp;or later versions fail to enroll in Intune when ... | This can occur if the DisableRegistration value is set to 1 in the registry u... | To resolve this issue, change the DisableRegistration value in the registry t... | 7.5 | contentidea-kb |
| 31 | Scenario: Windows Hybrid Entra Joined devices are failing to enroll in Intune... | Dsregcmd /status and AAD logs (Operational and Analytics logs) reveal the iss... | Since this issue stems from Entra configuration, the customer should engage t... | 7.5 | contentidea-kb |
| 32 | Windows devices fail to enroll into Intune using co-management. In Configurat... | The enrollment failed because the email attribute in the enrollment request w... | Two remediation options: Option A – Re-register the device with Entra (Prefer... | 7.5 | contentidea-kb |
| 33 | Co-management enrollment fails with error 0x80180018, indicating an MDM user ... | The issue was caused by incorrect tenant metadata on the device, resulting in... | 1. Corrected the Service Connection Point (SCP) With assistance from the Iden... | 7.5 | contentidea-kb |
| 34 | CSS Support repo: How to verify your Windows 10 Group Policy-based auto-enrol... |  |  | 7.5 | contentidea-kb |
| 35 | Personal Windows device users are unexpectedly enrolled in Intune MDM when ad... | When a work/school account is added to a personal Windows device, Windows dis... | Enable the 'Disable MDM enrollment when adding work or school account on Wind... | 7.0 | ado-wiki |
| 36 | Co-management: Hybrid Azure AD join auto MDM enroll fails with error 0x801800... | MFA is Enforced (not just Enabled), preventing ConfigMgr client agent from en... | Set MFA to Enabled but not Enforced, or temporarily disable via Trusted IPs. | 6.5 | mslearn |
| 37 | Co-management: Device sync fails after auto-enrollment. Error 0xcaa2000c inte... | MFA or CA policies requiring MFA applied to all cloud apps block user token. | Disable per-user MFA, use Trusted IPs, or exclude Intune app from CA policies... | 6.5 | mslearn |
| 38 | Co-management: Enroll fails with 0x800706D9 or 0x80180023. dmwappushservice m... | dmwappushservice service is missing from the device. | Export dmwappushservice reg key from working device, merge on affected, resta... | 6.5 | mslearn |
| 39 | Co-management: Hybrid AAD join fails 0x801c03f2. Public key user certificate ... | UserCertificate attribute missing or not synced to Azure AD. | dsregcmd /leave, delete MS-Organization-Access cert, restart, verify cert on ... | 6.5 | mslearn |
| 40 | When attempting to install the Intune Connector for Active Directory, during ... | Internet Explorer Enhanced Security Configuration mode is active on Windows S... | To resolve this issue, turn off IE Enhanced Security Configuration for the Ad... | 4.5 | contentidea-kb |
| 41 | Configuring and Deploying Hybrid Autopilot in a Hyper-V environment Requireme... |  |  | 3.0 | contentidea-kb |
| 42 | Background You want to enroll a domain-joined Windows 10 device into Intune. ... |  |  | 3.0 | contentidea-kb |
