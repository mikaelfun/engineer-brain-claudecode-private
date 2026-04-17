# AKS 防火墙与代理 — general -- Comprehensive Troubleshooting Guide

**Entries**: 16 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-KMS-Addon.md
**Generated**: 2026-04-07

---

## Phase 1: Internal firewall (or corporate proxy) categorizes

### aks-393: Intermittent Docker image pull failures with EOF error from Cloudflare CDN (clou...

**Root Cause**: Internal firewall (or corporate proxy) categorizes Docker redirect requests to Cloudflare CDN as WebRepositoryAndStorage traffic and blocks them. The Kubernetes upgrade is not the root cause.

**Solution**:
Modify firewall rules to allow WebRepositoryAndStorage traffic category, which includes Docker CDN redirects. Restarting deployments is only a temporary workaround.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FDocker%20pull%20issues%20intermittently)]`

## Phase 2: Azure Firewall rules are missing required Windows 

### aks-423: AKS Windows node pool scale-up fails with vmssCSE extension error (exit code 1) ...

**Root Cause**: Azure Firewall rules are missing required Windows Update and Microsoft telemetry endpoints needed for Windows node provisioning (windowsupdate.com, *.do.dsp.mp.microsoft.com, *.events.data.microsoft.com, etc.)

**Solution**:
Add the following Azure Firewall rules: HTTP - download.windowsupdate.com, *.download.windowsupdate.com; HTTPS - *.do.dsp.mp.microsoft.com, *.events.data.microsoft.com, *.wdcpalt.microsoft.com, *.update.microsoft.com, validation-v2.sls.microsoft.com, settings-win.data.microsoft.com, github.com, raw.githubusercontent.com; HTTP/HTTPS - *.delivery.mp.microsoft.com

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAzure_Firewall_rules_Windows_containers)]`

## Phase 3: Azure VNET encryption is enabled and a firewall/NV

### aks-581: AKS node provisioning fails with vmssCSE exit code 50 — Azure VNET encryption en...

**Root Cause**: Azure VNET encryption is enabled and a firewall/NVA between AKS nodes and required endpoints cannot inspect or route encrypted traffic. VNET encryption is not supported with firewall/NVA in the path.

**Solution**:
Disable VNET encryption if a firewall or NVA is present between AKS nodes and the internet/required Azure endpoints.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning)]`

## Phase 4: Azure Key Vault has firewall enabled, blocking the

### aks-633: KMS etcd encryption fails with StatusCode=403 ForbiddenByFirewall: 'Client addre...

**Root Cause**: Azure Key Vault has firewall enabled, blocking the KMS plugin (running on AKS control plane) from accessing the vault endpoint

**Solution**:
Disable the firewall on Azure Key Vault to allow KMS plugin access. Alternatively, if using private key vault, enable API Server VNet Integration (az aks update --enable-apiserver-vnet-integration) and add the API server subnet to Key Vault allowed networks

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/KMS%20etcd%20Encryption)]`

## Phase 5: KEDA add-on cannot reach the Kubernetes API server

### aks-643: KEDA operator logs show 'Failed to get API Group-Resources' with error 'Get http...

**Root Cause**: KEDA add-on cannot reach the Kubernetes API server due to misconfigured cluster firewall blocking required outbound network traffic.

