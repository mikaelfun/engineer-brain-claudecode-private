---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Diagnostic settings/No data at export destination"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FDiagnostic%20settings%2FNo%20data%20at%20export%20destination"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# No Data at Export Destination

**Scenario**: Diagnostic Settings export is enabled on App Insights resource, but stopped receiving data in Azure Storage, Event Hub or Log Analytics

## Troubleshooting Steps

1. **Check Known Issues** in the ADO Wiki KI query table
2. **Cost awareness**: If migrating from Continuous Export to Diagnostic Settings with Storage destination, cost will be higher (see docs)
3. **Validate Diagnostic Settings configuration**:
   - Use ASC to get diagnostic settings for the Azure resource
   - Confirm diagnostics are configured and pointed to expected destination
   - From Portal: App Insights > Diagnostic Settings > review destination
4. **Check if data has been ingested** since DS enablement:
   - Use ASC "Query Customer Data" tab to verify data arrival
   - If recently enabled, allow time for pipeline to start
5. **Check resource provider data flow**:
   - Use Kusto queries to verify if resource provider sent data to OnBehalfOf service
6. **Storage export path behavior change**:
   - Telemetry is now written based on **ingestion time** (not creation time/_timestamp_)
   - Delayed log entries appear in the folder corresponding to when they were processed
   - Missing records may be in folders within 48 hours of creation time
   - Newly processed logs always appear in the newest folder

## Key References

- [Diagnostic settings in Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings)
- [Destination limitations](https://learn.microsoft.com/azure/azure-monitor/essentials/diagnostic-settings?WT.mc_id=Portal-Microsoft_Azure_Monitoring#destination-limitations)
- [Diagnostic settings based export](https://docs.microsoft.com/azure/azure-monitor/app/export-telemetry#diagnostic-settings-based-export)
