# Microsoft Entra Device Registration & Windows Autopilot Troubleshooting

Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/azure-ad-device-registration-autopilot

## Microsoft Entra Device Registration

### Connection Types
- Microsoft Entra registered
- Microsoft Entra joined
- Microsoft Entra hybrid joined

### Troubleshooter Tool
Use the [Device Registration Troubleshooter Tool](https://aka.ms/DevRegTS):
- Device health status **Pending** → option 5
- Missing Primary Refresh Token (PRT) → option 6

Reference: [Microsoft Entra device identity documentation](https://learn.microsoft.com/en-us/azure/active-directory/devices)

## Windows Autopilot

### CSV Import
1. Intune admin center → Devices > Windows > Windows enrollment > Devices (under Autopilot) > Import
2. Generate CSV with PowerShell:
```powershell
Install-Script -Name Get-WindowsAutoPilotInfo
Get-WindowsAutoPilotInfo.ps1 -OutputFile autopilot.csv
```

### Log Collection
Collect logs first using:
```console
mdmdiagnosticstool.exe -area Autopilot -cab <path>
```

### Key Log Files
- `microsoft-windows-devicemanagement-enterprise-diagnostics-provider-admin.evtx`
- `microsoft-windows-moderndeployment-diagnostics-provider-autopilot.evtx`
- `MdmDiagReport_RegistryDump.reg`
- `TpmHliInfo_Output.txt`
- `microsoft-windows-provisioning-diagnostics-provider-admin.evtx` — ESP events (app failures, timeouts)

### ESP-related Event Examples
- `AutoPilotGetOobeSettingsOverride succeeded: OOBE setting = AUTOPILOT_OOBE_SETTINGS_AAD_JOIN_ONLY`
- `UnifiedEnrollment_ProvisioningProgressPage_ApplicationsFailed`
- `UnifiedEnrollment_ProvisioningProgressPage_DeviceConfigurationTimeOut`

### Further Resources
- [Troubleshooting overview](https://learn.microsoft.com/en-us/windows/deployment/windows-autopilot/troubleshooting)
- [Troubleshooting Windows Autopilot (level 300/400)](https://techcommunity.microsoft.com/t5/windows-blog-archive/troubleshooting-windows-autopilot-level-300-400/ba-p/706512)
