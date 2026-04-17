# AKS PV/PVC 与卷管理 — csi-driver -- Comprehensive Troubleshooting Guide

**Entries**: 4 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-blob-csi-driver.md
**Generated**: 2026-04-07

---

## Phase 1: MCR-hosted kube-system images contain known CVEs i

### aks-088: Customer reports CVE vulnerabilities in kube-system pod images (CSI drivers, ip-...

**Root Cause**: MCR-hosted kube-system images contain known CVEs in their base layers or dependencies. These are managed by AKS platform team and customers cannot patch them directly.

**Solution**:
DO NOT contact PG for CVE in MCR images. Contact owners: kubernetes-csi -> Andy; ip-masq-agent/azure-npm -> Paul Miller; kube-proxy -> Fuyuan; cnm -> Qingchuan; ciprod -> Rashmi. CVEs fixed via node image updates.

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Cost Analysis add-on requires Azure Disk CSI drive

### aks-1213: AKS Cost Analysis add-on enable fails with InvalidDiskCSISettingForCostAnalysis ...

**Root Cause**: Cost Analysis add-on requires Azure Disk CSI driver enabled AND managed identity (system or user-assigned). Missing either prerequisite causes enablement failure

**Solution**:
Enable Disk CSI driver: az aks update --enable-disk-driver. Enable managed identity: az aks update --enable-managed-identity. Also requires Standard or Premium tier (not free tier)

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/aks-cost-analysis-add-on-issues)]`

## Phase 3: CSI driver feature had not yet been rolled out to 

### aks-278: CSI driver not enabled for AKS 1.21+ clusters in Mooncake; toggling with custom ...

**Root Cause**: CSI driver feature had not yet been rolled out to Mooncake region for 1.21+ clusters as of May 2021. The custom header toggle was also not functional at that time.

**Solution**:
Historical issue resolved by subsequent Mooncake rollout. For current clusters, CSI driver is enabled by default on AKS 1.21+.

`[Score: [B] 5.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: AAD pod identity is deprecated. The replacement is

### aks-282: Need to access Azure Key Vault secrets/certificates from AKS pods using Secrets ...

**Root Cause**: AAD pod identity is deprecated. The replacement is workload identity + Secrets Store CSI Driver. The Mooncake documentation had not yet published this integration method, but it is functional. Requires OIDC issuer enabled on AKS cluster and a SecretProviderClass configured with workload identity parameters.

**Solution**:
1) Enable Key Vault Provider addon: az aks enable-addons --addons azure-keyvault-secrets-provider --name <cluster> --resource-group <rg>. 2) Enable OIDC issuer and workload identity on cluster (see OIDC issuer setup). 3) Create SecretProviderClass YAML with usePodIdentity: false, useVMManagedIdentity: false, clientID: <SP-client-id>, keyvaultName, tenantId, and objects array listing secrets/keys/certs. 4) Create ServiceAccount with azure.workload.identity/client-id annotation. 5) Create federated identity credential binding SP, SA and OIDC issuer. 6) Deploy pod with serviceAccountName set and azure.workload.identity/use: true label; mount CSI volume with driver: secrets-store.csi.k8s.io and secretProviderClass reference. Test image: k8sgcr.azk8s.cn/e2e-test-images/busybox:1.29-1. Ref: https://docs.azure.cn/en-us/aks/csi-secrets-store-driver

`[Score: [B] 5.0 | Source: [onenote: MCVKB/wiki_migration/======VM&SCIM======]]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer reports CVE vulnerabilities in kube-system pod images (CSI drivers, ip-... | MCR-hosted kube-system images contain known CVEs in their ba... | DO NOT contact PG for CVE in MCR images. Contact owners: kub... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS Cost Analysis add-on enable fails with InvalidDiskCSISettingForCostAnalysis ... | Cost Analysis add-on requires Azure Disk CSI driver enabled ... | Enable Disk CSI driver: az aks update --enable-disk-driver. ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/aks-cost-analysis-add-on-issues) |
| 3 | CSI driver not enabled for AKS 1.21+ clusters in Mooncake; toggling with custom ... | CSI driver feature had not yet been rolled out to Mooncake r... | Historical issue resolved by subsequent Mooncake rollout. Fo... | [B] 5.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Need to access Azure Key Vault secrets/certificates from AKS pods using Secrets ... | AAD pod identity is deprecated. The replacement is workload ... | 1) Enable Key Vault Provider addon: az aks enable-addons --a... | [B] 5.0 | [onenote: MCVKB/wiki_migration/======VM&SCIM======] |
