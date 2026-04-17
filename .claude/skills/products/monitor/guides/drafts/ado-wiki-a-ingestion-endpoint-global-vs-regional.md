---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use Ingestion tab/Read Aggregate by Ingestion Endpoint"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20Ingestion%20tab%2FRead%20Aggregate%20by%20Ingestion%20Endpoint"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Ingestion tab - Aggregate by Ingestion Endpoint (Global vs Regional)

This aggregation shows what ingestion endpoint is being used by one or more apps sending telemetry to this Application Insights resource.

## Key Points

- Applications configured with **instrumentation keys only** will default to using the **global endpoint** (`dc.services.visualstudio.com`).
- Applications configured with **connection string** will default to using the **regional endpoint** for its Application Insights resource.
  - Examples of regional endpoints: `westus-0.in.applicationinsights.azure.com`, `centralus-0.in.applicationinsights.azure.com`
- Understanding the endpoint type is critical for **daily cap investigations** — global endpoint does NOT properly enforce daily cap.
- Multiple apps can report telemetry to a single Application Insights resource; some via IKey (global) and others via connection string (regional). No easy way to determine which without checking app configuration/code.

## Scenarios

### Scenario 1: Mixed endpoint traffic — identifying the source of global endpoint traffic
1. Use "Aggregate by Ingestion Endpoint" to isolate global vs regional endpoint traffic
2. Click legend items to remove regional endpoint traffic — leaves only global endpoint traffic visible
3. Switch to "Aggregate by Parsed SDK Names" — uncheck SDK names one by one until the pattern matches the global endpoint traffic
4. This identifies which SDK/app is sending to the global endpoint

### Scenario 2: gsm SDK prefix → Availability test telemetry to global endpoint (expected behavior)
- `gsm:` prefix in Parsed SDK Names = Availability test service results
- Availability service sends test results to the global endpoint — this is by design
- Confirmed by: Availability test data parallel to global endpoint traffic; check Availability pane for configured tests
- **No action needed** — this is expected

### Scenario 3: Only global endpoint — identifying single vs multiple apps
- Use KQL query to check cloud_RoleName and sdkVersion to determine if single or multiple apps are sending:
```kusto
union *  
| summarize count() by bin(timestamp, 1d), cloud_RoleName, cloud_RoleInstance, sdkVersion  
| order by timestamp asc, cloud_RoleName, cloud_RoleInstance, sdkVersion
```

### Daily Cap + Global Endpoint scenario
- If daily cap appears not to be honored:
  - Check "Aggregate by Ingestion Endpoint" — look for global endpoint (`dc.services.visualstudio.com`) traffic
  - Check "Aggregate by Dropped By Reason" — if drops coincide with regional endpoint traffic but global endpoint continues → IKey-based app bypassing daily cap
  - **Fix**: Migrate IKey-based app to connection string to use regional endpoint (which respects daily cap)
  - See: [Daily Cap Explained](/Application-Insights/Learning-Resources/Training/Course-Materials/Ingestion/Daily-Cap-Explained)
