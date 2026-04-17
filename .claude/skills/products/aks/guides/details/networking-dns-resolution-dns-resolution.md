# AKS DNS 解析排查 — dns-resolution -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-ampls-how-to-guide.md
**Generated**: 2026-04-07

---

## Phase 1: The br_netfilter kernel module is not loaded on th

### aks-424: DNS resolution fails inside pods on AKS cluster with BYO CNI (network-plugin=non...

**Root Cause**: The br_netfilter kernel module is not loaded on the worker nodes. This module is required for iptables-based kube-proxy to correctly intercept and redirect Service ClusterIP traffic (including DNS to kube-dns at 10.20.0.10)

**Solution**:
Load the br_netfilter kernel module on all worker nodes: sudo modprobe br_netfilter. To make it persistent: sudo sh -c 'echo "br_netfilter" > /etc/modules-load.d/br_netfilter.conf'. Verify with: sudo lsmod | grep br_netfilter

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FBYO%20CNI%20with%20AKS)]`

## Phase 2: Known issue with stop/start preview feature. After

### aks-245: AKS stop/start (preview): node cannot resolve DNS record of API server, fails wi...

**Root Cause**: Known issue with stop/start preview feature. After restart nodes may not properly receive updated API server DNS record causing CustomScriptExtension failure with error 52.

**Solution**:
Known preview limitation. Check TSG: msazure.visualstudio.com/CloudNativeCompute/_wiki TSG-Start-Stop-Cluster. Wait for GA fix or redeploy nodes if issue persists.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: AKS agent node fails to resolve API server FQDN. R

### aks-210: AKS node shows NotReady status. Node cannot communicate with API server; error i...

**Root Cause**: AKS agent node fails to resolve API server FQDN. Root cause varies: custom DNS misconfiguration, DNS forwarding chain broken, VNet DNS settings pointing to unreachable server, or transient Azure DNS issue.

**Solution**:
SSH/exec into node and test DNS: nslookup <api-server-fqdn>. Check VNet DNS settings ensure custom DNS can resolve AKS API server FQDN. Verify DNS forwarding to 168.63.129.16. Check /etc/resolv.conf. If persistent, cordon/drain and recreate the node.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Azure Monitor Private Link Scope (AMPLS) is missin

### aks-992: Private AKS cluster: Container Insights shows no logs/metrics. AMA pods (ama-log...

**Root Cause**: Azure Monitor Private Link Scope (AMPLS) is missing or misconfigured. Private AKS clusters cannot reach Azure Monitor public endpoints. Without AMPLS: no private endpoints created, DNS cannot resolve privatelink endpoints, public network access rejected, and data plane Private Link ID validation fails.

**Solution**:
1) Validate DNS inside AKS node: nslookup <workspaceId>.ods.opinsights.azure.com (should return private IP). 2) Check AMPLS resource mapping: add Log Analytics Workspace, Application Insights, DCE, Managed Prometheus. 3) Validate Private Endpoint status=Approved. 4) Ensure Private DNS zones (privatelink.monitor.azure.com, privatelink.ods.opinsights.azure.com) linked to AKS VNet. 5) For custom DNS add forwarders to 168.63.129.16. 6) Set workspace to Private Only. 7) Restart: kubectl rollout restart ds/ama-logs ds/ama-metrics -n kube-system.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Private%20AKS%20Azure%20Monitor%20Logging%20Not%20Working%20Without%20AMPLS)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | DNS resolution fails inside pods on AKS cluster with BYO CNI (network-plugin=non... | The br_netfilter kernel module is not loaded on the worker n... | Load the br_netfilter kernel module on all worker nodes: sud... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FBYO%20CNI%20with%20AKS) |
| 2 | AKS stop/start (preview): node cannot resolve DNS record of API server, fails wi... | Known issue with stop/start preview feature. After restart n... | Known preview limitation. Check TSG: msazure.visualstudio.co... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS node shows NotReady status. Node cannot communicate with API server; error i... | AKS agent node fails to resolve API server FQDN. Root cause ... | SSH/exec into node and test DNS: nslookup <api-server-fqdn>.... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Private AKS cluster: Container Insights shows no logs/metrics. AMA pods (ama-log... | Azure Monitor Private Link Scope (AMPLS) is missing or misco... | 1) Validate DNS inside AKS node: nslookup <workspaceId>.ods.... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Private%20AKS%20Azure%20Monitor%20Logging%20Not%20Working%20Without%20AMPLS) |
