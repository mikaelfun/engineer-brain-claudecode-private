---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Sampling/Manage Sampling with Python"
sourceUrl: "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Sampling/Manage%20Sampling%20with%20Python"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Manage Sampling with Python

## Overview

This material covers managing sampling scenarios with Python for Application Insights.

Applies to: Linux and Windows, auto-instrumentation and manual instrumentation.

Topics covered:
- Enabling sampling
- Disabling sampling
- Configuring sampling

> **Migration Note:** Encourage customers to migrate off the OpenCensus SDK.
> See: [Migrating from OpenCensus Python SDK to Azure Monitor OpenTelemetry Python Distro](https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-python-opencensus-migrate?tabs=aspnetcore)

## Enabling Sampling

### Auto-instrumentation
- TBD (not currently documented)

### Manual
- **OpenCensus Python SDK**: https://learn.microsoft.com/azure/azure-monitor/app/sampling-classic-api#configuring-fixed-rate-sampling-for-opencensus-python-applications
- **OpenTelemetry distro for Python**: https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-configuration?tabs=python#enable-sampling

## Disabling Sampling

### Auto-instrumentation
- TBD

### Manual
- **OpenCensus Python SDK**: https://learn.microsoft.com/azure/azure-monitor/app/sampling-classic-api#configuring-fixed-rate-sampling-for-opencensus-python-applications
- **OpenTelemetry distro for Python**: https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-configuration?tabs=python#enable-sampling

## Configuring Sampling

### Auto-instrumentation
- TBD

### Manual
- **OpenCensus Python SDK**: https://learn.microsoft.com/azure/azure-monitor/app/sampling-classic-api#configuring-fixed-rate-sampling-for-opencensus-python-applications
- **OpenTelemetry distro for Python**: https://learn.microsoft.com/azure/azure-monitor/app/opentelemetry-configuration?tabs=python#enable-sampling

## Related Resources
- [Language Resource - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/890133/Language-Resource?anchor=java)
- [Identify if Sampling is enabled](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580009/Identify-if-Sampling-is-enabled)
- [Sampling Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/583838/Sampling)
