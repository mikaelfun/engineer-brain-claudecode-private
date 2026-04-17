# INTUNE Autopilot 通用问题 — 已知问题详情

**条目数**: 180 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Intune Windows Autopilot 在 21V 仅支持旧版（v1），v2 支持较晚
**Solution**: 部分支持：Autopilot v2 自 2409 起已 GA；若客户使用旧版本请升级到 2409+ 或改用 v1 流程
`[Source: 21v-gap, Score: 9.5]`

### Step 2: Windows Intune enrollment fails; OMA-DM sync does not execute after omadmprc.exe activation; SessionState set to 5 prematurely; error SCHED_E_UNKNO...
**Solution**: Identify the corrupted task trigger registry entry. Fix or delete the invalid Triggers binary value under the offending TaskCache\Tasks\{GUID}. The corrupted task is unrelated to Intune (e.g., Media Center) but blocks OMA-DM session activation globally.
`[Source: onenote, Score: 9.5]`

### Step 3: Windows device enrollment fails with error 0x800706BE or 0x80010106, svchost_DmEnrollmentSvc crashes during enrollment. Event ID 1000 (application ...
**Solution**: 1) Collect ProcessMonitor + Event Logs + WER dumps per HKLM\Software\Microsoft\Windows\Windows Error Reporting\LocalDumps\svchost. 2) Identify the third-party component (GEC20203) from dump analysis. 3) Uninstall or isolate the conflicting security software. 4) Retry enrollment.
`[Source: onenote, Score: 9.5]`

