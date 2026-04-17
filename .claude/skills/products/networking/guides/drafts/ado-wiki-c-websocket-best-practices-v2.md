---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WebSocket Best Practices (v2 SKU)"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWebSocket%20Best%20Practices%20(v2%20SKU)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# WebSocket Best Practices for Application Gateway v2 SKU

> **NOTE**: Public documentation does not yet cover WebSocket best practices for AppGW v2. This guide is for **internal CSS use** based on PG recommendations from RCAs.

## Caveats with v2 SKU and WebSockets

### 1. WebSocket connections consume large amounts of memory
- WebSocket connections remain open indefinitely until client or backend disconnects
- Without a clean-up mechanism, memory exhaustion (100% util) is likely
- Memory exhaustion can crash the instance's nginx service
- A crash drops **all** existing WebSocket connections; AppGW may become unavailable while instances are rebuilt

### 2. AppGW v2 does NOT autoscale based on memory (INTERNAL ONLY)
- Autoscale scales out on CPU utilization, not memory
- When WebSockets exhaust memory and crash an instance, reconnecting clients overload remaining healthy instances → cascading failure

### 3. Any CRUD PUT causes nginx to bounce, resetting WebSocket connections
- This includes Autoscale operations

## Best Practices (Shareable with Customers)

### 1. Use Standard_v2 instead of WAF_v2 SKU
- WAF cannot inspect WebSocket traffic (built on top of HTTP)
- WAF engine consumes large additional memory
- If customer insists on WAF_v2:
  - Must use **CRS 3.2 or DRS 2.1+** (higher rulesets use a newer, more performant engine)
  - CRS 3.0/3.1 on WAF_v2 with high memory → may trigger automatic **MemWatcher Hotfix**

### 2. Use Manual Mode instead of Autoscaling
- Overprovision instances to ensure memory is not exhausted at peak WebSocket traffic hours
- Review instance count averages over time to determine appropriate count

### 3. Disable MemWatcher Hotfix (if present)
- MemWatcher bounces the nginx process any time memory exceeds 40%
- Verify via VMSS Dashboard → "Process Memory Utilization" table
- Check TenantLogs for MemWatcher messages
- To disable: reach out to TA to change the flag at Tenant level

### 4. Schedule AppGW changes during low-traffic windows
- Any PUT operation to AppGW will disconnect all existing WebSocket connections

### 5. Do NOT use AGIC (Application Gateway Ingress Controller) with WebSockets
- AGIC makes frequent PUTs to AppGW (e.g. when Kubernetes pods are rebuilt with new IPs), which disconnects WebSocket connections

## References
- CRI: https://portal.microsofticm.com/imp/v3/incidents/incident/483872001/summary
- Public Doc: https://learn.microsoft.com/en-us/azure/application-gateway/application-gateway-websocket
