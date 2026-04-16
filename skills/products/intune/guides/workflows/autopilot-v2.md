# Intune Autopilot v2 / Device Preparation — 排查工作流

**来源草稿**: ado-wiki-Autopilot-Amazon-Workspaces.md, ado-wiki-Autopilot-HAADJ-User-Driven.md, ado-wiki-Autopilot-v2-Device-Preparation.md, ado-wiki-Autopilot.md, ado-wiki-ESP-Install-Updates.md, mslearn-entra-device-registration-autopilot.md, mslearn-esp-troubleshooting.md, onenote-apv2-client-troubleshooting-deep-dive.md, onenote-autopilot-azure-ad-branding.md, onenote-autopilot-etw-trace-analysis.md, onenote-autopilot-v1-troubleshooting-100-200.md, onenote-autopilot-v2-client-side-troubleshooting.md, onenote-autopilot-v2-client-troubleshooting.md, onenote-autopilot-v2-setup.md, onenote-autopilot-v2-tsg.md, onenote-esp-phases-overview.md, onenote-esp-phases-steps.md, onenote-windows-autopilot-branding.md
**Kusto 引用**: autopilot.md
**场景数**: 84
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune portal > Devices > Enrollment > Device preparation policies`
- `1. Open portal > Groups > All groups > New group`
- `1. Open Intune portal > Devices > Enrollment`
- `Intune portal > Devices > Enrollment`

## Scenario 1: Deployment Profiles
> 来源: ado-wiki-Autopilot-HAADJ-User-Driven.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Only ONE profile should be Assigned=Yes; AzureAD-only and Hybrid profiles must NOT be assigned to the same dynamic device group
- Cannot use Hybrid Profile with AzureAD-only join type and vice versa
- Only User-Driven mode available for HAADJ (not Self-Deploying)

## Scenario 2: Domain Join Profile
> 来源: ado-wiki-Autopilot-HAADJ-User-Driven.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `nltest /dsgetdc:corp.contoso.com` must work (substituting exact domain); if it fails, Autopilot ODJ join will never succeed
- For "Skip AD Connectivity Check" option: connectivity still required after AP completes during Windows Logon (VPN needed for remote users)
- OU path syntax: must use `OU=` and `DC=`, NOT `CN=`
- Computer name: cannot use `%SERIAL%` or exceed 15 characters
- Non-Federated tenants with SkipUSEResp: "Fix your Account" message appears, takes 30-40 minutes for AADSyncScheduler to sync objects

## Scenario 3: ODJ Connector (Updated)
> 来源: ado-wiki-Autopilot-HAADJ-User-Driven.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Requires WebView2 — setup auto-prompts install if missing
- Need Read/Write permission on `C:\Program Files\Microsoft Intune\ODJConnector\ODJConnectorEnrollmentWizard\ODJConnectorEnrollmentWizard.exe.webview2` folder
- Reinstall procedure: fully uninstall → delete MSA accounts → reinstall → close installer → run from install folder
- Logs: EventViewer > Applications and Services > Microsoft > Intune > ODJ Connector (Admin + Operational) + `ODJConnectorUI.txt`

## Scenario 4: ODJ Connector (Legacy)
> 来源: ado-wiki-Autopilot-HAADJ-User-Driven.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- GA account only needed temporarily at install time
- Multi-domain: connector service account must be able to create computer objects in ALL domains
- Service account needs: Log on as service, Domain user group, local Administrators group

## Scenario 5: ESP
> 来源: ado-wiki-Autopilot-HAADJ-User-Driven.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Default 60-minute timeout may be insufficient for large apps (Office 1.8GB + others → consider 90-120 min)
- NEVER disable Device ESP; User ESP can be disabled if needed

## Scenario 6: Apps
> 来源: ado-wiki-Autopilot-HAADJ-User-Driven.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- NEVER mix LOB (MSI) and Win32 apps during Autopilot — documented in multiple public articles
- Recommended: limit required apps during ESP to essentials (Office, security/VPN)
- Troubleshooting: divide and conquer approach to identify problematic app

## Scenario 7: Log Collection
> 来源: ado-wiki-Autopilot-HAADJ-User-Driven.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. `autopilot.cab`: at error/timeout, Shift+F10 → `MdmDiagnosticsTool.exe -area DeviceEnrollment;Autopilot;TPM;DeviceProvisioning -cab C:\temp\autopilot.cab`
2. Autopilot Diagnostics Timeline: `Get-AutopilotDiagnostics.ps1 -online`
3. Client: `%windir%\debug\netsetup.log`
4. ODJ Connector Server: EventViewer logs (within 2 hours of client logs)

## Scenario 8: Clean Slate Testing Procedure
> 来源: ado-wiki-Autopilot-HAADJ-User-Driven.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Wipe device from Endpoint.microsoft.com
2. Delete from Endpoint.microsoft.com
3. Delete from local AD Autopilot container (if HAADJ)
4. Delete serial number from Autopilot Devices Blade + Sync
5. Delete associated Azure AD device(s) from portal.azure.com
6. Re-import hardware hash CSV
7. Wait for Profile status = Assigned + run Sync

## Scenario 9: Known Errors
> 来源: ado-wiki-Autopilot-HAADJ-User-Driven.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Error 80070774: "Assigned User" feature causes HAADJ Autopilot to fail
- "Timed Out waiting for ODJ blob": verify Domain Join profile group membership; try assigning to All Devices temporarily
- "Fix your Account": non-Federated tenant with SkipUSEResp, wait 30-40 min or re-authenticate

## Escalation
- Teams channel: Autopilot SME Discussion
- Contact: IntuneAutopilotSMEs@microsoft.com

## Scenario 10: Prerequisites
> 来源: ado-wiki-Autopilot-v2-Device-Preparation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Windows 11 version 23H2 with KB5035942 or later, or Windows 11 version 22H2 with KB5035942 or later.
- Microsoft Entra ID. Only Microsoft Entra join is supported.
- Targeted devices must **not** be registered or added as a Windows Autopilot device. If a device is registered, the Windows Autopilot profile takes precedence.
- Have device security group with Intune Provisioning Client configured as group owner
- RBAC permissions:
  - Device configuration permissions for configuring/managing policies
  - Enrollment programs > Enrollment time device membership assignment
  - Organization > Read for accessing reports

## Not Supported
- Enrollment status page
- Registration (will be replaced with device association)
- Apps that require Managed installer policy (coming later, supported since 2603)
- Dynamic grouping during OOBE provisioning
- Custom compliance scripts during OOBE provisioning (coming later)

## Autopilot vs Autopilot Device Prep Comparison

|  |Autopilot|Autopilot device prep|
|--|--|--|
|Supported modes|Multiple scenarios|User-driven only|
|Join type|Entra joined or Hybrid|Entra joined only|
|Registration required|Yes|None|
|Apps during OOBE|Any number|Up to 10 selected (LOB, Win32, WinGet) + 10 PS scripts|
|Reporting|Not real-time, AP registered only|Near real-time, more data, more accurate|

## Best Practices
- Have device security group with Intune Provisioning Client configured as group owner
- Policy and apps assigned to the device security group
- 1 device security group needs to be added to the Device preparation policy
- Dynamic and nested groups not supported

## Scenario 11: Troubleshooting Steps
> 来源: ado-wiki-Autopilot-v2-Device-Preparation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Ensure prerequisites are met (Windows 11 version, enrollment type, device security group, RBAC permissions)
2. Review the device preparation profile settings (apps/scripts selection, timeout value, custom error message)
3. Monitor device provisioning status in the new deployment report (near real-time)
4. Collect diagnostics logs from the device or remotely from Intune

## Scenario 12: Kusto Diagnostic Queries
> 来源: ado-wiki-Autopilot-v2-Device-Preparation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Check AP-DP Eligibility:**
```kql
let deviceId = "<IntuneDeviceId>";
let lookback = ago(7d);
CheckAutopilotV2EligibilityForDevice(lookback, deviceId)
```
`[来源: ado-wiki-Autopilot-v2-Device-Preparation.md]`
Eligibility criteria:
1. OS version supports AutopilotV2
2. Device is not pre-registered with Autopilot service (no ZTD ID)
3. Entra ID joined enrollment type
4. User-based enrollment
5. Device is enrolling during OOBE
6. Device preparation profile is properly configured with a device group

**Check Which Profile Was Applied:**
```kql
let deviceId = "<IntuneDeviceId>";
let lookback = ago(7d);
GetDevicePrepProfileAppliedToDevice(lookback, deviceId)
```
`[来源: ado-wiki-Autopilot-v2-Device-Preparation.md]`

**Check Profile Assignments for Effective Group (run from Assist 365 Kusto Explorer):**
```kql
let currentTenantId = '<AccountId>';
let effectiveGroupId = "<EGM ID from above query>";
let GetDevicePrepProfileAssignmentsForEG = (effectiveGroupId: string) {
    cluster('qrybkradxus01pe.westus2.kusto.windows.net').database('qrybkradxglobaldb').SortedECStore_Snapshot
    | where EffectiveGroupId == effectiveGroupId
    | union cluster('qrybkradxeu01pe.northeurope.kusto.windows.net').database('qrybkradxglobaldb').SortedECStore_Snapshot
    | where EffectiveGroupId == effectiveGroupId
    | where PolicyType == 36
    | where AccountId == currentTenantId
    | project ScaleUnitName, AccountId, SortedPolicyConfigurations
};
GetDevicePrepProfileAssignmentsForEG(effectiveGroupId)
```
`[来源: ado-wiki-Autopilot-v2-Device-Preparation.md]`

## Scoping Questions
- Is this a new Autopilot deployment?
- What type of Autopilot deployment is being used?
- Is there an error message generated? If yes, exact text and when it appears?
- Is this happening on a physical device or a virtual machine?
- What is the UPN of the affected user?
- What device, model, OS Version, serial number is impacted?
- Was the deployment working before? If so, when did the problem start and what changed?
- What is the name of the affected Autopilot deployment profile and targeted group?

**NOTE**: Every time a device needs to be re-enrolled with Autopilot it must be reset using Intune Wipe (not VM revert).

## Support Boundaries
- AAD Device objects/dynamic groups issues → consult AAD Account management team
- Generic OOBE/setup issues before Tenant login → consult Windows Devices and Deployment (D&D) team
- Authentication issues during enrollment → consult AAD Authentication team

## Scenario 13: Known Issues
> 来源: ado-wiki-Autopilot-v2-Device-Preparation.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Device stuck at 100% during OOBE** — Manual restart needed. Fix in progress.
2. **AppID f1346770 displays as "Intune Autopilot ConfidentialClient"** — Cosmetic only, same AppID is correct.
3. **User reaches desktop without apps** — Conflict between AP-DP User account type (Standard user) and Entra ID Local admin settings (Selected/None). Workaround: set AP-DP to Administrator or set Entra ID to All.
4. **Managed installer conflict** — Prior to 2603 service release, managed installer policy conflicted with app installs during AP-DP. Fixed in 2603+.
5. **Dependency/supersedence shown as "Dependent"** — Known reporting display issue.
6. **App uninstall intent shows "Installed"** — Known reporting display issue when uninstall completes successfully.

## Engineering TSG Reference
- https://eng.ms/docs/microsoft-security/management/intune/microsoft-intune/intune/services/autopilot/scenarios/apv2
- Access: https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1525635/Access-to-Engineering-Wiki

## Scenario 14: Requirements
> 来源: ado-wiki-ESP-Install-Updates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Windows 11 version 22H2 or later
- ESP profile with "Install Windows Updates" enabled
- WUfB policies (Update Ring or Autopatch Groups) must be applied before update scan

## Scenario 15: Supported Scenarios
> 来源: ado-wiki-ESP-Install-Updates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Autopilot Device Preparation
- Self-Deployment Mode

## Key CSP Settings
- Update/DeferQualityUpdatesPeriodInDays
- Update/PauseQualityUpdatesStartTime
- Update/ExcludeWUDriversInQualityUpdate
- Update/SetPolicyDrivenUpdateSourceForQualityUpdates

## Support Boundaries
- **Intune**: Settings configuration, policy delivery, deferral/pause behavior
- **Windows** (Collaboration): NDUP package installation, incorrect updates, install timing

## Scenario 16: Troubleshooting
> 来源: ado-wiki-ESP-Install-Updates.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Check InstallQualityUpdates setting in Kusto: `DeviceManagementProvider | where message has("isInstallQualityUpdatesEnabled")`
2. ESP logs: Shift+F10 during OOBE → `mdmdiagnosticstool.exe -area "DeviceProvisioning;Autopilot" -cab C:\Logs\AutopilotLogs.cab`
3. NDUP logs: Aka.ms/QualityUpdatesAutopilotPrP (CollectNDUPLogs.zip for ICM/Windows Collaboration)

## FAQ
- ESP profiles after 2508 default to Yes for Install Windows Updates
- Only Quality Updates supported on ESP; other updates apply post-provisioning
- QUs install after ESP page; ESP Timeout not impacted
- Expedited updates not applied during provisioning
- GCCH supported; pre-registered device support may not be available

## Scenario 17: Connection Types
> 来源: mslearn-entra-device-registration-autopilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Microsoft Entra registered
- Microsoft Entra joined
- Microsoft Entra hybrid joined

## Scenario 18: Troubleshooter Tool
> 来源: mslearn-entra-device-registration-autopilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Use the [Device Registration Troubleshooter Tool](https://aka.ms/DevRegTS):
- Device health status **Pending** → option 5
- Missing Primary Refresh Token (PRT) → option 6

Reference: [Microsoft Entra device identity documentation](https://learn.microsoft.com/en-us/azure/active-directory/devices)

## Windows Autopilot

## Scenario 19: CSV Import
> 来源: mslearn-entra-device-registration-autopilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Intune admin center → Devices > Windows > Windows enrollment > Devices (under Autopilot) > Import
2. Generate CSV with PowerShell:
```powershell
Install-Script -Name Get-WindowsAutoPilotInfo
Get-WindowsAutoPilotInfo.ps1 -OutputFile autopilot.csv
```

## Scenario 20: Key Log Files
> 来源: mslearn-entra-device-registration-autopilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `microsoft-windows-devicemanagement-enterprise-diagnostics-provider-admin.evtx`
- `microsoft-windows-moderndeployment-diagnostics-provider-autopilot.evtx`
- `MdmDiagReport_RegistryDump.reg`
- `TpmHliInfo_Output.txt`
- `microsoft-windows-provisioning-diagnostics-provider-admin.evtx` — ESP events (app failures, timeouts)

## Scenario 21: ESP-related Event Examples
> 来源: mslearn-entra-device-registration-autopilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `AutoPilotGetOobeSettingsOverride succeeded: OOBE setting = AUTOPILOT_OOBE_SETTINGS_AAD_JOIN_ONLY`
- `UnifiedEnrollment_ProvisioningProgressPage_ApplicationsFailed`
- `UnifiedEnrollment_ProvisioningProgressPage_DeviceConfigurationTimeOut`

## Scenario 22: Further Resources
> 来源: mslearn-entra-device-registration-autopilot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- [Troubleshooting overview](https://learn.microsoft.com/en-us/windows/deployment/windows-autopilot/troubleshooting)
- [Troubleshooting Windows Autopilot (level 300/400)](https://techcommunity.microsoft.com/t5/windows-blog-archive/troubleshooting-windows-autopilot-level-300-400/ba-p/706512)

## Scenario 23: User-initiated
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- ESP timeout → user selects **Collect logs** → copy to USB

## Scenario 24: Command Prompt (Shift+F10 during OOBE on non-S mode)
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **User-driven Autopilot**: `mdmdiagnosticstool.exe -area Autopilot -cab <path>`
- **Self-deploying / White glove**: `mdmdiagnosticstool.exe -area Autopilot;TPM -cab <path>`
- **Runtime provisioning (1809+)**: `mdmdiagnosticstool.exe -area DeviceProvisioning -cab <path>`

## Scenario 25: Key file in cab
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `MDMDiagReport_RegistryDump.Reg` — contains all MDM enrollment registry keys

## Registry Keys

## Scenario 26: ESP Settings
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

`HKLM\SOFTWARE\Microsoft\Enrollments\{EnrollmentGUID}\FirstSync`

## Scenario 27: Skip ESP phases via CSP
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `SkipUserStatusPage` = 0xffffffff → skip account setup
- `SkipDeviceStatusPage` = 0xffffffff → skip device setup

## Scenario 28: EnrollmentStatusTracking (Win10 1903+)
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

`HKLM\SOFTWARE\Microsoft\Windows\Autopilot\EnrollmentStatusTracking`

Subkeys:
- **Device\DevicePreparation** — SideCar (IME) install state: 1=NotInstalled, 2=NotRequired, 3=Completed, 4=Error
- **Device\Setup** — Win32 app tracking, TrackingPoliciesCreated, per-app InstallationState
- **ESPTrackingInfo\Diagnostics** — LOB/MSI apps, Wi-Fi profiles, SCEP certs, Store apps status with timestamps
- **{User_SID}** — account setup phase Win32 apps (user context)

## Scenario 29: App InstallationState values
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. NotInstalled
2. InProgress
3. Completed
4. Error (ESP stops installing further apps)

## Diagnosing with PowerShell
```powershell
Install-Script -Name Get-AutopilotDiagnostics -Force
Get-AutopilotDiagnostics -CABFile <pathToOutputCabFile>
```

## Unexpected Reboots
- Check Event Viewer for `RebootRequiredURI` (event value 2800)
- Log shows which URI triggered reboot (e.g., Update/ManagePreviewBuilds)

## Scenario 30: Apps not tracked by ESP
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Apps must be assigned as **required** to device (device setup) or user (account setup) groups
- Must enable "Block device use until all apps installed" or include in blocking list
- Device-context apps must have no user-context applicability rules

## Scenario 31: ESP showing for non-Autopilot enrollments
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- ESP shows for all enrollment methods including co-management and first user login
- Use **Only show page to devices provisioned by OOBE** to limit

## Scenario 32: Disable user ESP portion
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

OMA-URI: `./Vendor/MSFT/DMClient/Provider/MS DM Server/FirstSyncStatus/SkipUserStatusPage`
Data type: Boolean, Value: True

## Scenario 33: App Deployment Timeout
> 来源: mslearn-esp-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Common cause: timeout value too short for number of required apps (e.g., 5 min for 15+ apps)
- Check `InstallationState` = 4 (Error) in registry → review IME log for cause

## Scenario 34: Enrollment Time Grouping (ETG)
> 来源: onenote-apv2-client-troubleshooting-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- ETG (Just In Time Configuration) ensures devices auto-join the security group during enrollment
- **Critical**: The **Intune Provisioning Client** service principal must be set as the **owner** of the ETG security group
- If missing, create via PowerShell:
  ```powershell
  Import-Module AzureAD
  Connect-AzureAD
  New-AzureADServicePrincipal -AppId f1346770-5b25-470b-88bd-d5744ab7952c
  ```

## Scenario 35: Verify ETG Assignment via Graph API
> 来源: onenote-apv2-client-troubleshooting-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
GET https://graph.microsoft.com/beta/deviceManagement/configurationPolicies('{policyId}')/retrieveJustInTimeConfiguration
```
Expected response: `targetType: "entraSecurityGroup"` with target group ID.

