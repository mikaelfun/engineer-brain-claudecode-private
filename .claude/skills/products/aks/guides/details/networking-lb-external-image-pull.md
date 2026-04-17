# AKS 外部负载均衡器与 SNAT — image-pull -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 2 | **Kusto queries**: 1
**Source drafts**: ado-wiki-a-ErrImagePull-ImagePullBackOff-Status.md, ado-wiki-a-image-cleaner.md
**Kusto references**: image-integrity.md
**Generated**: 2026-04-07

---

## Phase 1: Third-party firewall performing SSL deep packet in

### aks-744: ControlPlaneAddOnsNotReady during CRUD/Start operations. kube-proxy pods stuck i...

**Root Cause**: Third-party firewall performing SSL deep packet inspection intercepts and re-signs TLS certificates for container image pulls, causing x509 certificate validation failure on AKS nodes.

**Solution**:
Ask customer to disable SSL packet inspection on firewall for traffic to mcr.microsoft.com and container registries, then retry. Verify via SSH/node-shell into affected node checking kubelet/containerd logs for x509 errors.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending)]`

## Phase 2: Windows2022 nodes cannot host and run Windows2019 

### aks-806: Pod fails with ImagePullBackOff or ErrImagePull on Windows2022 node: 'Back-off p...

**Root Cause**: Windows2022 nodes cannot host and run Windows2019 (ltsc2019) container images due to OS version incompatibility. Windows container images are strictly OS-version specific.

**Solution**:
Update the application container image from Windows2019 base (e.g., mcr.microsoft.com/windows/servercore:ltsc2019) to Windows2022 equivalent (mcr.microsoft.com/windows/servercore:ltsc2022). Follow migration guide: https://learn.microsoft.com/en-us/azure/aks/upgrade-windows-2019-2022

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Retirements)]`

## Phase 3: Third-party firewall or network appliance performi

### aks-950: ControlPlaneAddOnsNotReady error during CRUD/Start operations: kube-proxy pods s...

**Root Cause**: Third-party firewall or network appliance performing SSL/TLS deep packet inspection (DPI) between AKS nodes and MCR, inserting its own certificate. Containerd/kubelet rejects the substituted certificate as untrusted.

**Solution**:
1) SSH/node-shell into the affected node, check kubelet logs for x509 certificate errors; 2) Ask customer to temporarily disable SSL packet inspection on their firewall/proxy for MCR endpoints; 3) Retry the cluster operation after disabling DPI.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending)]`

## Phase 4: Mooncake container registry proxy servers (per reg

### aks-062: AKS image pull from container registry proxy (mirror.azk8s.cn) is slow or fails ...

**Root Cause**: Mooncake container registry proxy servers (per region) pull images from Global Azure proxy (West US2) which in turn pull from public registries. Three common causes: 1) First-time pull of uncached image requires multi-hop fetch (Mooncake→Global→source registry), 2) Customer-side network issues, 3) Proxy server overload (high CPU >50% or high traffic >1GB Network Out).

**Solution**:
1) Check Zabbix alerts for 'too many active nginx connections' on proxy VMs. 2) Check Jarvis metrics for Network Out Mbps (Max) >1GB on Mooncake proxy VMs in the customer's region (ChinaEast2: east2mirror/east2mirror2-5, ChinaNorth2: north2mirror/north2mirror2-3). 3) Check CPU utilization >50% on Mooncake proxies, then Global Azure proxies (West US2: chinamirror/chinamirror-secondary/chinamirror3). 4) If proxy overload confirmed, raise Sev.2 ICM to AKS PG with findings. 5) Note: proxy only accessible from Azure China IPs; whitelist requests go to akscn@microsoft.com.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.7]]`

## Phase 5: AKS nodes lack the self-signed CA certificate in t

### aks-1024: Image pulls from private container registries with self-signed certs fail: 'x509...

**Root Cause**: AKS nodes lack the self-signed CA certificate in trust store (/etc/ssl/certs/ca-certificates.crt). Private registry self-signed cert not in default trusted CA bundle, causing TLS handshake failure.

**Solution**:
Option 1 (Preferred): Use AKS Custom Certificate Authority feature to add custom CA to all nodes' trust store. Option 2: Deploy DaemonSet to copy CA cert to nodes, run update-ca-certificates, restart containerd. Also configure ImagePullSecret for registry auth.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FTLS%20Connectivity%20Errors%20From%20AKS%20to%20Private%20Container%20Registries)]`

## Phase 6: WS2019 container images are not compatible with Wi

### aks-1077: Pods on WindowsAnnual AKS nodes fail with ImagePullBackOff/ErrImagePull using WS...

**Root Cause**: WS2019 container images are not compatible with WindowsAnnual nodes. WindowsAnnual cannot host WS2019 images.

**Solution**:
Option 1: Change node-selector to kubernetes.azure.com/os-sku: Windows2019 to run on WS2019 nodes. Option 2: Update images to WS2022 base (mcr.microsoft.com/windows/servercore:ltsc2022) for WindowsAnnual nodes.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%20Annual%20Channel)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ControlPlaneAddOnsNotReady during CRUD/Start operations. kube-proxy pods stuck i... | Third-party firewall performing SSL deep packet inspection i... | Ask customer to disable SSL packet inspection on firewall fo... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending) |
| 2 | Pod fails with ImagePullBackOff or ErrImagePull on Windows2022 node: 'Back-off p... | Windows2022 nodes cannot host and run Windows2019 (ltsc2019)... | Update the application container image from Windows2019 base... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Retirements) |
| 3 | ControlPlaneAddOnsNotReady error during CRUD/Start operations: kube-proxy pods s... | Third-party firewall or network appliance performing SSL/TLS... | 1) SSH/node-shell into the affected node, check kubelet logs... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending) |
| 4 | AKS image pull from container registry proxy (mirror.azk8s.cn) is slow or fails ... | Mooncake container registry proxy servers (per region) pull ... | 1) Check Zabbix alerts for 'too many active nginx connection... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.7] |
| 5 | Image pulls from private container registries with self-signed certs fail: 'x509... | AKS nodes lack the self-signed CA certificate in trust store... | Option 1 (Preferred): Use AKS Custom Certificate Authority f... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FTLS%20Connectivity%20Errors%20From%20AKS%20to%20Private%20Container%20Registries) |
| 6 | Pods on WindowsAnnual AKS nodes fail with ImagePullBackOff/ErrImagePull using WS... | WS2019 container images are not compatible with WindowsAnnua... | Option 1: Change node-selector to kubernetes.azure.com/os-sk... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%20Annual%20Channel) |
