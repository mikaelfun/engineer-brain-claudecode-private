# Entra ID WAM/OneAuth Authentication — 排查工作流

**来源草稿**: ado-wiki-c-WebView2-Integration-Entra-ID-WAM.md, ado-wiki-e-wam-log-collection-analysis.md, ado-wiki-e-wam-profile-pictures.md, ado-wiki-e-wam-scoping-troubleshooting.md, ado-wiki-g-oneauth-msal-overview.md, ado-wiki-troubleshooting-wam-sso-issues.md, onenote-clear-oneauth-cache.md, onenote-clear-wam-cache.md, onenote-wam-auth-troubleshooting.md, onenote-wam-sso-outlook-trace.md... (+2 more)
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: WebView2 Integration in Entra ID WAM
> 来源: ado-wiki-c-WebView2-Integration-Entra-ID-WAM.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. GPMC.msc → Edit GPO → Computer Configuration > Preferences > Windows Settings > Registry
- 2. New Registry Item: Hive=HKLM, Key Path=`SOFTWARE\Policies\Microsoft\Windows\AAD`, Value=`WebView2Integration`, Type=`REG_DWORD`, Data=`1`
- 3. Run `gpupdate /force` on client
- 1. Verify device is patched to 26100.7462+ (24H2) or 26200.7462+ (25H2)
- 2. Verify registry key is set: `HKLM\Software\Policies\Microsoft\Windows\AAD\WebView2Integration = 1`
- 3. **Reboot** device
- 1. **Auth Script Logs**: https://aka.ms/wamlogs — captures WebView2 calls in `WebAuth.etl`
- 2. Format ETL: install Insight Client from https://insightweb/
- 3. Training: https://platform.qa.com/resource/wam-log-analysis-by-tak-ee-1854/
- 1. Add registry: `HKCU\Software\Policies\Microsoft\Edge\WebView2\AdditionalBrowserArguments` → `Microsoft.AAD.BrokerPlugin.exe` (String) = `--edge-webview-creation-timeout-seconds=-1`

---

