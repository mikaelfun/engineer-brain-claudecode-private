---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Networking/Network Connectivity/Validate TCP connectivity against Application Insights endpoints"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Networking/Network%20Connectivity/Validate%20TCP%20connectivity%20against%20Application%20Insights%20endpoints"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Validate TCP connectivity against Application Insights endpoints

## Overview

This guide shows how to validate proper TCP connections for Application Insights endpoints when investigating App Service web apps.

## Validate TCP connectivity using curl

In the App Service Console blade:

```bash
curl -v --tlsv1.2 --tls-max 1.2 https://eastus-3.in.applicationinsights.azure.com:443
```

The output provides:
1. Successful name resolution for the endpoint
2. IP address resolved during DNS exchange and connection attempt on port 443
3. Successful TCP (Layer 4) connection
4. HTTPS GET request sent to the endpoint
5. Expected `404 Not Found` response (ingestion endpoints don't respond to HTTP GET)
6. Confirmation message: "Connection #0 to host ... left intact"

## Send sample telemetry payload for connectivity evidence

Use curl to send a sample telemetry payload:

```bash
curl -H "Content-Type: application/json" -X POST -d '{
  "data": {
    "baseData": {
      "ver": 2,
      "id": "SampleRunId",
      "name": "MicrosoftSupportSampleWebtestResultUsingCurl",
      "duration": "00.00:00:10",
      "success": true,
      "runLocation": "RegionName",
      "message": "SampleWebtestResult",
      "properties": {"SampleProperty": "SampleValue"}
    },
    "baseType": "AvailabilityData"
  },
  "ver": 1,
  "name": "Microsoft.ApplicationInsights.Metric",
  "time": "<CURRENT_TIMESTAMP>",
  "sampleRate": 100,
  "iKey": "<INSTRUMENTATION_KEY>",
  "flags": 0
}' https://dc.applicationinsights.azure.com/v2/track
```

**Important notes:**
- Replace `<INSTRUMENTATION_KEY>` with a valid instrumentation key
- Replace `<CURRENT_TIMESTAMP>` with a timestamp within the last 48 hours (ISO 8601 format)
- Ingestion endpoint rejects telemetry items with timestamps older than 48 hours
- Can also test against regional endpoints (e.g., `eastus-8.in.applicationinsights.azure.com/v2/track`)
- Successful response shows "itemsReceived" and "itemsAccepted"

## Public Documentation
- [curl - How To Use](https://curl.se/docs/manpage.html)

## Internal References
- [Validate TCP connectivity in Application Insights](/Application-Insights/How-To/Validate-Network-Connectivity/Validate-TCP-connectivity-in-Application-Insights)
- [Send Sample Telemetry Using PowerShell](/Application-Insights/How-To/Validate-Network-Connectivity/Send-Sample-Telemetry-Using-PowerShell)

---
_Created by: nzamoralopez, Nov 26th, 2024_
