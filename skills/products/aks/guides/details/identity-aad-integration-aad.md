# AKS AAD 集成与认证 — aad -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-b-Troubleshooting-AAD-Integration-Token-Issues.md
**Generated**: 2026-04-07

---

## Phase 1: Old AAD integration deprecated in favor of managed

### aks-102: Legacy AAD integration AKS clusters deprecated; platform auto-upgrades to manage...

**Root Cause**: Old AAD integration deprecated in favor of managed AAD with more features

**Solution**:
Migrate to managed AAD integration before auto-upgrade. New clusters already use managed AAD by default.

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: 未启用 AKS 诊断设置中的 kube-audit 日志，导致集群操作事件未被记录到 Log Ana

### aks-502: 客户需要查看谁在 AKS 集群中创建、删除或修改了 Pod/Service/ServiceAccount 等资源，但无法找到操作记录

**Root Cause**: 未启用 AKS 诊断设置中的 kube-audit 日志，导致集群操作事件未被记录到 Log Analytics workspace。

**Solution**:
在 AKS 诊断设置中启用 kube-audit 类别日志，然后通过 AzureDiagnostics 表查询：AzureDiagnostics | where Category == "kube-audit" | where log_s contains "DELETE" | where log_s contains "<resource-name>"。AAD 集成集群可查看操作用户的 AAD ObjectID，非 AAD 集群可查看发起操作的源 IP 地址。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FViewing%20events%20in%20an%20AKS%20cluster)]`

## Phase 3: Starting with Kubernetes 1.24, the default cluster

### aks-524: Error 'getting credentials: exec: executable kubelogin not found' when running k...

**Root Cause**: Starting with Kubernetes 1.24, the default clusterUser credential format for AAD-enabled clusters changed to 'exec', which requires the kubelogin binary in PATH

**Solution**:
Install kubelogin from https://github.com/Azure/kubelogin. Alternatively, use `az aks get-credentials --format azure` to get the old format kubeconfig that does not require kubelogin

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FAAD%20integrated%20AKS%20Cluster%20Authorization%20%26%20Authentication%20mechanism%20and%20related%20troubleshooting)]`

## Phase 4: Cached credential token exists at ~/.kube/cache/ku

### aks-526: AAD-integrated AKS cluster does not prompt for device login authentication after...

**Root Cause**: Cached credential token exists at ~/.kube/cache/kubelogin/AzurePublicCloud-*.json and has not expired yet

**Solution**:
Delete the cached .json file under ~/.kube/cache/kubelogin/ directory to force re-authentication via device login

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FAAD%20integrated%20AKS%20Cluster%20Authorization%20%26%20Authentication%20mechanism%20and%20related%20troubleshooting)]`

## Phase 5: Starting with K8s 1.24, AAD-integrated clusters us

### aks-871: Running kubectl commands against AAD-integrated AKS cluster on Kubernetes 1.24+ ...

**Root Cause**: Starting with K8s 1.24, AAD-integrated clusters use exec-based credential plugin (kubelogin) instead of legacy azure auth plugin. Recent kubectl versions removed the built-in plugin.

**Solution**:
1) Install kubelogin: az aks install-cli or download from https://github.com/Azure/kubelogin/releases. 2) Convert kubeconfig: kubelogin convert-kubeconfig. On Windows use Install-AzAksCliTool.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Kubelogin%20requirements%20for%201.24%2B)]`

## Phase 6: Conditional access policy requires MFA for all dev

### aks-1006: Users unable to authenticate to AAD-integrated AKS cluster. Error: 'Failed to ac...

**Root Cause**: Conditional access policy requires MFA for all devices. This blocks applications and build environments (Azure DevOps, GitHub Actions) where MFA interactive prompt is not possible.

**Solution**:
Update the conditional access policy to exclude impacted users, applications, or platforms from MFA requirements. Alternatively, adjust conditions to exclude specific devices/platforms used to access the AKS cluster.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%20integrated%20with%20AKS%20-%20%20%20MFA%20enabled)]`

## Phase 7: AKS cluster was created with RBAC disabled. RBAC c

### aks-1008: Enabling AAD on AKS cluster fails: 'az aks update --enable-aad --enable-azure-rb...

**Root Cause**: AKS cluster was created with RBAC disabled. RBAC cannot be enabled on an existing non-RBAC cluster. AAD integration requires RBAC as prerequisite - this is a fundamental platform limitation.

**Solution**:
Create a new AKS cluster with RBAC enabled and migrate workloads. Verify RBAC status: 'az aks show -g <rg> -n <cluster> -o tsv --query enableRbac'. No way to enable RBAC on existing non-RBAC cluster.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%2FAKS%20RBAC%20Enablement%20Limitation)]`

## Phase 8: The logged-in user may not have required permissio

### aks-525: Error 'The azure auth plugin has been removed' when running kubectl commands aga...

**Root Cause**: The logged-in user may not have required permissions to run the kubelogin utility, or kubelogin is not properly installed/in PATH