### Step 4: During Windows Autopilot OOBE, another company logo is shown instead of the correct organization branding. Device hardware hash already registered ...
**Solution**: 1) Confirm device ownership and collect hardware hash: mdmdiagnosticstool -area Autopilot -cab c:	emp\out.cab. 2) Fill out Intune SAW request form (https://aka.ms/SAWRequestForm) selecting Autopilot device deregistration. 3) If response is slow, contact Intunesupportsaw@microsoft.com directly (Australia/Japan team recommended). Best practice: request OEM to deregister replaced motherboard from original tenant.
`[Source: onenote, Score: 9.5]`

### Step 5: Autopilot Self-Deploying 或 Pre-Provisioning 设备首次部署成功后再次重置部署时被阻止（one-time device-based enrollment block）
**Solution**: 1. 升级到 Intune 2310 或更新版本；2. 在 Intune Admin Center → Windows Autopilot Devices 中选中被阻止的设备，使用 Unblock 按钮手动解除；3. 此功能仅适用于特定 OEM，联系 OEM 确认是否支持；4. 不适用于 Fix pending 状态的设备
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Autopilot 完成后设备 BitLocker 加密为 XTS-AES 128bit 而非配置的 256bit 或其他设置
**Solution**: 1. 该 ZDP 更新已被移除；2. 对于残留受影响设备，用户可在桌面通过 Settings → Windows Update → Check for Updates 安装最新 LCU（2025.09B+），重启后 BitLocker 策略会正确下发
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Autopilot 设备无法继续 provisioning，日志显示 OMADMClient.exe 崩溃
**Solution**: 1. 按 Shift+F10 打开命令提示符；2. 运行 'start ms-settings:' 打开设置；3. 卸载 KB5065848；4. 进入 System → Recovery 选择 Reset this PC
`[Source: ado-wiki, Score: 9.0]`

### Step 8: Autopilot 设备看似完成部署且有 Intune device ID，但大部分 Device Actions 灰显不可用，设备处于孤立状态
**Solution**: 用户安装最新 LCU（2025.09B+），通过 Settings → Windows Update → Check for Updates，重启后与 Intune 同步，Device Actions 应恢复正常
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intune Windows Autopilot 在 21V 仅支持旧版（v1），v2 支持较晚 | Autopilot v2 于 2409 才 GA in 21V；此前仅 v1，功能受限 | 部分支持：Autopilot v2 自 2409 起已 GA；若客户使用旧版本请升级到 2409+ 或改用 v1 流程 | 9.5 | 21v-gap |
| 2 | Windows Intune enrollment fails; OMA-DM sync does not execute after omadmprc.... | A corrupted scheduled task trigger registry entry (e.g., Media Center Recordi... | Identify the corrupted task trigger registry entry. Fix or delete the invalid... | 9.5 | onenote |
| 3 | Windows device enrollment fails with error 0x800706BE or 0x80010106, svchost_... | Third-party DLL GEC20203.dll (likely security/crypto hardware driver) causes ... | 1) Collect ProcessMonitor + Event Logs + WER dumps per HKLM\Software\Microsof... | 9.5 | onenote |
| 4 | During Windows Autopilot OOBE, another company logo is shown instead of the c... | Hardware hash uploaded to Autopilot service must be globally unique. Common c... | 1) Confirm device ownership and collect hardware hash: mdmdiagnosticstool -ar... | 9.5 | onenote |
| 5 | Autopilot Self-Deploying 或 Pre-Provisioning 设备首次部署成功后再次重置部署时被阻止（one-time devi... | OEM 未 opt-in attesting removal of refurbished devices，导致设备在首次 self-deploy/pre... | 1. 升级到 Intune 2310 或更新版本；2. 在 Intune Admin Center → Windows Autopilot Devices... | 9.0 | ado-wiki |
| 6 | Autopilot 完成后设备 BitLocker 加密为 XTS-AES 128bit 而非配置的 256bit 或其他设置 | Autopilot 过程中的 ZDP 更新（相关 ICM 678596064）导致 BitLocker 策略未正确应用 | 1. 该 ZDP 更新已被移除；2. 对于残留受影响设备，用户可在桌面通过 Settings → Windows Update → Check for U... | 9.0 | ado-wiki |
| 7 | Autopilot 设备无法继续 provisioning，日志显示 OMADMClient.exe 崩溃 | 已知问题（ICM 678596064）：特定更新导致 OMADMClient.exe 崩溃，设备无法完成 check-in，导致 Intune 中设备处于... | 1. 按 Shift+F10 打开命令提示符；2. 运行 'start ms-settings:' 打开设置；3. 卸载 KB5065848；4. 进入 ... | 9.0 | ado-wiki |
| 8 | Autopilot 设备看似完成部署且有 Intune device ID，但大部分 Device Actions 灰显不可用，设备处于孤立状态 | OMADMClient.exe 崩溃（ICM 678596064）导致设备无法完成 check-in，Intune 中设备处于孤立状态 | 用户安装最新 LCU（2025.09B+），通过 Settings → Windows Update → Check for Updates，重启后与 I... | 9.0 | ado-wiki |
| 9 | APv1 整个 DeviceSetup 类别失败超时，UDiag 显示 ServerHasNOTFinishedProvisioning 和 CoMgmt... | Co-Management 策略在 Autopilot 期间被应用，但 CMG（Cloud Management Gateway）配置不正确或 Confi... | 1. 先取消分配 Co-Management 策略验证是否为根因；2. 使用 Kusto 查询 DeviceLifecycle（EventId 46801... | 9.0 | ado-wiki |
| 10 | Autopilot v1 DeviceSetup times out during provisioning; UDiag shows ServerHas... | OS Edition SKU switch during Autopilot causes the device to lose track of pre... | Do NOT perform OS Edition Upgrade during Autopilot. Options: (1) Assign editi... | 9.0 | ado-wiki |
| 11 | BitLocker encryption on Autopiloted device shows XTS-AES 128-bit instead of c... | ZDP (Zero-Day Patch) update applied during Autopilot caused BitLocker configu... | Install latest LCU (2025.09B or later) via Settings > Windows Update > Check ... | 9.0 | ado-wiki |
| 12 | Autopilot device unable to continue provisioning; OMADMClient.exe crashes dur... | OMADMClient.exe crash caused by KB5065848 update applied during Autopilot. Re... | Press Shift+F10 to open command prompt, run 'start ms-settings:' to open Sett... | 9.0 | ado-wiki |
| 13 | Intune device appears in orphaned state after Autopilot: has Intune device ID... | OMADMClient.exe crash (ICM 678596064) prevented device from completing check-... | Install latest LCU (2025.09B or later) via Settings > Windows Update > Check ... | 9.0 | ado-wiki |
| 14 | Devices encrypted with 128-bit instead of 256-bit as specified in BitLocker p... | Windows BitLocker automatic device encryption starts during OOBE before the I... | Configure 'Automatic encryption during AADJ: Block' in device restriction pol... | 9.0 | ado-wiki |
| 15 | Error 808-ZtdDeviceAssignedToOtherTenant or 806-ZtdDeviceAlreadyAssigned when... | Hardware hash already exists in Autopilot service. Common causes: device boug... | 1) Search serial number in Assist365 > Applications > Intune > Device Search ... | 9.0 | ado-wiki |
| 16 | DeviceNotSupported error during Windows device enrollment - MDM Enroll Server... | Enrollment Restriction (ER) policy has the device platform set to Block/Disab... | 1) Get F12 HAR trace 2) Find first 403 to graph.microsoft.com 3) Extract Date... | 9.0 | ado-wiki |
| 17 | 设备使用 ETG enrollment profile 注册后未被添加到 ETG Security Group 成员 | DeviceMembershipUpdater 操作失败；若 72 小时内未成功加入 SG，GnT 宽限期到期后会触发 policy tattoo rem... | 1. 检查 Devices > Monitor > Enrollment time grouping failures 报告（2510+ 版本可用）。2.... | 9.0 | ado-wiki |
| 18 | Kusto queries on intune.kusto.windows.net return incomplete results or fail t... | The original Intune Kusto cluster (intune.kusto.windows.net) reached saturati... | Use the appropriate regional Kusto cluster based on scale unit location: Intu... | 9.0 | ado-wiki |
| 19 | VDI (Virtual Desktop Infrastructure) device enrollment in Intune fails with f... | The VDI device has metadata issues that prevent proper enrollment. This can o... | Query DeviceLifecycle EventId=46804 filtering for failureReason=24 or details... | 8.5 | onenote |
| 20 | During OOBE, AutoPilot customized branding (org name, logo) not displayed; st... | Device not recognized by AutoPilot service. Causes: (1) Hardware hash not upl... | 1) Re-capture hardware hash: Shift-F10 in OOBE > PowerShell > Get-WindowsAuto... | 8.0 | onenote |
| 21 | AutoPilot Azure AD join fails with error 801C0003 Something went wrong during... | User not allowed to join devices to Azure AD (device settings restriction), o... | 1) Azure AD > Devices > Device settings: enable user device join; 2) Set devi... | 8.0 | onenote |
| 22 | AutoPilot MDM enrollment fails with error 80180018 - device could not be enro... | Three causes: (1) Missing Azure AD Premium license; (2) Missing Intune licens... | 1) Assign Azure AD Premium P1/P2 license; 2) Assign Intune license; 3) Check ... | 8.0 | onenote |
| 23 | Entra join fails with error 80180026 on Windows 10 when MDM automatic enrollm... | Conflict between Intune PC software client agent and MDM automatic enrollment... | Either disable MDM automatic enrollment in Azure (Entra ID > Mobility > Micro... | 8.0 | mslearn |
| 24 | Enrollment error 0x80180014: Your organization does not support this version ... | Windows (MDM) platform is set to Block in Intune enrollment restrictions (dev... | In Intune admin center > Devices > Enrollment restrictions, select device typ... | 8.0 | mslearn |
| 25 | Autopilot device enrollment fails with HRESULT 0x80180022. Device is running ... | Windows Home Edition does not support Autopilot/MDM enrollment. Only Pro edit... | Update the device to Windows Pro edition or higher. | 8.0 | mslearn |
| 26 | Autopilot self-deploying mode fails with error 0x800705b4: Securing your hard... | Device lacks physical TPM 2.0 chip (virtual TPMs or TPM 1.2 not supported for... | Ensure device has a physical TPM 2.0 chip. Verify Windows 10 build 1709+ (or ... | 8.0 | mslearn |
| 27 | Windows OOBE Set up for work or school enrollment fails with error 80180014. ... | Device recognized as personal device during OOBE. Personal device enrollment ... | In Intune admin center > Enrollment device platform restrictions > Windows re... | 8.0 | mslearn |
| 28 | Windows enrollment via Company Portal fails: You do not have the right privil... | User is not local Administrator. Local admin required for enrolling already-c... | Use Windows Autopilot or join brand-new device via OOBE (uses SYSTEM account,... | 8.0 | mslearn |
| 29 | Sysprep does not remove MDM enrollment (Intune) certs/IDs/settings from Windo... | Sysprep generalization does not clean MDM enrollment data or Entra join info.... | Never clone Entra-joined/Intune-enrolled devices. Image in workgroup state us... | 8.0 | mslearn |
| 30 | Attempting to enroll Windows devices into Intune MDM fails if the user is not... | This is by design. For regular MDM enrollment, the account used to enroll the... | As a workaround, if the customer uses AutoPilot they can enroll the device in... | 7.5 | contentidea-kb |
| 31 | After configuring OOBE enrollment for a Surface Hub device, enrollment appear... | Surface Hubs cannot be managed via Auto Enrollment/Azure AD joins. The proces... | To resolve this problem, be sure the Surface Hub users are not being targeted... | 7.5 | contentidea-kb |
| 32 | When using the RemoteWipe CSP to send a DoWipe command to a Windows 10 comput... | This can occur if the Windows Recovery Environment (Windows RE) is disabled o... | First check the status of Windows RE. You can do this by running a Command Pr... | 7.5 | contentidea-kb |
| 33 | When attempting to enroll an iOS device in Microsoft Intune, the enrollment p... | This can occur if the device had been previously enrolled by another user and... | To resolve this problem, you first need to find the previous device ID assign... | 7.5 | contentidea-kb |
| 34 | When using the RemoteWipe CSP to send a DoWipe command to a Windows 10 comput... | This can occur if AllowUserToResetPhone=0 is set per https://docs.microsoft.c... | To resolve this issue, configure AllowUserToResetPhone=1 or do not specify a ... | 7.5 | contentidea-kb |
| 35 | You experience one or more of the following:Unable to enroll mobile device"Pr... | This is by design. Users have a default enrollment limit of 15 devices.This c... | By default end users are limited to enrolling 15 devices. If they have less t... | 7.5 | contentidea-kb |
| 36 | Here is the public article for this: https://docs.microsoft.com/en-us/intune/... |  |  | 7.5 | contentidea-kb |
| 37 | When trying to automatically enroll a Windows 10 device post OOBE (out-of-the... | The setting in Azure Active Directory for devices to join Azure AD was set to... | Add the user to the list of selected users or configure a group and add the g... | 7.5 | contentidea-kb |
| 38 | When attempting to enroll a Windows 10 PC, the enrollment process fails with ... | This can occur if the setting in Azure Active Directory for devices to join A... | To resolve this problem, complete the following:1. Open a browser and navigat... | 7.5 | contentidea-kb |
| 39 | When attempting to enroll a Windows 10 computer, the following error is displ... | This can occur if the user has already enrolled the maximum number of allowed... | To resolve this problem, you either need to remove devices already enrolled b... | 7.5 | contentidea-kb |
| 40 | When attempting to enroll a Windows 10 device into Microsoft Intune, the foll... | This error will occur if Windows MDM enrollment is blocked by the organization. | To resolve this problem, you need to allow Windows MDM enrollments:  Login to... | 7.5 | contentidea-kb |
| 41 | When attempting to enroll a Windows computer using the Intune PC client softw... | This can occur if the PC client package being used is out of date. | To resolve this problem, download a new copy of the Intune PC client agent in... | 7.5 | contentidea-kb |
| 42 | When attempting to enroll a Windows computer using the Intune PC client softw... | This can occur if the certificate trust chain is broken due to a missing or e... | <Customer Facing Steps>Download a new enrollment package from the Admin Conso... | 7.5 | contentidea-kb |
| 43 | The Intune product support team has created a step-by-step troubleshooting gu... |  |  | 7.5 | contentidea-kb |
| 44 | The information below contains some &quot;good to knows&quot; that will come ... |  |  | 7.5 | contentidea-kb |
| 45 | Attempting to MDM enroll a Windows 10 computer fails with the following error... | This can occur if the optional CNAME records were not created in DNS. | To resolve this problem, do one of the following:- Create the appropriate CNA... | 7.5 | contentidea-kb |
| 46 | Applications deployed to Windows 10 computers that are MDM enrolled as mobile... | This can occur if there is a problem with the device registration records in ... | To resolve this problem, unenroll the device from Intune, then remove all rec... | 7.5 | contentidea-kb |
| 47 | Attempting to enroll a Windows 10 PC fails with the following error:Something... | Unknown | To resolve this problem, complete the following:1. Login to the Intune Azure ... | 7.5 | contentidea-kb |
| 48 | RequirementsClient Requirements:�         Windows 10 1703 (with 7B cumulative... |  |  | 7.5 | contentidea-kb |
| 49 | When attempting delete an Autopilot Deployment Profile, the following error i... | This issue can occur for one of the two following reasons:1.  There is an act... | Execute the following procedures to remove the group assignment if the group ... | 7.5 | contentidea-kb |
| 50 | Log Collection Instructions - Autopilot and Enrollment Status Page(ESP) | Customer issues | Below are instructions to collect logs for various scenarios. Note: On S-mode... | 7.5 | contentidea-kb |
| 51 | During Hybrid Azure AD Join AutoPilot the device times out during the initial... | The "Assign User" feature should only be used with Azure AD Join AutoPilot sc... | 1. Navigate to the Intune -> Device Enrollment -> Windows Enrollment -> Devic... | 7.5 | contentidea-kb |
| 52 | Pre-Requisites Note: These are current requirements for internal testing and ... |  |  | 7.5 | contentidea-kb |
| 53 | Guide: Using Kusto to troubleshoot Enrollment Status Page (ESP) issues. Cover... |  |  | 7.5 | contentidea-kb |
| 54 | Guide: Troubleshooting Intune enrollment using various Kusto queries, origina... |  |  | 7.5 | contentidea-kb |
| 55 | After deploying an IOS update and setting a window when devices can updates, ... | This appears to be a known issue where devices will not update when the devic... | As a workaround, end users can manually install updates on their devices from... | 7.5 | contentidea-kb |
| 56 | A Windows AutoPilot deployment fails and generates the following error during... | This problem can occur if there is a proxy, firewall or other network device ... | To resolve this problem, make sure there is nothing on your network that is b... | 7.5 | contentidea-kb |
| 57 | In order to use the Kusto database to troubleshoot Intune issues, support eng... |  |  | 7.5 | contentidea-kb |
| 58 | The complete process break-up for Windows enrollment scenarios is shown below... |  |  | 7.5 | contentidea-kb |
| 59 | Intune integrates with Windows Hello for Business in two ways:    An Intune p... |  |  | 7.5 | contentidea-kb |
| 60 | Customers with a dynamic group created for Autopilot devices, based on their ... | How do autopilot devices end up with no ZTDID?  Simply put, this happens when... | Unfortunately, once the ZTDID is deleted, we can’t just get one randomly assi... | 7.5 | contentidea-kb |
| 61 | Autopilot enrolled devices are not re-enrolling into Intune MDM when Fresh St... | Intune service side issue | Resolved with the Intune 1908 service releaseWorkaround: use Autopilot Reset ... | 7.5 | contentidea-kb |
| 62 | Customer boots the Surface device into a Windows To Go flash drive to run the... | Autopilot device hardware hash is tied to the Windows To Go USB drive | Per the current design of Autopilot, Windows To Go drives are not a supported... | 7.5 | contentidea-kb |
| 63 | Learn how to collect Event Viewer logs to troubleshoot issues involving the e... |  |  | 7.5 | contentidea-kb |
| 64 | Customer reported that some users cannot initiate sync to Intune from Windows... | This issue appears to be related with one bug on Windows which already been f... | For devices whose certs already expired, we have to re-enroll them.For device... | 7.5 | contentidea-kb |
| 65 | https://docs.microsoft.com/en-us/intune/app-sideload-windowsTo distribute lin... |  |  | 7.5 | contentidea-kb |
| 66 | Logs  Collecting MDM logs Video: Collecting Logs  Collecting customer data us... |  |  | 7.5 | contentidea-kb |
| 67 | When trying to delete a record from the Intune management portal under Home\D... | This error can occur if there is a Microsoft Store for Business entry for the... | Navigate to&nbsp;https://businessstore.microsoft.com/en-us/manage/devices/all... | 7.5 | contentidea-kb |
| 68 | When trying to import a CSV in to the&nbsp;Intune management portal under&nbs... | This error may occur if a ZTD device ID is already assigned to a device in Mi... | Navigate to&nbsp;https://businessstore.microsoft.com/en-us/manage/devices/all... | 7.5 | contentidea-kb |
| 69 | Autopilot how to collect Fiddler trace during OOBE ​The bellow steps can be f... |  |  | 7.5 | contentidea-kb |
| 70 | Intune Windows 10 Endpoint Protection&nbsp;provides a comprehensive set of co... |  |  | 7.5 | contentidea-kb |
| 71 | Modern Management - Intune - Client Apps - Part V - Apps – Windows &nbsp;– pr... |  |  | 7.5 | contentidea-kb |
| 72 | Learn how to&nbsp;collect logs to troubleshoot Windows Autopilot MDM enrollme... |  |  | 7.5 | contentidea-kb |
| 73 | After setting up Autopilot White Glove with White Glove on for OOBE, you can ... | &lt;Removed&gt; | Resolution removed per&nbsp;Senthil Pandurangan (sepandur). He is working wit... | 7.5 | contentidea-kb |
| 74 | After deploying Windows update ring policy with Service channel: Semi-annual ... | In event log of Device Management, we may notice error of BranchReadinessLeve... | Currently, still chose SAC-T in Intune Windows update ring policy as it refer... | 7.5 | contentidea-kb |
| 75 | The customer is issuing certificates using DigiCert's PKI platform.&nbsp;In t... | This was caused by an issue on DigiCerts side.&nbsp;The first time the App re... | To resolve this issue, have DigiCert create a sub-account and enter the appli... | 7.5 | contentidea-kb |
| 76 | When troubleshooting Windows 10 Enrollment, you may find a scenario where the... |  | Step 1: Click on the Power button at the lower-right corner of the Login scre... | 7.5 | contentidea-kb |
| 77 | Important re-branding noticeOffice 365 ProPlus is being renamed to&nbsp;Micro... |  |  | 7.5 | contentidea-kb |
| 78 | We are excited to announce that school IT admins will now be able to manage W... |  |  | 7.5 | contentidea-kb |
| 79 | There is no steps needed prior to enrolling Windows MDM devices, however ther... |  |  | 7.5 | contentidea-kb |
| 80 | Internal Documentation 2900644&nbsp;Windows 8.1 MDM Enrollment 3084391&nbsp;W... |  |  | 7.5 | contentidea-kb |
| 81 | The main troubleshooter for Windows enrollment issues is here:&nbsp;4095858&n... |  |  | 7.5 | contentidea-kb |
| 82 | Use Device Firmware Configuration Interface profiles on Windows devices in Mi... |  |  | 7.5 | contentidea-kb |
| 83 | Troubleshoot PrimaryUser and UDAFeature basicsThe primary user property on th... |  |  | 7.5 | contentidea-kb |
| 84 | The BasicsIn the OOBE stage of autopilot deployment, there can be many issues... |  |  | 7.5 | contentidea-kb |
| 85 | When doing a Windows 10 Autopilot enrollment, you may see a UAC prompt. This ... | This can occur if the configuration profile installs a language pack. For exa... | The first step to solve the issue is to change the language settings to &quot... | 7.5 | contentidea-kb |
| 86 | Surface PRO 4&nbsp;Enrollment failed in autopilot self-deployment scenario wi... | Vulnerability in TPM that allows security feature bypass.&nbsp;From the logs ... | Need to have the Windows August 2019 update on the device and the latest TPM ... | 7.5 | contentidea-kb |
| 87 | There are many users looking for Intune’s capability to block certain USB cla... |  | Create Administrative Template ProfileGo to Settings and search Windows templ... | 7.5 | contentidea-kb |
| 88 | Customer is trying to manually enroll Windows 10 device in Intune.During enro... | The issue occurs when device was previously enrolled through Autopilot.During... | To fix this issue, we need to prevent the device to offer the autopilot detai... | 7.5 | contentidea-kb |
| 89 | Windows 10 Microsoft Defender ATP configuration profile shows Onboard Configu... | Running in Kusto checking the ATP profile, find below error message：DeviceMan... | Create a new Windows ATP configuration profile in Intune and assigned, issue ... | 7.5 | contentidea-kb |
| 90 | When importing a CSV in to the&nbsp;Windows Autopilot devices&nbsp;blade in t... | Errors ZtdDeviceAlreadyAssigned (error 806) and&nbsp;ZtdDeviceAssignedToOther... | Check the Microsoft Store for Business for existing recordsStart by verifying... | 7.5 | contentidea-kb |
| 91 | A day as a SEE in EMEA: &nbsp; 1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Open Ra... |  |  | 7.5 | contentidea-kb |
| 92 | This article details the steps needed to decode Autopilot debug logs in ETL f... |  |  | 7.5 | contentidea-kb |
| 93 | Windows 10 Feature Update troubleshooting requires knowledge of the customer'... |  |  | 7.5 | contentidea-kb |
| 94 | After&nbsp;deploying a user-targeted VPN profile to a&nbsp;Windows 10 version... | In Windows 10 version 2004 (build 10.0.19041), there is currently a bug in th... | As a work around,&nbsp;you can set an applicability rule to assign the VPN pr... | 7.5 | contentidea-kb |
| 95 | Autopilot Workflow:                                               ... |  |  | 7.5 | contentidea-kb |
| 96 | You're performing Windows Autopilot with White Glove and Hybrid Azure AD Join... | In a White Glove Autopilot with Hybrid Azure AD Join scenario, provided the O... | You can try manually creating the parent registry key at the start of the pro... | 7.5 | contentidea-kb |
| 97 | The purpose of this KB is to provide some general guidance around popular Kus... |  |  | 7.5 | contentidea-kb |
| 98 | Default Time Zone set on Autopilot devices is (UTC -8:00) Pacific Time | This is by DesignMachines are changing the TimeZone to US PST upon AutoPilot ... |  | 7.5 | contentidea-kb |
| 99 | As part of the effort to separate EU and Non-EU data, we will no longer be ab... |  |  | 7.5 | contentidea-kb |
| 100 | Support guidance from LSI Incident [205484585] [Multiple customers][USA/Canad... | A bug / unexpected result found in the September 2020 Intune service release ... | If you are a front line support engineer / ambassador, engage your escalation... | 7.5 | contentidea-kb |
| 101 | How to generate alert for enrollment failure from Intune diagnostics using Az... | NA | How to generate alert for enrollment failure from Intune using Azure Log Anal... | 7.5 | contentidea-kb |
| 102 | There is a need to update the      Administrators      group for all users ... | Real case scenario: Customer registered 100+ Windows 10 devices to Azure (Azu... | Creating the configuration profile 1.&nbsp;NOTE: This process&nbsp;REPLACES&n... | 7.5 | contentidea-kb |
| 103 | You're implementing Windows Hello for Business with Certificate Trust Deploym... | Error&nbsp;0x82ab0010 stands for&nbsp;DM_NGC_AAD_KEY_IDENTIFIER_MISMATCH:It h... | During Windows Hello for Business provisioning, Azure DRS locates the user's ... | 7.5 | contentidea-kb |
| 104 | When enrolling a Windows 10 device in Intune as BYOD via a work or school acc... | This can occur if the customer has deployed the same device as an offline Aut... | To resolve this problem, remove the .json files from&nbsp;C:\Windows\ServiceS... | 7.5 | contentidea-kb |
| 105 | The customer was seeing very long sync times after initial enrollment into Vm... |  |  | 7.5 | contentidea-kb |
| 106 | ​Customers with group policy or co-managed devices might be experiencing high... | ​This issue can occur if the Dmwappushservice service is disabled.&nbsp;The D... | ​To fix the issue,&nbsp;ensure that&nbsp;the&nbsp;Dmwappushservice&nbsp;servi... | 7.5 | contentidea-kb |
| 107 | While provisioning HoloLens 2 devices for Self-Deploy Autopilot (Public Previ... | This issue can be caused by lack of access to required networking endpoints t... | Verify the cause by performing HoloLens 2 Autopilot on a separate, open netwo... | 7.5 | contentidea-kb |
| 108 | This article lists the subtasks for&nbsp;Demonstrate and troubleshoot self-de... |  |  | 7.5 | contentidea-kb |
| 109 | Customer is attempting the White Glove scenario with a freshly installed Wind... | This issue happens when the device had TPM 1.2 and was then updated to TPM 2.... | Customers will not be able to use self-deploying or white glove on any device... | 7.5 | contentidea-kb |
| 110 | You're performing Autopilot with Hybrid Azure AD Join (User-Driven). The end ... | System account defaultuser0&nbsp;is used to negotiate the Autopilot OOBE.&nbs... | Unlinking the problematic GPO from the Autopilot OU fixed the behavior and he... | 7.5 | contentidea-kb |
| 111 | Reboots during Windows Autopilot are a common experience that customers may r... |  |  | 7.5 | contentidea-kb |
| 112 | Customer tries to edit an existing device type enrollment restriction but is ... | The issue is most likely caused by the presence of the Windows Mobile restric... | To resolve this problem, create a new device type enrollment restriction prof... | 7.5 | contentidea-kb |
| 113 | Duplicate of&nbsp;Content Idea Request 148180: Intune: Autopilot enrollment f... |  |  | 7.5 | contentidea-kb |
| 114 | Overview&nbsp;You'll use MDM enrollment so that both corporate and bring-your... |  |  | 7.5 | contentidea-kb |
| 115 | In the OOBE stage of autopilot deployment, there can be many issues which can... |  |  | 7.5 | contentidea-kb |
| 116 | General questions:What’s Intune’s Supporting scope for WIP. Which teams we ne... |  |  | 7.5 | contentidea-kb |
| 117 | Intune Autopilot SummaryWindows Autopilot is a collection of technologies tha... |  |  | 7.5 | contentidea-kb |
| 118 | If you don’t skip the user portion of the ESP (with a custom CSP), the ESP wi... | Provider Microsoft-Windows-LiveId can cause a delay up to 2000 seconds(Around... | If the environment has integration of Windows LiveID with ADFS then the behav... | 7.5 | contentidea-kb |
| 119 | This article describes how to use an Intune&nbsp;Device Action to remotely ro... |  |  | 7.5 | contentidea-kb |
| 120 | The ESP can be used as part of any Windows Autopilot provisioning scenario, a... |  |  | 7.5 | contentidea-kb |
| 121 | Endpoint security firewall&nbsp;rules&nbsp;reports failure in Intune without ... | When firewall rules are push to a Windows machine, the device is going to rep... | Now to troubleshoot errors while the policy has been process by the device yo... | 7.5 | contentidea-kb |
| 122 | Autopilot White Glove fails with Device-based AADJ Error 0x801c03f3  &lt;&lt;... | This occurs if the devices are converted to Intune due to the assigned      E... | As a work around, re-import      the devices into Autopilot and perform the p... | 7.5 | contentidea-kb |
| 123 | A device enrollment limit restriction does not block enrollment as expected e... | &nbsp;For a device to count as part of the device count for the enrollment li... | You can use the kusto query below to check the device limit pulled during enr... | 7.5 | contentidea-kb |
| 124 | When a device is configured for self-deploying mode, privacy screen is not hi... | This can occur if the Microsoft Sign-in Assistant service (wlidsvc) is disabl... | To resolve this problem, enable the&nbsp;Microsoft Account Sign-in Assistant ... | 7.5 | contentidea-kb |
| 125 | After assigning an Autopilot Deployment Profile with the setting Convert all ... | Temporary failure to associate the Autopilot device object with the associate... | First, make sure the customer has allowed up to 48 hours for the device to be... | 7.5 | contentidea-kb |
| 126 | General Questions What is a Cloud PC?  A Cloud PC is a highly available, opti... |  |  | 7.5 | contentidea-kb |
| 127 | Ensure your case is properly documented  Requesting help from other engineers... |  |  | 7.5 | contentidea-kb |
| 128 | We have had questions lately regarding our approach for supporting the Window... |  |  | 7.5 | contentidea-kb |
| 129 | Once a Windows 365 Business license is assigned to a valid user the Cloud PC ... |  |  | 7.5 | contentidea-kb |
| 130 | After an initial device is deployed using self-deploying or pre-provisioning ... | This occurs because of a change that was made in Microsoft Endpoint Manager f... | To resolve this problem, delete the device in Intune following the steps outl... | 7.5 | contentidea-kb |
| 131 | As a part of clean-up activities, it might be needed to delete devices from A... | During Autopilot enrollment and when uploading Hardware hash , the DDS “Devic... | First Approach   by making sure of the following the targeted AutoPilot devic... | 7.5 | contentidea-kb |
| 132 | During the out-of-box experience (OOBE), when attempting to enroll a personal... | This can occur if personal device enrollment is blocked (disabled) for the te... | To resolve this problem, enable personal enrollment of Windows devices, eithe... | 7.5 | contentidea-kb |
| 133 | Use this article if you want to find the ESP policy which was processed by a ... |  |  | 7.5 | contentidea-kb |
| 134 | Customer assigns a Windows 365 Business license to an active user, but Cloud ... |  | Microsoft 365 Admin Center (where licenses were assigned), navigate to Show A... | 7.5 | contentidea-kb |
| 135 | Windows 365 Business Cloud PC provisioning hangs or is stuck at &quot;Setting... |  | Action Plan : To remove the license from the affected user and reassign after... | 7.5 | contentidea-kb |
| 136 | Customer descriptions will be along the lines of:&nbsp;  &quot;Devices going ... |  |  | 7.5 | contentidea-kb |
| 137 | Autopilot White Glove fails with TPM Device Health Attestation timeout. Note ... |  | To resolve this problem, always initiate the process by resetting the device:... | 7.5 | contentidea-kb |
| 138 | Single-app and Multi-app Kiosk profile fails to apply on Hybrid Azure AD Join... | SyncML&nbsp;trace shows the UPN format sent to the device is &quot;AzureAD\us... | Switch from Azure AD user logon type to Local user accounts and enter the acc... | 7.5 | contentidea-kb |
| 139 | This Article will guide you to configure Autopilot Scenarios in your Test Env... |  |  | 7.5 | contentidea-kb |
| 140 | The actions button is greyed out in the Company Portal app for Windows 10 and... | This issue is happening when enrolling Windows devices by users who have the ... | If you want to enable the actions button you must remove the DEM permission f... | 7.5 | contentidea-kb |
| 141 | The Portal returns a 'Not applicable' status after deploying a device restric... | The customer selected the OSVersion parameter but didn't specify a value. Pol... | The customer choose the rule and the property without a Value (He mentioned h... | 7.5 | contentidea-kb |
| 142 | CU created a custom RBAC Intune role and assigned it to IT Helpdesk group wit... | This can occur if&nbsp;the Read permission for Managed apps in the RBAC role ... | To resolve this problem, add the Read permission for Managed apps/Read in the... | 7.5 | contentidea-kb |
| 143 | You can check to see if a Co-Management Authority policy is set from Intune u... |  |  | 7.5 | contentidea-kb |
| 144 | This article is for a particular situation where the scenario is as follows: ... |  |  | 7.5 | contentidea-kb |
| 145 | When a user initiates a wipe device action in the Intune console, the device ... | Windows engineer suggested running bcdedit /enum {default}&nbsp;on the impact... | To patch existing devices, deploy the command “bcdedit /default {current}” vi... | 7.5 | contentidea-kb |
| 146 | All new or updated internal KB articles, new content requests such as doc upd... |  |  | 7.5 | contentidea-kb |
| 147 | Introduction: The goal of this article is to help the Intune Support Engineer... |  |  | 7.5 | contentidea-kb |
| 148 | Autopilot ESP page fails to load on HP devices running the Spanish (es-mx) bu... | A Settings Catalog policy with the ‘User Rights - Allow Local Log On’ setting... | The policy settings were reconfigured to use SIDs instead of user group names... | 7.5 | contentidea-kb |
| 149 | ETL traces related to windows expedite updates can be accessed and captured f... |  |  | 7.5 | contentidea-kb |
| 150 | Always-ON VPN on Windows 11 when deployed as Profile XML(VPNv2 CSP) disconnec... | If your custom VPN profile disconnects during every sync, the settings/how it... | Make sure the deployed VPN Profile XML is working, and user is able to connec... | 7.5 | contentidea-kb |
| 151 | Azure Virtual Desktop (AVD) Multi-session fails to enroll in Intune, returnin... | The Windows platform is disabled in the default enrollment restriction policy... | Modify the default enrollment restriction policy to enable the Windows platfo... | 7.5 | contentidea-kb |
| 152 | The Intune Connector for Active Directory (ODJ Connector) fails to create a M... | The failure to create the MSA typically stems from an inconsistency in the Ac... | ✅ Confirm ODJ      Connector Version           Ensure the      connector is u... | 7.5 | contentidea-kb |
| 153 | New Intune Connector for Active Directory (ODJ Connector) service fails to st... | The issue occurs because the &quot;NT SERVICE\All Services&quot; group was no... | To resolve the issue, update the GPO to explicitly include the relevant servi... | 7.5 | contentidea-kb |
| 154 | Users may encounter the 802 - InvalidZtdHardwareHash error when uploading har... | There      might be issues with the hardware hash itself, such as it being   ... | Check Hardware Hash: Double-check the hardware hash with OA3Tool.exe /Validat... | 7.5 | contentidea-kb |
| 155 | Informational: Historically, the Microsoft-Windows-DeviceManagement-Enterpris... |  |  | 7.5 | contentidea-kb |
| 156 | This article outlines the typical investigation and resolution path for incid... | Known Root Cause Pattern In confirmed cases, Autopilot device deletions were ... | Investigation and Resolution Workflow Confirm Device Ownership Identify which... | 7.5 | contentidea-kb |
| 157 | In the below Diagram, the MDE attach is stuck in step 2, and devices are not ... | Enrollment Status Unknown State (46) = Token Failed or Missing - -&gt;&nbsp; ... | MDE team Action plan for this Enrollment Error (46)   Offboard the device so ... | 7.5 | contentidea-kb |
| 158 | First of all Autopilot self-deploying and Kiosk configuration profile or Shar... | By design, Windows 11 does not work with Kiosk profile multi app from Intune,... | Begin with exportin from user context an existing Start menu (then you can ed... | 7.5 | contentidea-kb |
| 159 | Identifying the User Account Responsible for Modifying the Windows Hello for ... | Changes made my admin's end under **Devices&gt;Enrollment&gt;Windows&gt;Windo... | Any changes made in the Windows Hello for Business policy, that will be saved... | 7.5 | contentidea-kb |
| 160 | This is a list of ODJ Connector event IDs. When monitoring specific error eve... |  |  | 7.5 | contentidea-kb |
| 161 | Because Intune is a cloud-based system, an internet connection from the devic... |  |  | 7.5 | contentidea-kb |
| 162 | The customer is part of an IT group using Microsoft Intune Autopilot Pre-prov... | As part of the customer’s process, they frequently format devices (installing... | Workaround: to register the app manually after provision finished Steps:finis... | 7.5 | contentidea-kb |
| 163 | Customers report Windows Autopilot enrollment failures where the device displ... | The cause depends on where the failure occurs in the Autopilot enrollment flo... | General guidelines before checking logs: Has this ever worked successfully fo... | 7.5 | contentidea-kb |
| 164 | Recently created IcM instances now display the following error when attemptin... |  |  | 7.5 | contentidea-kb |
| 165 | Customers deploying Windows 11 devices using the Hybrid Azure AD Join Autopil... | Investigation of the Application and Shell‑Core logs collected from affected ... | To ensure successful completion of the Hybrid Azure AD Join Autopilot provisi... | 7.5 | contentidea-kb |
| 166 | Add Troubleshoot section to DMC: Intune: How-to guides>Set up Windows Enrollment |  |  | 7.5 | contentidea-kb |
| 167 | [Create Word Doc]Intune: Add troubleshooting information from 4508990 to docs... |  |  | 7.5 | contentidea-kb |
| 168 | Archive and redirect: Set up Windows Enrollment |  |  | 7.5 | contentidea-kb |
| 169 | Default Time Zone set on Autopilot devices is (UTC -8:00) Pacific Time | This is by Design Machines are changing the TimeZone to US PST upon AutoPilot... | As of now DCR has been raised, Engineering owners will be reviewing this feat... | 7.5 | contentidea-kb |
| 170 | Devices continue trying to enroll in Intune after subscription canceled and d... | CNAME DNS records (enterpriseenrollment/enterpriseregistration) still point t... | Delete old CNAME records from domain registrar pointing to manage.microsoft.c... | 7.0 | mslearn |
| 171 | Windows devices stuck with managed name format (username_platform_timestamp) ... | Enrollment did not complete fully. Device stayed in initial enrollment state ... | Collect MDM diagnostic logs (winevt, dsregcmd output). Check registry HKLM\SO... | 6.5 | onenote |
| 172 | Windows 10 device cannot sync with Intune after enrollment (randomly 2 min to... | dmwappushservice (Device Management WAP Push) service is disabled often by a ... | Set dmwappushservice startup type to Automatic. | 6.5 | mslearn |
| 173 | Importing Windows Autopilot device CSV file fails with error 806 (ZtdDeviceAl... | Device already registered in the tenant (806) or assigned to another tenant (... | For 806: delete existing device record from Intune admin center (Devices > Wi... | 5.5 | mslearn |
| 174 | T he complete process break-up for Windows enrollment scenarios is shown belo... |  |  | 3.0 | contentidea-kb |
| 175 | Intune integrates with Windows Hello for Business in two ways: An Intune poli... |  |  | 3.0 | contentidea-kb |
| 176 | Customers with a dynamic group created for Autopilot devices, based on their ... | How do autopilot devices end up with no ZTDID? Simply put, this happens when ... | Unfortunately, once the ZTDID is deleted, we can’t just get one randomly assi... | 3.0 | contentidea-kb |
| 177 | Autopilot enrolled devices are not re-enrolling into Intune MDM when Fresh St... | Intune service side issue | Resolved with the Intune 1908 service release Workaround: use Autopilot Reset... | 3.0 | contentidea-kb |
| 178 | Customer boots the Surface device into a Windows To Go flash drive to run the... | Autopilot device hardware hash is tied to the Windows To Go USB drive | Per the current design of Autopilot, Windows To Go drives are not a supported... | 3.0 | contentidea-kb |
| 179 | Learn how to collect Event Viewer logs to troubleshoot issues involving the e... |  |  | 3.0 | contentidea-kb |
| 180 | Customer reported that some users cannot initiate sync to Intune from Windows... | This issue appears to be related with one bug on Windows which already been f... | For devices whose certs already expired, we have to re-enroll them. For devic... | 3.0 | contentidea-kb |
