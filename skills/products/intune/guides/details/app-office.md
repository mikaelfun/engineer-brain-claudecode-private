# Intune Office / M365 应用部署 — 综合排查指南

**条目数**: 39 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-Office-C2R-Deployment.md, onenote-m365-office-proplus-deployment-tsg.md, onenote-office365-proplus-deployment-tsg.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (3 条)

- **solution_conflict** (high): intune-ado-wiki-116 vs intune-contentidea-kb-408 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-124 vs intune-contentidea-kb-329 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-contentidea-kb-329 vs intune-mslearn-066 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Office C2R Deployment
> 来源: ADO Wiki — [ado-wiki-Office-C2R-Deployment.md](../drafts/ado-wiki-Office-C2R-Deployment.md)

**Microsoft 365 / Office C2R Deployment Troubleshooting Guide**
**Architecture Overview**
- **Office CSP** - MDM interface at `./Device/Vendor/MSFT/Office/Installation/{id}/install`
- **Office Deployment Tool (ODT)** - Bootstrapper (`setup.exe`) that reads configuration XML
- **OfficeClickToRun service** - Persistent service managing C2R virtualization
- **Delivery Optimization (DO)** - Primary transport for downloading Office payloads
- **BITS** - Fallback download transport

**Deployment Scenarios (search `Set executing scenario to` in logs)**

**Intune Deployment Flow**
1. Device syncs with Intune, receives Office CSP policy via SyncML
2. Device downloads ODT from `officecdn.microsoft.com`
3. Two directories appear: `C:\Program Files\Microsoft Office` and `Microsoft Office 15`
4. Required = auto silent install; Available = Company Portal manual trigger
5. Downloaded files cleaned up after success

**Prerequisites**
- Windows 10 1703+
- No MSI-based Office (or enable Remove MSI)
- No Office apps open during installation
- Only one M365 deployment per device
- For Autopilot ESP: deploy M365 Apps as Win32 app (not Microsoft 365 Apps type)

**Verbose Logging**
```
```

**Log File Locations**

