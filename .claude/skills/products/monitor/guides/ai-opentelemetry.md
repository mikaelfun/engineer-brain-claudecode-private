# Monitor Application Insights OpenTelemetry 集成

**Entries**: 6 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After migrating from classic Application Insights .NET SDK to Azure Monitor O... | Classic SDK uses TelemetryInitializers (coupled to TelemetryClient) for trace... | Implement a custom LogRecord SpanProcessor to add activity.TraceStateString a... | 8.5 | ADO Wiki |
| 2 | Customer reports App Insights issues with Azure Container Apps managed OpenTe... | ACA managed OpenTelemetry agent (Preview) was developed by the ACA team using... | Route to ACA team (App Services OSS): SAP Azure/Container Apps/Monitoring res... | 8.5 | ADO Wiki |
| 3 | cloud_RoleName and cloud_RoleInstance fields are empty or missing in Applicat... | Application Insights SDKs auto-populate cloud_RoleName only for known Azure r... | For OpenTelemetry SDKs, set OTEL_RESOURCE_ATTRIBUTES env var: service.name=cu... | 8.5 | ADO Wiki |
| 4 | 同时使用 Application Insights .NET SDK 和 OpenTelemetry Exporter 并行插桩（Side by Side... | Application Insights .NET SDK 的 Adaptive Sampler 与 OpenTelemetry Exporter 并行使... | 临时 Workaround：改用 Fixed Rate Sampling 替代 Adaptive Sampling，直到 OpenTelemetry GA... | 7.0 | ADO Wiki |
| 5 | OpenTelemetry .NET Azure Monitor Exporter: operation name missing from depend... | Known limitations in Azure Monitor OpenTelemetry Exporters for .NET | Known issue, no fix available. Missing operation name causes failures and aff... | 6.5 | MS Learn |
| 6 | OpenTelemetry Node.js Azure Monitor Exporter: operation name missing, device ... | Known limitations in Azure Monitor OpenTelemetry Exporters for Node.js | Known issues. Database server name omission causes incorrect aggregation of t... | 6.5 | MS Learn |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/ai-opentelemetry.md)
