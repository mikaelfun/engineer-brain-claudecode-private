# Windows LAPS with Azure AD — Kusto Diagnostic Queries

> Source: OneNote — Mooncake POD Support Notebook/Intune/Windows TSG/Windows LAPS with Azure AD

## Prerequisites

Obtain from Event ID 10030 in Windows Event Log (LAPS/Operational):
- `<timestamp>` — event time
- `<correlationId>` — captured as `client-request-id` in the URL

## Query 1: ADRS Trace Events

**Cluster**: idsharedwus  
**Database**: ADRS  
**Table**: AdrsTraceEvent

```kql
let t = datetime("<timestamp>");
let delta = 1min;
let ids = dynamic(["<correlationId>"]);
AdrsTraceEvent
| where env_time between ((t - delta) .. (t + delta))
| where correlationId in (ids)
| project env_time, message
```

## Query 2: FindTraceLogs (Password Update Issues)

**Cluster**: idsharedwus.kusto.windows.net  
**Database**: ADRS  
**Table**: FindTraceLogs

```kql
let t = datetime("<timestamp>");
let delta = 10m;
let ids = dynamic(["<correlationId>"]);
cluster("idsharedwus.kusto.windows.net").database('ADRS').FindTraceLogs(t, delta, ids)
```

## When to Use

- Troubleshoot LAPS password update failures from service-side
- Investigate tenant discovery problems during LAPS operations
- Debug Azure AD Device Registration Service errors during LAPS password rotation

## 21v (Mooncake) Note

Cluster availability for Mooncake pending confirmation. If `idsharedwus` is not accessible, use Jarvis as fallback.