**ODC ZIP Relevant Paths**
- `Intune\Files\MSI Logs\` - C2R verbose logs
- `Intune\RegistryKeys\` - OfficeCSP registry
- `Intune\Commands\General\` - DO log

**5-Stage Deployment Pipeline**

**CSP Status Codes**

**Error Code Reference**

**Channel GUID Reference**

**Step-by-Step Triage Workflow**
1. Collect logs (ODC ZIP or manual: C2R verbose + OfficeCSP registry + DO log)
2. Check OfficeCSP status code (0=Success, 70=Failed)
... (详见原始草稿)

### Phase 2: M365 Office Proplus Deployment Tsg
> 来源: OneNote — [onenote-m365-office-proplus-deployment-tsg.md](../drafts/onenote-m365-office-proplus-deployment-tsg.md)

**Intune M365 (Office 365 ProPlus) Deployment Troubleshooting**
**Step 1: Confirm Policy Applied via Kusto**
```kql
```
**Step 2: Verify ODT File on Client**
- Location: `C:\Windows\Temp`
- If app set as "Available": expect 2 ODT files (odtxxx.exe + odtxxx.temp with 0 bytes)

**Step 3: Manual ODT Install Test**
1. Enable Office verbose logging:
   ```cmd
   ```
2. Download latest ODT: https://www.microsoft.com/en-us/download/details.aspx?id=49117
3. Customize configuration.xml with local Source path
4. Download offline package: `setup.exe /download configuration.xml`
5. Install: `setup.exe /configure configuration.xml`

**Step 4: Collect Logs**
```cmd
```

**Tip: Company Portal Status Stuck**
- Status read from: `HKLM\SOFTWARE\Microsoft\OfficeCSP\{INSTALLATION_ID}`
- Fix: backup registry key -> remove it -> restart device (status changes from "install" to "not install")

### Phase 3: Office365 Proplus Deployment Tsg
> 来源: OneNote — [onenote-office365-proplus-deployment-tsg.md](../drafts/onenote-office365-proplus-deployment-tsg.md)

**Office 365 ProPlus Deployment Troubleshooting via Intune**
**Step 1: Verify Policy Delivery (Kusto)**
```kusto
```
**Step 2: Check ODT Files on Client**
- `odtXXXX.exe`
- `odtXXXX.temp` (0 bytes)

**Step 3: Manual ODT Installation Test**
1. Enable verbose logging:
   ```
   ```
   ```
   ```
2. Download latest ODT from [Microsoft](https://www.microsoft.com/en-us/download/details.aspx?id=49117)
3. Customize `configuration.xml` with local source path if needed
4. Download offline package, then install

**Step 4: Log Collection**

**ODT Customization**

**Escalation**

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Android users cannot access SharePoint Online or Exchange Online via browser after Intune device-... | On Android, browser-based Conditional Access requires the Enable Browser Acce... | Android Chrome: (1) Open Company Portal > triple-dot menu > Settings > Enable Browser Access; (2)... | 🟢 9.0 | OneNote |
| 2 | M365 Apps (Office 365 ProPlus) deployed as Available shows status 'unexpected' on Company Portal ... | Stale or incorrect installation state stored in registry HKLM\SOFTWARE\Micros... | Backup and remove registry key HKLM\SOFTWARE\Microsoft\OfficeCSP\{INSTALLATION_ID} to reset statu... | 🟢 9.0 | OneNote |
| 3 | Office C2R 安装失败，CSP Status 1603，C2R 日志显示 ShowPrereqFailureDialog: 'We can't install'，要求先卸载已有的 MSI... | 设备上存在 MSI 安装的 Office 版本，C2R 与 MSI Office 不能共存，导致 Stage 2 硬阻断 | 1. 卸载设备上已有的 MSI-based Office；或在 Intune Office 部署策略中启用 Remove other versions（配置 XML 中添加 <RemoveMSI... | 🟢 8.5 | ADO Wiki |
| 4 | Office C2R 部署失败，尝试在 64-bit 安装上覆盖 32-bit（或反向），出现架构不匹配错误 | 目标设备已有不同架构的 Office 安装，未配置 MigrateArch 导致 Stage 2 硬阻断 | 1. 在配置 XML 中添加 MigrateArch="TRUE" 允许就地架构迁移；或先卸载已有架构版本再部署 | 🟢 8.5 | ADO Wiki |
| 5 | ODT 下载超时，CSP Status 1460 (ERROR_TIMEOUT)，Office 部署未启动 | 设备无法从 officecdn.microsoft.com 下载 Office Deployment Tool，网络连接问题（防火墙、代理阻断） | 1. 确认设备可访问 officecdn.microsoft.com:443；2. 检查代理或防火墙是否阻断该域名；3. 排除 SSL 拦截问题后重试部署 | 🟢 8.5 | ADO Wiki |
| 6 | ODT 签名验证失败，CSP Status 13 (ERROR_INVALID_DATA) 或 CertVerifyCertificateChainPolicy 错误 | ODT 下载过程被 SSL 拦截/代理修改，导致签名校验不通过；或中间证书过期 | 1. 检查是否有 SSL inspection 设备拦截 officecdn.microsoft.com 流量；2. 验证中间证书链完整性；3. 排除代理干扰后重试 | 🟢 8.5 | ADO Wiki |
| 7 | Office C2R 安装阶段 0x80070020 (Sharing Violation) 错误，文件被锁定 | 安装期间有 Office 应用程序正在运行，文件被占用 | 1. 关闭所有 Office 应用程序（Word/Excel/PowerPoint/Outlook 等）；2. 检查 Task Manager 确认无残留 Office 进程；3. 重新触发部署 | 🟢 8.5 | ADO Wiki |
| 8 | Microsoft 365 Apps (Office) times out during Autopilot (APv1 or APv2) when set as ESP-blocking ap... | Bing Search was deprecated and no longer installed by Office C2R bootstrapper... | Short-term: set Bing Search to Yes in Office app config (it will not install regardless). Long-te... | 🟢 8.5 | ADO Wiki |
| 9 | Microsoft 365 Apps (Office) times out during Autopilot (APv1 or APv2) when set as ESP-blocking ap... | Bing Search was deprecated and no longer installed by Office C2R bootstrapper... | Short-term: set Bing Search to Yes in Office app config (it will not install regardless). Long-te... | 🟢 8.5 | ADO Wiki |
| 10 | Autopilot ESP times out during app installation with large apps like Office 365 (1.8GB+) | Default ESP timeout 60 min insufficient for multiple large required apps | Increase ESP timeout to 90-120 min. Limit required apps to essentials. Deploy non-essential apps ... | 🟢 8.5 | ADO Wiki |
| 11 | Enrolled Android device prompts No certificates found and cannot access O365 resources via browser | Browser Access option not enabled in Company Portal app settings, preventing ... | Open Company Portal > Settings > tap Enable Browser Access. In Chrome sign out of Office 365 and ... | 🟢 8.5 | ADO Wiki |
| 12 | Office C2R 安装失败，HRESULT 0x80070bc9 (Servicing Store Corruption) | Windows Servicing Store 损坏，导致 Office C2R 无法正确注册或安装组件 | 1. 运行 DISM /Online /Cleanup-Image /RestoreHealth 修复 Servicing Store；2. 运行 sfc /scannow 验证系统文件完整性；... | 🟢 8.5 | ADO Wiki |
| 13 | Office C2R 部署失败，CSP Status 17006，安装被正在运行的 Office 应用阻止 | Office 应用程序（Word、Excel、Outlook 等）在安装过程中处于打开状态，C2R 无法替换正在使用的文件 | 1. 通知用户关闭所有 Office 应用程序后重试；2. 对于 Required 部署，考虑设置维护窗口或使用 /forceappshutdown 参数；3. 检查是否有后台 Office 进... | 🟢 8.5 | ADO Wiki |
| 14 | Office C2R 部署失败，CSP Status 17002，可能原因包括用户取消、其他安装正在运行、磁盘空间不足或未知语言 | C2R Client 无法完成场景执行，常见触发条件：(1) 用户取消安装；(2) 另一个 Office 安装/更新场景正在进行；(3) 目标磁盘空间不足... | 1. 检查 C2R 日志中的具体失败原因；2. 磁盘空间：确保系统盘有足够空间（建议 >10GB）；3. 并发安装：等待当前场景完成或重启 ClickToRunSvc；4. 语言问题：检查 Of... | 🔵 7.5 | ADO Wiki |
| 15 | Office C2R 部署 CSP Status 卡在 997 (IO_PENDING) 超过 24 小时，安装无进展 | ClickToRun 服务挂起或下载阶段卡住，可能由网络问题、DO 配置或服务崩溃导致 | 1. 检查 ClickToRunSvc 服务状态是否运行；2. 查看 C2R 日志最后活动时间和阶段；3. 重启 ClickToRunSvc 服务；4. 如果反复卡住，检查 DO 下载模式和网络... | 🔵 7.5 | ADO Wiki |
| 16 | Microsoft 365 apps for macOS close without notification and restart unexpectedly (e.g., Teams clo... | Multiple deployments of Microsoft 365 apps assigned as Required to the device... | 1) If multiple Required deployments: assign only one deployment. 2) If M365 suite assigned as Req... | 🔵 7.5 | MS Learn |
| 17 | Microsoft 365 apps on macOS close without notification, update, and restart unexpectedly (no MAU ... | Multiple configuration profiles managing Microsoft AutoUpdate (MAU) settings ... | Deploy only one configuration profile for MAU settings. Include only MAU settings that apply to a... | 🔵 7.5 | MS Learn |
| 18 | Enrollment fails: Looks like the MDM Terms of Use endpoint is not correctly configured. Error con... | User lacks valid Intune or Office 365 license, or MDM terms of use URL in Ent... | Assign valid Intune/M365 license to user. In Azure portal > Entra ID > Mobility (MDM and MAM) > M... | 🔵 7.5 | MS Learn |
| 19 | Unable to Enroll DEP Devices When Prompting for User Affinity. After entering username and passwo... | Two known causes: (1) MFA is enabled — MFA is not supported for DEP during en... | 1. Disable MFA until after enrollment is complete. 2. If using PingFederate, upgrade to PingFeder... | 🔵 7.0 | ContentIdea KB |
| 20 | When attempting to assign a license (Enterprise Mobility + Security / Intune / Office 365) to a u... | This can occur if the Usage location setting within the users profile is not ... | To resolve this problem, set the Usage location property in the users profile: 1. Go to https://p... | 🔵 7.0 | ContentIdea KB |
| 21 | Unable to sign-in to Office applications on Apple devices | Office 365 OneDrive and OneNote apps for iOS and Android updated to use new a... | Use customer facing KB 3015526. If unresolved, consult CSS Intune Escalations. | 🔵 7.0 | ContentIdea KB |
| 22 | When trying to edit, save, or delete existing MDM security policies in O365, you receive errors: ... | The Office 365 portal is trying to modify a policy, and either the logged-on ... | Workaround 1: Ensure logged-on account is a local Global Administrator with Compliance Administra... | 🔵 7.0 | ContentIdea KB |
| 23 | updates.log shows Agent sync failed, error = 0x80CF000E. WARNING: Updates client failed Searching... | MDM authority is not set to Intune/SCCM. Agents may not be allowed to sync if... | If authority is set to Office and customer has an Intune subscription then see this article to en... | 🔵 7.0 | ContentIdea KB |
| 24 | Customer needs to know if there is a RSS Feed for Intune and how to configure it for monitoring h... | Advisory | There was only one place for Intune to configure an RSS feed, via the Office 365 Service Health D... | 🔵 7.0 | ContentIdea KB |
| 25 | When trying to create an Intune subscription with System Center Configuration Manager (1702) the ... | Customer was using an on-premise AD account with ADFS | Create a cloud account with an Intune license and Global Administrator privileges and use it to l... | 🔵 7.0 | ContentIdea KB |
| 26 | It admin has replaced the Apple APN certificate instead of renewing and end users are unable to r... | The Apple APN certificate needs to be renewed yearly | First option with the new certificate in place is to have the users do the following:    Open the... | 🔵 7.0 | ContentIdea KB |
| 27 | THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER TO THE INTUNE CSS WI... | *********************************** **** ************************************... | Steps below to be completed by Flighting team members Note: The steps below are to be completed b... | 🔵 7.0 | ContentIdea KB |
| 28 | Windows 10 MDM auto-enrollment into Intune via GPO fails and the following symptoms are observed:... | This can occur if the domain for the UPN is either unverified or unroutable. ... | To resolve this problem, complete the following:1.	Open Active Directory Users and Computers2.	Se... | 🔵 7.0 | ContentIdea KB |
| 29 | After configuring co-existence with Microsoft Intune and Office 365, when navigating to the Devic... | This can occur if your Mobile Device Management Authority is set to Configura... | The only option to work around this issue is to set your MDM authority back to standalone Intune. | 🔵 7.0 | ContentIdea KB |
| 30 | Consider the following scenario:A single user in a company is unable to login to any Office365 se... | This can occur if the SIM card in the device is defective. In this case, when... | To resolve this problem, replace the SIM card in the device. | 🔵 7.0 | ContentIdea KB |
| 31 | In the Azure Intune portal under Devices -&gt; All Devices, some devices show an email address an... | This can occur if the users with missing information originally had a valid I... | To resolve this problem, go to the Office 365 portal -&gt; Users and assign the affected user an ... | 🔵 7.0 | ContentIdea KB |
| 32 | When attempting to enroll a Windows 10 computer in Intune, or join a Windows 10 computer to Azure... | This can occur if the Intune tenant is configured for co-existence with MDM f... | To resolve this problem, use the Office365 admin portal to assign the user either an Intune licen... | 🔵 7.0 | ContentIdea KB |
| 33 | After configuring Exchange Online, Windows 10 users receive errors similar to the following when ... | This can occur if the default Windows device policies in the O365 portal are ... | To resolve this problem, assuming the customer does not want this functionality, simply remove th... | 🔵 7.0 | ContentIdea KB |
| 34 | Attempting to sign-in to Office 365 applications with a user account other than the Device Enroll... | This is currently expected behavior. | As a workaround, you can use a DEP or Apple Configurator profile which doesn't require user affin... | 🔵 7.0 | ContentIdea KB |
| 35 | After creating and assigning a device security policy where Required Password or Require alphanum... | Intune: This problem was fixed by removing the option to create this password... | Office 365 MDM: Use Office 365 MDM powershell to set the Password Quality value. | 🔵 7.0 | ContentIdea KB |
| 36 | Attempting to enroll an iOS device fails with the following error: User License Type Invalid | This can occur if the user trying to enroll the device does not have a valid ... | To resolve this issue, assign an Intune license to the user:1. Go to the Office 365 Admin Center,... | 🔵 7.0 | ContentIdea KB |
| 37 | Attempting to enroll an iOS device fails with the following error message: User Name Not Recogniz... | This can occur if the user trying to enroll the device does not have a valid ... | To resolve this issue, assign an Intune license to the user:1. Go to the Office 365 Admin Center,... | 🔵 7.0 | ContentIdea KB |
| 38 | When trying to log in to the Intune connector for Active Directory, your sign-in fails with the f... | This can occur if the account used to sign-in is not assigned an Office or In... | To resolve this problem, assign an Intune license to the user account being used to sign-in to th... | 🔵 7.0 | ContentIdea KB |
| 39 | Intune Connector for AD sign-in unexpected error: An error occurred while processing your request | Sign-in account not assigned Intune or Microsoft Office license | Assign Intune license to the user account. | 🔵 6.5 | MS Learn |