## Scenario 36: Kusto Functions
> 来源: onenote-apv2-client-troubleshooting-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
// Check APv2 eligibility
CheckAutopilotV2EligibilityForDevice(ago(10d), "<device-id>")

// Profile CRUD events
GetDevicePrepProfileCRUDEventsFromPolicyId(ago(1d), "<policy-id>")

// ETG events
GetDevicePrepProfileETGEventsForPolicy(ago(1d), "<policy-id>")

// Assignment events
GetDevicePrepProfileAssignEventsForPolicy(ago(1d), "<policy-id>")

// All APv2 events for device
GetAutopilotV2EnrollmentEventsForDevice(ago(7d), "<IntuneDeviceId>")

// Events by activity ID (on enrollment failure)
GetAutopilotV2EnrollmentEventsForActivityId(ago(7d), "<EnrollmentActivityId>")

// Sidecar install status
GetAutopilotV2SidecarInstallEventsForDevice(ago(7d), "<IntuneDeviceId>")

// Device Prep Page status
GetAutopilotV2ProvisioningEventsForDevice(ago(7d), "<device-id>")
| where FunctionName == "GetDevicePrepPageStatus"
```

## Scenario 37: Provider Execution Order
> 来源: onenote-apv2-client-troubleshooting-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Standard User Provider** (optional) — removes user from Administrators group
2. **SLDM Provider** — installs LOB apps and policies (policies do not block)
3. **Scripts Provider** — PowerShell platform scripts only (not remediation)
4. **Apps Provider** — Win32 apps and WinGet apps

## Scenario 38: AutopilotDDSZTDFile.json
> 来源: onenote-apv2-client-troubleshooting-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

For APv2, this file will NOT contain profile data. Instead shows:
```json
{"ErrorCode": 807, "ErrorReason": "ZtdDeviceIsNotRegistered"}
```
This is expected — APv2 does not use classic Autopilot registration.

## Scenario 39: Key Registry Paths
> 来源: onenote-apv2-client-troubleshooting-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Device Preparation CSP:**
```
HKLM\SOFTWARE\Microsoft\Provisioning\AutopilotSettings\DevicePreparation
  PageEnabled     (DWORD) — 0=disabled, 1=enabled
  PageSettings    (string) — JSON with timeout/error settings
  PageStatus      (DWORD) — 0=Disabled, 1=Enabled, 2=InProgress, 3=ExitOnSuccess, 4=ExitOnFailure
  PageErrorPhase  (string)
  PageErrorCode   (HRESULT)
  PageErrorDetails (string)
