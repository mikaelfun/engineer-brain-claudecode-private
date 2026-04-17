# Networking AppGW HTTP 4xx 错误 — 综合排查指南

**条目数**: 7 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Application Gateway returns 400 error when URL length exc... | Application Gateway has a hard limit of 32KB fo... | Customer must reduce URL length to stay within ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Expert%20Troubleshooting/4xx%20response%20-%20Application%20Gateway%20URL%20too%20long) |
| 2 | Application Gateway HTTPS listener returns wrong certific... | Listener does not have any routing rule associa... | Associate a routing rule with the listener befo... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FApplication%20Gateway%20Listener%20Without%20Rule%20Associated) |
| 3 | HTTP 400 Bad Request errors on Application Gateway V1; er... | Request is invalid at HTTP.sys kernel level (ma... | Collect HTTPERR logs from %windir%/System32/log... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshoot%204XX%20Errors%20-%20Application%20Gateway) |
| 4 | HTTP 400 errors on Application Gateway due to request URL... | Request URL or query string exceeds Application... | Check request filtering settings limits. Curren... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshoot%204XX%20Errors%20-%20Application%20Gateway) |
| 5 | Application Gateway returns 400 or 405 to clients after a... | After the upgrade, AppGW enforces stricter RFC ... | Fix the client application to send RFC-complian... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHTTP%20Behavior%20Changes%20With%20Application%20Gateway%20Upgrade) |
| 6 | HTTP 404 error when accessing Application Gateway via a h... | When a hostname value is set in the AppGw HTTP ... | Remove the hostname value from the AppGw listen... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20To%3A%20Resolve%20HTTP%20404%20error%20when%20declaring%20hostname%20in%20listener) |
| 7 | Application Gateway returns HTTP 408 responses under load... | Throughput issue on the data path between clien... | 1) Review datapath performance and throughput f... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FTroubleshooting%20408s%20presented%20from%20appgw) |
