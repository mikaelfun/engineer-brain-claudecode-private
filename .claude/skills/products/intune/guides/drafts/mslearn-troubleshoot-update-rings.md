---
title: Troubleshooting Update Rings for Windows 10/11
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-protection/troubleshoot-update-rings
product: intune
type: troubleshooting-guide
---

# Troubleshooting Update Rings for Windows 10/11

## Key Concepts
- Update ring policies define update strategy (deferrals, maintenance times)
- Uses Windows Policy CSP, writes values to registry
- Requires WUFB for actual updates

## Prerequisites
- Windows 10 v1607+ or Windows 11
- Editions: Pro, Enterprise, Team, Holographic for Business
- LTSC: subset of settings only

## Verification Steps
1. Intune admin center: Devices > Windows > Update rings > View report
2. Device: Settings > Accounts > Access work or school
3. Configured update policies: Settings > Windows Updates > Advanced
4. Registry: HKLM\SOFTWARE\Microsoft\PolicyManager\current\device\Update
5. MDM diagnostics: Export from Access work or school
6. Event Viewer: DeviceManagement-Enterprise-Diagnostics-Provider Admin

## Common Issues
- MDM vs GPO conflicts: Use gpresult, ControlPolicyConflict CSP
- WSUS vs WU scanning: Check UpdateServiceUrl and DisableDualScan
- Co-management: Ensure Windows Updates workload switched to Intune
- Conflicting policies: Multiple Update ring or Settings Catalog policies
- Edition limitations: Some settings apply to certain versions only
