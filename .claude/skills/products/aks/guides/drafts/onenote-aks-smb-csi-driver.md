# [AKS] Mount Non-Azure SMB Share via SMB CSI Driver

**Source:** MCVKB/VM+SCIM/18.26  
**Type:** How-To Guide  
**Product:** AKS  
**Date:** 2021-09-06

## Overview

AKS natively supports Azure File shares (SMB). For **non-Azure SMB shares** (e.g., Windows File Server, Samba), use the open-source **CSI Driver for SMB**.

> ⚠️ **Scope:** This is a GitHub community-supported driver, not official AKS support scope.  
> GitHub: https://github.com/kubernetes-csi/csi-driver-smb

## Prerequisites

- SMB server accessible from AKS node subnet (same VNet or VNet-peered)
- Credentials (username/password) for the SMB share

## Steps

### 1. Install SMB CSI Driver via Helm

```bash
helm repo add csi-driver-smb https://raw.githubusercontent.com/kubernetes-csi/csi-driver-smb/master/charts
helm install csi-driver-smb csi-driver-smb/csi-driver-smb --namespace kube-system
```

Verify pods: `kubectl get pods -n kube-system | grep csi-smb`

### 2. Create Secret for SMB Credentials

```bash
kubectl create secret generic smbcreds \
  --from-literal username=USERNAME \
  --from-literal password="PASSWORD"
```

### 3. Create PersistentVolume

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-smb
spec:
  capacity:
    storage: 10Gi          # Note: capacity is NOT enforced for SMB/NFS PVs
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  mountOptions:
    - dir_mode=0777
    - file_mode=0777
    - vers=3.0
  csi:
    driver: smb.csi.k8s.io
    readOnly: false
    volumeHandle: unique-volumeid   # must be unique in cluster
    volumeAttributes:
      source: "//10.240.0.8/myshare"   # SMB server path
    nodeStageSecretRef:
      name: smbcreds
      namespace: default
```

### 4. Create PersistentVolumeClaim

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: pvc-smb
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 5Gi
  volumeName: pv-smb
  storageClassName: ""
```

### 5. Mount in Pod/Deployment

```yaml
volumes:
  - name: smb
    persistentVolumeClaim:
      claimName: pvc-smb
```

## Notes

- **Capacity is not enforced** — Kubernetes does not enforce PV capacity for NFS/SMB; the backend storage controls limits
- **AccessMode ReadWriteMany** is required for SMB CSI driver
- For Windows File Server lab: deploy in same VNet as AKS nodes
