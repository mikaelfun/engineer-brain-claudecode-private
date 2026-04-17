# EOP FN/FP Escalation Process

> Source: OneNote — Mooncake POD Support Notebook / M365 MDO EOP / FN-FP Escalation
> Status: draft (pending SYNTHESIZE review)

## Definitions

- **False Positive (FP)**: System incorrectly marks legitimate email as spam/phishing/malware/unsafe URL
- **False Negative (FN)**: System fails to detect and block actual spam/phishing/malware/unsafe URL

## Escalation Process (Updated 2026-03)

### Step 1: Check Pattern History

Before filing a new escalation, check FN/FP tracking list for recurring patterns.
If pattern is recurring, indicate this in escalation so PG can implement permanent fix (not just temporary allow).

### Step 2: File via Assist 365

Use **Assist 365** with one of these paths:

| Path | Type | Severity |
|------|------|----------|
| Exchange Online\Analysts (FPFN) | CFL/PSI/CRITSIT | Sev 2 IcM (pages OCE) |
| Exchange Online\Analysts (FPFN) | ISSUE | Sev 3 IcM |

> **Note**: Analysts do NOT handle RFCs or DCRs.

### Mandatory Information

At least one of the following must be provided:
- **Network Message IDs (NMIDs)**
- **Entity to investigate**: Email sample / URL / File sample / Domain
- **Sonar Submission ID**: For cases raised as Sonar FP/FN

### ICM Template (Gallatin/21v)

Template: `https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=a11R3e`
- Choose **China/Gallatin** Cloud Instance
- Refer to [Support Request Guidelines](https://microsoft.sharepoint.com/sites/MDOSecurityResearch/SitePages/Support-Request-Guidelines.aspx) for severity determination

## Sonar AWB

- **Access request**: [CoreIdentity Sonar Entitlement](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/sonarawbport-qafq)
- **Ticket list**: [AWB Customer Escalations](https://sonar-analyst-workbench.daas.microsoft.com/Customer/Escalations)
- **New submission**: [AWB New Escalation](https://sonar-analyst-workbench.daas.microsoft.com/Customer/Escalations/New)
- **Submission template**: [Enterprise Email Escalations on AWB](https://microsoft.sharepoint.com/sites/MDOSecurityResearch/SitePages/Enterprise-Email-Escalations-on-AWB.aspx)

## Block Type Reference

| Entity | Heuristic | Cluster | ML | TI | Analyst | Sonar |
|--------|-----------|---------|-----|-----|---------|-------|
| URL | URL Heuristic | URL Cluster | URL ML | URL TI | URL Analyst | - |
| Attachment | File Heuristic | File Cluster | File ML | File TI | File Analyst | - |
| Email | - | Email Cluster | - | - | Email Analyst | - |
| URL Domain | - | - | - | - | - | URL Domain Sonar |
| P2 Sender Domain | - | - | - | - | - | P2 Sender Domain Sonar |
| IP | - | - | - | - | - | IP Sonar |
