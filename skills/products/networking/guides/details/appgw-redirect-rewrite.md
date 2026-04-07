# Networking AppGW 重定向与重写规则 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 0 | **Kusto 查询融合**: 0
**生成日期**: 2026-04-07

---

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Authorization header is stripped/null after Application G... | HTTP clients strip the Authorization header aft... | Use Application Gateway rewrite rules instead o... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FAuthorization%20Header%20being%20stripped%20followed%20by%20a%20redirect) |
| 2 | Application Gateway redirects client to backend default F... | When 'Pick hostname from backend pool' or hostn... | Three options: (1) Add a custom domain to the b... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FApp%20Gateway%20Redirects%20To%20Backend%20FQDN%20or%20IP) |
| 3 | Application Gateway redirect rule appends unexpected trai... | The 'Include Path' option is checked and grayed... | Use Azure Resource Explorer to modify the redir... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FApplication%20Gateway%20adding%20a%20trailing%20slash%20when%20redirecting%20traffic) |
| 4 | Application Gateway v2 with path-based routing rule retur... | By-design behavior per RFC 3986 Section 6.2.4 (... | This is expected by-design behavior. Customer s... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FApplication%20Gateway%20v2%20returns%20HTTP%20status%20301%20if%20trailing%20slash%20is%20missing) |
| 5 | Portal error when saving Application Gateway configuratio... | Application Gateway has a hard limit of 100 red... | Review all redirect configurations and consolid... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FCommon%20AppGW%20Portal%20Errors) |
| 6 | Requests to root URL path '/' on AppGW are not forwarded ... | AppGW path-based routing rules do not support '... | Create a rewrite rule set on the AppGW: 1. Cond... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FForward%20Requests%20With%20Empty%20Paths%20To%20Specific%20Path) |
| 7 | When Application Gateway is in front of an Azure Web App,... | AppGw sends the backend hostname (e.g., appgwte... | Remove -PickHostnameFromBackendAddress / -PickH... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%3A%20Setup%20URL%20Redirection%20with%20WebApp%20Backend) |
| 8 | AppGW 配置 HTTP→HTTPS 重定向，目标 listener 为 multisite listener（... | AppGW 不支持将重定向目标设置为 multisite listener。将多站点 HTTP... | 将重定向目标改为 single-site listener（单一 hostname）。若需对多... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FRedirection%20Issue%20with%20the%20multisite%20listener) |
