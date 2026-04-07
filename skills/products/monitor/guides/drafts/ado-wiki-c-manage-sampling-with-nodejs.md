---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Sampling/Manage Sampling with Node.js"
sourceUrl: "https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Sampling/Manage%20Sampling%20with%20Node.js"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Manage Sampling with Node.js

## Overview

This material covers managing sampling scenarios with the Node.js agent/SDK for Application Insights.

Applies to: Linux and Windows, auto-instrumentation and manual instrumentation.

Topics covered:
- Configuring sampling
- Enabling sampling
- Disabling sampling
- Sampling overrides

## Enabling Sampling

### Auto-instrumentation
- Node.js auto-instrumentation does NOT have sampling enabled by default
- Node.js auto-instrumentation only supports **Fixed Rate sampling**
  - Reference: https://docs.microsoft.com/azure/azure-monitor/app/sampling#brief-summary
- As of March 2022, there is no way to configure defaults for auto-instrumentation directly. Users can create a JSON config file and add an App Setting with a path to the JSON file (same as SDK configuration)
- Auto-instrumentation will back off if the SDK is detected

### Manual
- Node.js SDK only supports Fixed Rate sampling
- To enable: https://github.com/microsoft/ApplicationInsights-node.js#sampling

## Disabling Sampling

### Auto-instrumentation
- TBD

### Manual
- To disable: https://github.com/microsoft/ApplicationInsights-node.js#sampling

## Configuring Sampling

### Auto-instrumentation
- Node.js configuration reference: https://github.com/microsoft/ApplicationInsights-node.js#configuration
- For auto-instrumentation scenarios, set the JSON config via:
  - **`APPLICATIONINSIGHTS_CONFIGURATION_FILE`** env var: path to a JSON config file in the app
  - **`APPLICATIONINSIGHTS_CONFIGURATION_CONTENT`** env var: directly pass JSON string

Example JSON payload for `APPLICATIONINSIGHTS_CONFIGURATION_CONTENT`:
```json
{
  "enableAutoCollectConsole": true,
  "enableSendLiveMetrics": true,
  "enableAutoCollectHeartbeat": true,
  "enableInternalDebugLogging": true,
  "enableInternalWarningLogging": true,
  "enableWebInstrumentation": true,
  "proxyHttpsUrl": ""
}
```

Note: `APPLICATIONINSIGHTS_CONFIGURATION_CONTENT` may not be available in auto attach scenarios — check the current release.

### Manual
- Reference: https://github.com/microsoft/ApplicationInsights-node.js#configuration

## Related Resources
- [Language Resource - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/890133/Language-Resource?anchor=java)
- [Identify if Sampling is enabled](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580009/Identify-if-Sampling-is-enabled)
- [Sampling Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/583838/Sampling)
