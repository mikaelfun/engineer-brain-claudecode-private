# Intune Autopilot v2 / Device Preparation — 综合排查指南

**条目数**: 11 | **草稿融合数**: 18 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-Autopilot-Amazon-Workspaces.md, ado-wiki-Autopilot-HAADJ-User-Driven.md, ado-wiki-Autopilot-v2-Device-Preparation.md, ado-wiki-Autopilot.md, ado-wiki-ESP-Install-Updates.md, mslearn-entra-device-registration-autopilot.md, mslearn-esp-troubleshooting.md, onenote-apv2-client-troubleshooting-deep-dive.md, onenote-autopilot-azure-ad-branding.md, onenote-autopilot-etw-trace-analysis.md
**Kusto 引用**: autopilot.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Autopilot Amazon Workspaces
> 来源: ADO Wiki — [ado-wiki-Autopilot-Amazon-Workspaces.md](../drafts/ado-wiki-Autopilot-Amazon-Workspaces.md)

**Overview**
- Deploy Amazon WorkSpaces running Windows 10/11 operating system
- Use Entra, Intune and Windows Autopilot in Azure Global cloud.

**Intune Ownership and Responsibilities**

**Intune offers the following support options for its customers:**
- Online documentation and tutorials
- Community forums and blogs
- Support tickets through the Microsoft 365 admin center
- Phone support for critical issues

**Feedback and feature requests through UserVoice**
- Intune is responsible for the following aspects of the service:
- Ensuring the availability and performance of the Intune service
- Providing updates and enhancements to the Intune service or Windows OS
- Providing security and compliance features for the Intune service
- Providing support for the Intune service and its features
- Providing device management for Amazon WorkSpaces that are enrolled in Intune
- Updating public docs that Amazon is now a supported configuration

**Amazon Ownership and Responsibilities**

**Amazon is responsible for the following aspects of its services:**
- Ensuring the availability and performance of Amazon WorkSpaces
- Providing updates and enhancements to Amazon WorkSpaces
- Providing security and compliance features for Amazon WorkSpaces
- Providing support for Amazon WorkSpaces and its features

**Amazon is also responsible for the following aspects of the integration with Intune:**
- Amazon Workspaces usage of Windows Autopilot meets the same requirements as that of a physical Windows PC
- Providing the first level of support for any issues related to Amazon Workspaces integration with Intune and Entra using Windows Autopilot
- Directing their customers to file support tickets for Intune through Microsoft support channels
... (详见原始草稿)

### Phase 2: Autopilot Haadj User Driven
> 来源: ADO Wiki — [ado-wiki-Autopilot-HAADJ-User-Driven.md](../drafts/ado-wiki-Autopilot-HAADJ-User-Driven.md)

**Autopilot User-Driven Hybrid Azure AD Join - Troubleshooting Guide**
**Public Documentation**
- https://docs.microsoft.com/en-us/mem/autopilot/windows-autopilot-hybrid
- https://docs.microsoft.com/en-us/mem/autopilot/user-driven#user-driven-mode-for-hybrid-azure-active-directory-join-with-vpn-support

**Summary**

**Major Parts / Stages**
1. Deployment Profiles
2. Devices (hardware hash import)
3. Autopilot Dynamic Device Group
4. Device Configuration - Domain Join Profile
5. Intune Connector (ODJ Connector) — both Updated and Legacy

**Key Troubleshooting Tips**

**Deployment Profiles**
- Only ONE profile should be Assigned=Yes; AzureAD-only and Hybrid profiles must NOT be assigned to the same dynamic device group
- Cannot use Hybrid Profile with AzureAD-only join type and vice versa
- Only User-Driven mode available for HAADJ (not Self-Deploying)

**Domain Join Profile**
- `nltest /dsgetdc:corp.contoso.com` must work (substituting exact domain); if it fails, Autopilot ODJ join will never succeed
- For "Skip AD Connectivity Check" option: connectivity still required after AP completes during Windows Logon (VPN needed for remote users)
- OU path syntax: must use `OU=` and `DC=`, NOT `CN=`
- Computer name: cannot use `%SERIAL%` or exceed 15 characters
- Non-Federated tenants with SkipUSEResp: "Fix your Account" message appears, takes 30-40 minutes for AADSyncScheduler to sync objects

