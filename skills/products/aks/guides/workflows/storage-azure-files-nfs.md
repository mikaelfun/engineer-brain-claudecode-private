# AKS Azure Files NFS — 排查工作流

**来源草稿**: ado-wiki-using-nfs-for-pod-storage.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Using NFS for Pod Storage
> 来源: ado-wiki-using-nfs-for-pod-storage.md | 适用: 适用范围未明确

### 排查步骤

#### Using NFS for Pod Storage

#### Summary and Goals

Fairly recently, a preview feature was added to storage accounts which allows customers to create NFS shares. I have had a handful of cases where customers are trying to use these NFS shares with their AKS cluster in some form or another. Setting up the storage on the pods hasn't always been straight forward when I've done testing. The two scenarios that I am going to cover are manually connecting a pod to a NFS Share and using the CSI driver to create a storage class.

##### Prerequisites

* Functional AKS cluster
* Azure Storage Account

#### Implementation Steps

##### Setting up the Storage Account to allow NFS

1. Use the documentation at <https://docs.microsoft.com/en-us/azure/storage/files/storage-files-how-to-create-nfs-shares?tabs=azure-portal> to enable the preview feature and create a new storage account that has NFS enabled.
2. Once the storage account is set up, disable secure transfer in the storage account configuration. This step isn't mentioned in the instructions, but it is needed to allow access to the NFS share using NFS in a PV and when creating a storage class for NFS. It is required for both scenarios discussed in this guide.

##### Using NFS by manually creating a PV and PVC

1. Gather the connection information from the NFS share on the storage account. The storage account name, share name, and the IP address of the NFS server are all needed to connect to the NFS share.
2. Create a PV and PVC that uses the NFS share:

    ```yaml
    apiVersion: v1
    kind: PersistentVolume
    metadata:
      name: nfs-pv
    spec:
      capacity:
        storage: 1Gi
      accessModes:
        - ReadWriteMany
      persistentVolumeReclaimPolicy: Retain
      storageClassName: nfs
      nfs:
        server: <storage account name>.file.core.windows.net
        path: /<share name>
        readOnly: false
    ---
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: nfs-pvc
    spec:
      accessModes:
        - ReadWriteMany
      storageClassName: nfs
      resources:
        requests:
          storage: 1Gi
    ```

    Note: storage capacity, mount version, server, and path should be updated to reflect the actual storage account information.

3. Create a pod that uses the PVC:

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: nfs-test
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: nfs-test
      template:
        metadata:
          labels:
            app: nfs-test
        spec:
          containers:
            - name: nfs-test
              image: busybox
              command: ["/bin/sh", "-c", "while true; do date >> /mnt/outfile; sleep 1; done"]
              volumeMounts:
              - name: nfs-pv
                mountPath: /mnt
          volumes:
            - name: nfs-pv
              persistentVolumeClaim:
                claimName: nfs-pvc
    ```

##### Using the CSI Driver to create a storage class which will automatically create NFS Shares

1. Create a storage account using the instructions in the first section of this guide.

2. Add a role assignment to the storage account that grants appropriate permissions to the managed identities used by the AKS cluster. Contributor access is the best general purpose role to provide, however a custom role could be used if the appropriate permissions are included.

3. Setup Networking on the Storage Account to allow access from the cluster. Configure either "Selected Networks" on the firewall configuration or create a private endpoint.

4. Configure the CSI Driver to use the storage account by following the documentation at: <https://docs.microsoft.com/en-us/azure/aks/azure-files-csi#create-a-storage-account-for-the-nfs-file-share>.

   **Important**: When creating the new StorageClass in the cluster, be sure to use the `azurefile-csi-nfs` storage class. If you use the `azurefile-csi` storage class, the driver will try to create a SMB share instead of an NFS share.

#### Key Gotchas

- Must disable secure transfer on the storage account for NFS access
- Use `azurefile-csi-nfs` StorageClass, NOT `azurefile-csi` (which creates SMB shares)
- Storage account networking must allow AKS VNET access or use private endpoint

#### Owner and Contributors

**Owner:** Adam Margherio <amargherio@microsoft.com>

---
