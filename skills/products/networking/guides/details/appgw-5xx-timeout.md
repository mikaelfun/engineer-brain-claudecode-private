# Networking AppGW 5xx 与超时 — 综合排查指南

**条目数**: 3 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Connection drops and HTTP 502/504 errors during Applicati... | During rolling OS upgrade, instance count tempo... | Use Azure NAT Gateway for outbound traffic to a... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FConnection%20Drops%20due%20to%20AppGW%20Instances%20Upgrade) |
| 2 | HTTP 5xx errors on Application Gateway; need to determine... | Backend server returning 5xx which AppGW proxie... | Check ReqRespLog for SERVER-STATUS field. If SE... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Application%20Gateway%20HTTP%205xx%20Errors) |
| 3 | 503 from App Service backend behind Application Gateway | App Service worker issues, app restarting, or d... | 1) Check App Service status. 2) Check metrics: ... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Gateway%20503%20errors) |
