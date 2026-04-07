---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/investigate-missing-telemetry"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshoot missing application telemetry in Azure Monitor Application Insights

## Common causes in the ingestion pipeline

1. **SDK/agent misconfigured** - not sending telemetry to ingestion endpoint
2. **Network blocks** calls to ingestion endpoint
3. **Ingestion endpoint drops or throttles** inbound telemetry
4. **Ingestion pipeline** drops/slows telemetry due to service health issues
5. **Log Analytics** service health problems saving records (uncommon)
6. **Query API** at `api.applicationinsights.io` fails (uncommon)

## Microsoft Entra ID authentication

If your Application Insights data collection endpoint uses Microsoft Entra ID authentication, the application must also authenticate with Entra ID. Otherwise telemetry is silently rejected.

## Diagnostic approach: Send a sample telemetry record

Use PowerShell or curl to send a test availability result directly to the ingestion endpoint. This eliminates SDK issues from the equation.

### PowerShell (Availability test result)

```powershell
$ConnectionString = "<your-connection-string>"
# Parse connection string to get IngestionEndpoint and InstrumentationKey
# Send POST to {IngestionEndpoint}/v2/track with availability data payload
$ProgressPreference = "SilentlyContinue"
Invoke-WebRequest -Uri $url -Method POST -Body $availabilityData -UseBasicParsing
```

**Expected result**: HTTP 200 with `itemsReceived` matching `itemsAccepted`.

### Curl (Linux/MacOS)

```bash
curl -H "Content-Type: application/json" -X POST -d '{"data":{"baseData":{"ver":2,...},"baseType":"AvailabilityData"},...}' https://dc.applicationinsights.azure.com/v2.1/track
```

## Interpreting results

- **Sample arrives** in Application Insights Logs tab → SDK/agent configuration issue. Collect SDK self-diagnostic logs.
- **Sample fails** → Network/TLS/DNS issue:
  - DNS fails to resolve ingestion endpoint
  - TCP blocked by firewall/gateway
  - TLS version mismatch (endpoints require TLS 1.2)
  - Multiple Azure Monitor Private Links overwriting DNS entries

## Entra ID authentication errors

| Error | Cause | Fix |
|-------|-------|-----|
| HTTP 400 "Authentication not supported" | Resource is Entra-only but SDK sends to v2/track | Configure SDK correctly; Entra ID requires v2.1/track |
| HTTP 401 "Authorization required" | SDK cannot acquire valid token | Check Azure Identity exceptions in SDK logs |
| HTTP 403 "Unauthorized" | Credentials lack permission | Assign Monitoring Metrics Publisher role to the identity |

### Language-specific Entra ID troubleshooting

- **.NET**: Enable EventSource logs, look for "Failed to get AAD Token" message
- **Java**: Use Fiddler proxy (`"proxy": {"host":"localhost","port":8888}`), check for `CredentialUnavailableException` or `MsalServiceException`
- **Node.js**: `appInsights.setup(...).setInternalLogging(true, true)`
- **Python**: Credential errors (no token), authentication errors (wrong role), status 400/403

## TLS/SSL troubleshooting

Most ingestion endpoints require TLS 1.2. Test with:

```powershell
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::TLS12
```
