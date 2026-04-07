---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Workflow/Basic Queries for troubleshooting workflow run failure"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912942"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Basic Queries for Troubleshooting Workflow Run Failure

## Query 1: Workflow Service Web Requests

Logs all API calls to workflow service. Can be filtered by time, purview account name, request URL path, client request ID.

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceWebRequests
| where RequestUrl contains "e5d68127-1b67-4e27-aac7-a3ee61411cda" //workflow request id
| sort by PreciseTimeStamp
```

## Query 2: Workflow Service Details

Logs detailed info of handling requests. Can be filtered by time, purview account name, client request ID, workflow run ID.

```kusto
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').WorkflowServiceDetails
| where WorkflowRunId == "b9d0304f-d47d-420e-829f-d57b2a5feab3"
//| where * contains "b9d0304f-d47d-420e-829f-d57b2a5feab3"
| project PreciseTimeStamp, Level, HttpMethod, RequestPath, ClientRequestId, Message
| sort by PreciseTimeStamp asc
```
