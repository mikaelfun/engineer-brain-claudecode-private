# AKS 内部负载均衡器 — snat -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Applications in AKS cannot reach external IPs — SNAT port exhaustion on load bal... | Insufficient allocated SNAT ports for outbound connections t... | Check SNAT metrics via Applens detector or Jarvis dashboard.... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service) |
| 2 | AKS operations fail with InvalidLoadBalancerProfileAllocatedOutboundPorts - allo... | Load balancer outbound port allocation formula violated: all... | Before any scale/update operation, verify formula: 64000 * o... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20fail%20with%20code%20InvalidLoadBalancerProfileAllocatedOutboundPorts) |
| 3 | AKS cluster operations (update, scale up) fail with error code InvalidLoadBalanc... | The specified node count, number of outbound frontend IP add... | Use the formula: 64000 ports per IP / outbound_ports_per_nod... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20fail%20with%20code%20InvalidLoadBalancerProfileAllocatedOutboundPorts) |
| 4 | AKS cluster create/update fails with InvalidLoadBalancerProfileAllocatedOutbound... | The combination of node count, outbound IPs, and allocated p... | Adjust the configuration: increase outbound IPs, reduce allo... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/invalidloadbalancerprofileallocatedoutboundports-error) |

## Quick Troubleshooting Path

1. Check: Check SNAT metrics via Applens detector or Jarvis dashboard `[source: ado-wiki]`
2. Check: Before any scale/update operation, verify formula: 64000 * outbound_IPs / ports_per_node >= total_no `[source: ado-wiki]`
3. Check: Use the formula: 64000 ports per IP / outbound_ports_per_node * number_of_outbound_IPs = max_nodes `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-lb-internal-snat.md)
