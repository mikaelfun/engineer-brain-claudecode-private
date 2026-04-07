# Networking AppGW + APIM 集成 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 503 Service Unavailable when accessing APIM through Appli... | Default listener still present in Application G... | Remove default listener, default backend HTTP s... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20API%20Management%20APIM) |
| 2 | 503 from APIM behind AppGW when client uses hostname diff... | APIM returns 503 when request hostname does not... | Create CNAME mapping of APIM hostname to AppGW ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Gateway%20503%20errors) |
| 3 | AppGW returns 429 response when routing traffic through A... | APIM rate-limit-by-key policy surpassed; OR por... | Check NSG rules on APIM subnet: ensure port 429... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FMinimizing%20Collaboration%20with%20APIM%20from%20APP%20GW%20Side) |
| 4 | AppGW returns 500 when routing through APIM; APIM logs sh... | POST request payload exceeds 2MB with mutual TL... | Review mTLS configuration on backend for large ... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FMinimizing%20Collaboration%20with%20APIM%20from%20APP%20GW%20Side) |

## 快速排查路径
1. Remove default listener, default backend HTTP settings, and default rule from AppGW. If issue persis `[来源: ado-wiki]`
2. Create CNAME mapping of APIM hostname to AppGW frontend DNS name. For private IP, map CNAME in custo `[来源: ado-wiki]`
3. Check NSG rules on APIM subnet: ensure port 4290 is open both inbound and outbound. If NSG is not th `[来源: ado-wiki]`
4. Review mTLS configuration on backend for large payload handling. Consider increasing connection time `[来源: ado-wiki]`
