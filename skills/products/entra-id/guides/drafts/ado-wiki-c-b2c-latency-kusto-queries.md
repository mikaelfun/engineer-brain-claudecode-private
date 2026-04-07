---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Troubleshooting/Azure AD B2C Latency Kusto Queries"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2C/Azure%20AD%20B2C%20Troubleshooting/Azure%20AD%20B2C%20Latency%20Kusto%20Queries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD B2C Latency Kusto Queries

## Approach
Progressive drill-down: Policy -> Region -> ResourceId -> Downstream table to identify latency contributor.

## Steps
1. Query AllIfxRequestEvent by tenant/domain/timeframe, summarize percentiles(durationMs, 95/99/99.9) by policy + region
2. Identify high-duration policy, set _policyId filter
3. Compare 2 regions of similar count, set _env_cloud_location
4. Drill into resourceId: summarize by resourceId to find slow endpoints
5. Join with downstream tables to identify latency source

## Downstream Tables for Latency
- IfxAadRequestEvent: AAD Graph operations
- IfxCPIMOAuth2TokenRequestEvent: EvoSTS token operations
- IfxDocDBRequestEvent: CosmosDB policy/key lookups
- IfxIspRequestEvent: ISP operations
- IfxOAuth2ProviderRequestEvent: OAuth2 provider calls
- IfxSamlProviderRequestEvent: SAML IDP calls
