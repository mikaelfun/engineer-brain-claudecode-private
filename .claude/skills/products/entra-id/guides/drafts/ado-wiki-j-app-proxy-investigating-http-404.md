---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - Investigating HTTP 404"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20Investigating%20HTTP%20404"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Investigating HTTP 404

## Background

HTTP 404 (Not Found) indicates the browser communicated with the server but the server could not find what was requested.

## Data Collection

Collect Fiddler logs (or equivalent) for both working (direct access) and non-working (via App Proxy) scenarios.

## Troubleshooting Checklist

### 1. App Proxy Feature Disabled
HTTP 404 for **all** published apps when App Proxy Cloud Service is disabled on the tenant.
- **Fix:** Click "Enable application proxy" button in Entra Portal.

### 2. No Valid EID Premium License
Same error for all apps when no valid EID Premium license is assigned.
- **Fix:** Assign EID Premium license, then enable App Proxy.

### 3. Custom Domain CNAME Mismatch
HTTP 404 when using custom domain with incorrect DNS or missing SSL certificate.
- **Fix:** Register exact hostname in CNAME record matching External URL. Upload SSL certificate.

### 4. Geo-Location Connector Group Issue
HTTP 404 for specific app using a connector group in different geo-location than Default connector group.
- **Fix:** May need engineering involvement. Use AVA or ICM depending on urgency.

### 5. Internal URL Not Accessible
Verify the web app is accessible using the internal URL directly on the connector server.
- If not accessible → not an App Proxy issue, fix backend first.

### 6. External URL Path Coverage
Ensure External URL covers the request URL path.

Example: External URL = `https://test.contoso.com/help/`
- `https://test.contoso.com/help/test.html` → COVERED
- `https://test.contoso.com/help/test/test.html` → COVERED
- `https://test.contoso.com/help2/test.html` → NOT COVERED
- `https://test.contoso.com/test/help/test.html` → NOT COVERED

**Fix:** Broaden external URL (e.g., change `/help/` to `/`).

### 7. Single File Publishing
Publishing a single file (e.g., `https://test.contoso.com/test.html/`) may result in 404.
- Most web apps need multiple resources; this approach is incorrect.
- **Fix:** Change External URL to `https://test.contoso.com/`.

### 8. favicon.ico 404
HTTP 404 for `favicon.ico` can be safely ignored.

### 9. Different External vs Internal URL
- (a) Enable Link Translation in header (enabled by default)
- (b) Ensure web app has a listener for the hostname in External URL (e.g., SharePoint, RDWEB)

### 10. Compare Working vs Non-Working Traces
If same request shows 404 in both → not App Proxy issue, involve web app developers.

### 11. URL Encoding Issues
Compare original request URL with URL arriving at destination server.
- Collect additional data with data collector script (WinHTTP trace and AppProxyTrace on connectors).
