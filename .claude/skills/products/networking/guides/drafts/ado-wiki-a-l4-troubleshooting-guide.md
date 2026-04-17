---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/TSG:  Layer 4 Application Gateway Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FTSG%3A%20%20Layer%204%20Application%20Gateway%20Troubleshooting%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Guide for Application Gateway - TLS/TCP proxy

## How to check if TLS/TCP proxy is enabled

### Pre-requisites
1. AFEC flags enabled on subscription:
   - AllowApplicationGatewayTlsProxy
   - EnableApplicationGatewayTlsProxyBackendHealth
2. L4 properties non-empty: ApplicationGatewayListener, ApplicationGatewayRoutingRule, ApplicationGatewayBackendSettings
3. Tenant Setting DisableL4Proxy should NOT be enabled

### Steps
1. ACIS action "Get all features in subscription" to verify AFEC flags
2. Check Application Gateway resource:
   - NRP (ACIS "Get NRP subscription details"): ApplicationGatewayRoutingRule, Listener, BackendSettings non-empty
   - GWM (ACIS "Get Application gateway"): L4LoadBalancingRule non-empty

Kusto query:
```kql
cluster('hybridnetworking.kusto.windows.net').database('GatewayManager').ApplicationGatewaysExtendedLatestProd
| where SkuType contains "v2"
| extend config = parse_json(Config)
| extend l4rules = config.L4LoadBalancingRules
| where isnotnull(l4rules) and isnotempty(l4rules[0])
| project GatewayName, l4rules, CloudCustomerName, GatewayId, GatewayVersion, ResourceUri
```

3. ASC insight: "This Application Gateway has L4 Proxy configuration."
4. ASC Resource Explorer shows TCP/TLS for Listeners (protocol "TLS"/"TCP"), Rules, Backend Settings

## Old vs New Properties

| Purpose | Old (HTTP/HTTPS) | New (TCP/TLS) |
|---------|-----------------|---------------|
| Listener | ApplicationGatewayHttpListener | ApplicationGatewayListener |
| Rule | ApplicationGatewayRequestRoutingRule | ApplicationGatewayRoutingRule |
| Backend | ApplicationGatewayBackendHttpSettings | ApplicationGatewayBackendSettings |

## Diagnostic Queries

### ReqRespLog (L4 traffic)
```kql
source
| extend prop = parse_json(properties)
| where prop.protocol == "TCP"
| project PreciseTimeStamp, RoleInstance,
  protocol = prop.protocol, instanceId = prop.instanceId,
  clientIp = prop.clientIP, clientPort = prop.clientPort,
  serverRouted = prop.serverRouted, serverStatus = prop.serverStatus,
  httpStatus = prop.httpStatus,
  receivedBytes = prop.receivedBytes, sentBytes = prop.sentBytes,
  timeTaken = todouble(prop.timeTaken),
  serverResponseLatency = todouble(prop.serverResponseLatency),
  transactionId = prop.transactionId,
  sslEnabled = prop.sslEnabled, sslCipher = prop.sslCipher, sslProtocol = prop.sslProtocol
| order by PreciseTimeStamp asc
```

Other diagnostic sources:
- ReqRespErrorLog: Request/Response errors
- BackendServerDiagnosticHistory: Filter on SettingName, listenerName, ruleName
- V2 Shoebox metrics Jarvis dashboard

## Supported Metrics

| Metric | Type | Dimension |
|--------|------|-----------|
| Current Connections | Common | None |
| New Connections | Common | None |
| New Connections per second | Common | None |
| Throughput | Common | None |
| Healthy host count | Common | BackendSettingsPool |
| Unhealthy host | Common | BackendSettingsPool |
| ClientRTT | Common | Listener |
| Backend Connect Time | Common | Listener, BackendServer, BackendPool, BackendHttpSetting* |
| Backend First Byte Response Time | Common | Listener, BackendServer, BackendPool, BackendHttpSetting* |
| Backend Session Duration | L4 only | Listener, BackendServer, BackendPool, BackendHttpSetting* |
| Connection Lifetime | L4 only | Listener |
| Connection status codes | L4 only (Internal) | HttpStatusGroup |
| Backend Connection Status codes | L4 only (Internal) | HttpStatusGroup |

> *BackendHttpSetting dimension includes both L7 and L4 backend settings

## Unsupported Features
1. Routing based on 5-tuple hash
2. Session affinity
3. UDP protocol
4. Client IP preservation

## Backend TLS Errors
1. **TLS probe SNI**: Check ServerNameIndication in BackendSettings
2. **Cert CN mismatch**: Check BackendServerDiagnostic logs for probe failures
3. **Cert Root CA issue**: Check BackendServerDiagnostic logs for probe failures
