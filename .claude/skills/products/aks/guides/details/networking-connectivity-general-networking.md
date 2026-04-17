# AKS 网络连通性通用 — networking -- Comprehensive Troubleshooting Guide

**Entries**: 16 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-aks-networking-connectivity-baseline-template.md, ado-wiki-b-run-tcpdump-in-container-group.md, mslearn-capture-tcpdump-linux.md, mslearn-capture-tcpdump-windows.md
**Generated**: 2026-04-07

---

## Phase 1: 100.64.0.0/10 is Shared Address Space (RFC 6598) i

### aks-262: Customer uses 100.64.0.0/10 IP address range for AKS VNet and experiences networ...

**Root Cause**: 100.64.0.0/10 is Shared Address Space (RFC 6598) intended for Carrier-Grade NAT / ISP use. While technically possible to use in AKS, it is not recommended and may cause conflicts with Azure infrastructure

**Solution**:
Recommend customer to use standard private IP address ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. If customer insists on 100.64.0.0/10, document the risk and note it is unsupported/not recommended

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: When loadBalancerSourceRanges is set, kube-proxy c

### aks-506: service.beta.kubernetes.io/azure-allowed-service-tags annotation stops working w...

**Root Cause**: When loadBalancerSourceRanges is set, kube-proxy creates DROP iptables rules that block traffic not matching the source ranges, making service tag annotation ineffective

**Solution**:
Merge CIDRs from the desired service tags into loadBalancerSourceRanges field and remove the service tag annotation. Download service tag CIDRs from https://www.microsoft.com/en-us/download/details.aspx?id=56519

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20Restrict%20Ingress%20loadBalancerSourceRanges)]`

## Phase 3: Older AKS cluster versions cannot add an Accelerat

### aks-536: AKS cluster upgrade fails with error 'CannotAddAcceleratedNetworkingNicToAnExist...

**Root Cause**: Older AKS cluster versions cannot add an Accelerated Networking NIC to an existing virtual machine during upgrade. The VMSS network interface configuration has enableAcceleratedNetworking=true but the upgrade process tries to add a new NIC with AN to the existing VM.

**Solution**:
Upgrade to a newer AKS version where Accelerated Networking is automatically enabled and supported during upgrades. New AKS clusters now automatically enable AN for supported VM SKUs (e.g., DSv3 series). Verify AN status via Portal (VM JSON View → networkProfileConfiguration → enableAcceleratedNetworking) or ASI (Nodepool → Accelerated Networking). Reference: https://learn.microsoft.com/en-us/azure/virtual-network/create-vm-accelerated-networking-cli

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FAKS%20with%20AcceleratedNetworking%20vmss)]`

## Phase 4: Default Linux TCP settings (tcp_retries2=15) cause

### aks-547: Linux-based client application in AKS experiences TCP connection stalls lasting ...

**Root Cause**: Default Linux TCP settings (tcp_retries2=15) cause 924.6 seconds delay before a broken network link is reported to the application layer. Default keepalive settings are too long to detect idle connection failures promptly.

**Solution**:
1) Set net.ipv4.tcp_retries2=5 to reduce broken connection detection time; 2) Set net.ipv4.tcp_keepalive_time=600 (10 min idle timeout); 3) Set net.ipv4.tcp_keepalive_probes=5; 4) Set net.ipv4.tcp_keepalive_intvl=15; 5) Apply these sysctl settings to both nodes and pods; 6) Implement application-level 'Command timeout' and central interval-based connection health check + reconnect logic.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F13%20-%20Common%20Troubleshoot%20Steps)]`

## Phase 5: Known issue with irqbalance daemon and Mellanox ca

### aks-549: Azure VM packet drops after VM Freeze scheduled events in AKS nodes. Mellanox NI...

**Root Cause**: Known issue with irqbalance daemon and Mellanox cards: IRQ affinity is not properly distributed across CPU cores until irqbalance is restarted. During VM Freeze events, the IRQ affinity may become skewed to a single CPU.

**Solution**:
1) Run diagnostic script to check MLX IRQ affinity distribution. 2) Manually rebalance smp_affinity if NR_TARGET_CPUS < NR_CPUS/2. 3) Restart irqbalance daemon. 4) Use ftrace (irq_affinity_proc_write) to identify programs adjusting IRQ affinity. 5) Check /proc/interrupts and /proc/irq for current state.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F14%20-%20Common%20Troubleshoot%20tools%20and%20command%20lines)]`

