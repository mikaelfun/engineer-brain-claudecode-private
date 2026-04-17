# Networking Application Gateway WAF — 综合排查指南

**条目数**: 14 | **草稿融合数**: 7 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-a-view-appgw-waf-firewall-logging-dgrep.md], [ado-wiki-b-drs-2.2-appgw-waf.md], [ado-wiki-c-appgw-waf-overview.md], [ado-wiki-c-appgw-waf-prevention-mode-blocks-traffic.md], [ado-wiki-c-verify-appgw-waf-brooklyn-extension.md], [ado-wiki-c-verify-appgw-waf-nrp-extension.md], [ado-wiki-d-appgw-waf-tsg.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 其他
> 来源: ado-wiki + onenote

1. **WAF on Application Gateway returns 403 blocked by SQL injection CRS rules (942260, 942370) for legitimate requests conta**
   - 根因: OWASP CRS rules with urlDecodeUni transform decode URL-encoded characters (e.g. %5B%7B becomes [{), causing JSON payload to match SQL injection regex patterns
   - 方案: Analyze blocked request: 1) Check WAF firewall log for matched ruleIds, 2) Verify with regex101 against CRS rules source, 3) Apply urlDecodeUni transform to request content before regex matching, 4) Consider creating WAF exclusion rules for legitimate traffic patterns
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/1.11 [MCVKB]  Troubleshoot Web Application Firewal.md]`

2. **Customer receives 403 Forbidden when WAF is in Prevention mode. Legitimate traffic blocked by OWASP/DRS managed rules. W**
   - 根因: Request data (args, cookies, headers) matches WAF rule regex patterns. Azure WAF uses anomaly scoring model: each rule match adds 2-5 points based on severity (Notice=2, Warning=3, Error=4, Critical=5). When total anomaly score reaches threshold (default 5), mandatory rule 949110 triggers and blocks the request.
   - 方案: 1) Identify the matched field from WAF logs (AGWFirewallLogs or AzureDiagnostics). 2) In the 'data' field, find the value after 'found within' — this shows the match variable (ARGS, REQUEST_COOKIES, REQUEST_HEADERS) and field name. 3) Create exclusion: choose match variable (Request Arg Values/Cookie Values/Header Values), operator (Equals/Contains), and selector (field name). 4) For RCA: get rule regex from OWASP CRS GitHub repo, test with Regex101 or Copilot to explain why match occurred. Note: 'Values' and 'Names' match variables function the same (exclude VALUE based on NAME); use 'Keys' when log shows REQUEST_x_NAMES.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide)`

3. **WAF blocks uploads with rule 200002/200004/0.**
   - 根因: 200002: special chars in filename. 200004: binary content resembles boundary. 0: JSON parse error.
   - 方案: 200002: fix Content-Type. 200004: disable rule. 0: validate JSON.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide)`

4. **WAF Bot protection blocking an IP address that is not listed as malicious in Interflow / IP appears legitimate but 403 b**
   - 根因: Microsoft can insert IPs into the bot/malicious IP list (IPWatchlist) for DDoS or attack activity on Microsoft services in a way that is invisible to the Interflow web portal
   - 方案: 1) Use Interflow Swagger API (https://aka.ms/interflowswagger) → GET /api/ipwatchlist/getsnapshot to download the full bot IP list and verify if the IP appears there. 2) If customer needs to unblock the IP, create a WAF custom rule to Allow traffic from that specific IP — this bypasses both managed rules and bot rules.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FHowTo%3A%20View%20complete%20malicious%20or%20non%20human%20IP%20address%20list)`

5. **Application Gateway WAF returns HTTP 500 error instead of expected custom block response. Nginx errors appear in AppGW l**
   - 根因: Multiple possible causes: (1) headers already transmitted, (2) failed to read WAF custom block response body file, (3) failed to allocate file buffer, (4) failed to send HTTP headers
   - 方案: These are nginx errors indicating unexpected internal issues. Escalate to PG. Verify CRS ruleset >= 3.2 and API version >= 2022-07-01.
   `[结论: 🟢 8.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Custom%20response%20for%20Azure%20Web%20Application%20Firewall)`

### Phase 2: 限制与容量
> 来源: ado-wiki

