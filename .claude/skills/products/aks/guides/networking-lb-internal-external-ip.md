# AKS 内部负载均衡器 — external-ip -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS LoadBalancer service External IP stuck in pending state with kube-controller... | Service principal client secret expired or invalid, kube-con... | Update the service principal credentials: az aks update-cred... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service) |
| 2 | AKS LoadBalancer service External IP stuck in pending with error: AuthorizationF... | Service principal or managed identity lacks required RBAC pe... | Grant required RBAC access to SP/managed identity via Azure ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service) |
| 3 | AKS LoadBalancer service External IP stuck in pending with error: cannot find pu... | Static IP specified in service manifest does not exist in th... | Verify the static IP exists in the specified resource group,... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service) |

## Quick Troubleshooting Path

1. Check: Update the service principal credentials: az aks update-credentials `[source: ado-wiki]`
2. Check: Grant required RBAC access to SP/managed identity via Azure Portal or CLI: az role assignment create `[source: ado-wiki]`
3. Check: Verify the static IP exists in the specified resource group, or correct the IP in the service manife `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-lb-internal-external-ip.md)
