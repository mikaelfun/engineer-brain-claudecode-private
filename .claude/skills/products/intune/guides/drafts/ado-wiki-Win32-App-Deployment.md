---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Management/Windows/Win32"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FWindows%2FWin32"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Win32 App Deployment — 综合排查指南

## About Win32 Applications

Win32 apps are traditional Windows applications (.exe/.msi) deployed via Intune by converting them into .intunewin files using Microsoft Win32 Content Prep Tool. Windows update packages (.msu) can also be deployed as Win32 Applications.

## How Win32 App Deployment Works

Deployed via Intune Management Extension (IME/SideCar). The deployment pipeline:

### 1. App Metadata Processing
- SideCar runs app check-in on schedule
- Retrieves metadata (App policies) and runs detection before starting content download
- Uses `IntuneManagementExtension` content folder for metadata
- Key logs: `IntuneManagementExtension.log`, `AppWorkload.log`

**User vs Device Context**:
- User Session: AAD user session found → user context
- No AAD User: context set to System, `Userid = 00000000-0000-0000-0000-000000000000`

### 2. Detection, Applicability and Requirements

**ActionProcessor** initiates detection and applicability for all apps:
- **DetectionActionHandler**: Runs detection rules (Registry=0, MsiProductCode=1, FilePath=2, PowershellScripts=3)
- **ApplicabilityHandler**: Evaluates intent (NotTargeted=0, RequiredInstall=1, RequiredUninstall=2, AvailableInstall=3, AvailableUninstall=4)
- Requirements: OS architecture, minimum Windows version, disk space, memory, CPU

### 3. Download and Unzip
- Content downloaded to "Incoming" folder → moved to "Staging" for hash verification and unzip
- Uses Delivery Optimization (DO) for download
- Hash validation → decryption → unzip to `C:\Windows\IMECache\{appId}`
- Staging content cleaned up after successful unzip

### 4. Installation
- Final detection before install (confirm still not detected)
- **ExecutionActionHandler** and **Win32AppExecutionExecutor** run installation
- Install command executed from `C:\Windows\IMECache\{appId}` directory
- Exit code evaluated against ReturnCodes definition

### 5. Post-Installation
- Final detection to confirm installation
- Compliance state message generated and sent
- Registry updated: `HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\SideCarPolicies\StatusServiceReports`

## Kusto Queries

### Device Application Install Attempts
```kql
ApplicationInstallAttemptsByDeviceId('<deviceid>', datetime('2030-12-02 00:53'), datetime('2030-12-03 09:53'), 1000)
```

### Application Enforcement Status
```kql
DeviceManagementProvider
| where env_time > datetime(2025-09-08 17:00:18) and env_time < datetime(2025-09-08 17:08:19)
| where ActivityId == "<deviceid>"
| where appPolicyId contains 'Application_<appId>'
| where (EventId == 5767 or EventId == 5766)
| project userId, appPolicyId, EventId, TaskName, enforcementType, enforcementState, ECErrorCode=errorCode, EventMessage, deviceAssignmentCount, accountId, ActivityId, RelatedActivityId, env_time
```

EventId filters:
| EventId | TaskName |
|---------|----------|
| 5767 | DeviceManagementProviderAppEnforcementStatusEvent |
| 5766 | DeviceManagementProviderAppEnforcementAttemptEvent |

### Find Device Activity for Specific App
```kql
let _start = datetime(2030-09-16 14:00:00);
let _end = datetime(2030-09-16 14:00:20);
DeviceManagementProvider
| where env_time between (_start.._end)
| where message has "<AppName>"
| project details, aadDeviceId, env_time, ActivityId, deviceId, userId, accountId, accountContextId, message, scenarioInstanceId, Level
```

## Diagnostic Data Collection

Use Intune ODC or `mdmdiagnosticstool`.

### IME Logs
Location: `C:\ProgramData\Microsoft\IntuneManagementExtension\Logs`
- AgentExecutor.log
- AppWorkload.log
- IntuneManagementExtension.log

### Registry (App Deployment Tracking)
- Applicability/Install Status: `HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\SideCarPolicies\StatusServiceReports\<UserGUID>\<AppID>`
- Exit Code/Intent/Reboot Status: `HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\Win32Apps\<UserGUID>\<AppID>`

## Special Scenarios

### Win32 Apps in Windows S Mode
Windows 10 S mode only runs Store apps by default. Use **S mode supplemental policy** in Intune to enable Win32 app installation on S mode devices.

### PowerShell Script Installer
Custom installation scripts allow:
- Custom logging/events
- Stop/start services, modify registry
- Prompt users (close apps, provide license key)

**Limitations**: Only one application per script (app chain not supported).

## Constants Reference

### EnforcementState
| Range | State |
|-------|-------|
| 6000-6999 | Not Attempted |
| 5000-5999 | Error |
| 4000-4999 | Unknown |
| 2000-2999 | In Progress |
| 1000-1999 | Success |

### ComplianceState
Installed=1, NotInstalled=2, Error=4, Unknown=5, Cleanup=100

### DesiredState
None=0, NotPresent=1, Present=2, Unknown=3, Available=4

## Error Code Reference

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
