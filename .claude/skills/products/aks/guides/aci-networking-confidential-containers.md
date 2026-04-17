# AKS ACI 网络与 DNS — confidential-containers -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 8
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACI Confidential Container fails with 'mount_device not allowed by policy' or 'd... | Container image was updated with new SHA but the local cache... | Clean local Docker image cache with 'docker rmi <image_name>... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 2 | ACI Confidential Container fails with 'mount_overlay not allowed by policy' and ... | Customer's CCE Policy enforces a newer framework SVN version... | Revert to the older framework SVN in the CCE Policy. Regener... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 3 | ACI Confidential Container terminates with exit code 139 (Segmentation fault) - ... | Known issue with container images based on Ubuntu 22.04 base... | Recommend customer to rebuild their container image using a ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 4 | Confcom CLI extension fails to generate CCE Policy for private container registr... | User is not authenticated to the private container registry ... | Login to the private registry before generating CCE Policy: ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 5 | ACI Confidential Container deployment fails with The CCE Policy is not valid Bas... | CCE Policy value is not valid Base64, possibly corrupted by ... | Validate Base64 format. Regenerate CCE Policy using confcom ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 6 | ACI Confidential Container deployment fails with failed to create shim task due ... | CCE Policy exceeds 120KB maximum size limit | Mitigation being investigated. Raise IcM on CPlat Team (Cont... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 7 | ACI Confidential Container logs not visible or empty despite container running | CCE Policy does not have allow_stdio enabled for the contain... | Decode CCE Policy, verify allow_stdio is enabled. Regenerate... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 8 | ACI Confidential Container exec command (az container exec) fails or blocked | CCE Policy missing exec_in_container and exec_external frame... | Decode CCE Policy, verify exec_in_container and exec_externa... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |

## Quick Troubleshooting Path

1. Check: Clean local Docker image cache with 'docker rmi <image_name>:<tag>' or 'docker rmi $(docker images - `[source: ado-wiki]`
2. Check: Revert to the older framework SVN in the CCE Policy `[source: ado-wiki]`
3. Check: Recommend customer to rebuild their container image using a different base image (not Ubuntu 22 `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/aci-networking-confidential-containers.md)
