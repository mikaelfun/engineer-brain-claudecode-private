# INTUNE Office / M365 应用部署 — 已知问题详情

**条目数**: 36 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: M365 Apps (Office 365 ProPlus) deployed as Available shows status 'unexpected' on Company Portal even though the app is installed or the installati...
**Solution**: Backup and remove registry key HKLM\SOFTWARE\Microsoft\OfficeCSP\{INSTALLATION_ID} to reset status, then restart the device. Reference IcM Incident-309323705.
`[Source: onenote, Score: 9.5]`

### Step 2: Office C2R 安装失败，CSP Status 1603，C2R 日志显示 ShowPrereqFailureDialog: 'We can't install'，要求先卸载已有的 MSI-based Office（2016/2019/2021 LTSC）
**Solution**: 1. 卸载设备上已有的 MSI-based Office；或在 Intune Office 部署策略中启用 Remove other versions（配置 XML 中添加 <RemoveMSI />）；2. 确认卸载完成后重新触发部署
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Office C2R 部署失败，尝试在 64-bit 安装上覆盖 32-bit（或反向），出现架构不匹配错误
**Solution**: 1. 在配置 XML 中添加 MigrateArch="TRUE" 允许就地架构迁移；或先卸载已有架构版本再部署
`[Source: ado-wiki, Score: 9.0]`

### Step 4: ODT 下载超时，CSP Status 1460 (ERROR_TIMEOUT)，Office 部署未启动
**Solution**: 1. 确认设备可访问 officecdn.microsoft.com:443；2. 检查代理或防火墙是否阻断该域名；3. 排除 SSL 拦截问题后重试部署
`[Source: ado-wiki, Score: 9.0]`

### Step 5: ODT 签名验证失败，CSP Status 13 (ERROR_INVALID_DATA) 或 CertVerifyCertificateChainPolicy 错误
**Solution**: 1. 检查是否有 SSL inspection 设备拦截 officecdn.microsoft.com 流量；2. 验证中间证书链完整性；3. 排除代理干扰后重试
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Office C2R 安装阶段 0x80070020 (Sharing Violation) 错误，文件被锁定
**Solution**: 1. 关闭所有 Office 应用程序（Word/Excel/PowerPoint/Outlook 等）；2. 检查 Task Manager 确认无残留 Office 进程；3. 重新触发部署
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Get-WindowsAutopilotInfo -Online 命令失败，报 Redirect URI 错误或 URL 截断错误，因 MS Graph Command Line Tools Enterprise App 中 delegated scopes 过多导致登录 URL 超过 208...
**Solution**: 1. 运行 Get-MgContext | Select -ExpandProperty scopes 确认 scope 数量；2. 删除 MS Graph Command Line Tools 中不必要的 scopes；或 3. 创建新的 Enterprise App，仅添加所需 scopes（DeviceManagementServiceConfig.ReadWrite.All, DeviceManagementManagedDevices.ReadWrite.All, Device.ReadWrite.All, Group.ReadWrite.All, GroupMember.ReadWrite.All），使用 -AppId 和 -AppSecret 参数调用脚本
`[Source: ado-wiki, Score: 9.0]`

