# AKS 节点性能与资源管理 — oom -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: node-fabric-info.md
**Generated**: 2026-04-07

---

## Phase 1: ama-logs replicaset pod memory usage exceeds defau

### aks-162: Container Insights ama-logs (ama-logs-rs) pod OOMKilled; monitoring addon pod re...

**Root Cause**: ama-logs replicaset pod memory usage exceeds default limit. PG disabled the previous backend adjustment process — CSS can no longer escalate ICM to PG to adjust resource limits for ama-logs pods.

**Solution**:
Customer self-tunes via configmap: 1) kubectl get cm -n kube-system | grep container-azm-ms-agentconfig; 2) if not exists, download from raw.githubusercontent.com/microsoft/Docker-Provider/ci_prod/kubernetes/container-azm-ms-agentconfig.yaml; 3) uncomment and set: monitoring_max_event_rate=50000, backpressure_memory_threshold_in_mb=1500, upload_max_size_in_mb=10, upload_frequency_seconds=1, compression_level=0; 4) apply configmap. TSG wiki: supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1880808

`[Score: [G] 9.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: API Server OOM killed event frequency exceeds 10 o

### aks-663: High rate of HTTP 429 responses from API Server. aks-managed-apiserver-guard flo...

**Root Cause**: API Server OOM killed event frequency exceeds 10 occurrences within 10 minutes. The overlaymgr/ccpautoscaler OOM watcher detects this and applies APF (API Priority and Fairness) throttling to protect the API server

**Solution**:
1) Inform customer this is protective throttling. 2) Customer should identify and fix unoptimized API clients. 3) Remove the flowschema and prioritylevelconfiguration. 4) If overlaymgr keeps re-creating them, add label aks-managed-skip-update-operation:true to prevent reconciliation. 5) Increase prioritylevelconfiguration values to loosen limits

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAPI%20Server%20Priority%20And%20Fairness%20Throttling)]`

## Phase 3: KSM v1.8 uses deprecated v1beta1 API endpoints rem

### aks-044: kube-state-metrics (KSM) pod CrashLoopBackOff after AKS patch update; logs show ...

**Root Cause**: KSM v1.8 uses deprecated v1beta1 API endpoints removed in newer K8s. KSM compatibility requires within 5 minor version gap. Failing API calls cause excessive retries and OOM.

**Solution**:
1) Delete old KSM deployment. 2) Redeploy from official v2.10 samples (github.com/kubernetes/kube-state-metrics/tree/main/examples/standard). 3) Update ClusterRole RBAC for new resource types. 4) Check KSM compatibility matrix before AKS upgrades.

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Rapid cluster scale-up (1 to 900 nodes in 10 minut

### aks-238: AKS API server OOMKilled on large cluster (900 nodes) causing control plane unav...

**Root Cause**: Rapid cluster scale-up (1 to 900 nodes in 10 minutes) combined with pod crashloops generates excessive API server load leading to OOM. Without uptime-SLA API server has limited resources.

**Solution**:
1) Enable uptime-SLA for production clusters with high node count. 2) Scale nodes gradually. 3) Fix pod crashloops to reduce API server pressure. 4) Engage AKS PG via IcM for persistent OOM.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Container Insights ama-logs (ama-logs-rs) pod OOMKilled; monitoring addon pod re... | ama-logs replicaset pod memory usage exceeds default limit. ... | Customer self-tunes via configmap: 1) kubectl get cm -n kube... | [G] 9.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | High rate of HTTP 429 responses from API Server. aks-managed-apiserver-guard flo... | API Server OOM killed event frequency exceeds 10 occurrences... | 1) Inform customer this is protective throttling. 2) Custome... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAPI%20Server%20Priority%20And%20Fairness%20Throttling) |
| 3 | kube-state-metrics (KSM) pod CrashLoopBackOff after AKS patch update; logs show ... | KSM v1.8 uses deprecated v1beta1 API endpoints removed in ne... | 1) Delete old KSM deployment. 2) Redeploy from official v2.1... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS API server OOMKilled on large cluster (900 nodes) causing control plane unav... | Rapid cluster scale-up (1 to 900 nodes in 10 minutes) combin... | 1) Enable uptime-SLA for production clusters with high node ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
