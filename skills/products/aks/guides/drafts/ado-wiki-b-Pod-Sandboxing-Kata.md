---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Pod Sandboxing and Kernel Isolation (kata)"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FPod%20Sandboxing%20and%20Kernel%20Isolation%20%28kata%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Pod Sandboxing and Kernel Isolation (Kata)

## Overview

Pod Sandboxing provides an isolation boundary between the container application and the shared kernel and compute resources of the container host. Publicly referenced as "Pod Sandboxing", internally as kernel isolation or "Kata".

The CPlat, Confidential Compute, and MSR teams provide a HVLite implementation supporting Linux as the Dom0 controller, allowing AKS Linux VMs to partition into Hypervisor boundaries for workloads.

## Troubleshooting

### How to check if cluster is Kata enabled

Get all runtimeclasses:

```bash
kubectl get runtimeclasses
```

Expected output should include `kata-mshv-vm-isolation` with handler `kata`. If this runtimeClass doesn't exist, pods referencing it will get:

```
Error from server (Forbidden): pods "untrusted" is forbidden: pod rejected: RuntimeClass "kata-mshv-vm-isolation" not found
```

The runtimeClass is automatically created by OverlayManager when:
- k8s version >= 1.24.0
- `KataVMIsolationPreview` feature flag is registered on the subscription

Verify runtimeClass content:

```bash
kubectl get runtimeclasses kata-mshv-vm-isolation -o yaml
```

Key fields:
- `handler: kata` must match containerd config
- `scheduling.nodeSelector` must match node labels
- At least one node pool must have matching `nodeSelector`

### How to check if agent pool is Kata enabled

**Via ASI** (easiest):
1. Search for cluster on ASI home page
2. Click Node Pools > select node pool
3. Look for `Is Kata` in Features section
4. Check node labels for `kubernetes.azure.com/kata-mshv-vm-isolation=true`

**Via az CLI**:
```bash
az aks show -n <clusterName> -g <groupName>
```
Look for `nodeImageVersion` containing `kata` substring, `osSku: Mariner`, and `workloadRuntime: KataMshvVmIsolation`.

**Via kubectl**:
```bash
kubectl describe nodes <node-name>
```
Look for label `kubernetes.azure.com/kata-mshv-vm-isolation=true`.

### How to check RP service logs

```kusto
FrontEndContextActivity
| where PreciseTimeStamp > ago(7d)
| where msg contains "Kata: "
| project msg, resourceGroupName, resourceName, serviceBuild, Environment, region, level, TIMESTAMP
| order by TIMESTAMP desc
```

Success message: `Kata: Using Mariner Kata distro`

## Known Issues

### FailedCreatePodSandBox

```
Warning  FailedCreatePodSandBox  kubelet  Failed to create pod sandbox: rpc error: code = Unknown desc = failed to create containerd task: failed to create shim task: error: Put "http://localhost/api/v1/vm.boot": EOF reason: : unknown
```

This indicates a Kata software stack issue. **Escalate via ICM.**

### Kata pod stuck in Running phase

Pod does not transition to `Succeeded` phase after container command finishes. Rare and not consistently reproducible. **Escalate to feature owner.**

## References

- Feature owner: Fanglu Guo (fangluguo@microsoft.com)
- https://learn.microsoft.com/en-gb/azure/aks/use-pod-sandboxing
- https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/kata-enabled-nodes-tsg
