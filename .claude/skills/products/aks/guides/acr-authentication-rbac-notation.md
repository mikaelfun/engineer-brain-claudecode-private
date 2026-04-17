# AKS ACR 认证与 RBAC — notation -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 7
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Notation sign/verify/list/inspect fails with 401 Unauthorized error: POST oauth2... | Identity not authenticated to ACR or missing AcrPull/AcrPush... | Assign AcrPull role (and AcrPush for signing) to identity, t... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FNotary%20Image%20Signing%20and%20Verification) |
| 2 | Notation sign fails with 'describe-key command failed: Caller is not authorized ... | Identity used for signing lacks required Azure Key Vault per... | Assign 'Key Vault Crypto User', 'Key Vault Secrets User', an... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FNotary%20Image%20Signing%20and%20Verification) |
| 3 | Notation sign fails with 'certificate with subject xxx is invalid. The key usage... | Signing certificate does not meet Notation certificate requi... | Create a new certificate following Notation certificate requ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FNotary%20Image%20Signing%20and%20Verification) |
| 4 | Notation verify fails with 'authenticity validation failed: signature is not pro... | Root CA certificate not added to the Notation trust store | Use 'notation cert add' to add the root CA certificate to th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FNotary%20Image%20Signing%20and%20Verification) |
| 5 | Notation verify fails with 'signing certificate from the digital signature does ... | Trust policy 'trustedIdentities' misconfigured — the signing... | Update 'trustedIdentities' in the trust policy to include th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FNotary%20Image%20Signing%20and%20Verification) |
| 6 | Notation verify fails with 'distinguished name DN has no mandatory RDN attribute... | Signing certificate has incorrect X.509 Subject DN missing m... | Create a new certificate with correct X.509 Subject DN per c... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FNotary%20Image%20Signing%20and%20Verification) |
| 7 | Notation verify fails with 'artifact has no applicable trust policy. Trust polic... | Trust policy 'registryScopes' does not cover the image repos... | Update 'registryScopes' to include the target repository (e.... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FNotary%20Image%20Signing%20and%20Verification) |

## Quick Troubleshooting Path

1. Check: Assign AcrPull role (and AcrPush for signing) to identity, then authenticate with 'az acr login', 'd `[source: ado-wiki]`
2. Check: Assign 'Key Vault Crypto User', 'Key Vault Secrets User', and 'Key Vault Certificate User' roles to  `[source: ado-wiki]`
3. Check: Create a new certificate following Notation certificate requirements: use self-signed cert via AKV o `[source: ado-wiki]`
