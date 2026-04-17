# AKS 限流与配额 -- Quick Reference

**Sources**: 1 | **21V**: All | **Entries**: 1
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS API 请求返回 HTTP 429 错误："The PutAgentPoolHandler.PUT request limit has been exc... | AKS 实现了基于 token bucket 算法的资源级别 API 节流：ListManagedClustersByS... | 客户需降低 API 请求频率，与 ARM throttling 的缓解方式类似。参考文档: https://learn.... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20Throttling) |

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/throttling-quota.md)
