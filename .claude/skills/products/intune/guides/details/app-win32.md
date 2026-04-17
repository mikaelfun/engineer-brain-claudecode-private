# INTUNE Win32 应用部署与 IME — 已知问题详情

**条目数**: 266 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Need to understand Intune app deployment architecture to troubleshoot why a required app is not installing, stuck downloading, or reporting incorre...
**Solution**: Store/LOB apps: trace push notification > OMA-DM check-in > DownloadService > GetAppStatus/ReportAppStatus flow. DeviceManagementProvider Kusto table tracks all stages. Win32/PowerShell (IME/SideCar): (1) IME agent deploys first via EnterpriseDesktopAppManagement CSP; (2) Agent polls StatelessSideCarGatewayService for deployments; (3) All install/download/status handled by agent independently. Autopilot/OOBE: device-context apps (LocURI starts .device) deploy during ESP Device Preparation under 
`[Source: onenote, Score: 9.5]`

### Step 2: Intune Win32 app or LOB app download fails silently on Windows; BITS (Background Intelligent Transfer Service) suspected as cause; app deployment s...
**Solution**: Collect BITS ETL + netmon + procmon + TTT traces: (1) Download netmon and procmon (Sysinternals); (2) Start TTT: TTTracer.exe -initialize then Tttracer.exe -ring -Maxfile 1024 -attach <IME_PID>; (3) Start BITS ETL: logman create trace admin_services -ow -o c:\admin_services.etl -p Microsoft-Windows-Bits-Client 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets; add providers {4A8AAA94-CFC4-46A7-8E4E-17BC45608F0A}, BITS Server Extensions, Microsoft-Windows-Bits-Co
`[Source: onenote, Score: 9.5]`

### Step 3: Intune PowerShell scripts deployed via IME always run as SYSTEM, even when 'Run this script using the logged on credentials' is enabled in policy.
**Solution**: Fixed in SideCar (IME) agent version 1.7.103 or later. Update IME agent to v1.7.103+. Verify agent version from Apps and Features.
`[Source: onenote, Score: 9.5]`

### Step 4: PowerShell scripts deployed through Intune Management Extension (IME) do not execute on Surface Hub devices.
**Solution**: By-design limitation. Do not deploy PowerShell scripts via IME to Surface Hub. See KB4073215.
`[Source: onenote, Score: 9.5]`

### Step 5: Intune PowerShell script deployment fails: 'The file ...ps1 is not digitally signed. You cannot run this script on the current system.' Policy resu...
**Solution**: Check execution policy on device. IME requires Bypass or a policy permitting locally-downloaded scripts. If using 32-bit PowerShell (x86), note registry redirection may also cause issues. Verify correct bitness and execution policy.
`[Source: onenote, Score: 9.5]`

### Step 6: Intune PowerShell script needs to re-run but IME only executes scripts once; script shows as succeeded but needs to run again with updated content
**Solution**: Reset registry values: set DownloadCount=0, ErrorCode=0, Result and ResultDetails to empty string at HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\Policies\{UserGUID}\{ScriptGUID}. Restart 'Microsoft Intune Management Extension' service. Alternative: use scheduled task wrapper to make script run repeatedly.
`[Source: onenote, Score: 9.5]`

### Step 7: Intune portal shows PowerShell script applied successfully but the script does not produce expected results on device; registry keys not found or s...
**Solution**: Test script with Windows PowerShell (x86) locally. If x86 cannot run as expected, it is a 32-bit PowerShell limitation. Check WOW64 registry redirection docs. Consider using 64-bit context or adjusting script to handle redirection.
`[Source: onenote, Score: 9.5]`

