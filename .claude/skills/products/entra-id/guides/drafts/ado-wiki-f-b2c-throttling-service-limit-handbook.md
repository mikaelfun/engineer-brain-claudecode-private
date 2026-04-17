---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/AAD B2C tenant throttling, service limit increase and default domain block handbook"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAAD%20B2C%20tenant%20throttling%2C%20service%20limit%20increase%20and%20default%20domain%20block%20handbook"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AAD B2C Rate Limit Increase Process

Azure AD B2C service has multiple types of throttling limits documented publicly at [Azure AD B2C Service Limits and Restrictions](https://learn.microsoft.com/azure/active-directory-b2c/service-limits?pivots=b2c-custom-policy). Customer's hitting these limits will receive a HTTP 429 throttling error. These include request per second (rps) limits per IP address, per tenant etc.

## Context

- **Gateway throttling** — B2C leverages AAD Gateway as gateway service
- **B2C throttling** — downstream services leveraged by B2C (e.g. SMS/Phone factor MFA throttling)

## Troubleshooting Steps

1. Request at minimum:
   - Azure AD B2C tenant name and tenant ID
   - Azure AD B2C policy name and run now URL
   - Timestamp in UTC + Correlation ID of HTTP 429 error

2. Use ASC troubleshooter: **[Identity][B2C] Scoping TSG → Troubleshooting B2C Custom Policies → Yes → B2C Tenant Throttling HTTP 429 Errors**
   - Fallback: [Identifying the cause of Gateway throttling](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2495981/Identifying-the-cause-of-Gateway-throttling)
   - Fallback: [Identifying the cause of B2C throttling](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2495980/Identifying-the-cause-of-B2C-throttling)

## Gateway Throttling Rate Limit Increase — Prerequisites

**Customer MUST meet ALL prerequisites before submitting to engineering:**

1. Customer has implemented [Azure AD B2C Custom Domain](https://learn.microsoft.com/azure/active-directory-b2c/custom-domain?pivots=b2c-user-flow) and verified custom DNS domain name in use
2. Customer has integrated custom B2C domain with a WAF partner with **IP rate limiting AND bot protection enabled**:
   - [Akamai](https://learn.microsoft.com/azure/active-directory-b2c/partner-akamai)
   - [Azure WAF](https://learn.microsoft.com/azure/active-directory-b2c/partner-web-application-firewall)
   - [CloudFlare](https://learn.microsoft.com/azure/active-directory-b2c/partner-cloudflare)

**Note:** If request is under 500 RPS, WAF is not required. However, customer must be informed of attack vulnerability and Microsoft reserves the right to reduce quota if it poses risk.

## Customer Questionnaire (for rate limit increase)

```
Indicate the desired limit increase:
Are the requests coming from a limit set of IPs (e.g. WAF/F5/AFD/VPN)?
What is your Azure AD B2C custom domain name?
Do you agree to have Microsoft block access to the default domain (*.b2clogin.com)? (YES/NO)
Which WAF partner have you integrated bot protection with (Akamai, Azure WAF, or Cloud Flare):
Which WAF partner have you integrated IP-based rate limiting with:
Where is the traffic expected (which region) and when?
If doing load testing, how long?
For per IP limit increase, provide the IP address(es):
Are they using custom domain name to access B2C endpoints? Custom domain name:
Provide the complete URL for the endpoint being throttled:
Business justification:
```

## ICM Submission

- Raise ICM with CID TA Triage using template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Y1j3q3
- Example ICMs:
  - https://portal.microsofticm.com/imp/v3/incidents/incident/412019965/summary
  - https://portal.microsofticm.com/imp/v5/incidents/details/608574058

## Pricing Tiers (Proposal, not finalized)

- **$10,000/month** for 2.5x increase (500 RPS) in default service limits
- **$25,000/month** for 7.5x increase (1500 RPS) in default service limits
- Note: Does NOT include MFA, Graph API, or IP-based throttling — tenant-level RPS only

## Other Limit Increases

| Limit | Default | Can Increase To |
|-------|---------|-----------------|
| Levels of inheritance in custom policies | 10 | ❌ Cannot increase |
| Number of policies per tenant | 200 | 500 |
| Maximum policy file size | 1024 KB | 2 MB |
| B2C tenants per subscription | 20 | More |

### Policy File Size Increase to 2MB
- No additional cost
- Example ICM: https://portal.microsofticm.com/imp/v3/incidents/incident/224729690/summary

### B2C Tenants Per Subscription Increase
- Example ICM: https://portal.microsofticm.com/imp/v3/incidents/incident/500873133/summary

## Important Notes

- AAD Gateway rollout typically takes time to complete
- Identity Lockdown and Holidays Lockdown apply each year (no changes during lockdown)
- B2C default domain blocking is a separate process: [Block B2C default domain internal process](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/2495979/Block-B2C-default-domain-(b2clogin)-internal-process)
