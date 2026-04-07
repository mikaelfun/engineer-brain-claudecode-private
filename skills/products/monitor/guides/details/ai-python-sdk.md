# Monitor Application Insights Python SDK - Comprehensive Troubleshooting Guide

**Entries**: 9 | **Drafts fused**: 4 | **Kusto queries**: 0
**Draft sources**: ado-wiki-b-customize-telemetry-python.md, ado-wiki-b-python-diagnostic-logs.md, ado-wiki-b-python-telemetry-validation-portal-asc.md, ado-wiki-c-manage-sampling-with-python.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Application Insights Python OpenCensus SDK has unresolved bugs, missing telemetry, maintenance issues, or no new feature support

**Solution**: Migrate from Python OpenCensus SDK to Azure Monitor OpenTelemetry Python Distro. Migration guide: https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-python-opencensus-migrate

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Cannot send auto-collected telemetry to multiple Application Insights resources from a single application; customer wants to duplicate telemetry across multiple AI components

**Solution**: Only manually created telemetry (via TelemetryClient or OpenTelemetry API) can target a secondary Application Insights resource. Auto-collected telemetry remains bound to single resource. For environment separation (dev/staging/prod), use separate AI resources with connection string switching. Re...

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: Python Application Insights SDK based on OpenCensus is deprecated/retired (since Sept 30 2024). Telemetry still ingested but no support or fixes available.

**Solution**: Migrate to Azure Monitor OpenTelemetry Python Distro. Follow official migration guide: https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-python-opencensus-migrate. Be aware of documented Changes and limitations during migration.

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Python application sends duplicate telemetry to Application Insights

**Solution**: Ensure only one SDK/Distro is active at any time. Disable the deprecated OpenCensus SDK if using OpenTelemetry Distro. Remove the standalone OpenTelemetry Exporter if using the Azure Monitor OpenTelemetry Distro.

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Python App Service Web Apps are not visible in Visual Studio IDE Publish wizard; cannot deploy Python web app via VS Publish UI

**Solution**: Use Azure CLI from VS Developer PowerShell instead: az webapp up --name <appName> --resource-group <rg> --runtime PYTHON:<version> --sku B1 --logs. This deploys the Python app directly via CLI zip deployment.

`[Source: ADO Wiki, Score: 7.5]`

---

## All Known Issues

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
