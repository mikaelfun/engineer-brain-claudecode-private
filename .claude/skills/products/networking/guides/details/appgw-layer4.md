# Networking AppGW Layer 4 代理 — 综合排查指南

**条目数**: 2 | **草稿融合数**: 5 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-a-l4-proxy-overview.md], [ado-wiki-a-l4-proxy-sql-quickstart.md], [ado-wiki-b-application-gateway-layer4-faq.md], [ado-wiki-b-application-gateway-layer4-multisite-listeners.md], [ado-wiki-d-appgw-l4-troubleshooting.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 证书与密钥
> 来源: ado-wiki

1. **MySQL Flexible Server connections through Application Gateway Layer 4 TLS proxy fail with error: 'Lost connection to MyS**
   - 根因: MySQL protocol requires an initial non-SSL handshake exchange (server greeting + client capabilities) before the TLS handshake begins. When AppGW L4 is configured to terminate TLS, it expects a standard TLS Client Hello immediately, while MySQL sends its protocol-specific initial handshake packet first. Both sides wait for incompatible messages, causing timeout.
   - 方案: Do not configure TLS/mTLS termination on Application Gateway L4 for MySQL Flexible Server backends. Use TCP mode instead (no SSL on AppGW) and let the MySQL server handle the SSL/TLS handshake directly end-to-end with the client.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FTSG%3A%20%20Layer%204%20Application%20Gateway%20TLS%20Proxy%20Limitations%20for%20MySQL%20Flexible%20Server)`

2. **MySQL Flexible Server connections through Application Gateway Layer 4 TLS proxy fail with: Lost connection to MySQL serv**
   - 根因: MySQL protocol requires initial non-SSL handshake (server greeting + client capabilities) before TLS. AppGW L4 TLS expects Client Hello immediately, while MySQL sends its handshake first. Both sides wait for incompatible messages, causing timeout.
   - 方案: Do not configure TLS/mTLS termination on Application Gateway L4 for MySQL backends. Use TCP mode and let MySQL handle SSL directly end-to-end with the client.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FTSG%3A%20%20Layer%204%20Application%20Gateway%20TLS%20Proxy%20Limitations%20for%20MySQL%20Flexible%20Server)`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | MySQL Flexible Server connections through Application Gat... | MySQL protocol requires an initial non-SSL hand... | Do not configure TLS/mTLS termination on Applic... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FTSG%3A%20%20Layer%204%20Application%20Gateway%20TLS%20Proxy%20Limitations%20for%20MySQL%20Flexible%20Server) |
| 2 | MySQL Flexible Server connections through Application Gat... | MySQL protocol requires initial non-SSL handsha... | Do not configure TLS/mTLS termination on Applic... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FTSG%3A%20%20Layer%204%20Application%20Gateway%20TLS%20Proxy%20Limitations%20for%20MySQL%20Flexible%20Server) |
