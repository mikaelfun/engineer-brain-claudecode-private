---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Identify cloud role instances in App Services"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/AppLens/Identify%20cloud%20role%20instances%20in%20App%20Services"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Identify Cloud Role Instances in App Services

## Overview

The Application Insights SDKs populate the `cloud role instance` value using **MachineName** in App Services host environments. However, App Services detectors and Kusto clusters use **RoleInstance** instead. This mismatch makes it difficult to correlate AI telemetry with specific App Services workers.

This article explains how to map between `MachineName` (AI SDK) and `RoleInstance` (App Services platform).

## Workflow

1. Start Applens.
2. Add the case number and name of App Service web app.
3. In the detectors filter type in **"RD Host to RoleInstance Mapping"** to locate the detector.
4. The detector displays a mapping table between:
   - **MachineName** (the value recorded in Application Insights `cloud role instance`)
   - **RoleInstance** (the value used by App Services platform / Kusto)

## Example Kusto Query

Once you have the mapping, you can filter Application Insights telemetry by specific worker:

```kusto
customMetrics
| where timestamp > ago(7d)
| take 10
```

Replace with your actual query and add `| where cloud_RoleInstance == "RD..."` to filter by specific instance.
