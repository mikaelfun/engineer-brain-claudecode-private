---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Call processing - sync vs async"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Call processing - sync vs async"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ARM Call Processing — Sync vs Async

## Determine If Call Is Sync or Async

| Response Code | Processing | Final State? |
|---------------|-----------|--------------|
| **200 OK** (or failure) | Synchronous | Yes — response reflects final state |
| **202 Accepted** | Asynchronous | No — must check EventServiceEntries for final state |
| **201 Created** | Could be either | Need to check JobOperations table |

### Verifying 201 Created

Take the **activity ID** from HttpIncomingRequests and query:

```kql
let activity = ""; // activity id of the operation that returned 201
let since = ago(3d);
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Jobs","JobOperations")
| where TIMESTAMP > since
| where ActivityId == activity
| where operationName == "JobManagementClient.CreateJob"
```

- **jobId starts with `ResourceLongOperationJob`** → Async, 201 is NOT final state
- **No matching jobId** → Sync, 201 IS final state

## Determine Final State for Async Call

### From Client Side

Perform GET call to the `Azure-AsyncOperation` or `Location` header URL from the initial 201/202 response.

- **Pending** → operation in progress
- **Succeeded / Failed / Cancelled** → final state (with optional details)

> The GET call returns **200** even if the async operation failed — do not rely solely on HTTP status code when analyzing traces.

> Official clients (Portal, CLI, PowerShell Az, SDKs) poll automatically.

### From ARM Kusto Logs (EventServiceEntries)

An async operation has at least 3 entries:
1. State: **Started**
2. State: **Accepted** (or **Created**) — one or more
3. State: **Succeeded** / **Failed** / **Cancelled** — final state

If multiple final-state entries exist for the same resource ID, check the `jobId` column — the one starting with `ResourceLongOperationJob` reflects the true final state.

### Reference
- [Track asynchronous Azure operations](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/async-operations)
