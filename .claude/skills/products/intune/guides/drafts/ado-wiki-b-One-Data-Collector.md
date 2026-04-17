---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Tools/One Data Collector"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools%2FOne%20Data%20Collector"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# One Data Collector explained
One Data Collector (ODC) is the main log capture tool for Intune on Windows and MacOS machines. It captures a vast majority of the data that is needed for troubleshooting most things related to Intune.

**Note: ODC is technically a third party tool. It is not managed / owned directly by Microsoft, but is created and managed by a Microsoft employee.**

[[_TOC_]]

# Latest Updates (January 2026)

| Update | Description |
|--------|-------------|
| **Windows 11 25H2 Support** | Added support for Windows 11 25H2 (Build 26200) - "Win11 2025 Update" |
| **WPM Logs Collection** | Added collection of Windows Package Manager (winget) logs: `%TEMP%\winget\defaultState\WPM-*.txt` |
| **Edge MAM Log Path Fix** | Fixed Edge MAM log path from `%LocalAppData%\Local\Microsoft\Edge\...` to `%LocalAppData%\Microsoft\Edge\User Data\MAMLog.txt` |
| **Registry Path Fixes** | Fixed duplicate path errors in CryptSvc and SCardSvr registry collection |

> **Note**: To get the latest updates, always re-download the Intune.xml file before running ODC.

# Windows ODC

## Instructions for gathering an ODC on Windows
In an admin PowerShell window, run:

```powershell
if (!(test-path c:\msftODC)){md C:\msftODC}
cd c:\msftODC\
Invoke-WebRequest https://aka.ms/intunexml -outfile Intune.xml
Invoke-WebRequest https://aka.ms/intuneps1 -outfile IntuneODCStandAlone.ps1
powerShell -ExecutionPolicy Bypass -File .\IntuneODCStandAlone.ps1
```

Takes 3-5 minutes (up to 30 min). Upload `c:\msftODC\hostname_CollectedData<timestamp>.zip`.

## Windows ODC Notes
- Windows ODC collects NDES role info on Windows Servers
- SyncML trace is NOT collected by ODC — must use SyncML Viewer separately
- **Supported Windows Versions** (as of January 2026):

| Build Number | Version | Marketing Name |
|--------------|---------|----------------|
| 26200 | Win11 25H2 | Win11 2025 Update |
| 26100 | Win11 24H2 | Win11 2024 Update |
| 22631 | Win11 23H2 | Win11 2023 Update |
| 22622 | Win11 22H2 | Win11 2022 Update |
| 19045 | Win10 22H2 | Win10 2022 Update |

## Key Files in ODC

- **dsreg_status.txt** → join status and PRT
- **GPResults_computer.html** → conflicting GPO
- **MDMDiagReport.html** → Intune device ID (ENTDMID) + applied policy
- **Microsoft-Windows-DeviceManagement-Enterprise-Diagnotsics-Provider%4Admin.evtx** → MDM info
- **Microsoft-Windows-AAD%4Operational.evtx** → auth issues
- **ComanagementHandler.log** → SCCM workloads / co-management enrollment
- **REG_SW_Microsoft_Enrollments.txt** → confirm Intune device ID (ENTDMID)
- **REG_SW_Microsoft_PolicyManager.txt** → policy applied by Intune
- **REG_SW_Policies.txt** → policy applied by non-Intune entities

## Files Collected by ODC

| Category | Path/Location | Description |
|----------|---------------|-------------|
| **Intune Management Extension** | `%ProgramData%\Microsoft\IntuneManagementExtension\Logs\*` | IME logs for Win32 apps, scripts |
| **Device Inventory** | `%ProgramFiles%\Microsoft Device Inventory Agent\Logs\*` | Device inventory agent logs |
| **EPM Agent** | `%ProgramFiles%\Microsoft EPM Agent\Logs\*` | Endpoint Privilege Management logs |
| **WPM (Winget)** | `%TEMP%\winget\defaultState\WPM-*.txt` | Windows Package Manager logs (NEW Jan 2026) |
| **Edge MAM** | `%LocalAppData%\Microsoft\Edge\User Data\MAMLog.txt` | Edge browser MAM policy logs |
| **WinGet State** | `%SystemRoot%\Temp\WinGet\defaultState` | WinGet application state |
| **Diagnostic Logs** | `%ProgramData%\microsoft\diagnosticlogcsp\collectors\*` | MDM diagnostic CSP logs |

# macOS ODC

## Instructions for gathering an ODC on MacOS
```bash
curl -L https://aka.ms/IntuneMacODC -o IntuneMacODC.sh
chmod u+x ./IntuneMacODC.sh
sudo ./IntuneMacODC.sh
```

Output: `IntuneMacODC.zip` in an ODC sub-folder.
