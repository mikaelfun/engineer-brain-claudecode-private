# Purview Self-Help Diagnostics Reference

> Source: https://learn.microsoft.com/troubleshoot/microsoft-365/purview/diagnostics/purview-compliance-diagnostics
> Status: guide-draft (pending SYNTHESIZE review)

## Overview

Microsoft Purview provides self-help diagnostics in two locations:
1. **Solutions pages** in the Purview portal (requires Organization Configuration role)
2. **Help pane** in the Purview portal and M365 admin center

## Solutions Page Diagnostics

| Issue | Cmdlet Used | Portal Link |
|-------|-------------|-------------|
| Email encryption not working | `Test-IrmConfiguration` | Information Protection > Diagnostics |
| User can't find sensitivity label | `Get-Label` / `Get-LabelPolicy` | Information Protection > Diagnostics |
| Autolabeling not applied to SPO/ODfB file | `Test-DlpPolicies` | Information Protection > Diagnostics |
| DLP rule not enforced for user | `Get-DlpCompliancePolicy` / `Get-DlpComplianceRule` | DLP > Diagnostics |
| Endpoint DLP policy sync issues | `Get-DlpCompliancePolicy` | DLP > Diagnostics |
| DLP alerts not working | `Get-DlpCompliancePolicy` / `Get-DlpComplianceRule` | DLP > Diagnostics |
| DLP rule not triggering for SPO/ODfB file | `Test-DlpPolicies` | DLP > Diagnostics |
| Policy tips not appearing in OWA | HAR diagnostic analysis | DLP > Diagnostics |

## Help Pane Diagnostics

| Diagnostic | Minimum Role | Shortcut URL |
|-----------|-------------|--------------|
| Archive mailbox | Any M365 admin | aka.ms/PillarArchiveMailbox |
| Retention policy for mailbox | Any M365 admin | aka.ms/PillarRetentionPolicy |
| Mailbox holds | Compliance admin | aka.ms/PillarMailboxHoldsDiag |
| Grace eDiscovery hold / invalid retention | Compliance admin | aka.ms/PillarInvalidRetention |
| Compromised account | Any M365 admin | aka.ms/diagca |
| eDiscovery RBAC | Any M365 admin | aka.ms/PillareDisRBACDiag |
| DLP policy and rule configuration | Global admin | aka.ms/PillarDLPPolicyConfig |
| DLP policy tips configuration | Global admin | aka.ms/PillarDLPPolicyTipsDiag |
| Sensitivity label configuration | Global admin | aka.ms/PillarMipLabelDiag |
| OME configuration | Any M365 admin | aka.ms/PillarOMEDiag |
| Audit configuration | Global admin | aka.ms/PillarAuditConfigDiag |

## Notes

- Help pane diagnostics are **NOT available** in GCC High, DoD, and 21Vianet environments
- Solutions page diagnostics require the `Check-PurviewConfig` cmdlet
- All diagnostics run read-only checks and do not modify tenant configuration without consent
