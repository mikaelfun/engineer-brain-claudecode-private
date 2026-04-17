---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/ARM Sync_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FARM%20Sync_How%20It%20Works"
importDate: "2026-04-06"
type: how-it-works
tags: [arm-sync, arm-cache, tracked-resource, proxy-resource, jarvis]
---

# [How It Works] ARM Sync

## Goal

Explain what ARM Sync is, how it works, and when it should be triggered.

## ARM Manifest

ARM Manifest is a contract between ARM and a Resource Provider (RP) outlining resource types, endpoints, and rules. Resource providers own and publish their manifest files to ARM. ARM enforces the rules contained in the manifest but does not own it.

## Proxy vs Tracked Resource

- **Tracked resources** (`routingType: Default`): Maintained in ARM's internal storage (ARM cache). ARM caches metadata **outside** the root-level `properties` element. The `properties` element is owned by the RP.
- **Proxy resources** (`routingType: ProxyOnly`): Not cached by ARM.

Example from Microsoft.Compute manifest:
```
"name": "availabilitySets",
"routingType": "Default"     ← Tracked resource
```
```
"name": "virtualMachineScaleSets/extensions",
"routingType": "ProxyOnly"   ← Proxy resource
```

## ARM Cache

ARM's internal storage (ARM cache) is built on XStore, CosmosDB, and Regional Store. Each physical ARM region has its own storage infrastructure.

- Most subscriptions/resource groups use RegionalStore for resources.
- Resource group information (region, tags) is stored in CosmosDB.
- On resource creation/update, metadata is written to the Regional Store at the resource group location.

## ARM Sync — When to Use

ARM Sync synchronizes a tracked resource's state between ARM cache and the RP. **Does not affect proxy resources.**

### Trigger Scenarios

1. **Resource exists in RP but NOT in ARM cache**: Resource was not provisioned in ARM storage (e.g., not visible in subscription/tenant-level list calls). NOTE: RBAC visibility issues do NOT warrant ARM sync.

2. **ARM tracked elements of a resource are out of sync with RP**: e.g., Storage Account SKU changed due to ZRS backend migration; stale tags.

> ⚠️ November 2022 fix: ARM now always reads from resource group home location (cross-regional read), eliminating replication impact at resource-group scope. However, **subscription-level and tenant-level calls** are still subject to replication delays.

## How to Perform ARM Sync

### Single Resource Sync (preferred)

Jarvis action: **Azure Resource Manager > Resource Synchronization > Synchronize resource state**

Required fields:
| Field | Example |
|-------|---------|
| Subscription ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| Resource Group | `myResourceGroup` |
| Resource Name Provider | `Microsoft.Compute` |
| Resource ID | `virtualMachines/myVM` |
| Resource Location | `eastus` |
| API Version | `2025-01-02` |
| Provisioning State | `Create` or `Delete` |

### Provisioning State Options

- **Create**: ARM expects RP to return HTTP 200 (resource exists). Writes entry to ARM cache.
- **Delete**: ARM expects RP to return HTTP 404 (resource not present). Removes entry from ARM cache. If RP returns 200, operation is postponed and retried.

### Batch Sync

Use the batch variant in Jarvis for multiple resources:
Jarvis: **Azure Resource Manager > Resource Synchronization > Synchronize resource state (batch)**

### Larger Scope Sync (use with caution)

Subscription-level, resource group-level, or provider-level sync options exist under **Azure Resource Manager > Resource Synchronization**. These:
- Can take **multiple hours** to complete
- Use list calls (cannot track status of a specific resource)
- If any RP endpoint call fails, the whole operation may fail

**Single resource sync completes within minutes** and provides a correlation ID for tracking.
