---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Customer LockBox/Specific Issues/How to get tenant metadata"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FCustomer%20LockBox%2FSpecific%20Issues%2FHow%20to%20get%20tenant%20metadata"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to get tenant metadata

Replace `{0}` with the tenant ID and paste the URL in the browser.

## Endpoints

| Environment | URL |
|-------------|-----|
| Production | `https://login.microsoftonline.com/{0}/metadata/json/1` |
| Fairfax | `https://login.microsoftonline.us/{0}/metadata/json/1` |

## Reading the output

The returned JSON from the browser can be pasted in JSON Formatter (https://jsonformatter.org/) to read it clearly. There is also a Chrome extension called "JSON Formatter" which will format JSON text on the page.

## Identifying environment

To tell if a tenant ID is in Prod or Fairfax, look for the **allowed audience domain name**:
- Prod is usually `*.onmicrosoft.com`

## Alternative endpoints

- `https://accounts.accesscontrol.windows.net/{tenantId}/metadata/json/1`
- `https://accounts.accesscontrol.windows.net/{tenantDomain}/metadata/json/1`