**ODJ Connector (Updated)**
- Requires WebView2 — setup auto-prompts install if missing
- Need Read/Write permission on `C:\Program Files\Microsoft Intune\ODJConnector\ODJConnectorEnrollmentWizard\ODJConnectorEnrollmentWizard.exe.webview2` folder
- Reinstall procedure: fully uninstall → delete MSA accounts → reinstall → close installer → run from install folder
- Logs: EventViewer > Applications and Services > Microsoft > Intune > ODJ Connector (Admin + Operational) + `ODJConnectorUI.txt`

**ODJ Connector (Legacy)**
- GA account only needed temporarily at install time
... (详见原始草稿)

### Phase 3: Autopilot V2 Device Preparation
> 来源: ADO Wiki — [ado-wiki-Autopilot-v2-Device-Preparation.md](../drafts/ado-wiki-Autopilot-v2-Device-Preparation.md)

**Autopilot v2 Device Preparation (AP-DP) Troubleshooting Guide**
**About Autopilot Device Preparation**
- It does not require device registration or enrollment status page.
- It supports user-driven deployment for Microsoft Azure AD joined devices only.
- It limits the number of apps and scripts that can be delivered during OOBE to 10 each.
- It uses a device security group to determine the configuration that gets applied to the device.

**How Autopilot Device Prep Works**
1. Create the Autopilot device preparation policy/profile:
    - Create a device security group with the Intune Provisioning Client configured as the group owner.
    - Configure the Deployment Settings, such as mode, type, etc.
    - Configure OOBE settings, such as minutes before showing install error, custom error messages, etc.
    - Select the managed apps to include (up to 10 max). These are delivered during OOBE. App types supported are LOB, Win32, Store/WinGet.
    - Select the scripts you want to include. PowerShell only and a max of 10.
    - Specify Scope tags (optional)
    - Specify the user group assigned/targeted.
2. Assign your apps to the security group.
1. A user from the assigned user group logs in with their credentials.
2. Apps and scripts defined in the profile are delivered to the device.
3. The device is added as a member of the device security group specified in the AP-DP profile.
4. User gets to desktop and other associated apps or settings are applied.

**Prerequisites**
- Windows 11 version 23H2 with KB5035942 or later, or Windows 11 version 22H2 with KB5035942 or later.
- Microsoft Entra ID. Only Microsoft Entra join is supported.
- Targeted devices must **not** be registered or added as a Windows Autopilot device. If a device is registered, the Windows Autopilot profile takes precedence.
... (详见原始草稿)

### Phase 4: Autopilot
> 来源: ADO Wiki — [ado-wiki-Autopilot.md](../drafts/ado-wiki-Autopilot.md)

