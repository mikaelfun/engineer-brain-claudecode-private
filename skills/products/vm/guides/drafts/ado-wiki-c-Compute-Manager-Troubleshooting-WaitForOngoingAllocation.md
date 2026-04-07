---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/Compute Manager Troubleshooting WaitForOngoingAllocation UpdateTenant_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FCompute%20Manager%20Troubleshooting%20WaitForOngoingAllocation%20UpdateTenant_How%20It%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
level: L300
tags: [compute-manager, fabric-controller, waitforongoingallocation, updatetenant, vip-already-in-use, race-condition, nsm, azsm, fctenant, kusto, l300]
---

# [TSG L300] Compute Manager Troubleshooting: WaitForOngoingAllocation / UpdateTenant

> ⚠️ Internal Only. Level: L300. Full wiki page is 145KB with extensive Kusto queries and case study.
> For full content, visit: https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FCompute%20Manager%20Troubleshooting%20WaitForOngoingAllocation%20UpdateTenant_How%20It%20Works

## Goal

Diagnose **Internal Service Error in Fabric Controller** resulting from a race condition between Fabric Controller (FC) and NSM. Covers fundamental Compute Manager concepts: **Tenant, AzTenant, FcTenant** and advanced troubleshooting for interactions between CRP ↔ CM ↔ AzSM ↔ FC.

## Key Concepts

### Tenant / AzTenant / FcTenant

- **TenantName (GUID)**: Deployment ID in CM. For RDFE world = Deployment Id.
- **AzTenant**: The tenant record in AzSM's domain.
- **FcTenant**: The tenant record in Fabric Controller's domain. Each cluster where a VMSS spans gets its own FcTenant (same TenantName, different tenantId).
- A VMSS can create multiple FcTenants across clusters (spannable tenant).

### Useful Kusto Tables

| Table | Cluster | Purpose |
|-------|---------|---------|
| `LogContainerSnapshot` | Azurecm.kusto.windows.net / AzureCM | Container placement and tenant placement among clusters |
| `LogTenantSnapshot` | Azurecm.kusto.windows.net / AzureCM | FcTenant records per cluster (tenantName + tenantId + dateCreated) |
| `TMMgmtSlaMeasurementEventEtwTable` | AzureCM | Tenant lifecycle events (TenantCreated, TenantStarted, RoleStateChanged, etc.) |
| `TMClusterFabricAuditEtwTable` | azcsupfollower.kusto.windows.net / AzureCM | Non-GET FC requests (CreateTenant, SaveTenantGoalState, StartTenant, etc.) |
| `CommonWebOperationEnd` | azcsupfollower.kusto.windows.net / AzureCM | AzSM → FC HTTP operations with status codes |
| `ComponentQoSEvent` | azcrp.kusto.windows.net / crp_allprod | CRP ↔ AzSM/Fabric operations (operationName, operationResult, resultDetails) |
| `AzSMTenantSnapshotV2` | AzureCM | AzTenant snapshots |

### Tenant Creation Workflow (Normal)

1. AzSM → FC: `CreateTenant`
2. AzSM → FC: `AddOrUpdateTenantSecrets`
3. AzSM → FC: `SaveTenantGoalState`
4. AzSM → FC: `PerformAzsmRoleInstanceOperation`
5. AzSM → FC: `StartTenant`
6. AzSM → FC: `StartRoleInstanceContainer` (per instance)
7. FC → Role reaches `RoleStateStarted`
8. FC → `TenantStarted`

## Root Cause Pattern: VipAlreadyInUseException (Race Condition FC + NSM)

### Symptom
VM/VMSS operation (UpdateTenant / WaitForOngoingAllocation) fails with **Internal Service Error** from Fabric Controller. Error is transient and caused by a race condition.

### Root Cause
When an FcTenant is deleted and a **new FcTenant** is immediately created in the same cluster with the same TenantName, a race condition can occur:

1. Old FcTenant's **VIPs have not been fully cleaned up** yet (NSM/Network Manager is still processing the VIP release)
2. FC attempts to **assign those VIPs to the new FcTenant** → `VipAlreadyInUseException`
3. FC returns Internal Service Error to AzSM/CRP

Evidence pattern in Kusto (TMClusterFabricAuditEtwTable / TMDiagnosticEventTable):
```
TMD: TenantState (Id=..., Tenant='...', ..., NsmEnabled=False) cannot be deleted.
     VIPs deleted: False, Roles deleted: True, Disconnected state notified to NM: True
```
Then VIP release log: `TM: removing allocatedVip <IP>` — but timing shows the new FcTenant creation races ahead of VIP cleanup.

### Investigation Steps

1. **Identify TenantName** from error / case context
2. **Query LogContainerSnapshot** → find which clusters the tenant spans
3. **Query LogTenantSnapshot** → check for clusters with 2 FcTenant records (same TenantName, different tenantId) — indicates recreation
4. **Query TMMgmtSlaMeasurementEventEtwTable** → trace tenant lifecycle: TenantCreated → TenantStopped → ... → TenantStarted
5. **Query TMClusterFabricAuditEtwTable** → trace all non-GET FC requests in the affected cluster
6. **Query CommonWebOperationEnd** → correlate AzSM → FC calls
7. **Query ComponentQoSEvent** → find WaitForOngoingAllocation / UpdateTenant failures in CRP view; look for `resultDetails` with exception details

### Resolution

- This is a **platform-side race condition** in Fabric Controller and NSM.
- Escalate to **EEE Compute Manager** (Support/EEE Compute Manager IcM) with:
  - TenantName
  - Affected cluster(s)
  - Kusto query results from steps above
  - Timeline showing the VIP cleanup race

## Reference

- IcM example: https://portal.microsofticm.com/imp/v3/incidents/details/335068956/home
- EEE Compute Manager scope: [EEE Compute Manager_How it Works](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM)
