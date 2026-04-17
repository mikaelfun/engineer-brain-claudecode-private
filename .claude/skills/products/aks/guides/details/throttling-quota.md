# AKS 限流与配额 -- Comprehensive Troubleshooting Guide

**Entries**: 1 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: api-throttling-analysis.md
**Generated**: 2026-04-07

---

## Phase 1: AKS 实现了基于 token bucket 算法的资源级别 API 节流：ListManagedC

### aks-499: AKS API 请求返回 HTTP 429 错误："The PutAgentPoolHandler.PUT request limit has been exc...

**Root Cause**: AKS 实现了基于 token bucket 算法的资源级别 API 节流：ListManagedClustersBySubscription (1 token/s, burst 500)、PutAgentPool (1 token/min, burst 20)。请求速率超限时返回 429

**Solution**:
客户需降低 API 请求频率，与 ARM throttling 的缓解方式类似。参考文档: https://learn.microsoft.com/en-us/azure/aks/quotas-skus-regions

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20Throttling)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS API 请求返回 HTTP 429 错误："The PutAgentPoolHandler.PUT request limit has been exc... | AKS 实现了基于 token bucket 算法的资源级别 API 节流：ListManagedClustersByS... | 客户需降低 API 请求频率，与 ARM throttling 的缓解方式类似。参考文档: https://learn.... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FAKS%20Throttling) |
