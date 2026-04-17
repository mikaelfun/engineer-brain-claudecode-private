# BGP Troubleshooting for Azure VPN Gateway

> Source: [Troubleshoot BGP issues for Azure VPN Gateway](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-bgp)

## Prerequisites Checklist

| Check | Requirement |
|-------|-------------|
| Gateway SKU | BGP not supported on Basic SKU |
| VPN type | Must be Route-based |
| ASN mismatch | On-prem ASN ≠ Azure VPN gateway ASN |
| Reserved ASNs | Don't use: 8074, 8075, 12076, 65515, 65517-65520, IANA reserved |
| BGP peer IP | Cannot be same as VPN device public IP |
| IPsec tunnel | Must be Connected before BGP can start |
| Local network gateway | Must have correct BGP peer IP configured |

## Scenario 1: BGP Peer Not Connecting

1. **Verify IPsec tunnel** → Connection resource Status = Connected
2. **Check BGP peer status** → Portal: VNet Gateway → Monitoring → BGP peers; PowerShell: `Get-AzVirtualNetworkGatewayBgpPeerStatus`
3. **Verify ASN and peer IP** match on both sides (common error: peering with public IP instead of BGP peer IP from GatewaySubnet)
4. **APIPA addresses** (169.254.x.x): Range must be 169.254.21.0–169.254.22.255, no overlap, on-prem must initiate
5. **Diagnostic logs**: Enable RouteDiagnosticLog + IKEDiagnosticLog

```kusto
AzureDiagnostics
| where Category == "RouteDiagnosticLog"
| where OperationName == "BgpConnectedEvent" or OperationName == "BgpDisconnectedEvent"
| project TimeGenerated, OperationName, Message, Resource
| order by TimeGenerated desc
```

## Scenario 2: Routes Not Being Learned

- Check routes received count: BGP peers → Routes received = 0 means no routes from on-prem
- PowerShell: `Get-AzVirtualNetworkGatewayLearnedRoute` → look for `Origin: EBgp`
- On-prem device: verify BGP enabled, network statements include target prefixes, no outbound route filters
- **Prefix limit**: Max 4,000 prefixes per BGP peer. Exceeding drops entire session.

## Scenario 3: Routes Not Advertised to On-Premises

- Check advertised routes: `Get-AzVirtualNetworkGatewayAdvertisedRoute`
- **Duplicate prefix restriction with gateway transit**: Cannot advertise exact VNet prefix when peering with gateway transit. Use superset prefix (e.g., 10.0.0.0/8 instead of 10.0.0.0/16)
- Verify on-prem: no inbound route filters, routes in routing table (not just BGP table)

## Scenario 4: BGP Session Flapping

- **Hold timer expiry**: Keep-alive=60s, Hold=180s (fixed, not configurable). BFD not supported on S2S.
- **Prefix limit violations**: Occasional >4000 prefixes causes drop/re-establish cycle
- Query diagnostic logs for patterns:

```kusto
AzureDiagnostics
| where Category == "RouteDiagnosticLog"
| where OperationName == "BgpConnectedEvent" or OperationName == "BgpDisconnectedEvent"
| summarize count() by OperationName, bin(TimeGenerated, 1h)
| order by TimeGenerated desc
| render timechart
```

## Active-Active Gateway BGP Issues

- Both instances have separate BGP peer IPs → on-prem must peer with BOTH
- Asymmetric routing: Use AS path prepending or MED to control traffic flow
- Mode change (active-standby ↔ active-active) changes BGP IPs → update on-prem config

## BGP + NAT Considerations

- NAT rules must not conflict with BGP peer IPs
- Address translation rules must correctly map BGP-exchanged prefixes
- Verify on-prem BGP peering address is pre-NAT or post-NAT as expected

## Diagnostic Tools

| Tool | Use Case |
|------|----------|
| Portal → BGP peers | Quick health check |
| Get-AzVirtualNetworkGatewayBgpPeerStatus | Detailed peer status |
| Get-AzVirtualNetworkGatewayLearnedRoute | Verify route learning |
| Get-AzVirtualNetworkGatewayAdvertisedRoute | Verify route advertisement |
| RouteDiagnosticLog | Session events, route changes |
| IKEDiagnosticLog | IPsec tunnel issues affecting BGP |
| TunnelDiagnosticLog | Correlate tunnel drops with BGP drops |
| BGP Peer Status metric | Alerting and dashboards |
