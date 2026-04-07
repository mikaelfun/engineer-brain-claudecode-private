---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Manage Software Updates/Windows/ESP Install Updates"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FManage%20Software%20Updates%2FWindows%2FESP%20Install%20Updates"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ESP Install Windows Updates (Quality Updates during OOBE)

## Overview
**Install Windows Updates** ESP toggle controls applying Quality Updates during ESP, relying on **New Device Update Promotion (NDUP)** from WUfB during Autopilot provisioning.

## Requirements
- Windows 11 version 22H2 or later
- ESP profile with "Install Windows Updates" enabled
- WUfB policies (Update Ring or Autopatch Groups) must be applied before update scan

## Supported Scenarios
- Autopilot Device Preparation
- Self-Deployment Mode

## Key CSP Settings
- Update/DeferQualityUpdatesPeriodInDays
- Update/PauseQualityUpdatesStartTime
- Update/ExcludeWUDriversInQualityUpdate
- Update/SetPolicyDrivenUpdateSourceForQualityUpdates

## Support Boundaries
- **Intune**: Settings configuration, policy delivery, deferral/pause behavior
- **Windows** (Collaboration): NDUP package installation, incorrect updates, install timing

## Troubleshooting
1. Check InstallQualityUpdates setting in Kusto: `DeviceManagementProvider | where message has("isInstallQualityUpdatesEnabled")`
2. ESP logs: Shift+F10 during OOBE → `mdmdiagnosticstool.exe -area "DeviceProvisioning;Autopilot" -cab C:\Logs\AutopilotLogs.cab`
3. NDUP logs: Aka.ms/QualityUpdatesAutopilotPrP (CollectNDUPLogs.zip for ICM/Windows Collaboration)

## FAQ
- ESP profiles after 2508 default to Yes for Install Windows Updates
- Only Quality Updates supported on ESP; other updates apply post-provisioning
- QUs install after ESP page; ESP Timeout not impacted
- Expedited updates not applied during provisioning
- GCCH supported; pre-registered device support may not be available
