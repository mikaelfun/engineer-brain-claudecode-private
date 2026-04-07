---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/PowerShell Script to fetch Certificate details for App gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FPowerShell%20Script%20to%20fetch%20Certificate%20details%20for%20App%20gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# PowerShell Script to fetch Certificate details for App gateway

[[_TOC_]]

## Description

获取AppGW上所有SSL证书（监听器）和TrustedRoot证书（后端设置）的有效期及KeyVault引用详情。

**背景**：现有V1版本工具（PowerShell Gallery: AzAppGWCert）在V2 SKU的KeyVault证书场景下报错：`InvalidOperation: You cannot call a method on a null-valued expression`，且不显示KV证书详情。本脚本专门针对V2 SKU改进。

## 工具获取

脚本：`Get-AzAppGWCerttestv2.ps1`（内部Wiki附件）

在 CloudShell 中上传后使用。

## Usage

```bash
# 扫描订阅下所有V2 AppGW
./Get-AzAppGWCerttestv2.ps1

# 查看特定AppGW
./Get-AzAppGWCerttestv2.ps1 -RG <RG_Name> -AppGWName <AppGatewayName>
```

## 输出说明

- **VaultName**：非空 → 证书通过KeyVault挂载；空 → 证书手动上传
- **Days to Expire**：证书距到期的天数
- 最后一节为后端设置上的Auth（CA）证书详情，注意：**CA证书到期日与后端服务器上实际证书有效期无关**

## 注意

- 此脚本适用于V2 SKU；V1请使用 PowerShell Gallery 的 AzAppGWCert 模块
- 需在客户的CloudShell中运行（需要订阅访问权限）
