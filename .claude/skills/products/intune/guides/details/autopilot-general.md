# Intune Autopilot 通用问题 — 综合排查指南

**条目数**: 39 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**Kusto 引用**: autopilot.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (9 条)

- **solution_conflict** (high): intune-ado-wiki-294 vs intune-contentidea-kb-604 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-294 vs intune-contentidea-kb-601 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-131 vs intune-onenote-245 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-131 vs intune-onenote-275 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-contentidea-kb-677 vs intune-mslearn-117 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Kusto 诊断查询

#### autopilot.md
`[工具: Kusto skill — autopilot.md]`

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

CheckAutopilotV2EligibilityForDevice(lookback, deviceId)
```

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2EnrollmentEventsForDevice(lookback, deviceId)
```

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2ProvisioningEventsForDevice(lookback, deviceId)
```

```kql
let intuneDeviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2CheckinSessionInfoForDevice(lookback, intuneDeviceId)
```

```kql
let intuneDeviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2SidecarInstallEventsForDevice(lookback, intuneDeviceId)
```

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2ScenarioResultEventsForDevice(lookback, deviceId)
```

```kql
IntuneScenarioHealth
| where env_time > ago(7d)
| where InstanceId == '{deviceId}'
| where ScenarioType startswith "AutopilotV2"
| extend Scenario = case(
    ScenarioType startswith "AutopilotV2Enrollment/", replace("^AutopilotV2Enrollment/", "", ScenarioType),
    ScenarioType startswith "AutopilotV2/", replace("^AutopilotV2/", "", ScenarioType), 
    ScenarioType)
| project env_time, Scenario, DurationInMs=durationms, Result, ErrorCategory, ErrorDetails
| order by env_time asc
```

