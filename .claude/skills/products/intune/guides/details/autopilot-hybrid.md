# INTUNE Autopilot Hybrid AADJ 与域加入 — 已知问题详情

**条目数**: 103 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Hybrid AADJ Autopilot provisioning delays 3-4 hours; device stuck at ESP Account Setup phase waiting for Azure AD registration
**Solution**: Workaround: Deploy Intune PowerShell script during WhiteGlove to run 'Enable-ScheduledTask -TaskPath "\Microsoft\Windows\Workplace Join" -TaskName "Automatic-Device-Join"' to force-enable the task immediately after domain join, speeding up HAADJ registration.
`[Source: onenote, Score: 9.5]`

### Step 2: Intune device compliance state shows Unknown; ValidPolicyCompliancesCount is 0
**Solution**: 1) Verify device checked in within 2 days; 2) Confirm not DEM-enrolled; 3) Use device-based groups for compliance targeting with GPO/Hybrid AADJ; 4) Kusto: IntuneEvent where ServiceName==StatelessComplianceCalculationService
`[Source: onenote, Score: 9.5]`

### Step 3: Autopilot Hybrid AD Join 部署中设备报错 Domain not reachable 80070774，超时 25 分钟后失败
**Solution**: 1. 确保设备与 Active Directory 域控制器在同一网络且 ICMP 可达；2. 如使用 VPN 部署，启用 SkipDomainConnectivityCheck 跳过 ICMP ping 步骤；3. 检查防火墙规则确保设备到 DC 的 ICMP 流量未被阻断
`[Source: ado-wiki, Score: 9.0]`

### Step 4: Autopilot HAADJ 部署中 ESP User Setup 阶段超时，用户无法完成 Account Setup
**Solution**: 1. 确认 AD Connect 已同步设备为 Hybrid Azure AD Joined 状态；2. 等待 AD Connect 同步周期完成后再让用户登录；3. 如 ESP User Setup 中 Account Setup 已启用，确保同步时间窗口足够；4. 用户需使用 domain\user 格式的本地凭据登录而非 Azure AD UPN
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Autopilot HAADJ 部署失败，设备收到错误的 Deployment Profile（如收到 Azure AD only profile 而非 Hybrid profile）
**Solution**: 1. 确保只有一个 Deployment Profile 显示 Assigned=Yes；2. 不同 join type 的 profile 不能分配给同一个 Dynamic Device Group；3. 删除或取消分配多余的 profile
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Autopilot HAADJ Domain Join 失败，错误指向 OU 路径无效或无法在 AD 中创建计算机账户
**Solution**: 1. 在客户的 AD Users & Computers MMC 中截图确认实际 OU 路径；2. 确保 Domain Join profile 使用 OU= 和 DC= 语法（不是 CN=）；3. 确认 Intune Connector 服务账户对目标 OU 有 delegate 权限创建计算机对象
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Autopilot HAADJ 部署失败，计算机名称验证错误，设备无法完成 domain join
**Solution**: 1. 移除命名模板中的 %SERIAL%；2. 确保计算机名称模板生成的名称 ≤15 个字符；3. 注意 HAADJ 的设备命名由 Domain Join device-configuration profile 控制（非 Deployment Profile 中的 Apply device name template）
`[Source: ado-wiki, Score: 9.0]`

