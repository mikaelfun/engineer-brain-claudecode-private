# Networking AppGW Layer 4 代理 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | MySQL Flexible Server connections through Application Gat... | MySQL protocol requires an initial non-SSL hand... | Do not configure TLS/mTLS termination on Applic... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FTSG%3A%20%20Layer%204%20Application%20Gateway%20TLS%20Proxy%20Limitations%20for%20MySQL%20Flexible%20Server) |
| 2 📋 | MySQL Flexible Server connections through Application Gat... | MySQL protocol requires initial non-SSL handsha... | Do not configure TLS/mTLS termination on Applic... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FTSG%3A%20%20Layer%204%20Application%20Gateway%20TLS%20Proxy%20Limitations%20for%20MySQL%20Flexible%20Server) |

## 快速排查路径
1. Do not configure TLS/mTLS termination on Application Gateway L4 for MySQL Flexible Server backends.  `[来源: ado-wiki]`
2. Do not configure TLS/mTLS termination on Application Gateway L4 for MySQL backends. Use TCP mode and `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/appgw-layer4.md#排查流程)
