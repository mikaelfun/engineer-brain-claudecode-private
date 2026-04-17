# AKS 内部负载均衡器 — cloud-controller-manager -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: extension-manager.md
**Generated**: 2026-04-07

---

## Phase 1: Customer used User Managed Identity (UMI) for AKS 

### aks-074: After AKS upgrade from VMAS to VMSS (Standard LB), all LB health probes fail and...

**Root Cause**: Customer used User Managed Identity (UMI) for AKS but did not assign Network Contributor role on Vnet/IP/LB resources. cloud-controller-manager cannot read/write network resources, causing LB probe/rule misconfigurations and automatic reverts.

**Solution**:
Assign Network Contributor (or higher) role to UMI on both Node Resource Group and Master RG (covering LB, Public IP, VNet, NSG). Then run AKS reconcile. Use service annotations (azure-load-balancer-resource-group, azure-load-balancer-internal) to control LB behavior.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Unexpected behavior. Certificate rotation may disr

### aks-256: After AKS certificate rotation nodes are not joined to Load Balancer backend poo...

**Root Cause**: Unexpected behavior. Certificate rotation may disrupt cloud-controller-manager ability to update LB configuration.

**Solution**:
1) Check VM and LB activity logs during cert rotation. 2) Verify node status. 3) Raise IcM if nodes are Ready but missing from LB backend pool. 4) Consider re-running reconcile.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: After 'az aks loadbalancer' commands update HCP an

### aks-707: After adding a new load balancer configuration via 'az aks loadbalancer add', a ...

**Root Cause**: After 'az aks loadbalancer' commands update HCP and cloud provider config secret, cloud-controller-manager needs additional time to reload the new configuration. The AKS operation returns successfully before the reload completes.

**Solution**:
After adding/updating a load balancer configuration, monitor Kubernetes events for the 'EnsuredLoadBalancer' event which marks the completion of cloud provider restart. Only then create services targeting the new load balancer.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FMultiple%20Standard%20Load%20Balancers)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After AKS upgrade from VMAS to VMSS (Standard LB), all LB health probes fail and... | Customer used User Managed Identity (UMI) for AKS but did no... | Assign Network Contributor (or higher) role to UMI on both N... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | After AKS certificate rotation nodes are not joined to Load Balancer backend poo... | Unexpected behavior. Certificate rotation may disrupt cloud-... | 1) Check VM and LB activity logs during cert rotation. 2) Ve... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | After adding a new load balancer configuration via 'az aks loadbalancer add', a ... | After 'az aks loadbalancer' commands update HCP and cloud pr... | After adding/updating a load balancer configuration, monitor... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FMultiple%20Standard%20Load%20Balancers) |
