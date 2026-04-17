---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/References/HTTP Response Code Quick Reference Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/References/HTTP%20Response%20Code%20Quick%20Reference%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# HTTP Response Code Quick Reference Guide

## Overview
Quick reference guide for all applicable HTTP Status Codes returned by Application Insights ingestion endpoint and common result codes visible in Application Insights telemetry.

## Common Application Insights Ingestion Status Codes

| Status Code | Message | Description |
|---|---|---|
| 200 | OK | Successful HTTP Requests |
| 206 | Partial Accept | Telemetries partially accepted. For SDK < 1.1.0, indicates throttling |
| 307 | Redirect | Connection string mismatch with iKey resource. Returned to NodeJS SDK |
| 308 | Redirect | Connection string mismatch with iKey resource. Returned to other SDKs |
| 400 | Invalid | Invalid telemetry (invalid data, iKey) |
| 402 | Monthly Quota Exceeded (new SDK) | Monthly quota limit exceeded. New SDK uses this instead of 439 |
| 404 | Region Mismatch | Connection string region does not match iKey resource region. Telemetry dropped |
| 408 | Service Timeout | Server timed out waiting for the request |
| 429 | Too many requests | Rate limited - too many telemetry items in short interval |
| 439 | Monthly Quota Exceeded (old SDK) | Same as 402, deprecated in new SDK |
| 500 | Processing Error | Unexpected condition (EH timeout, internal error) |
| 503 | Service Unavailable | Server overloaded or down for maintenance |

## Common Application Result Codes

| Result Code | Description |
|---|---|
| 0 | Undefined request - no response obtained or request terminated prematurely |
| Canceled | Request initiated but not finalized - client cancellation or timeout |
| Faulted | No valid status code from outbound service call, infrastructure issue, or client-side call failure |

## Key Troubleshooting Notes
- Result Code 0/Canceled/Faulted are **application-level outcomes**, NOT introduced by App Insights
- HTTP 402/439 = quota, HTTP 429 = rate limiting (different mechanisms)
- HTTP 307/308/404 all indicate connection string misconfiguration
- Always use full connection string from Azure portal, not just instrumentation key
