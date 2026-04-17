# Intune Win32 应用部署与 IME — 排查工作流

**来源草稿**: ado-wiki-Intune-SideCar.md, ado-wiki-Win32-App-Deployment.md, ado-wiki-a-Time-Zone-Mismatch-End-of-Shift.md, ado-wiki-b-Enrollment-Time-Grouping.md, onenote-deploy-ps-as-win32.md, onenote-deploy-wechat-win32-app.md, onenote-deploy-wechat-win32.md, onenote-ime-log-interpreter-tool.md, onenote-macos-sidecar-agent-workflow.md, onenote-petri-ime-tool.md, onenote-win32-chocolatey-ime-tsg.md, onenote-win32-deployment-troubleshooting.md, onenote-win32-ime-ps-tsg.md, onenote-win32-ime-sample-logs.md
**Kusto 引用**: app-install.md, ime-extension.md
**场景数**: 57
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > Windows TSG > Win32_IME_PowerShell Script TSG`
- `Intune > How To > Windows`

## Scenario 1: How Win32 App Deployment Works
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Deployed via Intune Management Extension (IME/SideCar). The deployment pipeline:

## Scenario 2: 1. App Metadata Processing
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- SideCar runs app check-in on schedule
- Retrieves metadata (App policies) and runs detection before starting content download
- Uses `IntuneManagementExtension` content folder for metadata
- Key logs: `IntuneManagementExtension.log`, `AppWorkload.log`

**User vs Device Context**:
- User Session: AAD user session found → user context
- No AAD User: context set to System, `Userid = 00000000-0000-0000-0000-000000000000`

## Scenario 3: 2. Detection, Applicability and Requirements
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**ActionProcessor** initiates detection and applicability for all apps:
- **DetectionActionHandler**: Runs detection rules (Registry=0, MsiProductCode=1, FilePath=2, PowershellScripts=3)
- **ApplicabilityHandler**: Evaluates intent (NotTargeted=0, RequiredInstall=1, RequiredUninstall=2, AvailableInstall=3, AvailableUninstall=4)
- Requirements: OS architecture, minimum Windows version, disk space, memory, CPU

## Scenario 4: 3. Download and Unzip
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Content downloaded to "Incoming" folder → moved to "Staging" for hash verification and unzip
- Uses Delivery Optimization (DO) for download
- Hash validation → decryption → unzip to `C:\Windows\IMECache\{appId}`
- Staging content cleaned up after successful unzip

## Scenario 5: 4. Installation
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Final detection before install (confirm still not detected)
- **ExecutionActionHandler** and **Win32AppExecutionExecutor** run installation
- Install command executed from `C:\Windows\IMECache\{appId}` directory
- Exit code evaluated against ReturnCodes definition

## Scenario 6: 5. Post-Installation
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Final detection to confirm installation
- Compliance state message generated and sent
- Registry updated: `HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\SideCarPolicies\StatusServiceReports`

## Kusto Queries

## Scenario 7: Device Application Install Attempts
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
ApplicationInstallAttemptsByDeviceId('<deviceid>', datetime('2030-12-02 00:53'), datetime('2030-12-03 09:53'), 1000)
```
`[来源: ado-wiki-Win32-App-Deployment.md]`

## Scenario 8: Application Enforcement Status
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
DeviceManagementProvider
| where env_time > datetime(2025-09-08 17:00:18) and env_time < datetime(2025-09-08 17:08:19)
| where ActivityId == "<deviceid>"
| where appPolicyId contains 'Application_<appId>'
| where (EventId == 5767 or EventId == 5766)
| project userId, appPolicyId, EventId, TaskName, enforcementType, enforcementState, ECErrorCode=errorCode, EventMessage, deviceAssignmentCount, accountId, ActivityId, RelatedActivityId, env_time
```
`[来源: ado-wiki-Win32-App-Deployment.md]`

EventId filters:
| EventId | TaskName |
|---------|----------|
| 5767 | DeviceManagementProviderAppEnforcementStatusEvent |
| 5766 | DeviceManagementProviderAppEnforcementAttemptEvent |

## Scenario 9: Find Device Activity for Specific App
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
let _start = datetime(2030-09-16 14:00:00);
let _end = datetime(2030-09-16 14:00:20);
DeviceManagementProvider
| where env_time between (_start.._end)
| where message has "<AppName>"
| project details, aadDeviceId, env_time, ActivityId, deviceId, userId, accountId, accountContextId, message, scenarioInstanceId, Level
```
`[来源: ado-wiki-Win32-App-Deployment.md]`

## Diagnostic Data Collection

Use Intune ODC or `mdmdiagnosticstool`.

## Scenario 10: IME Logs
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Location: `C:\ProgramData\Microsoft\IntuneManagementExtension\Logs`
- AgentExecutor.log
- AppWorkload.log
- IntuneManagementExtension.log

## Scenario 11: Registry (App Deployment Tracking)
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Applicability/Install Status: `HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\SideCarPolicies\StatusServiceReports\<UserGUID>\<AppID>`
- Exit Code/Intent/Reboot Status: `HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\Win32Apps\<UserGUID>\<AppID>`

## Scenario 12: Win32 Apps in Windows S Mode
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Windows 10 S mode only runs Store apps by default. Use **S mode supplemental policy** in Intune to enable Win32 app installation on S mode devices.

## Scenario 13: PowerShell Script Installer
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Custom installation scripts allow:
- Custom logging/events
- Stop/start services, modify registry
- Prompt users (close apps, provide license key)

**Limitations**: Only one application per script (app chain not supported).

## Constants Reference

## Scenario 14: EnforcementState
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Range | State |
|-------|-------|
| 6000-6999 | Not Attempted |
| 5000-5999 | Error |
| 4000-4999 | Unknown |
| 2000-2999 | In Progress |
| 1000-1999 | Success |

