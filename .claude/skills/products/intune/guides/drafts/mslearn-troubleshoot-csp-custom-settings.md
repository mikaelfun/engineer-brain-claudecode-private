---
title: Troubleshooting CSP Custom Settings for Windows 10
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/troubleshoot-csp-custom-settings
product: intune
type: guide-draft
---

# Troubleshooting CSP Custom Settings for Windows 10

## Data Collection from Intune

1. Find CSP custom profile deployment status in Intune admin center:
   - Device Configuration > Assignment Status
   - Check Devices with Errors / Devices Failed / Devices Succeeded
2. Select profile showing errors > Device Status or User Status under Monitor
3. Check Per-Settings status for individual setting errors

## Collect Logs from Windows 10

1. Open Event Viewer > View > Show Analytic and Debug Logs
2. Navigate to: Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostic-Provider
3. Save Admin logs and Debug logs as .evtx files
4. Select "Display information for these languages" > English

## Collect Microsoft Entra Logs

For authentication/workplace join issues:
1. Event Viewer > Applications and Services Logs > Microsoft > Windows > Microsoft Entra ID
2. Save Analytic and Operational logs

## Key Log Locations

| Log Type | Path |
|----------|------|
| MDM Admin | DeviceManagement-Enterprise-Diagnostic-Provider/Admin |
| MDM Debug | DeviceManagement-Enterprise-Diagnostic-Provider/Debug |
| Entra Analytic | Microsoft Entra ID/Analytic |
| Entra Operational | Microsoft Entra ID/Operational |

## Reference

- [Custom settings for Windows 10](https://learn.microsoft.com/en-us/mem/intune/configuration/custom-settings-windows-10)
- [CSP reference for IT pros](https://learn.microsoft.com/en-us/windows/configuration/provisioning-packages/how-it-pros-can-use-configuration-service-providers)