1. **Application Gateway V2 returns 413 Request Entity Too Large even after adjusting WAF custom rules or increasing body siz**
   - 根因: Request body exceeds SecRequestBodyLimit (default 128KB for non-file content) or file upload exceeds limit (default 100MB). Critical: Content-Type header determines which limit applies. If Content-Type is NOT set to multipart/form-data or image/jpeg, file uploads are evaluated against the smaller request body size limit instead of the file upload limit.
   - 方案: 1) Verify Content-Type header is correctly set to multipart/form-data or image/jpeg for file uploads — this triggers the file upload size limit (100MB) instead of request body limit (128KB). 2) Adjust WAF policy settings: Max Request Body Size, Request Body Inspection Limit, File Upload Limit as needed. 3) These settings are only configurable in OWASP 3.2 or later — upgrade if on earlier version. 4) Key WAF body limits: Request Body Check (default true), Request Body Inspection Limit (128KB), Max Request Body Size (128KB), File Upload Limit (100MB).
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide)`

2. **When upgrading WAF policy from OWASP 3.2 to DRS 2.1 via Azure Portal, all managed ruleset customizations (rule state ove**
   - 根因: Azure Portal limitation: assigning a new managed ruleset version resets all previous customizations from the existing managed ruleset. This is a documented limitation but poorly surfaced during portal upgrade flow.
   - 方案: Use PowerShell script (updateToDrs21.ps1) to programmatically upgrade while preserving rule overrides and exclusions. Script: 1) Gets rule ID differences between OWASP 3.2 and DRS 2.1, 2) Removes references to rules that exist in OWASP 3.2 but not DRS 2.1, 3) Maps OWASP rule group names to DRS equivalents (e.g., REQUEST-942-APPLICATION-ATTACK-SQLI → SQLI), 4) Preserves all exclusions and rule overrides. Usage: ./updateToDrs21.ps1 -resourceGroupName <rg> -wafPolicyName <policy>. IMPORTANT: Test in non-prod first.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FUpgrade%20Script%20OWASP%203.2%20to%20DRS%202.1)`

3. **AppGW V2 returns 413 Request Entity Too Large. File uploads fail even after adjusting limits.**
   - 根因: Content-Type determines which limit applies. Wrong Content-Type uses body limit (128KB) instead of file upload limit (100MB).
   - 方案: Set Content-Type to multipart/form-data or image/jpeg. Adjust WAF body/file limits. Requires OWASP 3.2+.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide)`

4. **Error when increasing WAF max request body size: 'MaxRequestBodySizeInKb is out of range, it should be within 8 and 128'**
   - 根因: Application Gateway WAF policy is using OWASP CRS older than 3.2; the new higher limits (up to 2MB request body, 4GB file upload) are only available with CRS 3.2 or later (which triggers WAF engine upgrade)
   - 方案: 1. Upgrade managed rule set to OWASP 3.2 or later: az network application-gateway waf-policy managed-rule rule-set update --type OWASP --version 3.2. 2. Then increase limits via portal Policy Settings or CLI: az network application-gateway waf-policy update --set policySettings.max_request_body_size_in_kb='2000' policySettings.file_upload_limit_in_mb='3500'. Note: upgrading to CRS 3.2 is irreversible via rollback — test with a new policy first.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FWAF%20Limit%20Changes)`

5. **Application Gateway WAF returning 413 Request Entity Too Large when uploading files larger than 128 KB**
   - 根因: Request is missing Content-Type and Content-Disposition headers that identify it as a file upload. Without these headers, AppGW treats the body as raw JSON and applies the 128 KB non-file limit instead of the file upload limit (100 MB / 500 MB / 750 MB depending on SKU).
   - 方案: Ensure the file upload request includes: (1) Content-Type header indicating the file MIME type, (2) Content-Disposition header with filename and file attributes. This causes AppGW to treat the request as a file upload and apply the higher file size limit.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FTSG%3A%20Application%20Gateway%20V2%20returning%20413%20Request%20Entity%20Too%20Large%20even%20with%20custom%20rules%20applied)`

### Phase 3: 配置问题
> 来源: ado-wiki

1. **WAF blocks file uploads with rule ID 200002 (Failed to parse request body), rule 200004 (Possible Multipart Unmatched Bo**
   - 根因: Rule 200002: File name or content contains special characters (quotes) that trigger mod_security parser. Rule 200004: Uploaded file content (especially binary like .docx/zip) contains lines starting with dashes that resemble multipart boundary separators. Rule 0: Content-length is 0 or JSON content has invalid characters causing parsing failure.
   - 方案: Rule 200002: Fix Content-Type header to correct MIME type (image/jpeg, etc.) instead of application/json for file uploads. Rule 200004: Disable rule 200004 in WAF policy (now customizable). Rule 0: Validate JSON format using JSONLint. General: Ensure Content-Type accurately reflects the payload type.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide)`

### Phase 4: 版本与兼容
> 来源: ado-wiki

1. **Portal OWASP 3.2 to DRS 2.1 upgrade resets all WAF customizations.**
   - 根因: Portal resets managed ruleset customizations on version change.
   - 方案: Use PowerShell updateToDrs21.ps1 to preserve overrides and exclusions.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FUpgrade%20Script%20OWASP%203.2%20to%20DRS%202.1)`

### Phase 5: 网络与路由
> 来源: ado-wiki

1. **New-AzApplicationGateway PowerShell cmdlet fails consistently when both -Identity (managed identity) and -FirewallPolicy**
   - 根因: Known limitation in the New-AzApplicationGateway cmdlet: the -Identity parameter does not exist within the same parameter set as -FirewallPolicy and -FirewallPolicyId. This is a PowerShell SDK bug tracked by PG. ANP tracking item: https://supportability.visualstudio.com/AzureNetworking/_workitems/edit/74969
   - 方案: Two-step workaround: (1) Create the V2 AppGw using Standard_v2 SKU with the -Identity parameter (no WAF policy). (2) After creation, retrieve the AppGw, assign the WAF policy ($appgw.firewallpolicy = $wafPolicy), update the SKU to WAF_v2, and run Set-AzApplicationGateway.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20around%20Azure%20Powershell%20limitations%20when%20creating%20a%20V2%20WAF%20Application%20Gateway%20with%20a%20Key%20Vault%20managed%20identity%20and%20a%20WAF%20policy)`