**Solution**:
Check if the user has permissions to execute kubelogin. Try running with elevated/root privileges to narrow down. Ensure kubelogin binary is in PATH and executable

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FAAD%20integrated%20AKS%20Cluster%20Authorization%20%26%20Authentication%20mechanism%20and%20related%20troubleshooting)]`

## Phase 9: Starting from Kubernetes 1.24, the in-tree Azure a

### aks-081: After upgrading AKS to 1.24+, kubectl commands fail with error: The azure auth p...

**Root Cause**: Starting from Kubernetes 1.24, the in-tree Azure auth plugin is removed. AAD-enabled AKS clusters now require kubelogin for authentication. Default credential format changed from azure to exec format requiring kubelogin binary in PATH.

**Solution**:
1) Install kubelogin from https://github.com/Azure/kubelogin. 2) Run kubelogin convert-kubeconfig. 3) Interactive: device code or web browser. 4) Non-interactive/CI: kubelogin convert-kubeconfig -l spn with SP env vars. 5) China/Mooncake: https://docs.azure.cn/zh-cn/aks/kubelogin-authentication. 6) Workaround: pass format=azure to get old kubeconfig temporarily.

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 10: Microsoft Entra ID account lacks required RBAC per

### aks-1140: Error from server (Forbidden): resource is forbidden: User cannot list resource ...

**Root Cause**: Microsoft Entra ID account lacks required RBAC permissions. Depends on cluster RBAC type: local K8s RBAC, K8s RBAC with AAD integration, or Azure RBAC.

**Solution**:
Check RBAC type: az aks show --query aadProfile.enableAzureRbac. For local RBAC: use --admin credentials. For K8s RBAC: create RoleBinding/ClusterRoleBinding or add user to AAD admin group. For Azure RBAC: assign AKS built-in roles.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/user-cannot-get-cluster-resources)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Legacy AAD integration AKS clusters deprecated; platform auto-upgrades to manage... | Old AAD integration deprecated in favor of managed AAD with ... | Migrate to managed AAD integration before auto-upgrade. New ... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | 客户需要查看谁在 AKS 集群中创建、删除或修改了 Pod/Service/ServiceAccount 等资源，但无法找到操作记录 | 未启用 AKS 诊断设置中的 kube-audit 日志，导致集群操作事件未被记录到 Log Analytics wor... | 在 AKS 诊断设置中启用 kube-audit 类别日志，然后通过 AzureDiagnostics 表查询：Azur... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FViewing%20events%20in%20an%20AKS%20cluster) |
| 3 | Error 'getting credentials: exec: executable kubelogin not found' when running k... | Starting with Kubernetes 1.24, the default clusterUser crede... | Install kubelogin from https://github.com/Azure/kubelogin. A... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FAAD%20integrated%20AKS%20Cluster%20Authorization%20%26%20Authentication%20mechanism%20and%20related%20troubleshooting) |
| 4 | AAD-integrated AKS cluster does not prompt for device login authentication after... | Cached credential token exists at ~/.kube/cache/kubelogin/Az... | Delete the cached .json file under ~/.kube/cache/kubelogin/ ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FAAD%20integrated%20AKS%20Cluster%20Authorization%20%26%20Authentication%20mechanism%20and%20related%20troubleshooting) |
| 5 | Running kubectl commands against AAD-integrated AKS cluster on Kubernetes 1.24+ ... | Starting with K8s 1.24, AAD-integrated clusters use exec-bas... | 1) Install kubelogin: az aks install-cli or download from ht... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Kubelogin%20requirements%20for%201.24%2B) |
| 6 | Users unable to authenticate to AAD-integrated AKS cluster. Error: 'Failed to ac... | Conditional access policy requires MFA for all devices. This... | Update the conditional access policy to exclude impacted use... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%20integrated%20with%20AKS%20-%20%20%20MFA%20enabled) |
| 7 | Enabling AAD on AKS cluster fails: 'az aks update --enable-aad --enable-azure-rb... | AKS cluster was created with RBAC disabled. RBAC cannot be e... | Create a new AKS cluster with RBAC enabled and migrate workl... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%2FAKS%20RBAC%20Enablement%20Limitation) |
| 8 | Error 'The azure auth plugin has been removed' when running kubectl commands aga... | The logged-in user may not have required permissions to run ... | Check if the user has permissions to execute kubelogin. Try ... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FAAD%20integrated%20AKS%20Cluster%20Authorization%20%26%20Authentication%20mechanism%20and%20related%20troubleshooting) |
| 9 | After upgrading AKS to 1.24+, kubectl commands fail with error: The azure auth p... | Starting from Kubernetes 1.24, the in-tree Azure auth plugin... | 1) Install kubelogin from https://github.com/Azure/kubelogin... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 10 | Error from server (Forbidden): resource is forbidden: User cannot list resource ... | Microsoft Entra ID account lacks required RBAC permissions. ... | Check RBAC type: az aks show --query aadProfile.enableAzureR... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/user-cannot-get-cluster-resources) |
