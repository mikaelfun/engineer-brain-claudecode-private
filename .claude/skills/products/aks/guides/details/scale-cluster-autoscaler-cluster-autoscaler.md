# AKS Cluster Autoscaler — cluster-autoscaler -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 0 | **Kusto queries**: 3
**Kusto references**: autoscaler-analysis.md, cluster-snapshot.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: The safe-to-evict annotation is either not set, or

### aks-603: Cluster autoscaler deletes AKS nodes running batch Jobs, causing job interruptio...

**Root Cause**: The safe-to-evict annotation is either not set, or is incorrectly placed in the Job spec instead of the Pod template spec. Without this annotation on the Pod, the cluster autoscaler considers the node eligible for scale-down even while a Job pod is running.

**Solution**:
Add annotation 'cluster-autoscaler.kubernetes.io/safe-to-evict: "false"' in the Pod template metadata (spec.template.metadata.annotations), NOT in the Job metadata. Verify with 'kubectl describe pod <pod-name>' to confirm the annotation is present on the pod. Reference: https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md#what-types-of-pods-can-prevent-ca-from-removing-a-node

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FPreventing%20cluster%20autoscaler%20from%20deleting%20a%20running%20job)]`

## Phase 2: VMSS instances failed bootstrap with CSE exit code

### aks-835: AKS with CAS shows wrong node count; fewer nodes registered than CAS target (e.g...

**Root Cause**: VMSS instances failed bootstrap with CSE exit code (e.g. 50) and never registered to k8s API server. CAS still counts unregistered VMSS instances causing persistent mismatch.

**Solution**:
Identify failed VMSS instances. Reimage (Use Temp Disk for Ephemeral OS) or delete them, then reconcile cluster. See vmssCSE failures TSG for exit codes.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/Cluster%20Autoscaler/AKS_not_showing_correct_node_count_when_CAS_is_enabled)]`

## Phase 3: calico-typha deployment uses hostPort binding each

### aks-836: CAS not scaling down to MIN count; nodes not suitable for removal can reschedule...

**Root Cause**: calico-typha deployment uses hostPort binding each replica 1:1 to a node. Tigera operator auto-scales typha replicas to match node count (1 per node for 1-3 nodes). hostPort prevents pod relocation.

**Solution**:
Set CAS MIN COUNT >= 3 (matching calico-typha replica needs) or use manual scaling for fewer nodes. Expected behavior with hostPort deployments.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/Cluster%20Autoscaler/Cluster%20Autoscaler%20is%20not%20scaling%20down%20when%20using%20Calico%20typha%20Operator)]`

## Phase 4: Due to a limitation in cluster autoscaler, PUT AP 

### aks-918: PUT Agent Pool request containing node initialization taints returns Bad Request...

**Root Cause**: Due to a limitation in cluster autoscaler, PUT AP (Agent Pool level) requests containing node initialization taints are blocked by AKS RP. Only PUT MC (Managed Cluster level) operations are allowed.

**Solution**:
Customer should perform managed cluster level operations (PUT MC) instead of agent pool level operations (PUT AP) when including node initialization taints. This limitation will be removed at a later date.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Initialization%20Taints)]`

## Phase 5: Cluster autoscaler only triggers scale-up when the

### aks-243: AKS cluster autoscaler does not scale up even though actual node count is below ...

**Root Cause**: Cluster autoscaler only triggers scale-up when there are pending pods. It does NOT scale up simply because actual node count < min count. Min count only sets a floor for scale-down operations.

**Solution**:
Understand that min count prevents scale-down below threshold but does not enforce scale-up. To add nodes either deploy workloads creating pending pods or manually scale the node pool.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 6: Upstream cluster autoscaler race condition causes 

### aks-1154: Cluster autoscaler not scaling up or down with 'failed to fix node group sizes: ...

**Root Cause**: Upstream cluster autoscaler race condition causes deadlock (kubernetes/autoscaler#6128)

**Solution**:
Disable and re-enable the cluster autoscaler to break the deadlock

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cluster-autoscaler-fails-to-scale)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cluster autoscaler deletes AKS nodes running batch Jobs, causing job interruptio... | The safe-to-evict annotation is either not set, or is incorr... | Add annotation 'cluster-autoscaler.kubernetes.io/safe-to-evi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FPreventing%20cluster%20autoscaler%20from%20deleting%20a%20running%20job) |
| 2 | AKS with CAS shows wrong node count; fewer nodes registered than CAS target (e.g... | VMSS instances failed bootstrap with CSE exit code (e.g. 50)... | Identify failed VMSS instances. Reimage (Use Temp Disk for E... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/Cluster%20Autoscaler/AKS_not_showing_correct_node_count_when_CAS_is_enabled) |
| 3 | CAS not scaling down to MIN count; nodes not suitable for removal can reschedule... | calico-typha deployment uses hostPort binding each replica 1... | Set CAS MIN COUNT >= 3 (matching calico-typha replica needs)... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/Cluster%20Autoscaler/Cluster%20Autoscaler%20is%20not%20scaling%20down%20when%20using%20Calico%20typha%20Operator) |
| 4 | PUT Agent Pool request containing node initialization taints returns Bad Request... | Due to a limitation in cluster autoscaler, PUT AP (Agent Poo... | Customer should perform managed cluster level operations (PU... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Initialization%20Taints) |
| 5 | AKS cluster autoscaler does not scale up even though actual node count is below ... | Cluster autoscaler only triggers scale-up when there are pen... | Understand that min count prevents scale-down below threshol... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | Cluster autoscaler not scaling up or down with 'failed to fix node group sizes: ... | Upstream cluster autoscaler race condition causes deadlock (... | Disable and re-enable the cluster autoscaler to break the de... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cluster-autoscaler-fails-to-scale) |
