---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Control & Data Plane/Understanding and Troubleshooting Control & Data Plane Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FControl%20%26%20Data%20Plane%2FUnderstanding%20and%20Troubleshooting%20Control%20%26%20Data%20Plane%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Understanding and Troubleshooting Control & Data Plane Issues

## Overview

Control/Data plane issues are usually categorized by customers as "portal issues/errors". Common scenarios:
- Running a query in Application Insights or Log Analytics Logs blade fails with "Error while retrieving data"
- Similar errors in Performance, Failures, and Transaction Search blades
- Unable to perform ARM-based actions (rename, move, migrate) against an AI resource

## Control Plane vs Data Plane

### Control Plane
- **What**: Resource access — read/write operations against Azure resources
- **Endpoint**: `management.azure.com`
- **Logs**: Most write operations reflect in Activity Logs
- **Service**: Azure Resource Manager (ARM) — acts as frontend API proxy, handles auth/authz, policies, locks, then routes to Resource Providers (Microsoft.insights, Microsoft.OperationalInsights)

### Data Plane
- **What**: Data access — logs/telemetry stored within AI or LA resources
- **Endpoints**: `api.applicationinsights.io` or `api.loganalytics.io`
- **Service**: "Draft API" — returns telemetry records for queries
- **Docs**: [Query API - Application Insights](https://learn.microsoft.com/rest/api/application-insights/query/get) | [Query API - Log Analytics](https://learn.microsoft.com/rest/api/loganalytics/dataaccess/query/get)

## Troubleshooting Steps

1. **When** did the behavior first start?
2. **How many users** are affected?
3. **Can it be reproduced** at will? What steps?
4. **Multiple browsers** — is it reproducible in different browsers?
5. **Different users** — can different users reproduce? If not, consider [RBAC permissions/roles](https://learn.microsoft.com/azure/azure-monitor/roles-permissions-security).
6. **Portal URL** — internal users may be routed to ms.portal.azure.com. Try the [latest product portal](https://portal.azure.com/?feature.customportal=false&feature.canmodifystamps=true).

## HAR Trace Collection

For detailed diagnosis, collect a browser HAR trace. See: Understanding and effectively using HAR (internal wiki) for when/how to collect and validate.

## Identifying Call Type

- URL contains `management.azure.com` → **Control Plane** (ARM)
- URL contains `api.applicationinsights.io` or `api.loganalytics.io` → **Data Plane** (Draft API)
