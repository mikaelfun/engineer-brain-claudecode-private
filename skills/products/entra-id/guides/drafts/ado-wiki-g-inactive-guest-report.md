---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Identity Governance Inactive Guest Report"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FIdentity%20Governance%20Inactive%20Guest%20Report"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Identity Governance Inactive Guest Report

## Summary

The Inactive Guest Report surfaces on the ID Governance dashboard under the **Guest access governance** tile. It provides visibility into guest accounts that have been inactive for a configurable threshold period.

## License Requirements

- Microsoft Entra ID Governance or Microsoft Entra ID Governance Step-Up for Microsoft Entra ID P2

## Required Roles

Cloud Application Administrators, Global Administrators, Security Administrators, Security Operators, Global Readers, Reports Readers, and Security Readers.

## Report Sections

### Inactivity Threshold
- Default: 90 days
- Configurable from 0 to 360 days in 30-day increments via **Edit inactivity threshold**
- Data refreshed approximately every 24 hours

### Guest Account Overview
Two bar graphs:
- **Guest accounts** — Total guest users in tenant
  - *Never signed in*: guests invited but never signed in (no "last sign in" value)
  - *Signed in at least once*: guests who have signed in at least once
- **Inactive guest accounts** — Guests with inactive days exceeding threshold
  - If bar shows "0": all guest accounts were added to the tenant sooner than the threshold days

### Guests Inactivity Distribution
- Pie chart showing distribution of inactive guests by 30-day periods over 150+ days

### Guest Inactivity Overview
- Percentile information (50th, 90th, 95th) for inactive days
- Coordinate grid showing Active vs Inactive guest accounts across 0-360 days

### Guest Accounts Summary
- Filterable by: Activity state (All/Inactive/Active), Inactive days, Last sign-in
- Links to individual account management

## Troubleshooting

- **Inactive count shows 0**: All guests were added more recently than the inactivity threshold. Adjust the threshold.
- **Guest count mismatch**: Verify with Azure AD that the guest count matches. Both views use the same APIs.

## ICM Path

- **Owning Service**: Azure AD Entitlement Lifecycle Management
- **Owning Team**: Triage
