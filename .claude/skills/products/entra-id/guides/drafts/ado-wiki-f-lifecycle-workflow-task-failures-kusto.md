---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Entra ID Lifecycle Workflows/TSGs/Workflows are running but I see tasks failing or unexpected results"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/GeneralPages/AAD/AAD%20Account%20Management/Identity%20Governance/Entra%20ID%20Lifecycle%20Workflows/TSGs/Workflows%20are%20running%20but%20I%20see%20tasks%20failing%20or%20unexpected%20results"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Investigating Lifecycle Workflow Task Failures or Unexpected Results

## Kusto Clusters

**NOTE**: Use **ASC KustoWebUx** to access the kusto clusters, access is not available via Azure Data Explorer.

- `https://idsharedwus.westus.kusto.windows.net/AADLCM_PROD` (EU customers)
- `https://idsharedweu.westeurope.kusto.windows.net/AADLCM_PROD` (All other regions)

## Investigation Steps

### Step 1: Query Span Table

To investigate task failures or unexpected results, you need the **workflow ID** and **user ID**.

Query the Kusto `Span` table to see the execution history of the workflow for the given user:

```kql
Span
| where WorkflowId contains "210d70ba-368e-4ff6-94e9-6f4a6ebfb250"
    and UserId == "7eb7f6e3-f86f-4b2b-8f28-f3af8b9f3898"
```

From this query, you can filter on each task execution using the **TaskId** / **TaskInstanceId** columns.

### Step 2: Deep-Dive with Trace ID

For a more in-depth view of the execution of a task:

1. Extract the `env_dt_traceId` from the Span query results
2. Query Kusto logs using that trace ID
3. This will show each step of the task execution and a more detailed view of why it failed
