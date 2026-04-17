---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Link Translation in the Response Body"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Link%20Translation%20in%20the%20Response%20Body"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Link Translation in the Response Body — App Proxy TSG

## When Do Link Issues Occur?

Link issues happen when the internal URL differs from the external URL in application proxy configuration:

| Internal URL | External URL | Link Issues? |
|---|---|---|
| `http://test.contoso.com/` | `https://test.contoso.com/` | Yes |
| `https://test.contoso.com:8080/` | `https://test.contoso.com/` | Yes |
| `https://test.contoso.com/` | `https://app.contoso.com/` | Yes |
| `https://test.contoso.com/` | `https://test.contoso.com/` | No |

## Symptoms

- Web page displayed in browser is broken / rendered incorrectly / placeholders for web elements
- Some URLs on the web page do not work
- ERR_CONTENT_DECODING_FAILED (when using Brotli compression with body translation)

## Data Collection

- Browser Tools (F12) > Console (Screenshot)
- Fiddler log: working (internal URL inside network) vs non-working (external URL outside network)

## Data Analysis

Using ASC, understand the external/internal URLs configured in the app proxy app. Verify if there was an attempt to access web resources over the internal URL.

## Questions to Ask

- What type of clients should access the app? (browser type, native app, desktop/mobile)
- What is the app? Any vendor guidance for reverse proxy scenarios?

## Solution Decision Tree

### (a) Custom Domain — Same Internal/External URL

Use exactly the same internal URL as external URL via Custom Domain.

- **Advantages**: No link translation required
- **Disadvantages**: Cannot use non-standard ports (only 443/80 for external)
- **Clients**: All
- **Settings**: Disable both Translate URLs in Headers and Application Body

### (b) Application Handles Translation

Apps like SharePoint or RDWEB handle link translation natively.

- **Advantages**: No link translation needed
- **Clients**: All
- **Settings**: Disable Translate URLs in Headers

### (c) MyApps Browser Extension

Client-side link translation via browser extension.

- **Clients**: Edge (legacy/Chromium), Chrome only
- **Disadvantages**: CORS exceptions, mixed content issues, no inside/outside network distinction
- **Settings**: Enable Translate URLs in Headers, disable Application Body
- **Known issues**: See App Proxy Known Issues wiki page

### (d) Intune Managed Browser

Configure link translation via Intune.

- **Clients**: Edge mobile on iOS/Android only
- **Settings**: Enable Translate URLs in Headers, disable Application Body

### (e) App Proxy Body Link Translation

Server-side translation by App Proxy cloud service (not connector).

- **Disadvantages**: Limited to HTML/CSS (no JavaScript), may cause performance issues, only supports deflate/gzip (not Brotli)
- **Clients**: All
- **Known issue**: Brotli compression causes ERR_CONTENT_DECODING_FAILED

### (f) Modify Web Application

Move to standard port, use relative URLs, etc.

- **Disadvantages**: Vendor involvement may be needed, additional costs

### (g) Add Reverse Proxy with Link Translation

Place a device between connector and web application.

- **Disadvantages**: Additional maintenance/costs
- **Clients**: All

## Key Notes on "Translate URLs in Application Body"

- Disabled by default; use as last resort
- Translation done by App Proxy cloud service (not connector)
- Only supports deflate and gzip compression
- If translation breaks the page or fails to translate needed URLs:
  1. Verify this is the only solution
  2. Collect 2 Fiddler traces (external + internal from connector)
  3. Contact SMEs via MEAP Teams channel

## Reference

- [Redirect hardcoded links for apps published with Microsoft Entra Application Proxy](https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-configure-hard-coded-link-translation)
