# AKS PV/PVC 与卷管理 — csi -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 6
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS PVC creation fails when using default azurefile-csi StorageClass; Azure Poli... | Default AKS StorageClass azurefile-csi provisions new storag... | 1) Pre-create a storage account with limited/private network... | [B] 6.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3] |
| 2 | Key Vault Secrets Provider: FailedMount - failed to get keyvault client: nmi res... | NMI component in aad-pod-identity returned error for token r... | Check NMI pod logs; refer to Microsoft Entra pod identity tr... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-key-vault-csi-secrets-store-csi-driver) |
| 3 | Key Vault Secrets Provider: StatusCode=400, Identity not found when mounting sec... | Incorrect userAssignedIdentityID specified in SecretProvider... | Get correct identity: az aks show --query addonProfiles.azur... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-key-vault-csi-secrets-store-csi-driver) |
| 4 | Key Vault Secrets Provider: driver name secrets-store.csi.k8s.io not found in li... | Secrets Store CSI Driver pods not running on the node where ... | Check CSI Driver pod status: kubectl get pod -l app=secrets-... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-key-vault-csi-secrets-store-csi-driver) |
| 5 | Key Vault Secrets Provider: SecretProviderClass not found when mounting volume | SecretProviderClass does not exist in same namespace as appl... | Create SecretProviderClass in same namespace as application ... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-key-vault-csi-secrets-store-csi-driver) |
| 6 | AKS node pool scaling fails with VMStartTimedOut error; agent pool nodes (jupyte... | VMSS side VM start failure. PPS (Proximity Placement Service... | 1) Investigate VMSS/VM side for start failures. 2) Check if ... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 1) Pre-create a storage account with limited/private network access (policy-compliant) `[source: onenote]`
2. Check: Check NMI pod logs; refer to Microsoft Entra pod identity troubleshooting guide; verify pod identity `[source: mslearn]`
3. Check: Get correct identity: az aks show --query addonProfiles `[source: mslearn]`
