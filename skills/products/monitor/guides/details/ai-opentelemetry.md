# Monitor Application Insights OpenTelemetry 集成 - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Drafts fused**: 1 | **Kusto queries**: 0
**Draft sources**: ado-wiki-b-classic-sdk-to-otel-migration.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: After migrating from classic Application Insights .NET SDK to Azure Monitor OpenTelemetry Distro, custom tracestate header values are lost in distributed traces; downstream services expecting legac...

**Solution**: Implement a custom LogRecord SpanProcessor to add activity.TraceStateString as a tag (data.Attributes). Alternatively use OpenTelemetry Propagators to customize context propagation. Enrich methods from instrumentation libraries are also supported. Ref: https://learn.microsoft.com/en-us/azure/azur...

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Customer reports App Insights issues with Azure Container Apps managed OpenTelemetry agent - missing telemetry or agent not working

**Solution**: Route to ACA team (App Services OSS): SAP Azure/Container Apps/Monitoring resources. For supported App Insights integration, recommend manual SDK instrumentation per https://learn.microsoft.com/azure/container-apps/observability.

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: cloud_RoleName and cloud_RoleInstance fields are empty or missing in Application Insights telemetry for applications running outside standard Azure PaaS services

**Solution**: For OpenTelemetry SDKs, set OTEL_RESOURCE_ATTRIBUTES env var: service.name=custom-role-name,service.instance.id=custom-role-instance. For classic SDKs, implement a custom TelemetryInitializer to set cloud role name.

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: 同时使用 Application Insights .NET SDK 和 OpenTelemetry Exporter 并行插桩（Side by Side）时，在负载情况下 Adaptive Sampling 生成的遥测记录数超出预期

**Solution**: 临时 Workaround：改用 Fixed Rate Sampling 替代 Adaptive Sampling，直到 OpenTelemetry GA 版本修复此问题

`[Source: ADO Wiki, Score: 7.0]`

### Step 5: OpenTelemetry .NET Azure Monitor Exporter: operation name missing from dependency telemetry, device model missing from request/dependency telemetry

**Solution**: Known issue, no fix available. Missing operation name causes failures and affects Performance tab. Missing device model affects device cohort analysis.

`[Source: MS Learn, Score: 6.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After migrating from classic Application Insights .NET SDK to Azure Monitor O... | Classic SDK uses TelemetryInitializers (coupled to TelemetryClient) for trace... | Implement a custom LogRecord SpanProcessor to add activity.TraceStateString a... | 8.5 | ADO Wiki |
| 2 | Customer reports App Insights issues with Azure Container Apps managed OpenTe... | ACA managed OpenTelemetry agent (Preview) was developed by the ACA team using... | Route to ACA team (App Services OSS): SAP Azure/Container Apps/Monitoring res... | 8.5 | ADO Wiki |
| 3 | cloud_RoleName and cloud_RoleInstance fields are empty or missing in Applicat... | Application Insights SDKs auto-populate cloud_RoleName only for known Azure r... | For OpenTelemetry SDKs, set OTEL_RESOURCE_ATTRIBUTES env var: service.name=cu... | 8.5 | ADO Wiki |
| 4 | 同时使用 Application Insights .NET SDK 和 OpenTelemetry Exporter 并行插桩（Side by Side... | Application Insights .NET SDK 的 Adaptive Sampler 与 OpenTelemetry Exporter 并行使... | 临时 Workaround：改用 Fixed Rate Sampling 替代 Adaptive Sampling，直到 OpenTelemetry GA... | 7.0 | ADO Wiki |
| 5 | OpenTelemetry .NET Azure Monitor Exporter: operation name missing from depend... | Known limitations in Azure Monitor OpenTelemetry Exporters for .NET | Known issue, no fix available. Missing operation name causes failures and aff... | 6.5 | MS Learn |
| 6 | OpenTelemetry Node.js Azure Monitor Exporter: operation name missing, device ... | Known limitations in Azure Monitor OpenTelemetry Exporters for Node.js | Known issues. Database server name omission causes incorrect aggregation of t... | 6.5 | MS Learn |
