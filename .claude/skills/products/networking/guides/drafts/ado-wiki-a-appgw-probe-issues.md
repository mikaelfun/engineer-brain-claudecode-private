---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Foundational and Specialist Troubleshooting/Application Gateway Probes Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FApplication%20Gateway%20Probes%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Description

Common issues related to Application Gateway health probes. Probe status values:
- **Healthy**: backend is replying as expected
- **Unhealthy**: did not receive expected response from backend
- **Unknown**: platform does not know status (something is preventing AppGW-to-platform communication)

Public doc: https://docs.microsoft.com/azure/application-gateway/application-gateway-probe-overview

---

## Unhealthy Status

Means we did not get a response at all, or the response was not an acceptable HTTP response.

### Possible Causes

#### Probe Not Assigned to HTTP Setting
Just because a custom probe is configured does NOT mean it is being used. Ensure probes are **assigned to the appropriate HTTP Settings**.

#### HTTP Status Code Mismatch
Default accepted status codes: **200-399**. Adjust per probe if backend returns 401 (auth prompt), etc.

> ⚠️ Note: NRP 184 change — GET AppGW operation returns `probeMatchStatusCode` as default 200-399 even if not previously set. Subsequent PUT will carry these values. No customer impact, 200-399 is the default.

#### Certificate Issues (End-to-End SSL)
With E2E SSL, the backend server's probe-facing cert CN must match the hostname configured on the probe.

#### Backend Pool Configuration Issues
If BEP uses IPs or `x.AzureWebsites.net` AND backend setting uses "pick hostname from backend setting" AND probe uses "pick hostname from backend pool" → server may expect a specific hostname that doesn't align.
- Fix: Specify hostname explicitly in probe config, or change BEP to an FQDN the backend expects
- For trusted services (WebApp/AppService): do NOT upload a backend certificate (inherent trust)

#### SNI (Server Name Indication)
SNI is part of SSL negotiation before HTTP data. Default probe gets public key from default SSL binding at backend IP. If backend uses SNI and the IP serves a different cert than the intended site, probe may fail.
- Visit `https://127.0.0.1/` on backend to confirm which cert is used for default SSL binding
- If no response → must set up a default SSL binding on backend VMs, or probes will fail

#### Custom DNS
Every custom DNS server configured on the AppGW VNet **must be able to resolve every FQDN** in the datapath. A single DNS server that cannot resolve a backend FQDN will cause probe failures.
- Check using "Get List of NonResolveable Domains" Jarvis Action

### Queries to View Failure Cause

- Force health check: Jarvis > "Get Application Gateway Backend Health" action
- Correlate timestamps with `BackendServerDiagnosticHistory` table (via Diagnostics tab or Jarvis: diagnostics prod → AppGWT → BackendServerDiagnosticHistory, scoping condition = gatewayId)

### AppGW ProbeOutput Error Codes
All preceded by `ngx_http_upstream_check_err_`:

| Error Code | Meaning |
|---|---|
| **Unknown** | Unknown cause of failure |
| **Timeout** | AppGW contacted but HTTP response not returned before timeout |
| **HostNameNotResolved** | DNS failure |
| **AddressNotReachable** | Server IP/FQDN not reachable — Layer 4 connectivity issue |
| **PortNotReachable** | Server port not reachable — Layer 3 connectivity issue |
| **ServerNotReachable** | Generic — unknown reason for connection failure |
| **HttpStatusCodeMismatchWithStatusCode** | Backend returns status code outside probe's accepted values (default 200-399) |
| **HttpResponseBodyMismatch** | Response body matching configured but body doesn't match (only if body matching enabled) |
| **BackendServerCertificateNotWhitelisted** | Backend cert not properly allowlisted on AppGW |
| **BackendCertInvalidCA** | Invalid CA |
| **BackendCertInvalidCN** | Chain complete and correctly ordered, but CN is invalid |
| **BackendSecureConnectionError** | Check backend cert allowlisting and cert validity |
| **GatewayNotReachable** | NSG/UDR/Firewall blocking ports 65503-65534 on AppGW subnet |
| **CertVerificationFailed** | Verification failed but not due to CN/CA/root/expiry issues |
| **BackendServerCertificateNotTrustedByRootCertificates** | Backend cert chain does not match trusted root cert on AppGW; ensure correct root cert uploaded |
| **TrustedCertsNotLoaded** | AppGW could not find cert info in trusted root cert; re-upload cert |
| **BackendCertificateCNMismatchWithProbeHostName** | Backend cert CN does not match hostname configured on probe |
| **BackendServerCertificateExpired** | Backend cert has passed its validity date; customer must upload valid cert |
| **IncorrectBackendCertificateChainLeafCertificateIsNotTopmostCertificate** | Leaf cert present but not topmost cert |
| **IncorrectBackendCertificateChainMissingLeafCertificate** | Missing leaf certificate in chain |
| **IncompleteBackendCertificateChainOnlyLeafCertificateIsPresent** | Chain only contains leaf certificate |
| **BackendServerCertificateNotTrustedByWellKnownCAs** | Root cert not in well-known CA list ([full list](https://ccadb.my.salesforce-sites.com/microsoft/IncludedCACertificateReportForMSFT)) |
| **SuccessWithStatusCode** | Probe succeeded; check `args` field in BackendServerDiagnosticsHistory |

---

## Unknown Health Status

Platform does not know if AppGW received a healthy response from backend.

### Possible Causes

#### NSG Blocking Ports 65503-65534

NSG on AppGW subnet must allow **inbound** on ports 65503-65534. Source: `Internet` or `AzureCloud` (or region-specific tag e.g., `AzureCloud.EastUS`).

> ⚠️ Blocking outbound internet also causes Unknown status (breaks log streaming to Jarvis, Storage, Log Analytics, Event Hub). For AppGWv1 only: use `AzureCloud` tag in outbound rules instead of blocking Internet entirely.

#### Route Issues and/or Firewalls

- **Default route (0.0.0.0/0) via VPN/ExpressRoute**: health status reports go to on-prem instead of platform
  - Fix: Add UDR on AppGW subnet matching default route with next hop = Internet (does NOT route all traffic to internet, only traffic without more specific routes)
- **UDR routing to Azure Firewall/NVA**: causes same issue as default route
  - Fix: Remove UDR from AppGW subnet OR ensure only specific prefixes (not 0.0.0.0/0) route to firewall

---

## Related Documents

- AppGW - Correcting website certificates
- How to set up Application Gateway with ILB ASE - Best Practice