```

**Bootstrapper Agent Manifest:**
```
HKLM\...\DevicePreparation\BootstrapperAgent
  ExecutionContext — JSON manifest with policyId, providers[], batchList[]
```

**MDM Alert Hint:**
```
HKLM\SOFTWARE\Microsoft\Provisioning\AutopilotSettings
  AutopilotDevicePrepHint (DWORD)
```

**SLDM Provider State:**
```
HKLM\...\DevicePreparation\MDMProvider
  Status, Progress (JSON with workloadState: 0=NotStarted, 1=InProgress, 2=Completed, 3=Failed)
```

## Scenario 40: DevicePrepHint Values (from IME DLL)
> 来源: onenote-apv2-client-troubleshooting-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Value | State |
|-------|-------|
| 0 | NotStarted |
| 1 | Initializing |
| 2 | InProgress |
| 3 | Completed |
| 4 | ErrorOccurred |
| 5 | RebootRequired |
| 6 | Canceled |

## Scenario 41: Event Logs
> 来源: onenote-apv2-client-troubleshooting-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Microsoft-Windows-Shell-Core** — search for "DevicePrepPage"
- **Microsoft-Autopilot-BootstrapperAgent** — SLDM provider events

## Scenario 42: IME Logs
> 来源: onenote-apv2-client-troubleshooting-deep-dive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

IME detects APv2 mode by checking DevicePrepHintValue:
```
[APv2] Checking if device is in APv2 mode.
[APv2] Found DevicePrepHintValue = 2.
[APv2] Device is in APv2 mode: True.
```

Known Issues: https://learn.microsoft.com/en-us/autopilot/device-preparation/known-issues

## Scenario 43: Configuration Steps
> 来源: onenote-autopilot-azure-ad-branding.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Sign into Azure Portal as tenant admin
2. Navigate to: Azure Active Directory > Company branding > Edit
3. Configure the following assets:

| Asset | Dimensions | Format | Max Size |
|-------|-----------|--------|----------|
| Square logo | 240x240 px | PNG/JPG | 10KB |
| Banner logo | 280x60 px | PNG/JPG | 10KB |
| Background image | 1920x1080 px | PNG/JPG | 300KB |

## Screen Mapping

- **(1)(5)** Square logo image (240x240) → shown on username and password screens
- **(2)(3)** Organization name → set in Azure AD tenant **Properties > Name** (not company branding)
- **(4)(6)** Sign-in page text (up to 256 chars) → shown below login fields

## Scenario 44: Key ETW Providers
> 来源: onenote-autopilot-etw-trace-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Provider | What It Shows |
|----------|---------------|
| `Microsoft.Windows.Shell.CloudExperienceHost.Common` | Autopilot-specific events (ZTD-prefixed) |
| `Microsoft.Windows.Shell.CloudDomainJoin.Client` | AAD join, MDM enrollment, Autopilot detection |

## Scenario 45: Key Event Names to Search
> 来源: onenote-autopilot-etw-trace-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Event | Field | Meaning |
|-------|-------|---------|
| `GetCloudAssignedAadServerData` (win:Stop) | `wasConfigured` | `True` = device registered with Autopilot |
| `LogTenantId` (win:Info) | Tenant GUID | Azure AD tenant ID |
| `LogTenantDomain` (win:Info) | Domain name | e.g. contoso.onmicrosoft.com |
| `GetCloudAssignedForceStandardUser` (win:Stop) | `forceStandardUser` | Standard user enforcement |
| `CDJUIError` | Error code | AAD join or MDM enrollment error (e.g. 801C0003, 80180018) |

## Scenario 46: Profile Settings Bitmap
> 来源: onenote-autopilot-etw-trace-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

The `ZTP_GetConfigActivity` events show profile settings as a bitmap in Field 2:

| Bit | Value | Setting |
|-----|-------|---------|
| 0 | 1 | SkipCortanaOptIn |
| 1 | 2 | OobeUserNotLocalAdmin |
| 2 | 4 | SkipExpressSettings |
| 3 | 8 | SkipOemRegistration |
| 4 | 16 (0x10) | SkipEula |

Example: All enabled except OobeUserNotLocalAdmin = 1+4+8+16 = 29

## Alternative Analysis Tools

- Microsoft Network Analyzer (formerly Network Monitor)
- `TRACEFMT.EXE` — converts ETL to XML/text

## Reference

- [AutoPilot.wprp download](https://msdnshared.blob.core.windows.net/media/2017/12/AutoPilot.zip)
- SkipCortanaOptIn/SkipExpressSettings added in Win10 1703, SkipEula in 1709

## Scenario 47: 1. Language/Region/Keyboard Selection
> 来源: onenote-autopilot-v1-troubleshooting-100-200.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- If standard OOBE screens don't appear → bad OS image, unexpected unattend.xml, or OOBE was partially completed
- Fix: Start from scratch or reset OS from Settings app
- Tip: Shift-F10 during OOBE to open command prompt for hardware hash capture

## Scenario 48: 2. Network Connection
> 来源: onenote-autopilot-v1-troubleshooting-100-200.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Issue | Cause |
|---|---|
| No network adapters detected | OOBE short-circuits → creates local account |
| Proxy issues | Non-auto-discoverable (no WPAD) or user-auth required |
| Cert-based WiFi fails | No certificates available yet during OOBE |
| Firewall blocks | Windows thinks no internet path |

- Shift-F10 → IPCONFIG, NSLOOKUP, PING for basic network troubleshooting

## Scenario 49: 3. Azure AD Authentication / Custom Branding
> 来源: onenote-autopilot-v1-troubleshooting-100-200.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

If device not showing custom branding:
- Device not registered with AutoPilot → re-capture hardware hash and upload
- Hardware changes (e.g., motherboard swap) can change hardware hash
- Azure AD Premium license required for branding (doesn't need to be assigned to user for this step)
- Company branding not configured in Azure AD

## Scenario 50: 4. Azure AD Join
> 来源: onenote-autopilot-v1-troubleshooting-100-200.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Error | Cause |
|---|---|
| 801C0003 "Something went wrong" | User not allowed to join devices to Azure AD |
| 801C0003 | User reached maximum device join limit |

- Configure at: Azure AD > Device settings > Users may join devices to Azure AD

## Scenario 51: 5. Automatic MDM Enrollment
> 来源: onenote-autopilot-v1-troubleshooting-100-200.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Error | Cause |
|---|---|
| No error, but not managed | Auto MDM enrollment not enabled in Azure AD |
| No error, but not managed | User not in MDM auto-enrollment group |
| 80180018 "Something went wrong" | User lacks Azure AD Premium license |
| 80180018 | User lacks Intune license |
| Enrollment limit reached | Check enrollment restrictions (1-15 devices) |

## Scenario 52: 6. Automatic Logon
> 来源: onenote-autopilot-v1-troubleshooting-100-200.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Usually works since credentials already validated
- After logon: pulsing status screen → app installation → MDM progress → desktop

## Verification
Settings > Accounts > Access work or school > "Connected to {tenant}" > Info
- Shows MDM enrollment details, server URLs, applied policies
- Can generate HTML diagnostics report or manually sync

## Scenario 53: Error Code Lookup
> 来源: onenote-autopilot-v1-troubleshooting-100-200.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

See: https://learn.microsoft.com/en-us/windows/client-management/mdm/azure-active-directory-integration-with-mdm

## Scenario 54: Kusto Queries
> 来源: onenote-autopilot-v2-client-side-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Query Function | Purpose |
|---|---|
| `CheckAutopilotV2EligibilityForDevice(ago(10d), "<device-id>")` | Check APv2 eligibility |
| `GetDevicePrepProfileCRUDEventsFromPolicyId(lookback, policyId)` | Profile CRUD operations |
| `GetDevicePrepProfileETGEventsForPolicy(lookback, policyId)` | ETG events |
| `GetDevicePrepProfileAssignEventsForPolicy(lookback, policyId)` | Assignment events |
| `GetAutopilotV2EnrollmentEventsForDevice(lookback, deviceId)` | All APv2 events for device |
| `GetAutopilotV2EnrollmentEventsForActivityId(lookback, activityId)` | Events by activity ID |
| `GetAutopilotV2SidecarInstallEventsForDevice(lookback, deviceId)` | Sidecar install status |
| `GetAutopilotV2ProvisioningEventsForDevice(lookback, deviceId)` | DevicePrepPage status |

## Scenario 55: DevicePrepHintValue States (from IME DLL)
> 来源: onenote-autopilot-v2-client-side-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Value | State |
|---|---|
| 0 | NotStarted |
| 1 | Initializing |
| 2 | InProgress |
| 3 | Completed |
| 4 | ErrorOccurred |
| 5 | RebootRequired |
| 6 | Canceled |

## Scenario 56: IME Log Analysis
> 来源: onenote-autopilot-v2-client-side-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Look for APv2 mode detection:
```
[APv2] Checking if device is in APv2 mode.
[APv2] Found DevicePrepHintValue = 2.
[APv2] Device is in APv2 mode: True.
```

## Scenario 57: Kusto Queries (Service-Side)
> 来源: onenote-autopilot-v2-client-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
// Check APv2 eligibility
CheckAutopilotV2EligibilityForDevice(ago(10d), "<device-id>")

// CRUD events for a policy
let policyId = "<policy-id>";
GetDevicePrepProfileCRUDEventsFromPolicyId(ago(1d), policyId)

// ETG events for a policy
let policyId = "<policy-id>";
GetDevicePrepProfileETGEventsForPolicy(ago(1d), policyId)

// Assignment events for a policy
let policyId = "<policy-id>";
GetDevicePrepProfileAssignEventsForPolicy(ago(1d), policyId)

// Enrollment events
GetAutopilotV2EnrollmentEventsForDevice(ago(7d), "<deviceId>")

// Sidecar install status
GetAutopilotV2SidecarInstallEventsForDevice(ago(7d), "<deviceId>")

// DevicePrepPage status
GetAutopilotV2ProvisioningEventsForDevice(ago(7d), "<deviceId>")
| where FunctionName == "GetDevicePrepPageStatus"
```

