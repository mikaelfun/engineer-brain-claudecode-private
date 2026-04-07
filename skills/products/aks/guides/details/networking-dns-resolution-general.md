# AKS DNS 解析排查 — general -- Comprehensive Troubleshooting Guide

**Entries**: 12 | **Draft sources**: 33 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-AGIC-Troubleshooting-Guide.md, ado-wiki-a-AGIC-Troubleshooting-SSL-Configuration-Issues.md, ado-wiki-a-AKS-Storage-Troubleshooting-Methodology.md, ado-wiki-a-CIFS-Credits-Troubleshooting.md, ado-wiki-a-VM-Restart-Troubleshooting-guideline.md, ado-wiki-a-Windows-Node-Troubleshooting-Tips.md, ado-wiki-a-Windows-On-AKS.md, ado-wiki-a-aci-terminologies-troubleshooting.md, ado-wiki-a-agic-troubleshooting-404.md, ado-wiki-a-agic-troubleshooting-502.md
**Generated**: 2026-04-07

---

## Phase 1: Azure Linux (RPM-based) stores certificates at /et

### aks-945: AKS Azure Linux: container fails with certificate errors because /etc/ssl/certs ...

**Root Cause**: Azure Linux (RPM-based) stores certificates at /etc/pki/tls/certs with /etc/ssl/certs as a symlink. Containers mapping only /etc/ssl/certs get a dangling symlink since /etc/pki is not mapped.

**Solution**:
Map /etc/pki into the container using a hostPath volume with type DirectoryOrCreate. This works on both Ubuntu and Azure Linux hosts.

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Linux%20%28Mariner%29)]`

## Phase 2: Legacy external-dns deployment was not scaled down

### aks-223: After AKS underlay cluster migration, DNS records keep resetting to original gat...

**Root Cause**: Legacy external-dns deployment was not scaled down during migration

**Solution**:
Scale down or delete legacy external-dns deployment after migration

`[Score: [B] 7.5 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 3: AKS Stop 时 API Server DNS A 记录被删除，Azure Firewall D

### aks-494: AKS 集群 Start 操作间歇性失败，节点 vmssCSE 扩展报 apiserverCurl 超时(exit code 51)；环境使用 Azure Fi...

**Root Cause**: AKS Stop 时 API Server DNS A 记录被删除，Azure Firewall DNS Proxy 缓存 NXDOMAIN 为 negative cache (TTL=300s)。集群 Start 时 A 记录重新注册，但 Firewall 仍引用过期的 NXDOMAIN 缓存，导致 FQDN-based network rule 无法放行到 API Server 的流量

**Solution**:
方案1: 将 FQDN-based network rule 改为 Application rule (只检查 HTTP Host header，不触发 DNS 解析)；方案2: 将 network rule destination 改为 Service Tag AzureCloud.[region]，避免 DNS Proxy 查询 API Server FQDN

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FStart%20and%20Stop%2FAKS%20start%20fails%20due%20to%20azfw%20dnsproxy)]`

## Phase 4: API server authorized IP ranges (apiServerAccessPr

### aks-539: Public AKS cluster: kubectl hangs and times out, DNS resolves correctly to publi...

**Root Cause**: API server authorized IP ranges (apiServerAccessProfile.authorizedIpRanges) are enabled but the client's actual egress/NAT IP is not in the allow list. Common pitfall: ifconfig.me may show a different IP than the actual egress IP seen by Azure when behind VPN/corporate proxy/firewall NAT.

**Solution**:
1) Check authorized IP ranges: az aks show -g <rg> -n <aks> --query apiServerAccessProfile.authorizedIpRanges; 2) Find actual egress IP: curl -s ifconfig.me (or check Azure portal NSG inbound rule 'My IP address' auto-populate); 3) Append IP to allow list: EXISTING=$(az aks show -g <rg> -n <aks> --query 'apiServerAccessProfile.authorizedIpRanges[]' -o tsv | paste -sd,) && az aks update -g <rg> -n <aks> --api-server-authorized-ip-ranges "$EXISTING,$MY_IP/32". WARNING: --api-server-authorized-ip-ranges REPLACES the entire list, always append.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTSG%3A%20AKS%20-%20Troubleshooting%20Cluster%20API%20Connectivity%20Issues%20(Start%20Here%20Workflow)%2F%5BTSG%5D%20AKS%20API%20Connectivity%20-%20Hands-On%20Labs)]`

## Phase 5: Calico Open Source on AKS is supported by Microsof

### aks-559: AKS with Calico network policy — advanced or complex Calico issues cannot be res...

