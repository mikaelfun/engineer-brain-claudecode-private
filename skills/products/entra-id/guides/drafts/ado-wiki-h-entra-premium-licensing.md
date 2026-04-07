---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/TSG: Does customer tenant have Entra Premium Licensing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FTSG%3A%20Does%20customer%20tenant%20have%20Entra%20Premium%20Licensing"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# TSG: Does customer tenant have Entra Premium Licensing

CSS Identity engineers often need to verify if a customer has Entra ID Premium (P1 or P2) service plans. This can be confirmed via Azure Support Center's Tenant Explorer -> Graph Explorer.

## Service Plan GUIDs

Per [CommOfferTool](https://aka.ms/m365iaa):

- **Microsoft Entra ID P1 (AAD_PREMIUM)**: `41781fb2-bc02-4b7c-bd55-b576c07bb09d`
- **Microsoft Entra ID P2 (AAD_PREMIUM_P2)**: `eec0eb4f-6444-4f95-aba0-50c24d67f998`

Reference: [Product names and service plan identifiers for licensing](https://learn.microsoft.com/en-us/entra/identity/users/licensing-service-plan-reference)

## Verification Steps

1. Open Azure Support Center for customer case
2. Visit Tenant Explorer > Graph Explorer
3. Perform GET query for `/organization` or `/subscribedskus`
4. Choose the JSON viewer tab
5. CTRL+F search for P1 GUID (`41781fb2-bc02-4b7c-bd55-b576c07bb09d`) or P2 GUID (`eec0eb4f-6444-4f95-aba0-50c24d67f998`)
6. If `/organizations` or `/subscribedskus` shows active service plan -> tenant is premium licensed
7. If status shows deleted/disabled -> license may have expired. Review on [CMAT](https://cmat.azure.com/) or [Lynx](https://lynx.office.net/) for subscription details
