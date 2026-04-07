# AKS RBAC 与授权 — general -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 7
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After customer deleted a VMSS node directly at VMSS level, updating apiServerAut... | AKS reconciliation during PutManagedCluster detects node cou... | Do not delete VMSS nodes directly at VMSS level. Use AKS nod... | [G] 9.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Updating AKS APIServerAuthorizedIPRanges triggers unexpected node pool scaling; ... | When a customer manually deletes a VMSS instance, AKS RP sti... | 1) Never delete VMSS instances manually; use az aks nodepool... | [G] 9.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | Pod creation rejected: pods is forbidden: pod node label selector conflicts with... | PodNodeSelector admission controller enforces the namespace ... | 1) Check namespace annotation: kubectl get ns <ns> -o yaml \... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAdmission%20Controllers) |
| 4 | Microsoft Defender publisher pods crash (OOMKilled) with 403 error sending data ... | Invalid LA workspace credentials in kubernetes secret micros... | Compare secret credentials (kubectl get secrets -n kube-syst... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Security%20and%20Identity/Microsoft%20defender%20publisher%20pods%20crashing%20%28OOMKilled%29%20with%20403%20errors) |
| 5 | Support engineer needs JIT access to perform AKS customer control plane operatio... | All Mooncake customer environment access requires ESCORT pro... | 1) Create ICM ticket at portal.microsofticm.com (template tm... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 6 | Azure CLI commands for AKS fail in Mooncake with API version errors or unexpecte... | Azure CLI version is too new/high for the Mooncake API versi... | 1) Downgrade Azure CLI to a version compatible with Mooncake... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | Azure Key Vault experiences high number of 401 Unauthorized failed requests from... | AKV provider relies on Azure Key Vault SDKs which use a toke... | No mitigation needed from AKS side - by-design behavior of A... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FRepeated%20401%20Unauthorized%20Errors%20in%20Azure%20Key%20Vault%20(AKV)) |

## Quick Troubleshooting Path

1. Check: Do not delete VMSS nodes directly at VMSS level `[source: onenote]`
2. Check: 1) Never delete VMSS instances manually; use az aks nodepool scale or az aks nodepool delete-machine `[source: onenote]`
3. Check: 1) Check namespace annotation: kubectl get ns <ns> -o yaml | grep node-selector `[source: ado-wiki]`
