# Autopilot V2 Client-Side Troubleshooting

## Service Troubleshooting

### Enrollment Time Grouping (ETG)
- Security group must have **Intune Provisioning Client** as owner
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
Response should contain `targetType: "entraSecurityGroup"` with the target group ID.

### Kusto Queries (Service-Side)
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

## Client Troubleshooting

### Providers Execution Order
1. **Standard user provider** (optional) - removes user from Administrators
2. **SLDM provider** - LOB apps + policies
3. **Scripts provider** - PowerShell platform scripts
4. **Apps provider** - Win32 + WinGet apps

### AutopilotDDSZTDFile.json
For APv2, this file will NOT contain profile data:
```json
{"ErrorCode": 807, "ErrorReason": "ZtdDeviceIsNotRegistered", ...}
```
This is expected -- APv2 gets profile AFTER enrollment, not before.

### Device Preparation CSP Registry
Path: `HKLM\software\microsoft\provisioning\AutopilotSettings\DevicePreparation`

| Key | Values |
|-----|--------|
| PageEnabled | 0=Disabled, 1=Enabled |
| PageSettings | JSON with timeout/error message/allowSkip/allowDiagnostics |
| PageStatus | 0=Disabled, 1=Enabled, 2=InProgress, 3=ExitOnSuccess, 4=ExitOnFailure |
| PageErrorPhase | Enum for error phase |
| PageErrorCode | HRESULT |
| PageErrorDetails | Error message string |

### Orchestrator ExecutionContext
Path: `HKLM\...\DevicePreparation\BootstrapperAgent\ExecutionContext`
Contains JSON manifest with providers, batches, and actions.

### MDM Alert Hint
Path: `HKLM\software\microsoft\provisioning\AutopilotSettings`
- `AutopilotDevicePrepHint` registry key read by OMADM client

### SLDM Provider State
Path: `HKLM\...\DevicePreparation\MDMProvider`
- workloadState enum: 0=NotStarted, 1=InProgress, 2=Completed, 3=Failed
- Status: "Provisioning Complete" when done

### IME Log Analysis
IME logs detect APv2 mode via DevicePrepHintValue:
```
[APv2] Checking if device is in APv2 mode.
[APv2] Found DevicePrepHintValue = 2.
[APv2] Device is in APv2 mode: True.
```

**DeploymentAgentProgressStateDto enum:**
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
- **Device Preparation page**: `Microsoft-Windows-Shell-Core`, search "DevicePrepPage"
- **SLDM provider**: `Microsoft-Autopilot-BootstrapperAgent`
- **Scripts/Apps**: Sidecar log, search "APv2"

## Source
OneNote: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Windows TSG/Autopilot V2 TSG - Windows Device Preparation/Troubleshooting  Autopilot V2.md
