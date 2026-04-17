---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Customize telemetry/Python"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FCustomize%20telemetry%2FPython"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

#Overview
___
How to filter or modify telemetry in Application Insights Python SDK (OpenCensus or OpenTelemetry distro).

#Considerations
___
*This is not a TSG. This is information that will be referenced accordingly by TSGs.*

Encourage migration off the OpenCensus SDK, see: [Migrating from OpenCensus Python SDK and Azure Monitor OpenCensus exporter for Python to Azure Monitor OpenTelemetry Python Distro](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-python-opencensus-migrate?tabs=aspnetcore)

#Step by Step Instructions
___

## Filter telemetry

- OpenCensus Python telemetry processors, see: https://learn.microsoft.com/azure/azure-monitor/app/api-filtering-sampling#opencensus-python-telemetry-processors
   - to ensure the telemetry is not sent to ingestion, ensure the callback returns a false
   - last example of the section shows NOT return metric item unless its value is greater than 0

- OpenTelemetry Python distro, see: https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-add-modify?tabs=python#filter-telemetry


## Add or Modify telemetry

- OpenCensus Python telemetry processors, see: https://learn.microsoft.com/azure/azure-monitor/app/api-filtering-sampling#opencensus-python-telemetry-processors
   - examples include:
      - changing the RoleName
      - appending a custom string to each log message
      - adding a custom property to span(request) item
- OpenTelemetry Python distro, see: https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-add-modify?tabs=python#modify-telemetry

#Public Documentation
___
- [OpenCensus Python telemetry processors](https://learn.microsoft.com/azure/azure-monitor/app/api-filtering-sampling#opencensus-python-telemetry-processors)
- [OpenTelemetry Python distro - filter telemetry](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-add-modify?tabs=python#filter-telemetry)
- [OpenTelemetry Python distro - modify telemetry](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-add-modify?tabs=python#modify-telemetry)
- [Migration from OpenCensus to OTel Python](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-python-opencensus-migrate?tabs=aspnetcore)

#Internal References
___
- [Language Resource](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/890133/Language-Resource)
- [Python](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/890028/Python)
- [Incorrect telemetry values (fields, metrics, counters)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/583849/Incorrect-telemetry-values-(fields-metrics-counters))
