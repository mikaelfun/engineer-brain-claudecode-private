---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Missing or incorrect telemetry and performance issues/Delayed telemetry"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FMissing%20or%20incorrect%20telemetry%20and%20performance%20issues%2FDelayed%20telemetry"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Delayed Telemetry

Issues related to log or metric telemetry arriving late or slowly.

## Scoping

- How does the user know the data is slow or late?
- How does the user know this is not normal?

## Analysis

Check Known Issues for potential explanation.

Identify ingestion issues: [Identify Ingestion Issues](/Application-Insights/How-To/Additional-Reference-Material/Ingestion-References/Identify-Ingestion-issues)

Determine if the delay is **client-side** or **ingestion-side**:
- Client-side delay: gap between `timestamp`/`TimeGenerated` and `_TimeReceived`
- Ingestion-side delay: gap between `_TimeReceived` and `$IngestionTime`

### Client-Side Driven Delay

1. Something is preventing the SDK/agents from sending in a timely fashion.
2. Potential causes: firewalls, proxies, incorrect/missing endpoint in Connection String.
3. [Send Sample Telemetry Using PowerShell](/Application-Insights/How-To/Validate-Network-Connectivity/Send-Sample-Telemetry-Using-PowerShell) to isolate the problem from the application.
4. Check DNS scenarios: [Test Basic Connectivity to Application Insight Endpoints](/Application-Insights/How-To/Validate-Network-Connectivity/Test-Basic-Connectivity-to-Application-Insight-Endpoints)
5. Collect diagnostic logs: [Collect Application Insights Diagnostic Logs](/Application-Insights/How-To/Diagnostics-and-Tools/Application-Insights-Diagnostic-Logs)

### Ingestion-Side Driven Delay

1. Is this occurring with one Application Insights Component or several?
2. What region(s) are involved?
3. Is there an outage? See: [Check for Service Outages](/Azure-Monitor/Check-for-Service-Outages)
4. If outage exists, check Swarming Channel / TA or SME for existing SIE. Add SIE number to case.
5. If no outage, engage PG via ICM.
6. **Known Issue #61748**: If customer changed retention settings on the table recently, IngestionTime field gets reset to time of retention change, causing falsely reported ingestion delays.

## Known Issues

- Known Issue #61748: Retention settings change resets IngestionTime
