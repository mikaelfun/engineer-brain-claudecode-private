# AKS Pod 调度与驱逐 -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 9
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS does not support kubelet configuration such as Hard/Soft Eviction Thresholds | AKS managed service does not expose kubelet configuration pa... | Develop a DaemonSet to apply custom kubelet config on each n... | [G] 8.0 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 2 | CCP scheduler spreads pods aggressively across zones; unexpected scheduling beha... | Since March 2025, AKS CCP scheduler uses maxSkew=1 (down fro... | Specify TopologySpreadConstraints in deployment spec with de... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/CCP%20Scheduler) |
| 3 | Request to add node initialization taints fails with duplicate permanent/initial... | AKS blocks requests that contain duplicate taints between th... | Remove the duplicate taint from one of the two fields (nodeT... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Initialization%20Taints) |
| 4 | Node Problem Detector (NPD) reports GPU conditions (GpuCount) on AKS nodes; pods... | GPU driver issues (incorrect, corrupted, or outdated drivers... | 1) Identify affected nodes via KubeNodeStatusCondition Kusto... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FGPU%20Node%20Problem%20Detector) |
| 5 | Pod Pending: untolerated taint on nodes | Node taints not tolerated by pod spec | Check taints: kubectl get nodes -o json \| jq .items[].spec.... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-pod-scheduler-errors) |
| 6 | AKS StatefulSet pod is evicted ~5 minutes after VM shutdown (by design), but Kub... | When a VM is shut down, the node becomes NotReady after node... | Investigate endpoint controller logs for delays. Check if re... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | Kubernetes node stops scheduling new pods but node status shows Ready/Healthy; e... | Node may be cordoned (SchedulingDisabled), have taints preve... | Check node status: kubectl describe node <name>. Look for ta... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 8 | kube-scheduler CrashLoopBackOff with error: unexpected field, remove it or turn ... | If Scheduler Profile Config Mode is ManagedByCRD: customer e... | For ManagedByCRD mode: SchedulerCtrl will automatically roll... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Scheduler%20Customization%20-%20kube-scheduler) |
| 9 | SchedulerConfiguration custom resource stuck in Terminating state and cannot be ... | SchedulerConfigurations have a finalizer (schedulerconfigura... | Ensure the kube-scheduler is healthy first. Then manually ed... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Scheduler%20Customization%20-%20kube-scheduler) |

## Quick Troubleshooting Path

1. Check: Develop a DaemonSet to apply custom kubelet config on each node `[source: onenote]`
2. Check: Specify TopologySpreadConstraints in deployment spec with desired maxSkew (e `[source: ado-wiki]`
3. Check: Remove the duplicate taint from one of the two fields (nodeTaints or nodeInitializationTaints) to re `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/pod-scheduling-eviction.md)
