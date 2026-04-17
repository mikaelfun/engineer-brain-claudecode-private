# Networking AppGW 诊断与日志 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Log Analytics Workspace shows error: 'Data of type AzureD... | Invalid UTF-8 data in client request fields (re... | Known issue with repair item 15608290. Fix roll... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FData%20of%20type%20AzureDiagnostics%20is%20being%20dropped%20due%20to%20incorrect%20format) |
| 2 📋 | Application Gateway timing metrics (e.g., ApplicationGate... | Inactive listeners (not receiving traffic) cont... | Always split timing metrics by listener to avoi... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FAppgw%20Timings%20discrepancies%20in%20metrics) |
| 3 📋 | No data found in Log Analytics after configuring diagnost... | Destination table defaults to 'Resource-specifi... | Either: (1) Change destination to 'Azure Diagno... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FLog%20analytics%20workspace%20default%20configuration) |
| 4 📋 | No data found in Log Analytics after configuring diagnost... | Destination table defaults to Resource-specific... | Either: (1) Change destination to Azure Diagnos... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FLog%20analytics%20workspace%20default%20configuration) |
| 5 📋 | Application Gateway diagnostic logs not showing in Azure ... | AppGW cannot resolve FQDN of Storage Account fo... | 1) Verify custom DNS IP in VNet. 2) Check no UD... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshoot%20Application%20Gateway%20Missing%20Logs) |
| 6 📋 | Azure Portal metrics/logs show 'We are not able to retrie... | Chrome 142 security prompt blocking CORS reques... | Change Chrome settings per Chromium bug https:/... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Metrics%20and%20Logs%20Unavailability%20in%20Application%20Gateway) |
| 7 📋 | Configuring a second Diagnostic Settings on Application G... | Azure does not allow multiple Diagnostic Settin... | Use a single Diagnostic Settings entry per Log ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCustomer%20Facing%20Queries%20for%20AGW) |
| 8 📋 | Configuring a second Diagnostic Settings on Application G... | Azure does not allow multiple Diagnostic Settin... | Use a single Diagnostic Settings entry per Log ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCustomer%20Facing%20Queries%20for%20AGW) |

## 快速排查路径
1. Known issue with repair item 15608290. Fix rolled out for requestUri and User-Agent fields. Tenant r `[来源: ado-wiki]`
2. Always split timing metrics by listener to avoid the averaging issue with inactive listeners. Verify `[来源: ado-wiki]`
3. Either: (1) Change destination to 'Azure Diagnostics' in diagnostic settings and wait for new logs,  `[来源: ado-wiki]`
4. Either: (1) Change destination to Azure Diagnostics, or (2) Query using AGWAccessLogs, AGWFirewallLo `[来源: ado-wiki]`
5. 1) Verify custom DNS IP in VNet. 2) Check no UDR/NSG blocking UDP 53 via TestTraffic in ASC. 3) Veri `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/appgw-diagnostics.md#排查流程)
