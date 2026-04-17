---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Identity Protection/Entra ID Protection New Dashboard"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20Identity%20Protection/Entra%20ID%20Protection%20New%20Dashboard"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entra ID Protection New Dashboard

## Overview

New Identity Protection dashboard providing rich insights and actionable recommendations. Public preview from July 2023.

## Prerequisites

- Azure AD Free / P1 / P2
- Roles: Global Admin, Security Admin, Security Operator, Security Reader
- P2 required for comprehensive recommendations and action links

## Metric Cards

| Metric | Definition | Start Date | Refresh |
|---|---|---|---|
| Attacks blocked | Attacks blocked per day (risky sign-in interrupted by policy) | June 22, 2023 | 24h |
| Users protected | Users whose risk changed from At risk to Remediated/Dismissed | June 22, 2023 | 24h |
| Mean self-remediation time | Avg time for risk state to change from At risk to Remediated | June 22, 2023 | 24h |
| New high-risk users | New users with High risk level per day | 12 months ago | 24h |

## Attack Graphic

MITRE ATT&CK technique mapping for identity-based attacks detected in tenant.

## Top Recommendations

Actionable recommendations tailored to tenant's security posture.

## Access

Microsoft Entra Admin Center > Azure Active Directory > Protect & secure > Identity Protection > Dashboard

## Known Issue

- Number of users protected metric may show inaccurate counts (fix rolled out July 2023)
