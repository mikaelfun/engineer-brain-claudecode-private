# AKS 内部负载均衡器 — external-ip -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-ip-based-load-balancer.md, ado-wiki-aci-static-ip-lb-auto-sync.md
**Generated**: 2026-04-07

---

## Phase 1: Service principal client secret expired or invalid

### aks-563: AKS LoadBalancer service External IP stuck in pending state with kube-controller...

**Root Cause**: Service principal client secret expired or invalid, kube-controller-manager cannot authenticate to Azure ARM to provision load balancer

**Solution**:
Update the service principal credentials: az aks update-credentials. Ref: https://docs.microsoft.com/en-us/azure/aks/update-credentials

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service)]`

## Phase 2: Service principal or managed identity lacks requir

### aks-564: AKS LoadBalancer service External IP stuck in pending with error: AuthorizationF...

**Root Cause**: Service principal or managed identity lacks required RBAC permissions on the network resource group

**Solution**:
Grant required RBAC access to SP/managed identity via Azure Portal or CLI: az role assignment create

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service)]`

## Phase 3: Static IP specified in service manifest does not e

### aks-565: AKS LoadBalancer service External IP stuck in pending with error: cannot find pu...

**Root Cause**: Static IP specified in service manifest does not exist in the resource group

**Solution**:
Verify the static IP exists in the specified resource group, or correct the IP in the service manifest. Ref: https://docs.microsoft.com/en-us/azure/aks/static-ip

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS LoadBalancer service External IP stuck in pending state with kube-controller... | Service principal client secret expired or invalid, kube-con... | Update the service principal credentials: az aks update-cred... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service) |
| 2 | AKS LoadBalancer service External IP stuck in pending with error: AuthorizationF... | Service principal or managed identity lacks required RBAC pe... | Grant required RBAC access to SP/managed identity via Azure ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service) |
| 3 | AKS LoadBalancer service External IP stuck in pending with error: cannot find pu... | Static IP specified in service manifest does not exist in th... | Verify the static IP exists in the specified resource group,... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service) |
