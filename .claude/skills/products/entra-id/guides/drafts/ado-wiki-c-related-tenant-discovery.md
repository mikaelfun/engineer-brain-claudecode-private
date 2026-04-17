---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Tenant Governance/Related Tenant Discovery"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FTenant%20Governance%2FRelated%20Tenant%20Discovery"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Related Tenant Discovery — Feature Reference Guide

## Summary

Related Tenants (Tenant Discovery) helps organizations understand their cloud footprint by identifying Entra tenants with relationships.
Analyzes: billing relationships, B2B collaboration, cross-tenant admin access, app usage, admin portal activity, multitenant app consent.

## Licenses Required
Identity Governance license required. If removed, related tenant data stops updating.

## Required Roles
- Global Administrator
- Tenant Governance Administrator (least privilege)

## Discovery Signals

| Signal | Property | Description |
|---|---|---|
| B2B Registration | b2BRegistrationMetrics | Users invited between tenants |
| B2B Sign-in | b2BSignInActivityMetrics | Actual cross-tenant sign-in activity |
| Admin App Sign-in | appB2BSignInActivityMetrics | Admin app cross-tenant sign-ins (Azure Portal, Entra, Intune, etc.) |
| Multitenant Applications | multiTenantApplicationMetrics | Cross-tenant multitenant app usage |
| Billing | billingMetrics | Azure subscriptions paid by one tenant for another |

## Key Concepts

- Related tenant = observed relationship, does NOT imply ownership
- Data location: Fusion (not computed at request time)
- Metrics recalculated daily
- Counts are approximate ranges (e.g., actual 14-98 all return 10)

| Actual Count | Returned Value |
|---|---|
| 1-9 | 1 |
| 10-99 | 10 |
| 100-999 | 100 |
| 1000-9999 | 1000 |

## Enabling Related Tenants

1. In Entra admin center: Select Discover related tenants action
2. Wait up to 72 hours for initial aggregation
3. Can trigger ad hoc refresh to shorten delay

## Graph API

### Get all related tenants
GET https://graph.microsoft.com/beta/directory/tenantGovernance/relatedTenants
Response paginated: up to 1000 tenants per page.

### Columns returned
- id (tenant ID)
- createdDateTime
- b2BRegistrationMetrics (initial + recent)
- b2BSignInActivityMetrics (initial + recent)
- appB2BSignInActivityMetrics (initial + recent)
- multiTenantApplicationMetrics (initial + recent)
- billingMetrics

### Get tenant display name
GET https://graph.microsoft.com/beta/tenantRelationships/findTenantInformationByTenantId(tenantId="{tenantId}")
Requires: CrossTenantInformation.ReadBasic.All

## Portal Navigation

1. Select Related Tenants blade
2. Click a related tenant to see Details view:
   - Overview tab: basic info, governance status, discovery signals
   - Discovery Signals tab: B2B signin, B2B registration, Admin app, Multitenant app metrics
   - Governance Relationships tab: Active/Terminated relationships (separate from discovery signals)

## In Scope for Support
- Activating related tenants experiences
- Viewing related tenants via portal or Graph API
- Understanding discovery signals and metrics
- Refreshing related tenants via Graph API

## Out of Scope
- B2B collaboration configuration
- Multitenant app setup and consent
- Billing account configuration

> Note: Partial content from 61KB source. See sourceUrl for complete content.