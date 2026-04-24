---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/understand-troubleshoot-esp"
importDate: "2026-04-21"
type: guide-draft
---

# Troubleshooting the Enrollment Status Page (ESP)

## Log Collection
### User-initiated (on timeout)
- ESP shows Collect logs option; copy to USB drive

### Command Prompt (Shift+F10 during OOBE)
- User-driven Autopilot: mdmdiagnosticstool.exe -area Autopilot -cab <path>
- Self-deploying: mdmdiagnosticstool.exe -area Autopilot;TPM -cab <path>
- Runtime provisioning: mdmdiagnosticstool.exe -area DeviceProvisioning -cab <path>

## Key Registry
HKLM\\SOFTWARE\\Microsoft\\Enrollments\\{GUID}\\FirstSync

## Phase Skipping Detection
- SkipUserStatusPage = 0xffffffff
- SkipDeviceStatusPage = 0xffffffff

## Autopilot Diagnostics Script
Install-Script -Name Get-AutopilotDiagnostics -Force
Get-AutopilotDiagnostics -CABFile <path>

## Unexpected Reboots
- Reboots supported only during device setup phase (not account setup)
- Must be managed by Intune (specify return codes in package)
- Use reboot-URI CSP to detect triggers
