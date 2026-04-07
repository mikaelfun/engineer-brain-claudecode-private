---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Application Gateway Layer 4 Proxy/Layer 4 Application Gateway Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FLayer%204%20Application%20Gateway%20Troubleshooting%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Guide for Application Gateway - TLS/TCP proxy

## How to check if the TLS/TCP proxy feature is enabled for a gateway?

### Pre-requisites:
1. The following AFEC flags should be enabled on the customer subscription:
   - AllowApplicationGatewayTlsProxy
   - EnableApplicationGatewayTlsProxyBackendHealth
2. L4 properties should be non-empty:
   - ApplicationGatewayListener
   - ApplicationGatewayRoutingRule
   - ApplicationGatewayBackendSettings
3. The following Tenant Setting should not be enabled:
   - DisableL4Proxy

### Steps to check:
1. Run ACIS action: "Get all features in subscription" and verify if the above 2 AFEC flags are registered.

2. Check the Application Gateway resource object for the following properties:

   - NRP - ACIS action: "Get NRP subscription details"
     ApplicationGatewayRoutingRule, ApplicationGatewayListener, ApplicationGatewayBackendSettings properties should be non-empty.

   - GWM - ACIS action: "Get Application gateway" L4LoadBalancingRule property should be non-empty.

   Alternatively, run the below kusto query:

```kql
ApplicationGatewaysExtendedLatestProd
// | where ResourceUri =~ '<application gateway resource uri>'
| where SkuType contains "v2"
| extend config = parse_json(Config)
| extend l4rules = config.L4LoadBalancingRules
| where isnotnull(l4rules) and isnotempty(l4rules[0])
| project GatewayName, l4rules, CloudCustomerName, GatewayId, GatewayVersion, ResourceUri
```
   Cluster: hybridnetworking.kusto.windows.net / GatewayManager

3. ASC insight: "This Application Gateway has L4 Proxy configuration." on the Insights tab in Resource Explorer.

4. ASC Resource Explorer shows TCP/TLS proxy in Listeners, Rules, and Backend Settings (protocol field shows "TLS" or "TCP").

## Information on Old and New properties

1. Old Properties (HTTP/HTTPS Load Balancing):
   - ApplicationGatewayHttpListener
   - ApplicationGatewayRequestRoutingRule
   - ApplicationGatewayBackendHttpSettings

2. New Properties (TCP/TLS Load Balancing):
   - ApplicationGatewayListener
   - ApplicationGatewayRoutingRule
   - ApplicationGatewayBackendSettings

## How to find details for frontend and backend connections?

### Backend status codes - AppGWT ReqRespLog KQL:

```kql
source
| extend prop = parse_json(properties)
| where prop.protocol == "TCP"
| project PreciseTimeStamp, RoleInstance,
protocol = prop.protocol,
instanceId = prop.instanceId,
clientIp = prop.clientIP,
clientPort = prop.clientPort,
serverRouted = prop.serverRouted,
serverStatus = prop.serverStatus, httpStatus = prop.httpStatus,
receivedBytes = prop.receivedBytes, sentBytes = prop.sentBytes,
timeTaken = todouble(prop.timeTaken), serverResponseLatency = todouble(prop.serverResponseLatency),
transactionId = prop.transactionId,
sslEnabled = prop.sslEnabled, sslCipher = prop.sslCipher, sslProtocol = prop.sslProtocol, sslClientVerify = prop.sslClientVerify, sslClientCertificateFingerprint = prop.sslClientCertificateFingerprint, sslClientCertificateIssuerName = prop.sslClientCertificateIssuerName
| order by PreciseTimeStamp asc
```

### Other log sources:
- Request Response Error logs: AppGWT -> ReqRespErrorLog
- Backend diagnostic history: AppGWT -> BackendServerDiagnosticHistory (filter on SettingName, listenerName or ruleName)
- Data path metrics: V2 Shoebox metrics Jarvis dashboard

## Supported Metrics

| Metric | Description | Type | Dimension |
|--------|-------------|------|-----------|
| Current Connections | Currently active connections (reading/writing/waiting) | Common | None |
| New Connections | Total connections handled in last 1 minute | Common | None |
| New Connections per second | Average connections/second in last 1 minute | Common | None |
| Throughput | Rate of data flow (inBytes+outBytes) in last 1 minute | Common | None |
| Healthy host count | Number of healthy backend hosts | Common | BackendSettingsPool |
| Unhealthy host | Number of unhealthy backend hosts | Common | BackendSettingsPool |
| ClientRTT | Average round trip time between clients and AppGW | Common | Listener |
| Backend Connect Time | Time spent establishing backend connection | Common | Listener, BackendServer, BackendPool, BackendHttpSetting |
| Backend First Byte Response Time | Time from connection start to first byte received | Common | Listener, BackendServer, BackendPool, BackendHttpSetting |
| Backend Session Duration | Total time of backend connection (start to termination) | L4 only | Listener, BackendServer, BackendPool, BackendHttpSetting |
| Connection Lifetime | Total time of client connection to AppGW (in ms) | L4 only | Listener |

## List of unsupported features
1. Routing based on 5-tuple hash
2. Session affinity
3. UDP protocol
4. Client IP preservation

## Backend TLS related errors
1. Setting TLS probes with specific SNI value: Check the ServerNameIndication property in BackendSettings
2. Cert CN mismatch: Check the BackendServerDiagnostic logs for probe failures
3. Cert Root CA issue: Check the BackendServerDiagnostic logs for probe failures
