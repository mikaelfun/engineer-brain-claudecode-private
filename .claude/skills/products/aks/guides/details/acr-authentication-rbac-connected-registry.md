# AKS ACR 认证与 RBAC — connected-registry -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-acr-connected-registry-troubleshooting.md, ado-wiki-azure-arc-enabled-kubernetes.md
**Generated**: 2026-04-07

---

## Phase 1: Previous Connected Registry extension was deleted 

### aks-347: ACR Connected Registry extension created but Connected Registry not in Online st...

**Root Cause**: Previous Connected Registry extension was deleted but the Connected Registry was not deactivated first. Only one active instance is supported at a time

**Solution**:
1) Check pod logs for ALREADY_ACTIVATED error. 2) Run: az acr connected-registry deactivate -n <connected-registry-name> -r <acr-name>. 3) Wait a few minutes for the pod to recreate and the error to disappear

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/Connected Registry)]`

## Phase 2: A previous Connected Registry extension was delete

### aks-349: ACR Connected Registry extension created but registry not in Online state — pod ...

**Root Cause**: A previous Connected Registry extension was deleted and recreated for the same Connected Registry resource, but the old instance was not deactivated first. Only one active instance is supported at a time.

**Solution**:
Run: az acr connected-registry deactivate -n <connected-registry-name> -r <acr-name>. Wait a few minutes for the pod to recreate and the error should resolve.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry)]`

### aks-492: ACR Connected Registry extension created but Connected Registry not reaching 'On...

**Root Cause**: A previous Connected Registry extension was deleted and a new one created for the same Connected Registry without deactivating the old instance first. Only one active instance is supported at any time.

**Solution**:
Run: az acr connected-registry deactivate -n <connected-registry-name> -r <acr-name>. The Connected Registry pod should be recreated within a few minutes and reach Online state.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry)]`

## Phase 3: Persistent Volume Claim cannot bind because the de

### aks-490: ACR Connected Registry Arc extension creation stuck in 'Running' state due to PV...

**Root Cause**: Persistent Volume Claim cannot bind because the desired storage class is not available in the cluster or insufficient storage space

**Solution**:
1) Check PVC status: kubectl get pvc -n connected-registry -o yaml connected-registry-pvc. 2) If storage class missing, recreate extension with --config pvc.storageClassName='standard'. 3) If insufficient space, recreate with --config pvc.storageRequest='250Gi'

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACR Connected Registry extension created but Connected Registry not in Online st... | Previous Connected Registry extension was deleted but the Co... | 1) Check pod logs for ALREADY_ACTIVATED error. 2) Run: az ac... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/ACR/Connected Registry) |
| 2 | ACR Connected Registry extension created but registry not in Online state — pod ... | A previous Connected Registry extension was deleted and recr... | Run: az acr connected-registry deactivate -n <connected-regi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |
| 3 | ACR Connected Registry Arc extension creation stuck in 'Running' state due to PV... | Persistent Volume Claim cannot bind because the desired stor... | 1) Check PVC status: kubectl get pvc -n connected-registry -... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |
| 4 | ACR Connected Registry extension created but Connected Registry not reaching 'On... | A previous Connected Registry extension was deleted and a ne... | Run: az acr connected-registry deactivate -n <connected-regi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FConnected%20Registry) |
