# Monitor ai-export

**Entries**: 8 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Duplicate records in Application Insights telemetry tables (e.g., AppRequests... | When using LA-backed Application Insights with Diagnostic Settings configured... | Create custom tables (e.g., AppRequests_CL) with the same schema as the origi... | 8.5 | ADO Wiki |
| 2 | Duplicate records in Application Insights telemetry tables (e.g. AppRequests)... | When using LA-backed Application Insights with Diagnostic Settings configured... | Create custom tables (e.g. AppRequests_CL) with same schema as original App* ... | 8.5 | ADO Wiki |
| 3 | Query against Application Insights or Log Analytics REST API hits limits - ma... | API has documented limits on rows returned, result set size, and concurrent q... | Use batch querying with row_number() to paginate: set batchSize (e.g., 495000... | 8.5 | ADO Wiki |
| 4 | A small random number of Application Insights telemetry records (exported via... | Bug in the ingestion pipeline between Application Insights, Geneva, and Monit... | Workaround: When searching for specific telemetry records, scan all blob cont... | 8.5 | ADO Wiki |
| 5 | Unexpected latency (up to 24 hours) in telemetry arriving at Application Insi... | By design: latency from D365 Power Platform CDS Data Export source can be up ... | No resolution to improve this latency. Identify telemetry source via cloud_Ro... | 8.5 | ADO Wiki |
| 6 | Application Insights cloud_RoleInstance does not match the actual instance na... | By design: Application Insights .NET SDK and Azure Monitor Exporter use WEBSI... | Implement a Telemetry Initializer that uses the ComputerName environment vari... | 8.5 | ADO Wiki |
| 7 | Cloud Role Instance (cloud_RoleInstance) mismatch between App Service and App... | By design - Application Insights .NET SDK has always used WEBSITE_INSTANCE_ID... | Implement a Telemetry Initializer that uses the ComputerName environment vari... | 8.5 | ADO Wiki |
| 8 | Application Insights shows exact duplicate telemetry records at high rates; a... | Diagnostic Settings enabled on the Application Insights resource configured t... | Run Telemetry Flow Diagnostic Script (Test-AppInsightsTelemetryFlow.ps1) to c... | 8.5 | ADO Wiki |
