---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Sampling/Manage Sampling with Javascript"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Sampling/Manage%20Sampling%20with%20Javascript"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

This material covers managing sampling scenarios with JavaScript (Application Insights SDK).

# Key Facts

- JavaScript **only supports Fixed Rate sampling**.
- JavaScript does **NOT have any sampling on by default**.
- No autoinstrumentation sampling settings to configure.

# Enabling

### Manual

- JavaScript only supports Fixed Rate sampling.
- To enable: https://learn.microsoft.com/azure/azure-monitor/app/sampling?tabs=net-core-new#configuring-fixed-rate-sampling-for-web-pages-with-javascript

# Disabling

### Manual

- JavaScript does NOT have any sampling on by default and only supports Fixed Rate sampling.
- Check if Sampling is occurring: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580009/Identify-if-Sampling-is-occurring
- To disable: remove changes that enable sampling — see: https://learn.microsoft.com/azure/azure-monitor/app/sampling?tabs=net-core-new#configuring-fixed-rate-sampling-for-web-pages-with-javascript

# Configuring

### Manual

- See: https://learn.microsoft.com/azure/azure-monitor/app/sampling?tabs=net-core-new#configuring-fixed-rate-sampling-for-web-pages-with-javascript

# Public Documentation

- [Telemetry sampling - Configuring fixed-rate sampling for web pages](https://learn.microsoft.com/azure/azure-monitor/app/sampling?tabs=net-core-new#configuring-fixed-rate-sampling-for-web-pages-with-javascript)

# Internal References

- [Identify if Sampling is enabled](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580009/Identify-if-Sampling-is-enabled)
