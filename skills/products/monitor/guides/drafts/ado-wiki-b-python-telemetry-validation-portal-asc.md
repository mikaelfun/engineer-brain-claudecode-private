---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app Python/Generating telemetry and viewing it in ASC and Portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAutoinstrumentation%2FApp%20Service%20Web%20app%20Python%2FGenerating%20telemetry%20and%20viewing%20it%20in%20ASC%20and%20Portal"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Validating Python App Insights Telemetry via Portal and ASC

## Overview

Guide for verifying that Python autoinstrumented Application Insights telemetry is being generated and ingested correctly, using Azure Portal and Azure Support Center (ASC).

## Generating Telemetry

1. Go to the App Service web app in Azure Portal
2. Click the Default Domain link to launch the web application
3. Refresh the page several times to generate request telemetry
4. The autoinstrumented SDK sends telemetry to the regional ingestion endpoint from the Connection String

## Viewing Telemetry in Azure Portal

### KQL Queries

In the Application Insights component > Logs > KQL mode:

```kql
requests
| where timestamp >= ago(24h)
| project timestamp, url, sdkVersion, cloud_RoleName, cloud_RoleInstance
```

### Understanding sdkVersion for Python

The `sdkVersion` field contains encoded information:
- **Prefix `ali_py`** breaks down as:
  - `a` = automatic instrumentation
  - `li` = Linux
  - `py` = Python

This is critical for identifying the instrumentation method and platform.

### Key Fields

| Field | Purpose |
|-------|---------|
| `timestamp` | Time of request (UTC) |
| `url` | Request URL - identifies source |
| `sdkVersion` | Version + language + platform + instrumentation method (e.g. `ali_py:...`) |
| `cloud_RoleName` | App Service web name - distinguishes apps sharing one AI Component |
| `cloud_RoleInstance` | Specific running instance |

### Transaction Search

- Navigate to Transaction Search
- Filter by `cloud_RoleName` to isolate telemetry from a specific application
- Use "View in Logs" button to see the underlying KQL query
- Switch from "Simple mode" to "KQL mode" for full query visibility

## Viewing Telemetry in ASC

### Query Customer Data Tab

```kql
union *
| where timestamp >= ago(24h)
| project timestamp, sdkVersion, itemType, cloud_RoleName, cloud_RoleInstance
```

- Filter by `itemType` (e.g. requests) and `cloud_RoleName` for targeted analysis

### Ingestion Tab

- Shows aggregated telemetry flow into the AI Component
- **Warning**: Aggregated view can hide the fact that a specific application is NOT sending telemetry
- Change **Aggregate by** to "Raw SDK Names" to see which SDKs are actively sending data
- This reveals if multiple applications with different SDKs are sharing the same Component

## Internal Tools Reference

- [Azure Support Center](/Application-Insights/How-To/Azure-Support-Center)
- [Query Customer Data tab](/Application-Insights/How-To/Azure-Support-Center/Use-Query-Customer-Data-tab)
- [Ingestion tab](/Application-Insights/How-To/Azure-Support-Center/Use-Ingestion-tab)
- [Break down SDKs used and their versions](/Application-Insights/How-To/Additional-Reference-Material/General-References/Break-down-SDKs-used-and-their-versions)
