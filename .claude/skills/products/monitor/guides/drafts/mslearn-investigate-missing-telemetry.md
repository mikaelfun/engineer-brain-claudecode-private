---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/investigate-missing-telemetry"
importDate: "2026-04-20"
type: guide-draft
---

# Troubleshoot Missing Application Telemetry - Diagnostic Flow

## Processing Pipeline Steps (where telemetry can be lost)

1. SDK/agent misconfigured - not sending to ingestion endpoint
2. Network blocks calls to ingestion endpoint
3. Ingestion endpoint drops/throttles inbound telemetry
4. Ingestion pipeline service health issues
5. Log Analytics service health problems (uncommon)
6. Query API failure at api.applicationinsights.io (uncommon)

## Step 1: Send Sample Telemetry Record

Use PowerShell or curl to send a test availability result directly to the ingestion endpoint.

**If sample arrives**: Problem is in SDK/agent configuration
**If sample fails**: Problem is in network/endpoint/TLS

### PowerShell Test (Availability Result)
- Supply connection string or iKey
- Use `Invoke-WebRequest -Uri $url -Method POST -Body $data -UseBasicParsing`
- Look for HTTP 200 with itemsReceived == itemsAccepted

### curl Test (Linux)
```
curl -H "Content-Type: application/json" -X POST -d '<json>' https://dc.applicationinsights.azure.com/v2.1/track
```

## Step 2: Check TLS/SSL Configuration
- Most endpoints require TLS 1.2
- Test different protocols: `[System.Net.ServicePointManager]::SecurityProtocol = TLS12`
- Check for proxy/firewall SSL certificate offloading issues

## Step 3: Entra ID Authentication Troubleshooting
- HTTP 400: Resource set as Entra-only, SDK sending to wrong API (v2/track vs v2.1/track)
- HTTP 401: SDK cannot acquire valid token
- HTTP 403: Credentials lack Monitoring Metrics Publisher role

### Language-Specific Checks
- .NET: Collect event source logs with PerfView
- Java: Inspect traffic with Fiddler, check for CredentialUnavailableException
- Node.js: Enable internal logging with setInternalLogging(true, true)
- Python: Check for credential error / authentication error in logs

## Step 4: Network/DNS Issues
- DNS fails to resolve ingestion endpoint
- TCP blocked by firewalls
- Azure Monitor Private Link overwriting DNS entries
- Note: Network issues should be escalated to Azure Networking support
