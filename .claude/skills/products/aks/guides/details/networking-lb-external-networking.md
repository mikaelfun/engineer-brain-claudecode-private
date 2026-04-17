# AKS 外部负载均衡器与 SNAT — networking -- Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-SNAT-Port-Exhaustion.md, ado-wiki-aks-traffic-analytics-nsg-flow-logs.md, mslearn-snat-port-exhaustion-diagnostic.md
**Generated**: 2026-04-07

---

## Phase 1: When using AKS Private Cluster + NVA/Azure Firewal

### aks-553: Cannot connect to private AKS cluster API server when traffic goes through NVA o...

**Root Cause**: When using AKS Private Cluster + NVA/Azure Firewall + Private Endpoint Policy, SNAT must be configured on the firewall side. Without SNAT, AKS private endpoint is unreachable because the PaaS cannot retrieve routing information from the Syn packet without SNAT. Unlike Storage Account which works without SNAT, AKS Private Cluster requires SNAT for flow symmetry.

**Solution**:
Configure SNAT on the NVA/Azure Firewall for traffic destined to private endpoints. Reference: https://learn.microsoft.com/en-us/azure/private-link/inspect-traffic-with-azure-firewall. Decision tree: Private AKS → Using NVA? → Using PE policy? → Using SNAT? → If no SNAT, configure it.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F5%20-%20Troubleshoot%20Connectivity%20issues)]`

## Phase 2: ip-masq-agent nonMasqueradeCIDRs not properly conf

### aks-562: Pod-to-pod traffic across nodes shows source IP as node IP instead of pod IP, or...

**Root Cause**: ip-masq-agent nonMasqueradeCIDRs not properly configured — pod CIDR or service CIDR missing from the configmap, causing traffic to be incorrectly MASQUERADEd

**Solution**:
Check iptables: iptables-save | grep ip-masq-agent. Verify IP-MASQ-AGENT chain contains node CIDR, pod CIDR, and service CIDR. Check configmap: kubectl get cm azure-ip-masq-agent-config -n kube-system -o yaml. If CIDRs don't match cluster configuration, escalate.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20IP-masq-agent)]`

## Phase 3: Custom Network Security Group rules on NIC or subn

### aks-568: AKS cluster issues caused by custom NSG rules — load balancer access blocked, co...

**Root Cause**: Custom Network Security Group rules on NIC or subnet level blocking required AKS traffic (required egress ports/FQDNs, LB health probe 168.63.129.16, control plane communication)

**Solution**:
1. Find associated NSGs in ASC (check both NIC and subnet level). 2. Validate security rules allow required egress per https://docs.microsoft.com/en-us/azure/aks/limit-egress-traffic. 3. Check for custom rules with deny actions that may block required communication. Default NSG rules are generally OK.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Network%20Security%20Group%20(NSG))]`

## Phase 4: Basic Load Balancer AKS clusters only support the 

### aks-247: AKS with basic LB and multiple node pools: networking issues on 2nd and subseque...

**Root Cause**: Basic Load Balancer AKS clusters only support the 1st nodepool for networking. Adding additional nodepools was blocked in newer api-versions but older clusters may still have this configuration.

**Solution**:
For multi-nodepool scenarios use Standard Load Balancer. Networking issues on 2nd+ nodepool with basic LB are out of support scope. Migrate to Standard LB.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 5: Known issue with kubenet + containerd combination 

### aks-252: kubenet AKS clusters on k8s 1.19.x incorrectly SNAT pod source IP to host node I...

**Root Cause**: Known issue with kubenet + containerd combination on k8s 1.19.x. SNAT behavior differs from Docker-based nodes due to containerd runtime changes.

**Solution**:
Check TSG: CloudNativeCompute wiki TSG-kubenet-clusters-are-incorrectly-SNATing. Upgrade to patched version or switch to Azure CNI.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 6: Customer-side configuration issues with the NAT ga

### aks-679: AKS cluster with managedNATGateway or userAssignedNATGateway outbound type fails...

**Root Cause**: Customer-side configuration issues with the NAT gateway resource: gateway does not exist in expected RG, wrong SKU (must be Standard), has availability zones (must be regional), location mismatch with cluster, public IP prefixes associated instead of IPs, or no public IPs.

**Solution**:
Verify: 1) NAT gateway exists in the correct resource group and subscription. 2) SKU is Standard. 3) NAT gateway is regional (no zones). 4) Location matches the cluster. 5) Only public IP addresses (not prefixes) are associated. 6) At least one public IP is associated. For errors with 'EnsureManagedOutboundIPs', 'ProvisioningState not Succeeded', or 'nil IdleTimeoutInMinutes', escalate to NAT Gateway team.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FManaged%20NAT%20Gateway)]`

## Phase 7: The LB frontend is already associated with a Priva

### aks-1040: Private Link Service provision fails with error: reconcilePrivateLinkService for...

**Root Cause**: The LB frontend is already associated with a Private Link Service not managed by AKS, or customer accidentally modified/deleted existing PLS tags.

**Solution**:
Check the PLS tags. It should have k8s-azure-owner-service (value = owner service name) and k8s-azure-cluster-name (value = cluster name) tags. Restore them if missing.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Private%20Link%20Service%20for%20AKS%20Load%20Balancers)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot connect to private AKS cluster API server when traffic goes through NVA o... | When using AKS Private Cluster + NVA/Azure Firewall + Privat... | Configure SNAT on the NVA/Azure Firewall for traffic destine... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F5%20-%20Troubleshoot%20Connectivity%20issues) |
| 2 | Pod-to-pod traffic across nodes shows source IP as node IP instead of pod IP, or... | ip-masq-agent nonMasqueradeCIDRs not properly configured — p... | Check iptables: iptables-save \| grep ip-masq-agent. Verify ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20IP-masq-agent) |
| 3 | AKS cluster issues caused by custom NSG rules — load balancer access blocked, co... | Custom Network Security Group rules on NIC or subnet level b... | 1. Find associated NSGs in ASC (check both NIC and subnet le... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Network%20Security%20Group%20(NSG)) |
| 4 | AKS with basic LB and multiple node pools: networking issues on 2nd and subseque... | Basic Load Balancer AKS clusters only support the 1st nodepo... | For multi-nodepool scenarios use Standard Load Balancer. Net... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | kubenet AKS clusters on k8s 1.19.x incorrectly SNAT pod source IP to host node I... | Known issue with kubenet + containerd combination on k8s 1.1... | Check TSG: CloudNativeCompute wiki TSG-kubenet-clusters-are-... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | AKS cluster with managedNATGateway or userAssignedNATGateway outbound type fails... | Customer-side configuration issues with the NAT gateway reso... | Verify: 1) NAT gateway exists in the correct resource group ... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FManaged%20NAT%20Gateway) |
| 7 | Private Link Service provision fails with error: reconcilePrivateLinkService for... | The LB frontend is already associated with a Private Link Se... | Check the PLS tags. It should have k8s-azure-owner-service (... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Private%20Link%20Service%20for%20AKS%20Load%20Balancers) |
