# Networking AppGW 5xx 与超时 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Connection drops and HTTP 502/504 errors during Applicati... | During rolling OS upgrade, instance count tempo... | Use Azure NAT Gateway for outbound traffic to a... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FConnection%20Drops%20due%20to%20AppGW%20Instances%20Upgrade) |
| 2 | HTTP 5xx errors on Application Gateway; need to determine... | Backend server returning 5xx which AppGW proxie... | Check ReqRespLog for SERVER-STATUS field. If SE... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Application%20Gateway%20HTTP%205xx%20Errors) |
| 3 | 503 from App Service backend behind Application Gateway | App Service worker issues, app restarting, or d... | 1) Check App Service status. 2) Check metrics: ... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Gateway%20503%20errors) |

## 快速排查路径
1. Use Azure NAT Gateway for outbound traffic to avoid SNAT port exhaustion and dynamic reallocation. N `[来源: ado-wiki]`
2. Check ReqRespLog for SERVER-STATUS field. If SERVER-STATUS=5xx, issue is backend. If SERVER-STATUS=2 `[来源: ado-wiki]`
3. 1) Check App Service status. 2) Check metrics: HTTP Server Errors, Memory, CPU. 3) Test appname.azur `[来源: ado-wiki]`
