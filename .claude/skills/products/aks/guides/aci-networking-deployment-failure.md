# AKS ACI 网络与 DNS — deployment-failure -- Quick Reference

**Sources**: 1 | **21V**: Partial | **Entries**: 7
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACI deployment fails with Insufficient Capacity error | Regional ACI capacity exhausted. | 1) Validate via ASI Insufficient Capacity detector; 2) Try d... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 2 | ACI Spot Container deployment fails with 400 Bad Request for unsupported configu... | Spot Containers have platform restrictions: no inbound conne... | Error-specific fixes: 1) SpotPriorityContainerGroupNotSuppor... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Spot%20Containers%20Customer%20Errors) |
| 3 | ACI Confidential Container deployment fails with rego compilation error: 'rego c... | The CCE Policy was manually updated and contains extra/inval... | Regenerate the CCE Policy using the confcom Azure CLI extens... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 4 | ACI Confidential Container fails with 'create_container not allowed by policy' o... | The command specified in the ARM template does not match the... | Decode the CCE Policy and verify the command matches the ARM... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FConfidential%20Containers) |
| 5 | ACI deployment fails with 'ContainerGroups quota exceeded, Limit: 0, Usage: 0, R... | ACI's internal fraud detection logic was triggered. Multiple... | 1) Confirm fraud flag: check ACI RP traces with operationNam... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Fraud%20Detected) |
| 6 | ACI deployment fails with 'container group quota ContainerGroups exceeded in reg... | ACI internal fraud detection (FraudDetected) was triggered f... | 1) Confirm fraud detection via Kusto: query accprod.Traces w... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Fraud%20Detected) |
| 7 | ACI 部署失败，内部服务器错误，DNS Name Reservation 相关 | DNS Name Reservation RP 在特定条件下抛出 'Guid should contain 32 dig... | 1) 确保使用最新 ACI API 版本；2) DNS label 值不要使用大写字母；3) 如重用 DNS label... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20DNS%20Name%20Reservation) |

## Quick Troubleshooting Path

1. Check: 1) Validate via ASI Insufficient Capacity detector; 2) Try deployment in another region; 3) Escalate `[source: ado-wiki]`
2. Check: Error-specific fixes: 1) SpotPriorityContainerGroupNotSupportedForInboundConnectivity → remove netwo `[source: ado-wiki]`
3. Check: Regenerate the CCE Policy using the confcom Azure CLI extension `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/aci-networking-deployment-failure.md)
