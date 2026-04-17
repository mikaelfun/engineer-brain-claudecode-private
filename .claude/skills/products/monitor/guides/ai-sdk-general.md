# Monitor Application Insights SDK 通用问题

**Entries**: 20 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer suspects duplicate telemetry records in Application Insights compone... | Duplicate records can occur due to ingestion process complexity. A low rate (... | Use KQL hash-based query to calculate duplicate percentage: `let _data = mate... | 8.5 | ADO Wiki |
| 2 | Duplicate records observed in Application Insights tables (requests, pageView... | Low rate (~1%) of duplicate data is expected in Application Insights ingestio... | Use hash-based KQL query to determine exact duplicate percentage: materialize... | 8.5 | ADO Wiki |
| 3 | Application Insights SDK captures incorrect URL in RequestTelemetry when the ... | Azure Front Door (or similar L7 proxy) modifies the HTTP Host header, replaci... | Create a custom Telemetry Initializer (ITelemetryInitializer) that reads the ... | 8.5 | ADO Wiki |
| 4 | Customer needs to completely disable all Application Insights telemetry colle... | - | SDK deployment (.NET): In your application startup code (e.g., WebApiConfig.c... | 8.5 | ADO Wiki |
| 5 | TCP connection exhaustion or timeouts related to Application Insights SDK | Multiple TelemetryConfiguration objects each create their own channel, leadin... | 1) Update to Application Insights SDK v2.7.1+ (earlier versions had HTTP Clie... | 8.5 | ADO Wiki |
| 6 | Response time increase and lock contention in System.Diagnostics.Trace logs a... | autoflush="true" setting in web.config causes Flush() to be called after each... | 1) Do not use autoflush="true" in production. 2) Use Application Insights Tra... | 8.5 | ADO Wiki |
| 7 | File system access contention and race conditions between multiple Applicatio... | Multiple identical ServerTelemetryChannel instances are configured (intention... | Review usage of telemetry classes from Application Insights libraries. Find p... | 8.5 | ADO Wiki |
| 8 | Node.js apps using Axios library produce extra failed dependency telemetry re... | By design — internal processing within the Axios module triggers extra HTTP e... | Three options: (1) Ignore the extra failed dependency records; (2) Replace Ax... | 8.5 | ADO Wiki |
| 9 | Cannot correlate Application Insights cloud_RoleInstance field with the corre... | Application Insights SDKs populate cloud_RoleInstance using the host MachineN... | Use AppLens 'RD Host to RoleInstance Mapping' detector for the App Service to... | 8.5 | ADO Wiki |
| 10 | Application Insights shows React PageView telemetry with duration value of 0 ... | By design, when enableAutoRouteTracking is enabled the default tracking logic... | Set 'enableAutoRouteTracking: false' in the Application Insights SDK config a... | 8.5 | ADO Wiki |
| 11 | Intermittent HTTP 4xx or 5xx errors returned when performing actions against ... | Transient faults inherent to distributed client-server systems. Common causes... | Retry the operation. Implement transient fault handling in application code u... | 8.5 | ADO Wiki |
| 12 | Azure App Service Web App reports incorrect cloud_RoleName in Application Ins... | Application Insights SDK versions prior to 2.14 use the 'WebSite_HostName' Ap... | 1. If using .NET/.NET Core SDK, upgrade to version >= 2.14. 2. If using codel... | 8.5 | ADO Wiki |
| 13 | Application Insights E2E transaction view shows empty page with message 'This... | Circular reference between two telemetry items' parent IDs — neither can be d... | Customer must update application code to break the circular reference between... | 8.5 | ADO Wiki |
| 14 | Application Insights SDK fails to send telemetry. Self-diagnostics logs show ... | Local authentication (Local Auth) is disabled on the Application Insights res... | 1) Check self-diagnostics logs for token acquisition errors. 2) Configure the... | 8.5 | ADO Wiki |
| 15 | Application Insights endpoint returns HTTP 402 or 439 indicating monthly quot... | The number of telemetry items has exceeded the configured monthly quota limit... | Wait for the monthly quota to reset, or increase the monthly quota limit in t... | 8.5 | ADO Wiki |
| 16 | Application Insights telemetry dropped with reason code U or V after disablin... | Entra ID auth not correctly configured. Could be unsupported SDK version or i... | Check SDK minimum version per language. Use Managed Identity for production. ... | 8.5 | ADO Wiki |
| 17 | Application Insights SDK logs internal 503 ServiceUnavailable error codes in ... | SDK temporarily unable to communicate with Application Insights ingestion ser... | Informational only - no action required. SDK automatically retries per teleme... | 8.5 | ADO Wiki |
| 18 | Unable to find or add NuGet packages (including Application Insights SDK) in ... | NuGet public package source (nuget.org) not configured in Visual Studio's Pac... | Go to Tools > NuGet Package Manager > Package Manager Settings > Package Sour... | 7.5 | ADO Wiki |
| 19 | 在 Application Insights 端到端视图（E2E View）中点击某个 operation 后，显示大量（有时近百个）不同的 operat... | By Design：_MS.links（Operation Links）属性用于在批处理场景（如 Service Bus、EventHub）中将多个独立 ... | （1）禁用依赖跟踪（EnableDependencyTrackingTelemetryModule=false）——代价是失去所有出站调用遥测；（2）推荐... | 7.0 | ADO Wiki |
| 20 | Node.js App Insights SDK not sending telemetry silently | SDK misconfiguration or connectivity issues; self-diagnostics not enabled to ... | Enable setInternalLogging(true,true); set APPLICATION_INSIGHTS_ENABLE_DEBUG_L... | 6.5 | MS Learn |
