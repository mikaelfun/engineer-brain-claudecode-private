# WUFB / Windows Update Ring - Log Collection Guide

## Registry Keys (Export as .REG files)
- `HKLM\Software\Policies\Microsoft\Windows\WindowsUpdate`
- `HKLM\Software\Microsoft\WindowsUpdate\UpdatePolicy\Settings`
- `HKLM\Software\Microsoft\WindowsUpdate\UpdatePolicy\PolicyState` (Update ring config)
- `HKLM\Software\Microsoft\PolicyManager\default\Update`
- `HKLM\System\CurrentControlSet\Control\EAS\Policies`

## Event Logs
- Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Admin
- Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > Debug

## MDM Logs
1. Open Settings > Account > Access work or school
2. Click "Export your management log files"
3. Logs at: `C:\Users\Public\Documents\MDMDiagnostics\MDMDiagReport.html`

## Scheduled Tasks
```cmd
schtasks /query /TN \Microsoft\Windows\EnterpriseMgmt\ /XML one > bad_device.xml
```

## Windows Update Log
```powershell
Get-WindowsUpdateLog
```
Output: WindowsUpdate.log on Desktop

## CBS Logs
- Location: `C:\Windows\Logs\CBS\CBS.log`

## Advanced Diagnostic Script (WUFB scan/feature update)
1. Download collect_windowsupdate_log.cmd from ADO repo
2. Run as admin: `collect_windowsupdate_log.cmd /start`
3. Stop WU service, delete `C:\Windows\SoftwareDistribution`
4. Start WU service, click "Check for updates", reproduce issue
5. Run: `collect_windowsupdate_log.cmd /stop`
6. Collect all files from `C:\wutraces\`

### Key files in wutraces:
- `windowsupdate.etl` - WU client ETL logs
- `Netmon.etl` - network trace
- `MoUsoCoreWorker.*.etl` - USO client logs
- `Appcompat.reg` - appraiser registry
- `CAPI2 event log` - certificate events
- `updatering.reg` - Intune WUFB policy
- `windowsupdate.reg` - AU Group Policy
- `Windowsupdate2.reg` - AU state

## Important Notes
- Windows Update Ring policy only receives B (Patch Tuesday) releases
- C/D preview releases are not distributed by the policy (confirmed by PG)
- WUFB report is not ready in 21v environment
- Intune autopatch (WUFB-DS/DSS) is currently not available in Mooncake
