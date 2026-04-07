# ARM/Bicep What-If 部署预览操作指南

> Source: [ARM template what-if](https://learn.microsoft.com/azure/azure-resource-manager/templates/deploy-what-if) | [Bicep what-if](https://learn.microsoft.com/azure/azure-resource-manager/bicep/deploy-what-if)
> Quality: guide-draft | Date: 2026-04-05

## 概述

What-if 操作允许在部署 ARM 模板或 Bicep 文件前预览资源变更，不实际修改任何资源。支持 resource group / subscription / management group / tenant 四个作用域。

## 权限要求

- 需要部署资源的 write 权限 + `Microsoft.Resources/deployments/*` 权限
- What-if 与实际部署权限要求相同

## 限制

- 最多展开 500 个 nested templates
- 最多 800 个 resource groups（跨 RG 部署）
- nested template 展开超时 5 分钟
- 超出限制的资源 change type 标为 **Ignore**
- `reference()` / `listKeys()` 等函数无法在 what-if 中解析，相关属性会报告为变更（noise）
- 非确定性函数（`utcNow()`、`newGuid()`）显示为未评估表达式
- `templateLink` 嵌套部署（含 template spec 引用）不支持展开

## 常用命令

### Azure CLI

```bash
# Resource Group 级别
az deployment group what-if --resource-group {rg} --template-file {file}

# Subscription 级别
az deployment sub what-if --location {location} --template-file {file}

# Management Group 级别
az deployment mg what-if --management-group-id {mgId} --location {location} --template-file {file}

# Tenant 级别
az deployment tenant what-if --location {location} --template-file {file}

# 部署前确认（what-if + 提示继续）
az deployment group create --confirm-with-what-if --resource-group {rg} --template-file {file}

# JSON 输出（可编程处理）
az deployment group what-if --resource-group {rg} --template-file {file} --no-pretty-print
```

### Azure PowerShell

```powershell
# Resource Group 级别
New-AzResourceGroupDeployment -Whatif -ResourceGroupName {rg} -TemplateFile {file}

# Subscription 级别
New-AzSubscriptionDeployment -Whatif -Location {location} -TemplateFile {file}

# 部署前确认
New-AzResourceGroupDeployment -Confirm -ResourceGroupName {rg} -TemplateFile {file}

# 编程式评估
$results = Get-AzResourceGroupDeploymentWhatIfResult -ResourceGroupName {rg} -TemplateFile {file}
foreach ($change in $results.Changes) { $change.Delta }
```

## ValidationLevel（CLI 2.76.0+ / PS 13.4.0+）

| Level | 说明 |
|-------|------|
| **Provider**（默认） | 完整验证：语法 + 资源定义 + 依赖 + 权限检查 |
| **ProviderNoRbac** | 完整验证但只检查 read 权限 |
| **Template** | 仅静态验证（语法/结构），跳过 preflight 和权限检查 |

## 变更类型

| 类型 | 含义 |
|------|------|
| **Create** (+) | 资源不存在，将创建 |
| **Delete** (-) | 仅 Complete 模式：资源不在模板中，将删除 |
| **Modify** (~) | 资源存在且属性将变更 |
| **NoChange** | 资源存在且属性不变 |
| **NoEffect** | 只读属性，服务忽略 |
| **Deploy** (!) | 无法确定属性是否变更（ResourceIdOnly 模式） |
| **Ignore** | 超出展开限制，未分析 |

## 排查场景

- **部署前验证**：使用 what-if 检查 Complete 模式是否会意外删除资源
- **模板变更审查**：CI/CD 中集成 what-if 对比预期变更
- **Noise 过滤**：what-if 可能报告 default 属性为 Delete（实际不会变），需理解此行为
- **Short-circuiting（Bicep）**：模块的 resource ID 或 API version 依赖外部状态时，what-if 无法分析该模块下所有资源
