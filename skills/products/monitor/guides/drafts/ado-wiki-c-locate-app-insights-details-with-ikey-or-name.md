---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/General References/Locate Application Insights details with only Instrumentation Key or App Insights Name"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAdditional%20Reference%20Material%2FGeneral%20References%2FLocate%20Application%20Insights%20details%20with%20only%20Instrumentation%20Key%20or%20App%20Insights%20Name"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Locate Application Insights details with only Instrumentation Key or App Insights Name

## Overview

Shows means to locating Application Insights resource with limited data points. Sometimes customers only provide pieces of information which is not sufficient to investigate an issue such as only an Instrumentation key or Application Insight workspace name and no Subscription information.

## Methods

There are two means to discover details on an Application Insights resource:

### AppLens (preferred)

1. Open AppLens
2. Use the **Detector - App Insights Resource Finder**

### Observability Mission Control (limited access)

> Note: Many CSS and other resources do NOT have access to this tool. Use AppLens as preferred method.

1. Browse to: https://aimc.aisvc.visualstudio.com
2. Choose **Manage** from the menu bar → **AI Apps/LA Workspaces Lookup**
3. Paste in either Instrumentation Key or Application Insights name
4. Results yield:
   - **Account ID** column holds the Subscription ID
   - **Provision Status** — "Succeeded" means it is NOT deleted
5. Click a row to drill through for more details (resource group, location, etc.)
