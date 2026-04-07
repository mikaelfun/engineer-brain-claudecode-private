---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/How to rewrite pattern in set-cookie header"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20rewrite%20pattern%20in%20set-cookie%20header"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to rewrite pattern in set-cookie header

## Description

Application Gateway can rewrite any pattern in an HTTP response header using regex via the rewrite rules feature.

Reference: https://docs.microsoft.com/en-us/azure/application-gateway/rewrite-http-headers-portal

## Scenario

Use case: Replace the domain string in a Set-Cookie header so it matches the AppGW listener domain instead of the backend domain.

Example:
`contoso.azurewebsites.net` → `appgw.contoso.com`

## Configuration

### IF Condition (match pattern):
```
(.*) contoso.azurewebsites.net (.*)
```
Apply to header: `http_resp_Set-Cookie_1`

### THEN Action (rewrite value):
```
{http_resp_Set-Cookie_1}appgw.contoso.com{http_resp_Set-Cookie_2}
```

### Result Example:

**Before rewrite:**
```
ARRAffinity=26c79d9043...;Path=/;HttpOnly;Secure;Domain=contoso.azurewebsites.net:443
```

**After rewrite:**
```
ARRAffinity=26c79d9043...;Path=/;HttpOnly;Secure;Domain=appgw.contoso.com:443
```

## ⚠️ Important Limitation (DISCLAIMER)

The IF condition (`http_resp_Set-Cookie_1`) applies only to the **first Set-Cookie header** coming in the response.

**The THEN action (rewrite) affects ALL cookies** in the set-cookie header — not just the first one. This can cause unintended side effects if multiple cookies are present.

Be aware of this limitation when designing the rewrite rule. PG has confirmed this behavior as a known constraint.

## Contributors

Joshua Torres
