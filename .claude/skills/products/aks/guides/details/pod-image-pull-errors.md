# AKS 镜像拉取失败 -- Comprehensive Troubleshooting Guide

**Entries**: 2 | **Draft sources**: 0 | **Kusto queries**: 3
**Kusto references**: image-integrity.md, pod-restart-analysis.md, pod-subnet-sharing.md
**Generated**: 2026-04-07

---

## Phase 1: Image pull failure (private mode: invalid URL or p

### aks-734: Kaito workspace INFERENCEREADY condition not true; inference pod starts but neve...

**Root Cause**: Image pull failure (private mode: invalid URL or pull secrets), or inference image issue. Note: preset images are 30-100GB, expect long pull times.

**Solution**:
For image pull errors with private images: validate image URL and pull secrets. For preset model issues: contact Kaito dev team (kaito-dev@microsoft.com). For custom images: customer responsibility.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/AI%20Toolchain%20Operator%20%28Kaito%29)]`

## Phase 2: Inference images are very large (30-100GB); privat

### aks-1250: KAITO model inference image not pulled; resource ready condition not True after ...

**Root Cause**: Inference images are very large (30-100GB); private image access mode may block pull; networking setup affects pull speed

**Solution**:
Verify image access mode and pull secrets; expect longer pull times for large images (tens of minutes); check cluster networking configuration

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-ai-toolchain-operator-addon-issues)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Kaito workspace INFERENCEREADY condition not true; inference pod starts but neve... | Image pull failure (private mode: invalid URL or pull secret... | For image pull errors with private images: validate image UR... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/AI%20Toolchain%20Operator%20%28Kaito%29) |
| 2 | KAITO model inference image not pulled; resource ready condition not True after ... | Inference images are very large (30-100GB); private image ac... | Verify image access mode and pull secrets; expect longer pul... | [Y] 4.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-ai-toolchain-operator-addon-issues) |
