# Windows Update Ring Log Collection Guide

> Source: MCVKB/Intune/Windows/Windows Update Ring.md
> Status: draft (pending SYNTHESIZE)

## Registry Keys to Export (.REG)
- `HKLM\Software\Policies\Microsoft\Windows\WindowsUpdate`
- `HKLM\Software\Microsoft\WindowsUpdate\UpdatePolicy\Settings`
- `HKLM\Software\Microsoft\WindowsUpdate\UpdatePolicy\PolicyState` — how update ring is configured
- `HKLM\Software\Microsoft\PolicyManager\default\Update`
- `HKLM\System\CurrentControlSet\Control\EAS\Policies`

Reference: [Policy CSP - Update](https://docs.microsoft.com/en-us/windows/client-management/mdm/policy-csp-update)

## Event Logs to Export
- Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > **Admin** log
- Applications and Services Logs > Microsoft > Windows > DeviceManagement-Enterprise-Diagnostics-Provider > **Debug** log

## MDM Logs
- Settings > Account > Access work or school > Export your management log files

## Scheduled Tasks
```cmd
# Run as Admin
schtasks /query /TN \Microsoft\Windows\EnterpriseMgmt\ /XML one > bad_device.xml
```

## Windows Logs
- CBS logs from `C:\Windows\Logs\CBS`

## Windows Update Log
```powershell
Get-WindowsUpdateLog
# Output: WindowsUpdate.log on Desktop
```

## Setupreport Tool
1. Download Setupreport.cmd.txt, rename to Setupreport.cmd
2. Double-click to run (10-20 min)
3. Results saved to `C:\setup_report_<computername>`
4. Zip and upload; manually remove folder after

## Known Facts
- Update Ring policy only distributes **B releases** (Patch Tuesday, 2nd Tuesday)
- **C releases** (3rd week) and **D releases** (4th week) are preview/non-security; NOT distributed by Update Ring
- Out-of-band releases for critical vulnerabilities ARE distributed
- See intune-onenote-129 for details
