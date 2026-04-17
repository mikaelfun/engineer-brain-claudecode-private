# AKS 网络连通性通用 — vmss -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 10 | **Kusto queries**: 0
**Source drafts**: ado-wiki-b-Container-Network-Metrics-Dynamic.md, ado-wiki-b-common-network-issues.md, ado-wiki-b-network-deployment-types.md, ado-wiki-c-Network-Isolated-Cluster.md, ado-wiki-capture-network-trace-veth.md, ado-wiki-d-Container-Network-Logs.md, ado-wiki-enable-create-gpu-in-fdpo-subscription.md, ado-wiki-network-troubleshoot-tools.md, ado-wiki-network-troubleshooting-checklist.md, onenote-aks-rp-to-crp-kusto-trace.md
**Generated**: 2026-04-07

---

## Phase 1: AKS cluster-autoscaler uses Force Delete for scale

### aks-070: AKS VMSS agent pool shows Resource Health alerts Remote disk disconnected and vi...

**Root Cause**: AKS cluster-autoscaler uses Force Delete for scale-down which bypasses graceful shutdown. Resource Health notifications are emitted during Force Delete as a side effect.

**Solution**:
These alerts can be safely ignored during AKS auto-scaling. Verify by correlating alert timestamps with cluster-autoscaler scale-down events.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Individual Resource Provider (RP) rate limiting, i

### aks-572: AKS operations fail with 429 from individual Resource Provider (e.g., VMSS, Netw...

**Root Cause**: Individual Resource Provider (RP) rate limiting, independent from ARM throttling. RP endpoints may be overloaded with traffic or enforce per-subscription limits. RP limits are often not publicly documented (except Network and Storage). RP throttling is the most common form of throttling encountered.

**Solution**:
1) Check HttpOutgoingRequests in armprod Kusto, filter for httpStatusCode 429, examine hostName to identify which RP is throttling. 2) For systemic RP overload (not per-subscription), the supporting team should open ICM with the RP dev team. 3) Also check for HTTP 502/504 with failureCause=service indicating RP timeout. 4) Customer must reduce API call rate to the affected RP. 5) RP throttling config can be found by searching ThrottlingConfig in the One codebase.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/429%20Throttling)]`

## Phase 3: Failures in updating VMSS underlying Fabric or Net

### aks-577: AKS cluster/nodepool CRUD operations (create, update, delete) fail with Networki...

**Root Cause**: Failures in updating VMSS underlying Fabric or Network resources in Azure Compute. Related error codes include RnmServiceDeletionCleanupTimeout and NrpInternalException/InternalServerError. This is an Azure Compute/Network internal issue, not AKS-specific. Detailed investigation reference: http://aka.ms/CCSupNetworkingInternalError

**Solution**:
1) For delete operations: try manually deleting the underlying VMSS resource directly via 'az vmss delete'; the issue may auto-resolve after some time so retrying helps; 2) Collect VMSS resource ID and failed CRP operation ID from ASI; 3) Engage VM/VMSS delivery pod team via collaboration task or EEE AzureRT team via IcM. Check CRP logs via ASI CRP VMSS search for detailed error context.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Delete/AKS%20CRUD%20operation%20failing%20with%20NetworkingInternalOperationError)]`

## Phase 4: GPU driver installation timed out during node prov

### aks-1045: AKS GPU node provisioning fails; ASC Extensions tab shows vmssCSE failed with er...

**Root Cause**: GPU driver installation timed out during node provisioning; the installation may still be in progress and can eventually complete successfully

**Solution**:
Wait for GPU driver installation to complete - error code 85 indicates timeout but installation may succeed given enough time. Monitor node status; if it does not recover, reimage the node and allow sufficient time for GPU driver install.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVMSS%20Overview)]`

## Phase 5: AKS certificates (API server CA, kubelet CA, ETCD 

### aks-026: AKS cluster certificate expired; kubectl get no returns 'Unable to connect to th...

**Root Cause**: AKS certificates (API server CA, kubelet CA, ETCD CA, aggregated API cert) have a 1-year expiry. Clusters without TLS Bootstrapping (Mooncake availability ~March 2022) do NOT auto-rotate. When certificates expire the cluster becomes fully inaccessible.

**Solution**:
1) Confirm via BBM Kusto: cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').BlackboxMonitoringActivity | where reason contains 'StateCustomerCertificateExpired' or reason contains 'ClusterCert30DayCritical'. 2) Rotate: az extension remove --name aks-preview; az extension add --source https://raw.githubusercontent.com/andyzhangx/demo/master/aks/rotate-tokens/aks_preview-0.5.0-py2.py3-none-any.whl -y; az aks reconcile-control-plane-certs -g <RG> -n <cluster>. 3) VMAS: scale nodes 0→N then back. VMSS: az aks upgrade --kubernetes-version x.x.x. 4) Upgrade EOS K8s version. 5) Auto cert-rotation requires TLS Bootstrapping; enabled Mooncake ~March 2022.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS VMSS agent pool shows Resource Health alerts Remote disk disconnected and vi... | AKS cluster-autoscaler uses Force Delete for scale-down whic... | These alerts can be safely ignored during AKS auto-scaling. ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS operations fail with 429 from individual Resource Provider (e.g., VMSS, Netw... | Individual Resource Provider (RP) rate limiting, independent... | 1) Check HttpOutgoingRequests in armprod Kusto, filter for h... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/429%20Throttling) |
| 3 | AKS cluster/nodepool CRUD operations (create, update, delete) fail with Networki... | Failures in updating VMSS underlying Fabric or Network resou... | 1) For delete operations: try manually deleting the underlyi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Delete/AKS%20CRUD%20operation%20failing%20with%20NetworkingInternalOperationError) |
| 4 | AKS GPU node provisioning fails; ASC Extensions tab shows vmssCSE failed with er... | GPU driver installation timed out during node provisioning; ... | Wait for GPU driver installation to complete - error code 85... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVMSS%20Overview) |
| 5 | AKS cluster certificate expired; kubectl get no returns 'Unable to connect to th... | AKS certificates (API server CA, kubelet CA, ETCD CA, aggreg... | 1) Confirm via BBM Kusto: cluster('akscn.kusto.chinacloudapi... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3] |
