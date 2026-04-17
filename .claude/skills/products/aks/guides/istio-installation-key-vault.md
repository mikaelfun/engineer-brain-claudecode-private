# AKS Istio 安装与配置 — key-vault -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 4
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Istio plug-in CA - istiod pods stuck in Init:0/2 state with 403 Forbidden error | Azure Key Vault access incorrectly configured - managed iden... | Grant permissions: az keyvault set-policy --object-id <MI-ob... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-plug-in-ca-certificate) |
| 2 | Istio plug-in CA - istiod pods stuck in Init:0/2 with SecretNotFound 404 error m... | Certificate secret objects missing or misconfigured in Azure... | Verify all 4 secret objects exist in Key Vault with correct ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-plug-in-ca-certificate) |
| 3 | Istio plug-in CA certificate changes in Key Vault not auto-detected by cluster | Auto-rotation for Azure Key Vault secrets provider add-on no... | Enable auto-rotation; check with az aks show --query addonPr... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-plug-in-ca-certificate) |
| 4 | Istio secure ingress gateway TLS not working - certificate secret not created | Azure Key Vault access for managed identity of secrets provi... | Verify secrets in aks-istio-ingress namespace; check Key Vau... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-ingress-gateway) |

## Quick Troubleshooting Path

1. Check: Grant permissions: az keyvault set-policy --object-id <MI-objectId> --secret-permissions get list; f `[source: mslearn]`
2. Check: Verify all 4 secret objects exist in Key Vault with correct names; ensure objects are of type Secret `[source: mslearn]`
3. Check: Enable auto-rotation; check with az aks show --query addonProfiles `[source: mslearn]`
