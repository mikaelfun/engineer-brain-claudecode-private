# Group Policy Auto-Enrollment Troubleshooting

> Source: OneNote — Mooncake POD Support Notebook / Intune / Windows TSG / Windows Enrollment

## Overview

Windows devices can be auto-enrolled into Intune MDM via Group Policy: `Computer Configuration > Policies > Administrative Templates > Windows Components > MDM > Enable automatic MDM enrollment using default Microsoft Entra credentials`.

## Troubleshooting Steps

### Step 1: Check Event Viewer

Open Event Viewer → `Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostic-Provider > Admin`

| Event ID | Meaning |
|----------|---------|
| 75 | Auto-enrollment succeeded |
| 76 | Auto-enrollment failed (check error code in event details) |
| Neither | Auto-enrollment task was never triggered |

### Step 2: Verify Task Scheduler

The auto-enrollment is triggered by a scheduled task: `Microsoft > Windows > EnterpriseMgmt`

- This task runs **every 5 minutes** for **1 day** duration
- Task is only visible with **admin credentials** in Task Scheduler
- Check task scheduler logs: `Applications and Services Logs > Microsoft > Windows > Task Scheduler > Operational`
  - Event ID **107**: Task triggered
  - Event ID **102**: Task completed (does NOT indicate enrollment success/failure)

### Step 3: If Task Not Triggered

1. Run `gpupdate /force` to force GP object application
2. Check for **stale enrollment entries** in registry:
   - Path: `HKLM\Software\Microsoft\Enrollments`
   - Old enrollment keys may remain after unenrollment
   - `gpupdate /force` fails with **error 2149056522** in Task Scheduler event ID 7016
3. **Fix**: Manually remove the stale registry key (the one with the most sub-entries)

### Step 4: GP Policy Verification

Verify the MDM auto-enrollment GP is applied:
- Run `gpresult /h gpreport.html` to check applied policies
- Confirm the GP targets the correct OU/group

## Log Collection Reference

- [Collect MDM Event Viewer Log (YouTube)](https://www.youtube.com/watch?v=U_oCe2RmQEc)
- [Microsoft docs: MDM enrollment diagnostics](https://learn.microsoft.com/en-us/windows/client-management/mdm-diagnose-enrollment)

## 21v Applicability

Fully applicable to 21v environment. Ensure Entra ID tenant has MDM auto-enrollment scope configured correctly.
