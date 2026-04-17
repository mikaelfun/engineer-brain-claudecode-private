---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Rewrite Rules"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Rewrite%20Rules"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Gateway Rewrite Rules — Configuration Scenarios

[[_TOC_]]

## Overview
Collection of rewrite rule configuration examples for common scenarios.

## Scenario 1 — Redirect `/` to a specific path
Redirect `/` to `/testlab/home.html` using an If/Then rewrite rule.  
To also modify the incoming FQDN, add a second rule action to rewrite the host header.

## Scenario 2 — Change URL path based on Content-Type header
If Content-Type contains "java" or "css", rewrite path to `/start/welcome/html`.  
Use regex condition on `request_headers_Content_Type` with pattern `java|css`.

## Scenario 3 — Redirect root path, pass through all other paths
**Use case:** `http://ericashton.com` → redirect to `http://microsoft.com/something`; `http://ericashton.com/anything` → use pool/httpsetting.

**Solution using two rewrite rules + path-based rule:**
1. **RewriteRule1** (on default rule, with "re-evaluate pathmap"): If request has no path → add fake `/test/` path, then re-evaluate pathmap
2. **RewriteRule2** (on `/test/` path rule): Remove `/test/`, redirect to `http://microsoft.com/something`
3. Path-based routing rule: `/test1/` → redirect to target URL with `IncludePath: False`

Key JSON config:
```json
"DefaultRewriteRuleSet": "RewriteRule1",
"PathRules": [{
  "Paths": ["/test1/"],
  "RedirectSetting": "PathmapRuleTestFargohttps_test1",
  "RewriteRuleSet": "RewriteRule2"
}]
```
Redirect setting: `"IncludePath": "False", "IncludeQueryString": "False", "RedirectType": "Permanent"`

## Scenario 4 — Extract and forward Access-Control-Allow-Origin header
Capture the `Access-Control-Allow-Origin` request header value using regex `(.*)` and forward it to the response header using `{http_req_Access_Control_Allow_Origin}` server variable.

## Scenario 5 — Rewrite all request URIs to root path `/`
**Condition:** `request_uri` matches pattern `(.*)` (case-sensitive)  
**Action:** Set URL path to `/`

This rewrites e.g., `abc.com/xyz/images` → `abc.com/`

## Scenario 6 — Rewrite to `/` except for specific file types
**Use case:** Rewrite all URIs to `/` except requests ending in `.jpg`, `.ico`, etc.

**Condition regex:** `^(?!.*\.(jpeg|ico)$).*`  
To add more file types, use OR operator: `^(?!.*\.(jpeg|ico|mov)$)./*`

Verify regex patterns at https://regex101.com before deploying.

## Scenario 7 — Build redirect URL by combining Host header + URI path
**Goal:** Insert `http://{host}{uri_path}` into `Location` response header.

1. Capture Host header: `^(.*)$`
2. Capture URI path: `/(.+)`
3. Combine in response header: `http://www.{http_req_Host}{var_uri_path}`

## Contributors
- Diego Garro
- Eric Ashton
- Ajinkya Pathak
