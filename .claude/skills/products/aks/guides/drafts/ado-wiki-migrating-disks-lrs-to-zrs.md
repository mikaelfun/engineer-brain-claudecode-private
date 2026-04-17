---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Storage/Migrating disks from LRS to ZRS tiers"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Storage/Migrating%20disks%20from%20LRS%20to%20ZRS%20tiers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Migrating disks from LRS to ZRS tiers in AKS

**Prerequisite:** This would need the cluster support multiple nodepools feature, and the region support Availability Zone(AZ), or please create a new cluster and create snapshot for disk and then follow the below document to mount the disk accordingly.

## Static mode

**Pre-step:** make sure the cluster got Azure Disk CSI driver installed and grant the permission properly. Or please follow <https://github.com/kubernetes-sigs/azuredisk-csi-driver/blob/master/docs/install-driver-on-aks.md>

1. Change the PV's reclaim policy to Retain.
2. Scale down the replicas of the stateful set/deployment to 0 to make the disks detach from the VMSS instances gracefully: `kubectl scale statefulset web  --replicas=0`
3. Take snapshots for all the disks used by the stateful set/deployment
4. Delete the PVC: `kubectl delete pvc www-web-0`
5. Create new disk into proper availability zone from the snapshot we took before
6. Create new PV and PVC (old name)with below YAML files, please note we need to replace the parameter accordingly.
7. Cordon the old node pools to let the pod could only be rescheduled on availability zone nodepool
8. Scale the stateful set/deployment back: `kubectl scale statefulset web  --replicas=1`
9. After we could confirm all application pods works properly, please delete the PV/restored disk and uncordon/delete the old nodepool

   ```yaml
   ---
   kind: PersistentVolumeClaim
   apiVersion: v1
   metadata:
     name: www-web-0
   spec:
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 1Gi
     volumeName: pv-azuredisk
     storageClassName: ""
   ---
   apiVersion: v1
   kind: PersistentVolume
   metadata:
     name: pv-azuredisk
   spec:
     capacity:
       storage: 1Gi
     accessModes:
       - ReadWriteOnce
     persistentVolumeReclaimPolicy: Retain
     csi:
       driver: disk.csi.azure.com
       readOnly: false
       volumeHandle: /subscriptions/{sub-id}/resourcegroups/{group-name}/providers/microsoft.compute/disks/{disk-id}
       volumeAttributes:
         fsType: ext4
   ```

## Dynamic mode

**Note:** To revert back the disk to non-availability zone, you could just follow above steps but just create the disk in non-availability zone using the snapshot.

### For stateful set

1. Scale down the replicas of the stateful set to 0 to make the disks detach from the VMSS instances gracefully.
   ```sh
   kubectl scale statefulset <statefulSetName> --replicas=0
   ```
2. Take snapshots for all the disks used by the stateful set.
3. Manually delete the PVCs and it will automatically delete the corresponding PVs and the disks: `kubectl delete pvc <PVCName>`
4. Cordon the old node pools and then scale up the replicas to the same count as before.
   ```sh
   kubectl cordon <nodesWithoutAvailabilityZone>
   kubectl scale statefulset <statefulSetName> --replicas=<originalCount>
   ```
5. Once the pods are scheduled to the new node pool, please take a record of the correspondence between the new created pods, PVCs, availability zones and disks.
6. Then Scale down the replicas of the stateful set to 0 again to make the disks detach from the VMSS instances gracefully.
7. Delete the new created disks from Azure portal and then create the corresponding disks with proper availability zone from the snapshots we took before.
8. Once all the disks are created, we can then scale up the stateful set to the same count as before.
9. Uncordon the old node pool to complete the migration.

### For deployment

(**Note:** with deployment using PVC, only one PV would be created with one PVC, thus multiple replicas in different zone could not mount the same disk)

1. Scale down the replica of the deployment to 0 to make the disks detach from the VMSS instances gracefully.
2. Take snapshots for all the disks used by the deployment.
3. Manually delete the PVCs and it will automatically delete the corresponding PVs and the disks.
4. Cordon the old node pools and then recreate the PVCs again. After that, scale up the replicas to the same count as before.
5. Once the pods are scheduled to the new node pool, please take a record of the correspondence between the new created pods, PVCs, availability zones and disks.
6. Then Scale down the replicas of the deployment to 0 again to make the disks detach from the VMSS instances gracefully.
7. Delete the new created disks from Azure portal and then create the corresponding disks with proper availability zone from the snapshots we took before.
8. Once all the disks are created, we can then scale up the deployment to the same count as before.
9. Uncordon the old node pool to complete the migration.

## Use CSI Driver Snapshot to achieve the goal

1. As an example, cordon the AZ node while deploying the pod
   ```sh
   kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/storageclass-azuredisk-csi.yaml
   kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/pvc-azuredisk-csi.yaml
   kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/nginx-pod-azuredisk.yaml
   ```
   > **NOTE** Ignore above if we already have a pod running in non-zone node
   ```sh
   kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/snapshot/storageclass-azuredisk-snapshot.yaml
   kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/snapshot/azuredisk-volume-snapshot.yaml
   ```

## Create new storage class YAML in non-zone or Availability zone

### Zone YAML

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: managed-csi-zone-1 
provisioner: disk.csi.azure.com
parameters:
  skuName: StandardSSD_LRS
reclaimPolicy: Delete
volumeBindingMode: Immediate
allowVolumeExpansion: true
allowedTopologies:
- matchLabelExpressions:
  - key: topology.kubernetes.io/zone
    values:
    - australiaeast-1  # specify the zone name
```

### Non-zone YAML

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: managed-csi-none-zone
provisioner: disk.csi.azure.com
parameters:
  skuName: StandardSSD_LRS
reclaimPolicy: Delete
volumeBindingMode: Immediate
allowVolumeExpansion: true
allowedTopologies:
- matchLabelExpressions:
  - key: topology.kubernetes.io/zone
    values:
    - ""
```

## Create PVC using the new storage class

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-azuredisk-snapshot-restored
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: managed-csi-zone-1 #none-zone use "managed-csi-none-zone" here
  resources:
    requests:
      storage: 10Gi
  dataSource:
    name: azuredisk-volume-snapshot
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
```

## Recreate the pod

`kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/azuredisk-csi-driver/master/deploy/example/snapshot/nginx-pod-restored-snapshot.yaml`
