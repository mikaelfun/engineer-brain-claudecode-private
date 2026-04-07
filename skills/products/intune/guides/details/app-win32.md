# Intune Win32 应用部署与 IME — 综合排查指南

**条目数**: 63 | **草稿融合数**: 14 | **Kusto 查询融合**: 2
**来源草稿**: ado-wiki-Intune-SideCar.md, ado-wiki-Win32-App-Deployment.md, ado-wiki-a-Time-Zone-Mismatch-End-of-Shift.md, ado-wiki-b-Enrollment-Time-Grouping.md, onenote-deploy-ps-as-win32.md, onenote-deploy-wechat-win32-app.md, onenote-deploy-wechat-win32.md, onenote-ime-log-interpreter-tool.md, onenote-macos-sidecar-agent-workflow.md, onenote-petri-ime-tool.md
**Kusto 引用**: app-install.md, ime-extension.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (9 条)

- **solution_conflict** (high): intune-ado-wiki-336 vs intune-contentidea-kb-580 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-383 vs intune-contentidea-kb-580 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-024 vs intune-onenote-156 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-024 vs intune-onenote-248 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-ado-wiki-383 vs intune-onenote-328 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Intune Sidecar
> 来源: ADO Wiki — [ado-wiki-Intune-SideCar.md](../drafts/ado-wiki-Intune-SideCar.md)

**Intune SideCar**
**Intune Management Extension (SideCar)**
- **PowerShell script execution** and **Remediation scripts**
- **Custom Compliance Policies**
- **Win32 and WinGet app deployment**
- **Application inventory**

**Subpages**

**Quick Reference**

**How to Get Help with Cases**

### Phase 2: Win32 App Deployment
> 来源: ADO Wiki — [ado-wiki-Win32-App-Deployment.md](../drafts/ado-wiki-Win32-App-Deployment.md)

**Win32 App Deployment — 综合排查指南**
**About Win32 Applications**
**How Win32 App Deployment Works**
**1. App Metadata Processing**
- SideCar runs app check-in on schedule
- Retrieves metadata (App policies) and runs detection before starting content download
- Uses `IntuneManagementExtension` content folder for metadata
- Key logs: `IntuneManagementExtension.log`, `AppWorkload.log`
- User Session: AAD user session found → user context
- No AAD User: context set to System, `Userid = 00000000-0000-0000-0000-000000000000`

**2. Detection, Applicability and Requirements**
- **DetectionActionHandler**: Runs detection rules (Registry=0, MsiProductCode=1, FilePath=2, PowershellScripts=3)
- **ApplicabilityHandler**: Evaluates intent (NotTargeted=0, RequiredInstall=1, RequiredUninstall=2, AvailableInstall=3, AvailableUninstall=4)
- Requirements: OS architecture, minimum Windows version, disk space, memory, CPU

**3. Download and Unzip**
- Content downloaded to "Incoming" folder → moved to "Staging" for hash verification and unzip
- Uses Delivery Optimization (DO) for download
- Hash validation → decryption → unzip to `C:\Windows\IMECache\{appId}`
- Staging content cleaned up after successful unzip

**4. Installation**
- Final detection before install (confirm still not detected)
- **ExecutionActionHandler** and **Win32AppExecutionExecutor** run installation
- Install command executed from `C:\Windows\IMECache\{appId}` directory
- Exit code evaluated against ReturnCodes definition

**5. Post-Installation**
- Final detection to confirm installation
- Compliance state message generated and sent
- Registry updated: `HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\SideCarPolicies\StatusServiceReports`
... (详见原始草稿)

### Phase 3: A Time Zone Mismatch End Of Shift
> 来源: ADO Wiki — [ado-wiki-a-Time-Zone-Mismatch-End-of-Shift.md](../drafts/ado-wiki-a-Time-Zone-Mismatch-End-of-Shift.md)

**Time Zone Mismatch or End of Shift — Case Transfer Process**
**Overview**
1. PRO SEV A case continuation due to end of shift
2. Case transfers due to time zone mismatch
3. General callback requests for continuation of cases due to end of shift

