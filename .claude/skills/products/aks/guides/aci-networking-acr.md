# AKS ACI 网络与 DNS — acr -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 3
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACI container creation fails with RegistryErrorResponse / TOOMANYREQUESTS (HTTP ... | Docker Hub rate limiting. Azure-Docker IP allowlist agreemen... | 1) Authenticate Docker pulls with Docker account credentials... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI_Docker_RateLimit) |
| 2 | ACI InaccessibleImage error: 'The image is not accessible. Please check the imag... | 客户在创建 ACI container group 时提供了错误的 registry credentials（密码中含空... | 1) 让客户验证 credentials 正确性（无多余空格/特殊字符）; 2) 建议客户改用 Managed Iden... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20InaccessibleImage%20Error) |
| 3 | ACI creation fails with RegistryErrorResponse / TOOMANYREQUESTS when pulling ima... | Microsoft-Docker allowlist agreement expired June 30, 2024. ... | 1) Create Docker Hub account and authenticate pulls to get 2... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI_Docker_RateLimit) |

## Quick Troubleshooting Path

1. Check: 1) Authenticate Docker pulls with Docker account credentials (free tier: 200 pulls/6hrs); 2) Use ACR `[source: ado-wiki]`
2. Check: 1) 让客户验证 credentials 正确性（无多余空格/特殊字符）; 2) 建议客户改用 Managed Identity 拉取镜像，避免 credential 管理问题。 `[source: ado-wiki]`
3. Check: 1) Create Docker Hub account and authenticate pulls to get 200 pulls/6h free `[source: ado-wiki]`
