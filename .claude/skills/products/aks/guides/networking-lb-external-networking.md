# AKS 外部负载均衡器与 SNAT — networking -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 7
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot connect to private AKS cluster API server when traffic goes through NVA o... | When using AKS Private Cluster + NVA/Azure Firewall + Privat... | Configure SNAT on the NVA/Azure Firewall for traffic destine... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F5%20-%20Troubleshoot%20Connectivity%20issues) |
| 2 | Pod-to-pod traffic across nodes shows source IP as node IP instead of pod IP, or... | ip-masq-agent nonMasqueradeCIDRs not properly configured — p... | Check iptables: iptables-save \| grep ip-masq-agent. Verify ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20IP-masq-agent) |
| 3 | AKS cluster issues caused by custom NSG rules — load balancer access blocked, co... | Custom Network Security Group rules on NIC or subnet level b... | 1. Find associated NSGs in ASC (check both NIC and subnet le... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Network%20Security%20Group%20(NSG)) |
| 4 | AKS with basic LB and multiple node pools: networking issues on 2nd and subseque... | Basic Load Balancer AKS clusters only support the 1st nodepo... | For multi-nodepool scenarios use Standard Load Balancer. Net... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | kubenet AKS clusters on k8s 1.19.x incorrectly SNAT pod source IP to host node I... | Known issue with kubenet + containerd combination on k8s 1.1... | Check TSG: CloudNativeCompute wiki TSG-kubenet-clusters-are-... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | AKS cluster with managedNATGateway or userAssignedNATGateway outbound type fails... | Customer-side configuration issues with the NAT gateway reso... | Verify: 1) NAT gateway exists in the correct resource group ... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FManaged%20NAT%20Gateway) |
| 7 | Private Link Service provision fails with error: reconcilePrivateLinkService for... | The LB frontend is already associated with a Private Link Se... | Check the PLS tags. It should have k8s-azure-owner-service (... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Private%20Link%20Service%20for%20AKS%20Load%20Balancers) |

## Quick Troubleshooting Path

1. Check: Configure SNAT on the NVA/Azure Firewall for traffic destined to private endpoints `[source: ado-wiki]`
2. Check: Check iptables: iptables-save | grep ip-masq-agent `[source: ado-wiki]`
3. Check: 1 `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-lb-external-networking.md)