**Root Cause**: Calico Open Source on AKS is supported by Microsoft on a best-effort basis only. Advanced troubleshooting, enterprise features, or issues beyond Azure platform scope require Tigera (the company behind Calico) paid support.

**Solution**:
1) For best-effort: collect Calico component logs (kubectl logs calico-node -n kube-system), iptables-save, ipset -L; 2) For Windows nodes: SSH to node, collect logs via MonitorWindowsNode.ps1 script, run netsh trace capture; 3) Dispatch collab to Windows OS networking for capture analysis; 4) For advanced issues: direct customer to Tigera paid support at tigera.io; 5) Enterprise Calico upgrade contact: PDM Sara Gheyouche / Kelsey Gibbons.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Calico)]`

## Phase 6: NVA, firewall, or proxy blocking outbound access t

### aks-589: AKS node provisioning fails with vmssCSE exit code 31 (ERR_K8S_DOWNLOAD_TIMEOUT)...

**Root Cause**: NVA, firewall, or proxy blocking outbound access to acs-mirror.azureedge.net. Firewall may be allowlisting by IP instead of FQDN, and IP changes break connectivity. For Windows nodes: HTTP proxy is not supported on Windows nodepools and causes inconsistent network behaviors.

**Solution**:
1. Verify connectivity: curl -v --connect-timeout 10 https://acs-mirror.azureedge.net/<path>. 2. Ensure firewall allowlists FQDN (not IP) per https://learn.microsoft.com/en-us/azure/aks/outbound-rules-control-egress. 3. For Windows: confirm HTTP proxy is NOT in use (not supported). 4. Check UDR/firewall/NVA/DMZ/proxy/VPN configuration.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning)]`

## Phase 7: Azure CNI 默认使用 bridged mode，该模式存在已知的 DNS 延迟问题。tran

### aks-510: AKS 集群使用 Azure CNI bridged mode（默认）时出现 DNS 延迟和超时，transparent mode 集群无此问题

**Root Cause**: Azure CNI 默认使用 bridged mode，该模式存在已知的 DNS 延迟问题。transparent mode 通过不同的网络路径避免了此问题。参考 ICM 200716273。

**Solution**:
通过 REST API 创建集群时在 networkProfile 中设置 networkMode: transparent。需先注册预览功能 AKSNetworkModePreview：az feature register --namespace Microsoft.ContainerService --name AKSNetworkModePreview

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FCreate%20an%20Azure%20CNI%20transparent%20mode%20cluster%20via%20REST%20API)]`

## Phase 8: Firewall or NSG blocks required outbound traffic f

### aks-1132: kubectl commands timeout - required outbound ports, FQDNs, or IP addresses are b...

**Root Cause**: Firewall or NSG blocks required outbound traffic for AKS control plane communication (konnectivity-agent requires specific ports/FQDNs)

**Solution**:
Open all required ports, FQDNs, and IP addresses per AKS outbound rules documentation; verify with az aks egress-endpoints list

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server)]`

## Phase 9: Specified extension version does not exist or is n

### aks-1252: Azure App Configuration extension installation fails with Failed to resolve the ...

**Root Cause**: Specified extension version does not exist or is not a supported version

**Solution**:
Retry installation using a supported version of the Azure App Configuration extension per official docs

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-app-configuration-extension-installation-errors)]`

## Phase 10: Targeted Dapr version does not exist

### aks-1255: Dapr extension install fails: ExtensionOperationFailed - Failed to resolve the e...

**Root Cause**: Targeted Dapr version does not exist

**Solution**:
Verify and use a supported Dapr version from the official supported versions list

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors)]`

## Phase 11: DNS caching mismatch between CoreDNS in cluster an

### aks-845: Outbound traffic from AKS cluster intermittently times out. Cluster uses UDR rou...

**Root Cause**: DNS caching mismatch between CoreDNS in cluster and Azure Firewall. Azure Firewall caches DNS for 15 minutes. When CoreDNS resolves FQDN to IP-Y but Firewall cache still has IP-X, Firewall forwards traffic to IP-X. Response from IP-X is rejected by conntrack (expected IP-Y), causing connection timeout.

