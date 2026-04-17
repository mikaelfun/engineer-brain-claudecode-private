# AKS 内部负载均衡器 — internal-lb -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Internal load balancer service creation is slow or fails with timeout on AKS clu... | Known performance bottleneck in AKS for service/ILB creation... | Scale down to <750 nodes, create internal LB service (type L... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/5k%20Node%20Limit) |
| 2 | AKS reconcile after UMI RBAC fix fails with PrivateIPAddressIsAllocated error; I... | When UMI had no network access, cloud-controller-manager cou... | Manually remove conflicting IP from VMSS NIC or Internal LB ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Internal LoadBalancer service creation slow or failing with timeout at >750 node... | Standard Load Balancer (SLB) backend pool updates are a know... | Scale down cluster to <750 nodes to create internal LB, then... | [G] 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/aks-at-scale-troubleshoot-guide) |
| 4 | Nginx Ingress Controller with internal load balancer fails to create ILB in AKS ... | When using Azure CNI, IP addresses are pre-allocated from th... | 1) Choose an ILB IP address that does NOT overlap with the A... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: Scale down to <750 nodes, create internal LB service (type LoadBalancer with azure-load-balancer-int `[source: ado-wiki]`
2. Check: Manually remove conflicting IP from VMSS NIC or Internal LB frontend configuration, then reconcile a `[source: onenote]`
3. Check: Scale down cluster to <750 nodes to create internal LB, then scale back up `[source: mslearn]`
