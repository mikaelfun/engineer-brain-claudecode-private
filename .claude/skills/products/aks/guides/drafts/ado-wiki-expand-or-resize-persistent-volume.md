---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Storage/Expand or Resize Persistent Volume"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FStorage%2FExpand%20or%20Resize%20Persistent%20Volume"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Expand a Persistent Volume on AKS

## Scenario

Customer has a dynamic PVC and wants to increase the amount of space.

## WARNING

It is best practice to have the customer backup any data before modifying the volume(s). Customer can leverage snapshots before making modifications.

## Steps to Check Which PV is Associated with Full File System

1. Connect via SSH to the node which the pod is reporting PV full
2. Run `df -lh`, check which mount point is full
3. Check which PVC is associated with mount point: `lsblk`

## Steps to Expand the Persistent Volume

1. Take a snapshot of the persistent volume
2. Check/Update the storage class to include `allowVolumeExpansion: true`
    - `kubectl get sc`
    - `kubectl edit sc <sc_name>`
    - Add `allowVolumeExpansion: true`
3. Scale the deployment/statefulset to zero replicas
   - `kubectl scale statefulset <name> --replicas=0`
4. Check the PODs were deleted and PV disk shows unattached from the portal
5. Update the PVC to the new GiB value
    - `kubectl edit pvc <pvcname>`
    - Modify the storage request size
6. Verify PVC status shows `FileSystemResizePending`
   - `kubectl get pvc <PVC_NAME> -o yaml`
   - If status is "resizing": ensure portal shows unattached, wait 15 minutes, check `kubectl get events -A`
7. Scale the deployment/statefulset back up
    - `kubectl scale statefulset <name> --replicas=3`

## Resources

- [Dynamic PVC](https://docs.microsoft.com/en-us/azure/aks/azure-disks-dynamic-pv#built-in-storage-classes)
- [Resizing Persistent Volumes](https://kubernetes.io/blog/2018/07/12/resizing-persistent-volumes-using-kubernetes/)
- [AKS Best Practices - back up data](https://docs.microsoft.com/en-us/azure/aks/operator-best-practices-storage#secure-and-back-up-your-data)
