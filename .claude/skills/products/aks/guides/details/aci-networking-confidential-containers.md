# AKS ACI 网络与 DNS — confidential-containers -- Comprehensive Troubleshooting Guide

**Entries**: 8 | **Draft sources**: 4 | **Kusto queries**: 1
**Source drafts**: ado-wiki-a-confidential-containers-kata-cc.md, ado-wiki-aci-spot-containers-evictions.md, ado-wiki-aci-spot-containers.md, ado-wiki-querying-logs-from-customer-la-workspaces.md
**Kusto references**: controlplane-logs.md
**Generated**: 2026-04-07

---

## Phase 1: Container image was updated with new SHA but the l

### aks-322: ACI Confidential Container fails with 'mount_device not allowed by policy' or 'd...

**Root Cause**: Container image was updated with new SHA but the local cached version has old layers. CCE Policy was generated using cached image with mismatched layer hashes.

**Solution**:
Clean local Docker image cache with 'docker rmi <image_name>:<tag>' or 'docker rmi $(docker images -a -q)', then regenerate the CCE Policy using confcom tool. Inspect missing hash with 'docker inspect <image_name>:<tag>'.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers)]`

## Phase 2: Customer's CCE Policy enforces a newer framework S

### aks-323: ACI Confidential Container fails with 'mount_overlay not allowed by policy' and ...

**Root Cause**: Customer's CCE Policy enforces a newer framework SVN version than what is currently supported by the platform

**Solution**:
Revert to the older framework SVN in the CCE Policy. Regenerate the policy if needed.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers)]`

## Phase 3: Known issue with container images based on Ubuntu 

### aks-324: ACI Confidential Container terminates with exit code 139 (Segmentation fault) - ...

**Root Cause**: Known issue with container images based on Ubuntu 22.04 base image causing segmentation faults in confidential container TEE environment

**Solution**:
Recommend customer to rebuild their container image using a different base image (not Ubuntu 22.04). Use an alternative base image version.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers)]`

## Phase 4: User is not authenticated to the private container

### aks-325: Confcom CLI extension fails to generate CCE Policy for private container registr...

**Root Cause**: User is not authenticated to the private container registry before running confcom policy generation tool

**Solution**:
Login to the private registry before generating CCE Policy: For ACR use 'az acr login -n <ACR_Name>', for Docker use 'docker login --username <username> --password-stdin'.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers)]`

## Phase 5: CCE Policy value is not valid Base64, possibly cor

### aks-384: ACI Confidential Container deployment fails with The CCE Policy is not valid Bas...

**Root Cause**: CCE Policy value is not valid Base64, possibly corrupted by manual editing

**Solution**:
Validate Base64 format. Regenerate CCE Policy using confcom CLI extension

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers)]`

## Phase 6: CCE Policy exceeds 120KB maximum size limit

### aks-385: ACI Confidential Container deployment fails with failed to create shim task due ...

**Root Cause**: CCE Policy exceeds 120KB maximum size limit

**Solution**:
Mitigation being investigated. Raise IcM on CPlat Team (Container Platform/Runtime)

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers)]`

## Phase 7: CCE Policy does not have allow_stdio enabled for t

### aks-386: ACI Confidential Container logs not visible or empty despite container running

**Root Cause**: CCE Policy does not have allow_stdio enabled for the container

**Solution**:
Decode CCE Policy, verify allow_stdio is enabled. Regenerate with allow_stdio if missing

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers)]`

## Phase 8: CCE Policy missing exec_in_container and exec_exte

### aks-387: ACI Confidential Container exec command (az container exec) fails or blocked

**Root Cause**: CCE Policy missing exec_in_container and exec_external framework configurations

**Solution**:
Decode CCE Policy, verify exec_in_container and exec_external configs exist. Regenerate if missing

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers)]`

---

## Known Issues Quick Reference

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
