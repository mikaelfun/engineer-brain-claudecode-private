---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Processes/Critical Risk Alert (CRA) (DRAFT)"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FProcesses%2FCritical%20Risk%20Alert%20(CRA)%20(DRAFT)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Critical Risk Alert (CRA)

**UNDER REVIEW**

_Preemptive Critical Functionality Loss Warning_

## Definition

**Critical Risk Alert (CRA)** is a preemptive governance signal raised by CSS when an issue is highly likely to escalate into a CFL if not mitigated in a short timeframe. It is NOT a CFL, does NOT trigger a Sev 2 ICM by default, and does NOT represent an active outage.

## Purpose

- Detect high-confidence early indicators of CFL-class failures
- Reduce Sev 2 CFL incidents through early engineering engagement
- Protect high-value, politically sensitive, or compliance-critical customers

## CRA vs CFL

| Aspect | CRA | CFL |
| --- | --- | --- |
| Nature | Predictive | Reactive |
| Customer Impact | Not yet realized | Active |
| Severity | Pre-Sev | Sev 2 |
| Goal | Prevent CFL | Restore service |
| Governance | Early warning | Incident |

## When CRA SHOULD be Raised

All of the following must apply:
- CSS has strong evidence issue will materially degrade or block critical governance functionality
- Issue threatens core Purview governance functionality (scan execution or asset availability)
- One or more: production environment, S500/Design Partner, politically sensitive, regulatory/compliance-critical, high leadership visibility

## When CRA SHOULD NOT be Raised

- Issue is already a confirmed CFL (raise CFL instead)
- Non-production only (unless exception approved)
- Feature limitation or known unsupported scenario
- Single isolated failure with no expansion signals

## Governance & Approval

- **Initiator**: CSS Engineer (EEE or equivalent)
- **Accountable**: CSS Lead (Regional)
- CSS Lead approval required, recorded in tracking artifact

## How to Proceed After Raising CRA

1. Raise Sev 3 ICM, add "CGA" to ICM title
2. Document rationale and risk indicators
3. Notify CSS Lead and EEE
