---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Automated Quota Management (AQM)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FAutomated%20Quota%20Management%20%28AQM%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Automated Quota Management (AQM)

## What is AQM?

AQM is an internal mechanism for Entra ID tenants that handles organic growth.

When a tenant reaches **88% of its total quota**, AQM automatically increases the tenant quota by **3%**.

**Example**: Quota = 500K, Usage reaches 440K (88%) → AQM increases quota to 515K (500K * 1.03).

> **Note**: AQM does not apply in all scenarios. There are specific prerequisites for a tenant to be eligible. Confirm with the IcM owner whether the customer's tenant qualifies for AQM before citing this as the resolution.
