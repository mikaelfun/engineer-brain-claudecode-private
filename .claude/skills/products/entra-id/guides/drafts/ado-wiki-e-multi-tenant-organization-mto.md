---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2B/Multi-Tenant Organization (MTO)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2B%2FMulti-Tenant%20Organization%20%28MTO%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Multi-Tenant Organization (MTO) - Comprehensive Guide

## Overview
MTO allows multi-tenanted customers to define a shared list of tenants belonging to their parent company. One tenant creates the MTO (owner role), adds pending tenants, which then join (active/member role).

## Support Routing

| Scenario | Team | ICM |
|----------|------|-----|
| MTO creation/joining via M365 Admin Center | M365 Identity | IAM Services > Cross Tenant Experience |
| Cross-Tenant Sync | Azure Identity Provisioning | UMTE > Customer Escalations - Cross Tenant Sync |
| B2B Guest Sign-in / XTAP | Azure Identity Account Management | ESTS > Triage or Invitation Manager > Triage |
| Teams MTO issues | Teams Support | Skype Teams/People |
| Exchange Online MTO issues | Exchange Online | Exchange/Multi-Tenant Organization (MTO) Admin |

## Licensing
- P1/P2 license required per tenant (at least one admin license)
- Each synced internal user needs P1 license in home tenant

## Known Limitations
- Max 100 active tenants (soft limit, can request increase)
- Max 100,000 internal users per active tenant
- **Enabling MTO irreversibly blocks TRv2** (critical warning)
- GDAP relationship blocks MTO join
- Only available in commercial cloud (not sovereign/cross-cloud)
- PowerBI has limitations for B2B members
- M365 Admin Center has limitations for B2B users

## Troubleshooting

### MTO Join Fails with GDAP
- Error: "Joining a multitenant was unsuccessful"
- Cause: GDAP relationship exists between tenants
- Resolution: Remove GDAP before joining MTO

### TRv2 Incompatibility
- Enabling MTO permanently blocks TRv2
- No rollback available
- Must warn customer before enabling

### Limit Increase Requests
- Default: 100 tenants, 100K users per tenant
- Soft limit during preview - create support ticket for increase

## Known Issues (Public Docs)
- [MTO Known Issues](https://learn.microsoft.com/entra/identity/multi-tenant-organizations/multi-tenant-organization-known-issues)
- [MTO User Sync Issues](https://learn.microsoft.com/entra/identity/multi-tenant-organizations/multi-tenant-organization-known-issues#user-synchronization-issues)
- [M365 MTO Limitations](https://learn.microsoft.com/microsoft-365/enterprise/plan-multi-tenant-org-overview#limitations-for-multitenant-organizations-in-microsoft-365-preview)
