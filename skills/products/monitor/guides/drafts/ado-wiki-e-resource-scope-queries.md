---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Common Concepts/Resource scope queries"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FCommon%20Concepts%2FResource%20scope%20queries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Resource Scope Queries

## Background

Log Analytics queries can execute in two contexts:
- **Workspace context**: Query against a specific workspace
- **Resource context**: Query against a specific Azure resource (returns data from all workspaces where that resource's data exists)

## Key Requirements

- Requires proper `_ResourceId` field populated in records
- Returns results from multiple workspaces that have matching `_ResourceId`
- User must have access to the workspaces containing those records

## How to Identify Query Scope

Using Draft telemetry:
```kql
requests
| where operation_ParentId == "<RequestId>"
| extend Request_scope_ = tostring(customDimensions.["Request.scope"])
| project-reorder Request_scope_
```

| Request_scope_ | Description |
|--|--|
| workspace | Workspace context (from LA workspace → Logs) |
| resource | Resource context (from Azure resource → Logs) |
| application | Application Insights |

## Get Resource Context Details

```kql
requests
| where operation_ParentId == "<RequestId>"
| where customDimensions.["Request.scope"] == "resource"
| extend Resource_id_ = tostring(customDimensions.["Resource.id"])
| extend Resource_Queried_Workspaces = tostring(parse_json(tostring(parse_json(tostring(customDimensions.["Resource.workspaceMapping"])))))
| project-reorder Resource*
```

## Expected Behavior: 400 Bad Request

- For RG/Subscription context, example queries show up for all resource types in the RG
- Example queries MAY return 400 Bad Request in resource scope — this is **expected** if the query returns 0 results in that resource scope
- If query returns actual results but still errors, that's a real issue to investigate

## Expected Behavior: Subscription Scope

Subscription scope queries only work if records exist with `_ResourceId` matching a resource in that subscription in any workspace the user can access. The workspace does NOT need to be in the same subscription.

## Expected Behavior: Cross-Tenant (Since Jan 2024)

**By design change (end of January 2024):**
- Workspaces with 'Use resource or workspace permissions' do NOT allow cross-tenant data access by default
- If resource is in tenant X but data is in workspace in tenant Y, data won't return

**Solution**: Configure Azure Lighthouse so workspace's subscription is available in the querying tenant.

**Diagnosis**: Check Draft telemetry for messages:
- "Workspace is filtered out due to cross tenant data pollution"
- "Subscription is unauthorized and filtered out due to cross tenant pollution"

## Custom Logs in Resource Scope

Resource context queries are only supported for:
- `subscription`
- `resourceGroup`
- `microsoft.web/sites`
- `microsoft.compute/virtualmachines`
- `microsoft.compute/virtualmachinescalesets`

Custom logs in other resource types will return **400 Bad Request** — not supported.

Common unsupported custom log tables:
- `AzureNetworkAnalytics_CL` (Traffic Analytics doesn't emit `_ResourceId`)
- `ContainerInstanceLog_CL`
