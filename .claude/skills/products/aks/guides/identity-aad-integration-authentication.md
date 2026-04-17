# AKS AAD 集成与认证 — authentication -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 4
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Flux GitRepository shows not ready; FluxConfiguration not syncing or applying Gi... | GitRepository CR does not exist; auth secret missing or cont... | Verify GitRepository CR: kubectl get gitrepository -n <names... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.Flux%20FluxConfiguration%20TSG) |
| 2 | az aks get-credentials fails with error: The current subscription type is not pe... | The Azure CLI session is set to the wrong subscription conte... | Verify and set the correct subscription: az account set --su... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2Faz%20aks%20get%20credential%20throws%20subscription%20type%20not%20permitted) |
| 3 | AKS Dashboard not working after AAD integration; cannot access Kubernetes dashbo... | AAD application type configuration incorrect for AKS integra... | 1) Redeploy the AKS cluster with corrected AAD integration. ... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | az fleet get-credentials 获取 kubeconfig 后连接 Fleet Manager API server 失败，提示 device... | az fleet get-credentials 生成的 kubeconfig 默认使用 device code aut... | 运行 kubelogin convert-kubeconfig -l azurecli 将 kubeconfig 转为使... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%20Fleet%20Manager%2FTSG%2FCannot%20Connect%20FM) |

## Quick Troubleshooting Path

1. Check: Verify GitRepository CR: kubectl get gitrepository -n <namespace> <config-name> -o yaml; check auth  `[source: ado-wiki]`
2. Check: Verify and set the correct subscription: az account set --subscription <subId>, then retry `[source: ado-wiki]`
3. Check: 1) Redeploy the AKS cluster with corrected AAD integration `[source: onenote]`
