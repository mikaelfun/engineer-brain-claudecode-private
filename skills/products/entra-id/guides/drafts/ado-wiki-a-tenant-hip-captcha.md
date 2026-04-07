---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Azure AD Tenant HIP Captcha during creation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Tenant HIP Captcha During Creation

Mandatory captcha on tenant creation wizard. Visual: English only. Audio: 24 markets.
NOT available for B2C tenants.

## Troubleshooting
Kusto: idsharedwus / ADIbizaUXWUS, IfxPartnerNetworkCallScrubbed
Filter: partnerName contains 'repmap'

## ICM
- UX: Entra - Management Admin UX / Triage
- Backend: Identity Reputation Management and Abuse Prevention / Triage
