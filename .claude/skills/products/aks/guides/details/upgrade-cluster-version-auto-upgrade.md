# AKS 集群版本升级 — auto-upgrade -- Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 0 | **Kusto queries**: 4
**Kusto references**: auto-upgrade.md, cluster-snapshot.md, lts-status.md, scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: AKS disabled unmanaged Canonical nightly security 

### aks-134: AKS nodes running unattended Canonical nightly security updates causing unexpect...

**Root Cause**: AKS disabled unmanaged Canonical nightly security updates by Sept 2023 to prevent uncontrolled node restarts. Clusters without an explicit node OS upgrade channel setting default to None.

**Solution**:
Proactively set node OS upgrade channel to NodeImage or SecurityPatch. Use az aks update --node-os-upgrade-channel. Docs: https://learn.microsoft.com/azure/aks/auto-upgrade-node-image

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: AKS platform support policy: all clusters auto-upg

### aks-101: AKS platform auto-upgrades clusters from unsupported K8s versions (N-3 to N-4) t...

**Root Cause**: AKS platform support policy: all clusters auto-upgraded before K8s version drops from N-3 to N-4, honoring maintenance windows. By-design.

**Solution**:
Set maintenance window to control timing; use auto-upgrade channel proactively; monitor K8s version support status.

`[Score: [B] 7.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: As new Kubernetes versions are released, the previ

### aks-452: TargetK8sVersionNotSupported error appears in existing Fleet auto-upgrade profil...

**Root Cause**: As new Kubernetes versions are released, the previously supported target version became LTS-only (beyond N-2 range). The auto-upgrade profile does not have longTermSupport enabled.

**Solution**:
Enable longTermSupport in the auto-upgrade profile and on all fleet member clusters to continue using the now-LTS-only Kubernetes version.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FTargetK8sVersionNotSupported%20Error)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS nodes running unattended Canonical nightly security updates causing unexpect... | AKS disabled unmanaged Canonical nightly security updates by... | Proactively set node OS upgrade channel to NodeImage or Secu... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS platform auto-upgrades clusters from unsupported K8s versions (N-3 to N-4) t... | AKS platform support policy: all clusters auto-upgraded befo... | Set maintenance window to control timing; use auto-upgrade c... | [B] 7.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | TargetK8sVersionNotSupported error appears in existing Fleet auto-upgrade profil... | As new Kubernetes versions are released, the previously supp... | Enable longTermSupport in the auto-upgrade profile and on al... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FTargetK8sVersionNotSupported%20Error) |
