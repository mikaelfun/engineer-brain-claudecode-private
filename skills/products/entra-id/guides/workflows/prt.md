# Entra ID Primary Refresh Token (PRT) — 排查工作流

**来源草稿**: ado-wiki-a-validating-prt-dsregcmd-command.md, ado-wiki-prt-troubleshooting-linux.md, onenote-prt-generation-troubleshooting.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: ado-wiki-a-validating-prt-dsregcmd-command
> 来源: ado-wiki-a-validating-prt-dsregcmd-command.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Azure AD joined or Hybrid Azure AD joined**: PRT issued during Windows logon when user signs in with org credentials. Supports password and Windows Hello for Business. Azure AD CloudAP plugin is 
- 2. **Azure AD registered device**: PRT issued when user adds a secondary work account via:

---

## Scenario 2: PRT Troubleshooting (Linux)
> 来源: ado-wiki-prt-troubleshooting-linux.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Application sends GET request to Azure AD OpenID configuration endpoint
- 2. Azure AD returns OpenID configuration with authorization endpoints
- 3. Application builds sign-in request & collects user credentials
- 4. User enters username & password
- 5. Application forwards GET request to Azure AD for realm information
- 6. Azure AD returns realm info - determines if environment is managed (non-federated)
- 7. Application creates authentication buffer
- 8. User enters credentials/MFA
- 9. Application checks for MDM terms of use
- 10. Application sends device registration discovery request to ADRS

---

## Scenario 3: PRT Generation Troubleshooting
> 来源: onenote-prt-generation-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤
- 1. 以本地管理员登录目标设备
- 2. 启动 procmon，添加过滤: `ProcessName = Lsass.exe`
- 3. 切换到域用户登录复现 PRT 问题
- 4. 切回本地用户停止日志

### 关键 KQL 查询
```kql
// Cluster: estscnn2.chinanorth2.kusto.chinacloudapi.cn
// Database: ESTS
let starttime = datetime(2023-07-26 05:33);
let endtime = datetime(2023-07-26 05:38);
let agent = 'Windows-AzureAD-Authentication-Provider/1.0';
let appid = '38aa3b87-a06d-4817-b275-7a316988d93b';  // Windows Sign In
let deviceid = 'xxx';
let tenantid = "xxx";
let userobjectId = "xxx";
PerRequestTableIfx
| where env_time >= starttime and env_time <= endtime
| where TenantId == tenantid
| where UserAgent == agent
| where ApplicationId == appid
| where DeviceId == deviceid
| where UserPrincipalObjectID == userobjectId
| project env_time, CorrelationId, RequestId, Result, MaskedResponse, HttpStatusCode,
          ApplicationId, ApplicationDisplayName, VerificationCert, Call, OriginalHost,
          Tenant, DeviceId, DomainName, UserPrincipalObjectID
```
`[来源: onenote-prt-generation-troubleshooting.md]`

```kql
// 使用 DiagnosticTracesIfx 表
// 用上面查询获得的 CorrelationId 过滤
DiagnosticTracesIfx
| where env_time >= starttime and env_time <= endtime
| where CorrelationId in~ (CorrelationIds)
| project env_time, CorrelationId, Message, Result, Exception
| order by env_time
```
`[来源: onenote-prt-generation-troubleshooting.md]`

---