### Step 8: Intune PowerShell scripts using legacy Microsoft Intune application (client) ID (d1ddf0e4-d672-4dae-b554-9d5bdfd93547) stop working or fail authent...
**Solution**: 1) Create a new app registration in Microsoft Entra admin center. 2) Update all PowerShell scripts to replace the Intune application ID (d1ddf0e4-d672-4dae-b554-9d5bdfd93547) with the new registered application ID. Reference: https://github.com/microsoft/mggraph-intune-samples
`[Source: onenote, Score: 9.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to understand Intune app deployment architecture to troubleshoot why a r... | Intune uses two parallel deployment architectures: (1) Main OMA-DM/IWS path f... | Store/LOB apps: trace push notification > OMA-DM check-in > DownloadService >... | 9.5 | onenote |
| 2 | Intune Win32 app or LOB app download fails silently on Windows; BITS (Backgro... | BITS handles background package downloads for Intune LOB and Win32 apps on Wi... | Collect BITS ETL + netmon + procmon + TTT traces: (1) Download netmon and pro... | 9.5 | onenote |
| 3 | Intune PowerShell scripts deployed via IME always run as SYSTEM, even when 'R... | Known bug in Intune Management Extension (SideCar): user-context execution wa... | Fixed in SideCar (IME) agent version 1.7.103 or later. Update IME agent to v1... | 9.5 | onenote |
| 4 | PowerShell scripts deployed through Intune Management Extension (IME) do not ... | Surface Hub does not support Intune Management Extension (SideCar) by design.... | By-design limitation. Do not deploy PowerShell scripts via IME to Surface Hub... | 9.5 | onenote |
| 5 | Intune PowerShell script deployment fails: 'The file ...ps1 is not digitally ... | Windows PowerShell execution policy blocks unsigned scripts. IME-downloaded s... | Check execution policy on device. IME requires Bypass or a policy permitting ... | 9.5 | onenote |
| 6 | Intune PowerShell script needs to re-run but IME only executes scripts once; ... | Intune Management Extension caches script execution results in registry at HK... | Reset registry values: set DownloadCount=0, ErrorCode=0, Result and ResultDet... | 9.5 | onenote |
| 7 | Intune portal shows PowerShell script applied successfully but the script doe... | IME runs PowerShell scripts using Windows PowerShell (x86) 32-bit by default.... | Test script with Windows PowerShell (x86) locally. If x86 cannot run as expec... | 9.5 | onenote |
| 8 | Intune PowerShell scripts using legacy Microsoft Intune application (client) ... | Microsoft removed the global Intune PowerShell application (client) ID based ... | 1) Create a new app registration in Microsoft Entra admin center. 2) Update a... | 9.5 | onenote |
| 9 | Cannot deploy printer drivers to non-administrator users via Intune after KB5... | KB5005652 (CVE-2021-34481) changed default behavior to restrict printer drive... | Option 1: Deploy PowerShell script via Intune (run as SYSTEM) to set registry... | 9.5 | onenote |
| 10 | Win32 app download skipped with 'opt-in policy is not set' error; Managed Ins... | The registry.pol file under C:\Windows\System32\GroupPolicy\User is 0 bytes. ... | Delete the registry.pol file under C:\Windows\System32\GroupPolicy\User and r... | 9.5 | onenote |
| 11 | Managed Installer remediation script fails with 'The local policy cannot be o... | Broken GUIDs in C:\Windows\System32\GroupPolicy\gpt.ini under gPCMachineExten... | Delete all files and folders under C:\Windows\System32\GroupPolicy to reset l... | 9.5 | onenote |
| 12 | Win32 app deployment via Intune Management Extension (IME) downloads extremel... | IME deployment uses Verizon CDN which has high network latency when connected... | PG confirmed re-deployment with Azure CDN (ETA FY24Q3). Workaround: use non-C... | 9.5 | onenote |
| 13 | Win32 app or PowerShell script deployment fails; Intune Management Extension ... | AAD registered devices do not support IME installation. Only AAD joined (Enro... | Verify EnrollmentType in Kusto (DeviceManagementProvider table). Change devic... | 9.5 | onenote |
| 14 | Intune Management Extension (IME/MSI) download fails and does not retry; Intu... | EnforcementRetryCount exhausted in registry at HKLM\SOFTWARE\Microsoft\Enterp... | Navigate to HKLM\SOFTWARE\Microsoft\EnterpriseDesktopAppManagement\, find Int... | 9.5 | onenote |
| 15 | Intune PowerShell script fails and stops executing after 3 retry attempts; sc... | Script timeout (30 min) or device reboot during execution counts as an error ... | Reset DownloadCount to 1 in registry: HKLM\SOFTWARE\Microsoft\IntuneManagemen... | 9.5 | onenote |
| 16 | Intune Endpoint Protection で Firewall Policy を展開すると、Windows Defender Firewall... | Intune (MDM) 経由で配布された Firewall ルールは PolicyManager ではなく HKLM\SYSTEM\ControlSet... | MDMDiagnosticlog や Event Viewer (Event ID 2097: Windows Firewall With Advance... | 9.5 | onenote |
| 17 | Win32 app or PowerShell script deployed via Intune does not install on Window... | Intune Management Extension (required for Win32 app and PowerShell script dep... | Verify device enrollment type: check registry or run Kusto query. If device i... | 9.5 | onenote |
| 18 | Need to deploy WeChat (or other China-market apps without MSI installer) to W... | WeChat and many China-market applications only provide .exe installers withou... | Use Microsoft Win32 Content Prep Tool (IntuneWinAppUtil.exe) to convert the E... | 9.5 | onenote |
| 19 | Cannot deploy AppLocker Managed Installer rule collection via Intune native U... | Intune does not have a native UI to deploy AppLocker Managed Installer XML po... | Package PowerShell script + AppLocker XML as Win32 app: 1) Create .ps1 with S... | 9.5 | onenote |
| 20 | Windows trusted certificate (Sub CA) deployment via Intune fails with error 0... | Same certificate is simultaneously targeted to both User group and Computer c... | 1) Identify conflicting policies: check if the same certificate thumbprint is... | 9.5 | onenote |
| 21 | Win32 app installation fails with error code -2147024894 (0x80070002) and Fai... | The install command filename specified in the Intune Win32 app configuration ... | 1. Rename .intunewin to .zip and inspect Detection.xml for the actual setup f... | 9.5 | onenote |
| 22 | Win32 app supersedence scenario: hide toast notification setting works for ne... | When old version app assignment is deleted, the hide notification (ToastState... | 1. Keep old version app assignment active and set it to Hide all toast notifi... | 9.5 | onenote |
| 23 | Chrome app push installation via Company Portal fails with error app or devic... | ChromeSetup.exe is an online stub installer that downloads Chrome from Google... | 1) Use the Chrome MSI full offline installer instead of the online ChromeSetu... | 9.5 | onenote |
| 24 | Win32 应用安装后 Intune 报告 Not Detected（-2016345060），检测规则返回 NotDetected | 检测规则配置错误：注册表路径/文件路径/PowerShell 脚本逻辑与实际安装结果不匹配 | 1. 检查 AppWorkload.log 中 DetectionActionHandler 的 detection state；2. 确认 Detect... | 9.0 | ado-wiki |
| 25 | Win32 应用内容下载失败，Delivery Optimization (DO) 报错或超时，AppWorkload.log 显示 download f... | 设备无法从 Intune CDN（swdb02-mscdn.manage.microsoft.com）下载 .intunewin.bin 文件，通常为网络... | 1. 检查 AppWorkload.log 中 DownloadActionHandler 和 DO TEL 日志；2. 确认设备可访问 swdb02-m... | 9.0 | ado-wiki |
| 26 | Win32 应用部署卡在 EnforcementState 5000-5999（Error）或 2000-2999（In Progress），安装进程未完成 | 安装命令执行失败或超时（默认 MaxRunTimeInMinutes=60），可能因安装程序本身报错、依赖缺失、或设备资源不足 | 1. 通过 Kusto 查询 DeviceManagementProvider 表（EventId 5767/5766）获取 enforcementSta... | 9.0 | ado-wiki |
| 27 | Win32 应用在 Windows S Mode 设备上无法安装，系统阻止非 Store 应用运行 | Windows 10 S Mode 默认只允许运行 Store 应用，不允许安装和执行 Win32 应用 | 在 Intune 中配置 S mode supplemental policy，启用 Win32 应用在 S mode 设备上的安装和运行权限 | 9.0 | ado-wiki |
| 28 | 客户请求在 Enterprise App Catalog 中添加缺失的应用程序 | 目录中尚未收录该应用，Enterprise App Catalog 仅提供预打包的目录应用 | 1. CSS 填写 https://aka.ms/eam/AppRequest 表单提交请求；2. 通知客户已提交并关闭 Case；3. 注意：不存在 I... | 9.0 | ado-wiki |
| 29 | EPM Client Settings policy shows error: Allow Device Health Monitoring state ... | Registry key HKLM:\SOFTWARE\Microsoft\PolicyManager\current\device\DeviceHeal... | 1) Verify OS is supported version. 2) Check registry key contains PrivilegeMa... | 9.0 | ado-wiki |
| 30 | EPM error: organization doesnt allow you to run this app as administrator — e... | EPM client not enabled (registry DHMScopeValue missing PrivilegeManagement) o... | 1) Verify OS is supported. 2) Check registry HKLM:\SOFTWARE\Microsoft\PolicyM... | 9.0 | ado-wiki |
| 31 | Specific driver not being offered in Intune Driver Update policy — policy ass... | Driver not uploaded to MS Catalog by OEM; or HWID mismatch (driver not applic... | 1) Search MS Catalog for driver by name/version 2) If not found, OEM hasn't s... | 9.0 | ado-wiki |
| 32 | Unable to upload Win32 app larger than 8GB in Intune | Tenant is unpaid/trial/free — Win32 upload limit is 8GB for unpaid tenants vs... | Verify tenant is paid in Assist365. Paid tenants automatically have 30GB per ... | 9.0 | ado-wiki |
| 33 | Unknown process is modifying environment variables (HKLM\SYSTEM\CurrentContro... | Windows does not natively audit registry key modifications. Without explicit ... | Enable registry audit: (1) gpedit.msc > Computer Configuration > Windows Sett... | 8.5 | onenote |
| 34 | Intune remediation script result not reported to service after network outage... | Known issue: when network failure occurs during result upload, IME may not de... | Wait up to 7 days for correction. Workaround: modify remediation script to pr... | 8.5 | onenote |
| 35 | Win32 app toast notification still showing during supersedence scenario even ... | When a Win32 app supersedes an old version, IME uninstalls the old version an... | 1. Keep the old version app's assignment in Intune (do not delete it). 2. Set... | 8.5 | onenote |
| 36 | Win32 app toast notification for supersedence (uninstall of old version) stil... | Old app assignment controls the uninstall toast notification. If old app assi... | Keep the old (superseded) app assignment in Intune and set it to Hide all toa... | 8.5 | onenote |
| 37 | Windows Update Ring configured with Feature update delay of 365 days, expecte... | The 'Enable Windows 11 latest' toggle was enabled in the update ring, causing... | 1) Disable 'Enable Windows 11 latest' toggle in the update ring; 2) Verify al... | 8.5 | onenote |
| 38 | Intune policy RemovableDiskDenyWriteAccess deployed successfully (registry an... | Registry key HKLM\SYSTEM\CurrentControlSet\Control\Storage\HotplugSecureOpen ... | 1. Check if HotplugSecureOpen registry key exists: HKLM\SYSTEM\CurrentControl... | 8.0 | onenote |
| 39 | Intune policy RemovableDiskDenyWriteAccess deployed successfully (registry va... | Conflict with Audit removable storage policy. The Audit policy sets registry ... | Remove HotplugSecureOpen registry key and restart WPD services. Or remove the... | 8.0 | onenote |
| 40 | Autopilot ESP (Enrollment Status Page) fails with error 0x800705b4 (E_TIMEOUT... | Network connectivity issues to CDN endpoints in China prevent IME MSI or Win3... | 1) Get IME download URL from registry; 2) Test CDN download manually in brows... | 8.0 | onenote |
| 41 | INF driver installation via Intune Win32 app deployment using pnputil.exe in ... | Standard INF driver install methods (pnputil.exe invoked via PowerShell Start... | Check pnputil results in %windir%\inf\setupapi.dev.log. Note that Intune down... | 7.5 | onenote |
| 42 | When trying to enroll and configure Windows phones into IBM MaaS360 Mobile De... | This can occur if the Company Hub Certificate has expired. | To resolve this problem, renew the Company Hub Certificate by following the s... | 7.5 | contentidea-kb |
| 43 | Users may get This page cant be displayed error on Windows 8.1 and Windows 10... | Azure AD Cloud App Discovery agent is installed with the default option of De... | Ensure that the Deep Inspection feature of Azure AD Cloud App Discovery is ch... | 7.5 | contentidea-kb |
| 44 | Windows Store for Business is not syncing with Intune Stand Alone after being... | The article is out of date and is missing a step | The article: https://docs.microsoft.com/en-us/intune/deploy-use/manage-apps-y... | 7.5 | contentidea-kb |
| 45 | This document describes how to use Fiddler to capture a network trace, includ... |  | Fiddler is a free 3rd party tool that customers can download and use if they ... | 7.5 | contentidea-kb |
| 46 | This article describes how to verify whether an application package has been ... |  |  | 7.5 | contentidea-kb |
| 47 | When attempting to enroll a Windows 10 Device (1703) via MDM. The following e... | The device was previously enrolled with an Azure AD account that has been dis... | 1) On the impacted device open regedit.exe and navigate to: HKEY_LOCAL_MACHIN... | 7.5 | contentidea-kb |
| 48 | Customer is using the Microsoft Deployment Tool to deploy a custom image to W... |  |  | 7.5 | contentidea-kb |
| 49 | When scanning for updates with the Intune Agent, you receive error 0x8024001e... | To verify the Kaspersky agent is the cause of the issue, attempt to delete th... | Customer should contact Kaspersky for guidance on adding the Intune Agent/Win... | 7.5 | contentidea-kb |
| 50 | Occasionally when a .msi application is deployed to Windows 10 MDM devices th... | This behavior is occurring because the package has the ability to update itse... | Configure the MSI app to ignore the version check process as per: Add a Windo... | 7.5 | contentidea-kb |
| 51 | Windows 10: UI option to enroll device into Intune is unavailable or greyed o... |  |  | 7.5 | contentidea-kb |
| 52 | Note that the preferred method for this is in p.MsoNormal, li.MsoNormal, div.... |  |  | 7.5 | contentidea-kb |
| 53 | Intune Management Extension (IME/Sidecar) troubleshooting guide: runs PowerSh... |  |  | 7.5 | contentidea-kb |
| 54 | If you deploy a PowerShell Script via the Intune Management Extension (see ar... |  | This is considered by-design.As of 1/3/2018, Windows MDM does not support the... | 7.5 | contentidea-kb |
| 55 |  | **Collecting log filesRequesting the customer to send the Windows Update log ... | Delete | 7.5 | contentidea-kb |
| 56 | When bulk enrolling Windows devices, you receive the following error message ... | This issue can occur if the Azure AD user account in the account package (Pac... | To resolve this problem, allow Azure AD Join for All or include the Azure AD ... | 7.5 | contentidea-kb |
| 57 | Intune provides settings in the Intune Admin blade termed "Cloud Printer". Th... |  |  | 7.5 | contentidea-kb |
| 58 | When the Managed Browser and Edge Browser are targeted by an App Proxy redire... | The Azure App proxy is not configured correctly or there may be issues with a... | First thing to check is whether the policy is successfully applying to the de... | 7.5 | contentidea-kb |
| 59 | Devices managed by Intune can be administered remotely using TeamViewer. The ... |  | 1) For IT Pro, install the v13 Windows app directly from https://www.teamview... | 7.5 | contentidea-kb |
| 60 | When you try to enroll a Windows 10 device automatically by using Group Polic... | This issue can occur if the UPN contains an unverified or non-routable domain... | On the AD DS server, open Active Directory Users and Computers, select a vali... | 7.5 | contentidea-kb |
| 61 | Customer has set up a new Intune tenant for use with either Intune MDM or 3rd... | It seems that someone, perhaps their admin, has disabled the Intune AAD App. ... | To resolve this is easy, the customer just needs to do the following steps wi... | 7.5 | contentidea-kb |
| 62 | There are 2 possible scenarios for having compliance issues in Intune due to ... | Scenario 1: The compiance result will depend on the TPM recording into PCR7 (... | First, please confirm that TPM shows only as TPM is ready for use (please ask... | 7.5 | contentidea-kb |
| 63 | Intune: Ingesting Office 16 ADMX-Backed policies using Microsoft Intune Start... |  |  | 7.5 | contentidea-kb |
| 64 | We can uninstall pre-installed windows store app via Intune, details as below... |  |  | 7.5 | contentidea-kb |
| 65 | After deploying the PowerShell script to a user or device group, the Intune M... | This occurs because the Intune Management Extension is a type of MobileMsi, a... | Switch the SCCM Client apps Co-Management workload to Intune or Intune pilot,... | 7.5 | contentidea-kb |
| 66 | 1. Confirm with customer if device is AAD joined and auto enrolled into Intun... |  |  | 7.5 | contentidea-kb |
| 67 | Step 1. Download and install Android Wrapper tool: Go to the below github lin... |  |  | 7.5 | contentidea-kb |
| 68 | Customer has developed a Powershell script, tested it running in the&nbsp;Win... | Update: Intune now supports pushing PowerShell scripts to run in 64bits, as s... | Although everything is working as designed, a work around for this issue is t... | 7.5 | contentidea-kb |
| 69 | Summary:1. We can check if MSI job has been created in Registry a. For device... |  |  | 7.5 | contentidea-kb |
| 70 | The Windows 10 Desktop application, “AirServer”, is not synchronizing from th... | The Windows 10 Desktop application, “AirServer” uses an encrypted format (EAp... | This is expected behavior. An alternate solution is to deploy the app using t... | 7.5 | contentidea-kb |
| 71 | Unable to turn Defender Realtime Protection onRealtime protection is grayed/g... | If the user is unable to turn Defender settings on, this would not be caused ... | Check Registry EntriesSee KB 4493748Check System Corruptionrun sfc /scannowPr... | 7.5 | contentidea-kb |
| 72 | After deploying apps to a Surface Hub device, some apps show a status of&nbsp... | This is by design. | Surface Hub only supports installing Universal Windows Platform (UWP) apps, a... | 7.5 | contentidea-kb |
| 73 | Backup actionsAdministrative Templates (Device Configurations)Administrative ... |  |  | 7.5 | contentidea-kb |
| 74 | Intune UI reports the following error:&nbsp;                 App installation... | Script was encoded on UTF-16BE, even it is supported by PowerShell it is not ... | Edit the script content to be UTF-8Updated the app profile with the new-encod... | 7.5 | contentidea-kb |
| 75 | When trying to enrol a Windows 10 hybrid Azure AD joined machine to Intune th... | The&nbsp;dmwappushservice service was missing from the device, it had been de... | To resolve this issue, we need to add&nbsp;dmwappushservice&nbsp;&nbsp;servic... | 7.5 | contentidea-kb |
| 76 | This article describes how to trace calls from Power BI or PowerShell to the ... |  |  | 7.5 | contentidea-kb |
| 77 | OverviewSideCar is the internal name for the Intune Management Extension (IME... |  |  | 7.5 | contentidea-kb |
| 78 | The purpose of this article is to provide a Kusto Query that can be used when... |  |  | 7.5 | contentidea-kb |
| 79 | What does this guide do? The purpose of this guide is help administrators und... |  |  | 7.5 | contentidea-kb |
| 80 | Customer is deploying the windows LOB app .  	Customer is deploying the MSI p... | When Firefox automatically updates, it is changing the product code so the In... | There is 2 possible solutions to this problemDeploy the Corporate ESR version... | 7.5 | contentidea-kb |
| 81 | OverviewAPPX&nbsp;line-of-business apps:&nbsp;https://docs.microsoft.com/en-u... |  |  | 7.5 | contentidea-kb |
| 82 | Documentationhttps://docs.microsoft.com/en-us/intune/network-access-control-i... |  |  | 7.5 | contentidea-kb |
| 83 | Device is enrolled using classic PC agentYou packaged a CMD batch script, Pow... | Wrapping&nbsp;a script into an&nbsp;executable file&nbsp;is not supported for... | Since scripting and wrapping scripts is a programming and development task, t... | 7.5 | contentidea-kb |
| 84 | There are 3 Intune-related cloud apps which can be enabled to require Multi-f... |  | To fix the issue, 2 things need to happen.Add the flighting tag&nbsp;DeviceCh... | 7.5 | contentidea-kb |
| 85 | When end user is trying to install Available apps (all types include Store ap... | There are two possible causes for this issue:&nbsp;  Device Check-in times ha... | For the solution/workaround for this issue:  If issue caused by Device      C... | 7.5 | contentidea-kb |
| 86 | Windows 10 S Mode normally comes pre-loaded on certain devices. This article ... |  |  | 7.5 | contentidea-kb |
| 87 | With Intune, IT Pros can configure their managed S mode devices using a Windo... |  |  | 7.5 | contentidea-kb |
| 88 | Symptoms                       Windows 10 MDM enrollment through Connec... | Delete | Delete | 7.5 | contentidea-kb |
| 89 | Before you can deploy, configure, monitor, or protect apps, you must add them... |  |  | 7.5 | contentidea-kb |
| 90 | Customer report the error 80070032 when tried to join to AzureAD a Windows 10... | There are orphan registry keys from a previous registration.&nbsp; | The following registry keys were present on the device preventing the AzureAD... | 7.5 | contentidea-kb |
| 91 | When you push a Powershell script you get the following error: &nbsp;The term... | The following is taken from the internal article:&nbsp;Intune: PowerShell err... | To work around this problem, you can use instead WMIC. For example:&nbsp;WMIC... | 7.5 | contentidea-kb |
| 92 | Consider an application {(iOS/Android/Windows),(Store/LOB)) is created in Int... |  |  | 7.5 | contentidea-kb |
| 93 | PowerShell Script&nbsp;wrapped as intunewin and deployed to 64-bit windows de... | Intune Management Extension agent installs as a 32-bit application when devic... | We can modify the script to use&nbsp;[Microsoft.win32.registry…] classes to q... | 7.5 | contentidea-kb |
| 94 | Overview The Enrollment Status Page (ESP)&nbsp;is a set of MDM policies that ... |  |  | 7.5 | contentidea-kb |
| 95 | There are many users looking for Intune’s capability to deploy specific hotfi... |  |  | 7.5 | contentidea-kb |
| 96 | This Article illustrate how to copy file to Windows folder via Win32 app .  M... |  |  | 7.5 | contentidea-kb |
| 97 | There are many users looking for Intune’s capability to deploy specific hotfi... |  | Download the target KB installation file from http://www.catalog.update.micro... | 7.5 | contentidea-kb |
| 98 | When attempting to upload a Mac OS line of business (LOB) application, you ma... | This error may occur if required metadata strings are not present in the .Int... | Use these steps to investigate back-end errors when troubleshooting Mac OS LO... | 7.5 | contentidea-kb |
| 99 | Issue description:On WIP applied Windows devices, attachments downloaded from... |  |  | 7.5 | contentidea-kb |
| 100 | Find the IP address and DNS Suffix of the machine (server/client), on which t... |  |  | 7.5 | contentidea-kb |
| 101 | This is a guide for how to obtain the values needed to add a Protected Deskto... | If the Publisher values do not match the Application Executable then the app ... | Here is an example using Adobe Acrobat Reader DC:On the device with Acrobat R... | 7.5 | contentidea-kb |
| 102 | Setting time zone in Windows 10 with Microsoft Intune using OMA URI | Setting time zone in Windows 10 with Microsoft Intune using OMA URI | Setting time zone in Windows 10 with Microsoft Intune using OMA URI. Until Wi... | 7.5 | contentidea-kb |
| 103 | When attempting to deploy a Win32 app to a Windows 10 device, you may see err... |  | Err -2147024703 / 193 translates to&nbsp;ERROR_BAD_EXE_FORMAT, which indicate... | 7.5 | contentidea-kb |
| 104 | Intune Management Extension (IME, also known internally as SideCar) may fail ... | Intune Management Extension will fail to connect to the Intune service if inc... | To resolve this issue and allow the IME service to connect to Intune, use the... | 7.5 | contentidea-kb |
| 105 | Support Tip: Getting Started with Microsoft Graph API Intune APIs in Microsof... |  |  | 7.5 | contentidea-kb |
| 106 | Windows App Troubleshooting:              The .Intunewin version of the speci... |  |  | 7.5 | contentidea-kb |
| 107 | Devices with Windows 10, version 1903, or later versions failed to enroll in ... | In Windows 10, version 1903, the MDM.admx file was updated to include an opti... | If the customer has 1903 or later versions of Windows, he needs to update the... | 7.5 | contentidea-kb |
| 108 | &nbsp;                       Flow chart Intune Management Extension          ... |  |  | 7.5 | contentidea-kb |
| 109 | &nbsp;                       Flow chart Intune Management Extension          ... |  |  | 7.5 | contentidea-kb |
| 110 | Windows 10 devices are unable to check for updates and generate error code 0x... | In the Registry key&nbsp;HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpda... | To resolve this issue, change the value of DoNotConnectToWindowsUpdateInterne... | 7.5 | contentidea-kb |
| 111 | You are installing several      apps that do not complete or apps are skipped... | Although some customers may choose to disable the User ESP page for various r... | Review and remove any custom Windows Device Configuration Policy that changes... | 7.5 | contentidea-kb |
| 112 | Customers have started to rely on Autopilot Group Tags to be used with dynami... |  |  | 7.5 | contentidea-kb |
| 113 | How to reproduce bulk enrollment (WCD) without removable drive.Windows 10 dev... |  |  | 7.5 | contentidea-kb |
| 114 | When we deploy Windows 10 Device Configuration profile for Kiosk with User lo... | When Exchange Active Sync (EAS) password restrictions are active, the autolog... | Open regedit with elevated rights. Navigate to HKEY_LOCAL_MACHINE\SYSTEM\Curr... | 7.5 | contentidea-kb |
| 115 | Intune device sync process failed with error 0x82ac0200. These were Windows 1... | This occurs if there is a network device that is presenting its own certifica... | Remove from inspection the Microsoft URLs solves the issue.•	login.microsoft.... | 7.5 | contentidea-kb |
| 116 | Symptoms &nbsp; In Windows update ring policy, End user update status, we can... |  |  | 7.5 | contentidea-kb |
| 117 | When Microsoft 365 apps are deployed via Intune using XML data, App deploymen... | Due to misconfiguration of the XML file, Microsoft 365 Apps fail to get deplo... |        C     reate a fresh XML data file for the deployment using&nbsp;  ... | 7.5 | contentidea-kb |
| 118 | Starting with Intune release 2010, Intune will start supporting the installat... | This is a new feature released in 2010 to allow deploying&nbsp;Intune managem... | This issue will occur if the assignment was based on user groups, and you can... | 7.5 | contentidea-kb |
| 119 | The customer is getting an error while is trying to prepare/convert a Win32 a... | It is a current limitation that has been mentioned before in our Microsoft Gi... | The only workaround is to disable FIPS via Registry&nbsp;HKEY_LOCAL_MACHINE\S... | 7.5 | contentidea-kb |
| 120 | USB&nbsp;access does not work as expected. Attempting to access a USB drive f... | This can occur if&nbsp;StorageCardDisabled is enabled (set to 1) in the follo... | To resolve this issue, remove the&nbsp;StorageCardDisabled&nbsp;value&nbsp;in... | 7.5 | contentidea-kb |
| 121 | There are many users setting up Windows 10 tablets as multi app kiosk devices... |  | As confirmed with product group, this is actually by design per the Assigned ... | 7.5 | contentidea-kb |
| 122 | Power BI app, as with other un-unenlightened apps, can only leverage WIP if t... | Without being a Power BI expert, I understand Power BI needs these two proces... | With that said, both files were added to the WIP policy as follows:          ... | 7.5 | contentidea-kb |
| 123 | When running the Connect-MSGraph PowerShell cmdlet, you may see an error simi... | This error can occur because the connection settings are not configured to co... | To resolve this issue, run the following command and try to reconnect:PS C:\W... | 7.5 | contentidea-kb |
| 124 | This article is about how to use Intune administrative template to manage Off... |  | If office doesn't get expected update after policy deployed, the following st... | 7.5 | contentidea-kb |
| 125 | Currently Intune Device Configuration profile does not support changing Power... |  |  | 7.5 | contentidea-kb |
| 126 | Intune Management Extension got uninstalled after device enrolled to Intune. ... | Intune service will send uninstall command to remove IME if the following cri... | Run the following Kusto query to find the reason why Intune sent the uninstal... | 7.5 | contentidea-kb |
| 127 | When a  large Win32 app is downloaded, there can be a long gap (i.e 5-7min fo... |  |  | 7.5 | contentidea-kb |
| 128 | Windows 10 device shows as Not Compliant for Firewall configuration.Running t... | The device has conflicting configuration settings for the firewall in the reg... | Run the following Kusto query:DeviceComplianceStatusChangesByDeviceId('&lt;In... | 7.5 | contentidea-kb |
| 129 | After creating Win32 app, if we use script as Win32 app's requirement rule or... |  |  | 7.5 | contentidea-kb |
| 130 | Sidecar will sync Required apps every hour and Available apps every 8 hours. ... |  |  | 7.5 | contentidea-kb |
| 131 | Windows Store for Business Apps (Online) deployed from Intune are not install... |  |  | 7.5 | contentidea-kb |
| 132 | Windows Autopilot Enrollment Status Page (ESP) fails at win32 application ins... | Win32 app with app ID: e2fe4b6b3a6a was deployed with reboot required device ... | To resolve this problem, change the device restart behavior to No Specific ac... | 7.5 | contentidea-kb |
| 133 | When users initiate a call using the Microsoft Teams client for the first tim... | The Teams Windows client is deployed to the AppData folder located in the use... | To avoid this dialog from occurring, an inbound firewall rule must exist for ... | 7.5 | contentidea-kb |
| 134 | Customers are unable to deploy AutoCAD 2021 via an App Deployment from Intune... | The AutoCAD support team confirmed they do not support Intune deployments. Th... | The only work around is to deploy the package using something other than Intu... | 7.5 | contentidea-kb |
| 135 | Applications may fail to download and install on MacOS 11.2.x devices.&nbsp; ... | This is a known issue with Apple MacOS 11.2 (Big Sur), tracked in Apple bug I... | To resolve this issue, update the affected devices to MacOS 11.3 or higher. | 7.5 | contentidea-kb |
| 136 | For Android Enterprise enrollments, you need to use the Managed Google Play s... | This can occur if there is a different country code associated with the accou... | You can determine the Country Code for the tenant by using the Kusto query be... | 7.5 | contentidea-kb |
| 137 | Engineers need to read and understand below topics before starting this lab.D... |  |  | 7.5 | contentidea-kb |
| 138 | High Level Steps:Understand the business scenarios where Win32 apps are most ... |  |  | 7.5 | contentidea-kb |
| 139 | How would you verify the component works as expected using the GUI, logs and ... |  |  | 7.5 | contentidea-kb |
| 140 | Here are the resources to enable yourself to become fully equipped with the s... |  |  | 7.5 | contentidea-kb |
| 141 | Try to find answers to following questions through lab experience and referen... |  |  | 7.5 | contentidea-kb |
| 142 | This article describes troubleshooting Windows MSI line-of-business (LOB) app... |  |  | 7.5 | contentidea-kb |
| 143 | This lab serves to:Improve a Support Engineer's knowledge of IME + PowerShell... |  |  | 7.5 | contentidea-kb |
| 144 | The Take a Test app allows schools to securely administer online tests to a c... |  |  | 7.5 | contentidea-kb |
| 145 | When deploying a Windows Information Protection policy, the policy does not t... | This can occur if the user has redirected the local folders (e.g. Document, C... | To resolve this problem, enable the GPO &quot;Disable Offline files on indivi... | 7.5 | contentidea-kb |
| 146 | Article TLDR:   - ESP &gt; Device preparation &gt; &quot;Preparing your devic... |  |  | 7.5 | contentidea-kb |
| 147 | Article navigation (tags to different sections):- Autopilot with Hybrid Azure... |  |  | 7.5 | contentidea-kb |
| 148 | In order to deploy the&nbsp;elevation of privilege vulnerability fix released... | This can occur if the vssadmin delete shadows /for=%systemdrive% /Quiet&nbsp;... | To resolve this problem, complete the following:1. Create a PowerShell script... | 7.5 | contentidea-kb |
| 149 | Adobe acrobat reader DC pro contains a lot of files and folders but you can p... |  |  | 7.5 | contentidea-kb |
| 150 | Attempting to sync a Windows 10 device enrolled in Intune fails with the foll... | This can occur if there is an illegal XML character in the SystemProductName ... | To resolve this problem,&nbsp;edit the value&nbsp;SystemProductName&nbsp;so t... | 7.5 | contentidea-kb |
| 151 | AS OF 12/18/2023, THIS FLIGHTING TAG IS NO LONGER REQUIRED.&nbsp; Win32 app m... |  |  | 7.5 | contentidea-kb |
| 152 | THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER ... |  |  | 7.5 | contentidea-kb |
| 153 | After successfully provisioning CloudPC, the following error message      is ... | This can occur if the Cloud PC fails to establish a trust relationship with t... | Validate if the customer is affected by this same issue   Access the Cloud PC... | 7.5 | contentidea-kb |
| 154 | Some devices may experience a problem where microsoft.management.services.int... | This issue is caused by a problem with the WMI service on the Windows device.... | To resolve this problem:  1. Re-register all of the dlls on the Windows devic... | 7.5 | contentidea-kb |
| 155 | This article applies to a very specific enrollment scenario:&nbsp;  Connect t... | The reason you would want to verify that the logged in user is the same user ... | Use the following script to easily verify that the logged on user is the same... | 7.5 | contentidea-kb |
| 156 | THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER ... |  |  | 7.5 | contentidea-kb |
| 157 | From Intune portal when creating a configuration profile for Win10 Devices.De... | This can occur if you are using Windows 10 and update 5005565 has not been ap... | A work around can be achieved via Registry Modification. Open the Registry Ed... | 7.5 | contentidea-kb |
| 158 | When Defender antivirus is in use on your Windows 10/11 devices, you can  use... |  |  | 7.5 | contentidea-kb |
| 159 | Sometimes when Intune admin no longer has access to the intunewin file or the... |  | 1.     Find a test device that is AAD joined and enrolled.           2.     G... | 7.5 | contentidea-kb |
| 160 | When troubleshooting IBM MaaS360 partner compliance integration (or any other... |  |  | 7.5 | contentidea-kb |
| 161 | When Defender antivirus is in use on your Windows 10/11 devices, you can use ... |  |  | 7.5 | contentidea-kb |
| 162 | You can easily control the Microsoft Edge extensions on Windows Devices from ... |  |  | 7.5 | contentidea-kb |
| 163 | There are certain scenarios where the customer needs to bulk unenroll and re-... |  |  | 7.5 | contentidea-kb |
| 164 | Win32 applications not installing and not even being evaluated by the sidecar... | We have found that this is caused by enabling the default ESP which target al... | To prevent this situation, the ESP should only be targeted to devices going t... | 7.5 | contentidea-kb |
| 165 | Customer was trying to use Endpoint detection to check specific value in regi... | Remediation Script was targeting 64 Bit Machines, however customer was adding... | By changing the Script to be running in 64 Bit PowerShell, Script was deploye... | 7.5 | contentidea-kb |
| 166 | This document outlines some of the basic workings of Windows group policy.&nb... |  |  | 7.5 | contentidea-kb |
| 167 | This document outlines some of the basic workings of Windows Update and cover... |  |  | 7.5 | contentidea-kb |
| 168 | You can push &quot;Pulse Secure&quot; VPN&nbsp;App along with its Configurati... |  |  | 7.5 | contentidea-kb |
| 169 | You can push &quot;Pulse Secure&quot; VPN&nbsp;App along with its Configurati... |  |  | 7.5 | contentidea-kb |
| 170 | When deploying a Windows update, such as the Win10 20H2 feature update for ex... | This can occur if Windows Update is disabled on the targeted device. Note tha... | To resolve this problem, remove the policy disabling automatic updates from t... | 7.5 | contentidea-kb |
| 171 | Although the Enrollment Status Page can apply to non-OOBE enrolled devices as... |  |  | 7.5 | contentidea-kb |
| 172 | As per the public documentation&nbsp;Delete mobileAppDependency - Microsoft G... |  | The above graph call is not ready yet, you can use the&nbsp;updateRelationshi... | 7.5 | contentidea-kb |
| 173 | Browser Isolation&nbsp;is a Security Model that aims to protect enterprise ne... |  |  | 7.5 | contentidea-kb |
| 174 | Customers Business Cloud PCs fail to send outbound email messages using port 25 |  | Sending outbound email messages directly on port 25 from a Windows 365  Busin... | 7.5 | contentidea-kb |
| 175 | After deploying a default AppLocker policy from Intune to Windows devices, Po... | For 64-bit PowerShell, it would detect C:\Windows\System32\AppLocker\MDM fold... | As a workaround, we can create an empty folder C:\Windows\SysWOW64\AppLocker\... | 7.5 | contentidea-kb |
| 176 | Failed to install additional input language on Windows 365 Cloud PCs or Intun... | The language pack installation relies on Windows Update service to download i... | Disabling the “Turn off access to all Windows Update features” setting from I... | 7.5 | contentidea-kb |
| 177 | When device is connected to on-premises network. After finished AAD sign on, ... | By comparing procmon trace on the working and failed devices, we can see the ... | To resolve this problem, remove the DefaultDomainName setting from the GPO. | 7.5 | contentidea-kb |
| 178 | Newly deployed Win32 apps fail to install and show &quot;Pending install Stat... | The issue occurs if the Auto logon account is signed in to the device.&nbsp;T... | We can deploy one of the below options to resolve this issue:  1- The Intune ... | 7.5 | contentidea-kb |
| 179 | The Microsoft Store for Business and Microsoft Store for Education will be re... |  |  | 7.5 | contentidea-kb |
| 180 | THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER ... |  |  | 7.5 | contentidea-kb |
| 181 | When configuring a new file type association from Intune by using the custom ... |  |  | 7.5 | contentidea-kb |
| 182 | Co-Managed or Intune managed devices fail to send Endpoint Analytics data to&... | UTC is not able to download and update settings correctly into utc.app.json. ... | In addition to the&nbsp;specific Endpoints required for Intune-managed device... | 7.5 | contentidea-kb |
| 183 | When enrolling a Windows 10/11 devices via Settings - Account -Access work or... | Error&nbsp;code&nbsp;0x80180023&nbsp;translates to&nbsp;MENROLL_E_PROV_UNKNOW... | Following things need to be checked:&nbsp; Capture DeviceManagement-Enterpris... | 7.5 | contentidea-kb |
| 184 | On Windows 10/11, &quot;Enabled Remote Desktop&quot; setting does not turn on... | This is expected, Remote desktop service expects to see these existing inboun... | Note: If the customer really wants to change this to ON mode, they can either... | 7.5 | contentidea-kb |
| 185 | For this Surface Hub VM you need My Workspace Nested Virtualization and initi... |  |  | 7.5 | contentidea-kb |
| 186 | On January 13th, Windows Security and Microsoft Defender for Endpoint custome... |  |  | 7.5 | contentidea-kb |
| 187 | Intune can be used to deploy updates to Windows 10/11 devices by using polici... |  |  | 7.5 | contentidea-kb |
| 188 | If you go&nbsp;here&nbsp;and select a setting catalog policy, when you open t... | Post Intune 2203 release, PG created a template named &quot;Endpoint Detectio... | To work around this, help the customer create a new EDR policy by going here&... | 7.5 | contentidea-kb |
| 189 | When opening an application on a Windows 10 or Windows 11 device, users get t... | This occurs if AppLocker policies from Intune/MDATP/GPO are blocking the appl... | The error may be by design if the administrator intends to block the applicat... | 7.5 | contentidea-kb |
| 190 | Microsoft Store applications on Windows use Windows Package Manager to packag... |  |  | 7.5 | contentidea-kb |
| 191 | Windows 10/11 Custom Compliance policy evaluation returnsState of Error with ... | Script may have failed to execute on the affected Machine.&nbsp;Scenarios cou... | To troubleshoot the issue, it is evident that we first find out the Policy ID... | 7.5 | contentidea-kb |
| 192 | This article describes the troubleshooting steps that can be followed when tr... |  | The new Microsoft store app deployment leverages Windows Package manager fram... | 7.5 | contentidea-kb |
| 193 | The WinGet installer follows the same architecture and flow as the Win32 inst... |  |  | 7.5 | contentidea-kb |
| 194 | There was an initial main requirement for Disabling Screen Snip/ScreenSketch ... | Ideally, the Snipping tool as an .exe can be blocked by the App Blocking poli... | With the AppLocker policy deployment to get the Snipping Tool blocked as well... | 7.5 | contentidea-kb |
| 195 | An EGID, which stands for effective group ID, is a unique identifier assigned... |  |  | 7.5 | contentidea-kb |
| 196 | When installing applications in Windows devices using IntuneManagmentExtensio... | 1. Collect a network trace when IME is processing the app installation, by ru... | Check with the customer if the firewall has the &quot;Allow HTTP partial resp... | 7.5 | contentidea-kb |
| 197 | As customers migrate to the New Microsoft Store and deployments continue to h... |  |  | 7.5 | contentidea-kb |
| 198 | Troubleshooting AppLocker policy deployed from Intune via a custom config.  E... | Check the OMA URI applied is correct or not. Oma URI : ./Vendor/MSFT/AppLocke... | On the Windows 10 Machines that will be assigned the AppLocker policy from In... | 7.5 | contentidea-kb |
| 199 | In multi app kiosk mode with Windows devices using the Chrome or Edge browser... | This is because in kiosk mode the default Windows Attachment Manager restrict... | The related registry is:&nbsp;HKEY_CURRENT_USER\ Software\Microsoft\Windows\C... | 7.5 | contentidea-kb |
| 200 | Devices are missing from the Windows feature update device readiness report p... | This can happen when there is a policy to prevent the device from sending dia... | Make sure there is no GPO or external configuration that is configuring these... | 7.5 | contentidea-kb |
| 201 | Customer has deployed Microsoft 365 Apps to Windows devices. They have notice... | This can happen when the environment’s update channel policy does not match t... | Depending on how the environment is managed the Update channel will determine... | 7.5 | contentidea-kb |
| 202 | Always-On VPN disconnected when the device sync with Intune if you deploy the... | Intune sends a &quot;replace&quot; command for this VPN profile during sync. ... | If the customer needs to configure multiple&lt;route&gt;entries in the custom... | 7.5 | contentidea-kb |
| 203 | This article is intended to provide troubleshooting guidance for UWP applicat... |  |  | 7.5 | contentidea-kb |
| 204 | The software or applications that are preconfigured in Windows to open and ma... | To set the default apps, you can apply Default association configuration from... | How to configure the default email client using Group Policy - Microsoft 365 ... | 7.5 | contentidea-kb |
| 205 | When enabling the 'Always On' setting for Windows AOVPN User Tunnel via Intun... | If a user manually connects to a VPN profile with the&nbsp;“Connect automatic... | The AutoTriggerDisabledProfilesList property is located in HKEY_LOCAL_MACHINE... | 7.5 | contentidea-kb |
| 206 | Users get&nbsp;error (0x80070005) when&nbsp; opening an application with elev... | this can occur if the Elevation rules created in the Intune policy have misma... | 1)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Within the Intune blade, browse to End... | 7.5 | contentidea-kb |
| 207 | Embarking on the Journey of Device Inquiry    &nbsp; Welcome to the realm of ... |  | Currently, the following entities are available for querying. For each entity... | 7.5 | contentidea-kb |
| 208 | Scenario illustrated below when A is installed and detected on the device and... |  |  | 7.5 | contentidea-kb |
| 209 | &quot;Allow RDP redirection of other supported RemoteFX USB devices from this... | Bug in Windows. | A working item is opened; however, it may be possible it will be resolved in ... | 7.5 | contentidea-kb |
| 210 | You receive the following error when running a Device query in the Intune por... | “DisallowCloudnotification” Policy CSP in Microsoft Intune allows configurati... | To resolve this problem, complete the following:  1. Check the status of the ... | 7.5 | contentidea-kb |
| 211 | Troubleshoot AppControl for business policy post managed Installer is enabled... | In contemporary business settings, efficient app deployment and management ar... | This article represents a systematic approach using AppControl for business p... | 7.5 | contentidea-kb |
| 212 | There's currently a known issue in the following Windows Updates released in ... |  |  | 7.5 | contentidea-kb |
| 213 | Win32 application deployed as available, gets stuck in a loop (downloading st... | This can occur if the service principal for resource id '26a4ae64-5862-427f-a... | Using the timestamp, when checking the IME logs, we can observe the following... | 7.5 | contentidea-kb |
| 214 | Learn how&nbsp;to deploy Language pack to managed Windows devices | There are few ways of installing language pack:1. By using Intune - Microsoft... | 1. By using Microsoft Store app (new) Intune Learn To Deploy Windows 10 Langu... | 7.5 | contentidea-kb |
| 215 | This article discusses an unexpected behavior when deploying a device configu... | This has been identified as a bug by the Windows team. Bug 49159436: Device G... | Workaround for Disabling Credential Guard via PowerShell Script:As a temporar... | 7.5 | contentidea-kb |
| 216 | This article discusses an error that appears in the Intune Management Extensi... | Customer was setting the region to Serbian and Montenegro (Former) GeoID 269 ... | When setting the geoid in the script to 271 which is the new identifier for t... | 7.5 | contentidea-kb |
| 217 | Visual studio is installed from a Bootstrapper. In the context of installer, ... |  |  | 7.5 | contentidea-kb |
| 218 | Device Control Policy is not working as expected when multiple Reusable Setti... | The root cause of this issue lies in the application of multiple reusable set... | We have two options to remediate this issue: &nbsp;   Create a reusable setti... | 7.5 | contentidea-kb |
| 219 | With Intune Service Release 2408 and Intune Management Extension (IME) Agent ... |  |  | 7.5 | contentidea-kb |
| 220 | Windows devices are failing to sync with the Intune service, returning error ... | Root cause may be related to several factors but is often not possible to det... | MSINTERNAL ONLY - do not blog or publish: The Intune and Windows MDM client t... | 7.5 | contentidea-kb |
| 221 | Getting an error for the policy setting &quot;Assigned Access Configuration&q... | When the policy is configured with Kiosk mode as &quot;Single app, full-scree... | When the User logon type was changed to Auto Logon, the policy is in succeede... | 7.5 | contentidea-kb |
| 222 | This article will explain a solution provided for a Support Case Where custom... | Application doesn't have enough time to be installed. | By checking Intune Management Extension Logs (which is replaced now by App Wo... | 7.5 | contentidea-kb |
| 223 | After the introduction of the new Google Play Android Management API (Support... | Looking at the logs we don't see any errors or apparent cause of the issue. F... | I would highly recommend jumping into a call with the customer to verify that... | 7.5 | contentidea-kb |
| 224 | Deploying Visual Studio via Intune can be challenging. Many users struggle wi... |  |  | 7.5 | contentidea-kb |
| 225 | Introduction The &quot;Properties Catalog&quot; is a recently introduced feat... |  | How to Create a Device Inventory Policy Create a Device Configuration Profile... | 7.5 | contentidea-kb |
| 226 | Summary:&nbsp;This document provides guidance on troubleshooting GPO based Wi... | Prerequisites are not met&nbsp; | Intune: Unable to Enroll Device in Intune using GPO Enrollment Method &nbsp; ... | 7.5 | contentidea-kb |
| 227 | Winget logs location path depends on the call trigger (Command line) or Intun... |  |  | 7.5 | contentidea-kb |
| 228 | When deploying a Win32 App to a device, you encounter the following error:  T... | The install command has been wrongly written  In this exemple, it should be m... | Change the install command to have the right configuration | 7.5 | contentidea-kb |
| 229 | This Article will guide you how to troubleshoot the &quot;Run Remediation&quo... |  |  | 7.5 | contentidea-kb |
| 230 | Getting an error &quot;Your domain isn't available to sign in&quot; while sig... | When a device is connected to a public network, VPN connectivity is essential... | Assessing Customer's VPN Client Configuration &nbsp; VPN Application and Supp... | 7.5 | contentidea-kb |
| 231 | On most occasions, customers will open a case directly with the Intune team w... |  |  | 7.5 | contentidea-kb |
| 232 | This article describes the processes to troubleshoot Windows Custom Complianc... |  |  | 7.5 | contentidea-kb |
| 233 | Create a Visual Studio 2022 win32 app with source files and script &nbsp; The... |  |  | 7.5 | contentidea-kb |
| 234 | Obtain the Appx PackageThe file can be downloaded from:&nbsp;https://www.micr... |  |  | 7.5 | contentidea-kb |
| 235 | Despite being a &quot;Personal&quot; Windows device in Intune admin center, C... | This is by design.  This registry cannot be used to distinguish &quot;Ownersh... | Should use ownerType of manageddevice Graph API. managedDevice resource type ... | 7.5 | contentidea-kb |
| 236 | When deploying firewall rules through Intune, policies may fail silently or d... | If a rule includes either remote or local port ranges, the Protocol field mus... | Device-Side Investigation (Before Adding Protocol Field) MDM Diagnostic Repor... | 7.5 | contentidea-kb |
| 237 | The problem arose when some Win32 application installations were marked as 'F... | IME design | To address the issue with the inconsistent installation status of Win32 appli... | 7.5 | contentidea-kb |
| 238 | On Windows 11 24H2 devices configured in Kiosk Single App mode, users are enc... | Post installing the June updates (KB5060842 or KB5063060). The error appears ... | Tried the resolution mentioned in the article below, but unfortunately, it di... | 7.5 | contentidea-kb |
| 239 | On Intune managed corporate owned Windows devices, an application which was i... | Step 1: Assuming that the device is healthy and regularly syncing with Intune... | 1) If there are no stale entries of the application present on the device (as... | 7.5 | contentidea-kb |
| 240 | Observing reporting latency in the Windows 10 and later feature updates repor... | Some reporting latency is expected, with data generally becoming available in... | Validate Device Readiness &nbsp; For a comprehensive checklist, please refer ... | 7.5 | contentidea-kb |
| 241 | A discrepancy is observed between the application version displayed in the&nb... | This is&nbsp;by design. Intune and the Company Portal display the version inf... | Set Customer Expectations Clarify this is by design,&nbsp;Intune and the Comp... | 7.5 | contentidea-kb |
| 242 | A customer reported that their remediation script in Microsoft Intune execute... | Upon reviewing the source code and logs, it was determined that the Intune ma... | A documentation update request has been filed with the product team to correc... | 7.5 | contentidea-kb |
| 243 | Issue failing to start services for .NET-based applications such as IME (Intu... | This issue might occur if the C:\Windows\Microsoft.NET\Framework64\v4.0.30319... | Copy the Machine.config file from a working machine, and then paste the file ... | 7.5 | contentidea-kb |
| 244 | How to Block PowerShell from Intune end on windows devices. How to create App... |  |  | 7.5 | contentidea-kb |
| 245 | Intune now serving as the primary endpoint management solution, we encounter ... |  |  | 7.5 | contentidea-kb |
| 246 | Scenario: Upon ingesting VS Code ADMX from Documentation for Visual Studio Co... | As mentioned in vscode.admx does not work with InTune · Issue #281840 · micro... | A feature request is already added to our backlog (mentioned in the same GitH... | 7.5 | contentidea-kb |
| 247 | On an AppControl/WDAC enabled device you might observe that Intune deployed s... | When AppControl is active and is enforcing scripts (Option 11 is not set) Pow... | The obvious resolution is to not enfoced scripts by adding the option 11  Set... | 7.5 | contentidea-kb |
| 248 | This is a general troubleshooting guide for Windows Device Configuration.  Tr... |  |  | 7.5 | contentidea-kb |
| 249 | When a Win32 app that has dependencies is installed on a device, the&nbsp;Uni... |  |  | 7.5 | contentidea-kb |
| 250 | Error AADSTS50011 'The reply url specified in the request does not match the ... | Default redirect URI for the application registration or PowerShell script ha... | For PowerShell: set redirectUri to 'urn:ietf:wg:oauth:2.0:oob'. For custom ap... | 6.5 | mslearn |
| 251 | After deploying the PowerShell script to a user or device group, the Intune M... | This occurs because the Intune Management Extension is a type of MobileMsi, a... | Switch the SCCM Client apps Co-Management workload to Intune or Intune pilot,... | 4.5 | contentidea-kb |
| 252 | Unable to turn Defender Realtime Protection on Realtime protection is grayed/... | If the user is unable to turn Defender settings on, this would not be caused ... | Check Registry Entries See KB 4493748 Check System Corruption run sfc /scanno... | 4.5 | contentidea-kb |
| 253 | The purpose of this article is to provide a Kusto Query that can be used when... |  |  | 4.5 | contentidea-kb |
| 254 | We can uninstall pre-installed windows store app via Intune, details as below... |  |  | 3.0 | contentidea-kb |
| 255 | 1. Confirm with customer if device is AAD joined and auto enrolled into Intun... |  |  | 3.0 | contentidea-kb |
| 256 | Step 1. Download and install Android Wrapper tool: Go to the below github lin... |  |  | 3.0 | contentidea-kb |
| 257 | Customer has developed a Powershell script, tested it running in the Windows ... | Update: Intune now supports pushing PowerShell scripts to run in 64bits, as s... | Although everything is working as designed, a work around for this issue is t... | 3.0 | contentidea-kb |
| 258 | Summary: 1. We can check if MSI job has been created in Registry a. For devic... |  |  | 3.0 | contentidea-kb |
| 259 | The Windows 10 Desktop application, “AirServer”, is not synchronizing from th... | The Windows 10 Desktop application, “AirServer” uses an encrypted format (EAp... | This is expected behavior. An alternate solution is to deploy the app using t... | 3.0 | contentidea-kb |
| 260 | After deploying apps to a Surface Hub device, some apps show a status of “Not... | This is by design. | Surface Hub only supports installing Universal Windows Platform (UWP) apps, a... | 3.0 | contentidea-kb |
| 261 | Backup actions Administrative Templates (Device Configurations) Administrativ... |  |  | 3.0 | contentidea-kb |
| 262 | Intune UI reports the following error: App installation failed. Error code: E... | Script was encoded on UTF-16BE, even it is supported by PowerShell it is not ... | Edit the script content to be UTF-8 Updated the app profile with the new-enco... | 3.0 | contentidea-kb |
| 263 | When trying to enrol a Windows 10 hybrid Azure AD joined machine to Intune th... | The dmwappushservice service was missing from the device, it had been deleted... | To resolve this issue, we need to add dmwappushservice service back to the co... | 3.0 | contentidea-kb |
| 264 | This article describes how to trace calls from Power BI or PowerShell to the ... |  |  | 3.0 | contentidea-kb |
| 265 | Overview SideCar is the internal name for the Intune Management Extension (IM... |  |  | 3.0 | contentidea-kb |
| 266 | What does this guide do? The purpose of this guide is help administrators und... |  |  | 3.0 | contentidea-kb |
