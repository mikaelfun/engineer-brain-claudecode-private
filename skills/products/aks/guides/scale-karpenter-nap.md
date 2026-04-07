# AKS Karpenter / NAP -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | NAP/Karpenter VM creation fails with quota exceeded errors | Azure subscription quota exceeded; NodePool CRD limited to f... | Request quota increases via Azure portal; expand NodePool CR... | [G] 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision) |
| 2 | NAP/Karpenter stuck provisioning and repeatedly failing on the same instance typ... | Karpenter does not yet have proper implementation for certai... | Exclude the problematic SKU from the NodePool using 'node.ku... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29) |
| 3 | Karpenter consolidation messages appear in logs but customer interprets them as ... | Karpenter consolidation is working as designed - it attempts... | 1) Explain consolidation logic to customer; 2) Verify behavi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29) |
| 4 | NAP NodeClaim initialization failures across multiple regions with VMExtensionPr... | CRP (Compute Resource Provider) provisioning issues causing ... | 1) Check async_context_activity for VMExtensionProvisioningE... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FNode%20Autoprovision%20%28Karpenter%29) |
| 5 | NAP/Karpenter nodes not removed - underused or empty nodes remain in cluster lon... | Pods without proper tolerations, DaemonSets preventing drain... | Add proper tolerations to pods, review DaemonSet configs, ad... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision) |
| 6 | NAP/Karpenter spot VM unexpected node terminations when using spot instances | Azure spot VM eviction due to capacity reclaim or price thre... | Use diverse instance types in NodePool CRD, implement proper... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision) |

## Quick Troubleshooting Path

1. Check: Request quota increases via Azure portal; expand NodePool CRDs to include more VM sizes `[source: mslearn]`
2. Check: Exclude the problematic SKU from the NodePool using 'node `[source: ado-wiki]`
3. Check: 1) Explain consolidation logic to customer; 2) Verify behavior via KarpenterEvents Kusto table; 3) I `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/scale-karpenter-nap.md)
