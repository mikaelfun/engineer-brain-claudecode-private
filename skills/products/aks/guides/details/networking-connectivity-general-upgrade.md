# AKS 网络连通性通用 — upgrade -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 2
**Kusto references**: auto-upgrade.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Calico has compatibility issues with K8s 1.25 chan

### aks-125: AKS cluster with Calico network policy should not upgrade to K8s 1.25; may cause...

**Root Cause**: Calico has compatibility issues with K8s 1.25 changes (cgroups v2, PSP removal, API deprecations)

**Solution**:
Check Calico compatibility matrix before upgrading. Update Calico to 1.25-compatible version or use Azure Network Policy

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Cluster entered failed state from prior quota/subn

### aks-1178: AKS cluster upgrade or scale operation fails when cluster is in failed state due...

**Root Cause**: Cluster entered failed state from prior quota/subnet/PDB issues. Operations cannot proceed on a failed-state cluster.

**Solution**:
For quota: scale back within quota, request increase, then retry. For subnet: see SubnetIsFull troubleshooting. For PDB: remove or adjust PDB so pods can drain. For deprecated APIs (1.26+): mitigate stopped upgrade due to deprecated APIs before retrying.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/upgrading-or-scaling-does-not-succeed)]`

## Phase 3: AKS reconcile/upgrade controller has ~2h40m timeou

### aks-017: AKS upgrade or update operation fails with OperationTimeout / InternalOperationE...

**Root Cause**: AKS reconcile/upgrade controller has ~2h40m timeout. Large clusters or PDB-blocked drain can exceed this. Conditions: no BBM/QoS data, cluster failed state, VMSS latest mode, reconcile triggered reimage.

**Solution**:
1) Query AsyncQoSEvents in Kusto akscn.kusto.chinacloudapi.cn to confirm OperationTimeout. 2) Query AsyncContextActivity with correlationID to find blocking step. 3) Check PDB: kubectl get pdb --all-namespaces. 4) Check CRP/DRP logs for slow node provisioning. 5) Retry after fixing blocking condition.

`[Score: [B] 5.5 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster with Calico network policy should not upgrade to K8s 1.25; may cause... | Calico has compatibility issues with K8s 1.25 changes (cgrou... | Check Calico compatibility matrix before upgrading. Update C... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS cluster upgrade or scale operation fails when cluster is in failed state due... | Cluster entered failed state from prior quota/subnet/PDB iss... | For quota: scale back within quota, request increase, then r... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/upgrading-or-scaling-does-not-succeed) |
| 3 | AKS upgrade or update operation fails with OperationTimeout / InternalOperationE... | AKS reconcile/upgrade controller has ~2h40m timeout. Large c... | 1) Query AsyncQoSEvents in Kusto akscn.kusto.chinacloudapi.c... | [B] 5.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |
