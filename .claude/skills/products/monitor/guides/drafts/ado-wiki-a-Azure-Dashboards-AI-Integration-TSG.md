---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Integration with Application Insights/Azure dashboards"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FIntegration%20with%20Application%20Insights%2FAzure%20dashboards"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Dashboards - Application Insights Integration TSG

## Scenario
Problems displaying Application Insights telemetry in a custom Azure dashboard.
- NOT about the Application Insights Overview pane (see "Application Insights Portal Experiences")
- About custom-built dashboards displaying AI data

## Scoping Questions
- URL and name of dashboard
- Was this working before? If so, when?
- Specific tile(s) involved (different tiles could be different issues)
- Is this a custom or canned AI dashboard?
- What behavior is seen vs expected?
- Screenshot with explanation

## Analysis Decision Tree

### Data is incorrect in a tile(s)
1. Validate the experience outside of the dashboard (Metric Explorer or Logs blade)
2. If same issue outside dashboard -> not dashboard-related, change SAP:
   - Missing or Incorrect data after enabling Application Insights in Azure Portal
   - Missing or Incorrect data after Manual Instrumentation using SDK or Agent
3. Determine data source type (log-based vs metric-based):
   - "View in Logs" icon in tile = logs-based
   - Clicking tile takes to Metric Explorer = metric-based
   - For ambiguous cases, check HAR trace during dashboard refresh

### Entire Dashboard not working
1. Start with: Troubleshoot general portal blade issues

## Key Concepts
- Data source type matters: log-based vs metric-based queries behave differently
- If data is actually from a non-AI source, issue belongs to the owning team

## Documentation
- [Azure Data Explorer dashboard](https://learn.microsoft.com/en-us/azure/data-explorer/azure-data-explorer-dashboards)
- [Create a dashboard in Azure portal](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-dashboards)
