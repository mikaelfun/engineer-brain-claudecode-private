---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Application Gateway Architecture"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FApplication%20Gateway%20Architecture"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Application Gateway Architecture and Features Reference

## Architecture

- Azure Application Gateway is a managed Layer 7 (HTTP/HTTPS) load-balancing service
- Based on ARR (Application Request Routing) module on IIS
- Load-balancing uses weighted round robin with optional cookie-based affinity
- v1 SKU: Cloud Service deployment (Windows, A3/D3V2 VMs)
- v2 SKU: Linux VMSS in shared Microsoft subscription (Standard_v2, WAF_v2)
- **⚠️ Internal info**: Do NOT share VMSS/LB infrastructure details with customers

## Key Features

### WAF (Web Application Firewall)
- Available as WAF and WAF_v2 SKUs
- GA: March 2017

### Connection Draining
- Configure via PowerShell: `Set-AzApplicationGatewayConnectionDraining`
- Modifies connection draining on backend HTTP settings

### End-to-End SSL
- Full SSL termination and re-encryption to backend

### HTTP to HTTPS Redirection
- Listener-to-listener redirection
- Supports path-specific redirect
- Cross-domain redirect (.com → .org)

### SSL Policy
- Control TLS version and cipher suites
- Built-in policies: AppGwSslPolicy20150501, 20170401, 20170401S
- Custom policies for specific ciphers
- **Note**: Cannot modify curves, only ciphers and TLS version (PG working on this, no ETA)

### Probe Enhancements
- Custom HTTP response code matching (e.g., "200-399", "503")
- HTTP response body matching (regex supported)
- MinServers: keep minimum servers alive even if probes failing
- Enable/disable probing for troubleshooting

### Multi-Tenant / WebApps Support
- All Web App deployments supported: Basic, Standard, Premium, ASE
- Host name override for multi-tenant backends

### Idle Timeout
- Configurable on Public IP: 4 min default, max 30 min
- `New-AzPublicIpAddress -IdleTimeoutInMinutes`

### Frontend Public IPv6
- GA: March 2024
- Dual-stack (IPv4 + IPv6) frontend supported
- IPv6 traffic translated to IPv4 before sending to backend

### v2 Header Rewrite
- GA: April 2019
- Add/remove/update HTTP request/response headers
- Conditional rewrite supported

### v2 Key Vault Integration
- SSL certificates stored in Azure Key Vault
- Requires: connectivity to KV, enabled secret, correct permissions

### v2 URL Rewrite
- Modify URLs through Application Gateway

## Known Issues

### Cannot create AppGW in /29 subnet from Portal
- Portal blocks /29 subnets by design (prevents scaling issues)
- **Workarounds**: Create with fewer instances then scale up, OR use PowerShell
- /29 technically works for ≤3 instances (no private frontend IP) or 2+1

## Case Handling

- Supported by Azure Networking POD (ANP)
- Service: Application Gateway
- Problem types: Advisory, Configuration and Setup, Connectivity (502 errors), Performance, WAF

## Internal Dashboard Links

- Jarvis Shoebox Metrics: `AppGWT/Performance/ShoeboxMetrics`
- P360: Application Gateway > ClosedVolume > Monthly > ByProblemType
- CaseTriage filters available for open/closed cases
