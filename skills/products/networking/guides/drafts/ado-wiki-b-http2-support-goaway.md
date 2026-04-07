---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: HTTP2 Support"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20HTTP2%20Support"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# HTTP2 Support and GOAWAY Troubleshooting

## Azure App Gateway Support for HTTP2

- Azure App Gateway only supports HTTP2 for HTTPS listeners. HTTP listeners do not support HTTP2. h2c (HTTP/2 over cleartext/HTTP) will **not** work — AppGW will return HTTP 403.
- Most browsers only support HTTP2 over HTTPS.
- HTTP2 is only supported on the frontend. HTTP1.1 is used for AppGW to backend connections.

## HTTP2 Connection Limits and GOAWAY Frames

### What Are GOAWAY Frames?

GOAWAY is a control frame in HTTP2 that signals graceful connection shutdown. When Application Gateway sends a GOAWAY frame, it:
- Indicates the server will no longer accept new streams on the connection
- Includes the last stream ID that will be processed
- Forces the client to open a new connection for additional requests

### Common HTTP2 Limits That Trigger GOAWAY

1. **Maximum Concurrent Streams Per Connection**: Limits simultaneous requests multiplexed on a single connection
2. **Maximum Requests Per Connection**: Total requests allowed over the lifetime of a connection
3. **Connection Timeout Limits**: Duration a connection can remain open

### Customer Impact

- **Failed requests** with no clear indication of the cause
- **Connection resets** visible in client-side logs
- **Increased latency** due to connection re-establishment overhead
- **Degraded user experience** especially for high-traffic applications

**Core problem**: Application Gateway metrics don't currently expose HTTP2-specific connection limit violations.

### Monitoring HTTP2 Connection Issues

#### 1. Enable Diagnostic Logging

Configure Application Gateway diagnostic logs:
- **ApplicationGatewayAccessLog**: Shows request patterns and timing
- **ApplicationGatewayFirewallLog**: If WAF is enabled
- **ApplicationGatewayPerformanceLog**: Gateway performance metrics

**Internal tool**: Use ReqRespErrorLogs (CSS internal) to see HTTP2 GOAWAY errors explicitly.

#### 2. Monitor Azure Monitor Metrics

| Metric | What to Watch | Potential HTTP2 Issue |
|--------|--------------|----------------------|
| Failed Requests | Sudden increases | Requests failing due to GOAWAY resets |
| Backend Response Status | 502/503 errors | Connection resets before backend response |
| Total Requests | Unexpected drops | Connections being forcibly closed |
| Current Connections | High plateau then drops | Hitting concurrent connection limits |
| New Connections Per Second | Spikes | Clients repeatedly reconnecting after GOAWAY |

#### 3. Client-Side Monitoring

- HTTP2 connection errors in application logs
- GOAWAY frame events (most HTTP2 clients log these)
- Increased connection retry attempts
- Stream reset (RST_STREAM) events
- Connection refused errors during high load

#### 4. Sample Diagnostic Query

```kusto
AzureDiagnostics
| where ResourceType == "APPLICATIONGATEWAYS"
| where httpStatus_d >= 500 or httpStatus_d == 0
| where TimeGenerated > ago(1h)
| summarize FailedRequests = count() by bin(TimeGenerated, 5m), clientIP_s
| where FailedRequests > threshold
| order by TimeGenerated desc
```

### Troubleshooting Steps

#### Step 1: Confirm HTTP2 Is Involved
- Verify HTTP2 is enabled: PowerShell `$gw.EnableHttp2`
- Check client is negotiating HTTP2 (browser dev tools, curl `-v`)
- Confirm HTTPS is being used

#### Step 2: Analyze Traffic Patterns
1. Concurrent streams per connection
2. Requests per connection lifetime
3. Connection duration
4. Peak concurrent users

#### Step 3: Reproduce and Capture

```bash
# h2load - HTTP2 load testing tool
h2load -n 10000 -c 100 -m 100 https://your-appgw.com

# curl with HTTP2 verbose output
curl -v --http2 https://your-appgw.com
```

#### Step 4: Adjust Limits (Via Support)

Contact Azure Support with:
- Application Gateway resource ID
- Expected traffic patterns
- Client error logs showing GOAWAY frames
- Azure Monitor metrics
- Business impact

**Options**: Increase max concurrent streams, max requests/connection, adjust timeouts, or **disable HTTP2 limits entirely** (for specific scenarios, ref: PACE 137308).

### Best Practices

1. Load test before production with realistic HTTP2 traffic patterns
2. Monitor connection patterns: track connection reuse and stream multiplexing
3. Implement client-side retry logic for GOAWAY handling
4. Use connection pooling
5. Consider HTTP/1.1 fallback
6. Right-size your gateway (SKU and instance count)

## Useful Links

- HTTP2 Online Tool Test: https://tools.keycdn.com/http2-test
- [HTTP2 RFC 7540 - GOAWAY Frame](https://datatracker.ietf.org/doc/html/rfc7540#section-6.8)
- [Application Gateway metrics](https://learn.microsoft.com/azure/application-gateway/application-gateway-metrics)
- [Application Gateway diagnostics](https://learn.microsoft.com/azure/application-gateway/application-gateway-diagnostics)
- Related PACE: [PACE 137308](https://dev.azure.com/Supportability/AzureNetworking/_workitems/edit/137308)
