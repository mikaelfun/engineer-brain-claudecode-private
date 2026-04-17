# Networking AppGW 诊断与日志 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-b-log-sources-application-gateway.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 其他
> 来源: ado-wiki

1. **No data found in Log Analytics after configuring diagnostic settings for Application Gateway (Data not found in the last**
   - 根因: Destination table defaults to 'Resource-specific' instead of 'Azure Diagnostics'. Queries using AzureDiagnostics table (including suggested queries from portal) return no results because data goes to resource-specific tables.
   - 方案: Either: (1) Change destination to 'Azure Diagnostics' in diagnostic settings and wait for new logs, or (2) Keep 'Resource-specific' and query using AGWAccessLogs, AGWFirewallLogs, AGWPerformanceLogs tables instead of AzureDiagnostics.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FLog%20analytics%20workspace%20default%20configuration)`

2. **No data found in Log Analytics after configuring diagnostic settings for Application Gateway**
   - 根因: Destination table defaults to Resource-specific instead of Azure Diagnostics. Queries using AzureDiagnostics table return no results.
   - 方案: Either: (1) Change destination to Azure Diagnostics, or (2) Query using AGWAccessLogs, AGWFirewallLogs, AGWPerformanceLogs instead of AzureDiagnostics.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FLog%20analytics%20workspace%20default%20configuration)`

3. **Azure Portal metrics/logs show 'We are not able to retrieve these values' for AppGW and other resources subscription-wid**
   - 根因: Chrome 142 security prompt blocking CORS requests to local network
   - 方案: Change Chrome settings per Chromium bug https://issues.chromium.org/issues/460178100 or use different browser. Browser-side issue, not AppGW
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Metrics%20and%20Logs%20Unavailability%20in%20Application%20Gateway)`

### Phase 2: 证书与密钥
> 来源: ado-wiki

1. **Configuring a second Diagnostic Settings on Application Gateway fails with error: 'Data sink is already used in diagnost**
   - 根因: Azure does not allow multiple Diagnostic Settings with the same Log category (e.g., ApplicationGatewayAccessLog) pointing to the same Log Analytics workspace, even if the Destination Table type (AzureDiagnostics vs Resource Specific) is different.
   - 方案: Use a single Diagnostic Settings entry per Log category per LAW destination. If you need both AzureDiagnostics and Resource Specific tables, send them to different Log Analytics workspaces, or consolidate into one Diagnostic Settings with the desired Destination Table.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCustomer%20Facing%20Queries%20for%20AGW)`

2. **Configuring a second Diagnostic Settings on Application Gateway fails with error: Data sink is already used in diagnosti**
   - 根因: Azure does not allow multiple Diagnostic Settings with the same Log category (e.g., ApplicationGatewayAccessLog) pointing to the same Log Analytics workspace, even if the Destination Table type (AzureDiagnostics vs Resource Specific) is different.
   - 方案: Use a single Diagnostic Settings entry per Log category per LAW destination. If you need both AzureDiagnostics and Resource Specific tables, send them to different Log Analytics workspaces, or consolidate into one Diagnostic Settings with the desired Destination Table.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCustomer%20Facing%20Queries%20for%20AGW)`

### Phase 3: 配置问题
> 来源: ado-wiki

1. **Log Analytics Workspace shows error: 'Data of type AzureDiagnostics is being dropped due to incorrect format at lineOffs**
   - 根因: Invalid UTF-8 data in client request fields (requestUri, UserAgent, contentType). When these fields contain invalid UTF-8 characters, the Geneva agent replaces them with placeholder values like '[789 B blob data]', which breaks JSON parsing and causes the entire log batch to be dropped.
   - 方案: Known issue with repair item 15608290. Fix rolled out for requestUri and User-Agent fields. Tenant release 30.0 extends fix to originalRequestUriWithArgs, requestQuery, contentType, and originalHost. To identify affected records, query _LogOperation for 'Data of type AzureDiagnostics is being dropped' errors. For deeper debugging, JIT into the AppGW instance and check /appgwroot/log/nginx/access.log for the raw log entries.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FData%20of%20type%20AzureDiagnostics%20is%20being%20dropped%20due%20to%20incorrect%20format)`

