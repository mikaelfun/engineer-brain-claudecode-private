---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/HTTP 5XXs (Server Errors)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAdditional%20Reference%20Material%2FHTTP%205XXs%20(Server%20Errors)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

HTTP 5XX errors are server-side error responses indicating that the server encountered an unexpected condition. Generally, an HTTP 5XX implies a server error NOT an application error. Since it is NOT an application error, Application Insights would not have seen it. This is not to say Application Insights cannot capture HTTP 500s, but these errors tend to happen outside the context of an application.

# IIS Architecture, .NET and Application Insights

Request processing pipeline stages:
1. **HTTP.sys** — kernel-mode driver, initial processing
2. **IIS (W3SVC)** — routes to application pool
3. **Worker Process (w3wp.exe)** — handles request; AspNetCoreModuleV2 (ANCM) comes into play
4. **ANCM** — In-Process: invokes .NET Core runtime directly; Out-of-Process: forwards to Kestrel
5. **ASP.NET Core Middleware Pipeline** — where Application Insights SDK operates
6. **Controller/Action Execution** — application code
7. **Response** — back through the pipeline

**Key insight:** The Application Insights SDK can only listen for events once the request reaches the .NET runtime (step 5). If any prior component fails (HTTP.sys, W3SVC, ANCM), the SDK never sees the request.

# Investigation — Linux App Services

- Use AppLens HTTP Server Errors detector
- Query `WorkerApacheAccessLogEventTable`:
  ```kql
  let startTime = todatetime('2024-07-16T16:00:00Z');
  let endTime = todatetime('2024-07-16T21:00:00Z');
  WorkerApacheAccessLogEventTable
  | where EventTime >= startTime and EventTime <= endTime
  | where Cs_host in~ ("Replace with website's hostname")
  | project EventTime, Role, S_ip, Cs_host, Cs_uri_stem, Status, UpstreamStatus, C_ip
  | where Status > 499
  | summarize count() by bin(EventTime, 1h), Status, UpstreamStatus
  | order by EventTime desc
  ```
- **Status** = proxy server response; **UpstreamStatus** = app container response
- If UpstreamStatus matches Status → app generated the error
- If UpstreamStatus is empty → app never returned anything

# Investigation — Windows App Services

- Requires FREB (Failed Request Event Buffering) logs
- Query `AntaresWebWorkerFREBLogs`:
  ```kql
  let startTime = todatetime('2024-07-16 00:00:00');
  let endTime = todatetime('2024-07-17 00:00:00');
  AntaresWebWorkerFREBLogs
  | where TIMESTAMP >= startTime and TIMESTAMP <= endTime
  | where StatusCode == 500
  | where Details contains "Module: ManagedPipelineHandler, Notification: EXECUTE_REQUEST_HANDLER"
  | project TIMESTAMP, EventMessage, SiteName, Url, StatusCode, Time_taken, Details
  | take 100
  ```
- **ManagedPipelineHandler** = application code executed → App Insights should have captured it
- **AspNetCoreModuleV2** or other IIS module → error before .NET runtime → App Insights cannot capture

# Kusto Table Mapping (App Services)

| Windows | Linux Equivalent |
|---------|-----------------|
| RuntimeWorkerEvents | WorkerLWASEventTable |
| IISLogWorkerTable | WorkerApacheAccessLogEventTable |
| SystemStats | N/A |
| SystemEvents | WorkerSyslogEventTable |
| DefaultLogEventTable | WorkerDefaultLogEventTable, WorkerAzureAgentEventTable |
