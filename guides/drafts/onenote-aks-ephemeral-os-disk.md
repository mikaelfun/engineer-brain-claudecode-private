# [AKS] Ephemeral OS Disk

**Source:** MCVKB/VM+SCIM/18.25  
**Type:** Reference Guide  
**Product:** AKS (Mooncake)  
**Date:** 2021-08-27

## Overview

Ephemeral OS disks store data on the local VM host rather than on a remote managed disk. They provide lower latency and are the recommended option for AKS node pools in Mooncake.

**Docs:**
- VM level: https://docs.microsoft.com/en-us/azure/virtual-machines/ephemeral-os-disks
- AKS level: https://docs.microsoft.com/en-us/azure/aks/cluster-configuration#ephemeral-os
- **Requires client API version ≥ 2020-11-01**

## Key Behaviors in AKS

| Behavior | Detail |
|----------|--------|
| **Default** | If VM SKU supports ephemeral OS disk, AKS creates node with `osDiskType=Ephemeral` by default |
| **Portal** | Cannot select OS disk type in Portal |
| **CLI override** | `az aks nodepool add --node-osdisk-type Managed` to use managed disk instead |
| **Data persistence** | Data is lost on reboot/reimage (same as temp disk) |
| **Recommended** | Use ephemeral OS disk in Mooncake to avoid IO throttling issues (see aks-onenote-008) |

## Kusto — Verify OS Disk Type

```kusto
-- akscn.kusto.chinacloudapi.cn / AKSprod
-- Verify via CRP ContextActivity message
cluster('Azcrpmc').database('crp_allmc').ContextActivity
| where PreciseTimeStamp >= ago(5d)
| where subscriptionId == "<sub-id>"
| where message contains "<cluster-name>"
| where message contains "profile"
| where message contains "Local"   -- "Local" = ephemeral
```

## Relationship to IO Throttling

Ephemeral OS disks bypass the Azure managed disk IO throttle limits that affect 100–128 GB OS disks on VMSS nodes. If a customer reports node NotReady / slow PVC attach due to IO throttling (queue depth ≥ 8), recommend migrating to a node pool with ephemeral OS disks. See `aks-onenote-008`.
