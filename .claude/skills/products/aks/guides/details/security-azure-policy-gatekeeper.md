# AKS Azure Policy — gatekeeper -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Gathering-Azure-Policy-Logs.md, ado-wiki-a-container-taking-long-time-to-provision-failing.md, ado-wiki-azure-network-policy-manager-tsg.md, ado-wiki-how-to-collect-container-logs.md
**Generated**: 2026-04-07

---

## Phase 1: Ratify pod (gatekeeper-system/ratify) does not exi

### aks-671: Image Integrity policy reports 'System error calling external data provider' in ...

**Root Cause**: Ratify pod (gatekeeper-system/ratify) does not exist or is unhealthy on the cluster; Image Integrity addon may not be properly enabled

**Solution**:
1) Check Image Integrity addon enabled via ASI. If not, customer may be using OSS ratify (out of support). 2) If enabled, check ratify pod health: kubectl get pods -n gatekeeper-system. 3) Check logs if unhealthy. 4) If unresolved raise IcM to AKS/Security

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Image%20Integrity)]`

## Phase 2: azure-policy pod in kube-system namespace or gatek

### aks-675: Azure Policy assigned to AKS cluster but policies are not being enforced or appl...

**Root Cause**: azure-policy pod in kube-system namespace or gatekeeper pods in gatekeeper-system namespace are not running, crashing, or throwing errors.

**Solution**:
1) Verify azure-policy pod running: kubectl get pods -n kube-system. 2) Verify gatekeeper pod running: kubectl get pods -n gatekeeper-system. 3) Check logs for errors. For azure-policy pod issues: collab to Azure Policy team (Azure/Azure Policy/Policy behavior not as expected). For gatekeeper pod issues (crashing/restarting): ICM to Support/EEE AKS with gatekeeper audit and controller-manager pod logs.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FAzure%20Policy%2FAzure%20Policy%20Overview)]`

## Phase 3: Container spec missing CPU and memory resource lim

### aks-1223: AKS container deployment denied by Gatekeeper: 'container has no resource/memory...

**Root Cause**: Container spec missing CPU and memory resource limits, causing Azure Policy/Gatekeeper to deny the deployment.

**Solution**:
Add resources.requests and resources.limits (cpu/memory) to all container specs. Check compliance with: kubectl describe k8sazurecontainerlimits. Trigger on-demand rescan via Azure CLI after fixing.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/enforce-container-cpu-memory-limits)]`

## Phase 4: Azure Policy add-on not enabled on the cluster, or

### aks-1222: AKS Deployment Safeguards not taking effect - noncompliant resources deployed wi...

**Root Cause**: Azure Policy add-on not enabled on the cluster, or the target namespace is excluded from safeguards evaluation.

**Solution**:
Verify Azure Policy add-on is enabled: az aks show --query addonProfiles.azurepolicy. Check namespace exclusions: az aks safeguards show. To disable entirely: az aks safeguards delete.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/deployment-safeguards-in-azure-kubernetes-service)]`

## Phase 5: AKS cluster version incompatibility or outdated ve

### aks-1224: Azure Policy reports running container (e.g. Gatekeeper) as ConstraintNotProcess...

**Root Cause**: AKS cluster version incompatibility or outdated version causing Azure Policy constraint processing issues.

**Solution**:
Upgrade the AKS cluster to a newer supported version to resolve the constraint processing compatibility issue.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/error-azure-policy-constraintnotprocessed)]`

## Phase 6: Azure Policy (Gatekeeper) enforces constraints (e.

### aks-1128: az aks command invoke fails with admission webhook validation.gatekeeper.sh deni...

**Root Cause**: Azure Policy (Gatekeeper) enforces constraints (e.g. read-only root filesystem) that the command pod does not satisfy

**Solution**:
Exempt the aks-command namespace from the restrictive Azure Policy assignments via Namespace exclusions parameter, or adjust the policy to allow the command pod configuration

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/resolve-az-aks-command-invoke-failures)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Image Integrity policy reports 'System error calling external data provider' in ... | Ratify pod (gatekeeper-system/ratify) does not exist or is u... | 1) Check Image Integrity addon enabled via ASI. If not, cust... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Image%20Integrity) |
| 2 | Azure Policy assigned to AKS cluster but policies are not being enforced or appl... | azure-policy pod in kube-system namespace or gatekeeper pods... | 1) Verify azure-policy pod running: kubectl get pods -n kube... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FAzure%20Policy%2FAzure%20Policy%20Overview) |
| 3 | AKS container deployment denied by Gatekeeper: 'container has no resource/memory... | Container spec missing CPU and memory resource limits, causi... | Add resources.requests and resources.limits (cpu/memory) to ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/enforce-container-cpu-memory-limits) |
| 4 | AKS Deployment Safeguards not taking effect - noncompliant resources deployed wi... | Azure Policy add-on not enabled on the cluster, or the targe... | Verify Azure Policy add-on is enabled: az aks show --query a... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/deployment-safeguards-in-azure-kubernetes-service) |
| 5 | Azure Policy reports running container (e.g. Gatekeeper) as ConstraintNotProcess... | AKS cluster version incompatibility or outdated version caus... | Upgrade the AKS cluster to a newer supported version to reso... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/error-azure-policy-constraintnotprocessed) |
| 6 | az aks command invoke fails with admission webhook validation.gatekeeper.sh deni... | Azure Policy (Gatekeeper) enforces constraints (e.g. read-on... | Exempt the aks-command namespace from the restrictive Azure ... | [Y] 4.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/resolve-az-aks-command-invoke-failures) |