## Phase 6: Exit code 124 is the Linux timeout command exit co

### aks-585: AKS node provisioning fails with vmssCSE exit code 124 (ERR_VHD_FILE_NOT_FOUND) ...

**Root Cause**: Exit code 124 is the Linux timeout command exit code, not a genuine VHD error. The vmssCSE timeout wraps provisioning, so networking issues report as 124 instead of the real error code (50/51/52).

**Solution**:
1. Treat as networking issue — same as exit codes 50/51/52. 2. Check firewall, DNS, NSG, UDR for outbound connectivity issues. 3. In rare cases may be cloud-init file write failure.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning)]`

## Phase 7: AKS does not natively integrate ASGs into its depl

### aks-670: AKS does not natively support Application Security Groups (ASGs) in standard dep...

**Root Cause**: AKS does not natively integrate ASGs into its deployment process. ASGs are an Azure Virtual Network feature for grouping VM NICs, but AKS deployment does not include ASG configuration

**Solution**:
Option 1: Use Host IP path - configure node pool with public IPs and apply ASG via host-port connections. Option 2: After AKS provisioning, manually assign node NICs to desired ASGs. Option 3: Use cloud-native network security (Network Policies, Kata containers). See: https://learn.microsoft.com/en-us/azure/aks/use-node-public-ips#allow-host-port-connections-and-add-node-pools-to-application-security-groups

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FASG%20Support)]`

## Phase 8: Azure VNet has a default Flow timeout of 255 secon

### aks-1070: TCP connections from AKS pods to on-premises servers through VPN drop after a lo...

**Root Cause**: Azure VNet has a default Flow timeout of 255 seconds. When the TCP connection is idle for longer than this timeout, Azure drops the connection state. Subsequent packets from the server are dropped because the flow entry no longer exists. This affects applications without TCP keepalive enabled that have long processing times.

**Solution**:
Increase the VNet Flow timeout: Open the Virtual Network in Azure Portal > Overview > click 'Configure' next to 'Flow timeout' > set to a higher value (e.g. 10 minutes / 600s). For a more robust long-term fix, implement TCP keepalive at the application level to prevent idle timeouts. Reference: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq#can-i-set-flowtimeoutinminutes-property-for-an-entire-subscription

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FUngrouped%2FTCP%20connection%20drop%20after%20long%20idle%20time)]`

## Phase 9: Portal outage or rendering issue affecting network

### aks-551: Azure portal unable to list or manage network components during outages

**Root Cause**: Portal outage or rendering issue affecting network resource management blade.

**Solution**:
Use private flight portal link: https://portal.azure.com/?Microsoft_Azure_Network=flight5 . Use Ctrl+Alt+D shortcut for debug tracing and session ID to troubleshoot portal issues.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F14%20-%20Common%20Troubleshoot%20tools%20and%20command%20lines)]`

## Phase 10: Unknown

### aks-641: Intermittent networking issues in AKS pods that are difficult to reproduce. Need...

**Root Cause**: N/A

**Solution**:
Deploy k8s-tcp-dump-sidecar as a sidecar container for 24-hour rolling TCP dump traces, sending captures to Azure Files. This avoids filling the OS disk with continuous captures. Project: https://github.com/gjlumsden/k8s-tcp-dump-sidecar

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/AKS%20Cheatsheet)]`

## Phase 11: Control plane to node tunnel (tunnelfront/aks-link

### aks-009: kubectl logs / kubectl exec fails with 'Error from server: error dialing backend...

**Root Cause**: Control plane to node tunnel (tunnelfront/aks-link) is disrupted. Without uptime-SLA clusters use SSH tunnel (TCP 9000); with uptime-SLA clusters use OpenVPN (UDP 1194). Broken route table, custom DNS, or NSG blocking these ports can cause tunnel failure.

**Solution**:
1) Check tunnelfront/aks-link pod status: kubectl get pods -n kube-system. 2) If pod exists, exec in and test: curl -v <api-server-fqdn>:443, nslookup <fqdn>, ssh <apiserver>:9000. 3) Check route table pointing to NVA — remove if so. 4) Check NSG allows TCP 9000 (SSH tunnel) or UDP 1194 (OpenVPN). 5) Check custom DNS resolution. 6) If control-plane side issue, engage AKS PG.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/Net/=======8.AKS=======/8.3[AKS] H]]`

