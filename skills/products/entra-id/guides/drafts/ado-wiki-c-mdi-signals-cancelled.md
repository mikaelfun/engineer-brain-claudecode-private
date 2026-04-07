---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Identity Protection/MDI Signals Onboarded to Entra Identity Protection For Hybrid Detection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Identity%20Protection/MDI%20Signals%20Onboarded%20to%20Entra%20Identity%20Protection%20For%20Hybrid%20Detection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MDI Signals Onboarded to Entra Identity Protection For Hybrid Detection

## Status: CANCELLED - Not proceeding to GA

The MDI and ID Protection teams decided not to proceed with General Availability due to unresolved remediation and signal quality blockers.

## Key Reasons for Cancellation

1. **Remediation Gaps**: No complete remediation strategy for on-prem threats. CA cannot fully mitigate these risks.
2. **Signal Quality**: Low True Positive rates with large presence of Benign Positive alerts (~5 alerts/org/month).
3. **Aggregation Issues**: Dynamic alerting led to inflated detection volumes (fix implemented).

## Alert Metrics (at cancellation)

| Alert | Severity | Volume | Orgs | TP Rate |
|---|---|---|---|---|
| Suspicious additions to sensitive groups | Medium | 4,052/month | 2,451 | 5.4% |
| Suspected Kerberos SPN exposure | High | 2,644/month | 856 | 19.6% |

## Original Goal

Unified Entra ID Risk Level for hybrid users - on-prem compromise detected by MDI would be shared with Entra to protect cloud user.

## Signals (were planned)

1. **Suspected Kerberos SPN exposure** (KerberoastingSecurityAlert) - Medium risk
2. **Suspicious additions to sensitive on-prem group** (AbnormalSensitiveGroupMembershipChangeSecurityAlert) - Medium risk

## Strategic Direction

Focus shifted to OneRisk/UnifiedRisk project for scalable framework incorporating remediable signals across XDR.

## Escalation

ICM Path: Identity Protection Service > Pipelines
