---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/azure-ad-device-registration-autopilot"
importDate: "2026-04-21"
type: guide-draft
---

# Troubleshooting Entra Device Registration and Windows Autopilot

## Entra Device Registration
- Use the Device Registration Troubleshooter Tool for common issues
- If device health status is Pending: select option 5 in troubleshooter
- If device lacks PRT (Primary Refresh Token): select option 6
- Join types: Entra registered, Entra joined, Entra hybrid joined

## Windows Autopilot CSV Import
- Use Get-WindowsAutoPilotInfo PowerShell script to generate hardware hash CSV
- Install: Install-Script -Name Get-WindowsAutoPilotInfo
- Import: Intune > Devices > Windows > Windows enrollment > Devices > Import

## Key Log Files
- devicemanagement-enterprise-diagnostics-provider-admin.evtx
- moderndeployment-diagnostics-provider-autopilot.evtx
- MdmDiagReport_RegistryDump.reg
- TpmHliInfo_Output.txt
- provisioning-diagnostics-provider-admin.evtx (ESP errors)

## Key ESP Events
- AutoPilotGetOobeSettingsOverride: OOBE setting status
- ProvisioningProgressPage_ApplicationsFailed: app install failure
- ProvisioningProgressPage_DeviceConfigurationTimeOut: config timeout