### Step 8: HAADJ Autopilot 完成后用户登录 Windows 时出现 Fix your Account 弹窗消息，使用了 SkipUSEResp 预配置模式
**Solution**: 1. 如果是 Federated 租户则无此问题（HAADJ registration 自动完成）；2. Non-Federated 租户：等待 30-40 分钟让 AADSync 完成同步后消息会自动消失；3. 或让用户通过 Fix your Account 弹窗重新认证；4. Pre-Provisioning 场景下建议等待 30-40 分钟后再交付设备
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Hybrid AADJ Autopilot provisioning delays 3-4 hours; device stuck at ESP Acco... | The Automatic-Device-Join scheduled task under \Microsoft\Windows\Workplace J... | Workaround: Deploy Intune PowerShell script during WhiteGlove to run 'Enable-... | 9.5 | onenote |
| 2 | Intune device compliance state shows Unknown; ValidPolicyCompliancesCount is 0 | Two common causes: (1) Device not checked in within last 2 days; (2) Device e... | 1) Verify device checked in within 2 days; 2) Confirm not DEM-enrolled; 3) Us... | 9.5 | onenote |
| 3 | Autopilot Hybrid AD Join 部署中设备报错 Domain not reachable 80070774，超时 25 分钟后失败 | 设备应用 Offline Domain Join blob 后尝试通过 ICMP ping 联系域控制器，但域控不可达（网络隔离、防火墙阻断或设备不在同一网络） | 1. 确保设备与 Active Directory 域控制器在同一网络且 ICMP 可达；2. 如使用 VPN 部署，启用 SkipDomainConne... | 9.0 | ado-wiki |
| 4 | Autopilot HAADJ 部署中 ESP User Setup 阶段超时，用户无法完成 Account Setup | AD Connect 尚未将设备同步到 Azure AD 为 Hybrid Azure AD Join 状态，导致用户登录后无法获取 Azure PRT（... | 1. 确认 AD Connect 已同步设备为 Hybrid Azure AD Joined 状态；2. 等待 AD Connect 同步周期完成后再让用... | 9.0 | ado-wiki |
| 5 | Autopilot HAADJ 部署失败，设备收到错误的 Deployment Profile（如收到 Azure AD only profile 而非 ... | 租户中同时存在 Azure AD Join 和 Hybrid Azure AD Join 两种 Autopilot Deployment Profile，... | 1. 确保只有一个 Deployment Profile 显示 Assigned=Yes；2. 不同 join type 的 profile 不能分配给同... | 9.0 | ado-wiki |
| 6 | Autopilot HAADJ Domain Join 失败，错误指向 OU 路径无效或无法在 AD 中创建计算机账户 | Domain Join Device Configuration Profile 中的 OU 路径不正确：常见错误包括使用 CN= 代替 OU=/DC= ... | 1. 在客户的 AD Users & Computers MMC 中截图确认实际 OU 路径；2. 确保 Domain Join profile 使用 O... | 9.0 | ado-wiki |
| 7 | Autopilot HAADJ 部署失败，计算机名称验证错误，设备无法完成 domain join | Domain Join profile 中的计算机命名模板使用了 %SERIAL% 变量或名称超过 15 个字符（NetBIOS 限制） | 1. 移除命名模板中的 %SERIAL%；2. 确保计算机名称模板生成的名称 ≤15 个字符；3. 注意 HAADJ 的设备命名由 Domain Join... | 9.0 | ado-wiki |
| 8 | HAADJ Autopilot 完成后用户登录 Windows 时出现 Fix your Account 弹窗消息，使用了 SkipUSEResp 预配置模式 | 租户为 Non-Federated（Managed）模式时，HAADJ 注册不会自动完成，需要等待 AADSyncScheduler 将 Intune C... | 1. 如果是 Federated 租户则无此问题（HAADJ registration 自动完成）；2. Non-Federated 租户：等待 30-4... | 9.0 | ado-wiki |
| 9 | Intune AD Connector (ODJ) 新版配置向导中管理员无法通过 Conditional Access 的 Require Hybrid ... | 连接器配置向导使用 iFrame 方式登录，无法传递设备 ID，因此 Hybrid Join 设备检查必定失败（by design limitation） | 临时将安装连接器的服务器从该 Conditional Access 策略中排除，完成连接器配置后恢复策略 | 9.0 | ado-wiki |
| 10 | 新版 Intune AD Connector 点击 Configure managed service account 时报错 0x8007202F: A... | 当前用户权限不足，无法在指定 OU 中创建 Managed Service Account 计算机对象，或 OU 路径中存在权限约束 | 参考 Configure New ODJ connector without Domain/Enterprise Admin account login ... | 9.0 | ado-wiki |
| 11 | 新版 Intune AD Connector 配置成功完成，但连接器未出现在 Intune Portal 中 | 服务器的代理(Proxy)设置未正确配置，导致连接器无法与 Intune 服务通信注册自身 | 配置正确的 Proxy 设置（公开文档可能不完整，参考 ICM Incident-647297567 中 PG 的指导）；连接器每 30 秒同步一次，Po... | 9.0 | ado-wiki |
| 12 | Intune AD Connector 配置向导中登录页面空白，或报错 Microsoft Edge cannot read and write to i... | 服务器上未安装 WebView2 Runtime，或当前登录用户对 ODJConnectorEnrollmentWizard.exe.WebView2 文... | 1. 安装 WebView2 Runtime (https://aka.ms/webview2download); 2. 确保登录用户对 C:\Progr... | 9.0 | ado-wiki |
| 13 | ODJ Connector enrollment 失败，报错 Element Not Found 或 CN=Managed Service Account... | Active Directory 中无法找到或创建 Managed Service Account，可能是 AD schema/权限/OU 配置问题 | 参考 internal.evergreen 文章 ca114a1e-f981-fa7e-58bb-a8bf4c21f3ed; 建议由 Directory ... | 9.0 | ado-wiki |
| 14 | Hybrid Autopilot 注册突然失败，客户此前正常运行的 legacy ODJ connector 停止工作（2025年7月起） | Intune 产品团队从 2025 年 7 月 1 日起分阶段禁用低于 6.2501.2000.5 版本的 legacy Intune AD (ODJ) ... | 1. 手动卸载旧版连接器，下载安装新版 (>=6.2501.2000.5); 2. 用 Kusto WindowsAutopilot_GetTenantI... | 9.0 | ado-wiki |
| 15 | 同一域中存在多个 ODJ Connector（新旧版本混用），Hybrid Autopilot Join 间歇性失败 | 同一域有多个 connector 时无法控制请求路由到哪台服务器; 如果 legacy connector 被禁用而请求路由到该服务器则会失败 | 确保同一域中所有 connector 都升级到新版 (>=6.2501.2000.5)，卸载所有 legacy connector; 可先在不同服务器安装... | 9.0 | ado-wiki |
| 16 | Autopilot Hybrid AADJ deployment fails when both AzureAD-only and Hybrid depl... | Multiple conflicting Autopilot deployment profiles targeting the same device ... | Ensure only ONE profile is Assigned=Yes per device group. Remove conflicting ... | 9.0 | ado-wiki |
| 17 | Autopilot HAADJ fails during ODJ join phase; domain join times out | Device cannot reach DC for the domain in Domain Join profile. nltest /dsgetdc... | Verify nltest /dsgetdc:{domain} works. Ensure domain name matches exactly. Ch... | 9.0 | ado-wiki |
| 18 | Domain Join profile OU path invalid causing Autopilot HAADJ domain join errors | OU path uses CN= instead of OU= and DC=, or path does not match AD structure | Use OU= and DC= syntax. Verify OU path from AD Users and Computers. Ensure de... | 9.0 | ado-wiki |
| 19 | Autopilot HAADJ computer name template fails: exceeds 15 chars or uses %SERIAL% | NetBIOS 15-char limit. %SERIAL% may produce names exceeding limit. | Remove %SERIAL% and ensure names are 15 chars or fewer. | 9.0 | ado-wiki |
| 20 | After Autopilot HAADJ with SkipUSEResp on non-Federated tenant, user sees Fix... | Non-Federated tenants rely on AAD Connect sync (30-40 min) to sync device fro... | Wait 30-40 min for auto-resolution or have user re-auth. Federated tenants un... | 9.0 | ado-wiki |
| 21 | Updated ODJ Connector install fails with WebView2 permission error | Current user lacks RW permission on ODJConnectorEnrollmentWizard.exe.webview2... | Grant RW permission to the webview2 folder. Ensure WebView2 runtime is instal... | 9.0 | ado-wiki |
| 22 | Single-app/Multi-app Kiosk profile 在 Hybrid Azure AD Joined 设备上部署失败，报 Assigne... | Kiosk profile 在 Hybrid Azure AD Joined 设备上存在已知兼容性问题 | 参考内部文档: https://internal.evergreen.microsoft.com/en-us/topic/bdacb094-82fa-f9... | 9.0 | ado-wiki |
| 23 | Windows Backup for Organizations 还原页面在 OOBE 中未显示，设备为 Hybrid Azure AD Joined | Windows Backup 还原功能不支持 Hybrid Azure AD Join，仅支持纯 Entra ID joined 设备。同时不支持自部署模... | 确认设备为纯 Entra joined + 用户驱动注册。还原要求：Windows 11 22H2 build 22621.3958+ 或 23H2 bu... | 9.0 | ado-wiki |
| 24 | Hybrid AADJ device user cannot get PRT (AzureAdPrt: NO), WHFB/CA/SSO all fail | User UPN prefix changed after device registration, CloudAP plugin uses cached... | Fixed in Windows 10 RS4 (1803) - CloudAP uses login credentials instead of ca... | 9.0 | ado-wiki |
| 25 | BitLocker recovery key not escrowed to Azure AD; only saved to local Active D... | During Hybrid Azure AD joined Autopilot provisioning with BitLocker policy as... | 1) Assign BitLocker policy to user group instead of device group (may still f... | 9.0 | ado-wiki |
| 26 | Autopilot HAADJ fails with error 80070774 when Assigned User feature is used | Assigned User feature causes HAADJ failure with error 80070774 | See KB https://internal.evergreen.microsoft.com/en-us/help/4469771. Avoid Ass... | 8.0 | ado-wiki |
| 27 | Cannot save corporate data in WIP-allowed apps (Word, Excel) on Hybrid Azure ... | The Encrypting File System (EFS) Data Recovery Agent (DRA) certificate in the... | 1) Export old DRA certificate and private key for decrypting existing files. ... | 8.0 | mslearn |
| 28 | 'Rename device' setting disabled for Windows devices that are Hybrid Azure AD... | Renaming Hybrid Azure AD joined devices can cause device single sign-on error... | This is by design. Device renaming is only available for co-managed devices t... | 8.0 | mslearn |
| 29 | Autopilot error 80070774 in Hybrid Entra join scenario. Device times out duri... | Assign user feature is configured in the Autopilot profile for a Hybrid Entra... | Unassign user from the Autopilot device in Intune admin center. Or check ODJ ... | 8.0 | mslearn |
| 30 | Device Offboarding Agent 建议列表中未出现 Windows Autopilot 设备 | 已知 CRI——Windows Autopilot 设备目前不会出现在 Agent 建议中，属于产品缺陷 | 已知问题，目标在 2601 修复后 Windows Autopilot 设备将出现在 Agent 建议中；当前无 workaround，需等待修复 | 7.5 | ado-wiki |
| 31 | The following information shows how to successfully deploy Lotus Notes via Wi... |  |  | 7.5 | contentidea-kb |
| 32 | The customer wants to automatically enroll local domain joined PC's into Intu... | This can occur if hybrid Azure AD joined device setup is not configured. You ... | First, the client computers must be running at least Windows version 1709. Ne... | 7.5 | contentidea-kb |
| 33 | For AutoPilot to work you need to upload a CSV file to your Intune tenant wit... |  |  | 7.5 | contentidea-kb |
| 34 | When attempting to deploy Windows 10 devices in Kiosk mode automatically usin... | This can occur if the targeted device does not meet both of the following pre... | To resolve this problem, ensure that the targeted device meets both of these ... | 7.5 | contentidea-kb |
| 35 | The following warning message is displayed when running &quot;gpupdate/force&... | This can occur if an &quot;AutoMDMEnrollment&quot; GPO is deployed to the com... | This message can be safely ignored. The error is expected considering that th... | 7.5 | contentidea-kb |
| 36 | Devices in an Azure Dynamic Group are being removed/added constantly. For exa... | This happens because of a race condition between Intune and AD Connect. What ... | To work around this problem, the rule was changed:BEFORE(device.deviceOSType ... | 7.5 | contentidea-kb |
| 37 | Attempting to enroll a new Hybrid Azure AD AutoPilot device fails despite pre... | This issue is commonly caused by incorrect delegate permissions to the OU whe... | To resolve this issue, follow the directions Enrollment for Microsoft Entra h... | 7.5 | contentidea-kb |
| 38 | How to set the Edge browser homepage for a Windows 10 MDM enrolled machine in... |  |  | 7.5 | contentidea-kb |
| 39 | When attempting to co-manage devices that are Hybrid AD Joined and Managed wi... | The error occurs when Integrated Windows Authentication is attempted by the C... | Set up Azure Services (Cloud Management) in Configuration Manager and ensure ... | 7.5 | contentidea-kb |
| 40 | A Windows Autopilot device may fail with the following error: Something went ... | The issue is that the customer did not properly delegate permissions to the O... | Solution is to follow the directions to delegate the OU to the computer where... | 7.5 | contentidea-kb |
| 41 | Hybrid azure Ad Joined devices&nbsp;is already configured and you enabled the... | In Event Viewer under Device-Management-Diagnostic-Provider&nbsp; you see err... | On the affected machine, disjoin from the Azure AD using “DsregCMD /leave” co... | 7.5 | contentidea-kb |
| 42 | Windows Autopilot fails in 'Device Preparation' phase with error 0x801c03ed&n... | The customer had the same Autopilot device in two different assigned groups.&... | Determined that the device was in two different Autopilot profile targeted gr... | 7.5 | contentidea-kb |
| 43 | When you go to Devices -&gt; All Devices and choose a Windows device, you wil... | This is a known issue. | Engineering is still working to understand the cause and remediation. We've t... | 7.5 | contentidea-kb |
| 44 | When attempting to create a Windows Autopilot deployment profile in the Intun... | The issue can happen if the naming format that is being specified for the dev... | Used&nbsp;%SERIAL% for the name format instead of&nbsp;%serial%.Below are the... | 7.5 | contentidea-kb |
| 45 | User-Driven autopilot deployment fails with the following error during OOBEYo... | This occurs when the account used is a Federated account and the Identity pro... | Customer should contact their Identity provider to enable WS-Trust or choose ... | 7.5 | contentidea-kb |
| 46 | During Windows 10 Autopilot, the process fails due to &quot;Something went wr... | The use of CN instead of a OU, in the Organizational Unit will result in fail... | Update the Organizational Unit in the Profile to instead use OU vs CN.Example... | 7.5 | contentidea-kb |
| 47 | After we applied WIP policy from Intune to the Hybrid Azure AD joined Windows... | We removed the Teams app from the protected apps list in WIP policy and the T... | In order to resolve this issue, we followed steps in following article to rem... | 7.5 | contentidea-kb |
| 48 | Customer would like to setup Autopilot and allow users to change their passwo... |  | Requirements:&nbsp;  Customer Need to have EMS      (Intune + AADP) licenses,... | 7.5 | contentidea-kb |
| 49 | Event Tracing Logs (ETL) are created by Windows and include system activity c... |  |  | 7.5 | contentidea-kb |
| 50 | Windows Autopilot white glove does not work and you see a red screen that say... | This can occur if you are deploying to a&nbsp;non-English OS&nbsp;and Windows... | To resolve this issue, download and install the&nbsp;KB4505903 update&nbsp;on... | 7.5 | contentidea-kb |
| 51 | When enrolling Windows computers using Autopilot PKCS certificates are taking... | User PKCS certificate profiles should not be targeted to device groups as thi... | Make sure that PKCS certificate profiles that have user attributes for the su... | 7.5 | contentidea-kb |
| 52 | Error code 0x800705b4 at “Preparing your device for mobile management&quot; w... | Data collected for analysis with the command :&nbsp;MdmDiagnosticsTool.exe -a... | Opening port 123 (UDP/NTP) in Firewall, resolved the issue. | 7.5 | contentidea-kb |
| 53 | It may happen that an Azure AD Joined or Hybrid Azure AD Joined Windows 10 de... |  |  | 7.5 | contentidea-kb |
| 54 | Autopilot fails to join offline domain in a hybrid environment, and the follo... | This can occur due to a targeting problem for the profile. For example, when ... | To resolve this issue, change the assignment of the “Domain Join” profile to ... | 7.5 | contentidea-kb |
| 55 | Hybrid Azure Ad Join Autopilot device unable to download Autopilot Profile. E... | Device unable to reach required endpoints to download Autopilot profile | Devices need to reach out to the below URL’S in order to download Autopilot p... | 7.5 | contentidea-kb |
| 56 | Intune can manage three main operating systems:AndroidiOSWindows 10The focus ... |  |  | 7.5 | contentidea-kb |
| 57 | Autopilot Win10 Version 2004, when user try to collect the Autopilot.cab logs... | Intune : Unable to collect Autopilot.cab logs on 2004 machines&nbsp;During Au... | Intune : Unable to collect Autopilot.cab logs on 2004 machines&nbsp;During Au... | 7.5 | contentidea-kb |
| 58 | During the Autopilot deployment process for hybrid Entra join scenario,  the ... | After checking the permission explained on this Microsoft doc https://learn.m... | It is essential for all your active connectors to possess identical permissio... | 7.5 | contentidea-kb |
| 59 | You have hybrid AAD Autopilot devices pending hybrid AAD join, however when t... | This can occur if the Registry key below&nbsp;is set to 0&nbsp;by Configurati... | To resolve this issue, created a new Client setting with highest priority tha... | 7.5 | contentidea-kb |
| 60 | When trying to delete a record from the Windows Autopilot devices blade in In... | The issue occurs if the device still appears as Enrolled in our database: | 1. Open browser Developer Tools (F12 in Chrome / Edge / Mozilla) while still ... | 7.5 | contentidea-kb |
| 61 | This article lists the subtasks for&nbsp;Demonstrate an understanding of Wind... |  |  | 7.5 | contentidea-kb |
| 62 | This article contains the Windows Autopilot JTA.&nbsp;JTA (Job Task Analysis)... |  |  | 7.5 | contentidea-kb |
| 63 | This&nbsp;Lab manual is designed to provide you with the high-level steps to ... |  |  | 7.5 | contentidea-kb |
| 64 | Windows Autopilot deployment processes are summarized in the link below. Ther... |  |  | 7.5 | contentidea-kb |
| 65 | Practices and Use CasesQuestion 1: How to Get Device ID for Windows AutoPilot... |  |  | 7.5 | contentidea-kb |
| 66 | When trying to complete Autopilot Hybrid User driven mode with an always on V... | This can occur if the device is using an HP network dongle. During the Autopi... | Devices using&nbsp;HP Dockers need to update the driver used during Autopilot... | 7.5 | contentidea-kb |
| 67 | If you're familiar with Autopilot with Hybrid Azure AD Join, you know that at... |  |  | 7.5 | contentidea-kb |
| 68 | During the User flow of White glove autopilot, when you power up the machine ... | This can occur if the Microsoft Account Sign-In Assistant (wlidsvc) is disabl... | To resolve this problem, run the following script to change the wlidsvc value... | 7.5 | contentidea-kb |
| 69 | When attempting to upload a CSV file for Windows Autopilot, you receive a Ztd... | AutoPilot service sends this error code ONLY  when it doesn’t find any corres... | This error cannot occur because of a problem with Intune, this the customer w... | 7.5 | contentidea-kb |
| 70 | When a device is powered on, it does not go through AutoPilot process even th... | This can occur if the device is running an antivirus application that is caus... | To resolve this problem, uninstall the AV (parity.sys in the this example) or... | 7.5 | contentidea-kb |
| 71 | Windows 365 Interactive Demo:&nbsp;This interactive demo walks you through th... |  |  | 7.5 | contentidea-kb |
| 72 | There are currently three options to deploy Cloud PCs with Windows 365 Enterp... |  |  | 7.5 | contentidea-kb |
| 73 | Requirements  Requirements for Windows 365 Network requirements Azure network... |  |  | 7.5 | contentidea-kb |
| 74 | There are three scenarios to provision Cloud PCs in Windows 365 Enterprise. W... |  |  | 7.5 | contentidea-kb |
| 75 | Windows 365 Interactive Demo:&nbsp;This interactive demo walks you through th... |  |  | 7.5 | contentidea-kb |
| 76 | Cloud PC that is Azure AD      Joined   User's domain is federated   Users ar... | The user's domain is federated with a third-party identity provider that does... | Validate if the domain is federated with a third-party identity provider Cust... | 7.5 | contentidea-kb |
| 77 | Cloud PC with Windows 365      Enterprise license fails to provision with the... | Issue 1 -  Customer has not configured Hybrid Azure AD Join in Azure AD Conne... | Issue 1 - 1. This requirement is outlined in our public documentation: &quot;... | 7.5 | contentidea-kb |
| 78 | This document is created to help Identify&nbsp;Business CPC&nbsp;and Enterpri... |  |  | 7.5 | contentidea-kb |
| 79 | We have the following path:&nbsp;C:\Program Files\Microsoft Intune\ODJConnect... |  |  | 7.5 | contentidea-kb |
| 80 | Consider the following scenario: A Windows device is currently joined to Loca... | Based on discussions with the Windows and Intune engineering teams, this scen... | NA | 7.5 | contentidea-kb |
| 81 | When you attempt to login to the Intune Connector for Active Directory it fai... | This can occur if the Service Connection Point (SCP) is not configured. | To resolve this problem, configure the SCP via AAD connect to deploy a Hybrid... | 7.5 | contentidea-kb |
| 82 | This document outlines some of the basic workings of Windows authentication.&... |  |  | 7.5 | contentidea-kb |
| 83 | To understand the &quot;convert&quot; concept, you need to differentiate betw... |  |  | 7.5 | contentidea-kb |
| 84 | Around 85 Devices Are not co-managed because all those devices Are Not Hybrid... | My Findings:  1-Automatic device registration Task Was disabled on those devi... | So, at a basic level, this meant that my issue was one of communication. For ... | 7.5 | contentidea-kb |
| 85 | Customer has question about redirection support. This article around redirect... |  | There are a series of RDP device redirections that require a GPO to manage, t... | 7.5 | contentidea-kb |
| 86 | Note: All the screenshots displayed in this internal article belong to a test... | Procmon trace shows the&nbsp;ODJConnectorSvc&nbsp;process needs full access t... | The connector service account must have the following permissions: Logon as S... | 7.5 | contentidea-kb |
| 87 | This article outlines the steps and the enrollment flow for&nbsp;Autopilot HY... |  |  | 7.5 | contentidea-kb |
| 88 | Members of an Azure AD group added to the Local Administrator Group are unabl... | This can occur if the&nbsp;token initially added via AAD join or prior to pol... | For devices that still did not get a refresh token for any reason, newer wind... | 7.5 | contentidea-kb |
| 89 | Hybrid AAD Joined devices fail to enroll and return an error msg: 'The backgr... | AAD Operational event logs do not reflect any errors, however, System logs sh... | The Identity team suggested following these steps to check the permissions an... | 7.5 | contentidea-kb |
| 90 | &nbsp;Pre-requisites for creating Domain Controller and Active Directory Virt... |  |  | 7.5 | contentidea-kb |
| 91 | Non-Intune managed devices are requesting an Autopilot reset even if there is... | There was an issue on Imprivata that could be addressed by changing an authen... | To fix the behavior and stop Imprivata from activating Autopilot, reset it fo... | 7.5 | contentidea-kb |
| 92 | Here are some generic questions that can be asked: Can you please describe th... |  |  | 7.5 | contentidea-kb |
| 93 | Autopilot device is not receiving the Branding page, even the Autopilot deplo... | Potentially causes can be: Network restrictions:&nbsp;Intune: Network endpoin... | Resolution: Install supported version&nbsp;https://learn.microsoft.com/en-us/... | 7.5 | contentidea-kb |
| 94 | Please use Resolution/Workaround section to add details on Known Issue or Tip... |  | Known Issue&nbsp;: 1 (arsinh)  Description:&nbsp;While configuring New ODJ co... | 7.5 | contentidea-kb |
| 95 | Delete: Intune: Hybrid Azure AD Join AutoPilot troubleshooting |  |  | 7.5 | contentidea-kb |
| 96 | Windows HAADJ device shows Intune sync error 0x80190190 for all logon users. ... | Non-primary logon users on the device do not have Intune licenses assigned. W... | Assign Intune licenses to all users who log on to the device, then trigger sy... | 7.0 | onenote |
| 97 | Hybrid Entra joined Windows device shows Windows failed to apply the MDM Poli... | Expected behavior - Auto MDM Enrollment GPO tries to enroll already enrolled ... | Safely ignore the warning. Error 0x8018000a confirms device already enrolled. | 6.5 | mslearn |
| 98 | Cannot delete Windows Autopilot deployment profile in Intune; error 'The prof... | Profile still assigned to groups in Microsoft Entra ID, or assigned group was... | If group exists: remove all groups from Included groups in profile Assignment... | 5.5 | mslearn |
| 99 | Windows Autopilot fails in 'Device Preparation' phase with error 0x801c03ed | The customer had the same Autopilot device in two different assigned groups. ... | Determined that the device was in two different Autopilot profile targeted gr... | 4.5 | contentidea-kb |
| 100 | When attempting to create a Windows Autopilot deployment profile in the Intun... | The issue can happen i f the naming format that is being specified for the de... | Used %SERIAL% for the name format instead of %serial%. Below are the requirem... | 4.5 | contentidea-kb |
| 101 | A Windows Autopilot device may fail with the following error: Something went ... | The issue is that the customer did not properly delegate permissions to the O... | Solution is to follow the directions to delegate the OU to the computer where... | 3.0 | contentidea-kb |
| 102 | Hybrid azure Ad Joined devices is already configured and you e nabled the aut... | In Event Viewer under Device-Management-Diagnostic-Provider you see error (0x... | On the affected machine, disjoin from the Azure AD using “ DsregCMD /leave ” ... | 3.0 | contentidea-kb |
| 103 | When you go to Devices -> All Devices and choose a Windows device, you will s... | This is a known issue. | Engineering is still working to understand the cause and remediation. We've t... | 3.0 | contentidea-kb |
