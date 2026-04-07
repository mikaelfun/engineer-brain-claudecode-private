# AKS 网络连通性通用 — upgrade -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS cluster with Calico network policy should not upgrade to K8s 1.25; may cause... | Calico has compatibility issues with K8s 1.25 changes (cgrou... | Check Calico compatibility matrix before upgrading. Update C... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS cluster upgrade or scale operation fails when cluster is in failed state due... | Cluster entered failed state from prior quota/subnet/PDB iss... | For quota: scale back within quota, request increase, then r... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/upgrading-or-scaling-does-not-succeed) |
| 3 | AKS upgrade or update operation fails with OperationTimeout / InternalOperationE... | AKS reconcile/upgrade controller has ~2h40m timeout. Large c... | 1) Query AsyncQoSEvents in Kusto akscn.kusto.chinacloudapi.c... | [B] 5.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |

## Quick Troubleshooting Path

1. Check: Check Calico compatibility matrix before upgrading `[source: onenote]`
2. Check: For quota: scale back within quota, request increase, then retry `[source: mslearn]`
3. Check: 1) Query AsyncQoSEvents in Kusto akscn `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-connectivity-general-upgrade.md)