**About Autopilot**
**Key Components**
**How Windows Autopilot works**
1. Admin/OEM will import the device hardware hash into the service through Intune, M365, Microsoft Store, or partner center portal.
1. In the backend, Intune will communicate with the DDS and add this hardware hash into it.
1. DDS will check to make sure that the device doesn't already exist and is associated with any other tenant. It will then assign a ZTDID to the device and initiate a Pre-Creation call with Azure Device registration service to create a synthetic record into Azure Active directory.
1. DDS will create a Device Object in Azure AD for this device. This pre-created device will be in Disabled state and the display name will be the device serial number.
1. The admin will either create a dynamic or static group that will contain all ZTDID devices. To see how to create a dynamic group membership for ZTD devices, refer to the article Create an Autopilot device group using Intune.After creating the Device Group and adding the device to it, the admin will create a user driven AADJ autopilot profile and assign it to that group.
1. Intune will communicate again with the DDS to assign that Autopilot profile for the device in DDS.
1. The device will boot up into the Initial state (OOBE). The first screens will be the Language, region and keyboard. If the device has a wireless NIC and is not connected to a wired ethernet NIC, the Connection page will appear so that the device can connect to a Wi-Fi network. If the device is connected to a wired ethernet NIC, the Connection page won't appear. After initiating the connection, the device will communicate with the DDS and send the hardware ID to DDS. DDS will verify whether or not the device exists in its database. If the device exists in the DDS database, then DDS will send the Autopilot profile associated with that device created in step #6 in JSON format. Once the device installs the Autopilot profile JSON file, the user will enter the corporate credentials. If configured, the company branding page will also appear at this point. It is recommended to configure the company branding page.
1. After entering the corporate credentials, the device will join Azure Active directory and it will associate itself with the Pre-created Device Object created in step #4.
1. After the join operation has completed, the device will automatically enroll to Intune since the automatic MDM enrollment is enabled.
1. Since Intune is now aware of the device and the user, it can send any policy apps to the device/user context. If ESP is enabled, the user will see the Enrollment status page that will track all the apps and policies deployment progress. For more information about ESP, see the article INTUNE :The Enrollment Status Page - Deep Dive.
1. After the device contacts DDS and installs its associated Autopilot Hybrid Domain Join profile, the user will be prompted to enter the corporate Azure AD UPN (universal principal name) and password in the company branding page.
1. On the backend, for the hybrid Azure AD join method, the device will be registered to Azure AD but not joined to Azure AD. The device will also enroll into Intune immediately. Once the device gets enrolled into Intune, it will request an Offline Domain Join Blob from Intune.
1. Intune will evaluate whether or not the device is assigned to a domain join profile. If it is, then it will pre-stage the device for the connector with the needed information (domain name, target OU, naming prefix, etc.)
1. The on-prem connector checks with the service every 2 minutes to check if there is any pre-staged device that needs to be created and requesting a offline domain join blob. When the on-prem connector finds that there is a device object that is pre-staged, it will create the device object.
1. The on-prem connector will create the device object in Active Directory as per the domain join profile details. It will then request to generate the offline domain join blob.
1. The on-prem connector will upload the offline domain join blob for that specific device back to Intune.
1. Intune will send the offline domain join blob back to device.
1. The device will apply the offline domain join blob and change the name as created in Active Directory by the on-prem connector. For a typical hybrid Azure AD join deployment, the device should be in the same network as the Active Directory relay. The device should be on the same network because after the offline domain join blob is applied to the device, the device will attempt to contact the domain controller via an ICMP ping. If the domain controller is reachable, then the device will complete the domain join operation and reboot. If the domain controller is not reachable, the device will keep trying for 25 minutes to contact the domain controller. If the domain controller can't be reached after 25 minutes, then the operation will fail with the timeout error Domain not reachable 80070774. When attempting a hybrid Azure AD join over VPN (SkipDomainConnectivityCheck), the ICMP ping step will be skipped, and the device will reboot immediately after applying the offline domain join blob.
1. Once the device bootup again, if ESP is enabled, ESP will appear, and the Intune will start pushing all the policies and apps assigned to the device.
1. If ESP is enabled, after the Device Setup phase is completed, the user will be navigated to the normal windows login page. The user should authenticate with the domain\user on-prem credentials and not with the Azure AD UPN. At this stage itÆs very important to make sure that AD connect tool synced the device to Azure AD as a hybrid Azure AD join device so when the user authenticates, an Azure primary refresh token (PRT) will be obtained. If the device is not synced yet and the ESP User Setup Account Setup is enabled, the ESP may timeout since the user doesnÆt have a valid PRT. A PRT is required to sync with Intune in a user context.
... (详见原始草稿)

### Phase 5: Esp Install Updates
> 来源: ADO Wiki — [ado-wiki-ESP-Install-Updates.md](../drafts/ado-wiki-ESP-Install-Updates.md)

**ESP Install Windows Updates (Quality Updates during OOBE)**
**Overview**
**Requirements**
- Windows 11 version 22H2 or later
- ESP profile with "Install Windows Updates" enabled
- WUfB policies (Update Ring or Autopatch Groups) must be applied before update scan

**Supported Scenarios**
- Autopilot Device Preparation
- Self-Deployment Mode

