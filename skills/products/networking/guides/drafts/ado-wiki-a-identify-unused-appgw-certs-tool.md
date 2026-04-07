---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Identify Unused Application Gateway Certificates - TOOL!"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FIdentify%20Unused%20Application%20Gateway%20Certificates%20-%20TOOL%21"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Identify Unused Application Gateway Certificates - TOOL!

[[_TOC_]]

## Description

PowerShell工具，用于识别AppGW配置文件（来自Jarvis Actions）中未使用的证书，支持批量删除。

**背景**：解除证书与监听器/后端设置的关联不会自动从AppGW配置中删除证书。对V1 AppGW尤其危险：
- Authentication Certificates总大小有 **128KB硬限制**（V1），超限导致AppGW进入Failed状态
- V1/V2均有每类 **最多100证书** 的数量限制
- 持续添加新证书（而非替换）会累积大量未使用证书

## 工具获取

从Jarvis Actions的"Get Application Gateway"操作获取AppGW raw config JSON → 保存为 config.json

工具脚本：`Get-AppGWUnusedCerts.ps1`（内部Wiki附件）

外部版本（非官方）：https://github.com/dus-d/azure-appgw-cert-utility

## Usage

```
.\Get-AppGWUnusedCerts.ps1 (-Config <PSObject> | -File <String>) [-GetScript] [-Out <String>]
```

### Options

| 参数 | 说明 |
|------|------|
| `-Config` | 传入PS对象（JSON已解析） |
| `-File` | 指定JSON文件路径 |
| `-GetScript` | 生成删除脚本并输出到控制台 |
| `-Out` | 生成删除脚本并保存到文件 |

## Examples

**查看未使用证书（仅显示）**
```powershell
.\Get-AppGWUnusedCerts.ps1 -File "config.json"
```

**生成可提供给客户的删除脚本**
```powershell
$config = Get-Content "config.json" | ConvertFrom-Json
.\Get-AppGWUnusedCerts.ps1 -Config $config -Out "removecerts.ps1"
notepad removecerts.ps1   # 验证后提供给客户在CloudShell执行
```

## 附加脚本

### 检查证书到期时间（从raw config）
```
.\checkCertExpiration.ps1 -File "config.json"
```
输出listener和auth证书的到期日期。

### 检查V1 AppGW剩余Auth Cert空间
```powershell
$ApplicationGateway = Get-AzApplicationGateway -Name <AppGWName> -ResourceGroupName <RG>
.\Get-RemainingAuthCertSpace.ps1 $ApplicationGateway
```

## 限制

- 仅兼容来自Jarvis Actions的raw configuration JSON（非 resources.azure.com 或 Azure Resource Explorer 格式）
- **不要对外分享此工具**（依赖内部schema）；仅将 -Out 生成的删除脚本提供给客户
