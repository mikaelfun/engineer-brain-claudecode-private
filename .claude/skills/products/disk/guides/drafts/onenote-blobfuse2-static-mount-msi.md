# Blobfuse2 Static Mount with Managed Identity on AKS

## Key Points

1. Identity = kubelet identity of AKS cluster (named `xxx-agentpool`)
2. **Static mount**: `Storage Blob Data Contributor` on storage account
3. **Dynamic mount**: `Storage Blob Data Contributor` on resource group

## Steps: SC -> PV -> PVC -> Pod

### StorageClass
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: blob-fuse
provisioner: blob.csi.azure.com
parameters:
  skuName: Premium_LRS
  protocol: fuse
  AzureStorageAuthType: MSI
  AzureStorageIdentityClientID: "<kubelet-identity-client-id>"
reclaimPolicy: Delete
volumeBindingMode: Immediate
allowVolumeExpansion: true
mountOptions:
  - -o allow_other
  - --file-cache-timeout-in-seconds=120
  - --use-attr-cache=true
  - --cancel-list-on-mount-seconds=10
  - -o attr_timeout=120
  - -o entry_timeout=120
  - -o negative_timeout=120
  - --log-level=LOG_WARNING
  - --cache-size-mb=1000
```

### PersistentVolume
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  annotations:
    pv.kubernetes.io/provisioned-by: blob.csi.azure.com
  name: my-blob-pv
spec:
  capacity:
    storage: 1Ti
  accessModes: ["ReadOnlyMany"]
  persistentVolumeReclaimPolicy: Retain
  storageClassName: blob-fuse
  mountOptions:
    - -o allow_other
    - --file-cache-timeout-in-seconds=0
    - --use-attr-cache=true
  csi:
    driver: blob.csi.azure.com
    volumeHandle: "<storageaccount>_<container>"
    volumeAttributes:
      protocol: fuse
      resourceGroup: <rg>
      storageAccount: <account>
      containerName: <container>
      AzureStorageAuthType: MSI
      AzureStorageIdentityClientID: "<kubelet-identity-client-id>"
```

## Debug Reference
- [blob-csi-driver debug guide](https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/csi-debug.md)
- [blob-csi-driver MI examples](https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/deploy/example/blobfuse-mi/README.md)
