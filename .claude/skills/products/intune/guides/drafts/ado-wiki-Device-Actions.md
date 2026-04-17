---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Actions"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Actions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Device Actions Troubleshooting Guide

## Available Actions by Platform
- Remote Lock, Reset Passcode, Restart, Rename, Retire, Wipe, Delete, Sync
- Windows-only: Autopilot Reset, BitLocker Key Rotation, Collect Diagnostics, Fresh Start, Full/Quick Scan, Pause Config Refresh, PIN Reset, LAPS Rotate
- iOS/macOS: Disable Activation Lock, Lost Mode, FileVault, Recovery Lock Rotate
- Android/iOS: Send Custom Notifications

## How Device Actions Work
MDM commands issued via API to trigger built-in OS-level functionality. Intune dynamically shows applicable actions per OS/enrollment type.

## Troubleshooting Flow
1. Confirm device is online and syncing with Intune
2. Verify action was issued via Kusto:
```kusto
HttpSubsystem
| where env_time > ago(5d)
| where url contains "<deviceId>"
| where url contains "remoteLock"  -- change action name
| project env_time, ActivityId, url
```
3. Confirm action reached device:
```kusto
DeviceManagementProvider
| where env_time > ago(5d)
| where deviceId == "<deviceId>"
| where message contains "lock"  -- change action name
| project env_time, message
```

## Common Issues

### Wipe Pending Indefinitely
Device didn't report back before reset. Confirm wipe succeeded, then delete device from service.

### Reset Passcode Not Supported (Android 8.0+ Work Profile)
Reset Token not activated. Need: (1) Work Profile passcode required in policy, (2) user set passcode, (3) user accepted reset prompt.

### Reset Passcode Greyed Out (Android Device Admin)
Google removed feature on Android 7.0+ Device Admin API (ransomware protection).

### Can't Restart After Wipe (Windows)
Caused by "continue to wipe even if devices lose power" option. Use bootable media to reinstall Windows.

### Activation Lock Code Not Showing (iOS)
Code expired (15-day validity) or device not Supervised. Check via Graph: `GET /beta/deviceManagement/manageddevices('{id}')?$select=activationLockBypassCode`

### Apps Not Removed After Retire
Only managed apps are removed (deployed as Required or installed via Company Portal).

### Sign Back Into Office After Retire
Retire doesn't revoke access tokens. Use Conditional Access to mitigate.

### Wipe Greyed Out (Android Work Profile)
Expected — Google doesn't allow factory reset via MDM for Work Profile devices.

## Recovery Lock (macOS)
- Requires macOS 11.5+ with Apple Silicon (not Intel)
- Settings Catalog: EnableRecoveryLockPassword + RecoveryLockPasswordRotationSchedule
- View/rotate password: Devices > device > Monitor > Passwords and keys
- Kusto validation queries available for policy application and command delivery

## W365 vs Intune Ownership
| W365 Owned | Intune Owned |
|------------|-------------|
| Restore, Reprovisioning, Resize, Place/Remove Under Review, Power On/Off | Collect Diagnostics, Rename, Sync |

## Scoping Questions
1. Bulk or single device? 2. Platform? 3. Which action? 4. Followed MS troubleshooting? 5. Device name/ID? 6. UPN? 7. Audit log access? 8. Time action sent? 9. Screenshot of status?

## Support Boundaries
- Wipe: If device bricked after successful wipe → contact OEM or Windows D&D team
- TeamViewer: License/app issues → TeamViewer Support
- Fresh Start: Stuck or not removing OEM apps → Windows team
