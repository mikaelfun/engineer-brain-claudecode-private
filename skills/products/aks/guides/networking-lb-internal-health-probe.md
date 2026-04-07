# AKS 内部负载均衡器 — health-probe -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 4
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS 1.27+ with Azure NPM: LB health probes fail intermittently, TCP retransmissi... | NPM 1.4.32+ on K8s 1.27+ changed iptables chain ordering (Pl... | Add explicit ipBlock ingress rules to the NetworkPolicy targ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Azure%20Network%20Policy%20Manager%2FNPM%20(Network%20Policy%20Manager)%20PlaceAzureChainFirst%3DTrue%20change%20(1.27%2B)%20blocks%20external%20access%20to%20LoadBalancer%20services) |
| 2 | After AKS upgrade from K8s 1.23 to 1.24, nginx ingress health probes fail; Azure... | K8s 1.24 breaking changes affect nginx ingress + Azure LB he... | Add annotation service.beta.kubernetes.io/azure-load-balance... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS cluster health probe mode (Shared/ServiceNodePort) not working: LB doesn't d... | Common causes: (1) Basic LB SKU used instead of Standard, (2... | Use Standard LB SKU; register feature via 'az feature regist... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/cluster-service-health-probe-mode-issues) |
| 4 | Errors when enabling Shared SLB Health Probe with --cluster-service-load-balance... | Multiple prerequisite failures: invalid mode value (must be ... | 1) Use valid mode: Shared or ServiceNodePort; 2) Ensure feat... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FShared%20SLB%20Health%20Probe) |

## Quick Troubleshooting Path

1. Check: Add explicit ipBlock ingress rules to the NetworkPolicy targeting the LB service backend pods: 1) Al `[source: ado-wiki]`
2. Check: Add annotation service `[source: onenote]`
3. Check: Use Standard LB SKU; register feature via 'az feature register --name EnableSLBSharedHealthProbePrev `[source: mslearn]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-lb-internal-health-probe.md)
