---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Workflow/Kusto Queries to troubleshoot Workflow issues"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FWorkflow%2FKusto%20Queries%20to%20troubleshoot%20Workflow%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Kusto Queries to Troubleshoot Workflow Issues

## Query 1: API Calls to Workflow Service
Log all API calls, filterable by time, purview account name/id, request URL path, client request ID.

```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceWebRequests
| where ['time'] >= ago(1h)
```

## Query 2: Detailed Request Handling Logs

```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceDetails
| where ['time'] >= ago(1h)
```

## Query 3: Validate Workflow Approval Status

```kql
WorkflowApprovalRequestMetrics
| where ClientRequestId == "<client-request-id>"
```

## Troubleshooting Flow

1. Check WorkflowServiceWebRequests for failed requests:
```kql
WorkflowServiceWebRequests
| where PurviewAccountName == "<account-name>"
  and WebRequestEventName == "OnCompleted"
  and StatusCode !startswith "2"
| where ['time'] > ago(1d)
| project HttpMethod, RequestUrl, ClientRequestId
```

2. Find incomplete requests (only one log entry):
```kql
WorkflowServiceWebRequests
| where PurviewAccountName == "<account-name>"
| where ['time'] > ago(1d)
| summarize count() by ClientRequestId, HttpMethod, RequestUrl
| where count_ == 1
```

3. Check detailed logs:
```kql
WorkflowServiceDetails
| where ClientRequestId == "<client-request-id>"
```

4. If no error found, check Gateway for network timeout:
```kql
GatewayEvent
| where RequestId == "<request-id>"
```

## Basic Queries for Workflow Run Failure

By workflow request ID:
```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceWebRequests
| where RequestUrl contains "<workflow-request-id>"
| sort by PreciseTimeStamp
```

By workflow run ID:
```kql
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceDetails
| where WorkflowRunId == "<workflow-run-id>"
| project PreciseTimeStamp, Level, HttpMethod, RequestPath, ClientRequestId, Message
| sort by PreciseTimeStamp asc
```

## Engaging Product Group via ICM

- **Owning Service:** Microsoft Purview
- **Owning Team:** Workflow

### Required ICM Information
| Field | Notes |
|-------|-------|
| Purview account name | |
| Region | |
| Support topic | |
| Issue start time | |
| Transient or reproducible | |
| Error message | |
| Task or approval request ID | |
| Workflow run ID | |
| Client request ID | From x-ms-client-request-id header in browser dev tools |
| Issue description | |
