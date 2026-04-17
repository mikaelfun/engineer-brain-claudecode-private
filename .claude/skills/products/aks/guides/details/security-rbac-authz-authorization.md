# AKS RBAC 与授权 — authorization -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-determining-subscription-for-public-ip.md
**Generated**: 2026-04-07

---

## Phase 1: Customer subscription not registered to required r

### aks-676: Flux extension installation or uninstallation fails with AuthorizationFailed err...

**Root Cause**: Customer subscription not registered to required resource providers: Microsoft.KubernetesConfiguration, Microsoft.Kubernetes, and/or Microsoft.ContainerService

**Solution**:
Register RPs: az provider register --namespace Microsoft.KubernetesConfiguration --wait; az provider register --namespace Microsoft.Kubernetes --wait; az provider register --namespace Microsoft.ContainerService --wait. Verify with az provider show -n <namespace> -o table

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.Flux%20FluxConfiguration%20TSG)]`

## Phase 2: AzureContainerService app/identity does not have p

### aks-716: LinkedAuthorizationFailed error when creating AKS cluster/nodepool with CRG: cli...

**Root Cause**: AzureContainerService app/identity does not have permission to write to the Capacity Reservation Group resource group

**Solution**:
Assign the AKS service principal/managed identity write permission (Contributor role) on the CRG resource group.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Capacity%20Reservation%20Groups)]`

## Phase 3: Microsoft.KubernetesConfiguration resource provide

### aks-1260: Kubernetes marketplace offer deployment fails: AuthorizationFailed - does not ha...

**Root Cause**: Microsoft.KubernetesConfiguration resource provider not registered on the subscription

**Solution**:
Register the Microsoft.KubernetesConfiguration resource provider; check AKS cluster health; examine Azure Monitor activity log

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-failed-kubernetes-deployment-offer)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Flux extension installation or uninstallation fails with AuthorizationFailed err... | Customer subscription not registered to required resource pr... | Register RPs: az provider register --namespace Microsoft.Kub... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.Flux%20FluxConfiguration%20TSG) |
| 2 | LinkedAuthorizationFailed error when creating AKS cluster/nodepool with CRG: cli... | AzureContainerService app/identity does not have permission ... | Assign the AKS service principal/managed identity write perm... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Capacity%20Reservation%20Groups) |
| 3 | Kubernetes marketplace offer deployment fails: AuthorizationFailed - does not ha... | Microsoft.KubernetesConfiguration resource provider not regi... | Register the Microsoft.KubernetesConfiguration resource prov... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-failed-kubernetes-deployment-offer) |
