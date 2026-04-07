# AKS 节点池扩缩容 — vmss -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: High frequency of ARM API calls from VMSS cluster 

### aks-197: AKS VMSS-based cluster experiences ARM API throttling (HTTP 429 errors) causing ...

**Root Cause**: High frequency of ARM API calls from VMSS cluster operations (node scaling, disk operations, LB changes) exceeds ARM throttling limits.

**Solution**:
To reduce ARM API requests: 1) Reduce number of nodes and frequency of node scaling operations. 2) Reduce frequency of AzureDisk attach/detach operations. 3) Reduce frequency of LoadBalancer-type service creation/deletion. 4) See https://github.com/Azure/AKS/issues/1187 for details.

`[Score: [G] 8.0 | Source: [onenote](https://github.com/Azure/AKS/issues/1187)]`

## Phase 2: Internal bug: VMSS instance update for Application

### aks-722: AKS node pool goes into failed state or takes very long when scaling by 200+ nod...

**Root Cause**: Internal bug: VMSS instance update for Application Security Groups is slow when processing large batches

**Solution**:
Scale up in smaller batches instead of large increments (avoid 200+ nodes at once).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/5k%20Node%20Limit)]`

## Phase 3: Azure is deprecating Availability Set based AKS no

### aks-079: AKS cluster using Availability Set based node pools will face deprecation; Avail...

**Root Cause**: Azure is deprecating Availability Set based AKS node pools in favor of VMSS-based node pools. Availability Sets have limitations in scaling and update management compared to VMSS.

**Solution**:
Migrate existing Availability Set based node pools to VMSS-based node pools. Follow the official migration guide at https://docs.azure.cn/en-us/aks/availability-sets-on-aks. Create new VMSS-based node pools and drain workloads from AS-based pools.

`[Score: [B] 7.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Old Go-SDK (Kubernetes < 1.15) does not handle ARM

### aks-013: AKS cluster cannot scale or deploy; operations hang or fail with HTTP 429 thrott...

**Root Cause**: Old Go-SDK (Kubernetes < 1.15) does not handle ARM throttling retry-after header correctly. Once throttled, the cloud controller manager enters a tight retry loop and cannot recover. The controller manager itself generates additional API calls that are also throttled, creating a deadlock.

**Solution**:
1) Contact AKS PG to mitigate: stop the Controller Manager, wait 30-60 minutes for throttle window to reset, then restart. This requires cluster downtime. 2) Customer should reduce API request load: fewer node scaling operations, less frequent Azure Disk attach/detach, fewer LoadBalancer service create/delete. 3) Upgrade Kubernetes version to 1.16+ where Go-SDK handles throttling correctly.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1]]`

## Phase 5: AKS agent pool state is managed at VMSS level not 

### aks-060: AKS node count mismatch after deleting nodes using kubectl delete node; agent po...

**Root Cause**: AKS agent pool state is managed at VMSS level not k8s level. kubectl delete node only removes from k8s API but does not update VMSS or AKS RP, causing state mismatch.

**Solution**:
Correct method: delete VMSS instance from portal/CLI at VMSS level, or use az aks nodepool delete-machines (GA Mooncake 2025/03). If already broken: restart deleted node from VMSS instance level, or upgrade AKS to a NEW version (same version wont help). NEVER use kubectl delete node for AKS.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.5]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS VMSS-based cluster experiences ARM API throttling (HTTP 429 errors) causing ... | High frequency of ARM API calls from VMSS cluster operations... | To reduce ARM API requests: 1) Reduce number of nodes and fr... | [G] 8.0 | [onenote](https://github.com/Azure/AKS/issues/1187) |
| 2 | AKS node pool goes into failed state or takes very long when scaling by 200+ nod... | Internal bug: VMSS instance update for Application Security ... | Scale up in smaller batches instead of large increments (avo... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/5k%20Node%20Limit) |
| 3 | AKS cluster using Availability Set based node pools will face deprecation; Avail... | Azure is deprecating Availability Set based AKS node pools i... | Migrate existing Availability Set based node pools to VMSS-b... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS cluster cannot scale or deploy; operations hang or fail with HTTP 429 thrott... | Old Go-SDK (Kubernetes < 1.15) does not handle ARM throttlin... | 1) Contact AKS PG to mitigate: stop the Controller Manager, ... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 5 | AKS node count mismatch after deleting nodes using kubectl delete node; agent po... | AKS agent pool state is managed at VMSS level not k8s level.... | Correct method: delete VMSS instance from portal/CLI at VMSS... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.5] |