## Phase 12: The cluster's service CIDR (set at cluster creatio

### aks-1198: AKS cluster upgrade fails with ServiceCidrOverlapExistingSubnetsCidr: The specif...

**Root Cause**: The cluster's service CIDR (set at cluster creation, immutable) overlaps with a subnet CIDR that was later added to the same VNet. AKS validates this before upgrade and blocks the operation.

**Solution**:
Solution 1: Delete the overlapping subnet (if no resources attached). Solution 2: Adjust the overlapping subnet's address range. Solution 3: Redeploy the cluster with a different service CIDR (cannot change service CIDR post-creation).

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/servicecidroverlapexistingsubnetscidr-error)]`

## Phase 13: The subnet specified for the new node pool has del

### aks-1200: AKS node pool creation fails with SubnetIsDelegated: Subnet cannot be used becau...

**Root Cause**: The subnet specified for the new node pool has delegation enabled for a non-AKS Azure service (e.g., Azure SQL, Azure Databricks). AKS requires subnet delegation to be either absent or set to Microsoft.ContainerService/managedClusters.

**Solution**:
1. Check current delegation via 'az network vnet subnet show --query delegations'. 2. Remove non-AKS delegation: 'az network vnet subnet update --remove delegations 0'. 3. Add AKS delegation: 'az network vnet subnet update --delegations Microsoft.ContainerService/managedClusters'. 4. Retry node pool creation.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/subnetisdelegated-error)]`

## Phase 14: AKS can only set ownership on a VNet when provisio

### aks-1204: AKS cluster create/upgrade/scale fails with VirtualNetworkNotInSucceededState — ...

**Root Cause**: AKS can only set ownership on a VNet when provisioningState is Succeeded; another operation is running or a previous operation left VNet in Failed state

**Solution**:
Check VNet provisioning state with 'az network vnet show --query provisioningState'; wait for concurrent operations to finish or fix failed VNet state, then retry

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/virtualnetworknotinsucceededstate-error)]`

## Phase 15: Known issue in specific Kubernetes versions impact

### aks-1076: Windows Server 2025 nodes on AKS experience networking issues on Kubernetes 1.32...

**Root Cause**: Known issue in specific Kubernetes versions impacts networking on WS2025 nodes.

**Solution**:
Upgrade cluster to Kubernetes version above 1.32.5 (1.32.x track) or above 1.33.1 (1.33.x track).

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%202025)]`

## Phase 16: Two issues: (1) The Gateway annotations (alb-names

### aks-1059: AGC gateway resource shows blank ADDRESS field (kubectl get gateway). Gateway st...

**Root Cause**: Two issues: (1) The Gateway annotations (alb-namespace/alb-name) reference a non-existent ApplicationLoadBalancer resource name. (2) The federated identity credential for the ALB controller service account is misconfigured - the subject claim does not match the actual service account namespace/name used by the ALB controller.

