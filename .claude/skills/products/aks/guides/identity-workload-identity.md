# AKS Workload Identity / OIDC -- Quick Reference

**Sources**: 4 | **21V**: Partial | **Entries**: 12
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS 集群启用 OIDC Issuer 后无法禁用，客户要求 disable OIDC 功能 | OIDC Issuer 一旦启用即为不可逆操作 (by design)。禁用 OIDC 会破坏依赖它的 Workload... | 1) 这是 by design，无法 disable; 2) 如客户坚持要禁用，唯一方案是创建新集群; 3) 启用前应评... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | 401 Unauthorized errors when authenticating to AKS API server using external ide... | Token audience (aud claim) mismatch with JWT authenticator c... | 1) Verify audience claim in token matches JWT authenticator ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/External%20Identity%20Providers%20for%20AKS%20Control%20Plane) |
| 3 | AKS Workload Identity: pod cannot fetch token, logs show failed to create confid... | Workload Identity webhook was not ready when the pod spawned... | Restart the affected pod. The webhook should be ready on sub... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20AD%20Workload%20Identity) |
| 4 | AKS Workload Identity components running in legacy namespace azure-workload-iden... | Previous versions of Workload Identity feature used the azur... | An IcM to PG is required to perform the migration to kube-sy... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Azure%20AD%20Workload%20Identity) |
| 5 | Need to access Azure Key Vault secrets from AKS pods using workload identity (OI... | AKS workload identity requires OIDC issuer to be enabled on ... | 1) Create AKS cluster with --enable-oidc-issuer --enable-wor... | [B] 6.5 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.4] |
| 6 | KEDA 2.14/2.15 breaking changes cause ScaledObject failures after AKS K8s upgrad... | KEDA 2.14 (K8s 1.30) removes: metadata.clientSecret for ADX ... | 1) Migrate pod-managed identity to workload identity. 2) Mov... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/changes-in-kubernetes-event-driven-autoscaling-add-on-214-215) |
| 7 | KEDA operator pods missing workload identity env vars (AZURE_TENANT_ID, AZURE_FE... | KEDA add-on enabled before Workload Identity was configured;... | Restart KEDA operator: kubectl rollout restart deployment ke... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-kubernetes-event-driven-autoscaling-add-on) |
| 8 | Customer tries to use Azure Active Directory pod-managed identities in AKS on Az... | AAD pod-managed identities feature is not available (NA) in ... | Use Workload Identity (OIDC issuer) instead, which is verifi... | [B] 6.0 | [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM] |
| 9 | AAD pod identity fails to authenticate in Mooncake; token requests fail or retur... | Mooncake uses different AAD resource endpoint. Pod must spec... | 1) Install from open-source: https://azure.github.io/aad-pod... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 10 | AKS workload identity (OIDC) fails when using Managed Identity (MSI) as federate... | Workload identity federation with MSI was not fully supporte... | Use application service principal instead of MSI for workloa... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 11 | Backup job fails on AKS cluster due to presence of residual nmi pod from AAD Pod... | After removing AAD Pod Identity addon, the nmi DaemonSet/pod... | Run 'az aks update -g <resource-group> -n <cluster-name> --d... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FBackup%20failing%20due%20to%20orphaned%20aad%20nmi%20pod) |
| 12 | 401 Unauthorized accessing AKS control plane via external identity providers - t... | JWT authenticator audience/issuer URL mismatch with token cl... | Verify iss/aud claims match JWT authenticator config; az aks... | [Y] 4.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/security/troubleshoot-aks-control-plane-authentication-external-identity-providers) |

## Quick Troubleshooting Path

1. Check: 1) 这是 by design，无法 disable; 2) 如客户坚持要禁用，唯一方案是创建新集群; 3) 启用前应评估影响; 4) 文档: https://docs `[source: onenote]`
2. Check: 1) Verify audience claim in token matches JWT authenticator config `[source: ado-wiki]`
3. Check: Restart the affected pod `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/identity-workload-identity.md)
