# Enrollment Status Page (ESP) Troubleshooting Guide

Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/understand-troubleshoot-esp

## Overview

The ESP can be used as part of any Windows Autopilot provisioning scenario or separately during default OOBE for Microsoft Entra join. ESP settings and tracking info are logged in the device registry.

## Log Collection

### User-initiated
- ESP timeout → user selects **Collect logs** → copy to USB

### Command Prompt (Shift+F10 during OOBE on non-S mode)
- **User-driven Autopilot**: `mdmdiagnosticstool.exe -area Autopilot -cab <path>`
- **Self-deploying / White glove**: `mdmdiagnosticstool.exe -area Autopilot;TPM -cab <path>`
- **Runtime provisioning (1809+)**: `mdmdiagnosticstool.exe -area DeviceProvisioning -cab <path>`

### Key file in cab
- `MDMDiagReport_RegistryDump.Reg` — contains all MDM enrollment registry keys

## Registry Keys

### ESP Settings
`HKLM\SOFTWARE\Microsoft\Enrollments\{EnrollmentGUID}\FirstSync`

### Skip ESP phases via CSP
- `SkipUserStatusPage` = 0xffffffff → skip account setup
- `SkipDeviceStatusPage` = 0xffffffff → skip device setup

### EnrollmentStatusTracking (Win10 1903+)
`HKLM\SOFTWARE\Microsoft\Windows\Autopilot\EnrollmentStatusTracking`

Subkeys:
- **Device\DevicePreparation** — SideCar (IME) install state: 1=NotInstalled, 2=NotRequired, 3=Completed, 4=Error
- **Device\Setup** — Win32 app tracking, TrackingPoliciesCreated, per-app InstallationState
- **ESPTrackingInfo\Diagnostics** — LOB/MSI apps, Wi-Fi profiles, SCEP certs, Store apps status with timestamps
- **{User_SID}** — account setup phase Win32 apps (user context)

### App InstallationState values
1. NotInstalled
2. InProgress
3. Completed
4. Error (ESP stops installing further apps)

## Diagnosing with PowerShell
```powershell
Install-Script -Name Get-AutopilotDiagnostics -Force
Get-AutopilotDiagnostics -CABFile <pathToOutputCabFile>
```

## Unexpected Reboots
- Check Event Viewer for `RebootRequiredURI` (event value 2800)
- Log shows which URI triggered reboot (e.g., Update/ManagePreviewBuilds)

## Common Issues

### Apps not tracked by ESP
- Apps must be assigned as **required** to device (device setup) or user (account setup) groups
- Must enable "Block device use until all apps installed" or include in blocking list
- Device-context apps must have no user-context applicability rules

### ESP showing for non-Autopilot enrollments
- ESP shows for all enrollment methods including co-management and first user login
- Use **Only show page to devices provisioned by OOBE** to limit

### Disable user ESP portion
OMA-URI: `./Vendor/MSFT/DMClient/Provider/MS DM Server/FirstSyncStatus/SkipUserStatusPage`
Data type: Boolean, Value: True

## App Deployment Timeout
- Common cause: timeout value too short for number of required apps (e.g., 5 min for 15+ apps)
- Check `InstallationState` = 4 (Error) in registry → review IME log for cause
