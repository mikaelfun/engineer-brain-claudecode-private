---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Identity Protection/Identity Protection for Agent Identities"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Identity%20Protection%2FIdentity%20Protection%20for%20Agent%20Identities"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Identity Protection for Agent Identities

## Feature Overview

Microsoft Entra Identity Protection expanding to include Agent Identities for automation and service accounts. Provides continuous monitoring, risk-based insights, and Conditional Access integration.

## Licensing

- Requires P1 or P2 licenses
- Additional Entra Agent ID Premium SKU required
- Free during Public Preview
- Five new A365 SKUs also provide access
- After licensing, Microsoft-managed CA policy created in Report-only mode, auto-enforced after 45 days

## Core Capabilities

- Dashboard Integration: New **Agents flagged for risk** card (requires Entra Agent ID Premium)
- Risky Agents Blade: Complete breakdown of flagged agents with risk level summary
- Risk Detections: Agent Detections tab in Identity Protection blade
- Immediate Actions: Confirm compromise, dismiss risk, revoke sessions, enable/disable account
- Conditional Access: New Agent Risk condition (Block action only initially)

## Important Notes

- CA initially supports risk policies for agent identities (service principal based); agentic users follow later
- Legacy Identity Protection policies will NOT trigger for agents

## Risk Event Types

| riskEventType | riskLevel | Coverage |
|---|---|---|
| Unfamiliar resource access | Medium | OBO App (Manual), OBO User (RBCA), OBO Agentic User |
| Sign-in spikes | Medium-High | All flows |
| Failed access attempts | Low-Medium | All flows |
| Delegated auth by risky agents | Medium | OBO flows |

## Scenarios

1. **Suspicious Agent Behavior**: Agent deviates from normal resource access patterns
2. **Compromised User via Agent**: Attacker uses OBO flow through agent to hide behind agent identity
3. **Trojan/Malicious Agent**: Third-party agent behaves like Trojan application (similar to OAuth phishing)
