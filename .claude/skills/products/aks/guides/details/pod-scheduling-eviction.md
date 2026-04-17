# AKS Pod 调度与驱逐 -- Comprehensive Troubleshooting Guide

**Entries**: 9 | **Draft sources**: 0 | **Kusto queries**: 2
**Kusto references**: pod-restart-analysis.md, pod-subnet-sharing.md
**Generated**: 2026-04-07

---

## Phase 1: AKS managed service does not expose kubelet config

### aks-215: AKS does not support kubelet configuration such as Hard/Soft Eviction Thresholds

**Root Cause**: AKS managed service does not expose kubelet configuration parameters by default (as of 2020)

**Solution**:
Develop a DaemonSet to apply custom kubelet config on each node. Later AKS versions support --kubelet-config flag

`[Score: [G] 8.0 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 2: Since March 2025, AKS CCP scheduler uses maxSkew=1

### aks-833: CCP scheduler spreads pods aggressively across zones; unexpected scheduling beha...

**Root Cause**: Since March 2025, AKS CCP scheduler uses maxSkew=1 (down from 5) for topology.kubernetes.io/zone, aggressively spreading multi-replica deployments across zones.

**Solution**:
Specify TopologySpreadConstraints in deployment spec with desired maxSkew (e.g. maxSkew: 5) to override AKS CCP default. Verify via KubeScheduler logs for --config= and maxSkew entries.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/CCP%20Scheduler)]`

## Phase 3: AKS blocks requests that contain duplicate taints 

### aks-922: Request to add node initialization taints fails with duplicate permanent/initial...

**Root Cause**: AKS blocks requests that contain duplicate taints between the 'nodeTaints' (permanent, AKS-managed) and 'nodeInitializationTaints' fields.

**Solution**:
Remove the duplicate taint from one of the two fields (nodeTaints or nodeInitializationTaints) to resolve the conflict.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Initialization%20Taints)]`

## Phase 4: GPU driver issues (incorrect, corrupted, or outdat

### aks-984: Node Problem Detector (NPD) reports GPU conditions (GpuCount) on AKS nodes; pods...

**Root Cause**: GPU driver issues (incorrect, corrupted, or outdated drivers preventing proper GPU detection), GPU hardware malfunction, or NPD misconfiguration leading to incorrect GPU condition detection/reporting

**Solution**:
1) Identify affected nodes via KubeNodeStatusCondition Kusto query filtering by GpuCount condition. 2) Run nvidia-smi (or rocm-smi for AMD) on the node to check driver status. 3) Review /var/log/azure/cluster-provision.log and dmesg | grep -i nvidia for driver errors. 4) Reboot for transient issues; reimage/delete node for persistent driver/hardware problems

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FGPU%20Node%20Problem%20Detector)]`

## Phase 5: Node taints not tolerated by pod spec

### aks-1107: Pod Pending: untolerated taint on nodes

**Root Cause**: Node taints not tolerated by pod spec

**Solution**:
Check taints: kubectl get nodes -o json | jq .items[].spec.taints; add tolerations to pod spec; or remove taint

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-pod-scheduler-errors)]`

## Phase 6: When a VM is shut down, the node becomes NotReady 

### aks-183: AKS StatefulSet pod is evicted ~5 minutes after VM shutdown (by design), but Kub...

**Root Cause**: When a VM is shut down, the node becomes NotReady after node-monitor-grace-period. Pod is evicted after pod-eviction-timeout (~5 min by default). However, endpoint controller update timing may lag behind pod eviction, especially for StatefulSets which have stricter lifecycle guarantees.

**Solution**:
Investigate endpoint controller logs for delays. Check if readiness probes are correctly configured. For StatefulSets, consider using headless services and verify pod readiness probe configuration. This behavior needs further investigation with specific cluster logs.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 7: Node may be cordoned (SchedulingDisabled), have ta

### aks-176: Kubernetes node stops scheduling new pods but node status shows Ready/Healthy; e...

**Root Cause**: Node may be cordoned (SchedulingDisabled), have taints preventing scheduling, or have resource pressure (CPU/memory) that prevents new pod admission despite appearing healthy.

**Solution**:
Check node status: kubectl describe node <name>. Look for taints, cordoned status, or resource pressure conditions. Uncordon if needed: kubectl uncordon <node>. Remove problematic taints if applicable.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 8: If Scheduler Profile Config Mode is ManagedByCRD: 

### aks-1056: kube-scheduler CrashLoopBackOff with error: unexpected field, remove it or turn ...

**Root Cause**: If Scheduler Profile Config Mode is ManagedByCRD: customer entered configuration with features unsupported in their k8s version. If Default mode: base kube-scheduler configuration was changed incompatibly with older clusters.

**Solution**:
For ManagedByCRD mode: SchedulerCtrl will automatically rollback to last known good config. For Default mode: check recent changes in aks-rp kube-scheduler charts/helmvalues and immediately escalate via ICM if multiple clusters are impacted.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Scheduler%20Customization%20-%20kube-scheduler)]`

## Phase 9: SchedulerConfigurations have a finalizer (schedule

### aks-1057: SchedulerConfiguration custom resource stuck in Terminating state and cannot be ...

**Root Cause**: SchedulerConfigurations have a finalizer (schedulerconfigurations.aks.azure.com/finalizer) that only gets removed when the scheduler is returned to its default state and is healthy.

**Solution**:
Ensure the kube-scheduler is healthy first. Then manually edit the SchedulerConfiguration to remove the finalizer. Contact Serverless SIG for RCA. Do NOT disable User-Defined Scheduler Configuration feature before resolving this, as it may cause the cluster to get stuck in Updating state.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Scheduler%20Customization%20-%20kube-scheduler)]`

---

## Known Issues Quick Reference

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