**Solution**:
Configure the cluster firewall to allow required outbound traffic per AKS egress requirements: https://learn.microsoft.com/en-us/azure/aks/outbound-rules-control-egress

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FKEDA)]`

## Phase 6: Security appliances intercept/block traffic to MCR

### aks-164: AKS built-in services lose access to MCR proxy after customer adds security appl...

**Root Cause**: Security appliances intercept/block traffic to MCR proxy endpoints. The outbound IPs of the security appliance are not whitelisted on the MCR proxy side, causing connection failures for AKS system components that need to pull images.

**Solution**:
1) Ask customer to provide their outbound IP ranges (from the security appliance). 2) Contact AKS PG (Andy Zhang) to whitelist those IP ranges on MCR proxy. Process is simple email request. MCR proxy sits between AKS nodes and MCR, providing cached image access in sovereign clouds.

`[Score: [B] 7.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 7: UFW is installed on Ubuntu-based AKS nodes by defa

### aks-1137: UFW (Uncomplicated Firewall) enabled on AKS node blocks port 10250, causing tunn...

**Root Cause**: UFW is installed on Ubuntu-based AKS nodes by default (disabled). If manually enabled, it blocks all ports including 10250, preventing kubelet communication through the tunnel.

**Solution**:
Disable UFW via az vmss run-command invoke --scripts ufw disable or allow port 10250 specifically with ufw allow 10250. Re-create tunnel component pods after change.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tunnel-connectivity-issues)]`

## Phase 8: Custom iptables rules with DROP target on tcp dest

### aks-1138: iptables rule on AKS node blocks port 10250, causing tunnel/Konnectivity failure...

**Root Cause**: Custom iptables rules with DROP target on tcp destination port 10250 prevent kubelet communication from API server through the tunnel.

**Solution**:
Delete the blocking iptables rule: iptables --delete INPUT --jump DROP --protocol tcp --destination-port 10250. Verify with iptables --list --line-numbers. Re-create tunnel pods after.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tunnel-connectivity-issues)]`

## Phase 9: Nodes cannot connect to acs-mirror.azureedge.net t

### aks-1158: AKS cluster creation fails with CniDownloadTimeoutVMExtensionError (exit status=...

**Root Cause**: Nodes cannot connect to acs-mirror.azureedge.net to download CNI libraries. Typically NVA blocking SSL, SSL certificate inspection, or firewall blocking required FQDN.

**Solution**:
Verify connectivity: curl -I https://acs-mirror.azureedge.net/cni/azure-vnet-cni-linux-amd64-v1.0.25.tgz. Ensure traffic allowed to acs-mirror.azureedge.net:443. Check firewall/NVA SSL inspection rules.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-cnidownloadtimeoutvmextensionerror)]`

## Phase 10: Provider pod cannot access Key Vault due to firewa

### aks-1264: Key Vault Secrets Provider: keyvault.BaseClient#GetSecret context deadline excee...

**Root Cause**: Provider pod cannot access Key Vault due to firewall rules, network policies blocking egress, or network jitter on host network

**Solution**:
Add provider pods to firewall allowlist; check network policies; verify node connectivity to Entra ID and Key Vault using test pod on host network with curl

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-key-vault-csi-secrets-store-csi-driver)]`

## Phase 11: Ubuntu 16.04 nodes ship with an old curl version t

### aks-025: az aks rotate-certs fails with 'exit status=50', error: 'curl: option --proxy-in...

**Root Cause**: Ubuntu 16.04 nodes ship with an old curl version that does not support --proxy-insecure option. The CSE (Custom Script Extension) used by az aks rotate-certs invokes curl with this flag. VMAS clusters on Kubernetes ≤1.17 running Ubuntu 16.04 are affected. Manually upgrading curl on existing nodes is futile — nodes are reimaged with the old Ubuntu 16.04 VHD during reconcile.

**Solution**:
Recovery workaround: 1) az extension remove --name aks-preview. 2) Install patched extension from GitHub (aks_preview-0.5.0). 3) az aks reconcile-control-plane-certs -g <rg> -n <cluster>. 4) Upgrade cluster to K8s 1.19+ (switches to Ubuntu 18.04 nodes). If VMSS cluster: try scale-out first — new nodes may get Ubuntu 18.04. Verify cert expiry via BBM Kusto: BlackboxMonitoringActivity | summarize by certExpirationTimes.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3]]`

## Phase 12: AKS requires specific FQDNs and ports for egress. 

### aks-028: AKS cluster cannot scale or upgrade because non-Azure firewall blocks required e...

**Root Cause**: AKS requires specific FQDNs and ports for egress. Official doc mandates wildcard FQDNs (e.g., *.blob.core.chinacloudapi.cn). Non-Azure firewalls that only support exact IP/FQDN rules cannot match these, blocking cluster operations. CDN-fronted endpoints have unpredictable IPs.

