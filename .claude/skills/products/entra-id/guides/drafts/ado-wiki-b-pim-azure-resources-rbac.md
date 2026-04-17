---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Privilege Identity Management (PIM)/PIM for Azure Resources (RBAC)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FPrivilege%20Identity%20Management%20%28PIM%29%2FPIM%20for%20Azure%20Resources%20%28RBAC%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# PIM for Azure Resources (RBAC) - Feature Reference

## Summary

Azure RBAC PIM for Azure Resources provides Just-In-Time membership to Azure RBAC roles. Extension of PIM for Entra ID Directory Roles (requires AAD P2). Enforces time-limited RBAC role membership at Subscription, Resource Group, and Resource levels.

## Key Feature: IAM (Access Control) - PIM Integration

### Assignment States (new State column in IAM blade):
- **Active permanent**: User can always use the role
- **Active time-bound**: Role available within start/end dates only
- **Eligible time-bound**: User must activate; always eligible
- **Future active time-bound**: Scheduled future activation

### Important Behaviors:
- An activated eligible role shows as a SECOND "Active Time-bound" entry in Role assignments
- IAM blade does NOT adhere to PIM policies for Active Permanent assignments (by design)
- Apps/service principals/managed identities CANNOT be assigned eligible roles
- Eligible assignments and future-scheduled assignments do NOT count toward 4000 role assignment limit
- If user is eligible member of a PIM-for-groups group that has eligible role, user must first activate group eligibility to see the role
- If user lacks `Authorization/read`, they can see own eligible role but NOT other role assignments
- Future-dated role assignments CANNOT be deleted from IAM blade (must use PIM portal)

### Rollout Plan (Treatment Selection):
- **Treatment 1**: Privileged admin roles default to Eligible; Job function roles default to Active
- **Treatment 2**: ALL roles default to Eligible
- Assignment duration defaults to permanent where policy allows
- GA target: Week of July 15, 2025

## Access Reviews
- Can be performed for all RBAC roles at Subscription level from Azure Resources blade
