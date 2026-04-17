---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Locate host.json file in a Function App"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FLocate%20host.json%20file%20in%20a%20Function%20App"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Locate host.json file in a Function App

## Overview

This article shows how to locate a Function App's host.json configuration file through AppLens.

## Considerations

- `host.json` is the main configuration file for Function App resources, including Application Insights configuration.
- Key AI-related settings in host.json include sampling, logging verbosity, and custom telemetry configuration.
- Reference: [host.json reference for Azure Functions 2.x](https://learn.microsoft.com/azure/azure-functions/functions-host-json#applicationinsights)

## Workflow

1. Go to AppLens and enter the name of the Function App resource you want to investigate.
2. Search **'Host.json & Function(s).json'** in the upper-left filter option.
3. Drop down the **'Host.json sanitized content'** section to view the configuration.

## Use Cases

- Verify if sampling is configured (may explain missing telemetry)
- Verify `applicationInsights.instrumentationKey` or `applicationInsights.connectionString` settings
- Check logging verbosity levels

## References

- Feedback? Contact Nicolas Zamora (nzamoralopez)
- Last Modified: 7/11/2023
