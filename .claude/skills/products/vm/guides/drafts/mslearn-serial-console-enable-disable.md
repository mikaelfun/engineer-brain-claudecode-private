---
title: Azure Serial Console 启用与禁用操作指南
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/serial-console-enable-disable
product: vm
date: 2026-04-18
21vApplicable: true
---

# Azure Serial Console 启用与禁用

## 概述

Serial Console 默认在 Global Azure 所有订阅启用。可在 VM 级别和 Subscription 级别分别控制。

## VM 级别禁用

- 通过禁用 Boot Diagnostics 设置来禁用 Serial Console
- 适用于 VM 和 VMSS（VMSS 需升级实例到最新模型）

## Subscription 级别启用/禁用

### Azure CLI

```bash
# 获取 subscription ID
subscriptionId=$(az account show --output=json | jq -r .id)

# 禁用
az resource invoke-action --action disableConsole --ids "/subscriptions/$subscriptionId/providers/Microsoft.SerialConsole/consoleServices/default" --api-version="2023-01-01"

# 启用
az resource invoke-action --action enableConsole --ids "/subscriptions/$subscriptionId/providers/Microsoft.SerialConsole/consoleServices/default" --api-version="2023-01-01"

# 查询状态
az resource show --ids "/subscriptions/$subscriptionId/providers/Microsoft.SerialConsole/consoleServices/default" --output=json --api-version="2023-01-01" | jq .properties
```

### PowerShell

```powershell
$subscription = (Get-AzContext).Subscription.Id

# 禁用
Invoke-AzResourceAction -Action disableConsole -ResourceId /subscriptions/$subscription/providers/Microsoft.SerialConsole/consoleServices/default -ApiVersion 2023-01-01

# 启用
Invoke-AzResourceAction -Action enableConsole -ResourceId /subscriptions/$subscription/providers/Microsoft.SerialConsole/consoleServices/default -ApiVersion 2023-01-01
```

## RBAC 最小权限

创建自定义角色，需以下权限：

| Action | 用途 |
|--------|------|
| Microsoft.Compute/virtualMachines/start/action | 启动 VM |
| Microsoft.Compute/virtualMachines/read | 读取 VM 属性 |
| Microsoft.Compute/virtualMachines/write | 创建/更新 VM |
| Microsoft.Resources/subscriptions/resourceGroups/read | 读取资源组 |
| Microsoft.Storage/storageAccounts/listKeys/action | 列出存储账户密钥 |
| Microsoft.Storage/storageAccounts/read | 读取存储账户 |
| Microsoft.SerialConsole/serialPorts/connect/action | 连接 Serial Port |

## 注意事项

- 切换 Cloud 环境前先确认正确的 Cloud（`az cloud list` + `az cloud set`）
- assignableScopes 可限定到 subscription 或 resource group 级别
