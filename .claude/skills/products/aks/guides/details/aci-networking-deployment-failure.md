# AKS ACI 网络与 DNS — deployment-failure -- Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-aci-msi-token-request-failure.md, ado-wiki-b-Application-Failure-Tooling-Guide.md, ado-wiki-b-check-aci-quota-for-subscription.md, ado-wiki-b-collaborate-with-automation-account-team.md
**Generated**: 2026-04-07

---

## Phase 1: Regional ACI capacity exhausted.

### aks-304: ACI deployment fails with Insufficient Capacity error

**Root Cause**: Regional ACI capacity exhausted.

**Solution**:
1) Validate via ASI Insufficient Capacity detector; 2) Try deployment in another region; 3) Escalate from EEE to PG after validating capacity dashboards.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 2: Spot Containers have platform restrictions: no inb

### aks-310: ACI Spot Container deployment fails with 400 Bad Request for unsupported configu...

**Root Cause**: Spot Containers have platform restrictions: no inbound connectivity support, Standard SKU only, no GPU resources allowed. Priority field must be 'Regular' or 'Spot'.

**Solution**:
Error-specific fixes: 1) SpotPriorityContainerGroupNotSupportedForInboundConnectivity → remove network-related properties; 2) SpotPriorityContainerGroupNotSupportedInSku → use Standard SKU; 3) SpotPriorityContainerGroupWithGPUResourcesNotSupported → remove GPU from request; 4) PriorityNotSpecified → set Priority to 'Regular' or 'Spot'; 5) ContainerGroupQuotaReached → follow Spot Quota TSG for quota increase.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Spot%20Containers%20Customer%20Errors)]`

## Phase 3: The CCE Policy was manually updated and contains e

### aks-320: ACI Confidential Container deployment fails with rego compilation error: 'rego c...

**Root Cause**: The CCE Policy was manually updated and contains extra/invalid characters, or the base64-encoded policy has an invalid format

**Solution**:
Regenerate the CCE Policy using the confcom Azure CLI extension. Decode and validate the existing policy to identify formatting issues.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers)]`

## Phase 4: The command specified in the ARM template does not

### aks-321: ACI Confidential Container fails with 'create_container not allowed by policy' o...

**Root Cause**: The command specified in the ARM template does not match the command allowed in the CCE Policy, or the create_container rule is missing from the policy

**Solution**:
Decode the CCE Policy and verify the command matches the ARM template. Ensure 'create_container := data.framework.create_container' config exists. Regenerate the CCE Policy.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers)]`

## Phase 5: ACI's internal fraud detection logic was triggered

### aks-599: ACI deployment fails with 'ContainerGroups quota exceeded, Limit: 0, Usage: 0, R...

**Root Cause**: ACI's internal fraud detection logic was triggered. Multiple ACI deployments in multiple regions using the same container group name at the same time can flag the subscription. The subscription or tenant gets added to the fraud-config.json blocklist, setting effective quota to 0.

**Solution**:
1) Confirm fraud flag: check ACI RP traces with operationName contains 'Fraud' in Kusto (Accprod.accprod.Traces). 2) Verify tenant/subscription in fraud-config.json in Compute-ACI-Config repo. 3) Advise Cx to deploy one ACI at a time to avoid triggering fraud detection. 4) Create IcM copy of 394233833 for HIT (Human Intelligence Team) to validate no other fraudulent behavior.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Fraud%20Detected)]`

## Phase 6: ACI internal fraud detection (FraudDetected) was t

### aks-601: ACI deployment fails with 'container group quota ContainerGroups exceeded in reg...

**Root Cause**: ACI internal fraud detection (FraudDetected) was triggered for the subscription or tenant. This can happen when multiple ACI deployments are issued in multiple regions using the same name simultaneously (e.g., from automation scripts). The subscription/tenant is added to the fraud-config.json blocklist, setting quota limit to 0.

**Solution**:
1) Confirm fraud detection via Kusto: query accprod.Traces where operationName contains 'Fraud' for the subscription. 2) Check if sub/tenant is in the fraud blocklist: https://msazure.visualstudio.com/One/_git/Compute-ACI-Config?path=/src/Fraud/fraud-config.json. 3) Advise customer to deploy 1 ACI request at a time to avoid re-triggering. 4) Create IcM copy of 394233833 for HIT (Human Intelligence Team) to validate no other fraudulent behavior.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Fraud%20Detected)]`

## Phase 7: DNS Name Reservation RP 在特定条件下抛出 'Guid should cont

### aks-339: ACI 部署失败，内部服务器错误，DNS Name Reservation 相关

**Root Cause**: DNS Name Reservation RP 在特定条件下抛出 'Guid should contain 32 digits with 4 dashes' 异常，导致 ACI RP 部署失败。可能与 DNS label 重用或格式问题有关。

**Solution**:
1) 确保使用最新 ACI API 版本；2) DNS label 值不要使用大写字母；3) 如重用 DNS label 失败，尝试使用不同的 label 验证部署；4) 如必须重用同一 DNS label，开 IcM 给 ACI 团队让 Azure DNS Name Reservation 团队手动清理旧 label。参考 Bug 20980860。

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20DNS%20Name%20Reservation)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACI deployment fails with Insufficient Capacity error | Regional ACI capacity exhausted. | 1) Validate via ASI Insufficient Capacity detector; 2) Try d... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 2 | ACI Spot Container deployment fails with 400 Bad Request for unsupported configu... | Spot Containers have platform restrictions: no inbound conne... | Error-specific fixes: 1) SpotPriorityContainerGroupNotSuppor... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Spot%20Containers%20Customer%20Errors) |
| 3 | ACI Confidential Container deployment fails with rego compilation error: 'rego c... | The CCE Policy was manually updated and contains extra/inval... | Regenerate the CCE Policy using the confcom Azure CLI extens... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 4 | ACI Confidential Container fails with 'create_container not allowed by policy' o... | The command specified in the ARM template does not match the... | Decode the CCE Policy and verify the command matches the ARM... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 5 | ACI deployment fails with 'ContainerGroups quota exceeded, Limit: 0, Usage: 0, R... | ACI's internal fraud detection logic was triggered. Multiple... | 1) Confirm fraud flag: check ACI RP traces with operationNam... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Fraud%20Detected) |
| 6 | ACI deployment fails with 'container group quota ContainerGroups exceeded in reg... | ACI internal fraud detection (FraudDetected) was triggered f... | 1) Confirm fraud detection via Kusto: query accprod.Traces w... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Fraud%20Detected) |
| 7 | ACI 部署失败，内部服务器错误，DNS Name Reservation 相关 | DNS Name Reservation RP 在特定条件下抛出 'Guid should contain 32 dig... | 1) 确保使用最新 ACI API 版本；2) DNS label 值不要使用大写字母；3) 如重用 DNS label... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20DNS%20Name%20Reservation) |
