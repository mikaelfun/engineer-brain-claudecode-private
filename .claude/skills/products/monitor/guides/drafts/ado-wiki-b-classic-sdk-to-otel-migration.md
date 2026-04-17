---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Application Insights setup and customization/Classic SDK to OpenTelemetry migration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FApplication%20Insights%20setup%20and%20customization%2FClassic%20SDK%20to%20OpenTelemetry%20migration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Classic SDK to OpenTelemetry Migration

## Scenario

Guidance on the process and benefits of upgrading from the classic App Insights SDK to the modern OpenTelemetry SDKs.

- Understanding the benefits of migrating
- Considerations of migration
- Understanding migration path from classic SDK to OpenTelemetry

## Key Points

### Benefits of Migrating

Microsoft is fully invested in the OpenTelemetry community. Classic SDKs will eventually be deprecated and retired (timeline not yet known). Focus is going forward on OpenTelemetry distros.

### Considerations

Feature parity is a common question. Check the FAQ for current release state of features within the Azure Monitor OpenTelemetry Distro:
- [Application Insights FAQ](https://learn.microsoft.com/en-us/azure/azure-monitor/app/application-insights-faq#what-s-the-current-release-state-of-features-within-the-azure-monitor-opentelemetry-distro)

### Expectation Setting

- If the ask is needing help to send telemetry via OpenTelemetry to a 3rd party destination (e.g., DynaTrace), this is **NOT supported by Microsoft**.
- If the ask is using [OTLP Exporter](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-configuration?tabs=aspnetcore#enable-the-otlp-exporter), it is **NOT supported by Microsoft**. Direct users to public forums.

### Migration Paths by Language

| Language | Migration Guide |
|----------|----------------|
| .NET | [Migrate from .NET SDKs to OpenTelemetry](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-dotnet-migrate?tabs=aspnetcore) |
| Java | [Upgrading from 2.x](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-upgrade-from-2x) |
| Node.js | [Migrating Node.js from SDK 2.X to OpenTelemetry](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-nodejs-migrate?tabs=cleaninstall) |
| Python | [Migrating Python from OpenCensus to OpenTelemetry](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-python-opencensus-migrate) |

## References

- [Application Insights FAQ - OpenTelemetry section](https://learn.microsoft.com/en-us/azure/azure-monitor/app/application-insights-faq#azure-monitor-opentelemetry)
