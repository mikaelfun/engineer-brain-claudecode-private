---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/troubleshoot-csp-custom-settings"
importDate: "2026-04-21"
type: guide-draft
---

# Troubleshooting CSP Custom Settings for Windows 10 in Intune

## Step 1: Collect Deployment Status from Intune
1. In Intune admin center: Device Configuration > Assignment Status
2. Check Devices with Errors / Devices Failed
3. Select the failing profile > Device Status or User Status under Monitor
4. Check Per-Settings status to identify which specific OMA-URI setting fails

## Step 2: Collect Windows 10 Logs
1. Open Event Viewer > View > Show Analytic and Debug Logs
2. Navigate to: Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostic-Provider
3. Save Admin logs and Debug logs as .evtx files

## Step 3: Collect Entra ID Logs (if auth/communication issues)
1. Event Viewer > Applications and Services Logs > Microsoft > Windows > Microsoft Entra ID
2. Save Analytic and Operational logs
