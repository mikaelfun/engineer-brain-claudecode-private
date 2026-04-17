---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/AAD B2C tenant throttling, service limit increase and default domain block handbook/Identifying the cause of Gateway throttling"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAAD%20B2C%20tenant%20throttling%2C%20service%20limit%20increase%20and%20default%20domain%20block%20handbook%2FIdentifying%20the%20cause%20of%20Gateway%20throttling"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Identifying the Cause of Gateway Throttling

## Steps

1. Find the Gateway throttling category using Kusto query: [Gateway throttling query](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/587764/Azure-AD-B2C-Kusto-Queries?anchor=query-for-aad-gateway-throttling-by-tenant-name)

2. **Default IP limit is 20 RPS** for Tenant level and Azure Front Door (AFD). The limit applies to true client IP. Common categories:
   - `TenantIpLevel20` - default IP-based throttling
   - `AFDForwardedIp20` - Azure Front Door IP-based throttling

3. If you see a higher value than 20, the customer may have previously requested a limit increase.

4. Get additional information about the customer's scenario. Explain that increasing IP limits is risky (attack surface). For test tenants, increases are acceptable.

> **Do not share these limits without PG approval.**

## Throttling Limits per IP

| Name | Description |
|------|-------------|
| TenantWithIPLimit100p8h | 100 per 8 hours per IP per tenant |
| TenantWithIPLimit1000p8h | 1000 per 8 hours per IP per tenant |
| TenantWithIPLimit1 | 1 RPS per IP per tenant (over 5 min) |
| TenantWithIPLimit5 | 5 RPS per IP per tenant (over 5 min) |
| TenantWithIPLimit50 | 50 RPS per IP per tenant (over 5 min) |
| TenantWithIPLimit200 | 200 RPS per IP per tenant (over 5 min) |
| TenantWithIPLimit500 | 500 RPS per IP per tenant (over 5 min) |

### Per-IP Limits (customer-provided IPs)

| Name | Description |
|------|-------------|
| IPWithLimit100p8h | 100 per 8 hours per specified IP |
| IPWithLimit1000p8h | 1000 per 8 hours per specified IP |
| IPWithLimit1 | 1 RPS per specified IP (over 5 min) |
| IPWithLimit5 | 5 RPS per specified IP (over 5 min) |
| IPWithLimit50 | 50 RPS per specified IP (over 5 min) |
| IPWithLimit200 | 200 RPS per specified IP (over 5 min) |
| IPWithLimit500 | 500 RPS per specified IP (over 5 min) |
| IPWithLimit1500 | 1500 RPS per specified IP (over 5 min) |

## Throttling Limits per Tenant

Default tenant limit is **200 RPS** (`TenantLevel200`).

| Name | Description |
|------|-------------|
| TenantWithTenantLimit5 | 5 RPS per tenant |
| TenantWithTenantLimit50 | 50 RPS per tenant |
| TenantWithTenantLimit300 | 300 RPS per tenant |
| TenantWithTenantLimit400 | 400 RPS per tenant |
| TenantWithTenantLimit500 | 500 RPS per tenant |
| TenantWithTenantLimit1000 | 1000 RPS per tenant |
| TenantWithTenantLimit1500 | 1500 RPS per tenant |
| TenantWithTenantLimit2000 | 2000 RPS per tenant |
| TenantWithTenantLimit3000 | 3000 RPS per tenant |

## Limit Increase Process

Preview feature with ~2-week lead time. Pricing (proposal, not finalized):
- 2.5x increase (500 RPS): ~$10,000/month
- 7.5x increase (1500 RPS): ~$25,000/month

Contact Linda Park for NDA customers. Current increases are free until billing meter is available.

> **Note**: These limits do NOT include MFA, Graph API, or IP-based throttling - tenant-level RPS only.
