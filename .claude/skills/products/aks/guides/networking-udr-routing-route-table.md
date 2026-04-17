# AKS UDR 与路由 — route-table -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Node event logs (kubectl describe node) show 'Warning FailedToCreateRoute' with ... | The route table used by the AKS cluster is shared between mu... | Each AKS Kubenet cluster must use a unique route table. Upda... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FUngrouped%2FFailedToCreateRoute%20PreconditionFailed%20logged%20on%20all%20nodes%20Describe) |
| 2 | Cannot move AKS VNet or route table to a different resource group after cluster ... | AKS cloud provider config (cloudconfig) is hard-coded in RP ... | Do not move AKS-associated networking resources (VNet, route... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS cluster deletion fails with InUseRouteTableCannotBeDeleted. Route table is i... | The AKS cluster's associated route table is still linked to ... | Dissociate the route table from the subnet first, then retry... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/inuseroutetablecannotbedeleted-error) |

## Quick Troubleshooting Path

1. Check: Each AKS Kubenet cluster must use a unique route table `[source: ado-wiki]`
2. Check: Do not move AKS-associated networking resources (VNet, route table, NSG) to other resource groups af `[source: onenote]`
3. Check: Dissociate the route table from the subnet first, then retry deleting the AKS cluster `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-udr-routing-route-table.md)
