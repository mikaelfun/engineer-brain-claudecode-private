# AKS 内部负载均衡器 — health-probe -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-AGIC-Troubleshooting-Backend-Health-Probe-Issues.md, ado-wiki-custom-health-probes-lb.md
**Generated**: 2026-04-07

---

## Phase 1: NPM 1.4.32+ on K8s 1.27+ changed iptables chain or

### aks-558: AKS 1.27+ with Azure NPM: LB health probes fail intermittently, TCP retransmissi...

**Root Cause**: NPM 1.4.32+ on K8s 1.27+ changed iptables chain ordering (PlaceAzureChainFirst=True) — NPM security rules now evaluate before kube-services rules. If NetworkPolicy has L3 ingress rules allowing only in-cluster traffic by label selectors, LB health probes (168.63.129.16) and external client traffic are dropped because they are not explicitly allowed.

**Solution**:
Add explicit ipBlock ingress rules to the NetworkPolicy targeting the LB service backend pods: 1) Allow Azure LB health probe IP 168.63.129.16/32; 2) Allow client source IP CIDR blocks; 3) If traffic is SNAT'd to node IP, allow node CIDR blocks. Alternatively, add a port-level allow rule if client IPs are unknown. Only affects externalTrafficPolicy=Cluster (not Local).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Azure%20Network%20Policy%20Manager%2FNPM%20(Network%20Policy%20Manager)%20PlaceAzureChainFirst%3DTrue%20change%20(1.27%2B)%20blocks%20external%20access%20to%20LoadBalancer%20services)]`

## Phase 2: K8s 1.24 breaking changes affect nginx ingress + A

### aks-131: After AKS upgrade from K8s 1.23 to 1.24, nginx ingress health probes fail; Azure...

**Root Cause**: K8s 1.24 breaking changes affect nginx ingress + Azure LB health probes. GitHub: kubernetes/ingress-nginx/issues/9538

**Solution**:
Add annotation service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path to nginx service

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: Common causes: (1) Basic LB SKU used instead of St

### aks-1091: AKS cluster health probe mode (Shared/ServiceNodePort) not working: LB doesn't d...

**Root Cause**: Common causes: (1) Basic LB SKU used instead of Standard, (2) Feature not registered on subscription, (3) K8s version < 1.28.0, (4) Feature toggle off

**Solution**:
Use Standard LB SKU; register feature via 'az feature register --name EnableSLBSharedHealthProbePreview --namespace Microsoft.ContainerService'; upgrade to K8s >= 1.28; contact AKS team if toggle is off; verify cloud-node-manager has health-probe-proxy sidecar

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/cluster-service-health-probe-mode-issues)]`

## Phase 4: Multiple prerequisite failures: invalid mode value

### aks-666: Errors when enabling Shared SLB Health Probe with --cluster-service-load-balance...

**Root Cause**: Multiple prerequisite failures: invalid mode value (must be Shared or ServiceNodePort), feature toggle off, Basic LB SKU used, feature EnableSLBSharedHealthProbePreview not registered, or Kubernetes version below v1.28.0.

**Solution**:
1) Use valid mode: Shared or ServiceNodePort; 2) Ensure feature toggle is on; 3) Use Standard LB SKU; 4) Register: az feature register --namespace Microsoft.ContainerService --name EnableSLBSharedHealthProbePreview; 5) Upgrade to K8s v1.28.0+. Debug: check RP frontend logs for LoadBalancerProfile, overlaymgr logs for cloudConfigSecretResolver, cloud-node-manager daemonset for health-probe-proxy sidecar.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FShared%20SLB%20Health%20Probe)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS 1.27+ with Azure NPM: LB health probes fail intermittently, TCP retransmissi... | NPM 1.4.32+ on K8s 1.27+ changed iptables chain ordering (Pl... | Add explicit ipBlock ingress rules to the NetworkPolicy targ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Azure%20Network%20Policy%20Manager%2FNPM%20(Network%20Policy%20Manager)%20PlaceAzureChainFirst%3DTrue%20change%20(1.27%2B)%20blocks%20external%20access%20to%20LoadBalancer%20services) |
| 2 | After AKS upgrade from K8s 1.23 to 1.24, nginx ingress health probes fail; Azure... | K8s 1.24 breaking changes affect nginx ingress + Azure LB he... | Add annotation service.beta.kubernetes.io/azure-load-balance... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS cluster health probe mode (Shared/ServiceNodePort) not working: LB doesn't d... | Common causes: (1) Basic LB SKU used instead of Standard, (2... | Use Standard LB SKU; register feature via 'az feature regist... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/cluster-service-health-probe-mode-issues) |
| 4 | Errors when enabling Shared SLB Health Probe with --cluster-service-load-balance... | Multiple prerequisite failures: invalid mode value (must be ... | 1) Use valid mode: Shared or ServiceNodePort; 2) Ensure feat... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FShared%20SLB%20Health%20Probe) |
