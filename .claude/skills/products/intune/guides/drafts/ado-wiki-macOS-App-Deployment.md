---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Management/Apple/macOS"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FApple%2FmacOS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# macOS App Deployment Troubleshooting Guide

## Overview

App deployment for macOS involves adding an app to Intune and assigning it to users, groups, and/or devices. Supported app types: Microsoft 365, Edge, PKG, LOB (Intunemac), macOS Apps (DMG).

## Support Boundaries

Intune does not support applications that fail to install during setup unless the failure only occurs when the device is enrolled in or managed by Intune. First step: verify if the problem occurs when installed manually or on a non-enrolled device. If yes → not an Intune problem, refer to app vendor.

**NOTE**: macOS LOB apps can only be deployed as "Uninstall" if the app was deployed with "Install as Managed" set to Yes.

## Scoping Questions

- What type of application? (Microsoft 365, Edge, PKG, LOB, DMG)
- Error message and where it occurs?
- Reporting-only issue? (app installs but shows as Not Installed)
- When did the issue start? Has it ever worked?
- How many devices affected? All targeted devices?
- Can the app be installed manually?
- Device model and OS version?
- How is the device enrolled?
- Impact and workaround availability?

## Troubleshooting

### VPP Apps on macOS
Same Kusto queries and workflow as iOS/iPadOS applies.

### Sidecar Agent (macOS PKG, DMG, Shell Scripts)

General query for a specific device:
```kql
//for macOS PKG, DMG or Shell Scripts
let IntuneASU = "AMSUA0xxx"; //use FXPASU01 for GCC High
let IntuneAccountID = "xxxxxx";
let IntuneDeviceID = "xxxxx";
IntuneEvent
| where env_time >= datetime(2025-10-20 00:01) and env_time < datetime(2025-10-20 23:59)
| where ApplicationName == "SideCar"
| where env_cloud_name == IntuneASU
| where AccountId == IntuneAccountID
| where ActivityId == IntuneDeviceID
| project env_time, EventUniqueName, ComponentName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, UserId, DeviceId
| sort by env_time asc
```

- Look for "resolvedTargeting": "U" = Uninstall, "R" = Required

### Validate Sidecar Agent Version + App Targeting
```kql
let IntuneDeviceID = "a99f93a2-...";
IntuneEvent
| where env_time >= datetime(2025-10-20 00:01) and env_time < datetime(2025-10-24 23:59)
| where ApplicationName == "SideCar"
| where ActivityId == IntuneDeviceID
| where ColMetadata has "AgentVersion"
| where EventUniqueName == "LogAppTargetingValidationResults"
| project env_time, EventUniqueName, ComponentName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, UserId, DeviceId
| sort by env_time asc
```

### IntuneMacODC Key Files

| File Name | Information |
|---|---|
| SW_vrs.txt | Software version with build number |
| QueryDeviceInformation.txt | Activation lock, CPU Architecture, supervision, SU Policies |
| IntuneProfiles.txt | Profiles delivered with Intune profile ID |
| Profiles_list.xml | Profiles delivered with content |
| mdatp_health.txt | Defender Policies pushed via MDM (AV) |
| pkgutil_pkgs.txt | MDM Deployed apps (BundleIDs only) |
| pkgutil_info.txt | MDM Deployed apps, version and install time |
| Library/Logs/Microsoft/IntuneScripts | Shell Script logs |
| Library/Logs/Microsoft/Intune/IntuneMDMDaemon | MDM daemon logs |
| Users/.../Library/Logs/Company Portal | Company Portal Logs (may be cropped) |

## FAQ

- **Which app types use the Sidecar Agent?** macOS app (DMG), macOS (PKG) and Shell scripts. IntuneMDMDaemon logs are critical for troubleshooting.
- **DMG vs LOB?** Use macOS app (DMG/PKG) — newer features and fixes, streamlined troubleshooting.

## Escalation Data Requirements

- For VPP: include VPP-specific data + Kusto query results
- For non-VPP: include SideCar logs or macOS ODC
- For DMG/PKG: screenshots of all configurations, pre/post install scripts
- Always include: App name/ID, timestamps of failed install attempts
