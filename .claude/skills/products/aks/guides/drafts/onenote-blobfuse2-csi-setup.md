# Blobfuse2 CSI Driver Setup on AKS

> Source: OneNote - Mooncake POD Support Notebook

## Prerequisites
- AKS cluster with blob CSI driver enabled
- Storage account and container created

## Step-by-step

### 1. Enable CSI blob driver
```bash
az aks update --enable-blob-driver --resource-group <rg> --name <cluster>
```

### 2. Create storage secret
```bash
kubectl create secret generic azure-secret \
  --from-literal=azurestorageaccountname=<account> \
  --from-literal=azurestorageaccountkey=<key>
```

### 3. Define StorageClass
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: blobfuse2
provisioner: blob.csi.azure.com
parameters:
  skuName: Standard_LRS
  containerName: <container-name>
  protocol: fuse2
reclaimPolicy: Retain
volumeBindingMode: Immediate
```

### 4. Create PVC
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: blobfuse2-pvc
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: blobfuse2
  resources:
    requests:
      storage: 5Gi
```

### 5. Create Pod with mount
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: blobfuse2-pod
spec:
  containers:
    - name: blobfuse2-container
      image: nginx
      volumeMounts:
        - mountPath: "/mnt/blob"
          name: blob-storage
  volumes:
    - name: blob-storage
      persistentVolumeClaim:
        claimName: blobfuse2-pvc
```

### 6. Validate
```bash
kubectl get pvc blobfuse2-pvc       # should be Bound
kubectl get pod blobfuse2-pod       # should be Running
kubectl exec -it blobfuse2-pod -- ls /mnt/blob
```

## Notes
- For managed identity auth, see aks-onenote-178 (static mount with MSI)
- For troubleshooting blobfuse mount issues, see aks-onenote-060, aks-onenote-049
- YAML capacity field is informational only for blob storage (see aks-onenote-170)
