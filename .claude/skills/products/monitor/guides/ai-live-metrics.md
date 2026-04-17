# Monitor Application Insights Live Metrics

**Entries**: 11 | **21V**: ALL | **Sources**: 3
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Function 2.x in Mooncake cannot fully support Application Insights (Liv... | Azure Function 2.x runtime requires custom Startup class (FunctionsStartup) t... | Create custom Startup class inheriting FunctionsStartup. Remove and re-regist... | 9.0 | OneNote |
| 2 | Customer needs to disable Live Metric Stream (QuickPulse) in Application Insi... | - | SDK deployment: In ApplicationInsights.config, locate and comment out or remo... | 8.5 | ADO Wiki |
| 3 | Live Metrics stopped working for apps using ApplicationInsights-node.js 2.9.0... | Bug in Live Metrics enablement shipped with Node.JS SDK version 2.9.0 | Update to Node.JS SDK 2.9.1 which fixes the Live Metrics initialization issue | 8.5 | ADO Wiki |
| 4 | Live Metrics stopped working after updating to ApplicationInsights-node.js 2.... | Bug with Live Metrics enablement shipped in Node.JS SDK version 2.9.0. | Update to ApplicationInsights-node.js SDK version 2.9.1 which fixes the Live ... | 8.5 | ADO Wiki |
| 5 | Live Metrics CPU Total % chart displays percentage higher than 100% (can reac... | By design: Live Metrics monitors process-specific \Process(??APP_WIN32_PROC??... | No fix, by design. Only impacts Live Metrics CPU chart. Inform customers the ... | 8.5 | ADO Wiki |
| 6 | Live Metrics (Quick Pulse) stops working after September 30 2025 for Applicat... | Microsoft is retiring API key authentication for Live Metrics on September 30... | Switch from API key to Microsoft Entra ID authentication for Live Metrics bef... | 8.5 | ADO Wiki |
| 7 | Live Metrics 显示红色横幅 'Data is temporarily inaccessible'，Live Metrics 界面无数据 | 第三方浏览器扩展（如 UBlock Origin）拦截了对 *.monitor.azure.com 的请求，该域名专用于 Live Metrics 功能 | 逐一启用浏览器扩展定位罪魁祸首，然后禁用该扩展，或在其设置中放行 https://*.livediagnostics.monitor.azure.com/... | 7.0 | ADO Wiki |
| 8 | Live Metrics pane shows no data or fails to connect | Firewall blocking live metrics endpoints (different from standard telemetry) ... | Open live metrics endpoints in firewall; enable TLS 1.2; check ad-blockers no... | 6.5 | MS Learn |
| 9 | Missing QuickPulseTelemetryModule causes Live Metrics failure in .NET | ApplicationInsights.config missing QuickPulseTelemetryModule and/or QuickPuls... | Add QuickPulseTelemetryModule to TelemetryModules and QuickPulseTelemetryProc... | 6.5 | MS Learn |
| 10 | Data is temporarily inaccessible message in Live Metrics pane | Azure service outage or ad-blockers/firewall blocking live metrics endpoints | Check Azure status at aka.ms/aistatus; add ad-blocker exclusion for *.livedia... | 6.5 | MS Learn |
| 11 | Low monitored server count in Live Metrics vs actual allocated instances | Web servers unload idle applications; Live Metrics only counts servers curren... | Expected behavior. Count increases when traffic resumes and servers reload th... | 6.5 | MS Learn |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/ai-live-metrics.md)
