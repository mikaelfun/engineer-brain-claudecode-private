---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Identity Protection/Unified Risk Signals in Entra ID Protection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Identity%20Protection%2FUnified%20Risk%20Signals%20in%20Entra%20ID%20Protection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Unified Risk Signals in Entra ID Protection (User Risk Compounding)

## Summary

User Risk Compounding enhances Entra ID Protection by aggregating correlated risk signals from Entra ID Protection and Microsoft Defender to calculate more accurate overall user risk. Users previously at medium risk may be elevated to high risk when multiple related detections are combined.

## Requirements

- Entra ID P2 for identity risk detection
- Microsoft 365 E5 (includes Defender suite + Purview)
- Microsoft Defender for Identity (MDI) must be configured
- **Link unified risk signals for Identity Protection user risk** must be enabled
- RBAC: Security Administrator, CA Administrator, Security Operator/Reader

## Enable Unified Risk Score

### Portal
Identity Protection > Settings > Link unified risk signals > Apply for all users / select users

### API
PATCH `https://graph.microsoft.com/beta/identityProtection/policy` with `unifiedRiskSignals.enabledFor`

## Support Boundaries and Case Routing

| Scenario | Owning Team | SAP |
|---|---|---|
| AI Compounded Risk event | Entra ID Protection | Azure/Entra Sign-in and MFA/Identity Protection/Risk investigation |
| Risk Based CA enforcement | Entra ID Protection | Same |
| User Identity Risk Score numeric value | Defender for Identity | Azure/Defender for Identity/Investigating Alerts |
| How risk score is calculated | Defender for Identity | Same |
| Account linking (Account Sets) | Defender for Identity | Same |
| Root cause investigation of alerts | Defender for Identity | Same |

## Key Behaviors

- Risk elevation occurs through signal correlation, not single high-confidence alerts
- Compounding initially scoped to user identities; expanding to service principals, agents, apps
- Customers should expect increase in Blocked by CA events during rollout
- Risk can re-elevate repeatedly if linked accounts (e.g., on-prem AD) are under active attack
- Dismissing risk in Entra may not stop Defender from sending new signals

## Investigation Walkthrough

1. Review Risky User in Entra ID Protection - check timeline for risk progression
2. Examine Compounded Risk Event - detection type shows "Unified risk signals"
3. Investigate in Microsoft Defender - "Click here for more details" in Additional info
4. Assess broader impact - check Insider risk severity and Blast radius

## Real Attack Scenarios

| Scenario | Without Compounding | With Compounding |
|---|---|---|
| Session Cookie Theft | Medium Risk | HIGH RISK |
| Multi-Stage Attack | Medium Risk | HIGH RISK |

## Case Transfer Protocol

When Defender signals drive risk: Entra does initial triage, then warm handoff to Defender with full context (unified risk event, Defender alerts, account linking evidence).
