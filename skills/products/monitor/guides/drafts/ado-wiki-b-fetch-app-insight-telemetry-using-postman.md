---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/Query and REST API References/Fetch app insight telemetry using POSTMAN"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/Query%20and%20REST%20API%20References/Fetch%20app%20insight%20telemetry%20using%20POSTMAN"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Fetch App Insight Telemetry Using POSTMAN

## Purpose

Steps on how to access Application Insights telemetry data using APIs via POSTMAN tool.

## Install/Update POSTMAN

3rd party tool — install or update: https://learning.postman.com/docs/getting-started/installation-and-updates/

## Classic Application Insight

API reference: https://learn.microsoft.com/rest/api/application-insights/

Query endpoint: https://learn.microsoft.com/rest/api/application-insights/query/get

**Sample API:**
```
GET https://api.applicationinsights.io/v1/apps/{appId}/query?query={query}&timespan={timespan}
```

**Steps:**
1. Select GET http method and place your API.
2. Select Authorization as API Key:
   - Key = `api_key` (if using "add to" as Query param)
   - Key = `X-Api-Key` (if using "add to" as header)
3. Keep content-type as `application/json`.
4. Click Send and verify result in response section.

## Workspace-based Application Insight

Follow steps for classic, OR use the Log Analytics API:
- Docs: https://learn.microsoft.com/azure/azure-monitor/logs/api/access-api
- Endpoint: `GET https://api.loganalytics.azure.com/{api-version}/workspaces/{workspaceId}/query?[parameters]`

## Also Refer

- API Keys: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605393/API-Keys
- Data Access REST API: https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605391/Data-Access-REST-API
