# Monitor Troubleshooting Guide Index

| Guide | Type | Kusto | Keywords | Sources | Confidence |
|-------|------|-------|----------|---------|------------|
| [Log Analytics 综合问题](la-general.md) | fusion | 1 | log-analytics, oms, workspace | 96 | high |
| [Application Insights 综合问题](ai-general.md) | fusion | 0 | application-insights, app-insights, monitoring | 66 | high |
| [Application Insights 自动检测与无代码注入](ai-auto-instrumentation.md) | fusion | 0 | auto-instrumentation, codeless, status-monitor, agent-based | 61 | high |
| [其他监控问题](other.md) | compact | 0 | monitor, misc | 59 | high |
| [监控代理综合问题](agent-general.md) | fusion | 0 | agent, extension, heartbeat | 50 | high |
| [Log Analytics 数据摄取与丢失排查](la-ingestion.md) | fusion | 0 | ingestion, missing-data, latency, pipeline | 50 | high |
| [告警综合问题](alert-general.md) | fusion | 0 | alert, rule, suppress, mute | 48 | high |
| [容器监控与 Container Insights](container-monitoring.md) | fusion | 0 | container-insights, aks, prometheus, kubernetes | 42 | high |
| [诊断设置与资源日志](diagnostic-settings.md) | fusion | 1 | diagnostic-settings, resource-logs, activity-log, event-hub | 42 | high |
| [AMA 数据收集规则 (DCR)](agent-ama-dcr.md) | fusion | 0 | dcr, data-collection-rule, transform, stream | 41 | high |
| [Application Insights 工作区迁移](ai-workspace-migration.md) | fusion | 0 | workspace-based, classic, migration, resource | 38 | high |
| [MMA/OMS Linux 代理排查](agent-mma-linux.md) | compact | 0 | mma, oms, omsagent, linux | 36 | high |
| [设计限制与支持边界](by-design-limitation.md) | compact | 0 | by-design, limitation, support-boundary, unsupported | 36 | high |
| [AMPLS 与 Private Link](network-ampls.md) | fusion | 0 | ampls, private-link, private-endpoint, scope | 32 | high |
| [Application Insights 遥测数据缺失排查](ai-missing-telemetry.md) | compact | 0 | missing, no-data, telemetry-loss, gap | 30 | high |
| [Log Analytics KQL 查询问题](la-query.md) | compact | 0 | kusto, kql, query, performance | 29 | high |
| [Application Insights JavaScript/Browser SDK](ai-javascript-sdk.md) | fusion | 0 | javascript, browser, click-analytics, spa | 26 | high |
| [agent-mma-windows](agent-mma-windows.md) | compact | 0 |  | 25 | high |
| [Application Insights 可用性测试](ai-availability-tests.md) | fusion | 0 | availability, web-test, ping, url-test | 25 | high |
| [MMA 代理通用问题与迁移](agent-mma-general.md) | fusion | 0 | mma, legacy, deprecation, migration | 22 | high |
| [Application Insights SDK 通用问题](ai-sdk-general.md) | compact | 0 | sdk, telemetry, channel | 20 | high |
| [监控权限与 RBAC](permissions-rbac.md) | fusion | 0 | rbac, permissions, role, access | 20 | high |
| [AMA Linux 代理排查](agent-ama-linux.md) | fusion | 0 | ama, linux, extension, mdsd | 19 | high |
| [Application Insights Java SDK 与代理](ai-java-sdk.md) | fusion | 0 | java, javaagent, applicationinsights-agent | 18 | high |
| [Application Insights Profiler 与 Snapshot Debugger](ai-profiler-debugger.md) | fusion | 0 | profiler, snapshot-debugger, performance, trace | 18 | high |
| [告警操作组与通知](alert-action-group.md) | fusion | 1 | action-group, notification, webhook, email | 18 | high |
| [指标告警规则](alert-metric.md) | fusion | 1 | metric-alert, threshold, dynamic, signal | 18 | high |
| [Application Insights Azure Functions 集成](ai-azure-functions.md) | fusion | 0 | functions, serverless, trigger, binding | 17 | high |
| [Application Insights 数据摄取](ai-ingestion.md) | compact | 0 | ingestion, endpoint, throttle | 16 | high |
| [AMA Windows 代理排查](agent-ama-windows.md) | fusion | 0 | ama, windows, extension, monitoringagent | 15 | high |
| [Application Insights 连接字符串与配置](ai-connection-config.md) | compact | 0 | connection-string, instrumentation-key, config | 15 | high |
| [Application Insights 采样与数据量控制](ai-sampling-data-volume.md) | fusion | 0 | sampling, adaptive, fixed-rate, data-volume | 15 | high |
| [Application Insights IIS/ASP.NET 监控](ai-iis-aspnet.md) | fusion | 0 | iis, asp.net, freb, w3wp | 14 | high |
| [日志查询告警规则](alert-log-query.md) | fusion | 1 | log-alert, scheduled-query, evaluation | 13 | high |
| [Log Analytics 计费与承诺层级](la-billing.md) | fusion | 0 | billing, daily-cap, commitment-tier, cost | 13 | high |
| [Azure Managed Grafana](managed-grafana.md) | fusion | 0 | grafana, dashboard, visualization | 12 | high |
| [Application Insights Live Metrics](ai-live-metrics.md) | fusion | 0 | live-metrics, quickpulse, real-time | 11 | high |
| [Application Insights .NET SDK](ai-dotnet-sdk.md) | fusion | 0 | dotnet, dotnet-core, nuget, telemetryclient | 10 | high |
| [VM Insights 与 Dependency Agent](agent-vm-insights.md) | compact | 0 | vm-insights, dependency-agent, service-map | 9 | medium |
| [Application Insights Python SDK](ai-python-sdk.md) | fusion | 0 | python, opencensus, django, flask | 9 | medium |
| [ai-by-design](ai-by-design.md) | compact | 0 |  | 8 | medium |
| [ai-export](ai-export.md) | compact | 0 |  | 8 | medium |
| [Application Insights OpenTelemetry 集成](ai-opentelemetry.md) | fusion | 0 | opentelemetry, otel, distro, exporter | 6 | medium |
| [alert-autoscale](alert-autoscale.md) | compact | 0 |  | 6 | medium |
| [la-retention](la-retention.md) | compact | 0 |  | 6 | medium |
| [代理与防火墙配置](network-proxy-firewall.md) | fusion | 0 | proxy, firewall, ssl, tls | 6 | medium |
| [Application Insights 计费与每日上限](ai-billing-cap.md) | compact | 0 | daily-cap, billing, cost, pricing | 5 | medium |
| [Log Analytics 自定义日志](la-custom-logs.md) | fusion | 0 | custom-log, custom-table, dcr, api | 3 | low |
| [Log Analytics 工作区管理](la-workspace.md) | fusion | 0 | workspace, retention, purge, delete | 2 | low |
| [监控 DNS 配置](network-dns.md) | fusion | 0 | dns, resolution, private-dns, zone | 2 | low |

Last updated: 2026-04-07
