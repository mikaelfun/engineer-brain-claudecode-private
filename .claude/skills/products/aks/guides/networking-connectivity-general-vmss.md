# AKS 网络连通性通用 — vmss -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS VMSS agent pool shows Resource Health alerts Remote disk disconnected and vi... | AKS cluster-autoscaler uses Force Delete for scale-down whic... | These alerts can be safely ignored during AKS auto-scaling. ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS operations fail with 429 from individual Resource Provider (e.g., VMSS, Netw... | Individual Resource Provider (RP) rate limiting, independent... | 1) Check HttpOutgoingRequests in armprod Kusto, filter for h... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/429%20Throttling) |
| 3 | AKS cluster/nodepool CRUD operations (create, update, delete) fail with Networki... | Failures in updating VMSS underlying Fabric or Network resou... | 1) For delete operations: try manually deleting the underlyi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/CRUD/Delete/AKS%20CRUD%20operation%20failing%20with%20NetworkingInternalOperationError) |
| 4 | AKS GPU node provisioning fails; ASC Extensions tab shows vmssCSE failed with er... | GPU driver installation timed out during node provisioning; ... | Wait for GPU driver installation to complete - error code 85... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVMSS%20Overview) |
| 5 | AKS cluster certificate expired; kubectl get no returns 'Unable to connect to th... | AKS certificates (API server CA, kubelet CA, ETCD CA, aggreg... | 1) Confirm via BBM Kusto: cluster('akscn.kusto.chinacloudapi... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3] |

## Quick Troubleshooting Path

1. Check: These alerts can be safely ignored during AKS auto-scaling `[source: onenote]`
2. Check: 1) Check HttpOutgoingRequests in armprod Kusto, filter for httpStatusCode 429, examine hostName to i `[source: ado-wiki]`
3. Check: 1) For delete operations: try manually deleting the underlying VMSS resource directly via 'az vmss d `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-connectivity-general-vmss.md)
