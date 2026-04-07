# Blobfuse2 CSI Driver Setup on AKS

## Steps

1. **Enable CSI driver on AKS cluster**
   ```bash
   az aks update --enable-blob-driver --resource-group <rg> --name <aks>
   ```

2. **Create storage account secret**
   ```bash
   kubectl create secret generic azure-secret \
     --from-literal=azurestorageaccountname=<account> \
     --from-literal=azurestorageaccountkey=<key>
   ```

3. **Define StorageClass** (key: `protocol: fuse2`)
   ```yaml
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: blobfuse2
   provisioner: blob.csi.azure.com
   parameters:
     skuName: Standard_LRS
     containerName: <container>
     protocol: fuse2
   reclaimPolicy: Retain
   volumeBindingMode: Immediate
   ```

4. **Create PVC**
   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: blobfuse2-pvc
   spec:
     accessModes: ["ReadWriteMany"]
     storageClassName: blobfuse2
     resources:
       requests:
         storage: 5Gi
   ```

5. **Mount in Pod**
   ```yaml
   volumes:
     - name: blob-storage
       persistentVolumeClaim:
         claimName: blobfuse2-pvc
   ```

6. **Validate**
   ```bash
   kubectl get pvc blobfuse2-pvc
   kubectl get pod blobfuse2-pod
   kubectl exec -it blobfuse2-pod -- /bin/sh
   ```
