# AKS 节点配置错误 -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 9 | **Kusto queries**: 1
**Source drafts**: ado-wiki-b-Non-Cilium-Metrics-Basic.md, ado-wiki-d-Basic-Metrics-TSG.md, ado-wiki-d-Cilium-Metrics-Basic.md, ado-wiki-d-Metrics-Cilium-Advanced.md, ado-wiki-d-Metrics-Non-Cilium-Advanced.md, ado-wiki-d-Windows-GPU.md, ado-wiki-time-slicing-gpu-aks.md, mslearn-custom-kubelet-windows-known-issues.md, onenote-aks-prometheus-grafana-setup.md
**Kusto references**: node-fabric-info.md
**Generated**: 2026-04-07

---

## Phase 1: Kubelet log compression bug on Windows in k8s vers

### aks-715: Container logs do not get rotated upon hitting --container-log-max-size on Windo...

**Root Cause**: Kubelet log compression bug on Windows in k8s versions prior to v1.23.13, v1.24.7, and v1.25.0. Fixed in kubernetes/kubernetes#111548. Even after patching, heavy log writes may still cause rotation delays (upstream issue #110630)

**Solution**:
Upgrade k8s version to v1.23.15+ or v1.24.9+ or v1.25.0+. If logs still do not rotate after upgrade during heavy writes: restart containers, use higher disk I/O throughput VMs, or redirect logs to persistent volume

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Custom%20Node%20Config)]`

## Phase 2: Possible causes: (1) Identity lacks Contributor ro

### aks-732: Kaito workspace RESOURCEREADY condition not true after 10+ minutes; GPU node nev...

**Root Cause**: Possible causes: (1) Identity lacks Contributor role on resource group, (2) Subscription lacks GPU SKU quota, (3) GPU instance type unavailable in region

**Solution**:
Check machine CR status for errors. Verify role assignment: az role assignment list --scope /subscriptions/$SUB/resourceGroups/$RG. Request quota increase if needed. Check GPU SKU regional availability.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/AI%20Toolchain%20Operator%20%28Kaito%29)]`

## Phase 3: AKS does not include Prometheus/Grafana by default

### aks-038: Customer needs Prometheus + Grafana monitoring stack on AKS cluster for pod/node...

**Root Cause**: AKS does not include Prometheus/Grafana by default (before Azure Monitor managed Prometheus); Helm community charts provide quick deployment

**Solution**:
1) helm repo add prometheus-community https://prometheus-community.github.io/helm-charts && helm repo add grafana https://grafana.github.io/helm-charts && helm repo update; 2) kubectl create namespace monitoring; 3) helm install prometheus prometheus-community/prometheus --namespace monitoring --set alertmanager.persistentVolume.storageClass=default --set server.persistentVolume.storageClass=default; 4) Create grafana.yaml datasource pointing to http://prometheus-server.monitoring.svc.cluster.local; 5) helm install grafana grafana/grafana --namespace monitoring --set persistence.storageClassName=default --set persistence.enabled=true --set adminPassword=YourPassword --values grafana.yaml --set service.type=LoadBalancer; 6) Get LoadBalancer IP, login admin/password, import prebuilt dashboard template by ID. NOTE for Mooncake: chart images may need mirroring if public registries are blocked

`[Score: [B] 5.5 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1]]`

## Phase 4: GPU quota limitations in subscription or region pr

### aks-1249: GPU node not created by KAITO gpu-provisioner controller; machine CR shows quota...

**Root Cause**: GPU quota limitations in subscription or region prevent node provisioning

**Solution**:
Request quota increase for GPU VM family via Azure portal; check GPU instance availability in region; consider switching region or GPU VM size

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-ai-toolchain-operator-addon-issues)]`

## Phase 5: Unsigned kernel module (e.g., GPU driver) cannot b

### aks-1052: AKS node creation times out. Logs show: The kernel module failed to load. Secure...

**Root Cause**: Unsigned kernel module (e.g., GPU driver) cannot be loaded when Secure Boot is enabled on Trusted Launch nodes. CSE attempts to install unsigned driver during node provisioning, causing timeout.

**Solution**:
Disable secure boot on the nodepool (az aks nodepool update --disable-secure-boot). For GPU nodepools specifically, install NVIDIA GPU Operator: https://learn.microsoft.com/en-us/azure/aks/gpu-cluster?tabs=add-ubuntu-gpu-node-pool#use-nvidia-gpu-operator-with-aks

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Trusted%20Launch)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Container logs do not get rotated upon hitting --container-log-max-size on Windo... | Kubelet log compression bug on Windows in k8s versions prior... | Upgrade k8s version to v1.23.15+ or v1.24.9+ or v1.25.0+. If... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Custom%20Node%20Config) |
| 2 | Kaito workspace RESOURCEREADY condition not true after 10+ minutes; GPU node nev... | Possible causes: (1) Identity lacks Contributor role on reso... | Check machine CR status for errors. Verify role assignment: ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/AI%20Toolchain%20Operator%20%28Kaito%29) |
| 3 | Customer needs Prometheus + Grafana monitoring stack on AKS cluster for pod/node... | AKS does not include Prometheus/Grafana by default (before A... | 1) helm repo add prometheus-community https://prometheus-com... | [B] 5.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 4 | GPU node not created by KAITO gpu-provisioner controller; machine CR shows quota... | GPU quota limitations in subscription or region prevent node... | Request quota increase for GPU VM family via Azure portal; c... | [Y] 4.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-ai-toolchain-operator-addon-issues) |
| 5 | AKS node creation times out. Logs show: The kernel module failed to load. Secure... | Unsigned kernel module (e.g., GPU driver) cannot be loaded w... | Disable secure boot on the nodepool (az aks nodepool update ... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Trusted%20Launch) |
