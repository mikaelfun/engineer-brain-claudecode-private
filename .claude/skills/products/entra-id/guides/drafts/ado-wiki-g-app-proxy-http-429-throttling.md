---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Increasing the maximum transactions per second for Azure AD Application Proxy (HTTP 429)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Microsoft%20Entra%20application%20proxy/Increasing%20the%20maximum%20transactions%20per%20second%20for%20Azure%20AD%20Application%20Proxy%20(HTTP%20429)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Increasing the Maximum Transactions Per Second for Azure AD Application Proxy (HTTP 429)

## Throttling Limits

- Maximum **500 transactions per second** per App Proxy application
- Maximum **750 transactions per second** for the Entra ID organization (tenant)
- A transaction = a single HTTP request and response for a unique resource
- When throttled, clients receive HTTP 429 (Too Many Requests)

**Important:** HTTP 429 might come from the backend server as well. This must always be verified!

Reference: [Entra service limits and restrictions](https://docs.microsoft.com/azure/active-directory/users-groups-roles/directory-service-limits-restrictions)

## Customer Communication

- It's very rarely that the limits are exceeded (common causes: software bug, hardware config issue, DDOS attack, scaling of apps/users)
- Only the Product Team can change the limits (higher bucket is 22,500 requests per 10s)
- Support must first validate that the limits have been exceeded
- Based on validation, support contacts Product Team who decides next steps (via Teams)
- **Never promise the customer anything regarding the outcome**
- The Product Team monitors all environments; if reasonable, limits will be increased
- Requests above limits cause additional costs for Microsoft

## Kusto Queries

### Number of 429 responses by apps for the day

```kusto
TransactionSummaries
| where TIMESTAMP > datetime("yyyy-mm-ddT00:00:00") and TIMESTAMP < datetime("yyyy-mm-ddT23:59:59")
| where SubscriptionId == "TENANT_ID"
| where ResponseStatusCode == "429"
| summarize count() by ApplicationId
```

### Transactions per second timechart (check against 750 TPS org limit)

```kusto
TransactionSummaries
| where TIMESTAMP > datetime("yyyy-mm-ddT00:00:00") and TIMESTAMP < datetime("yyyy-mm-ddT23:59:59")
| where SubscriptionId == "TENANT_ID"
| summarize count() by bin(TIMESTAMP, 1s)
| render timechart
```

### Throttling events by type (per App, per Tenant, per Service Instance)

```kusto
TransactionSummaries
| where TIMESTAMP > datetime("yyyy-mm-ddT00:00:00") and TIMESTAMP < datetime("yyyy-mm-ddT23:59:59")
| where SubscriptionId == "Tenant_ID"
| where ResponseStatusCode == "429"
| summarize count() by ExtraResultData
```

Try to identify patterns like source IP, user agent string to understand traffic origin.

## Solutions

1. If only 1-2 apps affected by high traffic, **changing the external URL** of affected apps might help (distributes load)
2. If a **software bug** causes the issue, the bug must be fixed
3. If this is an **attack**, customer should deploy a firewall (e.g., AFD) in front of the public endpoint to block traffic based on specific conditions

## Escalation for Limit Increase

Raise an **AVA request** first (ask for ICM approval), or if very urgent go directly to ICM. Include:
- Customer's tenant ID
- Contracts, Subscriptions, Number of affected users
- Explanation of why limits are exceeded (temporary or permanent?)
- Business impact
- Kusto queries and results

## Checking Current High Volume Scale

Check the [settings.ini](https://msazure.visualstudio.com/One/_git/AD-AppProxy?path=/src/Product/Cloud/Common/settings.ini) file - look under `;; Throttling High Volume lists` for the tenant ID.

## Throttling Definitions

See [AADAP_ThrottlingPolicy_Prod.xml](https://msazure.visualstudio.com/One/_git/AD-AppProxy?path=%2Fsrc%2FProduct%2FCloud%2FCommon%2FThrottling%2FAADAP_ThrottlingPolicy_Prod.xml)

## What Requests Count Toward Throttling

All requests reaching the Application Proxy Cloud service are counted, including:
- Requests forwarded to the connector
- Unauthenticated requests redirected to login.microsoftonline.com
