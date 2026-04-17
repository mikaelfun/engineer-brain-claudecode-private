---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Webpage Customizations/ADFS IFrame support configuration for modern browsers"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/ADFS%20and%20WAP/ADFS%20Webpage%20Customizations/ADFS%20IFrame%20support%20configuration%20for%20modern%20browsers"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ADFS X-Frame-Options Deny behavior control for modern Browsers

Supplemental guide to [Customize HTTP security response headers with AD FS 2019](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/operations/customize-http-security-headers-ad-fs).

## Background

- AD FS by default blocks external applications from using iFrames for interactive logins (phishing prevention)
- X-Frame-Options **Allow-From** directive has limitations:
  - Only allows **one** resource to be whitelisted
  - **Deprecated** by modern browsers (Chrome, Firefox, Edge Chromium)
- Modern browsers use **Content-Security-Policy (CSP) frame-ancestors** instead

## Browser Compatibility

| Directive | IE | Chrome/Firefox/Edge |
|-----------|----|--------------------|
| X-Frame-Options Allow-From | Supported (1 app only) | NOT supported |
| CSP frame-ancestors | NOT supported | Supported (multiple apps) |

**Key**: Per W3 CSP2 Section 7.7.1, frame-ancestors obsoletes X-Frame-Options. If both are present, frame-ancestors is enforced and X-Frame-Options is ignored.

## Configuration Steps (ADFS 2016+)

### 1. Verify ResponseHeaders enabled

```powershell
(get-adfsproperties).ResponseHeadersEnabled
```

### 2. Check existing headers

```powershell
(Get-AdfsResponseHeaders).ResponseHeaders
```

### 3. Add frame-ancestors to CSP

**First time (append to existing CSP):**

```powershell
$csp = (Get-AdfsResponseHeaders).ResponseHeaders.'Content-Security-Policy' + "frame-ancestors https://portal.contoso.com:443 ;"
Set-AdfsResponseHeaders -SetHeaderName "Content-Security-Policy" -SetHeaderValue $csp
```

**Update existing directive (inline modification):**

```powershell
Set-AdfsResponseHeaders -SetHeaderName "Content-Security-Policy" -SetHeaderValue "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data:; frame-ancestors https://portal.contoso.com:443 ;"
```

### frame-ancestors syntax

- Single app: `frame-ancestors https://portal.contoso.com:443 ;`
- Multiple apps: `frame-ancestors https://app1.contoso.com https://app2.contoso.com ;`
- Wildcard (testing only): `frame-ancestors * ;`

**Warning**: If no URL scheme specified, the framing application must also use HTTPS.

**Warning**: Be very careful about character encoding when copy-pasting. Encoding issues can prevent ADFS pages from loading entirely - you would need to remove and re-set the ResponseHeader.
