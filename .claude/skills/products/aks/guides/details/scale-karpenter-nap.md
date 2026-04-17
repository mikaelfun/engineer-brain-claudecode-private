# AKS Karpenter / NAP -- Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: scale-upgrade-operations.md
**Generated**: 2026-04-07

---

## Phase 1: Azure subscription quota exceeded; NodePool CRD li

### aks-1280: NAP/Karpenter VM creation fails with quota exceeded errors

**Root Cause**: Azure subscription quota exceeded; NodePool CRD limited to few VM sizes increasing quota hit probability

**Solution**:
Request quota increases via Azure portal; expand NodePool CRDs to include more VM sizes

`[Score: [G] 8.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision)]`

## Phase 2: Karpenter does not yet have proper implementation 

### aks-908: NAP/Karpenter stuck provisioning and repeatedly failing on the same instance typ...

**Root Cause**: Karpenter does not yet have proper implementation for certain instance types or their specific settings. When it encounters an unsupported SKU, it keeps retrying the same failing type.

**Solution**:
Exclude the problematic SKU from the NodePool using 'node.kubernetes.io/instance-type' with operator 'NotIn' in the requirements section. This unblocks the scaler to use other instance types.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29)]`

## Phase 3: Karpenter consolidation is working as designed - i

### aks-914: Karpenter consolidation messages appear in logs but customer interprets them as ...

**Root Cause**: Karpenter consolidation is working as designed - it attempts to reschedule/consolidate workloads to reduce infrastructure costs. These messages are informational, not errors.

**Solution**:
1) Explain consolidation logic to customer; 2) Verify behavior via KarpenterEvents Kusto table; 3) If needed, reproduce in isolated cluster using inflation deployment from wiki doc to demonstrate normal behavior.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29)]`

## Phase 4: CRP (Compute Resource Provider) provisioning issue

### aks-910: NAP NodeClaim initialization failures across multiple regions with VMExtensionPr...

**Root Cause**: CRP (Compute Resource Provider) provisioning issues causing VMExtensionProvisioningError failures that affect NodeClaims across regions. May correlate with known Sev1 incidents.

**Solution**:
1) Check async_context_activity for VMExtensionProvisioningError loops; 2) Verify CRP health status; 3) Cross-reference known Sev1 incidents if NodeClaims fail across regions.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29)]`

## Phase 5: Pods without proper tolerations, DaemonSets preven

### aks-1276: NAP/Karpenter nodes not removed - underused or empty nodes remain in cluster lon...

**Root Cause**: Pods without proper tolerations, DaemonSets preventing drain, PDBs not correctly set, do-not-disrupt annotations, or locks blocking changes

**Solution**:
Add proper tolerations to pods, review DaemonSet configs, adjust PDBs to allow disruption, remove do-not-disrupt annotations, review lock configs

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision)]`

## Phase 6: Azure spot VM eviction due to capacity reclaim or 

### aks-1279: NAP/Karpenter spot VM unexpected node terminations when using spot instances

**Root Cause**: Azure spot VM eviction due to capacity reclaim or price threshold; insufficient instance type diversity

**Solution**:
Use diverse instance types in NodePool CRD, implement proper PDBs, consider mixed spot/on-demand strategies, use workloads tolerant of preemption

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | NAP/Karpenter VM creation fails with quota exceeded errors | Azure subscription quota exceeded; NodePool CRD limited to f... | Request quota increases via Azure portal; expand NodePool CR... | [G] 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision) |
| 2 | NAP/Karpenter stuck provisioning and repeatedly failing on the same instance typ... | Karpenter does not yet have proper implementation for certai... | Exclude the problematic SKU from the NodePool using 'node.ku... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29) |
| 3 | Karpenter consolidation messages appear in logs but customer interprets them as ... | Karpenter consolidation is working as designed - it attempts... | 1) Explain consolidation logic to customer; 2) Verify behavi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29) |
| 4 | NAP NodeClaim initialization failures across multiple regions with VMExtensionPr... | CRP (Compute Resource Provider) provisioning issues causing ... | 1) Check async_context_activity for VMExtensionProvisioningE... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29) |
| 5 | NAP/Karpenter nodes not removed - underused or empty nodes remain in cluster lon... | Pods without proper tolerations, DaemonSets preventing drain... | Add proper tolerations to pods, review DaemonSet configs, ad... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision) |
| 6 | NAP/Karpenter spot VM unexpected node terminations when using spot instances | Azure spot VM eviction due to capacity reclaim or price thre... | Use diverse instance types in NodePool CRD, implement proper... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision) |
