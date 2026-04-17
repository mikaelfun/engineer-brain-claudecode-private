# Autopilot V2 Client-Side Troubleshooting

> Source: OneNote — Mooncake POD Support Notebook / Intune / ## Windows TSG / Autopilot V2 TSG / Troubleshooting Autopilot V2

## Service-Side Troubleshooting

### Enrollment Time Grouping (ETG)
- ETG is critical for smooth APv2 enrollment — device auto-joins the security group during enrollment
- **Owner must be set to Intune Provisioning Client service principal**
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

### Kusto Queries
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

## Client-Side Troubleshooting

### Provider Execution Order
Four providers execute in order:
1. **Standard User Provider** (optional) — removes user from Administrators group
2. **SLDM Provider** — installs LOB apps and policies (policies don't block)
3. **Scripts Provider** — PowerShell scripts (platform scripts only, not remediation)
4. **Apps Provider** — Win32 apps and WinGet apps

### AutopilotDDSZTDFile.json
For APv2 devices, this file won't contain profile data. Instead shows:
```json
{"ErrorCode": 807, "ErrorReason": "ZtdDeviceIsNotRegistered", ...}
```
This is **expected** for APv2.

### Key Registry Paths

**Device Preparation settings:**
```
HKLM\SOFTWARE\Microsoft\Provisioning\AutopilotSettings\DevicePreparation
  PageEnabled     = DWORD (0=disabled, 1=enabled)
  PageSettings    = JSON string with timeout, error message, skip-on-failure settings
  PageStatus      = DWORD (0=Disabled, 1=Enabled, 2=InProgress, 3=ExitOnSuccess, 4=ExitOnFailure)
  PageErrorPhase  = Enum value for reporting
  PageErrorCode   = HRESULT error code
  PageErrorDetails = Optional error message string
```

**Bootstrapper Agent manifest:**
```
HKLM\SOFTWARE\Microsoft\Provisioning\AutopilotSettings\DevicePreparation\BootstrapperAgent
  ExecutionContext = JSON manifest with provider list and batch execution plan
```

**MDM Alert Hint:**
```
HKLM\SOFTWARE\Microsoft\Provisioning\AutopilotSettings
  AutopilotDevicePrepHint = DWORD
```

**SLDM Provider state:**
```
HKLM\SOFTWARE\Microsoft\Provisioning\AutopilotSettings\DevicePreparation\MDMProvider
  Status   = "Provisioning Complete" or error
  Progress = JSON with workloadState (0=NotStarted, 1=InProgress, 2=Completed, 3=Failed)
```

### DevicePrepHintValue States (from IME DLL)
| Value | State |
|---|---|
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

### IME Log Analysis
Look for APv2 mode detection:
```
[APv2] Checking if device is in APv2 mode.
[APv2] Found DevicePrepHintValue = 2.
[APv2] Device is in APv2 mode: True.
```

## Known Issues
- See: https://learn.microsoft.com/en-us/autopilot/device-preparation/known-issues