### Step 8: Autopilot v1 DeviceSetup 阶段超时，UDiag 显示 ServerHasNOTFinishedProvisioning，设备在 Autopilot 期间执行了 Windows Edition 升级（如 Professional → Enterprise）
**Solution**: 1. 不要在 Autopilot 期间执行 OS Edition Upgrade；2. 可考虑将 Edition Upgrade 分配给 Users 并设置 SkipUserESP；3. 确保该策略未设为 Required（即使非 ESP-blocking，Required 的策略仍可能在 AP 期间安装）
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | M365 Apps (Office 365 ProPlus) deployed as Available shows status 'unexpected... | Stale or incorrect installation state stored in registry HKLM\SOFTWARE\Micros... | Backup and remove registry key HKLM\SOFTWARE\Microsoft\OfficeCSP\{INSTALLATIO... | 9.5 | onenote |
| 2 | Office C2R 安装失败，CSP Status 1603，C2R 日志显示 ShowPrereqFailureDialog: 'We can't i... | 设备上存在 MSI 安装的 Office 版本，C2R 与 MSI Office 不能共存，导致 Stage 2 硬阻断 | 1. 卸载设备上已有的 MSI-based Office；或在 Intune Office 部署策略中启用 Remove other versions（配... | 9.0 | ado-wiki |
| 3 | Office C2R 部署失败，尝试在 64-bit 安装上覆盖 32-bit（或反向），出现架构不匹配错误 | 目标设备已有不同架构的 Office 安装，未配置 MigrateArch 导致 Stage 2 硬阻断 | 1. 在配置 XML 中添加 MigrateArch="TRUE" 允许就地架构迁移；或先卸载已有架构版本再部署 | 9.0 | ado-wiki |
| 4 | ODT 下载超时，CSP Status 1460 (ERROR_TIMEOUT)，Office 部署未启动 | 设备无法从 officecdn.microsoft.com 下载 Office Deployment Tool，网络连接问题（防火墙、代理阻断） | 1. 确认设备可访问 officecdn.microsoft.com:443；2. 检查代理或防火墙是否阻断该域名；3. 排除 SSL 拦截问题后重试部署 | 9.0 | ado-wiki |
| 5 | ODT 签名验证失败，CSP Status 13 (ERROR_INVALID_DATA) 或 CertVerifyCertificateChainPol... | ODT 下载过程被 SSL 拦截/代理修改，导致签名校验不通过；或中间证书过期 | 1. 检查是否有 SSL inspection 设备拦截 officecdn.microsoft.com 流量；2. 验证中间证书链完整性；3. 排除代理... | 9.0 | ado-wiki |
| 6 | Office C2R 安装阶段 0x80070020 (Sharing Violation) 错误，文件被锁定 | 安装期间有 Office 应用程序正在运行，文件被占用 | 1. 关闭所有 Office 应用程序（Word/Excel/PowerPoint/Outlook 等）；2. 检查 Task Manager 确认无残留... | 9.0 | ado-wiki |
| 7 | Get-WindowsAutopilotInfo -Online 命令失败，报 Redirect URI 错误或 URL 截断错误，因 MS Graph ... | MS Graph SDK 认证时会包含所有 delegated scopes（非仅请求的 scopes），导致认证 URL 过长被截断，Redirect ... | 1. 运行 Get-MgContext / Select -ExpandProperty scopes 确认 scope 数量；2. 删除 MS Grap... | 9.0 | ado-wiki |
| 8 | Autopilot v1 DeviceSetup 阶段超时，UDiag 显示 ServerHasNOTFinishedProvisioning，设备在 A... | Autopilot 期间执行 OS Edition 升级（通过 Edition Upgrade 策略）导致 SKU 切换，Autopilot 丢失对已安装... | 1. 不要在 Autopilot 期间执行 OS Edition Upgrade；2. 可考虑将 Edition Upgrade 分配给 Users 并设... | 9.0 | ado-wiki |
| 9 | Autopilot v1 期间应用不安装、报错或超时，发现 MSI（LOB app）与 Win32 应用混合部署 | APv1 不支持 LOB（MSI）与 Win32 应用混合部署，只有 APv2（Autopilot Device Preparation）才支持同时使用两者 | 在 APv1 环境中，将所有应用统一为 Win32 格式（使用 IntuneWinAppUtil 将 MSI 包装为 .intunewin），或升级到 A... | 9.0 | ado-wiki |
| 10 | Autopilot 期间 Microsoft 365 App（Office）安装超时或失败，导致 ESP 阻塞和整体 AP 失败 | 已知回归问题：Bing Search 已被 Office C2R bootstrapper 弃用不再安装，但如果策略中将 Bing Search 设为 e... | 1. 短期：将 Bing Search 设置为 Yes（实际不会安装，只需配置为 Yes）；2. 如果除 Office 外还有其他应用在 AP 期间安装，... | 9.0 | ado-wiki |
| 11 | Get-WindowsAutopilotInfo -Online fails with redirect URI error when MS Graph ... | MS Graph SDK includes all delegated scopes in the authentication URL, not jus... | Remove unnecessary scopes from MS Graph Command Line Tools enterprise app, OR... | 9.0 | ado-wiki |
| 12 | Microsoft 365 Apps (Office) times out during Autopilot (APv1 or APv2) when se... | Bing Search was deprecated and no longer installed by Office C2R bootstrapper... | Short-term: set Bing Search to Yes in Office app config (it will not install ... | 9.0 | ado-wiki |
| 13 | Autopilot ESP times out during app installation with large apps like Office 3... | Default ESP timeout 60 min insufficient for multiple large required apps | Increase ESP timeout to 90-120 min. Limit required apps to essentials. Deploy... | 9.0 | ado-wiki |
| 14 | Office C2R 安装失败，HRESULT 0x80070bc9 (Servicing Store Corruption) | Windows Servicing Store 损坏，导致 Office C2R 无法正确注册或安装组件 | 1. 运行 DISM /Online /Cleanup-Image /RestoreHealth 修复 Servicing Store；2. 运行 sfc... | 9.0 | ado-wiki |
| 15 | Office C2R 部署失败，CSP Status 17006，安装被正在运行的 Office 应用阻止 | Office 应用程序（Word、Excel、Outlook 等）在安装过程中处于打开状态，C2R 无法替换正在使用的文件 | 1. 通知用户关闭所有 Office 应用程序后重试；2. 对于 Required 部署，考虑设置维护窗口或使用 /forceappshutdown 参数... | 9.0 | ado-wiki |
| 16 | Office C2R 部署失败，CSP Status 17002，可能原因包括用户取消、其他安装正在运行、磁盘空间不足或未知语言 | C2R Client 无法完成场景执行，常见触发条件：(1) 用户取消安装；(2) 另一个 Office 安装/更新场景正在进行；(3) 目标磁盘空间不足... | 1. 检查 C2R 日志中的具体失败原因；2. 磁盘空间：确保系统盘有足够空间（建议 >10GB）；3. 并发安装：等待当前场景完成或重启 ClickTo... | 8.0 | ado-wiki |
| 17 | Office C2R 部署 CSP Status 卡在 997 (IO_PENDING) 超过 24 小时，安装无进展 | ClickToRun 服务挂起或下载阶段卡住，可能由网络问题、DO 配置或服务崩溃导致 | 1. 检查 ClickToRunSvc 服务状态是否运行；2. 查看 C2R 日志最后活动时间和阶段；3. 重启 ClickToRunSvc 服务；4. ... | 8.0 | ado-wiki |
| 18 | When trying to upload/update a new APP (APK) in Intune, the customer is prese... | Late in 2016 (Oct) there was a change made to require Admins to be licensed I... | To fix this issue:    Go to portal.office.com  Go to the Users tab  Provide E... | 7.5 | contentidea-kb |
| 19 | Customer has MAM policies applied to all Office mobile apps including OneDriv... | This can occur is the user is signed in to the Office mobile apps (Word, Exce... | To avoid this error, once users enroll their device in Intune they need to lo... | 7.5 | contentidea-kb |
| 20 | Error during sign in to Company Portal - &quot;Could not sign in. You will ne... | The Intune Company Portal app only supports Forms Based Authentication | This error is occurring because the ADFS server is asking for a certificate-b... | 7.5 | contentidea-kb |
| 21 | Intune print policy is not being enforced when previewing Office documents in... | OneDrive's Intune SDK implementation has a known bug. This affects the OneDri... | OneDrive will be releasing an updated version of the app to resolve this issu... | 7.5 | contentidea-kb |
| 22 | Important re-branding noticeOffice 365 ProPlus is being renamed to&nbsp;Micro... | This is believed to be related to some code in Windows 1803 that is not ackno... | Only known resolution is to either use Windows 1809 or remove the option to r... | 7.5 | contentidea-kb |
| 23 | With the 1902 release of O365, Teams is now included as part of the O365 Clic... |  |  | 7.5 | contentidea-kb |
| 24 | The Office Hub app is now generally available.&nbsp; Applying App Protection ... |  |  | 7.5 | contentidea-kb |
| 25 | The following timeout error appears in the Endpoint Manager Portal when an ad... | &nbsp;This issue can occur if the&nbsp;Microsoft Windows Autopilot Service AP... | In order now to fix this issue:1. Go to https://Portal.azure.com&nbsp;2. Navi... | 7.5 | contentidea-kb |
| 26 | Welcome to BlackBerry UEM integration with Intune’s App protection policies. ... | What is BlackBerry UEM Integration: A quick overview of what BlackBerry UEM I... | How it’s Configured: A step-by-step guide for configuring the integration wit... | 7.5 | contentidea-kb |
| 27 | Hybrid AD Autopilot with VPN is an additional feature with Hybrid AD Autopilo... |  |  | 7.5 | contentidea-kb |
| 28 | After adding Office apps (like PowerBI Desktop) to protected apps, you are st... | When doing a data import in PowerBI, multiple processes are involved. Simply ... | To resolve this problem, you will need to create a AppLocker file that includ... | 7.5 | contentidea-kb |
| 29 | Customer is using an app called iManage on iOS, and the app is configured as ... | The customer worked with their iManage vendor and determined that they needed... | The customer added the following values to their App Config profile for iMana... | 7.5 | contentidea-kb |
| 30 | DISCLAIMER: All data and screenshots below are samples from an Internal Demo ... |  |  | 7.5 | contentidea-kb |
| 31 | Autopilot (pre-provisioning or Self-Deploying) mode failed with TPM attestati... | TPM manufacturer &quot;STM&quot; did not properly follow the TCG spec for add... | For mitigation&nbsp;the customer can either use an older OS version than 24H2... | 7.5 | contentidea-kb |
| 32 | The customer encounters a misconfiguration error when attempting to enroll si... | The Intune app log indicates a generic navigation file error caused by a Java... | To resolve this, remount /tmp without the noexec option: &nbsp; Temporary Sol... | 7.5 | contentidea-kb |
| 33 | Step 1: Prepare the Office Deployment Tool (ODT) and Offline Package 1. Downl... |  |  | 7.5 | contentidea-kb |
| 34 | When deploying M365 app bundle from Intune, Office apps install on the device... | The way that M365 apps report back to Intune once the package has been deploy... | For the above case, configuring to &quot;Yes&quot; the setting &quot;Install ... | 7.5 | contentidea-kb |
| 35 | With the 1902 release of O365, Teams is now included as part of the O365 Clic... |  |  | 4.5 | contentidea-kb |
| 36 | Important re-branding notice Office 365 ProPlus is being renamed to Microsoft... | This is believed to be related to some code in Windows 1803 that is not ackno... | Only known resolution is to either use Windows 1809 or remove the option to r... | 3.0 | contentidea-kb |
