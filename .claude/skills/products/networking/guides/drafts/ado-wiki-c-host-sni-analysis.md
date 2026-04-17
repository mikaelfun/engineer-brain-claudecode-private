---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Expert Troubleshooting/HOST and SNI analysis for live and probe traffic on Azure Application Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FHOST%20and%20SNI%20analysis%20for%20live%20and%20probe%20traffic%20on%20Azure%20Application%20Gateway"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# HOST and SNI Analysis for Live and Probe Traffic on Azure Application Gateway

## Background

**HOST**: HTTP header field containing the domain name of the server and TCP port.

**SNI**: TLS extension where the client indicates which hostname it is connecting to at the start of the TLS handshake. Allows a server to present multiple certificates on the same IP/port.

## SNI Behavior

### V1 (Same for both probe and live)
- SNI = FQDN from backend pool (per RFC 6066)
- If backend pool is IP address, SNI is not set — backend must provide fallback cert
- No fallback cert → server may reset connection

### V2 Probe Traffic
- SNI = hostname from custom probe (if configured)
- Else SNI = hostname from HTTP settings (if set)
- Else SNI = FQDN from backend pool (if using "well known CA" option)
- Probe hostname takes priority over backend pool FQDN
- IP addresses not supported for SNI

### V2 Live Traffic (Healthy Backend)
- SNI = hostname from HTTP settings
- Else SNI = FQDN from backend pool
- IP addresses not supported for SNI

## HOST Header Reference Table

### HTTP Proxy (HTTP to HTTP)

| Config | Live Traffic HOST | Probe Traffic HOST |
|--------|------------------|-------------------|
| Regular settings, default probe | URL from client | 127.0.0.1 |
| Regular settings, custom probe | URL from client | Probe setting value |
| Pickup host, default probe | Backend pool FQDN/IP | 127.0.0.1 |
| Pickup host, custom probe | Backend pool FQDN/IP | Probe setting value |
| Pickup host, custom probe with pickup | Backend pool FQDN/IP | Backend pool FQDN/IP |

### SSL Offload (HTTPS to HTTP) — Same as HTTP Proxy table above.

### End-to-End SSL (HTTPS to HTTPS)

| Config | Live HOST | Probe HOST | Live SNI | Probe SNI |
|--------|-----------|------------|----------|-----------|
| Regular, default probe | Client URL | 127.0.0.1 | Client URL | NULL(IP) or Backend FQDN |
| Regular, custom probe | Client URL | Probe value | Client URL | Probe value |
| Pickup host, default probe | Backend FQDN/IP | 127.0.0.1 | Backend FQDN/IP | NULL(IP) or Backend FQDN |
| Pickup host, custom probe | Backend FQDN/IP | Probe value | Backend FQDN/IP | Probe value |
| Pickup host, custom probe+pickup | Backend FQDN/IP | Backend FQDN/IP | Backend FQDN/IP | NULL(IP) or Backend FQDN |

**Key**: Probe SNI never changes regardless of custom probe settings for non-pickup configurations.

## Troubleshooting Cases

### Case 1: HTTP proxy, 502 accessing site
**Cause**: Default probe sends HOST=127.0.0.1, IIS has no site binding for 127.0.0.1 → 404 → probe unhealthy → 502.
**Fix**: Remove host binding from one IIS site (so it responds to any host), or use custom probe with correct hostname.

### Case 2: HTTP proxy, 404 accessing site
**Cause**: Probe healthy (site without host binding catches 127.0.0.1), but the target site is stopped or has no binding.
**Fix**: Start the stopped site or add correct host binding. Use custom probe per site for proper health detection.

### Case 3: HTTP proxy, unexpected content
**Cause**: PickHostNameFromBackendAddress=True overrides live traffic HOST to backend pool FQDN, hitting wrong IIS site.
**Fix**: Set PickHostNameFromBackendAddress to false.

### Case 4a: End-to-end SSL, 502
**Cause**: No fallback cert on IIS + IP in backend pool → probe TLS handshake fails (no SNI, no fallback). Even with fallback cert, probe HOST=127.0.0.1 may get 404. Also need correct auth cert in backend settings.
**Fix**: (1) Enable fallback cert on IIS, remove host binding from one site, update auth cert. Or (2) Change backend pool from IP to FQDN, use custom probe with correct host, update auth cert.

### Case 4b: End-to-end SSL, 404
**Cause**: Probe healthy (hits fallback site), but live traffic HOST goes to a stopped site.
**Fix**: Start the site. Use custom probe per site for accurate health detection.

### Case 4c: End-to-end SSL, unexpected content
**Cause**: PickHostNameFromBackendAddress=True changes live SNI+HOST to backend pool FQDN, hitting wrong site.
**Fix**: Set PickHostNameFromBackendAddress to false.
