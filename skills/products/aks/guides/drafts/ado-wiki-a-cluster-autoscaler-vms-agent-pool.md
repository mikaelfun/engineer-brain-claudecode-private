---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Cluster Autoscaler - VMS Agent Pool"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FCluster%20Autoscaler%20-%20VMS%20Agent%20Pool"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Cluster Autoscaler - VMS Agent Pool

**This TSG is specifically for VMS agent pool CAS use cases.**

## Overview

CAS adjusts nodes by watching pending pods. Enabled via `--enable-cluster-autoscaler --min-count --max-count`.

Key points:
* CAS pod runs in **cx-underlay** (not visible to user)
* Only reacts to `Pod Unschedulable` condition (not resource-based)
* Manages VM pools via **CRP** and **NPS** (Node Provisioner Service)
* Node group name format: `<vms-pool-name>/<sku-size>`
* VM scaling operations are **blocking** (up to 30-min timeout)

## Triaging Steps

1. Check CAS pod running (not Error/Crash) in underlay namespace
2. Verify VMs nodepool has `VirtualMachinesProfile.Scale.Autoscale` property
3. Check ConfigMap: `kubectl describe configmap -n kube-system cluster-autoscaler-status`

## Kusto Queries

### Autoscaler Logs

```sql
union ControlPlaneEvents, ControlPlaneEventsNonShoebox
| where PreciseTimeStamp > ago(1d)
| where ccpNamespace == "{{ccpNamespace}}"
| where category == "cluster-autoscaler"
| extend p=parse_json(properties)
| where p.log !contains "request.go" and p.log !contains "clusterstate.go:623"
| project PreciseTimeStamp, p.log, ccpNamespace
| sort by PreciseTimeStamp asc
```

### NPS Logs

```sql
NPFrontEndQoSEvents
| where PreciseTimeStamp > ago(1h)
| where userAgent contains "cluster-autoscaler-aks"
| where resourceGroupName contains "{{MC_RESOURCE_GROUP}}"
| where resourceName == "{{clusterName}}"
| where agentPoolName == "{{vmsAgentPoolName}}"
| project-reorder PreciseTimeStamp, operationID, operationName
```

Then dig deeper:
```sql
NPFrontEndContextActivity | where operationID == "{{operationID}}"
NPAsyncContextActivity | where operationID == "{{operationID}}"
```

## Scale Up Issues

**"No expansion options"** reasons:
1. No nodepool can fit pending pod (capacity, labels)
2. Nodepool at max count
3. Previous failure caused exponential back-off

**Scale-up requests failing**: Check NPS logs for error details. Nodepool enters back-off immediately.

**Nodes not coming up**: CAS tracks unregistered VMs. After `--max-node-provision-time` (default 15 min), longUnregistered nodes are deleted and re-scaled.

## Scale Down Issues

Reasons for not scaling down:
* Node group at minimum size
* Scale-down disabled annotation on node
* Unneeded for < 10 min (`--scale-down-unneeded-time`)
* Scale-up in last 10 min (`--scale-down-delay-after-add`)
* Failed scale-down in last 3 min (`--scale-down-delay-after-failure`)
* Node utilization > 50% (`--scale-down-utilization-threshold`) - based on **requests sum**, not actual usage

## Concurrency

* **RP Priority**: RP operations preempt CAS requests
* **CAS scale-up**: Allowed during ongoing RP operations
* **CAS scale-down**: Blocked during non-final RP provisioning state

## Tuning Recommendations

1. Increase `--max-node-provision-time` for slow-provisioning SKUs
2. Increase `--new-pod-scale-up-delay` to 30-60s for laddered workloads
3. Adjust `--scale-down-utilization-threshold`, `--max-empty-bulk-delete`, `--scale-down-delay-after-add` for aggressive scale-down

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
