# AKS 内部负载均衡器 — cloud-controller-manager -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After AKS upgrade from VMAS to VMSS (Standard LB), all LB health probes fail and... | Customer used User Managed Identity (UMI) for AKS but did no... | Assign Network Contributor (or higher) role to UMI on both N... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | After AKS certificate rotation nodes are not joined to Load Balancer backend poo... | Unexpected behavior. Certificate rotation may disrupt cloud-... | 1) Check VM and LB activity logs during cert rotation. 2) Ve... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | After adding a new load balancer configuration via 'az aks loadbalancer add', a ... | After 'az aks loadbalancer' commands update HCP and cloud pr... | After adding/updating a load balancer configuration, monitor... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FMultiple%20Standard%20Load%20Balancers) |

## Quick Troubleshooting Path

1. Check: Assign Network Contributor (or higher) role to UMI on both Node Resource Group and Master RG (coveri `[source: onenote]`
2. Check: 1) Check VM and LB activity logs during cert rotation `[source: onenote]`
3. Check: After adding/updating a load balancer configuration, monitor Kubernetes events for the 'EnsuredLoadB `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-lb-internal-cloud-controller-manager.md)
