# AKS ACI 网络与 DNS — managed-identity -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 10
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACI 使用 Managed Identity 拉取 ACR 镜像时报错：InvalidImageRegistryCredentialType — identi... | 客户使用的 ACI API 版本低于 2021-07-01，该版本不支持 Managed Identity 认证方式。 | 要求客户升级 ARM Template 使用的 API 版本至 2021-07-01 或更新版本，参考：https://... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FManaged%20Identity%20Auth%20Image%20Pulls) |
| 2 | ACI 使用 Managed Identity 拉取 ACR 镜像时报错：AmbiguousImageRegistryCredentialType / Inva... | Container Group ARM Template 定义不规范：imageRegistryCredentials ... | 检查 ARM Template：1. imageRegistryCredentials 中 username 和 ide... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FManaged%20Identity%20Auth%20Image%20Pulls) |
| 3 | ACI 使用 Managed Identity 拉取 ACR 私有镜像时报错：InaccessibleImage — image is not accessib... | Managed Identity 实例未被授予 ACR 的 Pull 权限（AcrPull RBAC role）。 | 1. 为 Managed Identity 分配 ACR AcrPull 角色，参考：https://docs.micr... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FManaged%20Identity%20Auth%20Image%20Pulls) |
| 4 | ACI Container Group deletion fails because associated Managed Identity or Key Va... | CG uses encrypted volumes referencing deleted Managed Identi... | 1) Validate via ASI Failed Delete Operations detector; 2) Qu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 5 | ACI Managed Identity image pull from ACR fails with permission or image name err... | When using Managed Identity to pull images from ACR, ACI con... | 1) Ensure the Managed Identity has AcrPull RBAC role on the ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FPlatform%20and%20Tools%2FArchitecture%20Diagrams%2FMI%20Auth%20Architecture) |
| 6 | ACI container group creation fails with HTTP 400/500 due to throttling at Manage... | Multiple credential request calls to Managed Identity servic... | Limit calls to Managed Identity service per documented rate ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Throttling%20at%20Managed%20Identity%20service) |
| 7 | ACI InaccessibleImage error when pulling from ACR with firewall rules enabled, u... | ACR 防火墙规则阻止了 ACI 服务的调用。使用 Service Principal 时无法穿透 ACR 防火墙，必须... | 改用 Managed Identity 拉取镜像，启用 ACR trusted services 访问。参考文档: ht... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20InaccessibleImage%20Error) |
| 8 | Unable to delete ACI Container Group due to missing managed identity or Key Vaul... | Related to Emerging Issue 68347; delete operation fails when... | Open CRI/IcM. EEE uses ACIS Action ACI/Delete Container Grou... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/List%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 9 | ACI MSI token request failure — AccessTokenRequestEvent shows successful=False; ... | Subscription may lack access to the managed identity, or an ... | 1) Query Kusto AccessTokenRequestEvent filtering by TIMESTAM... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20MSITokenRequestFailure) |
| 10 | ACI MSI token request failure — AccessTokenRequestEvent shows successful=False, ... | Multiple possible causes: 1) Subscription does not have acce... | 1) Check Kusto AccessTokenRequestEvent table filtered by TIM... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20MSITokenRequestFailure) |

## Quick Troubleshooting Path

1. Check: 要求客户升级 ARM Template 使用的 API 版本至 2021-07-01 或更新版本，参考：https://docs `[source: ado-wiki]`
2. Check: 检查 ARM Template：1 `[source: ado-wiki]`
3. Check: 1 `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/aci-networking-managed-identity.md)
