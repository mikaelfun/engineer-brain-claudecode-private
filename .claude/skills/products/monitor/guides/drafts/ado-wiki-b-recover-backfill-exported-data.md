---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Diagnostic settings/Recover or backfill exported data"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FDiagnostic%20settings%2FRecover%20or%20backfill%20exported%20data"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Recover or Backfill Missing Exported Data

**Scenario**: Requests to backfill gaps in exported data, or recover any missing data

## Key Facts

- Diagnostic Settings does NOT support backfilling data ingested before enablement
- Only data arriving AFTER the Diagnostic Setting is enabled will be exported
- Cost: Diagnostic Settings to Storage is higher than Continuous Export (see docs)
- Known issue: Duplicate data when using LA workspace as destination (#28272)

## Recovery Options

### Option 1: Log Analytics API (Self-service)
- Use https://docs.microsoft.com/azure/azure-monitor/logs/api/overview to access data
- **Limitations**: Row count and result size limits; results truncated at whichever limit is hit first
- Requires separate API (e.g., Storage API) to write data to desired destination in required format

### Option 2: Logic Apps Export
- Use Logic Apps approach: [Export data from Log Analytics workspace to Storage Account](https://learn.microsoft.com/azure/azure-monitor/logs/logs-export-logic-app)
- Detailed steps available in internal SharePoint document on historic data export

### Option 3: SRE Team One-Time Export (Special Approval Required)
- **WARNING**: Do NOT mention this to customer without TA/SME discussion and Product Team (SRE) agreement
- For large/high-profile customers where backfilling is critical
- SRE team can perform one-time export under special circumstances
- All criteria must be understood and deemed achievable by SRE team
- This is NOT a standard offering

## Decision Framework

Consider: How many days of data is missing vs. cost of investment to build programmatic solution to move the data?

## Key References

- [Diagnostic settings in Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings)
- [Continuous export - diagnostic settings based export](https://docs.microsoft.com/azure/azure-monitor/app/export-telemetry#diagnostic-settings-based-export)
