---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/AADB2C Errors/AADB2C90047"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAADB2C%20Errors%2FAADB2C90047"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AADB2C90047: The resource contains script errors preventing it from being loaded

## Scenario 1: Custom HTML Contains Scripting Errors

Customer is using custom HTML and the HTML contains scripting errors. Troubleshooting options are limited - resolution is owned by the customer.

**Diagnostic questions:**
- How easily can they reproduce? Is it transient?
- Does it happen for all users?
- Does it happen across different browsers/languages?
- Does it happen across different device types?
- Did the customer make recent changes to the HTML script?

## Scenario 2: CORS Not Configured

Customer's custom HTML location does not allow Cross-Origin Resource Sharing (CORS) from the `https://your-tenant-name.b2clogin.com` origin URL.

**Solution:** Ask customer to review and configure CORS per [CORS docs](https://learn.microsoft.com/azure/active-directory-b2c/customize-ui-with-html?pivots=b2c-custom-policy#3-configure-cors).

For Azure Storage Blob, the CORS configuration should allow the B2C login origin URL (case-sensitive).

**Diagnosis:** Have customer reproduce while capturing an [HAR trace](https://aka.ms/hartrace).

## Scenario 3: Custom HTML References Unreachable Content

Custom HTML page references resources (images, JavaScript, CSS) that cannot be loaded successfully.

**Diagnosis steps:**
1. Verify CORS configuration matches [required docs](https://learn.microsoft.com/azure/active-directory-b2c/customize-ui-with-html?pivots=b2c-custom-policy#3-configure-cors)
2. If CORS is correct, issue is with hosting provider reliability
3. Customer should run load tests on custom HTML page, mimicking B2C's OPTIONS/GET requests
4. Collect HAR trace if reproducible

### Kusto Queries

**Count occurrences per day:**
```kql
cluster('idsharedneueudb.northeurope.kusto.windows.net').database('CPIM').AllIfxRequestEvent
| where env_time >= ago(14d)
| where domainName == "b2ctenant.onmicrosoft.com"
| where policyId =~ "B2C_1A_SIGNUP_SIGNIN"
| where resultSignature == "Microsoft.Cpim.UserExperience.Client.CrossOriginException"
| summarize count() by bin(env_time, 1d)
```

**Graph occurrences per hour:**
```kql
cluster('idsharedneueudb.northeurope.kusto.windows.net').database('CPIM').AllIfxRequestEvent
| where env_time >= ago(14d)
| where domainName == "b2ctenant.onmicrosoft.com"
| where policyId =~ "B2C_1A_SIGNUP_SIGNIN"
| where resultSignature == "Microsoft.Cpim.UserExperience.Client.CrossOriginException"
| summarize count() by bin(env_time, 1h)
| render timechart
```

**Review failed endpoints:**
```kql
let tenantid = "<tenant-id>";
let tenantname = "myb2ctenant.onmicrosoft.com";
let policyName = "B2C_1A_POLICYNAME";
cluster('idsharedneueudb.northeurope.kusto.windows.net').database('CPIM').AllIfxRequestEvent
| where env_time >= ago(31d)
| where domainName =~ tenantname or tenantName == tenantid
| where policyId =~ policyName
| where resultSignature == "Microsoft.Cpim.UserExperience.Client.CrossOriginException"
| extend resourceFailed = extract("The resource '([^']+)'", 1, Message)
| summarize count() by resourceFailed
```