**Solution**:
1. Fix federated identity: Create/update the managed identity with correct federated credential matching the ALB controller service account (system:serviceaccount:azure-alb-system:alb-controller-sa). 2. Assign required RBAC roles: Reader on MC resource group, AppGw for Containers Configuration Manager on MC RG, Network Contributor on ALB subnet. 3. Upgrade ALB controller helm chart with updated identity clientID. 4. Verify ApplicationLoadBalancer status shows Accepted=True and Deployment=True. 5. Update Gateway annotations to reference the correct ApplicationLoadBalancer name/namespace.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGC%2FAddress%20In%20Gateway%20Resource%20wasn't%20getting%20Updated)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer uses 100.64.0.0/10 IP address range for AKS VNet and experiences networ... | 100.64.0.0/10 is Shared Address Space (RFC 6598) intended fo... | Recommend customer to use standard private IP address ranges... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | service.beta.kubernetes.io/azure-allowed-service-tags annotation stops working w... | When loadBalancerSourceRanges is set, kube-proxy creates DRO... | Merge CIDRs from the desired service tags into loadBalancerS... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20Restrict%20Ingress%20loadBalancerSourceRanges) |
| 3 | AKS cluster upgrade fails with error 'CannotAddAcceleratedNetworkingNicToAnExist... | Older AKS cluster versions cannot add an Accelerated Network... | Upgrade to a newer AKS version where Accelerated Networking ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FAKS%20with%20AcceleratedNetworking%20vmss) |
| 4 | Linux-based client application in AKS experiences TCP connection stalls lasting ... | Default Linux TCP settings (tcp_retries2=15) cause 924.6 sec... | 1) Set net.ipv4.tcp_retries2=5 to reduce broken connection d... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F13%20-%20Common%20Troubleshoot%20Steps) |
| 5 | Azure VM packet drops after VM Freeze scheduled events in AKS nodes. Mellanox NI... | Known issue with irqbalance daemon and Mellanox cards: IRQ a... | 1) Run diagnostic script to check MLX IRQ affinity distribut... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F14%20-%20Common%20Troubleshoot%20tools%20and%20command%20lines) |
| 6 | AKS node provisioning fails with vmssCSE exit code 124 (ERR_VHD_FILE_NOT_FOUND) ... | Exit code 124 is the Linux timeout command exit code, not a ... | 1. Treat as networking issue — same as exit codes 50/51/52. ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 7 | AKS does not natively support Application Security Groups (ASGs) in standard dep... | AKS does not natively integrate ASGs into its deployment pro... | Option 1: Use Host IP path - configure node pool with public... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FASG%20Support) |
| 8 | TCP connections from AKS pods to on-premises servers through VPN drop after a lo... | Azure VNet has a default Flow timeout of 255 seconds. When t... | Increase the VNet Flow timeout: Open the Virtual Network in ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FUngrouped%2FTCP%20connection%20drop%20after%20long%20idle%20time) |
| 9 | Azure portal unable to list or manage network components during outages | Portal outage or rendering issue affecting network resource ... | Use private flight portal link: https://portal.azure.com/?Mi... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F14%20-%20Common%20Troubleshoot%20tools%20and%20command%20lines) |
| 10 | Intermittent networking issues in AKS pods that are difficult to reproduce. Need... | - | Deploy k8s-tcp-dump-sidecar as a sidecar container for 24-ho... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Tools/AKS%20Cheatsheet) |
| 11 | kubectl logs / kubectl exec fails with 'Error from server: error dialing backend... | Control plane to node tunnel (tunnelfront/aks-link) is disru... | 1) Check tunnelfront/aks-link pod status: kubectl get pods -... | [B] 6.0 | [onenote: MCVKB/Net/=======8.AKS=======/8.3[AKS] H] |
| 12 | AKS cluster upgrade fails with ServiceCidrOverlapExistingSubnetsCidr: The specif... | The cluster's service CIDR (set at cluster creation, immutab... | Solution 1: Delete the overlapping subnet (if no resources a... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/servicecidroverlapexistingsubnetscidr-error) |
| 13 | AKS node pool creation fails with SubnetIsDelegated: Subnet cannot be used becau... | The subnet specified for the new node pool has delegation en... | 1. Check current delegation via 'az network vnet subnet show... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/subnetisdelegated-error) |
| 14 | AKS cluster create/upgrade/scale fails with VirtualNetworkNotInSucceededState — ... | AKS can only set ownership on a VNet when provisioningState ... | Check VNet provisioning state with 'az network vnet show --q... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/virtualnetworknotinsucceededstate-error) |
| 15 | Windows Server 2025 nodes on AKS experience networking issues on Kubernetes 1.32... | Known issue in specific Kubernetes versions impacts networki... | Upgrade cluster to Kubernetes version above 1.32.5 (1.32.x t... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%202025) |
| 16 | AGC gateway resource shows blank ADDRESS field (kubectl get gateway). Gateway st... | Two issues: (1) The Gateway annotations (alb-namespace/alb-n... | 1. Fix federated identity: Create/update the managed identit... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGC%2FAddress%20In%20Gateway%20Resource%20wasn't%20getting%20Updated) |
