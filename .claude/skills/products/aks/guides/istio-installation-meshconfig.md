# AKS Istio 安装与配置 — meshconfig -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 5
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | High memory consumption in Envoy sidecar proxies across Istio mesh | Envoy statistics collection with high cardinality metrics; I... | Use Sidecar CRD to restrict egress scope; enable discoverySe... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-general-troubleshooting) |
| 2 | Application pod becomes unresponsive or restarts when Istio sidecar is injected ... | Application container starts before Envoy sidecar proxy is r... | Set holdApplicationUntilProxyStarts: true in MeshConfig defa... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-general-troubleshooting) |
| 3 | Istio MeshConfig changes not taking effect or rejected | Editing default ConfigMap instead of shared ConfigMap; tab c... | Edit istio-shared-configmap-<revision> not istio-<revision>;... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-meshconfig) |
| 4 | Istio Envoy using all CPU cores - high CPU consumption | MeshConfig concurrency field set to 0, causing Envoy to use ... | Remove concurrency from MeshConfig; if not configured, CPU r... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-meshconfig) |
| 5 | Applications connected to Redis DB via Azure Cache for Redis with Geo Replicatio... | Port collision between Istio Envoy sidecar (default outbound... | Change Istio proxyListenPort via MeshConfig. Create a revisi... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FManaged%20Istio%2FPort%20collision%20with%20Redis%20with%20Geo%20Replication%20enabled) |

## Quick Troubleshooting Path

1. Check: Use Sidecar CRD to restrict egress scope; enable discoverySelectors in MeshConfig; review and reduce `[source: mslearn]`
2. Check: Set holdApplicationUntilProxyStarts: true in MeshConfig defaultConfig section `[source: mslearn]`
3. Check: Edit istio-shared-configmap-<revision> not istio-<revision>; use spaces not tabs; verify field names `[source: mslearn]`
