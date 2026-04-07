# Win32 App Deployment Troubleshooting Guide

> Source: OneNote — MCVKB/Intune/Windows/Win32 deployment Troubleshooting.md
> Status: draft

## When to Use

Troubleshooting Win32 app or MSI deployment failures via Intune, including IME (Intune Management Extension) issues.

## Prerequisites Check

### Enrollment Type Verification

IME only supports these enrollment types:
| Type | Description |
|------|-------------|
| 4 | AAD joined auto-enrollment |
| 9 | Hybrid AAD joined |
| 10 | Co-management enrolled |

**NOT supported**: AAD registered (Type 1), GPO enrollment.

Check: Sign in as Azure AD account on client desktop. Verify EnrollmentType in registry or device properties.

## Path 1: IME Not Installed

If Intune Management Extension is not present on the device:

### For MSI Apps (OMA-DM path)

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

### Kusto: Check IME Agent Status

```kusto
DeviceManagementProvider
| where env_time >= ago(24h)
| where * contains "<deviceId>"
| where * contains "IntuneWindowsAgent"
| project env_time, name, applicablilityState, reportComplianceState
| summarize max(env_time) by name, applicablilityState, reportComplianceState
```

## Path 2: IME Installed

Log location: `C:\ProgramData\Microsoft\IntuneManagement Extension\Logs`

Use **IME Log Interpreter** tool for structured analysis: [GitHub Releases](https://github.com/mikaelfun/Intune-IME-Project/releases)

### Kusto: Get IME Events

```kusto
IntuneEvent
| where env_time >= ago(24h)
| where ApplicationName == "SideCar"
| where ActivityId == "<deviceId>"
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, ComponentName, RelatedActivityId, SessionId
```

### Kusto: Get Policy Details

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