### Phase 6: 已知问题与限制
> 来源: ado-wiki

1. **WAF logs show default/managed rules being processed and evaluated even though an incoming request already matched a cust**
   - 根因: By design — WAF was updated to process default rules concurrently with custom rules for efficiency. The logs may show default rules being evaluated, but this does NOT mean the request fate is determined by default rules.
   - 方案: No action required. The request Allow/Block outcome is always determined by the custom rule action when there is a custom rule match. Default rule log entries in this scenario can be safely ignored — they do not affect the final decision.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FWAF%20RulesProcessed%20Even%20with%20CustomRuleMatch)`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | WAF on Application Gateway returns 403 blocked by SQL inj... | OWASP CRS rules with urlDecodeUni transform dec... | Analyze blocked request: 1) Check WAF firewall ... | 🟢 9.5 | [MCVKB/1.11 [MCVKB]  Troubleshoot Web Application Firewal.md] |
| 2 | Customer receives 403 Forbidden when WAF is in Prevention... | Request data (args, cookies, headers) matches W... | 1) Identify the matched field from WAF logs (AG... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide) |
| 3 | Application Gateway V2 returns 413 Request Entity Too Lar... | Request body exceeds SecRequestBodyLimit (defau... | 1) Verify Content-Type header is correctly set ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide) |
| 4 | WAF blocks file uploads with rule ID 200002 (Failed to pa... | Rule 200002: File name or content contains spec... | Rule 200002: Fix Content-Type header to correct... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide) |
| 5 | When upgrading WAF policy from OWASP 3.2 to DRS 2.1 via A... | Azure Portal limitation: assigning a new manage... | Use PowerShell script (updateToDrs21.ps1) to pr... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FUpgrade%20Script%20OWASP%203.2%20to%20DRS%202.1) |
| 6 | AppGW V2 returns 413 Request Entity Too Large. File uploa... | Content-Type determines which limit applies. Wr... | Set Content-Type to multipart/form-data or imag... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide) |
| 7 | WAF blocks uploads with rule 200002/200004/0. | 200002: special chars in filename. 200004: bina... | 200002: fix Content-Type. 200004: disable rule.... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FApplication%20Gateway%20WAF%20Troubleshooting%20Guide) |
| 8 | Portal OWASP 3.2 to DRS 2.1 upgrade resets all WAF custom... | Portal resets managed ruleset customizations on... | Use PowerShell updateToDrs21.ps1 to preserve ov... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FUpgrade%20Script%20OWASP%203.2%20to%20DRS%202.1) |
| 9 | New-AzApplicationGateway PowerShell cmdlet fails consiste... | Known limitation in the New-AzApplicationGatewa... | Two-step workaround: (1) Create the V2 AppGw us... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20around%20Azure%20Powershell%20limitations%20when%20creating%20a%20V2%20WAF%20Application%20Gateway%20with%20a%20Key%20Vault%20managed%20identity%20and%20a%20WAF%20policy) |
| 10 | Error when increasing WAF max request body size: 'MaxRequ... | Application Gateway WAF policy is using OWASP C... | 1. Upgrade managed rule set to OWASP 3.2 or lat... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FWAF%20Limit%20Changes) |
| 11 | WAF Bot protection blocking an IP address that is not lis... | Microsoft can insert IPs into the bot/malicious... | 1) Use Interflow Swagger API (https://aka.ms/in... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FHowTo%3A%20View%20complete%20malicious%20or%20non%20human%20IP%20address%20list) |
| 12 | Application Gateway WAF returning 413 Request Entity Too ... | Request is missing Content-Type and Content-Dis... | Ensure the file upload request includes: (1) Co... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FTSG%3A%20Application%20Gateway%20V2%20returning%20413%20Request%20Entity%20Too%20Large%20even%20with%20custom%20rules%20applied) |
| 13 | WAF logs show default/managed rules being processed and e... | By design — WAF was updated to process default ... | No action required. The request Allow/Block out... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FWAF%20RulesProcessed%20Even%20with%20CustomRuleMatch) |
| 14 | Application Gateway WAF returns HTTP 500 error instead of... | Multiple possible causes: (1) headers already t... | These are nginx errors indicating unexpected in... | 🟢 8.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Custom%20response%20for%20Azure%20Web%20Application%20Firewall) |
