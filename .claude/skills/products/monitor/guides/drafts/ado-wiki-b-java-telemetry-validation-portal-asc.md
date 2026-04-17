---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/App Service Web app Java/Generating telemetry and viewing it in ASC and Portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAutoinstrumentation%2FApp%20Service%20Web%20app%20Java%2FGenerating%20telemetry%20and%20viewing%20it%20in%20ASC%20and%20Portal"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Validating Java App Insights Telemetry via Portal and ASC

## Overview

Guide for verifying that Java autoinstrumented Application Insights telemetry is being generated and ingested correctly, using both the Azure Portal and Azure Support Center (ASC).

## Generating Telemetry

1. Go to the App Service web app in Azure Portal
2. Click the Default Domain link to launch the web application in a browser
3. Refresh the page several times - each request generates telemetry via auto-collection
4. The autoinstrumented SDK sends telemetry to the regional ingestion endpoint specified in the Connection String

## Viewing Telemetry in Azure Portal

### KQL Queries

In the Application Insights component > Logs:

```kql
requests
| where timestamp >= ago(24h)
| project timestamp, url, sdkVersion, cloud_RoleName, cloud_RoleInstance
```

### Key Fields to Examine

| Field | Purpose |
|-------|---------|
| `timestamp` | Time of request (UTC in portal) |
| `url` | URL of the request - helps identify source |
| `sdkVersion` | Version + language + platform + instrumentation method |
| `cloud_RoleName` | Typically maps to the App Service name - distinguishes telemetry from multiple apps sharing one AI Component |
| `cloud_RoleInstance` | Specific instance of the running application |

### Transaction Search

- Navigate to Transaction Search in the AI Component
- Change time range to see telemetry data
- Shows telemetry of any type with graphical representation

## Viewing Telemetry in Azure Support Center (ASC)

ASC allows CSS engineers to review data without asking the customer.

### Query Customer Data Tab

```kql
union *
| where timestamp >= ago(24h)
| project timestamp, sdkVersion, itemType, cloud_RoleName, cloud_RoleInstance
```

### Ingestion Tab

- Shows what is coming into the Application Insights resource
- Different view from Query Customer Data
- Useful for seeing overall telemetry flow

## Internal Tools Reference

- [Azure Support Center](/Application-Insights/How-To/Azure-Support-Center)
- [Query Customer Data tab](/Application-Insights/How-To/Azure-Support-Center/Use-Query-Customer-Data-tab)
- [Ingestion tab](/Application-Insights/How-To/Azure-Support-Center/Use-Ingestion-tab)
- [Break down SDKs used and their versions](/Application-Insights/How-To/Additional-Reference-Material/General-References/Break-down-SDKs-used-and-their-versions)
