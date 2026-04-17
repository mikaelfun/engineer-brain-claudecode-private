# AKS PV/PVC 与卷管理 — csi-driver -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer reports CVE vulnerabilities in kube-system pod images (CSI drivers, ip-... | MCR-hosted kube-system images contain known CVEs in their ba... | DO NOT contact PG for CVE in MCR images. Contact owners: kub... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS Cost Analysis add-on enable fails with InvalidDiskCSISettingForCostAnalysis ... | Cost Analysis add-on requires Azure Disk CSI driver enabled ... | Enable Disk CSI driver: az aks update --enable-disk-driver. ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/aks-cost-analysis-add-on-issues) |
| 3 | CSI driver not enabled for AKS 1.21+ clusters in Mooncake; toggling with custom ... | CSI driver feature had not yet been rolled out to Mooncake r... | Historical issue resolved by subsequent Mooncake rollout. Fo... | [B] 5.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Need to access Azure Key Vault secrets/certificates from AKS pods using Secrets ... | AAD pod identity is deprecated. The replacement is workload ... | 1) Enable Key Vault Provider addon: az aks enable-addons --a... | [B] 5.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |

## Quick Troubleshooting Path

1. Check: DO NOT contact PG for CVE in MCR images `[source: onenote]`
2. Check: Enable Disk CSI driver: az aks update --enable-disk-driver `[source: mslearn]`
3. Check: Historical issue resolved by subsequent Mooncake rollout `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/storage-pv-pvc-csi-driver.md)