```kql
IntuneEvent
| where env_time > ago(7d)
| where DeviceId == '{deviceId}' or ActivityId == '{deviceId}'
| where * contains "autopilot"
| project env_time, EventUniqueName, ServiceName, ComponentName, 
    ColMetadata, Col1, Col2, Col3, Col4, Message
| order by env_time asc
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune Windows Autopilot 在 21V 仅支持旧版（v1），v2 支持较晚 | Autopilot v2 于 2409 才 GA in 21V；此前仅 v1，功能受限 | 部分支持：Autopilot v2 自 2409 起已 GA；若客户使用旧版本请升级到 2409+ 或改用 v1 流程 | 🟢 9.0 | 21V Gap |
| 2 | Intune portal shows HTTP 503/504 errors; device list export fails, AutoPilot CSV import returns g... | Back-end service timeout: Intune service has 15,000 ms soft timeout and 30,00... | Collect F12/HAR trace, extract client-request-id and timestamp. Run 3 Kusto queries: (1) HttpSubs... | 🟢 9.0 | OneNote |
| 3 | Need to collect comprehensive MDM diagnostic logs from Windows device for co-management or Autopi... | Multiple log sources needed: Event Viewer logs (AAD-Operational, DeviceManage... | MdmDiagnosticsTool.exe -out c:\autopilot.cab (Autopilot + event logs). MdmDiagnosticsTool.exe -ar... | 🟢 9.0 | OneNote |
| 4 | During Windows Autopilot OOBE, another company logo is shown instead of the correct organization ... | Hardware hash uploaded to Autopilot service must be globally unique. Common c... | 1) Confirm device ownership and collect hardware hash: mdmdiagnosticstool -area Autopilot -cab c:... | 🟢 9.0 | OneNote |
| 5 | Get-WindowsAutopilotInfo -Online fails with redirect URI error when MS Graph Command Line Tools h... | MS Graph SDK includes all delegated scopes in the authentication URL, not jus... | Remove unnecessary scopes from MS Graph Command Line Tools enterprise app, OR create a new enterp... | 🟢 8.5 | ADO Wiki |
| 6 | Autopilot v1 DeviceSetup times out during provisioning; UDiag shows ServerHasNOTFinishedProvision... | OS Edition SKU switch during Autopilot causes the device to lose track of pre... | Do NOT perform OS Edition Upgrade during Autopilot. Options: (1) Assign edition upgrade policy to... | 🟢 8.5 | ADO Wiki |
| 7 | BitLocker encryption on Autopiloted device shows XTS-AES 128-bit instead of configured 256-bit af... | ZDP (Zero-Day Patch) update applied during Autopilot caused BitLocker configu... | Install latest LCU (2025.09B or later) via Settings > Windows Update > Check for Updates. After r... | 🟢 8.5 | ADO Wiki |
| 8 | Autopilot device unable to continue provisioning; OMADMClient.exe crashes during enrollment, devi... | OMADMClient.exe crash caused by KB5065848 update applied during Autopilot. Re... | Press Shift+F10 to open command prompt, run 'start ms-settings:' to open Settings, uninstall KB50... | 🟢 8.5 | ADO Wiki |
| 9 | Intune device appears in orphaned state after Autopilot: has Intune device ID but most Device Act... | OMADMClient.exe crash (ICM 678596064) prevented device from completing check-... | Install latest LCU (2025.09B or later) via Settings > Windows Update > Check for Updates. After r... | 🟢 8.5 | ADO Wiki |
| 10 | Get-WindowsAutopilotInfo -Online fails with redirect URI error when MS Graph Command Line Tools h... | MS Graph SDK includes all delegated scopes in the authentication URL, not jus... | Remove unnecessary scopes from MS Graph Command Line Tools enterprise app, OR create a new enterp... | 🟢 8.5 | ADO Wiki |
| 11 | Autopilot v1 DeviceSetup times out during provisioning; UDiag shows ServerHasNOTFinishedProvision... | OS Edition SKU switch during Autopilot causes the device to lose track of pre... | Do NOT perform OS Edition Upgrade during Autopilot. Options: (1) Assign edition upgrade policy to... | 🟢 8.5 | ADO Wiki |
| 12 | BitLocker encryption on Autopiloted device shows XTS-AES 128-bit instead of configured 256-bit af... | ZDP (Zero-Day Patch) update applied during Autopilot caused BitLocker configu... | Install latest LCU (2025.09B or later) via Settings > Windows Update > Check for Updates. After r... | 🟢 8.5 | ADO Wiki |
| 13 | Autopilot device unable to continue provisioning; OMADMClient.exe crashes during enrollment, devi... | OMADMClient.exe crash caused by KB5065848 update applied during Autopilot. Re... | Press Shift+F10 to open command prompt, run 'start ms-settings:' to open Settings, uninstall KB50... | 🟢 8.5 | ADO Wiki |
| 14 | Intune device appears in orphaned state after Autopilot: has Intune device ID but most Device Act... | OMADMClient.exe crash (ICM 678596064) prevented device from completing check-... | Install latest LCU (2025.09B or later) via Settings > Windows Update > Check for Updates. After r... | 🟢 8.5 | ADO Wiki |
| 15 | 新版 Intune AD Connector 配置成功完成，但连接器未出现在 Intune Portal 中 | 服务器的代理(Proxy)设置未正确配置，导致连接器无法与 Intune 服务通信注册自身 | 配置正确的 Proxy 设置（公开文档可能不完整，参考 ICM Incident-647297567 中 PG 的指导）；连接器每 30 秒同步一次，Portal 中状态更新最长需 1 小时 | 🟢 8.5 | ADO Wiki |
| 16 | Intune AD Connector 配置向导中登录页面空白，或报错 Microsoft Edge cannot read and write to its data directory | 服务器上未安装 WebView2 Runtime，或当前登录用户对 ODJConnectorEnrollmentWizard.exe.WebView2 文... | 1. 安装 WebView2 Runtime (https://aka.ms/webview2download); 2. 确保登录用户对 C:\Program Files\Microsoft I... | 🟢 8.5 | ADO Wiki |
| 17 | Windows Backup for Organizations 还原页面在 OOBE 中未显示，设备为 Hybrid Azure AD Joined | Windows Backup 还原功能不支持 Hybrid Azure AD Join，仅支持纯 Entra ID joined 设备。同时不支持自部署模... | 确认设备为纯 Entra joined + 用户驱动注册。还原要求：Windows 11 22H2 build 22621.3958+ 或 23H2 build 22631.3958+ 或 24... | 🟢 8.5 | ADO Wiki |
| 18 | Devices encrypted with 128-bit instead of 256-bit as specified in BitLocker policy, especially du... | Windows BitLocker automatic device encryption starts during OOBE before the I... | Configure 'Automatic encryption during AADJ: Block' in device restriction policy. This prevents W... | 🟢 8.5 | ADO Wiki |
| 19 | Error 808-ZtdDeviceAssignedToOtherTenant or 806-ZtdDeviceAlreadyAssigned when importing Autopilot... | Hardware hash already exists in Autopilot service. Common causes: device boug... | 1) Search serial number in Assist365 > Applications > Intune > Device Search 2) If not found, col... | 🟢 8.5 | ADO Wiki |
| 20 | During OOBE, AutoPilot customized branding (org name, logo) not displayed; standard OOBE choices ... | Device not recognized by AutoPilot service. Causes: (1) Hardware hash not upl... | 1) Re-capture hardware hash: Shift-F10 in OOBE > PowerShell > Get-WindowsAutoPilotInfo; 2) Upload... | 🟢 8.0 | OneNote |
| 21 | AutoPilot Azure AD join fails with error 801C0003 Something went wrong during OOBE | User not allowed to join devices to Azure AD (device settings restriction), o... | 1) Azure AD > Devices > Device settings: enable user device join; 2) Set device limit to Unlimite... | 🟢 8.0 | OneNote |
| 22 | AP-DP: Managed installer policy causes app installs to be skipped during Autopilot Device Prepara... | Prior to 2603, managed installer policy conflicted with app installs during A... | Upgrade to 2603 service release or later. Managed installer usage during AP-DP is now supported. | 🔵 7.5 | ADO Wiki |
| 23 | Device Offboarding Agent 建议列表中未出现 Windows Autopilot 设备 | 已知 CRI——Windows Autopilot 设备目前不会出现在 Agent 建议中，属于产品缺陷 | 已知问题，目标在 2601 修复后 Windows Autopilot 设备将出现在 Agent 建议中；当前无 workaround，需等待修复 | 🔵 7.5 | ADO Wiki |
| 24 | Autopilot device enrollment fails with HRESULT 0x80180022. Device is running Windows Home Edition. | Windows Home Edition does not support Autopilot/MDM enrollment. Only Pro edit... | Update the device to Windows Pro edition or higher. | 🔵 7.5 | MS Learn |
| 25 | Autopilot self-deploying mode fails with error 0x800705b4: Securing your hardware (Failed). Subse... | Device lacks physical TPM 2.0 chip (virtual TPMs or TPM 1.2 not supported for... | Ensure device has a physical TPM 2.0 chip. Verify Windows 10 build 1709+ (or 1809+ for hybrid Ent... | 🔵 7.5 | MS Learn |
| 26 | Windows enrollment via Company Portal fails: You do not have the right privileges. Non-admin acco... | User is not local Administrator. Local admin required for enrolling already-c... | Use Windows Autopilot or join brand-new device via OOBE (uses SYSTEM account, no local admin need... | 🔵 7.5 | MS Learn |
| 27 | Sysprep does not remove MDM enrollment (Intune) certs/IDs/settings from Windows 10 device. Cloned... | Sysprep generalization does not clean MDM enrollment data or Entra join info.... | Never clone Entra-joined/Intune-enrolled devices. Image in workgroup state using MDT/ConfigMgr OS... | 🔵 7.5 | MS Learn |
| 28 | Attempting to enroll Windows devices into Intune MDM fails if the user is not in the local Admini... | This is by design. For regular MDM enrollment, the account used to enroll the... | As a workaround, if the customer uses AutoPilot they can enroll the device in MDM during OOBE (Sy... | 🔵 7.0 | ContentIdea KB |
| 29 | When attempting to deploy Windows 10 devices in Kiosk mode automatically using AutoPilot, the dep... | This can occur if the targeted device does not meet both of the following pre... | To resolve this problem, ensure that the targeted device meets both of these prerequisites. | 🔵 7.0 | ContentIdea KB |
| 30 | When attempting delete an Autopilot Deployment Profile, the following error is returned:  Cannot ... | This issue can occur for one of the two following reasons:1.  There is an act... | Execute the following procedures to remove the group assignment if the group has not been deleted... | 🔵 7.0 | ContentIdea KB |
| 31 | Unable to delete Auto pilot devices. Some devices failed to delete message when devices that have... | Code Flaw on the DDS service side with registrations in ADRS, in short junk b... | Verification your case is a match. DDS has temp disabled the signaling to ADRS that the deletion ... | 🔵 7.0 | ContentIdea KB |
| 32 | Unable to delete Auto pilot devices. Some devices failed to delete message when devices that have... | Code Flaw on the DDS service side with registrations in ADRS, in short junk b... | Verification your case is a match. DDS has temp disabled the signaling to ADRS that the deletion ... | 🔵 7.0 | ContentIdea KB |
| 33 | New Intune tenant: Intune blade shows Access denied, App Protection blade shows Bad Request, Requ... | Intune AAD Enterprise Application was disabled. AccountState=0 prevents compl... | Azure Portal > AAD > Enterprise Applications > Intune > Properties > Enable for users to sign-in ... | 🔵 7.0 | ContentIdea KB |
| 34 | During Hybrid Azure AD Join AutoPilot the device times out during the initial OOBE screen. It wil... | The "Assign User" feature should only be used with Azure AD Join AutoPilot sc... | 1. Navigate to the Intune -> Device Enrollment -> Windows Enrollment -> Devices section. 2. Selec... | 🔵 7.0 | ContentIdea KB |
| 35 | Hybrid Azure AD Join AutoPilot: device times out during OOBE with error 80070774. Device fails to... | Assign User feature was used, which only works with Azure AD Join AutoPilot, ... | Intune > Device Enrollment > Windows Enrollment > Devices > Unassign User. Re-assign Hybrid Azure... | 🔵 7.0 | ContentIdea KB |
| 36 | A Windows AutoPilot deployment fails and generates the following error during the OOBE phase of s... | This problem can occur if there is a proxy, firewall or other network device ... | To resolve this problem, make sure there is nothing on your network that is blocking the required... | 🔵 7.0 | ContentIdea KB |
| 37 | Intune Connector for Active Directory installed but not visible in Intune portal; ODJ event log s... | Proxy server blocks connector communication with Intune service; proxy not co... | Add proxy config to ODJConnectorSvc.exe.config with system.net/defaultProxy element, then restart... | 🔵 6.5 | MS Learn |
| 38 | Importing Windows Autopilot device CSV file fails with error 806 (ZtdDeviceAlreadyAssigned) or er... | Device already registered in the tenant (806) or assigned to another tenant (... | For 806: delete existing device record from Intune admin center (Devices > Windows > Enrollment >... | 🔵 5.5 | MS Learn |
| 39 | Cannot delete Windows Autopilot deployment profile in Intune; error 'The profile is assigned to g... | Profile still assigned to groups in Microsoft Entra ID, or assigned group was... | If group exists: remove all groups from Included groups in profile Assignments then delete; if gr... | 🔵 5.5 | MS Learn |