**Solution**:
Workaround (prefer Azure Firewall with wildcard FQDN in production): Add specific rules — API server IP:1194/UDP, :9000/TCP, :22/TCP, :443/TCP; CustomDNS:53; ntp.ubuntu.com:123; management.chinacloudapi.cn; login.chinacloudapi.cn; packages.microsoft.com; mcr.azk8s.cn; gcr.azk8s.cn; k8sgcr.azk8s.cn. For addons (Monitor/Policy): data.policy.azure.cn:443, store.policy.azure.cn:443 plus Azure Monitor service tag IPs. CDN excluded — may degrade upgrade/scale speed. Ref: https://docs.microsoft.com/en-us/azure/aks/limit-egress-traffic#azure-china-21vianet-required-network-rules

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3]]`

## Phase 13: Cluster nodes cannot reach acs-mirror.azureedge.ne

### aks-1205: AKS Linux cluster creation fails with VMExtensionError_CniDownloadTimeout (ERR_C...

**Root Cause**: Cluster nodes cannot reach acs-mirror.azureedge.net to download CNI binaries; typically blocked by NVA or SSL inspection

**Solution**:
Verify nodes can curl https://acs-mirror.azureedge.net/cni/azure-vnet-cni-linux-amd64-v1.0.25.tgz; ensure required FQDNs are allowed in firewall/NVA egress rules

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-cnidownloadtimeout)]`

## Phase 14: Pods in CrashLoopBackOff are removed from kube-pro

### aks-846: Customer applications in AKS receive HTTP 470 error when accessing another servi...

**Root Cause**: Pods in CrashLoopBackOff are removed from kube-proxy routing, changing iptables from ALLOW to REJECT. Traffic falls through to default route. Typoed service CIDR in route table causes intra-cluster traffic to route to Azure Firewall instead of nodes. Azure Firewall returns HTTP 470 when no explicit allow/deny rule matches.

**Solution**:
Fix the route table entries to correctly include the service CIDR, preventing intra-cluster traffic from being incorrectly routed to Azure Firewall.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FHTTP%20470%20responses%20from%20Azure%20Firewall)]`

## Phase 15: Disk space exhaustion on Windows node. Exit code 0

### aks-997: Windows container pods restarting with exit code -1073741510 (0xC000013A / STATU...

**Root Cause**: Disk space exhaustion on Windows node. Exit code 0xC000013A indicates forced program termination. The node OS disk runs out of space causing container and system service failures.

**Solution**:
1) Check disk usage via Azure Portal Metrics (OS Disk Used Percentage). 2) Use 'kubectl describe pod' to identify affected node. 3) Get CSI driver logs. 4) Customer should check/update Windows microservice code, Helm chart configs. 5) If deeper investigation needed, escalate to AKS Windows Containers team via ICM and collect logs with collect-windows-logs.ps1.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FWindows%20Containers%20Pod%20Restarts%20Referencing%20exit%20code%20073741510)]`

## Phase 16: ama-logs container cannot connect to global.handle

### aks-1044: AMA pod continuously restarts with exit code 143. Pod describe shows dcr_env_var...

**Root Cause**: ama-logs container cannot connect to global.handler.control.monitor.azure.com. mdsd.err shows Could not obtain configuration. Caused by firewall blocking or DNS resolution failure.

