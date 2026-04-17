# Autopilot V2 (Device Preparation) — Service & Client Troubleshooting Deep Dive

> Source: OneNote — Troubleshooting Autopilot V2
> Related: onenote-autopilot-v2-comprehensive-tsg.md (enrollment flow overview)

## Service-Side Troubleshooting

### Enrollment Time Grouping (ETG)
- ETG (Just In Time Configuration) ensures devices auto-join the security group during enrollment
- **Critical**: The **Intune Provisioning Client** service principal must be set as the **owner** of the ETG security group
- If missing, create via PowerShell:
  ```powershell
  Import-Module AzureAD
  Connect-AzureAD
  New-AzureADServicePrincipal -AppId f1346770-5b25-470b-88bd-d5744ab7952c
  ```

### Verify ETG Assignment via Graph API
```
GET https://graph.microsoft.com/beta/deviceManagement/configurationPolicies('{policyId}')/retrieveJustInTimeConfiguration
```
Expected response: `targetType: "entraSecurityGroup"` with target group ID.

### Kusto Functions
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

## Client-Side Troubleshooting

### Provider Execution Order
1. **Standard User Provider** (optional) — removes user from Administrators group
2. **SLDM Provider** — installs LOB apps and policies (policies do not block)
3. **Scripts Provider** — PowerShell platform scripts only (not remediation)
4. **Apps Provider** — Win32 apps and WinGet apps

### AutopilotDDSZTDFile.json
For APv2, this file will NOT contain profile data. Instead shows:
```json
{"ErrorCode": 807, "ErrorReason": "ZtdDeviceIsNotRegistered"}
```
This is expected — APv2 does not use classic Autopilot registration.

### Key Registry Paths

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

### DevicePrepHint Values (from IME DLL)
| Value | State |
|-------|-------|
| 0 | NotStarted |
| 1 | Initializing |
| 2 | InProgress |
| 3 | Completed |
| 4 | ErrorOccurred |
| 5 | RebootRequired |
| 6 | Canceled |

### Event Logs
- **Microsoft-Windows-Shell-Core** — search for "DevicePrepPage"
- **Microsoft-Autopilot-BootstrapperAgent** — SLDM provider events

### IME Logs
IME detects APv2 mode by checking DevicePrepHintValue:
```
[APv2] Checking if device is in APv2 mode.
[APv2] Found DevicePrepHintValue = 2.
[APv2] Device is in APv2 mode: True.
```

Known Issues: https://learn.microsoft.com/en-us/autopilot/device-preparation/known-issues
