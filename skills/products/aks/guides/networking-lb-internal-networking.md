# AKS 内部负载均衡器 — networking -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS nodes losing internet access after upgrading Load Balancer from Basic to Sta... | Load Balancer SKU upgrade from Basic to Standard puts AKS cl... | Do not upgrade LB SKU in-place for AKS clusters. Customer mu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F14%20-%20Common%20Troubleshoot%20tools%20and%20command%20lines) |
| 2 | AKS operations fail with InvalidLoadBalancerProfileAllocatedOutboundPorts: alloc... | Node count x allocated outbound ports per node exceeds total... | Validate config with formula: 64000 x outbound_IPs / ports_p... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20fail%20with%20code%20InvalidLoadBalancerProfileAllocatedOutboundPorts) |
| 3 | SNAT port exhaustion or outbound connection timeouts through Azure Load Balancer... | Insufficient SNAT ports allocated for outbound connections t... | See TSG: https://supportability.visualstudio.com/AzureNetwor... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F%5BTSG%5D%20Azure%20Load%20Balancer) |
| 4 | AKS nodes become NotReady after customer manually modifies Standard LoadBalancer... | The outbound pool of Standard LoadBalancer is strictly manag... | 1) Do not manually modify AKS-managed SLB outbound pool. 2) ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | Service event warning: Found invalid LoadBalancerSourceRanges, ignoring and addi... | Customer provided IP ranges in invalid CIDR format (e.g., 10... | Correct the CIDR format in the annotation value to valid CID... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Service%20Allowed%20IP%20Ranges%20Annotation) |
| 6 | Disabling Windows OutboundNAT on AKS cluster with Load Balancer outbound type is... | Azure Standard LB has only one primary IP (node IP) per Wind... | Change outbound type to NAT Gateway (64512 ports/IP, --outbo... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%20Disable%20OutboundNAT) |

## Quick Troubleshooting Path

1. Check: Do not upgrade LB SKU in-place for AKS clusters `[source: ado-wiki]`
2. Check: Validate config with formula: 64000 x outbound_IPs / ports_per_node >= total_node_count (including m `[source: ado-wiki]`
3. Check: See TSG: https://supportability `[source: ado-wiki]`
