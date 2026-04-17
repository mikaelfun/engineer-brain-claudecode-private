---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - GatewayTimeout-There may be a connectivity problem"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20GatewayTimeout-There%20may%20be%20a%20connectivity%20problem"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - GatewayTimeout / NoActiveConnector Troubleshooting

## Error

An external client attempts to access a published application and gets:

> GatewayTimeout: The corporate app cannot be accessed
> Make sure the Microsoft Entra private network connector is properly installed and registered...

Fiddler/Kusto shows: **NoActiveConnector**, HTTP 504 - GatewayTimeout

Key response headers to check:
- `x-ms-proxy-app-id`: App Proxy app ID
- `x-ms-proxy-group-id`: Assigned connector group ID
- `x-ms-proxy-subscription-id`: Tenant ID

## Cause

No connector assigned to the connector group, or the connector cannot communicate with the Service Bus endpoints. Usually caused by DNS resolution, SSL configuration/negotiation issues, or incorrectly configured firewall/proxy.

## Troubleshooting Steps

### 1. ASC Validation
- Use ASC to validate App Proxy app configuration
- (a) No connector in group → assign one
- (b) Connector inactive → follow "Connector appears as inactive" article
- (c) Connector active → continue below

### 2. Connector Version
- Ensure latest connector version is installed
- Check version history: https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-release-version-history

### 3. SSL/TLS Settings
- Verify TLS settings per: https://learn.microsoft.com/entra/global-secure-access/how-to-configure-connectors#transport-layer-security-tls-requirements

### 4. Root CA Certificates
Install in Local Computer > Root Certification Authorities (certlm.msc):

| CA | Thumbprint (SHA1) |
|---|---|
| DigiCert Global Root G2 | df3c24f9bfd666761b268073fe06d1cc8d4f82a4 |
| DigiCert Global Root CA | a8985d3a65e5e5c4b2d7d66d40c6dd2fb19c5436 |

### 5. Network Requirements
- Does connector access Internet via outbound proxy? (YES/NO)
- Are ports TCP 80/443 open for outbound?
- Is SSL inspection used? (must be disabled)
- Can connector reach required URLs? (see https://learn.microsoft.com/entra/global-secure-access/how-to-configure-connectors#allow-access-to-urls)
- Specifically check `*.servicebus.windows.net` access

### 6. Direct Internet Access (no proxy)
Check `ApplicationProxyConnectorService.exe.config` for proxy settings:
- If proxy is configured but not needed → remove the `<system.net>` proxy section
- Check for hidden proxy: WinHttp proxy (`netsh winhttp show proxy`), `UseDefaultProxyForBackendRequests` registry key, `machine.config`, IE proxy in Network Service context
- To force no proxy: add `<defaultProxy enabled="false"></defaultProxy>`
- Restart connector service after changes

### 7. Outbound Proxy Access
- Verify proxy config in `ApplicationProxyConnectorService.exe.config`
- Proxy URL format must be: `protocol://proxy:port` (e.g., `http://proxy.domain.com:8080`)
- Use `ConfigureOutBoundProxy.ps1` script to set proxy correctly
- Reference: https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-configure-connectors-with-proxy-servers

## Data Collection
1. Use Data Collector script with `-ServiceTraceOn` switch on connector server
2. Fiddler on test client
3. Wait 30 sec, replicate issue
4. Stop collection
5. If outbound proxy used, collect proxy IP and port

## Advanced: Finding Service Bus Endpoints (Kusto)
```kql
BootstrapRootOperationEvent
| where env_time > ago(30m) and subscriptionId == "TENANT_ID" and connectorId == "CONNECTOR_ID"
| extend ServiceBusEndpoints = extract("'SignalingListenerEndpoints':(.*)", 1, responseString)
| project env_time, connectorId, connectorVersion, ServiceBusEndpoints
```
