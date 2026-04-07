---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Conditional Access Per Policy Reporting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FAzure%20AD%20Conditional%20Access%20Per%20Policy%20Reporting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Conditional Access - Per Policy Reporting

## Feature Overview

Conditional Access Per-Policy Reporting summarizes the impact of individual CA policies on a tenant's sign-ins. It displays a graph in the Microsoft Entra Admin Center for each CA policy.

### Purpose

- Feel confident when enabling policies (evaluate impact in report-only first)
- Identify sample sign-ins to troubleshoot CA policy issues
- Determine how a policy is performing and confirm it protects sign-ins as expected

### Limitations

- Sample sign-in info shows only last 10 sign-ins where policy controls were met
- Full sign-in list not available yet (considered for future release)

## Prerequisites

- Active Conditional Access usage
- Azure AD Premium license
- Role: Global Admin, Security Admin, or Conditional Access Admin

## How to Access

1. Open Microsoft Entra Admin Center
2. Navigate to Protection > Conditional Access
3. Select Policies
4. Select any policy to evaluate
5. Click "View policy impact" at the top

## Supported Policy Types

- Report-only policies
- Enabled policies
- Microsoft Managed Policies

## Troubleshooting

- If no data appears, verify the policy has been active long enough to generate sign-in data
- Use graph filters to adjust date range
- For report-only policies, the graph shows what would have been enforced
- Cross-reference with sign-in logs for detailed per-sign-in analysis