## Scenario 58: Providers Execution Order
> 来源: onenote-autopilot-v2-client-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Standard user provider** (optional) - removes user from Administrators
2. **SLDM provider** - LOB apps + policies
3. **Scripts provider** - PowerShell platform scripts
4. **Apps provider** - Win32 + WinGet apps

## Scenario 59: Device Preparation CSP Registry
> 来源: onenote-autopilot-v2-client-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Path: `HKLM\software\microsoft\provisioning\AutopilotSettings\DevicePreparation`

| Key | Values |
|-----|--------|
| PageEnabled | 0=Disabled, 1=Enabled |
| PageSettings | JSON with timeout/error message/allowSkip/allowDiagnostics |
| PageStatus | 0=Disabled, 1=Enabled, 2=InProgress, 3=ExitOnSuccess, 4=ExitOnFailure |
| PageErrorPhase | Enum for error phase |
| PageErrorCode | HRESULT |
| PageErrorDetails | Error message string |

## Scenario 60: Orchestrator ExecutionContext
> 来源: onenote-autopilot-v2-client-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Path: `HKLM\...\DevicePreparation\BootstrapperAgent\ExecutionContext`
Contains JSON manifest with providers, batches, and actions.

## Scenario 61: MDM Alert Hint
> 来源: onenote-autopilot-v2-client-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Path: `HKLM\software\microsoft\provisioning\AutopilotSettings`
- `AutopilotDevicePrepHint` registry key read by OMADM client

