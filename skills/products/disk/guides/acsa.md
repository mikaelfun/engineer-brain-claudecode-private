# Disk Azure Container Storage (Arc) — 排查速查

**来源数**: 4 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: acsa, azure-container-storage-arc, cloud-ingest, configmap, crashloopbackoff, createcontainerconfigerror, kubernetes, limitation, networking, pending-pod

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Azure Container Storage (Arc) pod in CrashLoopBackOff — pod keeps restarting repeatedly | Application failure or container misconfiguration causing the container process to exit with non-zer | 1) kubectl get pods -n <ns> to identify failing pod; 2) kubectl describe pod <name> -n <ns> for events; 3) kubectl logs  | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Azure Container Storage (Arc) pods stuck in Pending state — cannot be scheduled | Resource constraints (insufficient CPU/memory), unbound PersistentVolumeClaims, node taint not toler | 1) kubectl describe pod <name> -n <ns> for scheduling failure reason; 2) kubectl get nodes && kubectl describe node <nam | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Azure Container Storage (Arc) container fails to start with CreateContainerConfigError | Missing ConfigMap, missing Secret (secretKeyRef), volume/volumeMount/subPath mismatch, or node missi | 1) kubectl describe pod for Events section; 2) Check: configmap not found → create/fix ConfigMap; secret not found → cre | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Azure Container Storage (Arc) Cloud Ingest subvolume cannot use private endpoints; customer expects private networking b | Cloud Ingest currently relies on public endpoints of Azure Storage; private endpoint/private network | Use public endpoints for Cloud Ingest traffic; advise customer this is a current product limitation with no private netw | 🟢 8.5 | [ADO Wiki] |

## 快速排查路径

1. Azure Container Storage (Arc) pod in CrashLoopBackOff — pod keeps restarting rep → 1) kubectl get pods -n <ns> to identify failing pod; 2) kubectl describe pod <name> -n <ns> for even `[来源: ado-wiki]`
2. Azure Container Storage (Arc) pods stuck in Pending state — cannot be scheduled → 1) kubectl describe pod <name> -n <ns> for scheduling failure reason; 2) kubectl get nodes && kubect `[来源: ado-wiki]`
3. Azure Container Storage (Arc) container fails to start with CreateContainerConfi → 1) kubectl describe pod for Events section; 2) Check: configmap not found → create/fix ConfigMap; se `[来源: ado-wiki]`
4. Azure Container Storage (Arc) Cloud Ingest subvolume cannot use private endpoint → Use public endpoints for Cloud Ingest traffic; advise customer this is a current product limitation  `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acsa.md#排查流程)
