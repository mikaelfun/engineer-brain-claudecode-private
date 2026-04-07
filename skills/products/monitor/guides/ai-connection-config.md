# Monitor Application Insights 连接字符串与配置

**Entries**: 15 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer receives Azure Service Health notification about deprecation of inst... | Deprecation of instrumentation key-based global ingestion endpoints in Applic... | 1) To identify affected AI components per subscription: Use SAW device with J... | 8.5 | ADO Wiki |
| 2 | Unable to send telemetry or query telemetry data for an Application Insights ... | Client is resolving an incorrect IP address for the Application Insights regi... | 1) Get the IP the client is currently resolving for the endpoint (see: Valida... | 8.5 | ADO Wiki |
| 3 | Customer wants to move Application Insights resource to a different Azure reg... | Cross-region move for Application Insights components is not supported by des... | Create a new Application Insights resource in the target region and swap inst... | 8.5 | ADO Wiki |
| 4 | Azure Function with auto-attach to App Insights randomly stops ingesting tele... | TelemetryConfiguration has mismatched Instrumentation Key vs Connection Strin... | Delete APPINSIGHTS_INSTRUMENTATIONKEY setting and only use APPLICATIONINSIGHT... | 8.5 | ADO Wiki |
| 5 | No telemetry data in Application Insights. Self-diagnostics logs indicate the... | The instrumentation key or connection string configured in the SDK is invalid... | 1) Check self-diagnostics logs for invalid ikey/connection string errors. 2) ... | 8.5 | ADO Wiki |
| 6 | Application Insights daily cap is significantly exceeded — data ingestion is ... | Customer is using global ingestion endpoint (ikey-only configuration via dc.s... | 1) Migrate from instrumentation key (ikey-only) to connection string with reg... | 8.5 | ADO Wiki |
| 7 | Application Insights ingestion endpoint rejects telemetry payload sent via cu... | The instrumentation key (iKey) in the telemetry payload is invalid, placehold... | Replace the iKey with the correct instrumentation key from the Application In... | 8.5 | ADO Wiki |
| 8 | Application Insights ingestion endpoint rejects buffered telemetry items afte... | Application Insights ingestion endpoint rejects telemetry items with timestam... | Inform customer that ingestion endpoint has a 48-hour timestamp acceptance wi... | 8.5 | ADO Wiki |
| 9 | Application Insights endpoint returns HTTP 307 or 308 redirect; telemetry may... | Connection string used differs from the one defined on the instrumentation ke... | Update the connection string to match the iKey resource actual endpoint. If t... | 8.5 | ADO Wiki |
| 10 | Application Insights endpoint returns HTTP 404; telemetry is silently dropped... | Connection string specifies a different region than the instrumentation key r... | Update the connection string to use the correct region matching the Applicati... | 8.5 | ADO Wiki |
| 11 | Application Insights SDK/ingestion endpoint returns HTTP 404 - telemetry is d... | Connection string specifies a region that does not match the iKey resource ac... | Update the Application Insights connection string to match the resource actua... | 8.5 | ADO Wiki |
| 12 | Application Insights SDK receives HTTP 307/308 redirect - telemetry may be dr... | Connection string does not match the iKey resource stamp endpoint. The ingest... | Update the connection string to use the correct IngestionEndpoint matching th... | 8.5 | ADO Wiki |
| 13 | Application Insights Daily Cap exceeded by large amount despite being configu... | Not using a regional endpoint (connection string). When only instrumentation ... | Use connection strings with regional endpoints. Check global endpoint usage i... | 8.5 | ADO Wiki |
| 14 | Custom telemetry (trackTrace, trackEvent, trackDependency) not appearing in A... | SDK onboarding incomplete or basic auto-collected telemetry not working. Cust... | 1) Validate basic auto-collected telemetry (requests, dependencies) is flowin... | 7.5 | ADO Wiki |
| 15 | Application Insights daily cap setting does not limit actual ingested data vo... | Since March 2023, Application Insights and Log Analytics have separate daily ... | Set daily cap independently for both Application Insights and Log Analytics; ... | 6.5 | MS Learn |
