# AKS Flux / GitOps -- Comprehensive Troubleshooting Guide

**Entries**: 1 | **Draft sources**: 1 | **Kusto queries**: 1
**Source drafts**: ado-wiki-a-Microsoft-Flux-Extension-Installation-TSG.md
**Kusto references**: extension-manager.md
**Generated**: 2026-04-07

---

## Phase 1: fluxconfigs.clusterconfig.azure.com CRD does not e

### aks-654: FluxConfiguration resource is stuck in Creating state or changes are not being a...

**Root Cause**: fluxconfigs.clusterconfig.azure.com CRD does not exist on the cluster; typically caused by failed or incomplete Flux extension installation

**Solution**:
Re-issue PUT request on the microsoft.flux extension to reinitialize the helm install loop and re-provision the CRD. If re-issuing PUT fails, delete the current microsoft.flux extension and reinstall it

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.Flux%20FluxConfiguration%20TSG)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | FluxConfiguration resource is stuck in Creating state or changes are not being a... | fluxconfigs.clusterconfig.azure.com CRD does not exist on th... | Re-issue PUT request on the microsoft.flux extension to rein... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.Flux%20FluxConfiguration%20TSG) |
