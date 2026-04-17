# AKS AAD 集成与认证 — general -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-c-Trusted-Access.md, onenote-aks-jit-access-escort.md
**Generated**: 2026-04-07

---

## Phase 1: LA workspaces with local auth disabled cannot be u

### aks-874: Microsoft Defender publisher pods crash with 403. Log Analytics workspace has lo...

**Root Cause**: LA workspaces with local auth disabled cannot be used with Defender for containers. Defender agent authenticates using local workspace keys.

**Solution**:
Enable local auth: az resource update --ids /subscriptions/{sub}/resourcegroups/{rg}/providers/microsoft.operationalinsights/workspaces/{ws} --api-version 2021-06-01 --set properties.features.disableLocalAuth=False

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Microsoft%20defender%20publisher%20pods%20crashing%20%28OOMKilled%29%20with%20403%20errors)]`

## Phase 2: User lacks necessary Azure IAM role assignment to 

### aks-1012: Running 'az aks get-credentials' fails with: 'The client does not have authoriza...

**Root Cause**: User lacks necessary Azure IAM role assignment to retrieve AKS cluster credentials. The listClusterUserCredential/action permission is required but not assigned.

**Solution**:
Assign user 'Azure Kubernetes Service Cluster User Role' or 'Cluster Admin Role'. Alternative: Owner, Contributor, or custom role with 'Microsoft.ContainerService/managedClusters/listClusterUserCredential/action' or 'listClusterAdminCredentials/action'.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%2FUnable%20to%20retrieve%20cluster%20credentials)]`

## Phase 3: Permission change effective 05/30/2024 - CustomerD

### aks-157: CSS members working on AKS can no longer request JIT at CustomerDataAdministrato...

**Root Cause**: Permission change effective 05/30/2024 - CustomerDataAdministrator level JIT removed for CSS, retained only for EEE and PG

**Solution**:
Use new JIT process: 1) Submit ICM via template O2h2V3; 2) Request JIT via jitaccess.security.core.chinacloudapi.cn; 3) AKS team approves in ~15 min; 4) Receive SAW VM access email

`[Score: [B] 7.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: During a troubleshooting call, it was discovered t

### aks-1315: While installing the Azure monitoring agent on an Azure ARC enabled Kubernetes c...

**Root Cause**: During a troubleshooting call, it was discovered that the infrastructure, which was running on Oracle Linux 9.2, did not auto-load the module required for the MSI adapter running on the pod to alter the nat tables on the node.

**Solution**:
To resolve the issue, the iptable_nat module had to be manually loaded on every node and the node had to be restarted. The command used to load the module is --> sudo modprobe iptable_nat Check if the module is loaded properly --> lsmod | grep iptable_nat

`[Score: [B] 6.5 | Source: [ContentIdea#186299](https://support.microsoft.com/kb/5035315)]`

## Phase 5: Authentication issues or misconfiguration when Def

### aks-1226: azure-defender-publisher DaemonSet pods continually fail and restart after enabl...

**Root Cause**: Authentication issues or misconfiguration when Defender Profile is enabled alongside Azure Policy Add-on for AKS.

**Solution**:
Workaround: Disable Azure Defender profile via REST API PUT call setting securityProfile.azureDefender.enabled=false. Use az account get-access-token to get bearer token, then curl PUT to management.azure.com.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/failure-restart-azure-defender-publisher-daemonset-pods)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Microsoft Defender publisher pods crash with 403. Log Analytics workspace has lo... | LA workspaces with local auth disabled cannot be used with D... | Enable local auth: az resource update --ids /subscriptions/{... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Microsoft%20defender%20publisher%20pods%20crashing%20%28OOMKilled%29%20with%20403%20errors) |
| 2 | Running 'az aks get-credentials' fails with: 'The client does not have authoriza... | User lacks necessary Azure IAM role assignment to retrieve A... | Assign user 'Azure Kubernetes Service Cluster User Role' or ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%2FUnable%20to%20retrieve%20cluster%20credentials) |
| 3 | CSS members working on AKS can no longer request JIT at CustomerDataAdministrato... | Permission change effective 05/30/2024 - CustomerDataAdminis... | Use new JIT process: 1) Submit ICM via template O2h2V3; 2) R... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | While installing the Azure monitoring agent on an Azure ARC enabled Kubernetes c... | During a troubleshooting call, it was discovered that the in... | To resolve the issue, the iptable_nat module had to be manua... | [B] 6.5 | [ContentIdea#186299](https://support.microsoft.com/kb/5035315) |
| 5 | azure-defender-publisher DaemonSet pods continually fail and restart after enabl... | Authentication issues or misconfiguration when Defender Prof... | Workaround: Disable Azure Defender profile via REST API PUT ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/failure-restart-azure-defender-publisher-daemonset-pods) |
