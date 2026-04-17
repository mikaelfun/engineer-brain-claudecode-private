---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Missing or incorrect telemetry and performance issues/Missing all telemetry"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FMissing%20or%20incorrect%20telemetry%20and%20performance%20issues%2FMissing%20all%20telemetry"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Missing All Telemetry

Application Insights telemetry is completely absent after instrumentation has been enabled.

## Scenario
- Missing data typically includes both logs and metrics.
- Telemetry may have never been ingested or may have stopped flowing.
- Covers server-side (.NET, Java, Python, Node.js) and client-side (JavaScript SDK).
- Applies to App Services, VMs, AKS, on-premises, etc.

## Scoping
- Clarify the missing telemetry scenario: [Clarify Missing Telemetry Scenarios](/Application-Insights/How-To/Additional-Reference-Material/General-References/Clarify-Missing-Telemetry-Scenarios)
- Include queries showing expected vs observed results.
- Identify if AMPLS (Azure Monitor Private Link Scope) is involved.

## Analysis

### Step 1: Run Telemetry Flow Diagnostic Script

```powershell
# PowerShell (App Service Kudu, VM, Cloud Shell)
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/microsoft/appinsights-telemetry-flow/main/powershell/Test-AppInsightsTelemetryFlow.ps1" -OutFile "Test-AppInsightsTelemetryFlow.ps1"
.\Test-AppInsightsTelemetryFlow.ps1 -ConnectionString "InstrumentationKey=..."
```

```bash
# Bash (Linux App Service, AKS, Container Apps)
curl -sLO "https://raw.githubusercontent.com/microsoft/appinsights-telemetry-flow/main/bash/test-appinsights-telemetry-flow.sh"
chmod +x test-appinsights-telemetry-flow.sh
./test-appinsights-telemetry-flow.sh --connection-string "InstrumentationKey=..."
```

**Common root causes detected:**
- DNS resolution failures
- Firewall or NSG rules blocking outbound HTTPS traffic
- TLS handshake failures
- Daily ingestion cap reached
- Deleted Log Analytics workspace
- AMPLS or Private Link ingestion restrictions
- Local authentication disabled
- Azure subscription suspension

### Step 2: Review Known Issues

### Step 3: Confirm scenario
[Clarify Missing Telemetry Scenarios](/Application-Insights/How-To/Additional-Reference-Material/General-References/Clarify-Missing-Telemetry-Scenarios)

### Step 4: Ingestion layer investigation
Start at the ingestion layer to determine if telemetry reaches the ingestion endpoint.

Pipeline: Application -> SDK -> Network -> Ingestion Endpoint -> Processing -> Log Analytics

### Step 5: AMPLS check
For AMPLS configurations, ensure hosting resource has private network connectivity. Resources without VNet integration resolve to public IPs and fail. App Service free tier does not support VNet integration.

### Step 6: Ingestion service investigation
[Ingestion service investigation](/Application-Insights/How-To/Additional-Reference-Material/Ingestion-References/Ingestion-service-investigation) - can be performed independently of customer interaction.

### Step 7: Multi-app scenario
If multiple apps send to same AI resource, use ingestion query to identify which are missing:

```kql
union *
| where timestamp > ago(90d)
| summarize count() by bin(timestamp,1d), cloud_RoleName, cloud_RoleInstance, itemType, sdkVersion
| order by timestamp asc
```

### Step 8: Determine hosting environment
- [Determine Where an application is Running](/Application-Insights/How-To/Additional-Reference-Material/General-References/Determine-Where-an-application-instrumented-with-Application-Insights-is-Running)
- [Determine instrumentation method](/Application-Insights/How-To/Additional-Reference-Material/General-References/Determine-instrumentation-method)

### Step 9: Network validation
[Test Basic Connectivity to Application Insight Endpoints](/Application-Insights/How-To/Validate-Network-Connectivity/Test-Basic-Connectivity-to-Application-Insight-Endpoints)

### Step 10: SDK/Agent investigation
If ingestion and network are healthy, investigate SDK/agent behavior within the application process.

## References
- Profiler Overview: https://docs.microsoft.com/azure/azure-monitor/profiler/profiler-overview
- [Support Boundaries](/Application-Insights/Support-Boundaries)
