# [AKS] Mount Azure Blob NFS on AKS Pod

**Source:** MCVKB/VM+SCIM/18.30  
**Type:** How-To Guide  
**Product:** AKS (Mooncake / 21V)  
**Date:** 2021-11-29

## Overview

Azure Blob Storage NFS 3.0 is available in 21V Azure. This guide shows how to mount a Blob NFS share as a PersistentVolume in AKS pods.

**Doc:** https://docs.microsoft.com/en-us/azure/storage/blobs/network-file-system-protocol-support-how-to

## Prerequisites

- Blob Storage account with NFS 3.0 enabled
- AKS cluster in same VNet (or peered) as the storage account
- Private endpoint or service endpoint configured for storage

## Step 1 — Create PersistentVolume (NFS storageClass)

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: nfs-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteMany
  storageClassName: nfs
  nfs:
    path: "/storageaccountname/containername"
    server: storageaccountname.privatelink.blob.core.chinacloudapi.cn
  mountOptions:
    - sec=sys
    - vers=3
    - nolock
    - proto=tcp
```

## Step 2 — Create PersistentVolumeClaim

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nfs-pvc
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 1Gi
  storageClassName: nfs
```

## Step 3 — Create Pod with PVC

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: nfs-pod
spec:
  containers:
  - name: app
    image: mcr.azk8s.cn/azuredocs/azure-vote-front:v1
    volumeMounts:
    - mountPath: "/mnt/azure"
      name: nfs-volume
  volumes:
  - name: nfs-volume
    persistentVolumeClaim:
      claimName: nfs-pvc
```

## Notes

- Use **privatelink.blob.core.chinacloudapi.cn** endpoint for Mooncake (21V)
- `accessModes: ReadWriteMany` — multiple pods can mount simultaneously
- Mount options `sec=sys`, `vers=3`, `nolock`, `proto=tcp` are required for NFS 3.0
- Storage account must have NFS 3.0 and hierarchical namespace enabled
