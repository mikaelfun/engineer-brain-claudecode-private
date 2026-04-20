---
title: Troubleshooting the Enrollment Status Page (ESP)
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/understand-troubleshoot-esp
product: intune
date: 2026-04-18
type: troubleshooting-guide
---

# Troubleshooting the Enrollment Status Page (ESP)

## Overview
The Enrollment Status Page (ESP) tracks device setup progress during Windows Autopilot and standard OOBE Entra join scenarios.

## Log Collection

### User-initiated
When ESP times out, user can select Collect logs and copy to USB drive.

### Command Prompt (Shift+F10 in OOBE on non-S mode)
- User-driven Autopilot: `mdmdiagnosticstool.exe -area Autopilot -cab <path>`
- Self-deploying/White glove: `mdmdiagnosticstool.exe -area Autopilot;TPM -cab <path>`
- Runtime provisioning: `mdmdiagnosticstool.exe -area DeviceProvisioning -cab <path>`

## Key Registry Locations

### ESP Settings
`HKLM\SOFTWARE\Microsoft\Enrollments\{EnrollmentGUID}\FirstSync`

### ESP Tracking (Win10 1903+)
`HKLM\SOFTWARE\Microsoft\Windows\Autopilot\EnrollmentStatusTracking`

Subkeys:
- `Device/DevicePreparation` - IME (SideCar) install state
- `Device/Setup` - Win32 app tracking and install status
- `ESPTrackingInfo/Diagnostics` - App and policy tracking with timestamps
- `{User_SID}` - User context Win32 apps (account setup phase)

### InstallationState Values
1 = NotInstalled, 2 = InProgress (or NotRequired for DevicePrep), 3 = Completed, 4 = Error

## Skip ESP Phases via CSP
- Skip user setup: `./Vendor/MSFT/DMClient/Provider/ProviderID/FirstSyncStatus/SkipUserStatusPage`
- Skip device setup: `./Vendor/MSFT/DMClient/Provider/ProviderID/FirstSyncStatus/SkipDeviceStatusPage`
- Registry value 0xffffffff indicates skipped

## Disable User ESP via Custom OMA-URI
- OMA-URI: `./Vendor/MSFT/DMClient/Provider/MS DM Server/FirstSyncStatus/SkipUserStatusPage`
- Data type: Boolean, Value: True

## Diagnostic Script
```powershell
Install-Script -Name Get-AutopilotDiagnostics -Force
Get-AutopilotDiagnostics -CABFile <path>
```

## Common Issues

### Apps not tracked by ESP
Requirements: apps must be assigned as Required to device/user Entra group, and either Block device use until all apps installed or included in the blocking list.

### Unexpected Reboots
Check Event Viewer for RebootRequiredURI event (ID 2800) to identify which URI triggered the reboot. Reboots only supported during device setup phase.

### App Deployment Failures
If any app InstallationState = 4 (Error), ESP stops installing apps. Check IME log for root cause. Common cause: timeout value too short for number of required apps.
