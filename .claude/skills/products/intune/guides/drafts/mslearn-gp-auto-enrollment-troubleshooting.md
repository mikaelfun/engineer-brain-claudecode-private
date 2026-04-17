# Windows 10 Group Policy-based Auto-Enrollment Troubleshooting

Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/troubleshoot-windows-auto-enrollment

## Verification Checklist

1. **Intune License**: Verify user has a valid Intune license assigned
2. **Auto-enrollment enabled**: Entra ID > Mobility (MDM and MAM) > Microsoft Intune
   - MDM user scope = All (or Some with correct groups)
   - MAM User scope = None (otherwise overrides MDM scope)
   - MDM discovery URL = `https://enrollment.manage.microsoft.com/enrollmentserver/discovery.svc`
3. **Windows version**: 1709 or later
4. **Hybrid Entra joined**: Run `dsregcmd /status` and verify:
   - AzureAdJoined: YES
   - DomainJoined: YES
   - AzureAdPrt: YES
5. **MDM provider**: If both "Microsoft Intune" and "Microsoft Intune Enrollment" appear under Mobility, configure auto-enrollment under "Microsoft Intune"
6. **Group Policy deployed**: Computer Configuration > Policies > Administrative Templates > Windows Components > MDM > Enable automatic MDM enrollment using default Microsoft Entra credentials
7. **No legacy client**: Device not enrolled via classic Intune PC agent
8. **Entra Device Settings**: "Users may join devices to Entra ID" = All; device count under quota
9. **Enrollment restrictions**: Windows enrollment allowed

## MDM Log Analysis

Event Viewer path: `Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostic-Provider > Admin`

| Event ID | Meaning |
|----------|---------|
| 75 | Auto MDM Enroll: Succeeded |
| 76 | Auto MDM Enroll: Failed (check error code) |
| Neither | Enrollment was never triggered → check Task Scheduler |

## Task Scheduler Diagnostics

Task: `Schedule created by enrollment client for automatically enrolling in MDM from Microsoft Entra ID`
Path: Microsoft > Windows > EnterpriseMgmt

Runs every 5 minutes for one day after GP deployment.

Task Scheduler Event Log: `Applications and Services Logs > Microsoft > Windows > Task Scheduler > Operational`

| Event ID | Meaning |
|----------|---------|
| 107 | Task triggered |
| 102 | Task completed (does not confirm enrollment success) |

### Task Not Starting

- **Already enrolled in another MDM**: Event 7016 with error 2149056522 → unenroll from other MDM first
- **Group Policy issue**: Run `gpupdate /force` and troubleshoot AD
