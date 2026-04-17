# Clear Office App & WAM Cache

> Source: OneNote - M365 Identity IDO / Common operation_TSG

## 场景

Office 应用登录异常、凭据过期、WAM 认证反复弹窗时，需要彻底清理 WAM 缓存和 Office 凭据。

## 步骤

### 1. 清空 Office 凭据（使用微软官方脚本）

按照 [Reset activation state for Microsoft 365 Apps](https://learn.microsoft.com/en-us/office/troubleshoot/activation/reset-office-365-proplus-activation-state#sectiona) 中的 3 个脚本清空所有凭据。

### 2. 清理 WAM State

关闭所有 Office 应用后执行：

```powershell
# 管理员权限 PowerShell - 停止 TokenBroker
Set-Service TokenBroker -StartupType Disabled
Stop-Service TokenBroker -Force -PassThru
```

备份并删除以下文件夹/文件：
- `%localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker\Accounts`
- `%localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Settings\settings.dat`
- `%LocalAppData%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\LocalState`
- `%LocalAppData%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\AC\TokenBroker`
- `%LocalAppData%\Microsoft\TokenBroker\Cache`

重命名注册表：
```
HKCU\Software\Microsoft\IdentityCRL\TokenBroker\DefaultAccount
→ DefaultAccount_backup
```

重启 TokenBroker：
```powershell
Set-Service TokenBroker -StartupType Manual
Start-Service TokenBroker -PassThru
```

### 3. 重新安装 AAD WAM Plugin

```powershell
if (-not (Get-AppxPackage Microsoft.AAD.BrokerPlugin)) {
    Add-AppxPackage -Register "$env:windir\SystemApps\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Appxmanifest.xml" -DisableDevelopmentMode -ForceApplicationShutdown
}
Get-AppxPackage Microsoft.AAD.BrokerPlugin
```

## 参考

- [Troubleshooting WAM related SSO issues](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues)
