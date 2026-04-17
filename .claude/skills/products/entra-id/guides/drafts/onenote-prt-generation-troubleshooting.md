# PRT Generation Troubleshooting

## 概述
Primary Refresh Token (PRT) 是 Azure AD 设备 SSO 的核心。排查 PRT 问题需要结合客户端日志和服务端 Kusto 日志。

## PRT 正常流程
OOB token (device cert) → Session Key → PRT Token（共 3 个令牌请求）

## 客户端日志收集

### Auth Log
```
# 参考: https://learn.microsoft.com/en-us/azure/active-directory/devices/troubleshoot-hybrid-join-windows-current#step-5-collect-logs-and-contact-microsoft-support
```

### Process Monitor
1. 以本地管理员登录目标设备
2. 启动 procmon，添加过滤: `ProcessName = Lsass.exe`
3. 切换到域用户登录复现 PRT 问题
4. 切回本地用户停止日志

## 服务端 Kusto 查询

### 列出 Windows Sign In 流程
```kusto
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

### 查看 PRT 诊断详情
```kusto
// 使用 DiagnosticTracesIfx 表
// 用上面查询获得的 CorrelationId 过滤
DiagnosticTracesIfx
| where env_time >= starttime and env_time <= endtime
| where CorrelationId in~ (CorrelationIds)
| project env_time, CorrelationId, Message, Result, Exception
| order by env_time
```

成功的 PRT 生成会包含:
- Device cert verification 通过
- New Cookie 和 time point
- PRT token 生成成功的消息

## 实用工具
- **aadtokens 模块**: https://github.com/simonxin/aadtokens
  - `Clear-CloudApCache`: 清除 Cloud AP 缓存（需 SYSTEM 上下文: `psexec -i -s powershell.exe`）
  - `get-aadjdeviceinfo`: 显示设备证书和传输证书信息

## ⚠️ 内部调试方法（不要分享给客户）
- `get-prttoken`: 从本地缓存获取 PRT token
- `Get-AccessTokenWithPRT`: 使用 PRT 请求资源访问令牌

## 21v 适用性
Kusto 集群使用 `estscnn2.chinanorth2.kusto.chinacloudapi.cn`。
