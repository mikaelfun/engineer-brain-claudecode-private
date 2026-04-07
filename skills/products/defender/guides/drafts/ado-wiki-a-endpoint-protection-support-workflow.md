---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Recommendations and remediation/Server (Compute) Recommendations/Endpoint Protection/Endpoint Protection support workflow"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Recommendations%20and%20remediation/Server%20(Compute)%20Recommendations/Endpoint%20Protection/Endpoint%20Protection%20support%20workflow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Endpoint Protection support workflow**

# Requirements
Azure Security Center must be in Standard Tier

# Reference Documentation
- https://docs.microsoft.com/en-us/azure/security-center/security-center-os-coverage
- https://docs.microsoft.com/en-us/azure/security-center/security-center-partner-integration

# What to check

1. **Check Assessment result via Event Viewer**
   Event Viewer -> Application and Services Logs -> Operations Manager
   - Events 9991, 9992, 9993, 9994
   - Most interesting event: 9993

   AntiMalware Collection Script scan sample:
   > DeviceName:MWOMS2012R2, Tool:System Center Endpoint Protection, Signature:1.249.1001.0, ScanDate:08/15/2017 12:52:28, DateCollected:08/15/2017 12:52:28, sRank:270, ProtectionStatus:No real time protection, ProtectionStatusDetails:;, ThreatStatusRank:150, ThreatStatus:No threats detected

2. **Windows Defender (SCEP) PowerShell commands:**
   - `Get-MpComputerStatus` (Defender) / `Get-MProtComputerStatus` (SCEP)
   - `Get-MpThreat` / `Get-MProtThreat`

3. **No real time protection with SCEP (Partial Monitoring):**
   [Troubleshooting OMS Security Real Time Protection Status - Part 1](https://blogs.technet.microsoft.com/msoms/2016/07/06/real-time-protection-status-issue-in-oms-security-and-audit-solution)

4. **No real time protection with SCEP (PowerShell issue):**
   [Troubleshooting OMS Security Real Time Protection Status - Part 2](https://blogs.technet.microsoft.com/msoms/2016/07/13/no-real-time-protection-status-in-oms-security-and-audit-solution)

5. **On VM workspace run the query:**
   ```kql
   ProtectionStatus
   | where Computer has "{vmName}"
   | project Computer, ThreatStatus, ThreatStatusRank, ProtectionStatus, ProtectionStatusRank, ProtectionStatusDetails
   ```

   To get recent threat:
   ```kql
   ProtectionStatus
   | where Computer contains "{vmName}" or ResourceId contains "{vmName}"
   | summarize arg_max(TimeGenerated, *) by TypeofProtection, Computer
   ```

# Protection Status and Threat Status Rankings

| Protection Status       | Rank | Threat Status      | Rank |
|------------------------|------|--------------------|------|
| Threat Detected        | 550  | Active             | 550  |
| Unknown                | 470  | Unknown            | 470  |
| Not Reporting          | 450  | Remediated         | 370  |
| Action Required        | 350  | Quarantined        | 350  |
| No real time protection| 270  | Blocked            | 330  |
| Signatures out of date | 250  | Allowed            | 250  |
| Real time protection   | 150  | No threats detected| 150  |

# Behavioural Analysis

Real-Time Protection result from `Get-MpComputerStatus` can be affected if Behaviour Monitoring is not enabled. Enable it [via Group Policy](https://docs.microsoft.com/en-us/microsoft-365/security/defender-endpoint/configure-real-time-protection-microsoft-defender-antivirus).

# MDE.Linux and Endpoint Protection

For MDE.Linux to be detected as endpoint protection:
```bash
# Configure
mdatp config real-time-protection --value enabled

# Validate
mdatp health --field real_time_protection_enabled
```

# IcM Data Collection Requirements
- Create IcM to "Azure Security Monitoring (Engineering)\ASM-Dev"
- Include all evidence from "What to check" section
