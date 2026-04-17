# Monitor Application Insights Python SDK

**Entries**: 9 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Application Insights Python OpenCensus SDK has unresolved bugs, missing telem... | Python OpenCensus SDK is deprecated and no longer actively maintained — bug f... | Migrate from Python OpenCensus SDK to Azure Monitor OpenTelemetry Python Dist... | 8.5 | ADO Wiki |
| 2 | Cannot send auto-collected telemetry to multiple Application Insights resourc... | Design limitation across all Application Insights SDKs (.NET, Java, Node.js, ... | Only manually created telemetry (via TelemetryClient or OpenTelemetry API) ca... | 8.5 | ADO Wiki |
| 3 | Python Application Insights SDK based on OpenCensus is deprecated/retired (si... | OpenCensus Python SDK was officially retired on September 30, 2024. OpenCensu... | Migrate to Azure Monitor OpenTelemetry Python Distro. Follow official migrati... | 8.5 | ADO Wiki |
| 4 | Python application sends duplicate telemetry to Application Insights | Multiple Application Insights SDKs/distros enabled simultaneously -- either O... | Ensure only one SDK/Distro is active at any time. Disable the deprecated Open... | 8.5 | ADO Wiki |
| 5 | Python App Service Web Apps are not visible in Visual Studio IDE Publish wiza... | Visual Studio IDE limitation — as of Oct 2024 the VS Publish experience does ... | Use Azure CLI from VS Developer PowerShell instead: az webapp up --name <appN... | 7.5 | ADO Wiki |
| 6 | Duplicate trace logs in Application Insights when using Azure Functions with ... | Both native Azure Functions logging and azure-monitor-opentelemetry logging e... | Set OTEL_LOGS_EXPORTER=None to disable distribution logging. For Always On: s... | 7.5 | MS Learn |
| 7 | Missing Requests table data in Application Insights when using FastAPI or Fla... | Importing fastapi.FastAPI or flask.Flask before calling configure_azure_monit... | Import module as whole (import fastapi), call configure_azure_monitor() befor... | 7.5 | MS Learn |
| 8 | Duplicate telemetry and unexpected cost increase in Python App Service with A... | Both App Service autoinstrumentation and manual OpenTelemetry instrumentation... | Use only one instrumentation method. If using autoinstrumentation, remove man... | 7.5 | MS Learn |
| 9 | Palo Alto 防火墙虚拟设备配置了 Application Insights 遥测采集，出现：全部遥测丢失、部分字段缺失、特定时段遥测缺失，或客户询... | Palo Alto 使用已废弃的 Legacy Python SDK（zooba/AppInsights-Python）集成 Application In... | （1）检查 ASC Ingestion Tab 确认摄取端点是否丢弃数据；（2）通过 curl/nslookup 验证防火墙到 AI 端点的网络连通性；（... | 6.0 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/ai-python-sdk.md)
