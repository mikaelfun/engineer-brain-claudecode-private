# AKS Pod CrashLoopBackOff / 重启 -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 0 | **Kusto queries**: 2
**Kusto references**: pod-restart-analysis.md, pod-subnet-sharing.md
**Generated**: 2026-04-07

---

## Phase 1: Simultaneous etcd restart (2/3 replicas) caused et

### aks-119: AKS API server completely unreachable; 2 of 3 etcd instances restarted simultane...

**Root Cause**: Simultaneous etcd restart (2/3 replicas) caused etcd quorum loss, leading to cascading API server pod failure

**Solution**:
Control plane issue requiring PG investigation via ICM. Verify uptime SLA is enabled. For large clusters ensure control plane tier matches workload requirements.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Custom admission webhook (e.g., Kyverno) with fail

### aks-1173: API server pods in CrashLoopBackOff with webhook call failures; error 'failed ca...

**Root Cause**: Custom admission webhook (e.g., Kyverno) with failurePolicy=Fail causes deadlock during API server bootstrap - webhook blocks API server object creation, preventing API server and Konnectivity pods from starting

**Solution**:
Delete the validating and mutating webhook configurations causing the deadlock. For Kyverno, follow Kyverno troubleshooting guide. Consider setting failurePolicy to Ignore for webhooks that may interfere with system components.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-apiserver-etcd)]`

## Phase 3: Product issue with kube-svc-redirect component. Th

### aks-202: kube-svc-redirect pod shows frequent restarts (CrashLoopBackOff) in AKS cluster....

**Root Cause**: Product issue with kube-svc-redirect component. This was a known product-level bug affecting certain AKS versions.

**Solution**:
1) Check AKS version and upgrade to latest supported version. 2) If issue persists after upgrade, contact AKS PG for investigation. 3) This component handles service traffic redirection; frequent restarts may intermittently affect service routing.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Product issue with metrics-server component. metri

### aks-214: metrics-server pod in AKS cluster continuously crashes (CrashLoopBackOff). Kuber...

**Root Cause**: Product issue with metrics-server component. metrics-server pod unable to collect node/pod metrics, possibly due to network policy blocking, API server connectivity, or component version bug.

**Solution**:
Check metrics-server logs: kubectl logs -n kube-system -l k8s-app=metrics-server. Verify API server aggregation: kubectl get apiservice v1beta1.metrics.k8s.io. Check network policy not blocking port 10250. Restart: kubectl rollout restart deployment metrics-server -n kube-system. Engage AKS PG if product issue.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 5: After metrics-server restart it takes time to re-s

### aks-260: metrics-server reports unable to fetch pod metrics no metrics known for pod afte...

**Root Cause**: After metrics-server restart it takes time to re-scrape metrics from all kubelets. Also check for connection errors to kubelet:10250.

**Solution**:
1) Wait for metrics-server to complete full scrape cycle (~60s). 2) Check metrics-server logs for kubelet:10250 connection errors. 3) Verify tunnel functioning. 4) Check kubelet health on affected nodes.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 6: Containerd bug (github.com/containerd/containerd/i

### aks-994: Pod stuck in CrashLoopBackOff with 'exec format error' in logs. Binary file on d...

**Root Cause**: Containerd bug (github.com/containerd/containerd/issues/5854) causes incomplete image layer writes during pull. Affects containerd <1.7.14 or >=1.7.14 without image_pull_with_sync_fs enabled.

**Solution**:
1) Verify with 'crictl info | grep imagepullwithsyncfs'. 2) Enable image_pull_with_sync_fs by deploying a DaemonSet that modifies /etc/containerd/config.toml and restarts containerd. 3) Quick temp fix: delete corrupted image and redeploy pods to re-pull.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FPod%20failed%20to%20start%20with%20error%20exec%20format%20error)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS API server completely unreachable; 2 of 3 etcd instances restarted simultane... | Simultaneous etcd restart (2/3 replicas) caused etcd quorum ... | Control plane issue requiring PG investigation via ICM. Veri... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | API server pods in CrashLoopBackOff with webhook call failures; error 'failed ca... | Custom admission webhook (e.g., Kyverno) with failurePolicy=... | Delete the validating and mutating webhook configurations ca... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-apiserver-etcd) |
| 3 | kube-svc-redirect pod shows frequent restarts (CrashLoopBackOff) in AKS cluster.... | Product issue with kube-svc-redirect component. This was a k... | 1) Check AKS version and upgrade to latest supported version... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | metrics-server pod in AKS cluster continuously crashes (CrashLoopBackOff). Kuber... | Product issue with metrics-server component. metrics-server ... | Check metrics-server logs: kubectl logs -n kube-system -l k8... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | metrics-server reports unable to fetch pod metrics no metrics known for pod afte... | After metrics-server restart it takes time to re-scrape metr... | 1) Wait for metrics-server to complete full scrape cycle (~6... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | Pod stuck in CrashLoopBackOff with 'exec format error' in logs. Binary file on d... | Containerd bug (github.com/containerd/containerd/issues/5854... | 1) Verify with 'crictl info \| grep imagepullwithsyncfs'. 2)... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FPod%20failed%20to%20start%20with%20error%20exec%20format%20error) |
