# AKS 内部负载均衡器 — snat -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: mslearn-outbound-connectivity-troubleshooting.md
**Generated**: 2026-04-07

---

## Phase 1: Insufficient allocated SNAT ports for outbound con

### aks-567: Applications in AKS cannot reach external IPs — SNAT port exhaustion on load bal...

**Root Cause**: Insufficient allocated SNAT ports for outbound connections through Azure Load Balancer

**Solution**:
Check SNAT metrics via Applens detector or Jarvis dashboard. Increase allocated outbound ports: az aks update --load-balancer-outbound-ports. Ref: https://docs.microsoft.com/en-us/azure/aks/load-balancer-standard#configure-the-allocated-outbound-ports

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service)]`

## Phase 2: Load balancer outbound port allocation formula vio

### aks-763: AKS operations fail with InvalidLoadBalancerProfileAllocatedOutboundPorts - allo...

**Root Cause**: Load balancer outbound port allocation formula violated: allocatedPortsPerNode * totalNodeCount exceeds 64000 * numberOfOutboundIPs. Each outbound IP provides 64000 SNAT ports; default 1024 ports per node for <=50 nodes.

**Solution**:
Before any scale/update operation, verify formula: 64000 * outbound_IPs / ports_per_node >= total_nodes (including maxSurge for upgrades). Fix by either: increasing outbound IP count, or reducing allocated outbound ports per node.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20fail%20with%20code%20InvalidLoadBalancerProfileAllocatedOutboundPorts)]`

## Phase 3: The specified node count, number of outbound front

### aks-769: AKS cluster operations (update, scale up) fail with error code InvalidLoadBalanc...

**Root Cause**: The specified node count, number of outbound frontend IP addresses and number of SNAT ports per node do not add up to a viable configuration. Each outbound IP provides 64000 SNAT ports, and the total available ports must cover all nodes including surge nodes during upgrades.

**Solution**:
Use the formula: 64000 ports per IP / outbound_ports_per_node * number_of_outbound_IPs = max_nodes. Increase outbound frontend IPs (each adds 64000 ports) or reduce allocated outbound ports per node. Account for maxSurge buffer nodes during upgrades (default 1).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20fail%20with%20code%20InvalidLoadBalancerProfileAllocatedOutboundPorts)]`

## Phase 4: The combination of node count, outbound IPs, and a

### aks-1188: AKS cluster create/update fails with InvalidLoadBalancerProfileAllocatedOutbound...

**Root Cause**: The combination of node count, outbound IPs, and allocated ports per node is not feasible. Each outbound IP provides 64,000 SNAT ports; total ports must accommodate all nodes including surge.

**Solution**:
Adjust the configuration: increase outbound IPs, reduce allocated ports per node, or reduce node count. Formula: 64000 / ports_per_node * num_outbound_IPs >= max_nodes (including surge).

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/invalidloadbalancerprofileallocatedoutboundports-error)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Applications in AKS cannot reach external IPs — SNAT port exhaustion on load bal... | Insufficient allocated SNAT ports for outbound connections t... | Check SNAT metrics via Applens detector or Jarvis dashboard.... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20K8s%20LoadBalancer%20Service) |
| 2 | AKS operations fail with InvalidLoadBalancerProfileAllocatedOutboundPorts - allo... | Load balancer outbound port allocation formula violated: all... | Before any scale/update operation, verify formula: 64000 * o... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20fail%20with%20code%20InvalidLoadBalancerProfileAllocatedOutboundPorts) |
| 3 | AKS cluster operations (update, scale up) fail with error code InvalidLoadBalanc... | The specified node count, number of outbound frontend IP add... | Use the formula: 64000 ports per IP / outbound_ports_per_nod... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperations%20fail%20with%20code%20InvalidLoadBalancerProfileAllocatedOutboundPorts) |
| 4 | AKS cluster create/update fails with InvalidLoadBalancerProfileAllocatedOutbound... | The combination of node count, outbound IPs, and allocated p... | Adjust the configuration: increase outbound IPs, reduce allo... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/invalidloadbalancerprofileallocatedoutboundports-error) |