**Key CSP Settings**
- Update/DeferQualityUpdatesPeriodInDays
- Update/PauseQualityUpdatesStartTime
- Update/ExcludeWUDriversInQualityUpdate
- Update/SetPolicyDrivenUpdateSourceForQualityUpdates

**Support Boundaries**
- **Intune**: Settings configuration, policy delivery, deferral/pause behavior
- **Windows** (Collaboration): NDUP package installation, incorrect updates, install timing

**Troubleshooting**
1. Check InstallQualityUpdates setting in Kusto: `DeviceManagementProvider | where message has("isInstallQualityUpdatesEnabled")`
2. ESP logs: Shift+F10 during OOBE → `mdmdiagnosticstool.exe -area "DeviceProvisioning;Autopilot" -cab C:\Logs\AutopilotLogs.cab`
3. NDUP logs: Aka.ms/QualityUpdatesAutopilotPrP (CollectNDUPLogs.zip for ICM/Windows Collaboration)

**FAQ**
- ESP profiles after 2508 default to Yes for Install Windows Updates
- Only Quality Updates supported on ESP; other updates apply post-provisioning
- QUs install after ESP page; ESP Timeout not impacted
- Expedited updates not applied during provisioning
- GCCH supported; pre-registered device support may not be available

### Phase 6: Entra Device Registration Autopilot
> 来源: MS Learn — [mslearn-entra-device-registration-autopilot.md](../drafts/mslearn-entra-device-registration-autopilot.md)

**Microsoft Entra Device Registration & Windows Autopilot Troubleshooting**
**Microsoft Entra Device Registration**
**Connection Types**
- Microsoft Entra registered
- Microsoft Entra joined
- Microsoft Entra hybrid joined

**Troubleshooter Tool**
- Device health status **Pending** → option 5
- Missing Primary Refresh Token (PRT) → option 6

**Windows Autopilot**

**CSV Import**
1. Intune admin center → Devices > Windows > Windows enrollment > Devices (under Autopilot) > Import
2. Generate CSV with PowerShell:
```powershell
```

**Log Collection**
```console
```

**Key Log Files**
- `microsoft-windows-devicemanagement-enterprise-diagnostics-provider-admin.evtx`
- `microsoft-windows-moderndeployment-diagnostics-provider-autopilot.evtx`
- `MdmDiagReport_RegistryDump.reg`
- `TpmHliInfo_Output.txt`
- `microsoft-windows-provisioning-diagnostics-provider-admin.evtx` — ESP events (app failures, timeouts)

**ESP-related Event Examples**
- `AutoPilotGetOobeSettingsOverride succeeded: OOBE setting = AUTOPILOT_OOBE_SETTINGS_AAD_JOIN_ONLY`
- `UnifiedEnrollment_ProvisioningProgressPage_ApplicationsFailed`
- `UnifiedEnrollment_ProvisioningProgressPage_DeviceConfigurationTimeOut`

