---
title: Troubleshooting Entra Device Registration and Windows Autopilot
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/azure-ad-device-registration-autopilot
product: intune
date: 2026-04-18
type: troubleshooting-guide
---

# Troubleshooting Entra Device Registration and Windows Autopilot

## Entra Device Registration

### Connection Options
- Entra registered (BYOD)
- Entra joined (cloud-only)
- Entra hybrid joined (on-prem AD + cloud)

### Diagnostic Tool
Device Registration Troubleshooter Tool: https://aka.ms/DevRegTS

Menu options:
- Option 5: Device health status Pending
- Option 6: Device does not have Primary Refresh Token (PRT) issued

### Reference
Full documentation: Entra device identity documentation

## Windows Autopilot

### Device Import
Import CSV via: Intune admin center > Devices > Windows > Windows enrollment > Devices (under Windows Autopilot Deployment Program) > Import

### Generate CSV
```powershell
Install-Script -Name Get-WindowsAutoPilotInfo
Get-WindowsAutoPilotInfo
```

### Key Log Files for Troubleshooting
- `microsoft-windows-devicemanagement-enterprise-diagnostics-provider-admin.evtx`
- `microsoft-windows-moderndeployment-diagnostics-provider-autopilot.evtx`
- `MdmDiagReport_RegistryDump.reg`
- `TpmHliInfo_Output.txt`
- `microsoft-windows-provisioning-diagnostics-provider-admin.evtx` (ESP events)

### ESP-related Events in Provisioning Log
- `AutoPilotGetOobeSettingsOverride succeeded` - OOBE setting status
- `UnifiedEnrollment_ProvisioningProgressPage_ApplicationsFailed` - App install failure
- `UnifiedEnrollment_ProvisioningProgressPage_DeviceConfigurationTimeOut` - Config timeout