## Scenario 62: SLDM Provider State
> 来源: onenote-autopilot-v2-client-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Path: `HKLM\...\DevicePreparation\MDMProvider`
- workloadState enum: 0=NotStarted, 1=InProgress, 2=Completed, 3=Failed
- Status: "Provisioning Complete" when done

## Scenario 63: Step 1: Register Intune Provisioning Client (21v Required)
> 来源: onenote-autopilot-v2-setup.md | 适用: Mooncake ✅

### 排查步骤

In 21Vianet (China) environments, the SP must be manually registered:

```powershell
Install-Module AzureAD
Connect-AzureAD -AzureEnvironmentName AzureChinaCloud
New-AzureADServicePrincipal -AppId f1346770-5b25-470b-88bd-d5744ab7952c
```

This SP (Intune Provisioning Client) is required for Enrollment Time Grouping (ETG) to work.

## Scenario 64: Get Device Info via PowerShell
> 来源: onenote-autopilot-v2-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```powershell
Get-WmiObject -Class Win32_ComputerSystem | FL Manufacturer, Model
Get-WmiObject -Class Win32_BIOS | FL SerialNumber
```

## Scenario 65: Upload
> 来源: onenote-autopilot-v2-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Open Intune portal > Devices > Enrollment
2. Click Corporate device identifiers > Add > Upload CSV file
3. Select "Manufacturer, model and serial number (Windows only)"