### Phase 4: 性能与超时
> 来源: ado-wiki

1. **Application Gateway timing metrics (e.g., ApplicationGatewayTotalTime, Backend Last Byte Response Time) show an upward l**
   - 根因: Inactive listeners (not receiving traffic) continue to report 0-value data points in metrics until instance restart. After restart, the metrics pipeline resets and these 0-value data points disappear, causing the average to increase artificially. The request-response logs don't include inactive listeners, so they show the true latency.
   - 方案: Always split timing metrics by listener to avoid the averaging issue with inactive listeners. Verify with AzureMetrics query: AzureMetrics | where MetricName == 'ApplicationGatewayTotalTime' | summarize avg(Count) by TimeGenerated — a drop in data point count correlating with latency increase confirms this is the cause. Remove or reconfigure unused listeners to prevent recurrence.
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FAppgw%20Timings%20discrepancies%20in%20metrics)`

### Phase 5: DNS 解析
> 来源: ado-wiki

1. **Application Gateway diagnostic logs not showing in Azure Portal, Log Analytics, or PowerShell despite logging enabled**
   - 根因: AppGW cannot resolve FQDN of Storage Account for log storage, typically due to custom DNS. UDR or NSG may also block connectivity
   - 方案: 1) Verify custom DNS IP in VNet. 2) Check no UDR/NSG blocking UDP 53 via TestTraffic in ASC. 3) Verify DNS resolution for storage FQDN and prod.warmpath.msftcloudes.com. 4) Check diagnostic settings. 5) Check storage firewall
   `[结论: 🟢 8.5/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshoot%20Application%20Gateway%20Missing%20Logs)`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Log Analytics Workspace shows error: 'Data of type AzureD... | Invalid UTF-8 data in client request fields (re... | Known issue with repair item 15608290. Fix roll... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FData%20of%20type%20AzureDiagnostics%20is%20being%20dropped%20due%20to%20incorrect%20format) |
| 2 | Application Gateway timing metrics (e.g., ApplicationGate... | Inactive listeners (not receiving traffic) cont... | Always split timing metrics by listener to avoi... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FAppgw%20Timings%20discrepancies%20in%20metrics) |
| 3 | No data found in Log Analytics after configuring diagnost... | Destination table defaults to 'Resource-specifi... | Either: (1) Change destination to 'Azure Diagno... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FLog%20analytics%20workspace%20default%20configuration) |
| 4 | No data found in Log Analytics after configuring diagnost... | Destination table defaults to Resource-specific... | Either: (1) Change destination to Azure Diagnos... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FLog%20analytics%20workspace%20default%20configuration) |
| 5 | Application Gateway diagnostic logs not showing in Azure ... | AppGW cannot resolve FQDN of Storage Account fo... | 1) Verify custom DNS IP in VNet. 2) Check no UD... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshoot%20Application%20Gateway%20Missing%20Logs) |
| 6 | Azure Portal metrics/logs show 'We are not able to retrie... | Chrome 142 security prompt blocking CORS reques... | Change Chrome settings per Chromium bug https:/... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20Metrics%20and%20Logs%20Unavailability%20in%20Application%20Gateway) |
| 7 | Configuring a second Diagnostic Settings on Application G... | Azure does not allow multiple Diagnostic Settin... | Use a single Diagnostic Settings entry per Log ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCustomer%20Facing%20Queries%20for%20AGW) |
| 8 | Configuring a second Diagnostic Settings on Application G... | Azure does not allow multiple Diagnostic Settin... | Use a single Diagnostic Settings entry per Log ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCustomer%20Facing%20Queries%20for%20AGW) |
