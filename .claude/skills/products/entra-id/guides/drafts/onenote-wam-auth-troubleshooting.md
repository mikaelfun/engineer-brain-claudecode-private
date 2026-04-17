# WAM Authentication Troubleshooting

## 概述
Web Account Manager (WAM) 是 Windows 上 Office 客户端和 MSAL 应用的 SSO 中间层。认证流程：
1. 使用 WAM 缓存的 Refresh Token 获取 Access Token
2. 若 RT 不可用，通过本地 PRT 请求新 Access Token + Refresh Token
3. 若 PRT 不可用，发起交互式登录

## 客户端日志收集
1. 下载 auth.zip: https://aka.ms/authscripts
2. 解压到如 `c:\temp`
3. 管理员 PowerShell: `.\start-auth.ps1 -verbose -accepteula`
4. 复现问题（如登录 Office/Teams）
5. `.\stop-auth.ps1`
6. 压缩发送 `Authlogs` 文件夹

### WAM ETL 日志分析示例
```
[Microsoft-Windows-AAD] Code: 0x4AA50077 No data for the primary user.
Reason: -1073741729 (0xc000005f) 指定的登录会话不存在。可能已被终止。
→ PRT 无效，回退到交互式登录

Code: 0xCAA10001 Need user interaction to continue.
→ SSO 失败，需要用户交互
```

## 服务端 Kusto 查询
```kusto
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

**识别 WAM 请求**: redirect_uri 包含 `ms-appx-web://microsoft.aad.brokerplugin/` 表示通过 WAM 发起。

## 常用排查操作

### 清除 WAM 缓存
```powershell
# 1. 停止 TokenBroker 服务
Set-Service TokenBroker -StartupType Disabled
Stop-Service TokenBroker -Force -PassThru

# 2. 删除账户文件
# %localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts

# 3. 备份并删除 settings.dat
# %localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Settings\settings.dat

# 4. 重命名注册表
# HKCU\Software\Microsoft\IdentityCRL\TokenBroker\DefaultAccount
```

### 临时禁用 WAM（Office 客户端）
```
[HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\Common\Identity]
DWORD: DisableAADWAM = 1
DWORD: DisableADALatopWAMOverride = 1
```

### 重新安装 WAM 包
```powershell
if (-not (Get-AppxPackage Microsoft.AAD.BrokerPlugin)) {
    Add-AppxPackage -Register "$env:windir\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Appxmanifest.xml" -DisableDevelopmentMode -ForceApplicationShutdown
}
Get-AppxPackage Microsoft.AAD.BrokerPlugin
```

### 恢复 WAM
```powershell
Set-Service TokenBroker -StartupType Manual
Start-Service TokenBroker -PassThru
```

## 支持范围
| 组件 | 进程 | 支持团队 | PG |
|------|------|---------|-----|
| AAD WAM plugin | Microsoft.AAD.BrokerPlugin.exe | AAD/IDO | AAD (WAM) |
| WAM core | Svchost.exe (WAM service) | Windows | Windows |
| Cloud AP plugin | Lsass.exe | AAD/Windows | AAD |
| Office client App | Outlook.exe, teams.exe 等 | Office Client | O365 |

## 参考
- https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues
- Office activation reset: https://learn.microsoft.com/en-us/office/troubleshoot/activation/reset-office-365-proplus-activation-state
