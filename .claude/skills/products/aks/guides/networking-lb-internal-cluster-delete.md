# AKS 内部负载均衡器 — cluster-delete -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster delete fails with PublicIPAddressCannotBeDeleted or similar errors —... | ARM bug: when customer performs a fast PUT on a network obje... | 1) Use ARM 'Get resource' Jarvis action to confirm resource ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FAKS%20delete%20errors%20due%20to%20ARM%20cache%20issues) |
| 2 | Cannot delete AKS cluster: PublicIPAddressCannotBeDeleted, InUseSubnetCannotBeDe... | Cluster is associated with subnet, NSG, or public IP still i... | Remove public IP associations from LB; remove LB rules, heal... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cannot-delete-ip-subnet-nsg) |
| 3 | Cannot delete AKS cluster: CannotDeleteLoadBalancerWithPrivateLinkService or Pri... | Private link service on internal LB has active private endpo... | Delete all private endpoint connections first, then delete t... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/cannot-delete-load-balancer-private-link-service) |

## Quick Troubleshooting Path

1. Check: 1) Use ARM 'Get resource' Jarvis action to confirm resource missing from ARM but present in NRP `[source: ado-wiki]`
2. Check: Remove public IP associations from LB; remove LB rules, health probes, backend pools; dissociate NSG `[source: mslearn]`
3. Check: Delete all private endpoint connections first, then delete the private link service, then retry AKS  `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-lb-internal-cluster-delete.md)
