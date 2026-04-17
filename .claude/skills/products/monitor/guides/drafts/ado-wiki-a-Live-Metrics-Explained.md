---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Portal Experiences/Live Metrics Explained"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FPortal%20Experiences%2FLive%20Metrics%20Explained"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Live Metrics (QuickPulse)

## What is it?

Live Metrics is a **separate telemetry endpoint** (distinct from the ingestion endpoint) providing near-real-time analysis. It uses the QuickPulse service.

## Architecture

- **Ingestion endpoint** (e.g. `*.in.applicationinsights.azure.com`): for log data (requests, dependencies, etc.)
- **Live Metrics endpoint** (`rt.services.visualstudio.com`): for real-time streaming telemetry

Both endpoints must be accessible for full functionality. See IP addresses documentation for the specific endpoints.

## How it works

1. **POST** to `rt.services.visualstudio.com/QuickPulseService.svc/post?` — Application sends metric data
2. **POST** to `rt.services.visualstudio.com/QuickPulseService.svc/query/v2?` — Portal user queries data for display

### Data sent by the SDK (POST body includes):
- Requests/Sec, Request Duration, Requests Failed/Sec, Requests Succeeded/Sec
- Dependency Calls/Sec, Dependency Call Duration, Dependency Calls Failed/Sec
- Exceptions/Sec
- Committed Bytes (Memory), % Processor Time
- Top CPU processes
- Instance name, machine name, SDK version

### Portal query response includes:
- ContributorAgentsCount, ContributorsCount
- All standard metric values in time-series arrays
- Document streams (filtered requests, dependencies, exceptions, events, traces)

## Key Notes

- Live Metrics is **on by default** in most SDKs — no additional configuration needed
- It requires network access to `rt.services.visualstudio.com` (global) or regional equivalents
- The `x-ms-qps-subscribed: true` response header confirms the endpoint is actively collecting
- PerformanceCollectionSupported flag indicates if perf counters are available
