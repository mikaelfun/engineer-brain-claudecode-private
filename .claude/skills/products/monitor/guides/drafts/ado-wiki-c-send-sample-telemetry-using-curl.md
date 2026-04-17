---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Validate Network Connectivity/Send Sample Telemetry Using Curl"
sourceUrl: "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Validate%20Network%20Connectivity/Send%20Sample%20Telemetry%20Using%20Curl"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Send Sample Telemetry Using Curl

## Purpose

For Linux environments without Python installed (e.g., Azure App Service on Linux), use `curl` to bypass the AI SDK and directly test network connectivity to Application Insights ingestion endpoint.

This is a quick way to validate:
- Network connectivity to the ingestion endpoint
- Whether the endpoint is accepting telemetry

## Sample curl Command

> **Replace `xxx` with the actual connection string region and ikey.**

```bash
current_time=$(date -u +'%Y-%m-%dT%H:%M:%S.0000000Z')
curl -X POST https://xxxxxxxxxxxxxxxx.applicationinsights.azure.com/v2/track \
   -H "Content-Type: application/json" \
   -d '{
     "data": {
        "baseType": "RequestData",
        "baseData": {
          "ver": 2,
          "id": "Microsoft Support Test Requests from ssh",
          "duration": "00:00:01.0000000",
          "responseCode": "test",
          "url": "https://www.microsoft.com"
        }
     },
     "ver": "1",
     "iKey": "xxxxxxxxxxxxxx",
     "name": "Microsoft.ApplicationInsights.Request",
     "time": "'$current_time'",
     "sampleRate": "100",
     "flags": "0"
   }'
```

## Expected Output

A successful response will show an HTTP 200 response with a JSON payload indicating:
- `itemsReceived` matches `itemsAccepted` (1 = 1)

## Related
- [Send Sample Telemetry Using PowerShell](guides/drafts/ado-wiki-c-send-sample-telemetry-using-powershell.md)
- [Test Basic Connectivity to AI Endpoints](guides/drafts/ado-wiki-c-test-basic-connectivity-to-ai-endpoints.md)
