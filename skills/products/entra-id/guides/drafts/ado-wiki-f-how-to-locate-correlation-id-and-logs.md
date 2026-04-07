---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID for Customers (CIAM) - How to locate correlation ID and logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20(CIAM)%2FEntra%20External%20ID%20for%20Customers%20(CIAM)%20-%20How%20to%20locate%20correlation%20ID%20and%20logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entra External ID (CIAM) - How to Locate Correlation ID and Logs

## Key Difference from Azure AD B2C

CIAM tenants use **ESTS service** for authentication (not CPIM). Troubleshooting `contoso.ciamlogin.com` requests follows standard Entra workforce authentication patterns.

## Troubleshooting Steps

1. **Collect trace**: Request customer provide HAR trace (https://aka.ms/hartrace) or Fiddler capture (https://aka.ms/fiddlercap with HTTPS decryption enabled). Alternatively, use the login UX troubleshooting details button to obtain correlation ID before repro.

2. **Open trace in Fiddler**: Select any request to `contoso.ciamlogin.com`

3. **Extract from response headers** (Inspectors > Headers tab, bottom right):
   - `Date` timestamp
   - `x-ms-request-id` (= ESTS request ID in ASC Auth Troubleshooter)

4. **Find ESTS correlation ID**: Inspectors > Raw tab > search for `client-request-id`
   - Correlation ID encompasses multiple individual request IDs (entire auth session)
   - More useful than individual request IDs for full session analysis

5. **Query logs in ASC**: With `x-ms-request-id`, `client-request-id`, and `timestamp`:
   - ASC Tenant Explorer > Sign ins > Filter by correlation ID or request ID
   - Or: Tenant Explorer > Sign ins > Diagnostics tab > "Go to the new sign-in troubleshooter"

6. **Analyze results**: Select entry > Expert View > Diagnostic Logs or Summary

## Important Notes

- If no ASC access to CIAM tenant: ask customer to raise a case with ASC diagnostic consent from CIAM tenant
- See also: Entra External ID - Data Collection page
