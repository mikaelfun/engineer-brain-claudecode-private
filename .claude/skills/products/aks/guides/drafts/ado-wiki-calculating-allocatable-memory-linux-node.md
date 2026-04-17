---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Calculating allocatable memory on a Linux node"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Calculating%20allocatable%20memory%20on%20a%20Linux%20node"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Calculating allocatable memory on a Linux AKS node

## Formula

**Usable node memory = User Space Available memory - Kube Reserved - Hard Eviction Threshold - Current Memory Requests**

### 1. Kernel Space Memory (~3% of total VM memory)

```bash
dmesg | grep Memory:
# Output: Memory: 65811048K/67107716K available (... 1296668K reserved ...)
# Green = user space available, Red = total VM memory
```

### 2. Kube-Reserved Memory

Formula from [AKS docs](https://learn.microsoft.com/en-us/azure/aks/concepts-clusters-workloads#resource-reservations):
- 25% of first 4 GB
- 20% of next 4 GB (up to 8 GB)
- 10% of next 8 GB (up to 16 GB)
- 6% of next 112 GB (up to 128 GB)
- 2% of any memory above 128 GB

Example: 64 GiB VM → 1+0.8+0.8+2.88 = 5.48 GiB (5611Mi)

Verify:
```bash
kubectl debug node/<node> -it --image=mcr.microsoft.com/dotnet/runtime-deps:6.0
chroot /host
ps -ef | grep kubelet | grep "kube-reserved"
# --kube-reserved=cpu=260m,memory=5611Mi
```

### 3. Hard Eviction Threshold

Default: 750 MiB

```bash
ps -ef | grep kubelet | grep "eviction-hard"
```

### 4. System Pods and DaemonSets

Sum memory requests of all system pods on node. Use separate system nodepool to reduce impact.

### Example (64 GiB VM)

55.76 GiB = 62.76 - 5.48 - 0.75 - 0.776
