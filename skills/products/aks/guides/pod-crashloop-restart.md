# AKS Pod CrashLoopBackOff / 重启 -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS API server completely unreachable; 2 of 3 etcd instances restarted simultane... | Simultaneous etcd restart (2/3 replicas) caused etcd quorum ... | Control plane issue requiring PG investigation via ICM. Veri... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | API server pods in CrashLoopBackOff with webhook call failures; error 'failed ca... | Custom admission webhook (e.g., Kyverno) with failurePolicy=... | Delete the validating and mutating webhook configurations ca... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/troubleshoot-apiserver-etcd) |
| 3 | kube-svc-redirect pod shows frequent restarts (CrashLoopBackOff) in AKS cluster.... | Product issue with kube-svc-redirect component. This was a k... | 1) Check AKS version and upgrade to latest supported version... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | metrics-server pod in AKS cluster continuously crashes (CrashLoopBackOff). Kuber... | Product issue with metrics-server component. metrics-server ... | Check metrics-server logs: kubectl logs -n kube-system -l k8... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | metrics-server reports unable to fetch pod metrics no metrics known for pod afte... | After metrics-server restart it takes time to re-scrape metr... | 1) Wait for metrics-server to complete full scrape cycle (~6... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | Pod stuck in CrashLoopBackOff with 'exec format error' in logs. Binary file on d... | Containerd bug (github.com/containerd/containerd/issues/5854... | 1) Verify with 'crictl info \| grep imagepullwithsyncfs'. 2)... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FPod%20failed%20to%20start%20with%20error%20exec%20format%20error) |

## Quick Troubleshooting Path

1. Check: Control plane issue requiring PG investigation via ICM `[source: onenote]`
2. Check: Delete the validating and mutating webhook configurations causing the deadlock `[source: mslearn]`
3. Check: 1) Check AKS version and upgrade to latest supported version `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/pod-crashloop-restart.md)
