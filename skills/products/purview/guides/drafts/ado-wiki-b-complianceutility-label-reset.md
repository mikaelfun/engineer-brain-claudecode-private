---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Purview Message Encryption/How to: Purview Message Encryption/How to: Use UnifiedLabellingSupportTool or ComplianceUtility to perform Label Reset on Office Desktop apps or local machine"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Use%20UnifiedLabellingSupportTool%20or%20ComplianceUtility%20to%20perform%20Label%20Reset%20on%20Office%20Desktop%20apps%20or%20local%20machine"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to: Use ComplianceUtility (UnifiedLabelingSupportTool) for Label Reset & Log Collection

**Scope**: Local Office desktop apps only (Word, Excel, PowerPoint, Outlook Classic). **Not applicable to New Outlook (Monarch).**

## What this tool does
- Reset local Sensitivity Label / Label Policy / Template cache → forces re-download from service
- Replicate issue while collecting diagnostic logs (MPIP client logs, fiddler-like captures)
- Useful when: Sensitivity button missing/greyed out, labels not showing, label info outdated

## Prerequisites
- PowerShell 5.1
- (Optional) AipService module — for `-CollectAIPServiceConfiguration`, `-CollectProtectionTemplates`, `-CollectEndpointURLs`
- (Optional) ExchangeOnlineManagement module — for `-CollectLabelsAndPolicies`, `-CollectDLPRulesAndPolicies`
- (Optional) Microsoft.Graph module — for `-CollectUserLicenseDetails`

## Step 1: Install the Tool

```PowerShell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
Install-Module -Name ComplianceUtility -AllowClobber
```

Verify installation:
```PowerShell
ComplianceUtility
```

## Step 1A: Install Optional Modules (only needed for Collect operations)

```PowerShell
Install-Module AipService          # For AIP config/template/endpoint collection (requires admin)
Install-Module ExchangeOnlineManagement  # For label/DLP data collection (requires admin)
Install-Module -Name Microsoft.Graph     # For user license details (requires admin)
```

## Step 2: Perform a Client Reset

**When to use**: Sensitivity button missing/greyed out, labels not showing or outdated.

1. Close all Office apps (Teams can stay open unless issue is Teams-specific)
2. Run:
```PowerShell
ComplianceUtility -Reset Default
```
3. Confirm with 'Y' when prompted
4. Expected: "Success" status in green. If "Failed" (red): close ALL Office apps and retry.

> **Tip**: If also collecting a Fiddler trace — start Fiddler trace BEFORE opening Office apps after the reset.

## Step 3: Replicate Issue & Collect Logs

```PowerShell
ComplianceUtility -RecordProblem -CompressLogs
```

1. Close all Office apps, confirm with 'Y' (do NOT close PowerShell)
2. Open affected app, reproduce the issue
3. Close all Office apps again
4. Return to PowerShell and press `Enter` (MFA may be prompted)
5. Tool collects and compresses logs
6. Share compressed log files with support

## Quick Reference — Direct Command Parameters

| Parameter | Purpose |
|-----------|---------|
| `-Reset Default` | Reset local label/policy/template cache |
| `-RecordProblem -CompressLogs` | Collect logs during issue reproduction |
| `-CollectLabelsAndPolicies` | Export label and policy configuration (needs EXO module + admin) |
| `-CollectAIPServiceConfiguration` | Export AIP service configuration (needs AipService module + admin) |
| `-CollectProtectionTemplates` | Export RMS/AIP protection templates |
| `-CollectEndpointURLs` | Export AIP endpoint URLs |
| `-CollectDLPRulesAndPolicies` | Export DLP rules and policies |
| `-CollectUserLicenseDetails` | Export user license info (needs Graph module + admin) |
