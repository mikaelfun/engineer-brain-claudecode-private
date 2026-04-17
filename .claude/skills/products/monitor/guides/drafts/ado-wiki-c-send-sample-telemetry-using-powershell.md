---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Validate Network Connectivity/Send Sample Telemetry Using PowerShell"
sourceUrl: "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Validate%20Network%20Connectivity/Send%20Sample%20Telemetry%20Using%20PowerShell"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Send Sample Telemetry Using PowerShell

## Overview

Use PowerShell to send a test telemetry record directly to Application Insights, bypassing the SDK. This eliminates large portions of the processing pipeline during missing data troubleshooting.

**Pipeline:** SDK/Agents → Networking → Ingestion Endpoint → Ingestion Pipeline → Kusto Backend → Query API → Portal

If the sample record **shows up** in Application Insights Logs:
- DNS resolution is working
- Network delivered the telemetry without blocking
- Ingestion endpoint accepted and processed the record
- Kusto saved the record
- Portal Query API is working
→ Investigate SDK/Agent configuration

If the sample record **does not show up**: investigate networking/ingestion pipeline.

## Platforms

- **On-Premises / Azure VM**: Run from PowerShell directly on the machine
- **App Service (Kudu)**: Use PowerShell Debug Console in Kudu
  - Pre-requisite: run `$ProgressPreference = "SilentlyContinue"` first
  - Use `-UseBasicParsing` (no `-Verbose` or `-Debug`)
  - Command: `Invoke-WebRequest -Uri $url -Method POST -Body $availabilityData -UseBasicParsing`

## Script: Send Availability Test Telemetry (Recommended)

> **Why Availability Test?** Availability Test records are **never sampled** by the ingestion pipeline. Use this type first.

```powershell
# Info: Provide either the Connection String or Ikey for your Application Insights Resource
$ConnectionString = "" 
$InstrumentationKey = ""

function ParseConnectionString {
param ([string]$ConnectionString)
  $Map = @{}
  foreach ($Part in $ConnectionString.Split(";")) {
     $KeyValue = $Part.Split("=")
     $Map.Add($KeyValue[0], $KeyValue[1])
  }
  return $Map
}

If (($InstrumentationKey) -and ("" -eq $ConnectionString)) {
  $ConnectionString = "InstrumentationKey=$InstrumentationKey;IngestionEndpoint=https://dc.services.visualstudio.com/"
}

$map = ParseConnectionString($ConnectionString)
$url = $map["IngestionEndpoint"] + "v2/track"
$ikey = $map["InstrumentationKey"]

$time = (Get-Date).ToUniversalTime().ToString("o")

$availabilityData = @"
{
  "data": {
    "baseData": {
      "ver": 2,
      "id": "SampleRunId",
      "name": "Microsoft Support Sample Webtest Result",
      "duration": "00.00:00:10",
      "success": true,
      "runLocation": "Region Name",
      "message": "Sample Webtest Result",
      "properties": { "Sample Property": "Sample Value" }
    },
    "baseType": "AvailabilityData"
  },
  "ver": 1,
  "name": "Microsoft.ApplicationInsights.Metric",
  "time": "$time",
  "sampleRate": 100,
  "iKey": "$iKey",
  "flags": 0
}
"@ 

# Uncomment to test specific TLS versions:
# [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::TLS12

$ProgressPreference = "SilentlyContinue"
Invoke-WebRequest -Uri $url -Method POST -Body $availabilityData -UseBasicParsing
```

**Expected response:** HTTP 200, JSON with `itemsReceived` == `itemsAccepted`.

## Script: Send Request Telemetry

> **Note:** Request telemetry is susceptible to server-side ingestion sampling. Turn off ingestion sampling before using this type.

```powershell
$ConnectionString = ""
$InstrumentationKey = ""

function ParseConnectionString {
param ([string]$ConnectionString)
  $Map = @{}
  foreach ($Part in $ConnectionString.Split(";")) {
     $KeyValue = $Part.Split("=")
     $Map.Add($KeyValue[0], $KeyValue[1])
  }
  return $Map
}

If (($InstrumentationKey) -and ("" -eq $ConnectionString)) {
  $ConnectionString = "InstrumentationKey=$InstrumentationKey;IngestionEndpoint=https://dc.services.visualstudio.com/"
}

$map = ParseConnectionString($ConnectionString)
$url = $map["IngestionEndpoint"] + "v2/track"
$ikey = $map["InstrumentationKey"]
$time = (Get-Date).ToUniversalTime().ToString("o")

$requestData = @"
{
   "data": {
      "baseType": "RequestData",
      "baseData": {
        "ver": 2,
        "id": "22093920382029384",
        "name": "GET /msftsupport/requestdata/",
        "starttime": "$time",
        "duration": "00:00:01.0000000",
        "success": true,
        "responseCode": "200",
        "url": "https://www.microsoft.com/msftsupport/requestdata/"
      }
   },
   "ver": 1,
   "name": "Microsoft.ApplicationInsights.Request",
   "time": "$time",
   "sampleRate": 100,
   "iKey": "$iKey",
   "flags": 0
}
"@

$ProgressPreference = "SilentlyContinue"
Invoke-WebRequest -Uri $url -Method POST -Body $requestData -UseBasicParsing
```

## Related
- [Send Sample Telemetry Using Curl](guides/drafts/ado-wiki-c-send-sample-telemetry-using-curl.md)
- [Test Basic Connectivity to AI Endpoints](guides/drafts/ado-wiki-c-test-basic-connectivity-to-ai-endpoints.md)
