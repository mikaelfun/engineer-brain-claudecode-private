# ASR Rules Troubleshooting Guide

> Source: https://learn.microsoft.com/defender-endpoint/troubleshoot-asr
> Status: guide-draft (pending SYNTHESIZE)

## Prerequisites

ASR rules require:
- Windows 10 Enterprise or later
- Microsoft Defender Antivirus as the only active AV
- Real-time protection enabled
- Rules set to Block or Warn mode

## False Positive Diagnosis (Rule Blocking Legitimate Files)

1. **Enable Audit mode** for the problem rule (action = 2)
2. Reproduce the issue and check Windows Event Viewer:
   - Path: Applications and Services Logs > Microsoft > Windows > Windows Defender > Operational
   - Block events: 1121, 1126, 1131, 1133
   - Audit events: 1122, 1125, 1132, 1134
   - Warn mode user override: 1129
3. **Add exclusions** via Intune, Group Policy, or PowerShell:
   - Intune: Endpoint security > Attack surface reduction > ASR Only Per Rule Exclusions
   - PowerShell: `Add-MpPreference -AttackSurfaceReductionOnlyExclusions "<path>"`
   - Per-rule exclusions require full file path (not just filename)

## False Negative Diagnosis (Rule Not Blocking)

1. Verify rule is in Block mode (not Audit):
   ```powershell
   $p=Get-MpPreference
   0..([math]::Min($p.AttackSurfaceReductionRules_Ids.Count,$p.AttackSurfaceReductionRules_Actions.Count)-1) | % {
     [pscustomobject]@{Id=$p.AttackSurfaceReductionRules_Ids[$_];Action=$p.AttackSurfaceReductionRules_Actions[$_]}
   } | Format-Table -AutoSize
   ```
   Action values: 0=Disabled, 1=Block, 2=Audit, 6=Warn
2. Verify no extra characters (quotes/spaces) in Group Policy GUID values
3. If still not working, collect diagnostics and report to Microsoft

## Collecting Diagnostics

- **MDE Client Analyzer**: Download and run with `-v` flag during reproduction
- **MpCmdRun**: `MpCmdRun.exe -GetFiles` generates `MpSupportFiles.cab`
  - Key files: MPOperationalEvents.txt, MPRegistry.txt, MPLog.txt
- **Report false positive/negative**: https://www.microsoft.com/wdsi/support/report-exploit-guard

## Key Event IDs

| Event ID | Meaning |
|----------|---------|
| 1121, 1126, 1131, 1133 | Block events |
| 1122, 1125, 1132, 1134 | Audit events |
| 1129 | User override (Warn mode) |
| 5007 | ASR configuration changes |
