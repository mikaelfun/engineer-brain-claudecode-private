---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Support Topics/Resource Management/Recovering deleted Resource Group"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Resource Manager (ARM)/Support Topics/Resource Management/Recovering deleted Resource Group"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Recovering Deleted Resource Group

This support topic covers customers who deleted resource groups/resources across multiple resource providers and need restoration.

**If the customer requests recovery from a single resource type, the case must be owned by the team that supports such type.**

> **Important:** Resource recoveries are done on a best effort basis. Set cx expectations accordingly.

## 1. Understand Business Impact and Deletion Scenario

- **Production resources only** — Microsoft should not recover testing/staging environments
- Understand the deletion scenario as it affects backend behavior:

| Scenario | Behavior |
|----------|----------|
| RG cleaned up by deployment in complete mode | Individual delete calls, shared correlation ID, RG not deleted |
| Customer bulk-deleted from portal | Bulk delete API, shared correlation ID, RG not deleted |
| Customer deleted single/multiple resources via script | Each delete has different correlation ID |
| Customer deleted the resource group | RG deletion job processes all resources, shared correlation ID |

## 2. Query Deleted Resources

### Option 1: Project Recall (ASI-based, recommended)
Visit [Azure Recall](https://asi.azure.ms/services/ARM/pages/Azure%20Recall) — fill in subscription ID, start/end date, RG name.

### Option 2: Kusto Queries

**ResourceDeletions table** (only for RG deletion scenarios):
```
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("General", "ResourceDeletions")
```
Filter by: Timestamp, Correlation ID of the RG deletion call.

**EventServiceEntries table** (for bulk delete, deployment complete mode, individual deletes):
```
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests", "EventServiceEntries")
```
Filter by: Timestamp, Correlation ID, operationName has "delete".

**HttpIncomingRequests table** (fallback):
```
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests", "HttpIncomingRequests")
```
Filter by: Timestamp, httpMethod, targetUri has {RGname}.

## 3. Per-Resource-Type Handling (MANDATORY)

| Resource Type | Status | Action |
|--------------|--------|--------|
| Microsoft.Network/* | Non-recoverable | Most can be recreated. Public IPs cannot be recovered. |
| Microsoft.Storage/storageAccounts | Self-recoverable | 14-day window. Customer uses CSAR first. |
| Microsoft.Web/sites | Self-recoverable | Conditions apply, check TSG. |
| Microsoft.Synapse/workspaces | Partial | Workspaces no, dedicated SQL pools yes. |
| Microsoft.ServiceBus/*, EventHub/*, EventGrid/*, Relay/*, NotificationHub/* | Non-recoverable | Notify customer. |
| Microsoft.KeyVault/vaults | Self-recoverable | Via soft-delete. |
| Microsoft.OperationalInsights/workspaces | Self-recoverable | Via soft-delete only. |

> If a resource type is NOT in this list, proceed with collaboration to the corresponding team.

## 4. Engage Service Teams
For resource types requiring collaboration (after reviewing Step 3), create collaboration tasks.

## 5. Monitor and Update
- Follow up on collaboration tasks
- Before timezone handoff, create summary of resources and current recovery status in case notes

## Best Practices for Prevention
- Resource locks on production resources
- DenyAction policies
- Deployment stacks locking
- Least privilege RBAC
