---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Management/Windows/Office"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FWindows%2FOffice"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Microsoft 365 / Office C2R Deployment Troubleshooting Guide

**Intune / MDM-Managed Environments L300 Escalation Reference**

## Architecture Overview

Microsoft 365 Apps use Click-to-Run (C2R) deployment technology. When managed through Intune, deployment follows a pipeline:

- **Office CSP** - MDM interface at `./Device/Vendor/MSFT/Office/Installation/{id}/install`
- **Office Deployment Tool (ODT)** - Bootstrapper (`setup.exe`) that reads configuration XML
- **OfficeClickToRun service** - Persistent service managing C2R virtualization
- **Delivery Optimization (DO)** - Primary transport for downloading Office payloads
- **BITS** - Fallback download transport

### Deployment Scenarios (search `Set executing scenario to` in logs)

| Scenario | Trigger | Description |
|---|---|---|
| INSTALL | OfficeCSP push or manual ODT `/configure` | First-time deployment |
| UPDATE | Automatic detection or forced `/update` | Delta update |
| REPAIR | User/admin-initiated online repair | Re-downloads full installation |

## Intune Deployment Flow

1. Device syncs with Intune, receives Office CSP policy via SyncML
2. Device downloads ODT from `officecdn.microsoft.com`
3. Two directories appear: `C:\Program Files\Microsoft Office` and `Microsoft Office 15`
4. Required = auto silent install; Available = Company Portal manual trigger
5. Downloaded files cleaned up after success

### Prerequisites
- Windows 10 1703+
- No MSI-based Office (or enable Remove MSI)
- No Office apps open during installation
- Only one M365 deployment per device
- For Autopilot ESP: deploy M365 Apps as Win32 app (not Microsoft 365 Apps type)

### Verbose Logging
```
reg add HKLM\SOFTWARE\Microsoft\ClickToRun\OverRide /v LogLevel /t REG_DWORD /d 3
```
Logs: `%WINDIR%\Temp\` and `%TEMP%\`, pattern `{MachineName}-{Timestamp}.log`

## Log File Locations

| Type | Location | Pattern |
|---|---|---|
| C2R Verbose | `%WINDIR%\Temp\` / `%TEMP%\` | `COMPUTERNAME-YYYYMMDD-HHMM[a-z].log` |
| OfficeCSP Registry | `HKLM\SOFTWARE\Microsoft\OfficeCSP` | Status codes, XML config |
| DO Log | PowerShell `Get-DeliveryOptimizationLog` | Job GUIDs, peer counts |

### ODC ZIP Relevant Paths
- `Intune\Files\MSI Logs\` - C2R verbose logs
- `Intune\RegistryKeys\` - OfficeCSP registry
- `Intune\Commands\General\` - DO log

## 5-Stage Deployment Pipeline

| Stage | Name | Key Evidence |
|---|---|---|
| 0 | Policy Delivery | OfficeCSP registry: GUID subkey, Status code |
| 1 | Bootstrap | C2R logs: CollectParameters, `/configure` mode |
| 2 | Download Init | C2R logs: `ShowPrereqFailureDialog`, `SetupFailedPreReq` |
| 3 | Payload Transfer | DO logs: job completions, error codes |
| 4 | Cache & Install | C2R logs: streaming/integration, HRESULT codes |

## CSP Status Codes

| Code | Meaning | Action |
|---|---|---|
| 0 | Success | Verify version matches target |
| 997 | Installing (IO_PENDING) | Investigate if stuck >24h |
| 70 | Failed | Terminal. Correlate with C2R logs |
| 1603 | Prereq/Fatal Error | Product conflict or architecture mismatch |
| 13 | Invalid Data | Cannot verify ODT signature |
| 1460 | Timeout | Failed to download ODT |
| 17002 | Failed to complete | User canceled, another install, disk space |
| 17004 | Unknown SKU | Content not on CDN or signature check failed |

## Error Code Reference

| HRESULT | Name | Resolution |
|---|---|---|
| 0x80070005 | Access Denied | AV blocking. Add Office exclusions |
| 0x80070020 | Sharing Violation | Close all Office apps |
| 0x80070643 | Fatal Install Error | Check CBS logs |
| 0x80070bc9 | Servicing Store Corruption | `DISM /Online /Cleanup-Image /RestoreHealth` |
| 0x800706be | RPC Failure | Restart ClickToRunSvc |

## Channel GUID Reference

| GUID | Channel |
|---|---|
| `492350f6-3a01-4f97-b9c0-c7c6ddf67d60` | Current Channel |
| `64256afe-f5d9-4f86-8936-8840a6a4f5be` | Current Channel (Preview) |
| `55336b82-a18d-4dd6-b5f6-9e5095c314a6` | Monthly Enterprise Channel |
| `7ffbc6bf-bc32-4f92-8982-f9dd17fd3114` | Semi-Annual Enterprise Channel |
| `f2e724c1-748f-4b47-8fb8-8e0d210e9208` | LTSC 2021 |
| `2e148de9-61c8-4051-b103-4af54baffbb4` | LTSC 2024 |

## Step-by-Step Triage Workflow

1. Collect logs (ODC ZIP or manual: C2R verbose + OfficeCSP registry + DO log)
2. Check OfficeCSP status code (0=Success, 70=Failed)
3. Verify prerequisites (no MSI Office, Windows 10 1703+, no apps open)
4. Identify scenario (`Set executing scenario to`)
5. Check hard blocks (`ShowPrereqFailureDialog` / `PrereqsFailed`)
6. Check ODT-level errors (missing `Microsoft Office` folders)
7. Analyze DO transport (DownloadMode, error codes; 2090 is informational)
8. Check HRESULT errors in C2R logs
9. Verify channel alignment (Configuration vs policy)
10. Document and escalate with stage, root cause, HRESULT, timestamps
