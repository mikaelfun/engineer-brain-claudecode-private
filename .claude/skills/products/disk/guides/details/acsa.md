# Disk Azure Container Storage (Arc) — 综合排查指南

**条目数**: 4 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-acsa-faq.md, ado-wiki-a-acsa-troubleshooting-guide.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Azure Container Storage Enabled by Azure Arc — FAQ
> 来源: ADO Wiki (ado-wiki-a-acsa-faq.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Container Storage Enabled by Azure Arc/FAQ Frequenly asked questions"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Container%20Storage%20Enabled%20by%20Azure%20Arc%2FFAQ%20Frequenly%20asked%20questions"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. In the beginning, it was called ESA (Edge Storage Accelerator) and was offered as a first-party storage system designed for Arc-connected Kubernetes clusters. Now it can be used as an optional component to provide local storage endpoints and synchron
6. Within IoT Operations, you can configure local storage data flow endpoints. These endpoints can use Azure Container Storage enabled by Azure Arc (ACSA).
7. As of right now, the data flow endpoints in AIO can use Local shared and cloud ingest volumes. ACSA offers the Cloud Mirror subvolumes. This functionality mirrors data from a cloud destination to the edge as a read-only copy.
8. - [Local Shared volumes](https://review.learn.microsoft.com/en-us/azure/azure-arc/container-storage/howto-configure-local-shared-edge-volumes)
9. - [Cloud Ingest subvolumes](https://review.learn.microsoft.com/en-us/azure/azure-arc/container-storage/howto-configure-cloud-ingest-subvolumes)
10. - [Cloud Mirror subvolumes](https://review.learn.microsoft.com/en-us/azure/azure-arc/container-storage/howto-configure-cloud-mirror-subvolumes)

### Phase 2: Azure Container Storage Enabled by Azure Arc — Troubleshooting Guide
> 来源: ADO Wiki (ado-wiki-a-acsa-troubleshooting-guide.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Container Storage Enabled by Azure Arc/Troubleshooting Guide"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Container%20Storage%20Enabled%20by%20Azure%20Arc%2FTroubleshooting%20Guide"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Check the Azure Portal for error messages related to PVC/volume provisioning.
6. kubectl describe pvc <PersistentVolumeClaim> -n <namespace>
7. kubectl describe pvc <PersistentVolumeClaim> -n <namespace>
8. A VolumeAttachment is a Kubernetes object that represents the intent to attach (or detach) a PersistentVolume (PV) to a specific node. It is automatically created by Kubernetes when a Pod using a PV is scheduled.
9. kubectl get volumeattachment
10. $pod = kubectl get pod -n kube-system -l app=csi-akshcicsi-controller -o jsonpath="{.items[0].metadata.name}"

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Container Storage (Arc) pod in CrashLoopBackOff — pod keeps restarting repeatedly | Application failure or container misconfiguration causing the container process to exit with non-zer | 1) kubectl get pods -n <ns> to identify failing pod; 2) kubectl describe pod <name> -n <ns> for events; 3) kubectl logs  | 🟢 8.5 | [ADO Wiki] |
| 2 | Azure Container Storage (Arc) pods stuck in Pending state — cannot be scheduled | Resource constraints (insufficient CPU/memory), unbound PersistentVolumeClaims, node taint not toler | 1) kubectl describe pod <name> -n <ns> for scheduling failure reason; 2) kubectl get nodes && kubectl describe node <nam | 🟢 8.5 | [ADO Wiki] |
| 3 | Azure Container Storage (Arc) container fails to start with CreateContainerConfigError | Missing ConfigMap, missing Secret (secretKeyRef), volume/volumeMount/subPath mismatch, or node missi | 1) kubectl describe pod for Events section; 2) Check: configmap not found → create/fix ConfigMap; secret not found → cre | 🟢 8.5 | [ADO Wiki] |
| 4 | Azure Container Storage (Arc) Cloud Ingest subvolume cannot use private endpoints; customer expects private networking b | Cloud Ingest currently relies on public endpoints of Azure Storage; private endpoint/private network | Use public endpoints for Cloud Ingest traffic; advise customer this is a current product limitation with no private netw | 🟢 8.5 | [ADO Wiki] |
