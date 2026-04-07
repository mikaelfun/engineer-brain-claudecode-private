---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Microsoft Entra Recommendations"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FMicrosoft%20Entra%20Recommendations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Entra Recommendations (AADR) — Comprehensive Reference

## Feature Overview

Azure AD Recommendations (AADR) provides centralized actionable insights on best practices.
Access: Entra portal > Overview blade > Recommendations tab.

## Case Management

| Issue | SAP | Escalation |
|---|---|---|
| AADR portal/API issues | Azure/Microsoft Entra Governance, Compliance and Reporting/Recommendations | IAM Services PG |
| Implementing a recommendation | Feature-specific | Feature PG |
| Identity Secure Score recommendations | Azure/AAD Sign-In and MFA/Identity Protection/ID Secure Score | AAD Identity Protection PG |

## Identity Secure Score Integration

ISS integrates into AADR. Legacy ISS blade will be deprecated after AADR GA.

| Recommendation | Max Score |
|---|---|
| Require MFA for admin roles | 10 |
| Ensure all users can complete MFA | 9 |
| Block legacy authentication | 8 |
| Do not expire passwords | 8 |
| Turn on user risk policy | 7 |
| Turn on sign-in risk policy | 7 |
| Enable password hash sync if hybrid | 5 |
| Do not allow unreliable app consent | 4 |
| Enable SSPR | 1 |
| Designate more than one global admin | 1 |

## Key Recommendations

### ADAL to MSAL Migration
Discovers apps using ADAL via actual sign-in activity (not app registration scan).
Removed from list within 24 hours after marking Complete.

### Azure AD Graph Retirement
- Migrate Applications from Azure AD Graph to Microsoft Graph
- Migrate Service Principals from Azure AD Graph to Microsoft Graph
Based on actual API calls to graph.windows.net in past 30 days.

### Application Campaigns
| Priority | Recommendation |
|---|---|
| High | Remove unused applications (not used >30 days) |
| High | Remove unused application credentials |
| Medium | Renew expiring application credentials |
| Medium | Renew expiring service principal credentials |

## Troubleshooting

### Recommendation not updating after action
AADR refreshes every 24 hours — allow up to 24 hours for status update.

### Status states
- Active, Dismissed (risk accepted), Postponed, Completed

## ICM Escalation
AADR portal/API: IDX / AADRecommendations
Azure AD Graph data issues: Microsoft Graph Service / Microsoft Graph Aggregator

## Public Documentation
https://learn.microsoft.com/en-us/entra/identity/monitoring-health/howto-use-recommendations

> Note: Partial content from 35KB source. See sourceUrl for full content.