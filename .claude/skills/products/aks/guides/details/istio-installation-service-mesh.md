# AKS Istio 安装与配置 — service-mesh -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Pod-to-Pod-Proxy-Issues.md, ado-wiki-b-Troubleshooting-database-connectivity.md, ado-wiki-connectivity-troubleshooting.md, ado-wiki-tsg-check-apiserver-proxy-logs.md
**Generated**: 2026-04-07

---

## Phase 1: Istio addon had no confirmed Mooncake GA date in F

### aks-006: Istio service mesh addon not available on AKS Azure China cluster

**Root Cause**: Istio addon had no confirmed Mooncake GA date in Feature Landing Status (last updated 2023). Current status in 21V is unconfirmed.

**Solution**:
Istio addon availability in Azure China is unconfirmed. Consider using open-source Istio deployed manually, or alternative service mesh solutions. Verify with PG for latest status.

`[Score: [B] 7.5 | Source: [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: OSM is deprecated by Microsoft in favor of Istio s

### aks-696: Open Service Mesh (OSM) addon is being retired and will be removed on 30 Septemb...

**Root Cause**: OSM is deprecated by Microsoft in favor of Istio service mesh

**Solution**:
Migrate to Istio following the migration guidance at https://learn.microsoft.com/en-us/azure/aks/open-service-mesh-istio-migration-guidance

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Addons%20and%20Extensions/Open%20Service%20Mesh)]`

## Phase 3: Istio/service mesh proxy reserves certain port ran

### aks-548: AKS pods using Istio or service mesh experience connectivity issues on ports 130...

**Root Cause**: Istio/service mesh proxy reserves certain port ranges (including 13000-13019, 15000-15019) that conflict with Azure Redis Cache client communication ports, causing connection failures.

**Solution**:
1) Check if Istio or service mesh is installed in the cluster; 2) Verify service mesh proxy port reservations; 3) Ensure Azure Redis Cache ports (13000-13019, 15000-15019) are excluded from service mesh proxy interception; 4) Also check pod CPU/memory/network pressure as pods on the same node can throttle IO operations.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F13%20-%20Common%20Troubleshoot%20Steps)]`

## Phase 4: AKS does not natively enforce mTLS between service

### aks-033: [DEPRECATED] Customer asks how to enable encrypted pod-to-pod communication betw...

**Root Cause**: AKS does not natively enforce mTLS between services; Istio service mesh provides mutual TLS; this guide covers Istio 1.1.8 on K8s 1.13.5 — both are EOL versions

**Solution**:
DEPRECATED — use AKS Istio addon for modern approach. Historical steps (Istio 1.1.8): 1) Install via Helm with grafana/tracing enabled, set gateways type=NodePort for platforms without LoadBalancer; 2) Apply MeshPolicy kind with mtls peers for global mTLS; 3) Apply DestinationRule with host="*.local" trafficPolicy.tls.mode=ISTIO_MUTUAL; 4) For non-Istio services (no sidecar) add per-service DestinationRule with mode=DISABLE to allow plaintext; 5) Verify with curl between pods. Modern alternative: az aks create/update --enable-istio-addon

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 3.0 | Source: [onenote: MCVKB/Net/=======8.AKS=======/8.2[Deprec]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Istio service mesh addon not available on AKS Azure China cluster | Istio addon had no confirmed Mooncake GA date in Feature Lan... | Istio addon availability in Azure China is unconfirmed. Cons... | [B] 7.5 | [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Open Service Mesh (OSM) addon is being retired and will be removed on 30 Septemb... | OSM is deprecated by Microsoft in favor of Istio service mes... | Migrate to Istio following the migration guidance at https:/... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Addons%20and%20Extensions/Open%20Service%20Mesh) |
| 3 | AKS pods using Istio or service mesh experience connectivity issues on ports 130... | Istio/service mesh proxy reserves certain port ranges (inclu... | 1) Check if Istio or service mesh is installed in the cluste... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F13%20-%20Common%20Troubleshoot%20Steps) |
| 4 | [DEPRECATED] Customer asks how to enable encrypted pod-to-pod communication betw... | AKS does not natively enforce mTLS between services; Istio s... | DEPRECATED — use AKS Istio addon for modern approach. Histor... | [Y] 3.0 | [onenote: MCVKB/Net/=======8.AKS=======/8.2[Deprec] |