**Further Resources**
- [Troubleshooting overview](https://learn.microsoft.com/en-us/windows/deployment/windows-autopilot/troubleshooting)
- [Troubleshooting Windows Autopilot (level 300/400)](https://techcommunity.microsoft.com/t5/windows-blog-archive/troubleshooting-windows-autopilot-level-300-400/ba-p/706512)

### Phase 7: Esp Troubleshooting
> 来源: MS Learn — [mslearn-esp-troubleshooting.md](../drafts/mslearn-esp-troubleshooting.md)

**Enrollment Status Page (ESP) Troubleshooting Guide**
**Overview**
**Log Collection**
**User-initiated**
- ESP timeout → user selects **Collect logs** → copy to USB

**Command Prompt (Shift+F10 during OOBE on non-S mode)**
- **User-driven Autopilot**: `mdmdiagnosticstool.exe -area Autopilot -cab <path>`
- **Self-deploying / White glove**: `mdmdiagnosticstool.exe -area Autopilot;TPM -cab <path>`
- **Runtime provisioning (1809+)**: `mdmdiagnosticstool.exe -area DeviceProvisioning -cab <path>`

**Key file in cab**
- `MDMDiagReport_RegistryDump.Reg` — contains all MDM enrollment registry keys

**Registry Keys**

**ESP Settings**

**Skip ESP phases via CSP**
- `SkipUserStatusPage` = 0xffffffff → skip account setup
- `SkipDeviceStatusPage` = 0xffffffff → skip device setup

**EnrollmentStatusTracking (Win10 1903+)**
- **Device\DevicePreparation** — SideCar (IME) install state: 1=NotInstalled, 2=NotRequired, 3=Completed, 4=Error
- **Device\Setup** — Win32 app tracking, TrackingPoliciesCreated, per-app InstallationState
- **ESPTrackingInfo\Diagnostics** — LOB/MSI apps, Wi-Fi profiles, SCEP certs, Store apps status with timestamps
- **{User_SID}** — account setup phase Win32 apps (user context)

**App InstallationState values**
1. NotInstalled
2. InProgress
3. Completed
4. Error (ESP stops installing further apps)

**Diagnosing with PowerShell**
```powershell
```

**Unexpected Reboots**
- Check Event Viewer for `RebootRequiredURI` (event value 2800)
- Log shows which URI triggered reboot (e.g., Update/ManagePreviewBuilds)

**Common Issues**

**Apps not tracked by ESP**
- Apps must be assigned as **required** to device (device setup) or user (account setup) groups
- Must enable "Block device use until all apps installed" or include in blocking list
- Device-context apps must have no user-context applicability rules
... (详见原始草稿)

### Phase 8: Apv2 Client Troubleshooting Deep Dive
> 来源: OneNote — [onenote-apv2-client-troubleshooting-deep-dive.md](../drafts/onenote-apv2-client-troubleshooting-deep-dive.md)

**Autopilot V2 (Device Preparation) — Service & Client Troubleshooting Deep Dive**
**Service-Side Troubleshooting**
**Enrollment Time Grouping (ETG)**
- ETG (Just In Time Configuration) ensures devices auto-join the security group during enrollment
- **Critical**: The **Intune Provisioning Client** service principal must be set as the **owner** of the ETG security group
- If missing, create via PowerShell:
  ```powershell
  ```

**Verify ETG Assignment via Graph API**
```
```

**Kusto Functions**
```kusto
```

**Client-Side Troubleshooting**

**Provider Execution Order**
1. **Standard User Provider** (optional) — removes user from Administrators group
2. **SLDM Provider** — installs LOB apps and policies (policies do not block)
3. **Scripts Provider** — PowerShell platform scripts only (not remediation)
4. **Apps Provider** — Win32 apps and WinGet apps

**AutopilotDDSZTDFile.json**
```json
```

**Key Registry Paths**
```
```
```
```
```
```
```
```

**DevicePrepHint Values (from IME DLL)**

**Event Logs**
- **Microsoft-Windows-Shell-Core** — search for "DevicePrepPage"
- **Microsoft-Autopilot-BootstrapperAgent** — SLDM provider events

**IME Logs**
```
```

### Phase 9: Autopilot Azure Ad Branding
> 来源: OneNote — [onenote-autopilot-azure-ad-branding.md](../drafts/onenote-autopilot-azure-ad-branding.md)

**AutoPilot Azure AD Branding Configuration**
**Overview**
**Configuration Steps**
1. Sign into Azure Portal as tenant admin
2. Navigate to: Azure Active Directory > Company branding > Edit
3. Configure the following assets:

**Screen Mapping**
- **(1)(5)** Square logo image (240x240) → shown on username and password screens
- **(2)(3)** Organization name → set in Azure AD tenant **Properties > Name** (not company branding)
- **(4)(6)** Sign-in page text (up to 256 chars) → shown below login fields

**Known Issues**
- Special characters (e.g., accented characters) in tenant name may not display properly
- Sign-in page text wraps on username screen but not on password screen
- "User name hint" property in AAD is ignored during AutoPilot

**ADFS Considerations**

**Terms and Conditions**

### Phase 10: Autopilot Etw Trace Analysis
> 来源: OneNote — [onenote-autopilot-etw-trace-analysis.md](../drafts/onenote-autopilot-etw-trace-analysis.md)

**Windows Autopilot ETW Trace Analysis (Level 300/400)**
**When to Use**
**Capturing the Trace**
1. On first OOBE screen (language selection), press **Shift+F10** to open command prompt
2. Insert USB with `AutoPilot.wprp` file (or map network share)
3. Start trace:
   ```cmd
   ```
4. Exit command prompt, proceed through Autopilot flow to reproduce the issue
5. Stop trace (Shift+F10 again if still in OOBE):
   ```cmd
   ```

**Analyzing with Windows Performance Analyzer (WPA)**
1. Open ETL file in WPA (from ADK)
2. Expand **System Activity** > double-click **Generic Events**

**Key ETW Providers**

**Key Event Names to Search**

**Profile Settings Bitmap**

**Alternative Analysis Tools**
- Microsoft Network Analyzer (formerly Network Monitor)
- `TRACEFMT.EXE` — converts ETL to XML/text

**Reference**
- [AutoPilot.wprp download](https://msdnshared.blob.core.windows.net/media/2017/12/AutoPilot.zip)
- SkipCortanaOptIn/SkipExpressSettings added in Win10 1703, SkipEula in 1709

### Phase 11: Autopilot V1 Troubleshooting 100 200
> 来源: OneNote — [onenote-autopilot-v1-troubleshooting-100-200.md](../drafts/onenote-autopilot-v1-troubleshooting-100-200.md)

**Autopilot V1 Troubleshooting Walkthrough (Level 100/200)**
**OOBE Flow — Step-by-Step Troubleshooting**
**1. Language/Region/Keyboard Selection**
- If standard OOBE screens don't appear → bad OS image, unexpected unattend.xml, or OOBE was partially completed
- Fix: Start from scratch or reset OS from Settings app
- Tip: Shift-F10 during OOBE to open command prompt for hardware hash capture

**2. Network Connection**
- Shift-F10 → IPCONFIG, NSLOOKUP, PING for basic network troubleshooting

**3. Azure AD Authentication / Custom Branding**
- Device not registered with AutoPilot → re-capture hardware hash and upload
- Hardware changes (e.g., motherboard swap) can change hardware hash
- Azure AD Premium license required for branding (doesn't need to be assigned to user for this step)
- Company branding not configured in Azure AD

**4. Azure AD Join**
- Configure at: Azure AD > Device settings > Users may join devices to Azure AD

**5. Automatic MDM Enrollment**

**6. Automatic Logon**
- Usually works since credentials already validated
- After logon: pulsing status screen → app installation → MDM progress → desktop

**Verification**
- Shows MDM enrollment details, server URLs, applied policies
- Can generate HTML diagnostics report or manually sync

**Error Code Lookup**

### Phase 12: Autopilot V2 Client Side Troubleshooting
> 来源: OneNote — [onenote-autopilot-v2-client-side-troubleshooting.md](../drafts/onenote-autopilot-v2-client-side-troubleshooting.md)

**Autopilot V2 Client-Side Troubleshooting**
**Service-Side Troubleshooting**
**Enrollment Time Grouping (ETG)**
- ETG is critical for smooth APv2 enrollment — device auto-joins the security group during enrollment
- **Owner must be set to Intune Provisioning Client service principal**
- If missing, create via PowerShell:
  ```powershell
  ```

**Verify ETG Assignment via Graph API**
```
```

**Kusto Queries**

**Client-Side Troubleshooting**

**Provider Execution Order**
1. **Standard User Provider** (optional) — removes user from Administrators group
2. **SLDM Provider** — installs LOB apps and policies (policies don't block)
3. **Scripts Provider** — PowerShell scripts (platform scripts only, not remediation)
4. **Apps Provider** — Win32 apps and WinGet apps

**AutopilotDDSZTDFile.json**
```json
```

**Key Registry Paths**
```
```
```
```
```
```
```
```

**DevicePrepHintValue States (from IME DLL)**

**Event Logs**
- **Microsoft-Windows-Shell-Core** — search for "DevicePrepPage"
- **Microsoft-Autopilot-BootstrapperAgent** — SLDM provider events

**IME Log Analysis**
```
```

**Known Issues**
- See: https://learn.microsoft.com/en-us/autopilot/device-preparation/known-issues

### Phase 13: Kusto 诊断查询

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
| 1 | Intune Configuration Policy not applied immediately during Autopilot v2 provisioning; filter rule... | Entra ID does not support Strong Consistency on national clouds (Mooncake/Fai... | 1) Hotfix deployed 2025-10-30/31 to fix the delay; 2) Workaround before hotfix: use user-based gr... | 🟢 9.0 | OneNote |
| 2 | Autopilot Device Preparation (AP-DP) 部署期间设备在 OOBE 进度条卡在 100% 不继续 | 已知产品缺陷，AP-DP 完成所有应用/脚本安装后未自动触发后续流程 | 终端用户手动重启设备即可继续完成部署。此问题为已知 Bug，Microsoft 正在修复中 | 🟢 8.5 | ADO Wiki |
| 3 | 配置 AP-DP 设备组 Owner 时，AppID f1346770-5b25-470b-88bd-d5744ab7952c 显示为 Intune Autopilot Confidential... | 部分租户中该 Service Principal 的 DisplayName 未正确更新，但 AppID 相同，功能不受影响 | 确认 Service Principal 的 AppID 为 f1346770-5b25-470b-88bd-d5744ab7952c 即可放心选择，名称显示差异不影响 AP-DP 功能 | 🟢 8.5 | ADO Wiki |
| 4 | AP-DP 部署后用户直接到达桌面但必需应用未安装，Provisioning 被跳过 | Windows Autopilot Device Preparation 策略的 User account type 设为 Standard user 时... | 两种 Workaround：1) 若 Entra ID Local admin 设为 Selected/None，则 AP-DP 策略的 User account type 改为 Adminis... | 🟢 8.5 | ADO Wiki |
| 5 | Autopilot v1 apps do not install or timeout; LOB (MSI) apps mixed with Win32 apps in ESP-blocking... | APv1 does not support mixing LOB (MSI) and Win32 app types. When both are ass... | Do not mix LOB (MSI) and Win32 apps in Autopilot v1. Convert LOB apps to Win32 format, or use APv... | 🟢 8.5 | ADO Wiki |
| 6 | Autopilot v1 apps do not install or timeout; LOB (MSI) apps mixed with Win32 apps in ESP-blocking... | APv1 does not support mixing LOB (MSI) and Win32 app types. When both are ass... | Do not mix LOB (MSI) and Win32 apps in Autopilot v1. Convert LOB apps to Win32 format, or use APv... | 🟢 8.5 | ADO Wiki |
| 7 | 配置 ETG enrollment profile 时更新 Device Security Group 报错 / SG 找不到 | Intune Provisioning Client 未设置为该 Security Group 的 Owner，导致 SG 验证失败（返回 SG not ... | 在 Entra 中将 'Intune Provisioning Client' Service Principal 添加为该 Static Security Group 的 Owner。参考: ... | 🟢 8.5 | ADO Wiki |
| 8 | Autopilot Device Preparation (AP-DP) device stuck at 100% during OOBE, deployment does not continue | Known platform issue in AP-DP initial release | End-user needs to manually restart the device for the deployment to continue. Fix is being worked... | 🔵 7.5 | ADO Wiki |
| 9 | AP-DP: User reaches desktop without required applications installed during Autopilot Device Prepa... | Conflict between AP-DP User account type set to Standard user and Entra ID lo... | Workaround 1: If Entra ID local admin = Selected/None, set AP-DP User account type to Administrat... | 🔵 7.5 | ADO Wiki |
| 10 | AP-DP: Managed installer policy causes app installs to be skipped during Autopilot Device Prepara... | Prior to 2603, managed installer policy conflicted with app installs during A... | Upgrade to 2603 service release or later. Managed installer usage during AP-DP is now supported. | 🔵 7.5 | ADO Wiki |
| 11 | Autopilot V2 enrollment fails with error 80180014 when personal device enrollment is blocked unde... | Corporate device identifiers take time to propagate after CSV upload. If enro... | Wait for corporate device identifiers to propagate after CSV upload. Verify in Intune portal: Dev... | 🔵 7.0 | OneNote |
