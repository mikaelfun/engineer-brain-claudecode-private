---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Troubleshooting/Azure AD B2C Kusto Queries"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2C/Azure%20AD%20B2C%20Troubleshooting/Azure%20AD%20B2C%20Kusto%20Queries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD B2C Kusto Queries Reference

## Setup Options
1. **ASC Kusto Web UX**: Open ASC > Tenant Explorer > Kusto Web UX. Add cluster idsharedneueudb.northeurope. Tenant filter auto-injected.
2. **Kusto Desktop/Web Explorer**: Requires Cpim Kusto Viewers - 19029 entitlement. Cluster: idsharedneueudb.northeurope or idsharedscus.southcentralus. Use All* functions under CPIM > Functions > Common Functions.
3. **CSS B2C Dashboard**: https://aka.ms/cssb2cdashboard

## Key CPIM Log Tables
| Table | Purpose |
|-------|---------|
| AllIfxRequestEvents | High-level flow overview |
| AllIfxAadRequestEvent | AAD Graph API calls from CPIM |
| AllIfxCPIMEmailValidationRequestEvent | Email verification codes (SSPR) |
| AllIfxCPIMMfaSasRequestEvent | Azure MFA dependency |
| AllIfxCPIMOAuth2TokenRequestEvent | EvoSTS calls for local account sign-ins |
| AllIfxDocDBRequestEvent | Policy/key info from CosmosDB |
| AllIfxCPIMTokenIssuanceBillingEvent | Token issuance + billing |
| AllIfxIISEvent | IIS logs (endpoints, headers, user agent) |
