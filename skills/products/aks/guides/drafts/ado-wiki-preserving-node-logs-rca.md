---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Preserving node logs for RCA"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FPreserving%20node%20logs%20for%20RCA"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Preserving node logs for RCA (Root Cause Analysis)

## Summary

Guide for preserving AKS node logs for Root Cause Analysis. Covers:
1. Prevent a problematic node from being removed by Cluster Autoscaler
2. Collect logs from a preserved node
3. Create OS disk snapshots when a node cannot be kept running
4. Restore an OS disk snapshot to a new VM for investigation

## Preventing node removal by Cluster Autoscaler

### Adding the scale-down-disabled annotation

```bash
kubectl get nodes
kubectl annotate node <node-name> cluster-autoscaler.kubernetes.io/scale-down-disabled=true
```

### Verifying the annotation

```bash
kubectl get node <node-name> -o jsonpath='{.metadata.annotations}' | grep scale-down-disabled
```

### Removing the annotation when done

```bash
kubectl annotate node <node-name> cluster-autoscaler.kubernetes.io/scale-down-disabled-
```

Note the trailing dash (`-`) which indicates the annotation should be removed.

## Collecting logs from a preserved node

### For regular VMs (with persistent OS disks)
Use the "Inspect IaaS Disk" option in ASC.

### For VMs with ephemeral disks
Use the "Guest Agent VM Logs" collection option in ASC.

## Creating OS disk snapshots

### When to create a snapshot
- Node is critically impaired and might shut down
- Need to preserve exact state for forensic analysis
- Node needs to return to service but logs still need analysis

### Creating an OS disk snapshot
Follow: [How to take a snapshot of a VMSS instance](https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-faq#how-do-i-take-a-snapshot-of-a-virtual-machine-scale-set-instance-)

1. Identify the VMSS instance ID and resource group
2. Create a snapshot of the OS disk
3. Store the snapshot securely

## Restoring an OS disk snapshot to a new VM

1. Create a new managed disk from the snapshot
2. Create a new VM using the managed disk
3. Connect to the VM to analyze logs

References:
- [Create a managed disk from a snapshot](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/snapshot-copy-managed-disk)
- [Create a VM from a managed disk](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/create-vm-specialized-portal)