**Solution**:
1) Switch to application rules instead of network rules when using FQDN. 2) OR enable Azure Firewall DNS proxy and set Azure Firewall IP as DNS server on AKS VNet, then reboot nodes.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FAzure%20Firewall%20connectivity%20issue%20when%20using%20FQDN%20in%20network%20rules)]`

## Phase 12: Netlink (rtnl) lock contention caused by custom no

### aks-1001: AKS node becomes unresponsive minutes after startup. CPU reaches 100% for 3-4 ho...

**Root Cause**: Netlink (rtnl) lock contention caused by custom node-exporter DaemonSet. node-exporter acquires the global kernel rtnl lock then gets CPU throttled, holding the lock and blocking all other processes needing it.

**Solution**:
1) Disable unnecessary collectors: --no-collector.wifi, --no-collector.hwmon, --no-collector.arp.netlink. 2) Exclude virtual interfaces: --collector.netclass.ignored-devices and --collector.netdev.device-exclude. 3) Increase node-exporter CPU limit to at least 1000m to prevent throttling.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FThe%20node%20becomes%20unresponsive%20due%20to%20sudden%20CPU%20spikes%20without%20an%20apparent%20cause)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS Azure Linux: container fails with certificate errors because /etc/ssl/certs ... | Azure Linux (RPM-based) stores certificates at /etc/pki/tls/... | Map /etc/pki into the container using a hostPath volume with... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20Linux%20%28Mariner%29) |
| 2 | After AKS underlay cluster migration, DNS records keep resetting to original gat... | Legacy external-dns deployment was not scaled down during mi... | Scale down or delete legacy external-dns deployment after mi... | [B] 7.5 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 3 | AKS 集群 Start 操作间歇性失败，节点 vmssCSE 扩展报 apiserverCurl 超时(exit code 51)；环境使用 Azure Fi... | AKS Stop 时 API Server DNS A 记录被删除，Azure Firewall DNS Proxy 缓... | 方案1: 将 FQDN-based network rule 改为 Application rule (只检查 HTTP... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FStart%20and%20Stop%2FAKS%20start%20fails%20due%20to%20azfw%20dnsproxy) |
| 4 | Public AKS cluster: kubectl hangs and times out, DNS resolves correctly to publi... | API server authorized IP ranges (apiServerAccessProfile.auth... | 1) Check authorized IP ranges: az aks show -g <rg> -n <aks> ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FTSG%3A%20AKS%20-%20Troubleshooting%20Cluster%20API%20Connectivity%20Issues%20(Start%20Here%20Workflow)%2F%5BTSG%5D%20AKS%20API%20Connectivity%20-%20Hands-On%20Labs) |
| 5 | AKS with Calico network policy — advanced or complex Calico issues cannot be res... | Calico Open Source on AKS is supported by Microsoft on a bes... | 1) For best-effort: collect Calico component logs (kubectl l... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Calico) |
| 6 | AKS node provisioning fails with vmssCSE exit code 31 (ERR_K8S_DOWNLOAD_TIMEOUT)... | NVA, firewall, or proxy blocking outbound access to acs-mirr... | 1. Verify connectivity: curl -v --connect-timeout 10 https:/... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 7 | AKS 集群使用 Azure CNI bridged mode（默认）时出现 DNS 延迟和超时，transparent mode 集群无此问题 | Azure CNI 默认使用 bridged mode，该模式存在已知的 DNS 延迟问题。transparent mo... | 通过 REST API 创建集群时在 networkProfile 中设置 networkMode: transpare... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FCreate%20an%20Azure%20CNI%20transparent%20mode%20cluster%20via%20REST%20API) |
| 8 | kubectl commands timeout - required outbound ports, FQDNs, or IP addresses are b... | Firewall or NSG blocks required outbound traffic for AKS con... | Open all required ports, FQDNs, and IP addresses per AKS out... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server) |
| 9 | Azure App Configuration extension installation fails with Failed to resolve the ... | Specified extension version does not exist or is not a suppo... | Retry installation using a supported version of the Azure Ap... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-app-configuration-extension-installation-errors) |
| 10 | Dapr extension install fails: ExtensionOperationFailed - Failed to resolve the e... | Targeted Dapr version does not exist | Verify and use a supported Dapr version from the official su... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-dapr-extension-installation-errors) |
| 11 | Outbound traffic from AKS cluster intermittently times out. Cluster uses UDR rou... | DNS caching mismatch between CoreDNS in cluster and Azure Fi... | 1) Switch to application rules instead of network rules when... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FAzure%20Firewall%20connectivity%20issue%20when%20using%20FQDN%20in%20network%20rules) |
| 12 | AKS node becomes unresponsive minutes after startup. CPU reaches 100% for 3-4 ho... | Netlink (rtnl) lock contention caused by custom node-exporte... | 1) Disable unnecessary collectors: --no-collector.wifi, --no... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FThe%20node%20becomes%20unresponsive%20due%20to%20sudden%20CPU%20spikes%20without%20an%20apparent%20cause) |
