# Networking AppGW + APIM 集成 — 综合排查指南

**条目数**: 4 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 503 Service Unavailable when accessing APIM through Appli... | Default listener still present in Application G... | Remove default listener, default backend HTTP s... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20API%20Management%20APIM) |
| 2 | 503 from APIM behind AppGW when client uses hostname diff... | APIM returns 503 when request hostname does not... | Create CNAME mapping of APIM hostname to AppGW ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Gateway%20503%20errors) |
| 3 | AppGW returns 429 response when routing traffic through A... | APIM rate-limit-by-key policy surpassed; OR por... | Check NSG rules on APIM subnet: ensure port 429... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FMinimizing%20Collaboration%20with%20APIM%20from%20APP%20GW%20Side) |
| 4 | AppGW returns 500 when routing through APIM; APIM logs sh... | POST request payload exceeds 2MB with mutual TL... | Review mTLS configuration on backend for large ... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FMinimizing%20Collaboration%20with%20APIM%20from%20APP%20GW%20Side) |
