# AKS Azure Files SMB — csi-driver — 排查工作流

**来源草稿**: onenote-aks-smb-csi-driver.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: AKS 挂载非 Azure SMB Share（SMB CSI Driver）
> 来源: onenote-aks-smb-csi-driver.md | 适用: 适用范围未明确

### 排查步骤

#### AKS 挂载非 Azure SMB Share（SMB CSI Driver）

> ⚠️ **支持范围声明**: 这是开源社区方案（kubernetes-csi/csi-driver-smb），**不在 Microsoft 官方支持范围内**。
> Azure File 问题应通过正常 AKS 产品支持渠道处理。

#### 场景

客户需要将同一 VNET 内的 Windows File Server（非 Azure Storage）挂载为 AKS Pod 的 PersistentVolume。

AKS 原生 Azure File CSI 只支持 Azure Storage Account，不支持任意 SMB Server。

#### 前提条件

- SMB Server 与 AKS node 在同一 VNET 或 Peered VNET
- SMB Server 已共享目录并有认证凭据

---

#### 步骤

##### 1. 安装 SMB CSI Driver

```bash
helm repo add csi-driver-smb \
  https://raw.githubusercontent.com/kubernetes-csi/csi-driver-smb/master/charts
helm install csi-driver-smb csi-driver-smb/csi-driver-smb \
  --namespace kube-system
```

验证:
```bash
kubectl get pods -n kube-system -l app=csi-smb-node
```

##### 2. 创建认证 Secret

```bash
kubectl create secret generic smbcreds \
  --from-literal username=USERNAME \
  --from-literal password="PASSWORD"
```

##### 3. 创建 PersistentVolume

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-smb
spec:
  capacity:
    storage: 10Gi   # ⚠️ 此值仅为标记，Kubernetes 不对 SMB/NFS 强制执行容量限制
  accessModes:
    - ReadWriteMany  # SMB 要求使用 ReadWriteMany
  persistentVolumeReclaimPolicy: Retain
  mountOptions:
    - dir_mode=0777
    - file_mode=0777
    - vers=3.0
  csi:
    driver: smb.csi.k8s.io
    readOnly: false
    volumeHandle: unique-volume-id-001    # 集群内唯一 ID
    volumeAttributes:
      source: "//10.240.0.8/myshare"     # SMB Server IP + 共享名
    nodeStageSecretRef:
      name: smbcreds
      namespace: default
```

##### 4. 创建 PVC

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
  storageClassName: ""  # ⚠️ 必须显式设为空字符串，否则使用 default StorageClass
```

##### 5. 在 Pod 中使用

```yaml
volumeMounts:
  - name: smb
    mountPath: "/mnt/smb"
    readOnly: false
volumes:
  - name: smb
    persistentVolumeClaim:
      claimName: pvc-smb
```

---

#### 重要说明

| 项目 | 说明 |
|------|------|
| 容量限制 | Kubernetes **不强制** SMB/NFS PV 容量 — 实际可用大小由存储后端决定 |
| accessModes | 必须使用 `ReadWriteMany` |
| 网络要求 | SMB Server 需在同 VNET 或 Peered VNET |
| 支持范围 | 社区/GitHub 范围，非 Microsoft 官方支持 |

---
