---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Server (Compute) Recommendations/Endpoint Protection/[TSG] EPP - I have installed endpoint solution, but it still showing recommendation/[Appendix] - Script"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Recommendations%20and%20remediation/Server%20(Compute)%20Recommendations/Endpoint%20Protection/%5BTSG%5D%20EPP%20-%20I%20have%20installed%20endpoint%20solution%2C%20but%20it%20still%20showing%20recommendation/%5BAppendix%5D%20-%20Script"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# EPP Appendix - Antimalware Detection Script

PowerShell script used by OMS for endpoint protection assessment. Contains protection status codes, threat status rankings, and scanning functions for SCEP/Defender.

## Protection Status Codes and Rankings

| Code Variable                         | Rank | Status                  |
|--------------------------------------|------|-------------------------|
| ThreatDetectedProtectionCode         | 550  | Threat Detected         |
| UnknownProtectionCode                | 470  | Unknown                 |
| NotReportingProtectionCode           | 450  | Not Reporting           |
| ActionRequiredProtectionCode         | 350  | Action Required         |
| NoRealTimeProtectionProtectionCode   | 270  | No real time protection |
| SignaturesOutOfDateProtectionCode    | 250  | Signatures out of date  |
| RealTimeProtectionCode              | 150  | Real time protection    |

## Threat Status Codes and Rankings

| Code Variable               | Rank | Status             |
|-----------------------------|------|--------------------|
| ActiveThreatCode            | 550  | Active             |
| UnknownThreatCode           | 470  | Unknown            |
| RemediatedThreatThreatCode  | 370  | Remediated         |
| QuarantinedThreatCode       | 350  | Quarantined        |
| BlockedThreatCode           | 330  | Blocked            |
| AllowedThreatCode           | 250  | Allowed            |
| NoThreatsDetectedThreatCode | 150  | No threats detected|

## Key Functions

### `Add-MalwareScan`
Adds a malware scan result to the global collection with protection/threat status, signature info, scan date, and tool name.

### `Scan-ComputerStatus`
Main scanning function that:
1. Collects computer status via `Get-MpComputerStatus` (Defender) or `Get-MProtComputerStatus` (SCEP)
2. Checks protection aspects: OnAccessProtection, IoavProtection, BehaviorMonitor, Antivirus, Antispyware, RealTimeProtection
3. Checks signature age (>7 days = out of date)
4. Determines overall protection status rank based on disabled features and signature age

### Threat Status Mapping from Status Codes
- 0 = Unknown
- 1 = Active (Detected)
- 2 = Remediated (Cleaned)
- 3 = Quarantined
- 4 = Remediated (Removed)
- 5 = Allowed
- 6 = Blocked (CleanFailed)
- 102 = Active (QuarantineFailed)
- 103 = Active (RemoveFailed)
- 104 = Quarantined (AllowFailed)
- 105-106 = Unknown (Abandoned)
- 107 = Remediated (BlockedFailed)

## Usage Notes
- Script runs as OMS scheduled task
- Assessment results appear in OMS event log (Event ID 9993)
- Event Viewer path: Application and Services Logs > Operations Manager
