---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/AAD B2C tenant throttling, service limit increase and default domain block handbook/Identifying the cause of B2C throttling"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAAD%20B2C%20tenant%20throttling%2C%20service%20limit%20increase%20and%20default%20domain%20block%20handbook%2FIdentifying%20the%20cause%20of%20B2C%20throttling"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Identifying the Cause of B2C Throttling

## Steps

1. Find the B2C throttling category using Kusto query: [B2C throttling query](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587764/Azure-AD-B2C-Kusto-Queries?anchor=query-b2c-throttling-by-tenant-name)

2. **Dev Mode throttling**: If category is `Cpim.TPEngine.RequestPerPolicyTenantWithDevMode`, the policy is in Dev mode. Ask customer to remove Dev mode from the policy ([DeploymentMode docs](https://learn.microsoft.com/azure/active-directory-b2c/trustframeworkpolicy)).

3. **MFA throttling** (voice/SMS): If category matches SMS or voice patterns (e.g., `Cpim.TPEngine.SmsPerSession.1000000.8h`), get additional information about the customer's scenario.

> **Do not share these limits without PG approval. These limits are not in public documents.**

## Throttling Rules for Phone Call (Default Limits)

| Limit | Value |
|-------|-------|
| Per 15 min / Tenant | 2,000 calls |
| Per 8 hours / Tenant | 20,000 calls |
| Per 15 min / IP | 40 calls |
| Per 15 min / Allowed IP + Tenant | 400 calls |
| Per 8 hours / IP | 200 calls |
| Per 8 hours / Allowed IP + Tenant | 2,000 calls |
| Per 24 hours / phone number | 10 calls |
| Per 8 hours / session | 5 calls |
| Per 8 hours / phone band | 200 calls |

## Throttling Rules for SMS (Default Limits)

| Limit | Value |
|-------|-------|
| Per 15 min / Tenant | 5,000 SMS |
| Per 8 hours / Tenant | 50,000 SMS |
| Per 15 min / IP | 100 SMS |
| Per 15 min / Allowed IP + Tenant | 1,000 SMS |
| Per 8 hours / IP | 500 SMS |
| Per 8 hours / Allowed IP + Tenant | 5,000 SMS |
| Per 24 hours / phone number | 100 SMS |
| Per 8 hours / session | 2 SMS |
| Per 8 hours / phone band | 100 SMS |

Reference: [Settings.ini](https://msazure.visualstudio.com/One/_git/AD-CPIM?path=/src/Production/Web.TPEngine/Settings.ini)