**Warning**: Identifiers take time to propagate. Enrolling too fast with personal enrollment blocked leads to error **80180014**.

## Scenario 66: Step 3: Create Security Group for ETG
> 来源: onenote-autopilot-v2-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Open portal > Groups > All groups > New group
2. Group type: Security
3. Membership type: Assigned
4. **Owners**: Add **Intune Provisioning Client** (f1346770-5b25-470b-88bd-d5744ab7952c)

The device is automatically added to this group during enrollment.

## Scenario 67: Step 4: Create Device Preparation Profile
> 来源: onenote-autopilot-v2-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Intune portal > Devices > Enrollment > Device preparation policies
2. Click Create
3. Select device security group (from Step 3)
4. Configure deployment settings
5. Add applications (up to 10, optional)
6. Add PowerShell scripts (up to 10, optional)
7. Assign to user group

## Scenario 68: Enrollment Flow
> 来源: onenote-autopilot-v2-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Device boots to OOBE > select "Work or school"
2. Enter corporate credentials
3. No organization branding shown (by design - V2 gets profile after login)
4. Device preparation page shows installation progress
5. Configure Windows Hello for Business (if policies exist)

## Scenario 69: Monitor Results
> 来源: onenote-autopilot-v2-setup.md | 适用: Mooncake ✅

### 排查步骤

- Check device is member of the ETG security group
- Devices > Monitor > Windows Autopilot device preparation deployments

## 21v Portal URLs
- Intune admin center: https://intune.microsoftonline.cn
- Groups: via Intune portal or Entra portal

## Scenario 70: Conflict Resolution: V1 vs V2
> 来源: onenote-autopilot-v2-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Device has ZTDID (Autopilot registered) -> V1 applies, V2 not applicable
- Device preparation profile assigned + device unregistered -> V2 applies, ESP not applicable
- No device preparation profile -> ESP profile applies

## Kusto Queries (Intune cluster)
- `CheckAutopilotV2EligibilityForDevice(lookback, deviceId)` - Check eligibility
- `GetDevicePrepProfileAppliedToDevice(lookback, deviceId)` - Check profile assignment
- `GetAutopilotV2EnrollmentEventsForDevice(lookback, deviceId)` - Enrollment events
- `GetAutopilotV2ScenarioResultEventsForDevice(lookback, deviceId)` - Provider status + page status
- `GetAutopilotV2SidecarInstallEventsForDevice(lookback, deviceId)` - Sidecar install
- `GetAutopilotV2CheckinSessionInfoForDevice(lookback, deviceId)` - Checkin alerts + throttling
- `GetAutopilotV2ProvisioningEventsForDevice(lookback, deviceId)` - Provisioning events
- `GetDeviceMembershipUpdaterResultsForDevice(lookback, deviceId)` - ETG group assignment

## Eligibility Checks
1. OS version supports AutopilotV2
2. Device not pre-registered with Autopilot service (no ZTDID)
3. Entra ID joined enrollment type
4. User-based enrollment
5. Device enrolling during OOBE
6. Device preparation profile configured with device group (ETG)

## Provisioning Flow
Providers execute in order:
1. **Standard user provider** - removes user from Administrators (optional)
2. **SLDM provider** - LOB apps and policies (no fail-fast, retries until timeout)
3. **Scripts provider** - PowerShell platform scripts (not remediation scripts)
4. **Apps provider** - Win32 and WinGet apps

