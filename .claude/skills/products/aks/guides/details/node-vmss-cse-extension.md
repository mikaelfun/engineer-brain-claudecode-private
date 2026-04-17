# AKS VMSS CSE 与节点启动 — extension -- Comprehensive Troubleshooting Guide

**Entries**: 9 | **Draft sources**: 3 | **Kusto queries**: 2
**Source drafts**: ado-wiki-a-Marketplace-Kubernetes-Apps.md, ado-wiki-a-Windows-Node-Extension.md, ado-wiki-vmss-cse-exit-codes.md
**Kusto references**: extension-manager.md, node-fabric-info.md
**Generated**: 2026-04-07

---

## Phase 1: Microsoft.Kubernetes and Microsoft.KubernetesConfi

### aks-535: ML extension deployment fails with permission error on a new subscription. Error...

**Root Cause**: Microsoft.Kubernetes and Microsoft.KubernetesConfiguration resource providers are not registered on the subscription.

**Solution**:
Register the required providers: az provider register --namespace Microsoft.Kubernetes && az provider register --namespace Microsoft.KubernetesConfiguration

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20ML(Azure%20Machine%20Learning)%20TSG)]`

## Phase 2: Extension Manager not deployed correctly in AKS cl

### aks-686: Azure Backup Extension fails to install on AKS cluster or dataprotection-microso...

**Root Cause**: Extension Manager not deployed correctly in AKS cluster, or Azure Backup deployment (dataprotection-microsoft) fails due to AKS platform issue or network connectivity issue.

**Solution**:
1) Check if Extension Manager is deployed. 2) Check dataprotection-microsoft pods: kubectl get pods -n dataprotection-microsoft. 3) Check extension-agent and extension-operator pods in kube-system. 4) Follow Extension installation TSG (aka.ms/k8s-extensions-TSG). For extension issues: ICM to K8s Connect RP (Cluster Configuration/Cluster Configuration Triage). For backup-specific issues: ICM to ABRS using AKS Backup CRI Diagnostic Template.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FAzure%20backup%20extension)]`

## Phase 3: Dapr extension not GA in Mooncake. No regions supp

### aks-130: Dapr extension not available on AKS in Mooncake; az k8s-extension create --exten...

**Root Cause**: Dapr extension not GA in Mooncake. No regions supported. No ETA (ICM 505882649, 2024-05-24)

**Solution**:
Use self-managed Dapr via Helm chart as workaround. Monitor AKS release notes for Mooncake availability

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Azure App Configuration Kubernetes Provider alread

### aks-1251: Azure App Configuration extension installation fails with Resource already exist...

**Root Cause**: Azure App Configuration Kubernetes Provider already installed via helm install; CRD ownership metadata conflicts with extension installation

**Solution**:
Uninstall Azure App Configuration Kubernetes Provider first (clean up resources), then install the AKS extension

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-app-configuration-extension-installation-errors)]`

## Phase 5: Azure App Configuration extension not available in

### aks-1253: Azure App Configuration extension fails with Extension type microsoft.appconfigu...

**Root Cause**: Azure App Configuration extension not available in the specified AKS region

**Solution**:
Install in a supported region that the cluster extension supports

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-app-configuration-extension-installation-errors)]`

## Phase 6: Wrong key used in configuration settings (e.g., gl

### aks-1254: Dapr extension installation fails with no visible error message; extension statu...

**Root Cause**: Wrong key used in configuration settings (e.g., global.ha=false instead of global.ha.enabled=false), or extension-immutable-values configMap not found

**Solution**:
Inspect error via az k8s-extension list --cluster-type managedClusters; fix config key names; restart cluster; register KubernetesConfiguration service provider; or force delete and reinstall Dapr extension

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors)]`

## Phase 7: Dapr version not available in the specified Azure 

### aks-1256: Dapr extension install fails: ExtensionTypeRegistrationGetFailed - Extension typ...

**Root Cause**: Dapr version not available in the specified Azure region

**Solution**:
Install Dapr extension in a region where the target version is supported

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors)]`

## Phase 8: Extension resource installation failure or incorre

### aks-1262: Kubernetes marketplace offer: Extension failed to deploy with Internal server er...

**Root Cause**: Extension resource installation failure or incorrect Helm chart values in ARM template

**Solution**:
For internal server error: delete extension resource and reinstall. For Helm chart failure: verify values in Azure portal ARM template deployment

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-failed-kubernetes-deployment-offer)]`

## Phase 9: aks-preview extension v0.4.23 is incompatible with

### aks-055: az aks commands fail or behave unexpectedly after installing aks-preview extensi...

**Root Cause**: aks-preview extension v0.4.23 is incompatible with azure-cli 2.0.76 installed via yum package azure-cli-2.0.76-1.el7.x86_64. Additionally, aks-preview or newer azure-cli versions default --vm-set-type to vmss which may not be supported in all regions.

**Solution**:
1) Uninstall aks-preview extension if not needed: az extension remove --name aks-preview. 2) If using aks-preview, always explicitly specify --vm-set-type (AvailabilitySet or VirtualMachineScaleSets) in az aks create/update commands to avoid defaulting to unsupported type. 3) Check GitHub issue: https://github.com/Azure/azure-cli/issues/11206

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ML extension deployment fails with permission error on a new subscription. Error... | Microsoft.Kubernetes and Microsoft.KubernetesConfiguration r... | Register the required providers: az provider register --name... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20ML(Azure%20Machine%20Learning)%20TSG) |
| 2 | Azure Backup Extension fails to install on AKS cluster or dataprotection-microso... | Extension Manager not deployed correctly in AKS cluster, or ... | 1) Check if Extension Manager is deployed. 2) Check dataprot... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FAzure%20backup%20extension) |
| 3 | Dapr extension not available on AKS in Mooncake; az k8s-extension create --exten... | Dapr extension not GA in Mooncake. No regions supported. No ... | Use self-managed Dapr via Helm chart as workaround. Monitor ... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Azure App Configuration extension installation fails with Resource already exist... | Azure App Configuration Kubernetes Provider already installe... | Uninstall Azure App Configuration Kubernetes Provider first ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-app-configuration-extension-installation-errors) |
| 5 | Azure App Configuration extension fails with Extension type microsoft.appconfigu... | Azure App Configuration extension not available in the speci... | Install in a supported region that the cluster extension sup... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-app-configuration-extension-installation-errors) |
| 6 | Dapr extension installation fails with no visible error message; extension statu... | Wrong key used in configuration settings (e.g., global.ha=fa... | Inspect error via az k8s-extension list --cluster-type manag... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors) |
| 7 | Dapr extension install fails: ExtensionTypeRegistrationGetFailed - Extension typ... | Dapr version not available in the specified Azure region | Install Dapr extension in a region where the target version ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors) |
| 8 | Kubernetes marketplace offer: Extension failed to deploy with Internal server er... | Extension resource installation failure or incorrect Helm ch... | For internal server error: delete extension resource and rei... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-failed-kubernetes-deployment-offer) |
| 9 | az aks commands fail or behave unexpectedly after installing aks-preview extensi... | aks-preview extension v0.4.23 is incompatible with azure-cli... | 1) Uninstall aks-preview extension if not needed: az extensi... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
