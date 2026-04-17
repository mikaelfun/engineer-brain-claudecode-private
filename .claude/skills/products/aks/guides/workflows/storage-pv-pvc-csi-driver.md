# AKS PV/PVC 与卷管理 — csi-driver — 排查工作流

**来源草稿**: ado-wiki-a-blob-csi-driver.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Blob CSI Driver
> 来源: ado-wiki-a-blob-csi-driver.md | 适用: 适用范围未明确

### 排查步骤

#### Blob CSI Driver

#### Scope

**Only managed version is supported.** Upstream version: push back to customer with upstream TSG and GitHub issues.

How to distinguish: In ASI > Feature section, managed BlobCSIDriver status shows blue.

#### Issue Types

* **Creation/Deletion** -> Focus on csi-blob-controller (CCP namespace)
* **Mount/Unmount** -> Focus on csi-blob-node (customer nodes) + kubelet logs

##### How to judge?

1. `kubectl describe pod <app-pod>` - check for Mount/Unmount keywords
2. `kubectl get pvc -A` / `kubectl get pv` - check PV/PVC status

#### Log Collection

##### Creation/Deletion Issues

Kusto query in AKSccplogs:
```
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where TIMESTAMP > ago(1d)
| where ccpNamespace == "{ccpNamespace}"
| where category contains "csi-blob-controller" or category contains "csi-provisioner-blob"
| order by TIMESTAMP desc
```

* `csi-blob-controller`: main container for debugging (logic, Azure requests)
* `csi-provisioner-blob`: sidecar (CreateVolume/DeleteVolume from kube-apiserver)

##### Mount/Unmount Issues

**CSI Blob Node Logs:**
* Option 1: Lockbox > CustomerCluster - Get pods logs > Extract `csi_blob_node_log.txt`
* Option 2: `kubectl logs <csi-blob-node-xxxx> -c blob`

**Kubelet Logs:** Search PV/PVC names in kubelet logs

**Client-side logs on Linux node:**
```bash
kubectl debug node/node-name --image=nginx
kubectl cp node-debugger-node-name-xxxx:/host/var/log/messages /tmp/messages
kubectl cp node-debugger-node-name-xxxx:/host/var/log/syslog /tmp/syslog
kubectl cp node-debugger-node-name-xxxx:/host/var/log/kern.log /tmp/kern.log
kubectl delete po node-debugger-node-name-xxxx
```

#### References

* Upstream: https://github.com/kubernetes-sigs/blob-csi-driver
* TSG: https://github.com/kubernetes-sigs/blob-csi-driver/blob/master/docs/csi-debug.md

**Owner:** Luis Alvarez <lualvare@microsoft.com>

---
