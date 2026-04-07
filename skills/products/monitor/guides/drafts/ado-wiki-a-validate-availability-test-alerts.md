---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/Availability Tests References/Validate Availability Test alerts"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAdditional%20Reference%20Material%2FAvailability%20Tests%20References%2FValidate%20Availability%20Test%20alerts"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario

Availability Test exists and expectations are an alert associated with it should have occurred and did not fire.

# Steps

1. **Check if the Metric Alert fired**: Use metricalerts Fired Alerts tab for Application Insights Availability Test in ASC.

2. **Validate Metric alert configuration**: Use metricalerts Properties tab for Application Insights Availability Test in ASC.

3. **Check Availability Test executions**: Use webtest's Executions tab in ASC.

4. **Validate data was sent to ingestion endpoint in a timely fashion**: Check ingestion timing - after data arrives at Azure, metric data is extracted and handed off to MDM while log data goes through traditional ingestion process.

   Focused KQL query for ingestion timing:
   ```kql
   let start = datetime(2023-03-14 7:00:00 PM);
   let end = datetime(2023-03-15 03:00:00 AM);
   AppAvailabilityResults
   | where TimeGenerated > start and TimeGenerated < end
   | where Name == "<name of availability test here>"
   | extend TimeEventOccurred = TimeGenerated
   | extend TimeRequiredtoGettoAzure = _TimeReceived - TimeGenerated
   | extend TimeRequiredtoIngest = ingestion_time() - _TimeReceived
   | extend EndtoEndTime = ingestion_time() - TimeGenerated
   | project TimeGenerated, Location, TimeEventOccurred, _TimeReceived, TimeRequiredtoGettoAzure, ingestion_time(), TimeRequiredtoIngest, EndtoEndTime
   | order by TimeGenerated asc
   ```

5. **Check MDM data**: Use Azure Monitor Metrics in ASC with:
   - Metric namespace: ApplicationInsights
   - Metric name: availabilityResults/duration
