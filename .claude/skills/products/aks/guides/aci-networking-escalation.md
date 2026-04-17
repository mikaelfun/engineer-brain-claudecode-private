# AKS ACI 网络与 DNS — escalation -- Quick Reference

**Sources**: 1 | **21V**: Partial | **Entries**: 5
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | ACI Container Group deletion fails with Internal Error | Backend issue prevents CG deletion (related to Emerging Issu... | 1) Validate via ASI detectors on CG page and caas page; 2) E... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 2 | ACI Container Group logs or metrics missing | Log Uploader or Geneva Metric definitions issue preventing l... | 1) Validate via ASI Metrics tab and Log Uploader Events tab;... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 3 | ACI 问题需要升级 PG 时不知道如何提 ICM | ACI 有专用的 ICM 模板，标准升级流程通过 ASC 提交；当 ASC 不可用时需要使用备用模板。 | 1) 标准流程：通过 ASC 创建 escalation，参考 wiki 流程文档；2) ASC 不可用时：使用 ICM... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI) |
| 4 | ACI Container Group stopped but containers/IPs still running (Ghost CG) | Service Fabric fails to deactivate Code Package due to node ... | 1) Query SubscriptionDeployments table via Kusto to find run... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 5 | ACI Spot Container deployment fails with ContainerGroupQuotaReached for Standard... | StandardSpotCores quota exceeded. Default limits: EA subscri... | 1) Check core availability per region on Capacity Jarvis das... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20ACI%20Spot%20Containers%20Quota%20Errors) |

## Quick Troubleshooting Path

1. Check: 1) Validate via ASI detectors on CG page and caas page; 2) Escalate to EEE ACI/PG for ACIS Action AC `[source: ado-wiki]`
2. Check: 1) Validate via ASI Metrics tab and Log Uploader Events tab; 2) Missing metrics: EEE checks Geneva M `[source: ado-wiki]`
3. Check: 1) 标准流程：通过 ASC 创建 escalation，参考 wiki 流程文档；2) ASC 不可用时：使用 ICM 模板 https://aka `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/aci-networking-escalation.md)
