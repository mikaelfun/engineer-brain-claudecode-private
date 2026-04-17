# Troubleshoot Windows Update Rings in Intune

> Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-protection/troubleshoot-update-rings

## Overview

Windows Update ring policies define update strategy (deferral periods, driver blocking, maintenance times) using the Windows Policy CSP. They do NOT provide update infrastructure — they rely on Windows Updates for Business (WUFB).

## Prerequisites

- Windows 10 v1607+ or Windows 11
- Editions: Pro, Enterprise, Team (Surface Hub), Holographic for Business (subset), LTSC (subset)

## Troubleshooting Decision Tree

### 1. Check Intune Admin Center

- Navigate: Devices > Windows > Update rings for Windows 10 and later
- Select the policy → View report → check per-device status
- Two entries per device is normal (user context + system context)
- Kiosk/Autologon devices: only system account entry

### 2. Verify Settings on Device

- Settings > Accounts > Access work or school → check managed policies
- Settings > Windows Updates > Advanced options > Configured update policies
- Verify policy type = "Mobile Device Management" (not "Group Policy")

### 3. Check for MDM vs GPO Conflicts

**Most common root cause of Update ring failures.**

- Run `gpresult /r` to see active group policies
- GPO from SCCM shows as "Local Group Policy" source
- MDM + GPO conflict → updates won't apply or apply incorrectly
- `ControlPolicyConflict` CSP can help resolve some conflicts (but NOT for Update Policy CSP)

### 4. Verify Registry Keys

- Intune writes to: `HKLM\SOFTWARE\Microsoft\PolicyManager\current\device\Update`
- Windows Update keys: `HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU`
- Check if `UpdateServiceUrl` points to WSUS vs WU
- If WSUS, verify `DisableDualScan` is set to `0`

### 5. MDM Diagnostics Report

- Settings > Accounts > Access work or school > Export
- If Update ring policy appears in report → policy deployed successfully

### 6. Event Viewer Logs

- Intune events: Applications and Services logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin
- Windows Update Client: Applications and Services logs > Microsoft > Windows > WindowsUpdateClient

## Common Issues Checklist

| Check | Detail |
|-------|--------|
| Telemetry enabled? | Device Restriction policy or GPO |
| Network connectivity? | Airplane mode / no service → policy applies when connected |
| TargetReleaseVersion conflict? | Check via GPO or Settings Catalog |
| Co-managed? | Verify Windows Update workload switched to Intune |
| Conflicting policies? | Check for conflicts in Device Configuration pane |
| Correct assignment? | Verify user/device group targeting |
| Edition support? | Some settings only apply to certain Windows versions/editions |