Apps/scripts provisioned = intersection of:
- Required assignments to device security group (ETG) - must be device context
- Apps/scripts selected in device preparation profile (+ dependencies)

## Checkin Alerts
- **Bootstrapping**: Install Sidecar agent only (15-min timeout)
- **ExecutingProvisioning**: Install LOB apps + policies
- **ProvisioningComplete**: LOB done, scripts/Win32 still installing
- **deviceprepresult**: Final results

## Client-Side Investigation

## Scenario 71: Client Components
> 来源: onenote-autopilot-v2-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Device preparation page in OOBE CloudExperienceHost
2. Orchestrator in Sidecar agent (protocol handler invoked by wmansvc)
3. Glue layer in wmansvc NT service (EMM agnostic)
4. Providers hosted in Sidecar
5. OMADM client for DeviceCheckin service

## Scenario 72: ETW Logs
> 来源: onenote-autopilot-v2-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Device prep page: `Microsoft-Windows-Shell-Core` channel, search "DevicePrepPage"
- Orchestrator + SLDM: `Microsoft-Autopilot-BootstrapperAgent` channel
- Scripts + Apps: Sidecar log file, search "APv2"

## Scenario 73: Device Provisioning Entity
> 来源: onenote-autopilot-v2-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Endpoint: Scale unit, ODataProvider
- Address: DeviceProvisioningService
- Id: `DeviceProvisionings(AccountId=<id>, DeviceId=<id>)`
- Key fields: EffectiveGroupId, DeviceSecurityGroups, DevicePreparationProfileId, DeploymentStatus, MdmProvisioningStatus, AllowedAppIds, ScriptProvisioningStatus, AppProvisioningStatus

## Scenario 74: Device Membership Entity
> 来源: onenote-autopilot-v2-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Address: DeviceProvisioningService
- Id: `DeviceMemberships(AccountId=<id>, DeviceId=<id>)`

## Scenario 75: Profile Entity
> 来源: onenote-autopilot-v2-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Address: StatelessEnrollmentMTConfigurationService
- Id: `ECDeviceManagementPolicies(GuidKey1=guid'<accountId>', GuidKey2=guid'<policyId>')`
- Settings stored as key/value property bag

## Scenario 76: Profile Assignment Entity
> 来源: onenote-autopilot-v2-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Address: StatelessEnrollmentMTConfigurationService
- Query: `SortedPolicyConfigurationsStores?$filter=GuidKey1 eq guid'<accountId>' and GuidKey2 eq guid'<effectiveGroupId>' and StringKey2 eq '36'`

## Scenario 77: Phase 1: Device Preparation (Fixed Tasks)
> 来源: onenote-esp-phases-overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Securing your hardware** - TPM attestation for self-deploying mode; no-op for other scenarios
- **Joining your organization's network** - Azure AD join process (no-op for Hybrid AADJ)
- **Registering for mobile management** - MDM enrollment (auto-triggered by AADJ; pre-loaded for HAADJ)
- **Preparing for mobile management** - Waiting for policy list (security, certs, network, apps). May require installing additional policy providers.

## Scenario 78: Phase 2: Device Setup (Device-targeted Policies)
> 来源: onenote-esp-phases-overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Security policies** - Always shows "0 of 1" -> "1 of 1" (dummy tracking, not real security policy count)
- **Certificates** - SCEP-issued device certificates
- **Network connections** - Wi-Fi profiles targeted to device
- **Apps** - MSI LOB apps, Win32 apps (via IME), Office 365 ProPlus. IME itself counted in app count. Can be filtered in ESP settings. With white glove + assigned user, user-targeted device-context apps also included.

## Between Phases: First Sign-In Animation (FSIA)
Re-sign-in required when:
- Device reboots during Device Setup (credentials not stored across reboots)
- Hybrid Azure AD Join (first: AAD auth, second: AD auth)

## Scenario 79: Phase 3: Account Setup (User-targeted Policies)
> 来源: onenote-esp-phases-overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Joining your organization's network** - For HAADJ: waiting for AAD Connect sync (30-min cycle). If sync completes before user signs in, everything is ready.
- **Security policies** - Same dummy "1 of 1" tracking
- **Certificates** - SCEP user certificates. Caution: WHfB certs may block ESP if WHfB not yet set up.
- **Network connections** - User-targeted Wi-Fi profiles
- **Apps** - MSI, Win32, Office 365, UWP apps (user-targeted required). PowerShell scripts NOT tracked.

## Key Notes
- ESP can be filtered to track only a subset of targeted apps
- Untracked apps still install, just not shown in progress
- PowerShell scripts are not tracked by ESP in any phase

## Scenario 80: Phase 1: Device Preparation
> 来源: onenote-esp-phases-steps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Fixed set of tasks before ESP can track device provisioning.

| Step | What It Does |
|---|---|
| Securing your hardware | Self-deploying mode: TPM attestation for Azure AD join. Other scenarios: does nothing. |
| Joining your organization's network | AAD Join: tracks AAD join process. AD Join: does nothing (join occurs before ESP). |
| Registering for mobile management | AAD Join: does nothing (AAD join triggers auto MDM enrollment). HAADJ: enrollment occurs before ESP. |
| Preparing for mobile management | Waits for policy list from MDM. May need to install additional policy providers. Can take a while. |

## Scenario 81: Phase 2: Device Setup
> 来源: onenote-esp-phases-steps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

All device-targeted policies delivered and some tracked.

| Step | What It Tracks |
|---|---|
| Security policies | Always shows "0 of 1" then "1 of 1" - not actually tracking real security policies. |
| Certificates | SCEP-issued certificates targeted to the device. |
| Network connections | Wi-Fi profiles targeted to the device. |
| Apps | MSI LOB apps, Win32 apps (via IME), Office 365 ProPlus. IME MSI itself is counted. PowerShell scripts NOT tracked. White glove: also includes user-targeted device-context apps. |

## Scenario 82: Between Phases: First Sign-In Animation (FSIA)
> 来源: onenote-esp-phases-steps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Shows blue shades animation
- Manual sign-in required if: device rebooted during Device Setup, or performing HAADJ

## Scenario 83: Phase 3: Account Setup
> 来源: onenote-esp-phases-steps.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

All user-targeted policies delivered and some tracked.