## Scenario 15: ComplianceState
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Installed=1, NotInstalled=2, Error=4, Unknown=5, Cleanup=100

## Scenario 16: DesiredState
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

None=0, NotPresent=1, Present=2, Unknown=3, Available=4

## Scenario 17: Error Code Reference
> 来源: ado-wiki-Win32-App-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Error Code | Description |
|------------|-------------|
| -2016345060 | App not detected after installation completed successfully |
| -2016345059 | App still detected after uninstallation completed successfully |
| -2016345061 | Detection rules not present |
| -2016344908 | Remote server required authentication but credentials not accepted |
| -2016344909 | Remote content not found at server |
| -2016330908 | App install has failed |
| -2016344211 | User cancelled the operation |
| -2016344209 | Insufficient free memory |
| -2016344210 | File is corrupted |
| -2147009281 | No valid license or sideloading policy |
| -2016344196 | App license failed to install |

## Scenario 18: Scenario 1: Initial contact for customers outside time zone/region
> 来源: ado-wiki-a-Time-Zone-Mismatch-End-of-Shift.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Cases must be assigned and ownership taken within SLA regardless of customer region
2. Case owner must contact customer by phone first, then follow up with email
3. If unable to reach customer within 1 business day and customer is outside your region → send transfer email (template below)
4. Document in case notes (pre-scoping task with CCE Transfer template): attempted phone and email contact; customer in X time zone; sending back to queue for in-region support
5. Change Internal Title to: `"[REGION] callback required, customer unresponsive on initial contact, next available engineer"`
6. Send email to **IntunePROSup@microsoft.com** and cc **casemail@microsoft.com** with CCE Transfer template (include case number in subject)
7. In-region engineer picks up the case and continues to resolution

**Transfer Email Template (initial contact):**
```
Dear <Customer Name>,

I've attempted to reach you at <time>. Since I'm unable to reach you and I see that you are located in <location>, I will be sending your case to our <region> team, who will be able to contact you during your normal business hours. If for any reason you'd prefer to continue working on your cases right now, please reply back and I'll gladly assist.

Thank you,
```

## Scenario 19: Scenario 2: Customer requests to continue with in-region engineer
> 来源: ado-wiki-a-Time-Zone-Mismatch-End-of-Shift.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Inform customer you will transfer to appropriate team; next available engineer will pick up within 1 business day
2. Thoroughly document case (new task with CCE Transfer template), change Internal Title to: `"[REGION] callback request, customer has requested to work with engineer within their time zone/region, next available engineer"`
3. Send email to **IntunePROSup@microsoft.com** and cc **casemail@microsoft.com**
4. In-region engineer takes ownership and works case to resolution

**Transfer Email Template (customer request):**
```
Dear <Customer Name>,

Per our conversation, you've requested to work with an engineer during your normal business hours. I've updated your case notes with what we've completed to date as well as my suggested action plan. I will be transferring your case to our <region> team where the next available engineer will take ownership of your case and contact you. Please allow up to one business day for this to occur.

Thank you,
```

---

## 3. General Callback Requests (End of Shift)