**1. PRO SEV A Case Continuation (End of Shift)**
1. Create a customer contact task with title: `Immediate callback required | PRO SEV A | <SR Title>`
2. Fill out the [CCE Transfer template](https://sharepoint.partners.extranet.microsoft.com/sites/Onestop/BPM/Pages/Specials/TemplateDisplay.aspx?Template=24)
3. Dispatch the TASK to **Microsoft Intune PRO Support Queue**
4. Send email to **IntunePROSup@microsoft.com** and cc **casemail@microsoft.com** with the template, indicating immediate callback needed for PRO SEV A
5. Assisting engineer takes ownership of the task and documents interactions

**2. Case Transfers Due to Time Zone Mismatch**

**Scenario 1: Initial contact for customers outside time zone/region**
1. Cases must be assigned and ownership taken within SLA regardless of customer region
2. Case owner must contact customer by phone first, then follow up with email
3. If unable to reach customer within 1 business day and customer is outside your region → send transfer email (template below)
4. Document in case notes (pre-scoping task with CCE Transfer template): attempted phone and email contact; customer in X time zone; sending back to queue for in-region support
5. Change Internal Title to: `"[REGION] callback required, customer unresponsive on initial contact, next available engineer"`
```
```

**Scenario 2: Customer requests to continue with in-region engineer**
1. Inform customer you will transfer to appropriate team; next available engineer will pick up within 1 business day
2. Thoroughly document case (new task with CCE Transfer template), change Internal Title to: `"[REGION] callback request, customer has requested to work with engineer within their time zone/region, next available engineer"`
3. Send email to **IntunePROSup@microsoft.com** and cc **casemail@microsoft.com**
4. In-region engineer takes ownership and works case to resolution
```
```

**3. General Callback Requests (End of Shift)**
1. Create a customer contact task with title: `Customer callback required | <date> | <Next callback range> <UTC time> | <SR Title>`
2. Fill out the [CCE Transfer template](https://sharepoint.partners.extranet.microsoft.com/sites/Onestop/BPM/Pages/Specials/TemplateDisplay.aspx?Template=24)
3. Dispatch TASK to **Microsoft Intune PRO support**
... (详见原始草稿)

### Phase 4: B Enrollment Time Grouping
> 来源: ADO Wiki — [ado-wiki-b-Enrollment-Time-Grouping.md](../drafts/ado-wiki-b-Enrollment-Time-Grouping.md)

**Enrollment Time Grouping (ETG)**
- Autopilot Device Preparation Policy (APv2, GA July 2024)
- [Future] iOS Device Enrollment / Android Device Enrollment

**How ETG Works**

**Security Group Requirements**
- **Static group** (not dynamic)
- **Not assignable to groups**
- **Scoped to the admin** configuring the policy
- **"Intune Provisioning Client" must be an owner** of the group

**Support Boundaries**

**Troubleshooting Scenarios with Kusto**

**Scenario 1: Error updating device security group in ETG profile (SG Configuration Error)**
```kusto
```
```kusto
```

**Scenario 2: ETG not reducing policy application latency (ETG Enablement)**
```kusto
```
```kusto
```

**Scenario 3: Devices not added to ETG security group membership (DeviceMembershipUpdater)**
```kusto
```

**Scenario 4: Devices not added after Entra identity change**
```kusto
```

**FAQ and Known Issues**
- During grace period: Delete device in Intune → re-enroll
- After grace period: Update SG memberships in Entra

**Getting Help with Cases**
- ETG cases don't always require Autopilot SME — scope the case based on the actual problem
- App deployment issue on ETG device → troubleshoot as app deployment case
- Device not added to ETG group → troubleshoot group membership, not Autopilot

**Training Resources**
- [2 Intune Readiness Sessions on ETG (Overview + Deep-Dive Troubleshooting)](https://microsoft.sharepoint.com/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/Forms/AllItems.aspx?id=%2Fteams%2FLearnCSSIntune%2FIntuneFeaturesDeepDiveArchives%2F2407%20%2D%20Enrollment%20Time%20Grouping)
- [ETG Q&A Session with CXE](https://microsoft.sharepoint.com/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/Forms/AllItems.aspx?id=%2Fteams%2FLearnCSSIntune%2FIntuneFeaturesDeepDiveArchives%2F2407%20%2D%20Enrollment%20Time%20Grouping%2FETG%20Q%26A%20with%20CXE)

### Phase 5: Deploy Ps As Win32
> 来源: OneNote — [onenote-deploy-ps-as-win32.md](../drafts/onenote-deploy-ps-as-win32.md)

**Deploy PowerShell Script as Win32 App**
**Steps**
1. Put scripts into a folder; create another empty folder for output
2. Package script using IntuneWinAppUtil:
   ```
   ```
3. Create Win32 app in Intune portal with the .intunewin package
4. Configure detection rule (e.g., scheduled task check, registry key, file existence)

**Detection Script Example**
```powershell
```

**Source**
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Win32_IME_PowerShell Script TSG

### Phase 6: Deploy Wechat Win32 App
> 来源: OneNote — [onenote-deploy-wechat-win32-app.md](../drafts/onenote-deploy-wechat-win32-app.md)

**Deploy WeChat via Intune Win32 App**
**Overview**
**Step 1: Package with Win32 Content Prep Tool**
1. Download [Microsoft Win32 Content Prep Tool](https://go.microsoft.com/fwlink/?linkid=2065730)
2. Run the packaging command:
```powershell
```
- `-c`: Source folder containing the setup file
- `-s`: Setup file path
- `-o`: Output folder for `.intunewin` file
- `-q`: Quiet mode
```powershell
```

**Step 2: Deploy via Intune Portal**
1. Log in to Microsoft Endpoint Manager admin center
2. Navigate to **Apps** → **Add app** → **Win32 app**
3. Upload the `.intunewin` package
4. Configure install/uninstall commands:

**Key Notes**
- The app must support silent install (`/S` switch) — check with the vendor
- This method applies to any Windows desktop app that supports silent installation
- For other Chinese apps (DingTalk, WPS, etc.), modify the paths and switches accordingly

**21v Applicability**

### Phase 7: Deploy Wechat Win32
> 来源: OneNote — [onenote-deploy-wechat-win32.md](../drafts/onenote-deploy-wechat-win32.md)

**Deploy WeChat (and China-market EXE apps) via Win32 in Intune**
**Overview**
**Prerequisites**
- Microsoft Win32 Content Prep Tool: https://go.microsoft.com/fwlink/?linkid=2065730
- The app's EXE installer (e.g. WeChatSetup.exe)
- Knowledge of the app's silent install/uninstall switches

**Steps**

**1. Convert EXE to .intunewin**
```powershell
```
```powershell
```

**2. Upload to Intune**

**3. WeChat-specific Configuration**

**4. Detection Rule**

**General Guidance**
1. Confirm the app supports fully silent install (`/S`, `/silent`, `/quiet`, etc.)
2. Contact the app vendor if silent install switch is unknown
3. Test the silent install/uninstall commands before deploying to production

**Source**
- OneNote: Mooncake POD Support Notebook > Intune > How To > Windows

### Phase 8: Ime Log Interpreter Tool
> 来源: OneNote — [onenote-ime-log-interpreter-tool.md](../drafts/onenote-ime-log-interpreter-tool.md)

**IME Log Interpreter Tool Reference**
**Overview**
**What It Solves**
1. CMTrace pre-defined warning/error highlighting is inaccurate for IME logs
2. Notepad++ search doesn't give session context; timestamps are mid-line
3. IME logs contain many ignorable errors that distract engineers
4. Win32 and PowerShell logs are interleaved in the same file
5. Same app appears in multiple poller sessions — hard to distinguish

**Key Features (v3.0, 2023-04-11)**
- **Session separation**: Splits log into Application Poller sessions
- **Win32 V3 processor**: Updated flow analysis for latest IME version
- **MSFB UWP app flow**: New Microsoft Store for Business UWP app support
- **Dependency chain**: Fixed dependency chain processing with auto-install
- **Assignment filter**: Filter analysis
- **WPJ context skip**: Shows when WPJ/user context apps are skipped
- **DO download**: Shows Delivery Optimization download priority and timeout
- **Install timeout**: Displays install timeout settings

**Usage**
1. Open IME Log Interpreter
2. Browse to IME log directory: `C:\ProgramData\Microsoft\IntuneManagement Extension\Logs`
3. Select the log file
4. Tool separates the log into per-session views for each application

### Phase 9: Macos Sidecar Agent Workflow
> 来源: OneNote — [onenote-macos-sidecar-agent-workflow.md](../drafts/onenote-macos-sidecar-agent-workflow.md)

**macOS Sidecar Agent Installation & Log Collection Workflow**
**Agent Installation (3 Phases)**
1. **Admin targets sidecar policy** to a group of devices — triggers implicit assignment of sidecar agent
2. **MDM check-in** — sidecar SCEP certificate installed (used to authenticate with sidecar gateway)
3. **Same check-in** — SLDM service retrieves latest agent app version and installs the sidecar agent on device

**Log Collection Workflow**
1. Admin creates/uploads/targets a **shell script policy** that generates log files
2. Targeted device checks in and **executes the script**
3. Admin creates a **log collection request** for files generated by script
4. Device checks in again, receives request, **uploads files to Azure Storage**
5. Admin **downloads files** via Ibiza portal

**Accessing Log Collection**

**Related**
- Shell script troubleshooting: see intune-onenote-093
- Log collection tool: [IntuneMacODC](https://github.com/markstan/IntuneMacODC)
- Agent installed at: /Library/Intune/Microsoft Intune Agent.app

### Phase 10: Petri Ime Tool
> 来源: OneNote — [onenote-petri-ime-tool.md](../drafts/onenote-petri-ime-tool.md)

**Petri's Get-IntuneManagementExtensionDiagnostics Tool**
**Overview**
**Installation**
```powershell
```
**Usage**
**Analyze Log File**
```powershell
```
**Interactive Log Viewer**
```powershell
```
**Capabilities**
- Win32 app deployment timeline analysis
- PowerShell script execution tracking
- ESP (Enrollment Status Page) tracking
- Detection rule visualization on hover

**Source**
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Win32_IME_PowerShell Script TSG

### Phase 11: Win32 Chocolatey Ime Tsg
> 来源: OneNote — [onenote-win32-chocolatey-ime-tsg.md](../drafts/onenote-win32-chocolatey-ime-tsg.md)

**Win32 App Deployment with Chocolatey via IME - Troubleshooting Guide**
**Architecture**
1. Package the Chocolatey installation package (`.nupkg`) into `.intunewin`
2. Deploy via Intune and set the Chocolatey installation command
3. IME execution flow:
   - App detect rule check
   - App download
   - Unzip downloaded zip file to `C:\Program Files (x86)\Microsoft Intune Management Extension\Content\Staging`
   - Create installer process (Chocolatey)

**Distinguishing IME vs Chocolatey Issues**

**Part 1-3: Intune Service / IME Side**
- Check IME logs for download, unzip, and installer process creation
- If IME successfully creates the installer process, the issue is on the Chocolatey side

**Part 4: Chocolatey Side**
- Check Chocolatey logs: `C:\ProgramData\chocolatey\logs`
- Check Chocolatey installation cache for failed packages: `C:\ProgramData\chocolatey\lib-bad`
- If IME unzipped successfully and the installer was triggered, the package will appear under `lib-bad` on failure

**Key Log Locations**

**Troubleshooting Flow**
1. Check IME log for app download and unzip status
2. Confirm installer process creation in IME log
3. If installer process created successfully -> check Chocolatey logs
4. If package found in `lib-bad` -> Chocolatey installation failed, review Chocolatey error
5. If no installer process -> IME-side issue, check download/unzip errors

### Phase 12: Win32 Deployment Troubleshooting
> 来源: OneNote — [onenote-win32-deployment-troubleshooting.md](../drafts/onenote-win32-deployment-troubleshooting.md)

**Win32 App Deployment Troubleshooting Guide**
**When to Use**
**Prerequisites Check**
**Enrollment Type Verification**
**Path 1: IME Not Installed**
**For MSI Apps (OMA-DM path)**
```
```
- **CurrentDownloadUrl**: URL to the MSI install file
- **EnforcementRetryCount**: Max retry attempts
- **EnforcementRetryIndex**: Current retry number
- **EnforcementRetryInterval**: Minutes between retries
- **EnforcementStartTime**: Start time
- **EnforcementTimeout**: Install timeout (minutes)
- **LastError**: Error from last execution

**Kusto: Check IME Agent Status**
```kusto
```

**Path 2: IME Installed**

**Kusto: Get IME Events**
```kusto
```

**Kusto: Get Policy Details**
```kusto
```

**Related**
- OMA-DM Protocol: https://docs.microsoft.com/en-us/windows/client-management/mdm/oma-dm-protocol-support
- EnterpriseDesktopAppManagement CSP: https://docs.microsoft.com/en-us/windows/client-management/mdm/enterprisedesktopappmanagement-csp

### Phase 13: Kusto 诊断查询

#### app-install.md
`[工具: Kusto skill — app-install.md]`

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

```kql
DeviceManagementProvider
| where env_time >= ago(2d)
| where ActivityId == '{deviceId}'
| where message contains '{appName}' or EventMessage contains '{appName}'
| project env_time, message, EventMessage, aadDeviceId, ActivityId
```

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

```kql
DownloadService
| where SourceNamespace == "IntuneCNP"
| where env_time > ago(1d)
| where EventId in (13796)
| where deviceId == '{deviceId}' 
| project env_time, SourceNamespace, accountId, deviceId, userId, TaskName, 
    EventId, status, platform, statusCode, exception, errorEventId, result, EventMessage
```

```kql
IntuneEvent
| where env_time >= ago(3d)
| where ApplicationName == 'SideCar'
| where ActivityId == '{deviceId}'
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, 
    ComponentName, RelatedActivityId, SessionId
```

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

```kql
DeviceManagementProvider
| where env_time >= ago(30d)
| where * contains '{deviceId}'
| where * contains 'IntuneWindowsAgent'
| project env_time, name, applicablilityState, reportComplianceState  
| summarize max(env_time) by name, applicablilityState, reportComplianceState 
```

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

#### ime-extension.md
`[工具: Kusto skill — ime-extension.md]`

```kql
let starttime = datetime({startTime});
let endtime = datetime({endTime});
let deviceid = '{deviceId}';
let accountid = '{accountId}';

DeviceManagementProvider
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where ActivityId contains deviceid
| where message has "IntuneWindowsAgent.msi"
| project env_time, DeviceId = ActivityId, message, cV
| order by env_time asc
```

```kql
DeviceManagementProvider
| where env_time >= ago(30d)
| where * contains '{deviceId}'
| where * contains 'IntuneWindowsAgent'
| project env_time, name, applicablilityState, reportComplianceState  
| summarize max(env_time) by name, applicablilityState, reportComplianceState 
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune PowerShell scripts deployed via IME always run as SYSTEM, even when 'Run this script using... | Known bug in Intune Management Extension (SideCar): user-context execution wa... | Fixed in SideCar (IME) agent version 1.7.103 or later. Update IME agent to v1.7.103+. Verify agen... | 🟢 9.0 | OneNote |
| 2 | PowerShell scripts deployed through Intune Management Extension (IME) do not execute on Surface H... | Surface Hub does not support Intune Management Extension (SideCar) by design.... | By-design limitation. Do not deploy PowerShell scripts via IME to Surface Hub. See KB4073215. | 🟢 9.0 | OneNote |
| 3 | Intune PowerShell script deployment fails: 'The file ...ps1 is not digitally signed. You cannot r... | Windows PowerShell execution policy blocks unsigned scripts. IME-downloaded s... | Check execution policy on device. IME requires Bypass or a policy permitting locally-downloaded s... | 🟢 9.0 | OneNote |
| 4 | Intune PowerShell script needs to re-run but IME only executes scripts once; script shows as succ... | Intune Management Extension caches script execution results in registry at HK... | Reset registry values: set DownloadCount=0, ErrorCode=0, Result and ResultDetails to empty string... | 🟢 9.0 | OneNote |
| 5 | Intune portal shows PowerShell script applied successfully but the script does not produce expect... | IME runs PowerShell scripts using Windows PowerShell (x86) 32-bit by default.... | Test script with Windows PowerShell (x86) locally. If x86 cannot run as expected, it is a 32-bit ... | 🟢 9.0 | OneNote |
| 6 | iOS devices enrolled via ABM show Azure AD Registered as empty or false in Intune device export. ... | iOS devices were activated via ABM but users did not sign into Company Portal... | Adopt Just in Time (JIT) deployment for ABM enrollment to ensure proper Azure AD registration. No... | 🟢 9.0 | OneNote |
| 7 | Intune-managed Windows device cannot receive remote commands or policy updates immediately; devic... | Windows Push Notification Services (WNS) channel is not working. Common cause... | 1) Check Push reg key exists under HKLM\SOFTWARE\Microsoft\Enrollments\{EnrollmentID}\Push and ve... | 🟢 9.0 | OneNote |
| 8 | Win32 app download skipped with 'opt-in policy is not set' error; Managed Installer remediation f... | The registry.pol file under C:\Windows\System32\GroupPolicy\User is 0 bytes. ... | Delete the registry.pol file under C:\Windows\System32\GroupPolicy\User and retry managed install... | 🟢 9.0 | OneNote |
| 9 | Managed Installer remediation script fails with 'The local policy cannot be obtained' HRESULT E_F... | Broken GUIDs in C:\Windows\System32\GroupPolicy\gpt.ini under gPCMachineExten... | Delete all files and folders under C:\Windows\System32\GroupPolicy to reset local group policy, t... | 🟢 9.0 | OneNote |
| 10 | Win32 app deployment via Intune Management Extension (IME) downloads extremely slowly for China T... | IME deployment uses Verizon CDN which has high network latency when connected... | PG confirmed re-deployment with Azure CDN (ETA FY24Q3). Workaround: use non-China Telecom network... | 🟢 9.0 | OneNote |
| 11 | Win32 app or PowerShell script deployment fails; Intune Management Extension (IME) not installed ... | AAD registered devices do not support IME installation. Only AAD joined (Enro... | Verify EnrollmentType in Kusto (DeviceManagementProvider table). Change device join type to AADJ/... | 🟢 9.0 | OneNote |
| 12 | Intune Management Extension (IME/MSI) download fails and does not retry; IntuneWindowsAgent.msi s... | EnforcementRetryCount exhausted in registry at HKLM\SOFTWARE\Microsoft\Enterp... | Navigate to HKLM\SOFTWARE\Microsoft\EnterpriseDesktopAppManagement\, find IntuneWindowsAgent.msi ... | 🟢 9.0 | OneNote |
| 13 | Intune PowerShell script fails and stops executing after 3 retry attempts; script stuck in failed... | Script timeout (30 min) or device reboot during execution counts as an error ... | Reset DownloadCount to 1 in registry: HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\Policies\... | 🟢 9.0 | OneNote |
| 14 | Intune PowerShell script deployed to multi-app kiosk device reports success in Azure portal but s... | In multi-app kiosk mode only applications listed in Assigned Access XML allow... | Add to kiosk XML allowed apps: <App AppUserModelId='Microsoft.Management.Clients.IntuneManagement... | 🟢 9.0 | OneNote |
| 15 | Win32 app or PowerShell script deployed via Intune does not install on Windows device. Intune Man... | Intune Management Extension (required for Win32 app and PowerShell script dep... | Verify device enrollment type: check registry or run Kusto query. If device is AAD registered, ch... | 🟢 9.0 | OneNote |
| 16 | Need to deploy WeChat (or other China-market apps without MSI installer) to Windows devices via I... | WeChat and many China-market applications only provide .exe installers withou... | Use Microsoft Win32 Content Prep Tool (IntuneWinAppUtil.exe) to convert the EXE installer to .int... | 🟢 9.0 | OneNote |
| 17 | Cannot deploy AppLocker Managed Installer rule collection via Intune native UI; need to configure... | Intune does not have a native UI to deploy AppLocker Managed Installer XML po... | Package PowerShell script + AppLocker XML as Win32 app: 1) Create .ps1 with Set-AppLockerPolicy -... | 🟢 9.0 | OneNote |
| 18 | Win32 app installation fails with error code -2147024894 (0x80070002) and Failed to create instal... | The install command filename specified in the Intune Win32 app configuration ... | 1. Rename .intunewin to .zip and inspect Detection.xml for the actual setup filename. 2. Or use I... | 🟢 9.0 | OneNote |
| 19 | Win32 app supersedence scenario: hide toast notification setting works for new app install but un... | When old version app assignment is deleted, the hide notification (ToastState... | 1. Keep old version app assignment active and set it to Hide all toast notifications as well. 2. ... | 🟢 9.0 | OneNote |
| 20 | Chrome app push installation via Company Portal fails with error app or device not found; IME log... | ChromeSetup.exe is an online stub installer that downloads Chrome from Google... | 1) Use the Chrome MSI full offline installer instead of the online ChromeSetup.exe stub; 2) Packa... | 🟢 9.0 | OneNote |
| 21 | Win32 应用安装后 Intune 报告 Not Detected（-2016345060），检测规则返回 NotDetected | 检测规则配置错误：注册表路径/文件路径/PowerShell 脚本逻辑与实际安装结果不匹配 | 1. 检查 AppWorkload.log 中 DetectionActionHandler 的 detection state；2. 确认 DetectionType（Registry=0, ... | 🟢 8.5 | ADO Wiki |
| 22 | Win32 应用内容下载失败，Delivery Optimization (DO) 报错或超时，AppWorkload.log 显示 download failure | 设备无法从 Intune CDN（swdb02-mscdn.manage.microsoft.com）下载 .intunewin.bin 文件，通常为网络... | 1. 检查 AppWorkload.log 中 DownloadActionHandler 和 DO TEL 日志；2. 确认设备可访问 swdb02-mscdn.manage.microsof... | 🟢 8.5 | ADO Wiki |
| 23 | Win32 应用部署卡在 EnforcementState 5000-5999（Error）或 2000-2999（In Progress），安装进程未完成 | 安装命令执行失败或超时（默认 MaxRunTimeInMinutes=60），可能因安装程序本身报错、依赖缺失、或设备资源不足 | 1. 通过 Kusto 查询 DeviceManagementProvider 表（EventId 5767/5766）获取 enforcementState 和 ECErrorCode；2. ... | 🟢 8.5 | ADO Wiki |
| 24 | Win32 应用在 Windows S Mode 设备上无法安装，系统阻止非 Store 应用运行 | Windows 10 S Mode 默认只允许运行 Store 应用，不允许安装和执行 Win32 应用 | 在 Intune 中配置 S mode supplemental policy，启用 Win32 应用在 S mode 设备上的安装和运行权限 | 🟢 8.5 | ADO Wiki |
| 25 | Autopilot fails when LOB (MSI) and Win32 apps are mixed during ESP | Mixing LOB (MSI) and Win32 app types causes installation conflicts during ESP | Convert all apps to Win32 format (.intunewin). Never mix LOB and Win32 during Autopilot. | 🟢 8.5 | ADO Wiki |
| 26 | 客户请求在 Enterprise App Catalog 中添加缺失的应用程序 | 目录中尚未收录该应用，Enterprise App Catalog 仅提供预打包的目录应用 | 1. CSS 填写 https://aka.ms/eam/AppRequest 表单提交请求；2. 通知客户已提交并关闭 Case；3. 注意：不存在 ICM 路径用于缺失应用请求；4. 若应用... | 🟢 8.5 | ADO Wiki |
| 27 | EPM error: organization doesnt allow you to run this app as administrator — elevation blocked | EPM client not enabled (registry DHMScopeValue missing PrivilegeManagement) o... | 1) Verify OS is supported. 2) Check registry HKLM:\SOFTWARE\Microsoft\PolicyManager\current\devic... | 🟢 8.5 | ADO Wiki |
| 28 | MDE Attach device does not show up in Intune UX All Devices list view; Rave shows Last Contact Ti... | Bug in MDE enrollment flow caused device records to be soft-deleted in Statel... | Verify via Rave: Last Contact Time < July 15 2022 AND IsDeleted=true. If confirmed, transfer tick... | 🟢 8.5 | ADO Wiki |
| 29 | BitLocker encryption strength remains 128-bit after deploying 256-bit policy to already-encrypted... | Drive was already encrypted before the BitLocker policy was deployed. BitLock... | Customer needs to decrypt the drive first, then let the BitLocker policy trigger re-encryption wi... | 🟢 8.5 | ADO Wiki |
| 30 | Specific driver not being offered in Intune Driver Update policy — policy assigned but certain dr... | Driver not uploaded to MS Catalog by OEM; or HWID mismatch (driver not applic... | 1) Search MS Catalog for driver by name/version 2) If not found, OEM hasn't submitted it 3) Verif... | 🟢 8.5 | ADO Wiki |
| 31 | Unable to upload Win32 app larger than 8GB in Intune | Tenant is unpaid/trial/free — Win32 upload limit is 8GB for unpaid tenants vs... | Verify tenant is paid in Assist365. Paid tenants automatically have 30GB per app limit across all... | 🟢 8.5 | ADO Wiki |
| 32 | 设备使用 ETG enrollment profile 注册后未被添加到 ETG Security Group 成员 | DeviceMembershipUpdater 操作失败；若 72 小时内未成功加入 SG，GnT 宽限期到期后会触发 policy tattoo rem... | 1. 检查 Devices > Monitor > Enrollment time grouping failures 报告（2510+ 版本可用）。2. 用 Kusto 查询 DeviceMe... | 🟢 8.5 | ADO Wiki |
| 33 | Kusto queries on intune.kusto.windows.net return incomplete results or fail to find expected Intu... | The original Intune Kusto cluster (intune.kusto.windows.net) reached saturati... | Use the appropriate regional Kusto cluster based on scale unit location: IntuneNA1.kusto.windows.... | 🟢 8.5 | ADO Wiki |
| 34 | New Microsoft Teams app fails to install during Windows Autopilot ESP (Enrollment Status Page) wh... | New Microsoft Teams uses MSI-based installation which conflicts with Win32 ap... | Deploy new Teams separately as a Win32 app instead of bundling with M365 Apps: (1) Download teams... | 🟢 8.5 | OneNote |
| 35 | Intune auto-enrollment via GPO fails on some VMs because Group Policy is not delivered in time af... | After VM boot, GPO was not delivered to the VM automatically. Without GPO, th... | Run gpupdate /force to force GPO update, then verify with gpresult /r that the MDM auto-enrollmen... | 🟢 8.5 | OneNote |
| 36 | Unknown process is modifying environment variables (HKLM\SYSTEM\CurrentControlSet\Control\Session... | Windows does not natively audit registry key modifications. Without explicit ... | Enable registry audit: (1) gpedit.msc > Computer Configuration > Windows Settings > Security Sett... | 🟢 8.0 | OneNote |
| 37 | Intune remediation script result not reported to service after network outage; stale compliance s... | Known issue: when network failure occurs during result upload, IME may not de... | Wait up to 7 days for correction. Workaround: modify remediation script to produce different outp... | 🟢 8.0 | OneNote |
| 38 | Win32 app toast notification still showing during supersedence scenario even though 'hide all not... | When a Win32 app supersedes an old version, IME uninstalls the old version an... | 1. Keep the old version app's assignment in Intune (do not delete it). 2. Set the old version app... | 🟢 8.0 | OneNote |
| 39 | Win32 app toast notification for supersedence (uninstall of old version) still shows on Windows d... | Old app assignment controls the uninstall toast notification. If old app assi... | Keep the old (superseded) app assignment in Intune and set it to Hide all toast notifications as ... | 🟢 8.0 | OneNote |
| 40 | MDE Attached device enrolled before July 15th 2022 doesn't show up in Intune UX All Devices list ... | Bug in MDE enrollment flow caused devices enrolled before July 15th 2022 to b... | Verify symptoms: 1) Last Contact Time before July 15th 2022 in Rave 2) IsDeleted=true in Device I... | 🔵 7.5 | ADO Wiki |
| 41 | Autopilot ESP (Enrollment Status Page) fails with error 0x800705b4 (E_TIMEOUT) at 'Preparing devi... | Network connectivity issues to CDN endpoints in China prevent IME MSI or Win3... | 1) Get IME download URL from registry; 2) Test CDN download manually in browser from same network... | 🔵 7.5 | OneNote |
| 42 | The Intune PC client shows as installing in the system tray for an extended amount of time and ne... | A cause of the reported behavior can be that the Windows machine(s) is config... | Avoid forcing (commonly done via a Group Policy Objects) the Windows machine(s) to use an on-prem... | 🔵 7.0 | ContentIdea KB |
| 43 | When trying to install the Microsoft Intune Exchange Connector the following error is seen: The M... | The Exchange Connector was installed with only an older version of .NET 3.5 o... | On the Exchange Connector machine: 1) Install .NET 4.5.2. 2) Add DWORD SchUseStrongCrypto under H... | 🔵 7.0 | ContentIdea KB |
| 44 | Recent app purchases from Store for Education not showing up in Apps blade. | Sync may take up to 12 hours for new apps, 24 hours for Private Store apps. | Wait for sync to complete. Check last sync time on Apps blade. | 🔵 7.0 | ContentIdea KB |
| 45 | This article describes how to fix issues when you cannot sign-in onto the NDES connector Once you... | When you try to sign-in on the NDES connector, never completes the enrollment... | 1) Verify that the credentials you are using are a Global Administrator and has an Intune license... | 🔵 7.0 | ContentIdea KB |
| 46 | End users installing apps deployed from to their devices enrolled into Intune via Android for Wor... | The specific app permissions have changed since the last time the Android for... | The Intune/Android for Work administrator needs to log into the Android for Work admin portal at ... | 🔵 7.0 | ContentIdea KB |
| 47 | If you deploy a PowerShell Script via the Intune Management Extension (see article here: https://... |  | This is considered by-design.As of 1/3/2018, Windows MDM does not support the execution of PowerS... | 🔵 7.0 | ContentIdea KB |
| 48 | After using Intune to assign a PFX certificate profile to a group of iOS and Android devices, the... | This can occur if the CA certificate had been renewed but the CA has not been... | To resolve this problem complete the following:1. From elevated Command Prompt (Run as Administra... | 🔵 7.0 | ContentIdea KB |
| 49 | When switching MDM authority in Hybrid to Intune, if an admin excludes more than 20 users at a ti... | Product issue which will be fixed in a future release | Version 8239 � SCCM 2012 SP2/R2 Sp1 onwards following registry key cold be created to reduce the ... | 🔵 7.0 | ContentIdea KB |
| 50 | When configuring the Cisco AnyConnect VPN client on Android phones, the following message is gene... | This is by design. | This is expected behavior when the Cisco AnyConnect client is used on Android devices in conjunct... | 🔵 7.0 | ContentIdea KB |
| 51 | When you check on mobile device in the Intune console and under Exchange Access the Last EAS sync... | This can be caused by HasActiveSyncDevicePartnership is set to false on user ... | To resolve this issue run the following Exchange PowerShell command Get-CASMailbox user@smtpaddre... | 🔵 7.0 | ContentIdea KB |
| 52 | Example scenario, customer has configured a Device Restrictions Policy with the following setting... | *this is only currently confirmed for Android devices, if you are able to con... | The reason the user has not been prompted to change their password, is because the timer will res... | 🔵 7.0 | ContentIdea KB |
| 53 | Password expiration (days) setting for Android devices in Intune does not prompt user to change p... | Timer resets every time the policy is edited, even without changing expiratio... | Check policy Last Modified date in Azure Portal. Expiration is relative to Last Modified or enrol... | 🔵 7.0 | ContentIdea KB |
| 54 | Windows 10 MDM auto-enrollment into Intune via GPO fails and the following symptoms are observed:... | This can occur if the domain for the UPN is either unverified or unroutable. ... | To resolve this problem, complete the following:1.	Open Active Directory Users and Computers2.	Se... | 🔵 7.0 | ContentIdea KB |
| 55 | There are times when we need to know how a device became unenrolled. This article shows you how t... | End User unenrollment | Here is an example to see if an end user has initiated a wipe from the Company Portal    First, l... | 🔵 7.0 | ContentIdea KB |
| 56 | After creating and assigning an iOS update policy to prevent software update installations during... | This is a known issue with the current release of Intune and iOS 11.3.1 and l... | UI was updated 10/2018 in the Intune portal to make the functionality more clearAs a workaround, ... | 🔵 7.0 | ContentIdea KB |
| 57 | Intune Service allows iOS device to be enrolled a second time while already enrolled actively wit... | Expected behavior due to past release code change. | Currently IcM has been filed and pending investigation: https://icm.ad.msft.net/imp/v3/incidents/... | 🔵 7.0 | ContentIdea KB |
| 58 | When you try to enroll a Windows 10 device automatically by using Group Policy, you experience Ev... | This issue can occur if the UPN contains an unverified or non-routable domain... | On the AD DS server, open Active Directory Users and Computers, select a valid UPN suffix (e.g. c... | 🔵 7.0 | ContentIdea KB |
| 59 | When you turn on a DEP managed device that is assigned an enrollment profile, the Intune enrollme... | This issue can occur if the Intune enrollment profile was created before the ... | To resolve this problem, complete the following steps:1. Edit the enrollment profile. You can mak... | 🔵 7.0 | ContentIdea KB |
| 60 | Hybrid Azure AD Join AutoPilot: device times out during OOBE with error 80070774. Device fails to... | Assign User feature was used, which only works with Azure AD Join AutoPilot, ... | Intune > Device Enrollment > Windows Enrollment > Devices > Unassign User. Re-assign Hybrid Azure... | 🔵 7.0 | ContentIdea KB |
| 61 | Customers are unable to save configuration policies after they added a scope tag when using the S... | This behavior is by design when using the Silverlight portal as ScopeTags are... | As this behavior is considered by design we are not able to provide a direct fix for the customer... | 🔵 7.0 | ContentIdea KB |
| 62 | Consider the following scenario: Start with a device enrolled into an Intune integrated Jamf Pro ... | Product Issue on the Jamf side (PI-006679) | To resolve this, delete the device record from Jamf Pro and re-enroll the device. | 🔵 7.0 | ContentIdea KB |
| 63 | INF driver installation via Intune Win32 app deployment using pnputil.exe in PowerShell script fa... | Standard INF driver install methods (pnputil.exe invoked via PowerShell Start... | Check pnputil results in %windir%\inf\setupapi.dev.log. Note that Intune downloads app content to... | 🔵 7.0 | OneNote |