| Step | What It Tracks |
|---|---|
| Joining your organization's network | HAADJ: waits for AAD Connect device sync (runs every 30 min). AAD Join: does nothing. |
| Security policies | Same dummy tracking as Device Setup phase. |
| Certificates | SCEP certificates targeted to the user. WARNING: WHfB certs may cause blocking. |
| Network connections | Wi-Fi profiles targeted to the user. |
| Apps | User-targeted required apps: MSI, Win32, O365 ProPlus, UWP apps. PowerShell scripts NOT tracked. |

## Key Notes
- ESP can filter which apps to track (subset of targeted required apps)
- Untracked apps still install, just not shown in ESP
- PowerShell scripts are never tracked by ESP
- WHfB is set up AFTER ESP completes; WHfB cert tracking can cause ESP failure
- Credentials cannot be stored across reboots (security)
- HAADJ requires two sign-ins (one for AAD, one for AD)

## Source
Based on analysis from oofhours.com ESP internals documentation.

## Scenario 84: Known Limitations
> 来源: onenote-windows-autopilot-branding.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Special/accented characters in tenant Name may not display properly
- User name hint from AAD is ignored in Autopilot OOBE
- Sign-in page text wraps on username screen but not on password screen
- ADFS users see web view for password (ADFS has its own customization)

## Related
- Intune Terms and Conditions can also be shown during MDM enrollment
- [Paint.NET](https://www.microsoft.com/en-us/store/p/paintnet/9nbhcs1lx4r0) for bitmap resizing

---

## Kusto 查询参考

### 查询 1: Autopilot V2 设备资格检查

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

CheckAutopilotV2EligibilityForDevice(lookback, deviceId)
```
`[来源: autopilot.md]`

### 查询 2: Autopilot V2 注册事件

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2EnrollmentEventsForDevice(lookback, deviceId)
```
`[来源: autopilot.md]`

### 查询 3: Autopilot V2 预配事件

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2ProvisioningEventsForDevice(lookback, deviceId)
```
`[来源: autopilot.md]`

### 查询 4: Autopilot V2 签入会话

```kql
let intuneDeviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2CheckinSessionInfoForDevice(lookback, intuneDeviceId)
```
`[来源: autopilot.md]`

### 查询 5: Autopilot V2 Sidecar 安装事件

```kql
let intuneDeviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2SidecarInstallEventsForDevice(lookback, intuneDeviceId)
```
`[来源: autopilot.md]`

### 查询 6: Autopilot V2 场景结果

```kql
let deviceId = '{deviceId}';
let lookback = ago(7d);

GetAutopilotV2ScenarioResultEventsForDevice(lookback, deviceId)
```
`[来源: autopilot.md]`

### 查询 7: 直接查询场景健康状态

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
`[来源: autopilot.md]`

### 查询 8: Autopilot 通用事件查询

```kql
IntuneEvent
| where env_time > ago(7d)
| where DeviceId == '{deviceId}' or ActivityId == '{deviceId}'
| where * contains "autopilot"
| project env_time, EventUniqueName, ServiceName, ComponentName, 
    ColMetadata, Col1, Col2, Col3, Col4, Message
| order by env_time asc
```
`[来源: autopilot.md]`

### Kusto Functions

```kql
// Check APv2 eligibility
CheckAutopilotV2EligibilityForDevice(ago(10d), "<device-id>")

// Profile CRUD events
GetDevicePrepProfileCRUDEventsFromPolicyId(ago(1d), "<policy-id>")

// ETG events
GetDevicePrepProfileETGEventsForPolicy(ago(1d), "<policy-id>")

// Assignment events
GetDevicePrepProfileAssignEventsForPolicy(ago(1d), "<policy-id>")

// All APv2 events for device
GetAutopilotV2EnrollmentEventsForDevice(ago(7d), "<IntuneDeviceId>")

// Events by activity ID (on enrollment failure)
GetAutopilotV2EnrollmentEventsForActivityId(ago(7d), "<EnrollmentActivityId>")

// Sidecar install status
GetAutopilotV2SidecarInstallEventsForDevice(ago(7d), "<IntuneDeviceId>")

// Device Prep Page status
GetAutopilotV2ProvisioningEventsForDevice(ago(7d), "<device-id>")
| where FunctionName == "GetDevicePrepPageStatus"
```
`[来源: onenote-apv2-client-troubleshooting-deep-dive.md]`

### Kusto Queries (Service-Side)

```kql
// Check APv2 eligibility
CheckAutopilotV2EligibilityForDevice(ago(10d), "<device-id>")

// CRUD events for a policy
let policyId = "<policy-id>";
GetDevicePrepProfileCRUDEventsFromPolicyId(ago(1d), policyId)

// ETG events for a policy
let policyId = "<policy-id>";
GetDevicePrepProfileETGEventsForPolicy(ago(1d), policyId)

// Assignment events for a policy
let policyId = "<policy-id>";
GetDevicePrepProfileAssignEventsForPolicy(ago(1d), policyId)

// Enrollment events
GetAutopilotV2EnrollmentEventsForDevice(ago(7d), "<deviceId>")

// Sidecar install status
GetAutopilotV2SidecarInstallEventsForDevice(ago(7d), "<deviceId>")

// DevicePrepPage status
GetAutopilotV2ProvisioningEventsForDevice(ago(7d), "<deviceId>")
| where FunctionName == "GetDevicePrepPageStatus"
```
`[来源: onenote-autopilot-v2-client-troubleshooting.md]`

---

## 判断逻辑参考

### Autopilot vs Autopilot Device Prep Comparison

|  |Autopilot|Autopilot device prep|
|--|--|--|
|Supported modes|Multiple scenarios|User-driven only|
|Join type|Entra joined or Hybrid|Entra joined only|
|Registration required|Yes|None|
|Apps during OOBE|Any number|Up to 10 selected (LOB, Win32, WinGet) + 10 PS scripts|
|Reporting|Not real-time, AP registered only|Near real-time, more data, more accurate|

### Key Event Names to Search

| Event | Field | Meaning |
|-------|-------|---------|
| `GetCloudAssignedAadServerData` (win:Stop) | `wasConfigured` | `True` = device registered with Autopilot |
| `LogTenantId` (win:Info) | Tenant GUID | Azure AD tenant ID |
| `LogTenantDomain` (win:Info) | Domain name | e.g. contoso.onmicrosoft.com |
| `GetCloudAssignedForceStandardUser` (win:Stop) | `forceStandardUser` | Standard user enforcement |
| `CDJUIError` | Error code | AAD join or MDM enrollment error (e.g. 801C0003, 80180018) |

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
