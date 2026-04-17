---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Missing or incorrect telemetry and performance issues/Intermittent telemetry"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FMissing%20or%20incorrect%20telemetry%20and%20performance%20issues%2FIntermittent%20telemetry"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Intermittent Telemetry

Telemetry drops intermittently but returns on its own.

## Scenario
- Data stops flowing into Application Insights tables then starts again on its own
- Random lost data (e.g., expected 200 requests but only 180 appear)

## Expectation Setting
- If missing less than 1% of telemetry, this is expected. Application Insights is a trend analysis product, NOT an auditing tool.

## Analysis

### Step 1: Run Telemetry Flow Diagnostic Script

Run from the affected machine to check for degraded-but-not-broken conditions:

```powershell
# PowerShell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/microsoft/appinsights-telemetry-flow/main/powershell/Test-AppInsightsTelemetryFlow.ps1" -OutFile "Test-AppInsightsTelemetryFlow.ps1"
.\Test-AppInsightsTelemetryFlow.ps1 -ConnectionString "InstrumentationKey=..."
```

```bash
# Bash
curl -sLO "https://raw.githubusercontent.com/microsoft/appinsights-telemetry-flow/main/bash/test-appinsights-telemetry-flow.sh"
chmod +x test-appinsights-telemetry-flow.sh
./test-appinsights-telemetry-flow.sh --connection-string "InstrumentationKey=..."
```

**Common root causes for intermittent telemetry:**
- Server-side ingestion sampling configured (< 100%)
- Daily cap approaching or reached mid-day, resets next day
- TLS inspection proxy (Zscaler, Palo Alto) intermittently dropping connections
- AMPLS DNS mismatch affecting only some endpoints

**If script shows all checks pass:** Issue is likely at SDK/application layer. Enable [SDK self-diagnostics](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/telemetry/enable-self-diagnostics) and check [SDK stats](https://learn.microsoft.com/azure/azure-monitor/app/sdk-stats).

### Step 2: Check Known Issues
- Known Issue #49764
- Known Issue #65260

### Step 3: Clarify the scenario
See: [Clarify Missing Telemetry Scenarios](/Application-Insights/How-To/Additional-Reference-Material/General-References/Clarify-Missing-Telemetry-Scenarios)

### Step 4: Check for Sampling
[Identify if Sampling is enabled](/Application-Insights/How-To/Sampling/Identify-if-Sampling-is-enabled)

### Step 5: Check for DCRs
Data Collection Rules can filter out Application Insights telemetry after ingestion. See [Check for Data Collection Rules (DCRs) and Ingestion Time Transformations](/Application-Insights/How-To/Additional-Reference-Material/Ingestion-References/Check-for-Data-Collection-Rules-(DCRs)-and-Ingestion-Time-Transformations).

### Step 6: Azure Functions specific
Check if Azure Function SDK has specific instrumentation issues.

### Step 7: Investigate randomly missing telemetry
[Investigate randomly missing telemetry](/Application-Insights/How-To/Additional-Reference-Material/Ingestion-References/Investigate-randomly-missing-telemetry)

## References
- Daily Cap: https://docs.microsoft.com/azure/azure-monitor/app/pricing#manage-your-maximum-daily-data-volume
- Usage queries: https://docs.microsoft.com/azure/azure-monitor/app/pricing#queries-to-understand-data-volume-details
- [Missing Function Logs in Application Insights](/Application-Insights/How-To/Additional-Reference-Material/Ingestion-References/Missing-Function-Logs-in-Application-Insights)
