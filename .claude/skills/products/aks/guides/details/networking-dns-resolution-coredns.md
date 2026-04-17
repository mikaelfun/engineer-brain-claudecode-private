# AKS DNS 解析排查 — coredns -- Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-LocalDNS.md
**Generated**: 2026-04-07

---

## Phase 1: The coredns binary used by AKS localdns feature bu

### aks-072: WIZ security scanner reports aws-sdk-go v1 EOL alert on AKS node at path /opt/az...

**Root Cause**: The coredns binary used by AKS localdns feature bundles aws-sdk-go v1 library. PG is working on bumping coredns version but no ETA available.

**Solution**:
This is a false positive for AKS - coreDNS in AKS does not use the AWS route53 plugin, meaning no code path in aws-sdk-go v1 is actually executed. Customer can safely ignore this alert. Reference: localdns feature docs https://docs.azure.cn/en-us/aks/localdns-custom

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: VPA (Vertical Pod Autoscaler) recommended resource

### aks-677: After enabling addon-autoscaling, VPA recommends too large CPU/memory resources ...

**Root Cause**: VPA (Vertical Pod Autoscaler) recommended resource requests exceed available node capacity. The add-on pods cannot find a suitable node to schedule on

**Solution**:
1) Enable cluster autoscaler to add more nodes, or create a new node pool with larger VM SKUs. 2) To disable VPA for a specific add-on: set annotation kubernetes.azure.com/override-update-mode: enabled and change updateMode to Off in the VPA CR. 3) To disable addon-autoscaling entirely: az aks update --name <cluster> --resource-group <rg> --disable-addon-autoscaling

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAddon%20Autoscaling)]`

## Phase 3: A pre-existing PrivateLinkScope (PLS) for Azure Ar

### aks-1066: AKS Extensions creation stuck in creating state with 'Errorcode: 403, Message: T...

**Root Cause**: A pre-existing PrivateLinkScope (PLS) for Azure Arc-enabled Kubernetes extensions data plane causes AKS extension DP traffic to route through a private IP instead of the public endpoint. This happens when the VNET or private DNS is shared between Arc-enabled K8s and the AKS managed cluster, causing DNS resolution to return the Arc private endpoint IP.

**Solution**:
Option 1: Create separate VNETs for AKS cluster and Arc-enabled Kubernetes. Option 2: Create a CoreDNS override (coredns-custom ConfigMap with hosts plugin) to map the regional DP endpoint (e.g. eastus2euap.dp.kubernetesconfiguration.azure.com) to its public IP. After applying the ConfigMap, restart CoreDNS with 'kubectl -n kube-system rollout restart deployment coredns'. Verify with nslookup from the extension-agent pod.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FUngrouped%2FAKSExtension%20AzureArc)]`

## Phase 4: A PodDisruptionBudget (PDB) with maxUnavailable=0 

### aks-023: AKS cluster upgrade or scale-down hangs indefinitely; node drain never completes...

**Root Cause**: A PodDisruptionBudget (PDB) with maxUnavailable=0 or minAvailable=100% prevents voluntary pod eviction during node drain. Kubernetes will not evict a pod if doing so would violate the PDB, so drain hangs. No direct backend error log; only visible from kube-audit logs or kubectl inspection.

**Solution**:
1) Check for blocking PDBs: kubectl get pdb --all-namespaces. 2) Identify which pods are blocking eviction: kubectl describe pdb <name> -n <ns>. 3) Temporarily delete or relax PDBs blocking the drain (set minAvailable to lower value or maxUnavailable to 1). 4) Proceed with upgrade or scale-down. 5) Re-apply original PDBs after operation completes. Note: coredns PDB is often the culprit in multi-node-pool clusters.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2]]`

## Phase 5: AKS platform performed CoreDNS component upgrade. 

### aks-208: CoreDNS in AKS Mooncake cluster is upgraded by platform without prior customer n...

**Root Cause**: AKS platform performed CoreDNS component upgrade. CXP confirmed notification was not sent to Mooncake customers. ICM 179932700 filed. After incident, Service Health was updated to include AKS notifications.

**Solution**:
Post-incident: Service Health now includes AKS. Mitigation: monitor CoreDNS pod restarts (kubectl get pods -n kube-system -w). For CSS: if customer reports sudden DNS failures after platform maintenance, check CoreDNS pod versions and recent restart times.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 6: By design: AKS requires at least one system nodepo

### aks-212: AKS system nodepool constraints: cannot delete last system nodepool, system pods...

**Root Cause**: By design: AKS requires at least one system nodepool with min 1 node. User nodepools can scale to 0. System pods like CoreDNS may be scheduled on any nodepool. Basic LB does not support multiple nodepools.

**Solution**:
System nodepool must have >= 1 node; use Az CLI >= 2.3.1. User pool can scale to 0 via CLI. To isolate system pods, use node taints/tolerations (CriticalAddonsOnly). For multiple nodepools, use Standard LB. az aks nodepool update --mode System.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 7: A preexisting PrivateLinkScope for Azure Arc-enabl

### aks-1217: AKS cluster extension agent returns 403 'This traffic is not authorized' when ca...

**Root Cause**: A preexisting PrivateLinkScope for Azure Arc-enabled Kubernetes shares the same VNet/private DNS with the AKS cluster, causing extension data plane traffic to route through private IP instead of public IP.

**Solution**:
Option 1 (recommended): Create separate VNets for Arc and AKS. Option 2: Create CoreDNS override to resolve extension DP endpoint to public IP via coredns-custom ConfigMap hosts plugin.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | WIZ security scanner reports aws-sdk-go v1 EOL alert on AKS node at path /opt/az... | The coredns binary used by AKS localdns feature bundles aws-... | This is a false positive for AKS - coreDNS in AKS does not u... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | After enabling addon-autoscaling, VPA recommends too large CPU/memory resources ... | VPA (Vertical Pod Autoscaler) recommended resource requests ... | 1) Enable cluster autoscaler to add more nodes, or create a ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAddon%20Autoscaling) |
| 3 | AKS Extensions creation stuck in creating state with 'Errorcode: 403, Message: T... | A pre-existing PrivateLinkScope (PLS) for Azure Arc-enabled ... | Option 1: Create separate VNETs for AKS cluster and Arc-enab... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FUngrouped%2FAKSExtension%20AzureArc) |
| 4 | AKS cluster upgrade or scale-down hangs indefinitely; node drain never completes... | A PodDisruptionBudget (PDB) with maxUnavailable=0 or minAvai... | 1) Check for blocking PDBs: kubectl get pdb --all-namespaces... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |
| 5 | CoreDNS in AKS Mooncake cluster is upgraded by platform without prior customer n... | AKS platform performed CoreDNS component upgrade. CXP confir... | Post-incident: Service Health now includes AKS. Mitigation: ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | AKS system nodepool constraints: cannot delete last system nodepool, system pods... | By design: AKS requires at least one system nodepool with mi... | System nodepool must have >= 1 node; use Az CLI >= 2.3.1. Us... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | AKS cluster extension agent returns 403 'This traffic is not authorized' when ca... | A preexisting PrivateLinkScope for Azure Arc-enabled Kuberne... | Option 1 (recommended): Create separate VNets for Arc and AK... | [Y] 4.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors) |