1. Create a customer contact task with title: `Customer callback required | <date> | <Next callback range> <UTC time> | <SR Title>`
2. Fill out the [CCE Transfer template](https://sharepoint.partners.extranet.microsoft.com/sites/Onestop/BPM/Pages/Specials/TemplateDisplay.aspx?Template=24)
3. Dispatch TASK to **Microsoft Intune PRO support**
4. Send email to **IntunePROSup@microsoft.com** and cc **casemail@microsoft.com** indicating task transferred to Intune PRO Support Queue due to end of shift
5. Assisting engineer takes ownership and documents interactions
6. Original case owner follows up next day

> **Note:** Contact your TL/TA if you have any questions about this process.

---

## Appendix: Team Working Hours

| Team | Hours (PST) |
|---|---|
| Tek Experts BC | 5:00 AM – 5:00 PM, Mon–Sun |
| CVG India BC | 5:00 PM – 9:30 AM, Mon–Sun |
| CVG India Pod | 12:00 AM – 4:30 PM, Mon–Fri |
| Mindtree Pod | 7:00 AM – 3:00 PM, Mon–Fri |
| Mindtree BC | 1:00 AM – 3:00 PM, Mon–Fri |

## Distribution Lists

All teams are contained within: **IntunePROSup@microsoft.com**

| Team | DLs |
|---|---|
| CVG India | CVGIntuneIndiaALL@Microsoft.com; CVGIntuneIndiaMGMT@Microsoft.com; CVGIntuneIndiaTL@Microsoft.com; CVGIntuneIndiaTA@Microsoft.com |
| Mindtree | MTIntuneAll@Microsoft.com; MTIntuneTL@Microsoft.com; MTIntuneTA@Microsoft.com; MTIntuneMGMT@Microsoft.com |
| Tek Systems | TekIntuneAll@Microsoft.com; TekIntuneTL@Microsoft.com; TekIntuneTA@Microsoft.com; TekIntuneMGMT@Microsoft.com |

## Scenario 20: Security Group Requirements
> 来源: ado-wiki-b-Enrollment-Time-Grouping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Device security group must meet ALL of the following:
- **Static group** (not dynamic)
- **Not assignable to groups**
- **Scoped to the admin** configuring the policy
- **"Intune Provisioning Client" must be an owner** of the group

> Note: Use Azure Support Center (ASC) to view Entra group ownership — not available in Assist 365.

If "Intune Provisioning Client" is not visible in tenant, see [Create a Device Group](https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/user-driven/entra-join-device-group#create-a-device-group).

## Support Boundaries

ETG is an Intune feature using static Entra groups. Group owner, properties, configuration, membership, usage belong to Intune.

---

## Scenario 21: Scenario 1: Error updating device security group in ETG profile (SG Configuration Error)
> 来源: ado-wiki-b-Enrollment-Time-Grouping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Step 1 — Query DCv2 frontend logs:**
```kusto
IntuneEvent
| where SourceNamespace == "IntunePE"
| where ComponentName == "DCV2DeviceManagementController"
| where FileName startswith "DeviceManagementConfigurationJustInTimeAssignmentPolicyController"
| where AccountId == "EnterAccountId"
| where TraceLevel <= 3
| project env_time, ActivityId, AccountId, FunctionName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```
> Note: Client not set as SG owner returns "SG not found".

**Step 2 — Query DeviceMembership controller (all ETG policies):**
```kusto
let IncludeFunctionNames = datatable (environments: string) [
"SetDeviceMembershipConfigAsync",
"GetDeviceMembershipConfigAsync",
"ClearDeviceMembershipConfigAsync",
"GetSecurityGroupAsync",
"IsAutopilotFPAOwnerOfSecurityGroupAsync",
"IsValidSecurityGroupAsync",
"ValidateSecurityGroupsAsync"];
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time >= ago(1d)
| where ActivityId == "Enter ActivityId"
| where ServiceName == "DeviceProvisioningService"
| where FunctionName in (IncludeFunctionNames)
| project env_time, ActivityId, AccountId, ComponentName, FunctionName, EventUniqueName, Message, Col2, Col3, Col4, Col5, Col6
```

---

## Scenario 22: Scenario 2: ETG not reducing policy application latency (ETG Enablement)
> 来源: ado-wiki-b-Enrollment-Time-Grouping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Step 1 — Query DeviceMembership setup:**
```kusto
let IncludeFunctionNames = datatable (environments: string) [
"SetDeviceMembershipAsync",
"GetVirtualTargetPropertiesAsync",
"GetDeviceDirectoryAsync",
"SetDeviceEgmAsync"];
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time >= ago(1d)
| where ActivityId == "Enter ActivityId"
| where ServiceName == "DeviceProvisioningService"
| where FunctionName in (IncludeFunctionNames)
| project env_time, ActivityId, AccountId, DeviceId, ComponentName, FunctionName, EventUniqueName, Message, Col2, Col3, Col4, Col5, Col6
```
> Note: VTP (VirtualTargetProperties) Not Found = SG not configured for that profile.

**Step 2 — Query Effective Group for profile (if EGM was set):**
```kusto
union cluster("https://qrybkradxeu01pe.northeurope.kusto.windows.net").database("qrybkradxglobaldb").EffectiveGroupMembershipEffectiveGroupService_Snapshot,
cluster("https://qrybkradxus01pe.westus2.kusto.windows.net").database("qrybkradxglobaldb").EffectiveGroupMembershipEffectiveGroupService_Snapshot
| where TargetId == "d968e8cf-0b83-4acb-bb88-d563ebb8d112"
| project EffectiveGroupId
```
> AllDevicesVirtualGroupId = `adadadad-808e-44e2-905a-0b7873a8a531`

---

## Scenario 23: Scenario 3: Devices not added to ETG security group membership (DeviceMembershipUpdater)
> 来源: ado-wiki-b-Enrollment-Time-Grouping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Pre-Step**: Starting in **2510** release, check **Devices > Monitor > Enrollment time grouping failures** report (up to 20 min delay, requires `Microsoft.Intune/ManagedDevices/Read` permission).

**Step 1 — Query DeviceMembershipUpdater:**
```kusto
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time >= ago(1d)
| where ServiceName == "DeviceProvisioningService"
| where ComponentName endswith "DeviceMembershipUpdater"
| where DeviceId == "a63a2cc7-944a-47e8-ab51-9ef4ee8f3e86"
| project env_time, ActivityId, AccountId, DeviceId, FunctionName, EventUniqueName, Message, Col1, Col2, Col3, Col4, Col5, Col6
```
> Failure to update SG membership causes policy tattoo removal after 72hr GnT grace period.

---

## Scenario 24: Scenario 4: Devices not added after Entra identity change
> 来源: ado-wiki-b-Enrollment-Time-Grouping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**Step 1 — Query for identity change processing:**
```kusto
let IncludeFunctionNames = datatable (environments: string) [
"ProcessDeviceAadDeviceIdChangeAsync"];
IntuneEvent
| where SourceNamespace == "IntunePE"
| where DeviceId == "5aa0bafd-b417-444a-8c23-3bf3c5b420b3"
| where ServiceName == "DeviceProvisioningService"
| where FunctionName in (IncludeFunctionNames)
| project env_time, ActivityId, AccountId, DeviceId, FunctionName, EventUniqueName, Message, Col2, Col3, Col4, Col5, Col6
```

---

## Scenario 25: FAQ and Known Issues
> 来源: ado-wiki-b-Enrollment-Time-Grouping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**ETG SG changes apply to future enrollments only** — previously enrolled devices are not impacted.

**SGSv2 grace period**: 72 hours. If device not added to SG within 72hr, policy tattoo removal occurs.

**Remediation if wrong EG enrolled:**
- During grace period: Delete device in Intune → re-enroll
- After grace period: Update SG memberships in Entra

**SG membership update retry timeout**: 1 hour.

**If SetupDeviceMembership fails before EG is calculated**: Enrollment proceeds (not blocked). Background retry is planned.

**Device SG membership update reporting**: Report in development for notifying admin when update fails.

---

## Getting Help with Cases

- ETG cases don't always require Autopilot SME — scope the case based on the actual problem
- App deployment issue on ETG device → troubleshoot as app deployment case
- Device not added to ETG group → troubleshoot group membership, not Autopilot

**Escalations**: If Kusto queries can't explain the flow, RFC/ICM via standard process with TA/PTA.

## Training Resources

- [2 Intune Readiness Sessions on ETG (Overview + Deep-Dive Troubleshooting)](https://microsoft.sharepoint.com/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/Forms/AllItems.aspx?id=%2Fteams%2FLearnCSSIntune%2FIntuneFeaturesDeepDiveArchives%2F2407%20%2D%20Enrollment%20Time%20Grouping)
- [ETG Q&A Session with CXE](https://microsoft.sharepoint.com/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/Forms/AllItems.aspx?id=%2Fteams%2FLearnCSSIntune%2FIntuneFeaturesDeepDiveArchives%2F2407%20%2D%20Enrollment%20Time%20Grouping%2FETG%20Q%26A%20with%20CXE)

## Scenario 26: Steps
> 来源: onenote-deploy-ps-as-win32.md | 适用: Mooncake ✅

### 排查步骤

1. Put scripts into a folder; create another empty folder for output
2. Package script using IntuneWinAppUtil:
   ```
   IntuneWinAppUtil.exe -c C:\script\folder -s C:\script\folder\YourScript.ps1 -o C:\script\output
   ```
   Download: [Win32 Content Prep Tool](https://learn.microsoft.com/en-us/mem/intune/apps/apps-win32-prepare#convert-the-win32-app-content)
3. Create Win32 app in Intune portal with the .intunewin package
4. Configure detection rule (e.g., scheduled task check, registry key, file existence)

## Detection Script Example
```powershell
$cspTask = Get-ScheduledTask -TaskName "Autologoff"
if ($cspTask) {
    $settings = $cspTask.Settings
    if ($cspTask.Settings.StartWhenAvailable -eq $false) {
        Write-Output "App is installed"
        return 1
    } else {
        return -1
    }
} else {
    return -1
}
```

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Win32_IME_PowerShell Script TSG

## Scenario 27: Step 1: Package with Win32 Content Prep Tool
> 来源: onenote-deploy-wechat-win32-app.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Download [Microsoft Win32 Content Prep Tool](https://go.microsoft.com/fwlink/?linkid=2065730)
2. Run the packaging command:
```powershell
IntuneWinAppUtil -c c:\testapp -s c:\testapp\WeChatSetup.exe -o c:\testappoutput\WeChatSetup -q
```
- `-c`: Source folder containing the setup file
- `-s`: Setup file path
- `-o`: Output folder for `.intunewin` file
- `-q`: Quiet mode

If `IntuneWinAppUtil` is not in PATH:
```powershell
.\IntuneWinAppUtil.exe -c c:\testapp -s c:\testapp\WeChatSetup.exe -o c:\testappoutput\WeChatSetup -q
```

## Scenario 28: Step 2: Deploy via Intune Portal
> 来源: onenote-deploy-wechat-win32-app.md | 适用: Mooncake ✅

### 排查步骤

1. Log in to Microsoft Endpoint Manager admin center
2. Navigate to **Apps** → **Add app** → **Win32 app**
3. Upload the `.intunewin` package
4. Configure install/uninstall commands:

| Setting | Value |
|---------|-------|
| Silent Install | `WeChatSetup.exe /S` |
| Silent Uninstall (32-bit) | `"%ProgramFiles%\Tencent\WeChat\Uninstall.exe" /S` |
| Silent Uninstall (64-bit) | `"%ProgramFiles(x86)%\Tencent\WeChat\Uninstall.exe" /S` |

## Key Notes
- The app must support silent install (`/S` switch) — check with the vendor
- This method applies to any Windows desktop app that supports silent installation
- For other Chinese apps (DingTalk, WPS, etc.), modify the paths and switches accordingly

## 21v Applicability
Fully applicable to 21Vianet environment. Common scenario for China mainland customers needing to deploy Chinese apps.

---
*Source: OneNote Mooncake POD Support Notebook/.../How to Deploy wechat via Win32.md*

## Scenario 29: Prerequisites
> 来源: onenote-deploy-wechat-win32.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Microsoft Win32 Content Prep Tool: https://go.microsoft.com/fwlink/?linkid=2065730
- The app's EXE installer (e.g. WeChatSetup.exe)
- Knowledge of the app's silent install/uninstall switches

## Scenario 30: 1. Convert EXE to .intunewin
> 来源: onenote-deploy-wechat-win32.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Run via PowerShell:
```powershell
IntuneWinAppUtil -c c:\testapp -s c:\testapp\WeChatSetup.exe -o c:\testappoutput\WeChatSetup -q
```
If `IntuneWinAppUtil` is not in PATH:
```powershell
.\IntuneWinAppUtil.exe -c c:\testapp -s c:\testapp\WeChatSetup.exe -o c:\testappoutput\WeChatSetup -q
```

## Scenario 31: 2. Upload to Intune
> 来源: onenote-deploy-wechat-win32.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Microsoft Endpoint admin center > Apps > Add app > Win32 app > Upload the .intunewin package.

## Scenario 32: 3. WeChat-specific Configuration
> 来源: onenote-deploy-wechat-win32.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Setting | Value |
|---------|-------|
| Silent Install | `WeChatSetup.exe /S` |
| Silent Uninstall (32-bit) | `"%ProgramFiles%\Tencent\WeChat\Uninstall.exe" /S` |
| Silent Uninstall (64-bit) | `"%ProgramFiles(x86)%\Tencent\WeChat\Uninstall.exe" /S` |

## Scenario 33: 4. Detection Rule
> 来源: onenote-deploy-wechat-win32.md | 适用: Mooncake ✅

### 排查步骤

Configure file-based or registry-based detection rule for the installed app.

## General Guidance
For other China-market apps, the same process applies but you must:
1. Confirm the app supports fully silent install (`/S`, `/silent`, `/quiet`, etc.)
2. Contact the app vendor if silent install switch is unknown
3. Test the silent install/uninstall commands before deploying to production

## Source
- OneNote: Mooncake POD Support Notebook > Intune > How To > Windows

## Scenario 34: Agent Installation (3 Phases)
> 来源: onenote-macos-sidecar-agent-workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Admin targets sidecar policy** to a group of devices — triggers implicit assignment of sidecar agent
2. **MDM check-in** — sidecar SCEP certificate installed (used to authenticate with sidecar gateway)
3. **Same check-in** — SLDM service retrieves latest agent app version and installs the sidecar agent on device

## Scenario 35: Log Collection Workflow
> 来源: onenote-macos-sidecar-agent-workflow.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Admin creates/uploads/targets a **shell script policy** that generates log files
2. Targeted device checks in and **executes the script**
3. Admin creates a **log collection request** for files generated by script
4. Device checks in again, receives request, **uploads files to Azure Storage**
5. Admin **downloads files** via Ibiza portal

## Accessing Log Collection

Navigate to: Devices > macOS > Shell scripts > [relevant script] > Device status > [device] > Collect logs

## Related

- Shell script troubleshooting: see intune-onenote-093
- Log collection tool: [IntuneMacODC](https://github.com/markstan/IntuneMacODC)
- Agent installed at: /Library/Intune/Microsoft Intune Agent.app

## Scenario 36: Installation
> 来源: onenote-petri-ime-tool.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```powershell
Save-Script Get-IntuneManagementExtensionDiagnostics -Path ./
```
GitHub: https://github.com/petripaavola/Get-IntuneManagementExtensionDiagnostics

## Usage

## Scenario 37: Analyze Log File
> 来源: onenote-petri-ime-tool.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```powershell
.\Get-IntuneManagementExtensionDiagnostics.ps1 -LogFile "C:\Temp\Logs"
```
Generates HTML timeline; hover over app entries to see detection rules.

## Scenario 38: Interactive Log Viewer
> 来源: onenote-petri-ime-tool.md | 适用: Mooncake ✅

### 排查步骤

```powershell
.\Get-IntuneManagementExtensionDiagnostics.ps1 -ShowLogViewerUI
```
Provides detailed, friendly information view.

## Capabilities
- Win32 app deployment timeline analysis
- PowerShell script execution tracking
- ESP (Enrollment Status Page) tracking
- Detection rule visualization on hover

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Win32_IME_PowerShell Script TSG

## Scenario 39: Part 1-3: Intune Service / IME Side
> 来源: onenote-win32-chocolatey-ime-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Check IME logs for download, unzip, and installer process creation
- If IME successfully creates the installer process, the issue is on the Chocolatey side

## Scenario 40: Part 4: Chocolatey Side
> 来源: onenote-win32-chocolatey-ime-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Check Chocolatey logs: `C:\ProgramData\chocolatey\logs`
- Check Chocolatey installation cache for failed packages: `C:\ProgramData\chocolatey\lib-bad`
- If IME unzipped successfully and the installer was triggered, the package will appear under `lib-bad` on failure

## Key Log Locations

| Component | Log Path |
|---|---|
| IME | `C:\ProgramData\Microsoft\IntuneManagementExtension\Logs\IntuneManagementExtension.log` |
| Chocolatey | `C:\ProgramData\chocolatey\logs` |
| Failed packages | `C:\ProgramData\chocolatey\lib-bad` |
| Staging | `C:\Program Files (x86)\Microsoft Intune Management Extension\Content\Staging` |

## Scenario 41: Troubleshooting Flow
> 来源: onenote-win32-chocolatey-ime-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Check IME log for app download and unzip status
2. Confirm installer process creation in IME log
3. If installer process created successfully -> check Chocolatey logs
4. If package found in `lib-bad` -> Chocolatey installation failed, review Chocolatey error
5. If no installer process -> IME-side issue, check download/unzip errors

## Scenario 42: Enrollment Type Verification
> 来源: onenote-win32-deployment-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

IME only supports these enrollment types:
| Type | Description |
|------|-------------|
| 4 | AAD joined auto-enrollment |
| 9 | Hybrid AAD joined |
| 10 | Co-management enrolled |

**NOT supported**: AAD registered (Type 1), GPO enrollment.

Check: Sign in as Azure AD account on client desktop. Verify EnrollmentType in registry or device properties.

## Scenario 43: Path 1: IME Not Installed
> 来源: onenote-win32-deployment-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

If Intune Management Extension is not present on the device:

## Scenario 44: For MSI Apps (OMA-DM path)
> 来源: onenote-win32-deployment-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

MSI deployment uses EnterpriseDesktopAppManagement CSP. Check registry:

```
HKLM\SOFTWARE\Microsoft\EnterpriseDesktopAppManagement\<SID>\<MSI-ProductCode>
```

Key values:
- **CurrentDownloadUrl**: URL to the MSI install file
- **EnforcementRetryCount**: Max retry attempts
- **EnforcementRetryIndex**: Current retry number
- **EnforcementRetryInterval**: Minutes between retries
- **EnforcementStartTime**: Start time
- **EnforcementTimeout**: Install timeout (minutes)
- **LastError**: Error from last execution

## Scenario 45: Kusto: Check IME Agent Status
> 来源: onenote-win32-deployment-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceManagementProvider
| where env_time >= ago(24h)
| where * contains "<deviceId>"
| where * contains "IntuneWindowsAgent"
| project env_time, name, applicablilityState, reportComplianceState
| summarize max(env_time) by name, applicablilityState, reportComplianceState
```

## Scenario 46: Path 2: IME Installed
> 来源: onenote-win32-deployment-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Log location: `C:\ProgramData\Microsoft\IntuneManagement Extension\Logs`

Use **IME Log Interpreter** tool for structured analysis: [GitHub Releases](https://github.com/mikaelfun/Intune-IME-Project/releases)

## Scenario 47: Kusto: Get IME Events
> 来源: onenote-win32-deployment-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == "SideCar"
| where ActivityId == "<deviceId>"
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ComponentName, RelatedActivityId, SessionId
```

## Scenario 48: Kusto: Get Policy Details
> 来源: onenote-win32-deployment-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == "SideCar"
| where ActivityId == "<deviceId>"
| where Col3 contains "PolicyId"
| extend Policy = split(Col3, ',')
| extend PolicyId = split(Policy[0],':')[1]
| extend PolicyType = split(Policy[1],':')[1]
| extend PolicyVersion = split(Policy[2],':')[1]
| extend PolicyBody = split(Policy[5],'":\"')[1]
| project PolicyId, PolicyType, PolicyVersion, PolicyBody
```

## Related

- OMA-DM Protocol: https://docs.microsoft.com/en-us/windows/client-management/mdm/oma-dm-protocol-support
- EnterpriseDesktopAppManagement CSP: https://docs.microsoft.com/en-us/windows/client-management/mdm/enterprisedesktopappmanagement-csp

## Scenario 49: 1. Download Server URL
> 来源: onenote-win32-ime-sample-logs.md | 适用: Mooncake ✅

### 排查步骤

```
[Location Service] Intune DownloadServiceUrl is [https://fef.cnpasu01.manage.microsoftonline.cn/TrafficGateway/TrafficRoutingService/DownloadService]
```
- 21v (Mooncake) endpoint: `cnpasu01.manage.microsoftonline.cn`

## Scenario 50: 2. IME Cache Location
> 来源: onenote-win32-ime-sample-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
[Win32App] SetCurrentDirectory: C:\Windows\IMECache\{appId}_1
```
- Packages are cached temporarily during installation
- Cleaned up after installation: `Cleaning up staged content C:\Windows\IMECache\{appId}_1`

## Scenario 51: 3. Check-in Interval
> 来源: onenote-win32-ime-sample-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
[Win32App][CheckinIntervalManager] UpdateTimerIntervalForNextCheckin. Current interval of timer is 3480000
```
- IME check interval: ~3480000ms / 1000 / 60 = **~58 minutes**
- This is NOT the same as device check-in interval
- Timer alternates between 3480000 and 3720000

## Scenario 52: 4. Policy Recognition
> 来源: onenote-win32-ime-sample-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
Get policies = [{"Id":"{appId}","Name":"appName","Version":1,"Intent":3,...}]
```
- `Intent: 3` = Required assignment
- Contains: DetectionRule, InstallCommandLine, UninstallCommandLine, RequirementRules

## Scenario 53: 5. Detection Rule Flow
> 来源: onenote-win32-ime-sample-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
[Win32App] ProcessDetectionRules starts
[Win32App] DetectionType 2  (File-based detection)
[Win32App] Path doesn't exists: C:\...\WeMeetApp.exe applicationDetected: False
```
- DetectionType 2 = File/folder detection
- Checks path existence, then reports NotInstalled/Installed

## Scenario 54: 6. Download Progress
> 来源: onenote-win32-ime-sample-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
[StatusService] Downloading app (id = {appId}, name appName) via CDN, bytes 4096/232851456
```
- Shows CDN download progress with byte count

## Scenario 55: 7. Installation
> 来源: onenote-win32-ime-sample-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
[Win32App] ===Step=== Execute retry 0
[Win32App] ===Step=== InstallBehavior RegularWin32App, Intent 3
TencentMeeting.exe /SilentInstall=0
```
- Shows install command execution
- ReturnCodes mapping: 0=Success, 1707=Success, 3010=SoftReboot, 1641=HardReboot, 1618=Retry

## Scenario 56: 8. Post-Install Detection
> 来源: onenote-win32-ime-sample-logs.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
[Win32App] Checked filePath: C:\...\WeMeetApp.exe, Exists: True, applicationDetected: True
```
- Confirms successful installation via detection rule

## Scenario 57: Troubleshooting Tips
> 来源: onenote-win32-ime-sample-logs.md | 适用: Mooncake ✅

### 排查步骤

- If app stuck in "InProgress": check download progress in logs, CDN latency issues common for China Telecom
- If detection fails after install: verify detection rule path matches actual installation path
- Reboot may be required if return code is 3010 (SoftReboot) or 1641 (HardReboot)

---

## Kusto 查询参考

### 查询 1: 查询设备上部署的所有应用

```kql
DeviceManagementProvider  
| where env_time >= ago(7d)
| where ActivityId == '{deviceId}'
| where (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
    name, ['id'], typeAndCategory, applicablilityState, reportComplianceState, 
    EventMessage, message, env_cloud_name, ActivityId, tenantId, userId, 
    sessionId, relatedActivityId2, appPolicyId, platform, technology, devicePlatformType 
| order by ActivityId, env_time asc
```
`[来源: app-install.md]`

### 查询 2: 查询特定应用部署状态

```kql
DeviceManagementProvider  
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where (['id'] contains '{appId}' or appPolicyId contains '{appId}' 
    or message contains '{appId}' or name contains '{appName}')  
| where (EventId == 5767 or EventId == 5766) 
| project env_time, EventId, TaskName, enforcementType, enforcementState, errorCode, 
    name, ['id'], typeAndCategory, applicablilityState, reportComplianceState, 
    EventMessage, message, env_cloud_name, ActivityId, tenantId, userId, 
    sessionId, relatedActivityId2, appPolicyId, platform, technology, devicePlatformType 
| order by ActivityId, env_time asc
```
`[来源: app-install.md]`

### 查询 3: 查询应用安装日志

```kql
DeviceManagementProvider
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where message contains '{appName}' or EventMessage contains '{appName}'
| project env_time, message, EventMessage, aadDeviceId, ActivityId
```
`[来源: app-install.md]`

### 查询 4: 已安装/未安装应用对比

```kql
let devId='{deviceId}';

DeviceManagementProvider
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(7d) and ActivityId == devId
| where EventId==5786
| project env_time, EventId, Level, name, type=typeAndCategory, compliance=reportComplianceState, EventMessage  
| where type=="AppModel;AppModel" and compliance=="NotInstalled"
| summarize lastNotInstalled=max(env_time) by name 
| join kind= leftouter (
    DeviceManagementProvider
    | where SourceNamespace == "IntuneCNP"
    | where env_time > ago(7d) and ActivityId == devId
    | where EventId==5786
    | project env_time, EventId, Level, name, type=typeAndCategory, compliance=reportComplianceState, EventMessage  
    | where type=="AppModel;AppModel" and compliance=="Installed"
    | summarize 1stInstalled=min(env_time) by name 
) on name 
| project name, lastNotInstalled, 1stInstalled, compliance = iff(isnull(1stInstalled), "NotInstalled", "Installed")
```
`[来源: app-install.md]`

### 查询 5: 应用下载状态查询

```kql
DownloadService
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(1d)
| where EventId in (13796)
| where deviceId == '{deviceId}' 
| project env_time, SourceNamespace, accountId, deviceId, userId, TaskName, 
    EventId, status, platform, statusCode, exception, errorEventId, result, EventMessage
```
`[来源: app-install.md]`

### 查询 6: SideCar (Win32 App) 事件查询

```kql
IntuneEvent
| where env_time >= ago(3d)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, 
    ComponentName, RelatedActivityId, SessionId
```
`[来源: app-install.md]`

### 查询 7: 获取 Win32 App 策略详情

```kql
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| extend Policy = split(Col3, ',')
| extend PolicyId = split(Policy[0],':')[1]
| extend PolicyType = split(Policy[1],':')[1]
| extend PolicyVersion = split(Policy[2],':')[1]
| extend PolicyBody = split(Policy[5],'":\"')[1]
| project PolicyId, PolicyType, PolicyVersion, PolicyBody
```
`[来源: app-install.md]`

### 查询 8: 检查 IME Agent 是否安装

```kql
DeviceManagementProvider
| where env_time >= ago(30d)
| where * contains '{deviceId}'
| where * contains 'IntuneWindowsAgent'
| project env_time, name, applicablilityState, reportComplianceState  
| summarize max(env_time) by name, applicablilityState, reportComplianceState
```
`[来源: app-install.md]`

### 查询 9: 应用下载事件关联查询（DownloadService + IntuneEvent）

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';
let inputAccountId = '{accountId}';
let ApplicationId = '{appId}';

let correlationTable = cluster('intunecn.chinanorth2.kusto.chinacloudapi.cn').database('intune').
IntuneEvent
| where env_time between (starttime..endtime)
| where DeviceId contains deviceid
| where ComponentName == 'DownloadService'
| where EventUniqueName == 'AppRequestCorrelation'
| where AccountId == inputAccountId
| project env_time, env_seqNum, env_cloud_name, env_cloud_role, env_cloud_roleInstance, ApplicationName, BuildVersion, Pid, Tid, ActivityId, RelatedActivityId,
Level = TraceLevel, EventUniqueName, AccountId, ContextId, UserId, DeviceId, ApplicationId = Col1, ContentId = Col2, FileId = Col3, HttpVerb = Col4, cV, Exception = Message;

correlationTable
| summarize by RelatedActivityId, ApplicationId, ContextId
| join (
    DownloadService
    | where env_time between (starttime..endtime) and EventId == 13796
    | where accountId =~ inputAccountId
    | project env_time, env_seqNum, env_cloud_name, env_cloud_role, env_cloud_roleInstance, ApplicationName = I_App,
    BuildVersion = I_BuildVer, Pid, Tid, ActivityId,
    RelatedActivityId = relatedActivityId2, Level, EventUniqueName = TaskName, AccountId = accountId, UserId = userId, DeviceId = deviceId, exceptionType,
    platform, requestedRange, statusCode, bytesDelivered, bytesRequested, timeElapsed, cV, Message = EventMessage
) on RelatedActivityId
| project-away RelatedActivityId1
| order by env_time asc, env_seqNum asc
| summarize MegabytesTransfered = sum(bytesDelivered)/1024/1024 by ApplicationId, AccountId, DeviceId, bin(env_time, 10m)
| order by MegabytesTransfered desc
| limit 1000
```
`[来源: app-install.md]`

### Scenario 1: Error updating device security group in ETG profile (SG Configuration Error)

```kql
IntuneEvent
| where SourceNamespace == "IntunePE"
| where ComponentName == "DCV2DeviceManagementController"
| where FileName startswith "DeviceManagementConfigurationJustInTimeAssignmentPolicyController"
| where AccountId == "EnterAccountId"
| where TraceLevel <= 3
| project env_time, ActivityId, AccountId, FunctionName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6
```
`[来源: ado-wiki-b-Enrollment-Time-Grouping.md]`

### Scenario 1: Error updating device security group in ETG profile (SG Configuration Error)

```kql
let IncludeFunctionNames = datatable (environments: string) [
"SetDeviceMembershipConfigAsync",
"GetDeviceMembershipConfigAsync",
"ClearDeviceMembershipConfigAsync",
"GetSecurityGroupAsync",
"IsAutopilotFPAOwnerOfSecurityGroupAsync",
"IsValidSecurityGroupAsync",
"ValidateSecurityGroupsAsync"];
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time >= ago(1d)
| where ActivityId == "Enter ActivityId"
| where ServiceName == "DeviceProvisioningService"
| where FunctionName in (IncludeFunctionNames)
| project env_time, ActivityId, AccountId, ComponentName, FunctionName, EventUniqueName, Message, Col2, Col3, Col4, Col5, Col6
```
`[来源: ado-wiki-b-Enrollment-Time-Grouping.md]`

### Scenario 2: ETG not reducing policy application latency (ETG Enablement)

```kql
let IncludeFunctionNames = datatable (environments: string) [
"SetDeviceMembershipAsync",
"GetVirtualTargetPropertiesAsync",
"GetDeviceDirectoryAsync",
"SetDeviceEgmAsync"];
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time >= ago(1d)
| where ActivityId == "Enter ActivityId"
| where ServiceName == "DeviceProvisioningService"
| where FunctionName in (IncludeFunctionNames)
| project env_time, ActivityId, AccountId, DeviceId, ComponentName, FunctionName, EventUniqueName, Message, Col2, Col3, Col4, Col5, Col6
```
`[来源: ado-wiki-b-Enrollment-Time-Grouping.md]`

### Scenario 2: ETG not reducing policy application latency (ETG Enablement)

```kql
union cluster("https://qrybkradxeu01pe.northeurope.kusto.windows.net").database("qrybkradxglobaldb").EffectiveGroupMembershipEffectiveGroupService_Snapshot,
cluster("https://qrybkradxus01pe.westus2.kusto.windows.net").database("qrybkradxglobaldb").EffectiveGroupMembershipEffectiveGroupService_Snapshot
| where TargetId == "d968e8cf-0b83-4acb-bb88-d563ebb8d112"
| project EffectiveGroupId
```
`[来源: ado-wiki-b-Enrollment-Time-Grouping.md]`

### Scenario 3: Devices not added to ETG security group membership (DeviceMembershipUpdater)

```kql
IntuneEvent
| where SourceNamespace == "IntunePE"
| where env_time >= ago(1d)
| where ServiceName == "DeviceProvisioningService"
| where ComponentName endswith "DeviceMembershipUpdater"
| where DeviceId == "a63a2cc7-944a-47e8-ab51-9ef4ee8f3e86"
| project env_time, ActivityId, AccountId, DeviceId, FunctionName, EventUniqueName, Message, Col1, Col2, Col3, Col4, Col5, Col6
```
`[来源: ado-wiki-b-Enrollment-Time-Grouping.md]`

### Scenario 4: Devices not added after Entra identity change

```kql
let IncludeFunctionNames = datatable (environments: string) [
"ProcessDeviceAadDeviceIdChangeAsync"];
IntuneEvent
| where SourceNamespace == "IntunePE"
| where DeviceId == "5aa0bafd-b417-444a-8c23-3bf3c5b420b3"
| where ServiceName == "DeviceProvisioningService"
| where FunctionName in (IncludeFunctionNames)
| project env_time, ActivityId, AccountId, DeviceId, FunctionName, EventUniqueName, Message, Col2, Col3, Col4, Col5, Col6
```
`[来源: ado-wiki-b-Enrollment-Time-Grouping.md]`

### Kusto: Check IME Agent Status

```kql
DeviceManagementProvider
| where env_time >= ago(24h)
| where * contains "<deviceId>"
| where * contains "IntuneWindowsAgent"
| project env_time, name, applicablilityState, reportComplianceState
| summarize max(env_time) by name, applicablilityState, reportComplianceState
```
`[来源: onenote-win32-deployment-troubleshooting.md]`

### Kusto: Get IME Events

```kql
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == "SideCar"
| where ActivityId == "<deviceId>"
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ComponentName, RelatedActivityId, SessionId
```
`[来源: onenote-win32-deployment-troubleshooting.md]`

---

## 判断逻辑参考

### Application Enforcement Status

| where env_time > datetime(2025-09-08 17:00:18) and env_time < datetime(2025-09-08 17:08:19)
| where ActivityId == "<deviceid>"
| where appPolicyId contains 'Application_<appId>'
| where (EventId == 5767 or EventId == 5766)
| project userId, appPolicyId, EventId, TaskName, enforcementType, enforcementState, ECErrorCode=errorCode, EventMessage, deviceAssignmentCount, accountId, ActivityId, RelatedActivityId, env_time

### Application Enforcement Status

| EventId | TaskName |
|---------|----------|
| 5767 | DeviceManagementProviderAppEnforcementStatusEvent |
| 5766 | DeviceManagementProviderAppEnforcementAttemptEvent |

### Error Code Reference

| Error Code | Description |
|------------|-------------|
| -2016345060 | App not detected after installation completed successfully |
| -2016345059 | App still detected after uninstallation completed successfully |
| -2016345061 | Detection rules not present |
| -2016344908 | Remote server required authentication but credentials not accepted |
| -2016344909 | Remote content not found at server |
| -2016330908 | App install has failed |
| -2016344211 | User cancelled the operation |
| -2016344209 | Insufficient free memory |
| -2016344210 | File is corrupted |
| -2147009281 | No valid license or sideloading policy |
| -2016344196 | App license failed to install |

### Scenario 1: Error updating device security group in ETG profile (SG Configuration Error)

| where SourceNamespace == "IntunePE"
| where ComponentName == "DCV2DeviceManagementController"
| where FileName startswith "DeviceManagementConfigurationJustInTimeAssignmentPolicyController"
| where AccountId == "EnterAccountId"
| where TraceLevel <= 3
| project env_time, ActivityId, AccountId, FunctionName, EventUniqueName, Message, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6

### Scenario 1: Error updating device security group in ETG profile (SG Configuration Error)

| where SourceNamespace == "IntunePE"
| where env_time >= ago(1d)
| where ActivityId == "Enter ActivityId"
| where ServiceName == "DeviceProvisioningService"
| where FunctionName in (IncludeFunctionNames)
| project env_time, ActivityId, AccountId, ComponentName, FunctionName, EventUniqueName, Message, Col2, Col3, Col4, Col5, Col6

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
