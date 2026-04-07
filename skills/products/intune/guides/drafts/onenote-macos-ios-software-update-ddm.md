# macOS/iOS Software Update: DDM vs Software Update Policy

## Overview

Two approaches to manage Apple software updates via Intune:

1. **Declarative Device Management (DDM)** = Managed Software Update Policy
2. **Software Update Policy** (legacy)

## Key Differences

| Feature | DDM | Software Update Policy |
|---------|-----|----------------------|
| Delivery | Policy delivered to client; client triggers update itself | Intune service triggers update at check-in time |
| Supported since | macOS 14+, iOS 17+ (recommended) | Earlier versions |
| Precedence | Higher priority | Lower priority |

## Precedence Order

### iOS/iPadOS
1. Declarative software updates (Settings catalog > DDM > Software Update)
2. Update policies (Devices > Update policies for iOS/iPadOS)

### macOS
1. Declarative software updates (Settings catalog > DDM > Software Update)
2. Update policies (Devices > Update policies for macOS)
3. Software updates (Settings catalog > System Updates > Software Update)

## MDM Software Update Command Sequence

1. `ScheduleOSUpdateScanCommand` — find available updates
2. `AvailableOSUpdatesCommand` — get update list
3. `ScheduleOSUpdateCommand` — download selected update
4. `OSUpdateStatusCommand` — poll status until `IsDownloaded`
5. `ScheduleOSUpdateCommand` (install) — trigger installation

## Known Limitations

- **macOS 13**: `InstallLater` action is NOT supported (also no DownloadOnly, NotifyOnly, InstallForceRestart)
- **Priority key**: Only applies to minor version updates (e.g., macOS 12.x → 12.y). Do NOT set Priority for major updates.
- `InstallLater` in Apple MDM only applies to minor version updates per Apple documentation.

## DDM Troubleshooting

### Kusto Query
```kusto
DDMHighLevelCheckin("{{deviceid}}")
```

### Console Log Keywords
Look for `softwareupdated` process entries:
```
SUOSUMobileSoftwareUpdateController: This system is managed and a PMV was set
SUOSUScheduler: ARMED (mode=1)
SUOSUTonightObserver: Predicted start date / end date
```

## References
- [Declarative software updates | Microsoft Learn](https://learn.microsoft.com/en-us/mem/intune/protect/software-updates-declarative-ios-macos)
- [ScheduleOSUpdateCommand | Apple Developer](https://developer.apple.com/documentation/devicemanagement/scheduleosupdatecommand/command/updatesitem)
- [Integrating Declarative Management | Apple Developer](https://developer.apple.com/documentation/devicemanagement/integrating_declarative_management)