**Solution**:
Verify nodes can reach global.handler.control.monitor.azure.com. Follow egress rules: https://learn.microsoft.com/en-us/azure/aks/outbound-rules-control-egress#azure-monitor-for-containers. Check firewall and DNS. Retrieve AMA logs via kubectl cp for confirmation.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FAMA%20Pod%20Crashing%20and%20Restarting)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intermittent Docker image pull failures with EOF error from Cloudflare CDN (clou... | Internal firewall (or corporate proxy) categorizes Docker re... | Modify firewall rules to allow WebRepositoryAndStorage traff... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FDocker%20pull%20issues%20intermittently) |
| 2 | AKS Windows node pool scale-up fails with vmssCSE extension error (exit code 1) ... | Azure Firewall rules are missing required Windows Update and... | Add the following Azure Firewall rules: HTTP - download.wind... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAzure_Firewall_rules_Windows_containers) |
| 3 | AKS node provisioning fails with vmssCSE exit code 50 — Azure VNET encryption en... | Azure VNET encryption is enabled and a firewall/NVA between ... | Disable VNET encryption if a firewall or NVA is present betw... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 4 | KMS etcd encryption fails with StatusCode=403 ForbiddenByFirewall: 'Client addre... | Azure Key Vault has firewall enabled, blocking the KMS plugi... | Disable the firewall on Azure Key Vault to allow KMS plugin ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/KMS%20etcd%20Encryption) |
| 5 | KEDA operator logs show 'Failed to get API Group-Resources' with error 'Get http... | KEDA add-on cannot reach the Kubernetes API server due to mi... | Configure the cluster firewall to allow required outbound tr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FKEDA) |
| 6 | AKS built-in services lose access to MCR proxy after customer adds security appl... | Security appliances intercept/block traffic to MCR proxy end... | 1) Ask customer to provide their outbound IP ranges (from th... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | UFW (Uncomplicated Firewall) enabled on AKS node blocks port 10250, causing tunn... | UFW is installed on Ubuntu-based AKS nodes by default (disab... | Disable UFW via az vmss run-command invoke --scripts ufw dis... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tunnel-connectivity-issues) |
| 8 | iptables rule on AKS node blocks port 10250, causing tunnel/Konnectivity failure... | Custom iptables rules with DROP target on tcp destination po... | Delete the blocking iptables rule: iptables --delete INPUT -... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tunnel-connectivity-issues) |
| 9 | AKS cluster creation fails with CniDownloadTimeoutVMExtensionError (exit status=... | Nodes cannot connect to acs-mirror.azureedge.net to download... | Verify connectivity: curl -I https://acs-mirror.azureedge.ne... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-cnidownloadtimeoutvmextensionerror) |
| 10 | Key Vault Secrets Provider: keyvault.BaseClient#GetSecret context deadline excee... | Provider pod cannot access Key Vault due to firewall rules, ... | Add provider pods to firewall allowlist; check network polic... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-key-vault-csi-secrets-store-csi-driver) |
| 11 | az aks rotate-certs fails with 'exit status=50', error: 'curl: option --proxy-in... | Ubuntu 16.04 nodes ship with an old curl version that does n... | Recovery workaround: 1) az extension remove --name aks-previ... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3] |
| 12 | AKS cluster cannot scale or upgrade because non-Azure firewall blocks required e... | AKS requires specific FQDNs and ports for egress. Official d... | Workaround (prefer Azure Firewall with wildcard FQDN in prod... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3] |
| 13 | AKS Linux cluster creation fails with VMExtensionError_CniDownloadTimeout (ERR_C... | Cluster nodes cannot reach acs-mirror.azureedge.net to downl... | Verify nodes can curl https://acs-mirror.azureedge.net/cni/a... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-cnidownloadtimeout) |
| 14 | Customer applications in AKS receive HTTP 470 error when accessing another servi... | Pods in CrashLoopBackOff are removed from kube-proxy routing... | Fix the route table entries to correctly include the service... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FHTTP%20470%20responses%20from%20Azure%20Firewall) |
| 15 | Windows container pods restarting with exit code -1073741510 (0xC000013A / STATU... | Disk space exhaustion on Windows node. Exit code 0xC000013A ... | 1) Check disk usage via Azure Portal Metrics (OS Disk Used P... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FWindows%20Containers%20Pod%20Restarts%20Referencing%20exit%20code%20073741510) |
| 16 | AMA pod continuously restarts with exit code 143. Pod describe shows dcr_env_var... | ama-logs container cannot connect to global.handler.control.... | Verify nodes can reach global.handler.control.monitor.azure.... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FAMA%20Pod%20Crashing%20and%20Restarting) |
