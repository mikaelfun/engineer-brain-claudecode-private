---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Creating incidents for tenant quota increases request"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Tenant Quota Increase Incidents

Default: global=300K, B2C=5.25M (verified domain). No increase without verified domain.

## SE: Raise ICM
Template: [ID][PROV][SYNC] - Tenant Quota Increases
Include: tenant ID, current usage, expected quota, business impact.

## TA Routing
| Type | Team |
|------|------|
| Production | AAD DDS / Quota Increases |
| B2C | CPIM / CRI-Triage |
| EDU | School Data Sync / Tenant Quota Management |
| EDU exceptions | AAD DDS / Quota Increases |
| CIAM | CPIM / CIAM-CRI-Triage |
| Mooncake | AD DDS - China / Quota Increases_Gallatin |

B2C >10M single increase: new approval process (slower).
