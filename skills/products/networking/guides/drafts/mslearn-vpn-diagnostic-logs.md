# VPN Gateway Diagnostic Logs Analysis

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/troubleshoot-vpn-with-azure-diagnostics

## Available Log Tables

| Log Table | Scope | Key Use |
|-----------|-------|---------|
| GatewayDiagnosticLog | Config changes | Audit SetGatewayConfiguration, migrations, maintenance events |
| TunnelDiagnosticLog | Tunnel connect/disconnect | Track TunnelConnected/TunnelDisconnected per remote IP + instance |
| RouteDiagnosticLog | Route changes | StaticRouteUpdate, BgpRouteUpdate, BgpConnectedEvent |
| IKEDiagnosticLog | IKE/IPsec negotiation | Verbose debug for connection failures, SA proposals |
| P2SDiagnosticLog | Point-to-Site | P2S client connections (IKEv2/OpenVPN), Entra ID auth |

Note: Policy-based gateways only have GatewayDiagnosticLog and RouteDiagnosticLog.

## Setup

Create diagnostic settings in Azure Monitor to send logs to Log Analytics workspace.

## Key KQL Queries

### Gateway Configuration Changes
```kql
AzureDiagnostics
| where Category == "GatewayDiagnosticLog"
| project TimeGenerated, OperationName, Message, Resource, ResourceGroup
| sort by TimeGenerated asc
```

### Tunnel Connectivity History
```kql
AzureDiagnostics
| where Category == "TunnelDiagnosticLog"
// | where remoteIP_s == "<REMOTE IP>"
| project TimeGenerated, OperationName, remoteIP_s, instance_s, Resource
| sort by TimeGenerated asc
```

### IKE/IPsec Negotiation Debug
```kql
AzureDiagnostics
| where Category == "IKEDiagnosticLog"
| extend Message1=Message
| parse Message with * "Remote " RemoteIP ":" * "500: Local " LocalIP ":" * "500: " Message2
| extend Event = iif(Message has "SESSION_ID", Message2, Message1)
| project TimeGenerated, RemoteIP, LocalIP, Event, Level
| sort by TimeGenerated asc
```

### BGP Route Exchanges
```kql
AzureDiagnostics
| where Category == "RouteDiagnosticLog"
| project TimeGenerated, OperationName, Message, Resource
```

### P2S Client Connections
```kql
AzureDiagnostics
| where Category == "P2SDiagnosticLog"
| project TimeGenerated, OperationName, Message, Resource
```

## Troubleshooting Patterns

### Gateway Failover Detection
- Disconnection on instance_0 followed by connection on instance_1 within seconds = planned maintenance failover
- Same pattern after Gateway Reset = expected reboot behavior

### DPD Timeout vs Network Glitch
- Disconnection + reconnection on SAME instance within seconds = network glitch or DPD timeout from on-prem device

### IPsec Negotiation Failure
1. Find initial SA_INIT message (rCookie=0) - whoever sends first = "initiator"
2. Azure retries every few seconds on failure - examine any "sample" failing negotiation
3. Check SA_INIT for IPsec parameters against Azure default settings

## 21V Applicability
Applicable - diagnostic logs available in both Global and 21V environments.
