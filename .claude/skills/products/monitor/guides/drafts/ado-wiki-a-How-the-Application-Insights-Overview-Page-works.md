---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Portal Experiences/How the Application Insights Overview Page works"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FPortal%20Experiences%2FHow%20the%20Application%20Insights%20Overview%20Page%20works"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Insights Overview Blade

## What is it?

The Application Insights Overview page is the first page users see. It shows general properties and four pre-defined charts:
- Failed Requests
- Server Response Time
- Server Requests
- Availability

## How it works

The Overview blade derives chart data from **MDM Metrics** (pre-aggregated standard metrics). The same data can be reproduced via the Metrics blade using "Application Insights standard metrics" namespace.

Switching to "Log-based Metrics" namespace shows the equivalent view from Logs data.

## Metric-to-Table Mapping

| Chart Display | Encoded Metric | Table/Column |
|---|---|---|
| Server Response Time | requests%2Fduration | requests/duration |
| Server Requests | requests%2Fcount | requests/count |
| Failed Requests | requests%2Ffailed | requests/failed |
| Availability | availabilityResults%2FavailabilityPercentage | availabilityResults/availabilityPercentage |

## How to find the actual metric name

1. Use Fiddler to capture portal traffic
2. Look for GET requests to `management.azure.com` (Overview blade uses ARM, not api.applicationinsights.io)
3. Find `metricnames=` parameter in the URL (URL-encoded)
4. Decode: e.g. `requests%2Fduration` → `requests/duration`

## Key distinction

- Overview blade calls **management.azure.com** (MDM metrics)
- Other blades (Application Map, Performance) call **api.applicationinsights.io** (Log queries)
