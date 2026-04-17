# Monitor Application Insights 采样与数据量控制

**Entries**: 15 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | All telemetry data stops flowing into Application Insights tables periodicall... | Application Insights Daily Cap is being hit, causing all telemetry to be drop... | 1) Check Throttle Status tab in ASC to confirm Daily Cap is being hit. 2) Use... | 8.5 | ADO Wiki |
| 2 | All telemetry stops flowing into Application Insights tables periodically the... | Application Insights Daily Cap or Log Analytics Daily Cap has been reached; A... | Check throttle status in ASC (Use Throttle Status tab); check Read Aggregate ... | 8.5 | ADO Wiki |
| 3 | RPS drop or CPU increase immediately after application startup under high RPS... | Adaptive Sampling's first evaluation during steep RPS incline may be inaccura... | Configure AdaptiveSamplingTelemetryProcessor with InitialSamplingPercentage s... | 8.5 | ADO Wiki |
| 4 | Continuous CPU/RPS degradation throughout application lifetime at high RPS wi... | Disabling adaptive sampling leads to noticeable overhead; even with sampling ... | 1) 1-10% overhead is expected range. 2) Ensure adaptive sampling is enabled a... | 8.5 | ADO Wiki |
| 5 | Ingestion sampling is configured in Azure portal but does not take effect; te... | Ingestion sampling does not apply when client-side SDK sampling (adaptive or ... | Check if SDK-level sampling is configured in application code or config. If S... | 8.5 | ADO Wiki |
| 6 | Application Insights Performance/Availability/Failures blades show inflated r... | Initial chart load uses pre-aggregated Application Insights Standard Metrics ... | Advise customer to use 'Application Insights Standard Metrics' namespace on t... | 8.5 | ADO Wiki |
| 7 | Application Insights shows request count as an exact multiple (2x, 3x, 4x, et... | Sampling is operation-based: all telemetry items sharing the same operationId... | Check for distributed operations: query a single operationId for all telemetr... | 8.5 | ADO Wiki |
| 8 | High number of failures with 4xx result codes (e.g. 404) on Application Insig... | App Service features like Always On, Health Check, or Automatic Scaling trigg... | 1) Identify the source: check if Always On, Health Check, or Automatic Scalin... | 8.5 | ADO Wiki |
| 9 | In .NET Core apps, telemetry from logging adapters (NLog, Log4Net, ILogger) b... | In .NET Core, logging adapters use TelemetryConfiguration.Active which create... | Set EnableActiveTelemetryConfigurationSetup=true in ApplicationInsightsServic... | 8.5 | ADO Wiki |
| 10 | .NET Core app: telemetry from logging adapters (NLog, Log4Net, ILogger) not s... | .NET Core SDK behavior change: logging adapters use TelemetryConfiguration.Ac... | Set EnableActiveTelemetryConfigurationSetup=true: builder.Services.AddApplica... | 8.5 | ADO Wiki |
| 11 | Telemetry data stops appearing in Application Insights partway through the da... | The Application Insights daily data cap (daily quota) has been reached. The i... | 1) Check self-diagnostics logs for daily cap reached messages. 2) Review dail... | 8.5 | ADO Wiki |
| 12 | Customer reports missing telemetry data in Application Insights; not seeing a... | Sampling is enabled - either client-side (adaptive or fixed-rate in SDK confi... | Check itemCount field in KQL query results (>1 = sampling active). Review SDK... | 8.5 | ADO Wiki |
| 13 | Performance blade Operations tab shows different request counts or durations ... | Performance blade uses TOP 10 operations by itemCount so individual sums do n... | Use exact Performance blade queries: requests / summarize sum(itemCount), avg... | 8.5 | ADO Wiki |
| 14 | Application Insights endpoint returns HTTP 429 (Too Many Requests); telemetry... | Client is sending too many telemetry items within a short time interval, exce... | Reduce telemetry volume using adaptive sampling, fixed-rate sampling, or tele... | 8.5 | ADO Wiki |
| 15 | Application Insights SDK receives HTTP 429 - telemetry is being throttled and... | Client is sending too many telemetry items to the endpoint within a short tim... | Implement sampling (adaptive or fixed-rate) to reduce telemetry volume. Use T... | 8.5 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/ai-sampling-data-volume.md)
