# Monitor 排查指南索引

| # | Topic | Title | Entries | Fusion | Score | Keywords | Sources | Files |
|---|-------|-------|---------|--------|-------|----------|---------|-------|
| 1 | la-general | Log Analytics 综合问题 | 96 | ✅ | 🔵 6.1 | 21v-gap, 30000-rows, 403, 404, 429 | AW KB ML ON | [speed](la-general.md) / [detail](details/la-general.md) / [workflow](workflows/la-general.md) |
| 2 | ai-general | Application Insights 综合问题 | 66 | ✅ | 🔵 6.5 | 499, 500-error, AADSTS7000112, AKS, AMPLS | AW ML ON | [speed](ai-general.md) / [detail](details/ai-general.md) / [workflow](workflows/ai-general.md) |
| 3 | ai-auto-instrumentation | Application Insights 自动检测与无代码注入 | 61 | ✅ | 🔵 6.5 | .net, 2x-sdk, AppAlreadyInstrumented, AppLens, CATALINA_OPTS | AW ML | [speed](ai-auto-instrumentation.md) / [detail](details/ai-auto-instrumentation.md) / [workflow](workflows/ai-auto-instrumentation.md) |
| 4 | other | 其他监控问题 | 59 | — | 🔵 6.5 | 301, 400, 400-error, 403, 404 | AW ML ON | [speed](other.md) |
| 5 | agent-general | 监控代理综合问题 | 50 | ✅ | 🔵 6.3 | 1.10.7, 169.254.169.254, 18080, AMA-Linux, ASC | AW ML ON | [speed](agent-general.md) / [detail](details/agent-general.md) / [workflow](workflows/agent-general.md) |
| 6 | la-ingestion | Log Analytics 数据摄取与丢失排查 | 50 | ✅ | 🔵 6.6 | 32k-limit, 500-column-limit, 500-columns, AMPLS, ASC | AW ON | [speed](la-ingestion.md) / [detail](details/la-ingestion.md) / [workflow](workflows/la-ingestion.md) |
| 7 | alert-general | 告警综合问题 | 48 | ✅ | 🔵 6.3 | 1.25.0, 21v-gap, 3-sigma, 403, 429 | AW ON | [speed](alert-general.md) / [detail](details/alert-general.md) / [workflow](workflows/alert-general.md) |
| 8 | container-monitoring | 容器监控与 Container Insights | 42 | ✅ | 🔵 6.9 | AKS, AKSLinuxExtension, ARM, AgentLogCollection, ConfigMap | AW ON | [speed](container-monitoring.md) / [detail](details/container-monitoring.md) / [workflow](workflows/container-monitoring.md) |
| 9 | diagnostic-settings | 诊断设置与资源日志 | 42 | ✅ | 🔵 6.6 | 0-bytes, 21v-unsupported, AAD, AADSTS7000112, ADF | AW ML ON | [speed](diagnostic-settings.md) / [detail](details/diagnostic-settings.md) / [workflow](workflows/diagnostic-settings.md) |
| 10 | agent-ama-dcr | AMA 数据收集规则 (DCR) | 41 | ✅ | 🔵 6.5 | 403, 404-error, AKS, AMA, AMA-Linux | AW ML ON | [speed](agent-ama-dcr.md) / [detail](details/agent-ama-dcr.md) / [workflow](workflows/agent-ama-dcr.md) |
| 11 | ai-workspace-migration | Application Insights 工作区迁移 | 38 | ✅ | 🔵 6.7 | 400-error, DCR, HTTP-402, HTTP-439, ImmediatePurgeDataOn30Days | AW | [speed](ai-workspace-migration.md) / [detail](details/ai-workspace-migration.md) |
| 12 | agent-mma-linux | MMA/OMS Linux 代理排查 | 36 | — | 🔵 6.6 | AMA-migration-rollback, Baltimore, CVE-2021-38647, Current.mof, Cylance | AW ML ON | [speed](agent-mma-linux.md) |
| 13 | by-design-limitation | 设计限制与支持边界 | 36 | — | 🔵 6.6 | ADF, API-limitation, Action Group, Alert Processing Rule, Auxiliary-Logs | AW | [speed](by-design-limitation.md) |
| 14 | network-ampls | AMPLS 与 Private Link | 32 | ✅ | 🔵 6.6 | 169.254.169.254, 403, ADX-Proxy, AMPLS, App Service | AW | [speed](network-ampls.md) / [detail](details/network-ampls.md) / [workflow](workflows/network-ampls.md) |
| 15 | ai-missing-telemetry | Application Insights 遥测数据缺失排查 | 30 | — | 🔵 6.6 | 21v-unsupported, 404, 50k-limit, API-Analytics, APIM | AW ML | [speed](ai-missing-telemetry.md) |
| 16 | la-query | Log Analytics KQL 查询问题 | 29 | — | 🔵 6.4 | 100MB, 21v, 400, 429, 500k-records | AW ON | [speed](la-query.md) |
| 17 | ai-javascript-sdk | Application Insights JavaScript/Browser SDK | 26 | ✅ | 🔵 6.3 | 500-error, AMPLS, CORS, HttpOnly, SPA | AW ML | [speed](ai-javascript-sdk.md) / [detail](details/ai-javascript-sdk.md) |
| 18 | agent-mma-windows | agent-mma-windows | 25 | — | 🔵 6.1 | 0x80070057, 0x80070643, 0x80090016, 12044L, 1603 | AW ON | [speed](agent-mma-windows.md) |
| 19 | ai-availability-tests | Application Insights 可用性测试 | 25 | ✅ | 🔵 6.7 | ASC, Application-Insights, Availability-Tests, CDN, DNS | AW ML ON | [speed](ai-availability-tests.md) / [detail](details/ai-availability-tests.md) / [workflow](workflows/ai-availability-tests.md) |
| 20 | agent-mma-general | MMA 代理通用问题与迁移 | 22 | ✅ | 🔵 5.7 | 0x80090016, AD-Assessment, AMPLS, Azure-Policy, Baltimore-CyberTrust | AW ML | [speed](agent-mma-general.md) / [detail](details/agent-mma-general.md) / [workflow](workflows/agent-mma-general.md) |
| 21 | ai-sdk-general | Application Insights SDK 通用问题 | 20 | — | 🔵 6.7 | 503, AAD, Azure-Identity, Managed-Identity, _MS.links | AW ML | [speed](ai-sdk-general.md) |
| 22 | permissions-rbac | 监控权限与 RBAC | 20 | ✅ | 🔵 6.6 | 400, 401, 403, AAD-token, ADX | AW | [speed](permissions-rbac.md) / [detail](details/permissions-rbac.md) / [workflow](workflows/permissions-rbac.md) |
| 23 | agent-ama-linux | AMA Linux 代理排查 | 19 | ✅ | 🔵 6.8 | AMA, AMA-1.34, AMA-1.35, AMA-Linux, ARC | AW ON | [speed](agent-ama-linux.md) / [detail](details/agent-ama-linux.md) / [workflow](workflows/agent-ama-linux.md) |
| 24 | ai-java-sdk | Application Insights Java SDK 与代理 | 18 | ✅ | 🔵 6.2 | GraalVM, OpenTelemetry, Quarkus, SNI, TLS | AW ML | [speed](ai-java-sdk.md) / [detail](details/ai-java-sdk.md) / [workflow](workflows/ai-java-sdk.md) |
| 25 | ai-profiler-debugger | Application Insights Profiler 与 Snapshot Debugger | 18 | ✅ | 🔵 6.9 | 401-unauthorized, 403, Application-Insights, Microsoft.Data.SqlClient, Profiler | AW | [speed](ai-profiler-debugger.md) / [detail](details/ai-profiler-debugger.md) / [workflow](workflows/ai-profiler-debugger.md) |
| 26 | alert-action-group | 告警操作组与通知 | 18 | ✅ | 🔵 6.7 | 404, RBAC, action-group, alert-notification, alerts | AW ON | [speed](alert-action-group.md) / [detail](details/alert-action-group.md) / [workflow](workflows/alert-action-group.md) |
| 27 | alert-metric | 指标告警规则 | 18 | ✅ | 🔵 6.9 | 3-consecutive-evaluations, ASC, Application Insights, FillGapsWithZero, Fired Alerts | AW ON | [speed](alert-metric.md) / [detail](details/alert-metric.md) / [workflow](workflows/alert-metric.md) |
| 28 | ai-azure-functions | Application Insights Azure Functions 集成 | 17 | ✅ | 🔵 6.8 | 307-redirect, AMPLS, ASP.NET-Core, Application-Insights, Azure-Function | AW ON | [speed](ai-azure-functions.md) / [detail](details/ai-azure-functions.md) |
| 29 | ai-ingestion | Application Insights 数据摄取 | 16 | — | 🔵 7.0 | 404, AMPLS, CNAME, DCR, DNS | AW | [speed](ai-ingestion.md) |
| 30 | agent-ama-windows | AMA Windows 代理排查 | 15 | ✅ | 🔵 6.8 | AMA, AMA-Windows, CERT_E_UNTRUSTEDROOT, CLOUDENV, CRL | AW ON | [speed](agent-ama-windows.md) / [detail](details/agent-ama-windows.md) / [workflow](workflows/agent-ama-windows.md) |
| 31 | ai-connection-config | Application Insights 连接字符串与配置 | 15 | — | 🔵 6.9 | 48-hour-window, AMPLS, DNS, HTTP-307, HTTP-308 | AW ML | [speed](ai-connection-config.md) |
| 32 | ai-sampling-data-volume | Application Insights 采样与数据量控制 | 15 | ✅ | 🔵 6.8 | 4xx, HTTP-429, adaptive, adaptive-sampling, always-on | AW | [speed](ai-sampling-data-volume.md) / [detail](details/ai-sampling-data-volume.md) / [workflow](workflows/ai-sampling-data-volume.md) |
| 33 | ai-iis-aspnet | Application Insights IIS/ASP.NET 监控 | 14 | ✅ | 🔵 6.6 | IIS, Redfield, activity-id, ai-agent, antares | AW | [speed](ai-iis-aspnet.md) / [detail](details/ai-iis-aspnet.md) / [workflow](workflows/ai-iis-aspnet.md) |
| 34 | alert-log-query | 日志查询告警规则 | 13 | ✅ | 🔵 6.7 | 0-rows, 400-badrequest, 403-forbidden, 404-notfound, MetricValue | AW | [speed](alert-log-query.md) / [detail](details/alert-log-query.md) / [workflow](workflows/alert-log-query.md) |
| 35 | la-billing | Log Analytics 计费与承诺层级 | 13 | ✅ | 🔵 5.8 | Free-tier, Kusto, azurediagnostics, billing, by-design | AW | [speed](la-billing.md) / [detail](details/la-billing.md) / [workflow](workflows/la-billing.md) |
| 36 | managed-grafana | Azure Managed Grafana | 12 | ✅ | 🔵 6.8 | 1p-customer, 529, alerting, dashboard, deletion | AW | [speed](managed-grafana.md) / [detail](details/managed-grafana.md) / [workflow](workflows/managed-grafana.md) |
| 37 | ai-live-metrics | Application Insights Live Metrics | 11 | ✅ | 🔵 6.0 | Application-Insights, Azure-Function, FunctionsStartup, Mooncake, QuickPulse | AW ML ON | [speed](ai-live-metrics.md) / [detail](details/ai-live-metrics.md) |
| 38 | ai-dotnet-sdk | Application Insights .NET SDK | 10 | ✅ | 🔵 6.4 | .net, EventSourceTelemetryModule, app-insights, app-service, application-insights | AW ML | [speed](ai-dotnet-sdk.md) / [detail](details/ai-dotnet-sdk.md) / [workflow](workflows/ai-dotnet-sdk.md) |
| 39 | agent-vm-insights | VM Insights 与 Dependency Agent | 9 | — | 🔵 6.5 | Dependency Agent, Guest Health Extension, Linux, MMA-to-AMA-migration, Map | AW | [speed](agent-vm-insights.md) |
| 40 | ai-python-sdk | Application Insights Python SDK | 9 | ✅ | 🔵 6.1 | app-insights, app-service, application-insights, auto-collected-telemetry, azure-cli | AW ML | [speed](ai-python-sdk.md) / [detail](details/ai-python-sdk.md) / [workflow](workflows/ai-python-sdk.md) |
| 41 | ai-by-design | ai-by-design | 8 | — | 🔵 6.9 | Azure-AD-B2C, SQLException, VS-Code-extension, aad, activity-log | AW | [speed](ai-by-design.md) |
| 42 | ai-export | ai-export | 8 | — | 🔵 7.0 | allLogs, api-limits, app-service, application-insights, blob-storage | AW | [speed](ai-export.md) |
| 43 | ai-opentelemetry | Application Insights OpenTelemetry 集成 | 6 | ✅ | 🔵 6.1 | ACA, OTEL_RESOURCE_ATTRIBUTES, OpenTelemetry, adaptive-sampling, app-insights | AW ML | [speed](ai-opentelemetry.md) / [detail](details/ai-opentelemetry.md) / [workflow](workflows/ai-opentelemetry.md) |
| 44 | alert-autoscale | alert-autoscale | 6 | — | 🔵 5.7 | MetricFailures, anti-flapping, autoscale, capacity-projection, configuration | AW | [speed](alert-autoscale.md) |
| 45 | la-retention | la-retention | 6 | — | 🔵 6.8 | 30-days, RegistrationTelemetry, alert-processing-rules, audit, auto-resolve | AW | [speed](la-retention.md) |
| 46 | network-proxy-firewall | 代理与防火墙配置 | 6 | ✅ | 🔵 6.8 | 21-seconds, 42-seconds, AMW, Client-Hello, Managed Prometheus | AW ML | [speed](network-proxy-firewall.md) / [detail](details/network-proxy-firewall.md) / [workflow](workflows/network-proxy-firewall.md) |
| 47 | ai-billing-cap | Application Insights 计费与每日上限 | 5 | — | 🔵 6.3 | app-insights, applens, application-insights, billing, configuration | AW ML | [speed](ai-billing-cap.md) |
| 48 | la-custom-logs | Log Analytics 自定义日志 | 3 | ✅ | 🔵 6.5 | 400, ama-linux, api, breaking-change, custom-log | AW | [speed](la-custom-logs.md) / [detail](details/la-custom-logs.md) / [workflow](workflows/la-custom-logs.md) |
| 49 | la-workspace | Log Analytics 工作区管理 | 2 | ✅ | 🔵 6.0 | delete, deletion, force-delete, intelligence-pack, log-analytics | AW | [speed](la-workspace.md) / [detail](details/la-workspace.md) / [workflow](workflows/la-workspace.md) |
| 50 | network-dns | 监控 DNS 配置 | 2 | ✅ | 🔵 6.0 | ARM template, DNS, Log Analytics, availability-tests, data connector | AW ML | [speed](network-dns.md) / [detail](details/network-dns.md) / [workflow](workflows/network-dns.md) |

最后更新: 2026-04-24