## Scenario 2: WAM log collection for M365 Office Authentication issues
> 来源: ado-wiki-e-wam-log-collection-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Download** the [Microsoft Office Authentication/Identity Diagnostic](https://aka.ms/msoaid) zip package. [Learn more](https://learn.microsoft.com/microsoft-365/troubleshoot/diagnostic-logs/use-ms
- 2. **Extract** the contents of the .zip package
- 3. Open folder MSOAID, **run MSOAID-WIN.exe as Administrator.** Best to capture in user context, so may need to temporarily elevate the user account.
- 4. Keep the default options selected and **click next twice**
- 5. **Click yes** to accept the Fiddler certificate request pop up (wait for command prompt windows to finish)
- 6. **Reproduce the issue**
- 7. **Click finish** to stop log collection. When prompted, you may delete the Fiddler certificate.
- 8. Navigate to the file path displayed. Upload the zip to your support case. **File location**: %LOCALAPPDATA%\temp\MSOAIDResults_<machinename>_<date>.zip
- 1. Open a normal command prompt as the affected user
- 2. Change directory to the unzipped MSOAIDResults folder

---

## Scenario 3: WAM (Token Broker) Scoping & Troubleshooting
> 来源: ado-wiki-e-wam-scoping-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting / Isolating Steps**
   - 1. **Identify scope**: Is the issue only with a specific application or all applications failing to retrieve a token?
   - Like Kerberos: are all apps failing to get tickets, or just one specific app?
   - 2. **Test with Feedback Hub App**: Use Feedback Hub to test WAM token acquisition as an isolated test.

---

## Scenario 4: OneAuth-MSAL Overview
> 来源: ado-wiki-g-oneauth-msal-overview.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **ReadAccountById** (synchronous) - Retrieves an account object for a given account id from OneAuth store. Blocking local I/O operation.
- 2. **SignInSilently** (asynchronous) - Retrieves a new account object inferred from the underlying OS infrastructure without any user interaction, if such an inference is possible.
- 3. **SignInInteractively** (asynchronous) - Retrieves a new account by prompting the user for necessary sign-in information.
- 4. **ReadAllAccounts** (synchronous) - Returns all accounts from OneAuth-MSAL local persistent store. Multiple blocking read operations.
- 5. **DiscoverAccounts** (asynchronous) - Discovers new accounts from various sources like Brokers and persists new accounts in OneAuth-MSAL local persistent store. Performance penalty is significant.
- 1. The precise error code and tag OneAuth-MSAL returned
- 2. Correlation id and timestamp of the failed request
- 3. OneAuth-MSAL verbose logs
- 4. Platform broker logs when applicable
- 5. Fiddler traces

---

## Scenario 5: Compliance note
> 来源: ado-wiki-troubleshooting-wam-sso-issues.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Appx related issues**
   - When the AAD WAM plugin (i.e.  ```C:\Windows\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy```) didn't installed properly, it causes the authentication flow to fail with the AAD provider not foun
   - Microsoft.Windows.Security.TokenBroker

### 相关错误码: AADSTS9002341, AADSTS70002, AADSTS135011, AADSTS50155, AADSTS1350101

---

## Scenario 6: Clear Office App & WAM Cache
> 来源: onenote-clear-wam-cache.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 7: WAM Authentication Troubleshooting
> 来源: onenote-wam-auth-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤
- 1. 使用 WAM 缓存的 Refresh Token 获取 Access Token
- 2. 若 RT 不可用，通过本地 PRT 请求新 Access Token + Refresh Token
- 3. 若 PRT 不可用，发起交互式登录
- 1. 下载 auth.zip: https://aka.ms/authscripts
- 2. 解压到如 `c:\temp`
- 3. 管理员 PowerShell: `.\start-auth.ps1 -verbose -accepteula`
- 4. 复现问题（如登录 Office/Teams）
- 5. `.\stop-auth.ps1`
- 6. 压缩发送 `Authlogs` 文件夹

### 关键 KQL 查询
```kql
// Cluster: estscnn2.chinanorth2.kusto.chinacloudapi.cn
// Database: ESTS
let appid = 'xxx';  // 如 Microsoft Office
let tenantid = "xxx";
let userobjectId = "xxx";
PerRequestTableIfx
| where env_time between (ago(8h)..now())
| where Tenant == tenantid
| where ApplicationId == appid
| where UserPrincipalObjectID == userobjectId
| where ApplicationDisplayName in ('Microsoft Office')
| where ClientInfo contains 'Windows'
| project env_time, ClientIp, ApplicationDisplayName, HttpStatusCode, MaskedResponse,
          ErrorCode, SubErrorCode, CorrelationId, RequestId, Result, ApplicationId,
          ResourceId, ResourceDisplayName, Client, ClientInfo, OriginalHost,
          Tenant, DeviceId, UserPrincipalObjectID
| order by env_time asc
```
`[来源: onenote-wam-auth-troubleshooting.md]`

---

## Scenario 8: WAM SSO Working Trace Sample - Outlook Client (Mooncake)
> 来源: onenote-wam-sso-outlook-trace.md | 适用: Mooncake ✅

### 排查步骤
- 1. **GetTokenSilently** - Token broker operation starts (Event 1099, Code 0x4AA5001A)
- 2. **Token Request** - Outlook requests token for `https://partner.outlook.cn` via WAM
- 3. **Load from Cache** - WAM loads client context from cache using webaccount
- 4. **Read RT** - Reads Refresh Token from local BrokerPlugin cache
- 5. **Send Token Request** - WAM sends request to `https://login.partner.microsoftonline.cn/common/oauth2/token`
- 6. **PRT Renewal** - Renews token via Primary Refresh Token (Code 0x4AA90055)
- 7. **Write to Cache** - Updated RT written back to local cache
- 8. **Success** - GetTokenSilently completes successfully (Code 0x4AA5001B)

---

## Scenario 9: WAM Tool by Global Auth Team
> 来源: onenote-wam-tool-global-auth-team.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 10: WAM Tool by Global Auth Team
> 来源: onenote-wam-tool-global-auth.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. 收集 WAM 日志 (Event Viewer → Applications and Services Logs → Microsoft → Windows → AAD)
- 2. 使用 WAMToolScript 导出日志
- 3. 上传到 WAMTroubleshooter Web App 进行自动分析
- 4. 分析结果包含：token 请求/响应、错误码解析、建议操作

---
